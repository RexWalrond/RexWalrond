// Supabase Edge Function: receives a health export POST from the phone and
// upserts it into daily_log.
//
// Why this exists rather than posting straight to the table: the site's
// publishable key is visible in the page source, so anything that key can
// write, a stranger can write. This function holds a separate secret and
// writes with the service role, which never leaves Supabase.
//
// It is deliberately tolerant about the payload. Health Auto Export's exact
// metric names and units vary by version and by which metrics you enable, so
// anything it doesn't recognise is reported back in the response under
// `unrecognised` instead of being silently dropped. Send one real export,
// read that list, and the mapping below can be tightened to match.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const INGEST_SECRET = Deno.env.get("INGEST_SECRET")!;

// HAE metric name -> daily_log column. Lowercased before lookup.
const COLUMN_FOR: Record<string, string> = {
  dietary_energy: "kcal",
  active_energy: "",            // recognised but not stored
  protein: "protein_g",
  carbohydrates: "carbs_g",
  total_fat: "fat_g",
  fat_total: "fat_g",
  dietary_sugar: "",
  fiber: "",
};

type Row = Record<string, number | string>;

/** "2026-08-11 00:00:00 +0000" and ISO strings both reduce to YYYY-MM-DD. */
function dayOf(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const m = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

function num(v: unknown): number | null {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return typeof n === "number" && isFinite(n) ? n : null;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return json({ error: "POST only" }, 405);
  }
  // constant-ish comparison is fine here; this is a shared secret, not a password
  const provided = req.headers.get("x-ingest-secret") ?? "";
  if (!INGEST_SECRET || provided !== INGEST_SECRET) {
    return json({ error: "unauthorized" }, 401);
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "body was not valid JSON" }, 400);
  }

  const metrics = payload?.data?.metrics ?? payload?.metrics ?? [];
  if (!Array.isArray(metrics)) {
    return json({ error: "expected data.metrics to be an array" }, 400);
  }

  const days: Record<string, Row> = {};
  const unrecognised = new Set<string>();
  const seen = new Set<string>();

  for (const metric of metrics) {
    const rawName = String(metric?.name ?? "").toLowerCase();
    const units = String(metric?.units ?? "").toLowerCase();
    const points = Array.isArray(metric?.data) ? metric.data : [];
    seen.add(rawName);

    // --- sleep -------------------------------------------------------------
    if (rawName.includes("sleep")) {
      for (const p of points) {
        const day = dayOf(p?.date ?? p?.sleepEnd ?? p?.sleepStart);
        if (!day) continue;
        // HAE reports sleep phases in hours; prefer an explicit asleep total,
        // otherwise sum the stages.
        const asleep =
          num(p?.asleep) ??
          num(p?.totalSleep) ??
          ((num(p?.deep) ?? 0) + (num(p?.core) ?? 0) + (num(p?.rem) ?? 0)) || null;
        if (asleep == null) continue;
        days[day] ??= { day };
        days[day].sleep_hours = Math.round(asleep * 10) / 10;
      }
      continue;
    }

    // --- quantities --------------------------------------------------------
    const column = COLUMN_FOR[rawName];
    if (column === undefined) {
      unrecognised.add(rawName);
      continue;
    }
    if (column === "") continue; // known but intentionally unstored

    for (const p of points) {
      const day = dayOf(p?.date);
      const qty = num(p?.qty ?? p?.value);
      if (!day || qty == null) continue;
      days[day] ??= { day };
      // dietary energy sometimes arrives in kilojoules
      const value = column === "kcal" && units.includes("kj") ? qty / 4.184 : qty;
      days[day][column] = Math.round(value);
    }
  }

  const rows = Object.values(days);
  if (!rows.length) {
    return json({
      ok: true,
      written: 0,
      note: "nothing recognised in this payload",
      metricsSeen: [...seen],
      unrecognised: [...unrecognised],
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
  const { error } = await supabase
    .from("daily_log")
    .upsert(rows.map((r) => ({ ...r, updated_at: new Date().toISOString() })), {
      onConflict: "day",
    });

  if (error) return json({ error: error.message }, 500);

  return json({
    ok: true,
    written: rows.length,
    days: rows.map((r) => r.day).sort(),
    metricsSeen: [...seen],
    unrecognised: [...unrecognised],
  });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "content-type": "application/json" },
  });
}
