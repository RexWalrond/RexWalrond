-- The Log — daily nutrition + sleep
--
-- Run once in the Supabase SQL editor (SQL Editor -> New query -> Run).
-- Same project as the music ranking; no new account or cost.
--
-- Shape: one row per calendar day. Whatever writes into it should UPSERT on
-- `day`, so a day can be re-sent as more of it gets logged without creating
-- duplicates.

create table if not exists daily_log (
  day date primary key,
  kcal          integer,
  protein_g     integer,
  carbs_g       integer,
  fat_g         integer,
  sleep_score   integer,
  sleep_hours   numeric(3,1),
  updated_at    timestamptz not null default now()
);

alter table daily_log enable row level security;

-- Anyone can read it; that's the point of putting it on the site.
drop policy if exists "Public can read daily log" on daily_log;
create policy "Public can read daily log"
  on daily_log for select
  using (true);

-- Only the owner may write from a signed-in browser session. The phone-side
-- exporter does NOT use this path -- see the note at the bottom.
drop policy if exists "Owner can write daily log" on daily_log;
create policy "Owner can write daily log"
  on daily_log for all
  using (auth.jwt() ->> 'email' = 'rexwalrond@gmail.com')
  with check (auth.jwt() ->> 'email' = 'rexwalrond@gmail.com');

create index if not exists daily_log_day_idx on daily_log (day desc);


-- ---------------------------------------------------------------------------
-- Ingestion note (read before pointing an exporter at this)
-- ---------------------------------------------------------------------------
-- The publishable/anon key is embedded in the website, so it is public. Do
-- NOT create a policy that lets that key INSERT here -- anyone reading the
-- page source could then write fake days into the log.
--
-- The safe pattern is a Supabase Edge Function that holds a shared secret and
-- writes with the service role. The phone-side exporter sends its POST to the
-- function with that secret in a header; the function checks it and upserts.
-- The service_role key never leaves Supabase, and never touches the website.
--
-- That function is not written yet -- it depends on which exporter gets
-- chosen and what JSON shape it sends, so it is worth building against a real
-- payload rather than a guessed one.
