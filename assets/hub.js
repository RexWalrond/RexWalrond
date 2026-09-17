/* The hub, wired to the same data the sub-pages use.
 *
 * Two jobs:
 *
 *  1. The signature elevation line stops being decoration. It plots the high
 *     point of every backcountry trip in chronological order, straight out of
 *     places.js — a real series that still reads as a ridgeline, which is the
 *     whole conceit of the motif. If the trips change, so does the drawing.
 *
 *  2. Each link row carries a live figure from its own page's data, so the hub
 *     reports on the site instead of just pointing at it. Nothing here is
 *     hardcoded; a row with no real numbers behind it gets a status tag rather
 *     than an invented one.
 */
(function () {
  "use strict";

  var REDUCED = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function n(v) { return v.toLocaleString("en-US"); }
  function set(id, html) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  /* ------------------------- the elevation profile ------------------------- */

  function trips() {
    if (!window.PLACES) return [];
    return window.PLACES
      .filter(function (p) {
        return p.kind === "backcountry" && p.status === "done" && p.year && p.stats;
      })
      .map(function (p) {
        // the last stat on a backcountry card is its high point or summit
        var last = p.stats[p.stats.length - 1];
        return {
          year: p.year,
          name: p.name,
          summited: !!p.summited,
          feet: parseInt(String(last[0]).replace(/[^0-9]/g, ""), 10)
        };
      })
      .filter(function (t) { return t.feet > 0; })
      .sort(function (a, b) { return a.year - b.year; });
  }

  function drawElevation() {
    var host = document.getElementById("elevPlot");
    var data = trips();
    if (!host || data.length < 2) return;

    var W = 800, H = 210;
    var padL = 26, padR = 26, padT = 30, padB = 28;

    var feet = data.map(function (d) { return d.feet; });
    var lo = Math.min.apply(null, feet);
    var hi = Math.max.apply(null, feet);
    // Just enough headroom to clear the labels. Too much and a 7,470-to-14,411
    // spread flattens into a straight line, which is the opposite of the point.
    var top = hi + (hi - lo) * 0.16;
    var bot = lo - (hi - lo) * 0.14;

    // Spaced by year, not by index, so the season he didn't go shows as a gap
    // instead of being quietly closed up.
    var y0 = data[0].year, y1 = data[data.length - 1].year;
    var span = Math.max(1, y1 - y0);
    var x = function (yr) { return padL + (W - padL - padR) * ((yr - y0) / span); };
    var y = function (f) { return padT + (H - padT - padB) * (1 - (f - bot) / (top - bot)); };

    var pts = data.map(function (d) { return [x(d.year), y(d.feet)]; });
    var line = pts.map(function (p, i) {
      return (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1);
    }).join("");
    var fill = line + "L" + pts[pts.length - 1][0].toFixed(1) + "," + (H - padB) +
               "L" + pts[0][0].toFixed(1) + "," + (H - padB) + "Z";

    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' +
      data.map(function (d) { return d.year + ": " + n(d.feet) + " feet at " + d.name; }).join("; ") +
      '"><path class="elev-fill" d="' + fill + '"/>' +
      '<line class="elev-base" x1="' + padL + '" y1="' + (H - padB) +
        '" x2="' + (W - padR) + '" y2="' + (H - padB) + '"/>' +
      '<path class="elev-line" d="' + line + '"/>';

    data.forEach(function (d, i) {
      var px = pts[i][0], py = pts[i][1];
      svg += '<g class="elev-pt' + (d.summited ? " is-summit" : "") + '">' +
               '<line class="elev-drop" x1="' + px.toFixed(1) + '" y1="' + py.toFixed(1) +
                 '" x2="' + px.toFixed(1) + '" y2="' + (H - padB) + '"/>' +
               '<circle class="elev-dot" cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="3.2"/>' +
               '<text class="elev-ft" x="' + px.toFixed(1) + '" y="' + (py - 12).toFixed(1) + '">' +
                 n(d.feet) + '</text>' +
               '<text class="elev-yr" x="' + px.toFixed(1) + '" y="' + (H - 8) + '">' +
                 d.year + '</text>' +
             '</g>';
    });

    host.innerHTML = svg + '</svg>';

    if (!REDUCED) {
      // draw the ridge in, once, when it first comes into view
      var path = host.querySelector(".elev-line");
      var len = path.getTotalLength ? path.getTotalLength() : 0;
      if (len) {
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len;
        host.classList.add("is-armed");
        var run = function () {
          host.classList.add("is-drawn");
          path.style.strokeDashoffset = "0";
        };
        if ("IntersectionObserver" in window) {
          var io = new IntersectionObserver(function (es) {
            es.forEach(function (e) { if (e.isIntersecting) { run(); io.disconnect(); } });
          }, { threshold: 0.25 });
          io.observe(host);
        } else { run(); }
      }
    }

    var cap = document.getElementById("elevCap");
    if (cap) {
      cap.textContent = "High point of each backcountry trip, " +
        data[0].year + "–" + data[data.length - 1].year;
    }
  }

  /* ----------------------------- the row stats ----------------------------- */

  function stat(value, label) {
    return '<strong>' + value + '</strong> <span>' + label + '</span>';
  }

  function fillStats() {
    if (window.PLACES) {
      var done = window.PLACES.filter(function (p) { return p.status === "done"; });
      var by = function (k) {
        return done.filter(function (p) { return p.kind === k; }).length;
      };
      set("statTrips", stat(by("backcountry"), "routes") + stat(by("dive"), "dives") +
                       stat(by("ski"), "peaks"));
    }

    var L = window.LISTEN_SUMMARY;
    if (L) {
      set("statMusic", stat(n(L.totalHours), "hrs") + stat(n(L.artistCount), "artists"));
    }

    var D = window.LOG_DATA;
    if (D && D.rows && D.rows.length) {
      var kcalAt = D.fields.indexOf("kcal");
      var vals = D.rows.map(function (r) { return r[kcalAt]; })
                       .filter(function (v) { return typeof v === "number"; });
      var avg = Math.round(vals.reduce(function (a, b) { return a + b; }, 0) / vals.length);
      set("statLog", stat(n(D.rows.length), "days") + stat(n(avg), "kcal/day"));
    }

    // The Work has no real coverage on it yet, and inventing a figure to keep
    // the row symmetrical would be exactly the wrong move.
    set("statWork", '<em class="link-flag">Building</em>');
  }

  function boot() { drawElevation(); fillStats(); }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else { boot(); }
})();
