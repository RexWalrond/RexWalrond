/* The hub's live figures.
 *
 * Each link row carries a real number from its own page's data, so the hub
 * reports on the site instead of just pointing at it. Nothing here is
 * hardcoded; a row with no real numbers behind it gets a status tag rather
 * than an invented one.
 *
 * There was an elevation chart here too. It went: the hub's job is to send
 * people to the four pages, and opening on a chart of hiking high points both
 * over-weighted one of them and asked a first-time visitor to interpret
 * something before they had any context for it.
 */
(function () {
  "use strict";

  function n(v) { return v.toLocaleString("en-US"); }
  function set(id, html) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = html;
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

  function boot() { fillStats(); }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else { boot(); }
})();
