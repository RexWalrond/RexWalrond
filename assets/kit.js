/* The Kit — builds kit.html from assets/kit-data.js.
 *
 * The tiles are drawn, not photographed. Every other piece of art on this site
 * is generated (the ridges, the clouds, the moon's terminator, the social
 * card), and product photography would be the one place it stopped being: a
 * grid of ten brand JPEGs pulled off ten CDNs looks like an affiliate page,
 * ages badly as those URLs rot, and none of them would agree on background,
 * crop or colour. A drawn silhouette per container — tub, bar, sachet, bottle,
 * dropper, jar, soap, bag, packet — reads at a glance, sits in the palette,
 * re-themes with the sky, and never 404s.
 *
 * Each form is a function of one viewBox: 100x100, object standing on a shelf
 * line at y=86. Keep new forms on that line or the row stops reading as a
 * shelf.
 */
(function () {
  "use strict";

  var host = document.getElementById("kitBody");
  if (!host || !window.KIT) return;

  /* ------------------------------- the forms ------------------------------- */
  /* Drawn in the same language as the elevation motif: a fine outline, one
     band of accent, nothing shaded. The point is the silhouette. */

  var FORMS = {
    // protein powder, creatine — wide tub with a press-on lid
    tub: '<rect class="k-body" x="23" y="30" width="54" height="56" rx="2"/>' +
         '<rect class="k-fill" x="23" y="47" width="54" height="22"/>' +
         '<rect class="k-body" x="26" y="19" width="48" height="12" rx="2"/>' +
         '<line class="k-line" x1="26" y1="25" x2="74" y2="25"/>',

    // protein bar — lying flat, wrapper seam down the length
    bar: '<rect class="k-body" x="10" y="48" width="80" height="38" rx="5"/>' +
         '<rect class="k-fill" x="10" y="59" width="80" height="17"/>' +
         '<line class="k-line" x1="25" y1="48" x2="25" y2="86"/>' +
         '<line class="k-line" x1="75" y1="48" x2="75" y2="86"/>',

    // electrolyte sachet — tall stick, serrated across the top
    stick: '<rect class="k-body" x="37" y="24" width="26" height="62" rx="1"/>' +
           '<rect class="k-fill" x="37" y="44" width="26" height="24"/>' +
           '<path class="k-line" d="M37,24 L41,28 L45,24 L49,28 L53,24 L57,28 L61,24 L63,26"/>' +
           '<line class="k-line" x1="37" y1="35" x2="63" y2="35"/>',

    // olive oil — long neck, sloped shoulder, oil standing in the base
    bottle: '<path class="k-body" d="M45,15 h10 v13 q13,6 13,20 v38 h-36 v-38 q0,-14 13,-20 z"/>' +
            '<rect class="k-fill" x="32" y="54" width="36" height="32"/>' +
            '<line class="k-line" x1="32" y1="54" x2="68" y2="54"/>' +
            '<rect class="k-cap" x="43" y="11" width="14" height="5" rx="1"/>',

    // serum — squat bottle, pipette cap. Square base so the liquid can sit on it.
    dropper: '<rect class="k-cap" x="42" y="10" width="16" height="9" rx="2"/>' +
             '<rect class="k-body" x="46" y="19" width="8" height="9"/>' +
             '<rect class="k-body" x="35" y="28" width="30" height="58"/>' +
             '<rect class="k-fill" x="35" y="52" width="30" height="34"/>' +
             '<line class="k-line" x1="35" y1="52" x2="65" y2="52"/>',

    // face cream — wide squat jar, screw lid
    jar: '<rect class="k-body" x="28" y="46" width="44" height="40"/>' +
         '<rect class="k-fill" x="28" y="64" width="44" height="22"/>' +
         '<rect class="k-body" x="25" y="33" width="50" height="14" rx="2"/>' +
         '<line class="k-line" x1="25" y1="40" x2="75" y2="40"/>',

    // soap — a bar in three-quarter view: top face, front face, one side
    soap: '<path class="k-body" d="M14,56 L28,44 L86,44 L72,56 Z"/>' +
          '<path class="k-body" d="M72,56 L86,44 L86,74 L72,86 Z"/>' +
          '<rect class="k-body" x="14" y="56" width="58" height="30" rx="3"/>' +
          '<rect class="k-fill" x="14" y="65" width="58" height="13"/>',

    // whole bean coffee — rolled top, side gussets
    bag: '<rect class="k-body" x="28" y="28" width="44" height="58"/>' +
         '<rect class="k-fill" x="28" y="50" width="44" height="22"/>' +
         '<path class="k-cap" d="M30,19 h40 v9 h-40 z"/>' +
         '<line class="k-line" x1="61" y1="28" x2="61" y2="86"/>' +
         '<line class="k-line" x1="28" y1="34" x2="72" y2="34"/>',

    // instant coffee — flat single-serve packet, serrated across the top
    packet: '<rect class="k-body" x="19" y="36" width="62" height="50"/>' +
            '<rect class="k-fill" x="19" y="56" width="62" height="30"/>' +
            '<path class="k-line" d="M19,36 L23,40 L27,36 L31,40 L35,36 L39,40 L43,36 L47,40 ' +
            'L51,36 L55,40 L59,36 L63,40 L67,36 L71,40 L75,36 L79,40 L81,36"/>' +
            '<line class="k-line" x1="19" y1="48" x2="81" y2="48"/>'
  };

  function tile(form) {
    var shape = FORMS[form] || '<rect class="k-body" x="28" y="34" width="44" height="52" rx="3"/>';
    return '<svg class="kit-tile" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
             shape +
             '<line class="kit-shelf" x1="10" y1="86.5" x2="90" y2="86.5"/>' +
           '</svg>';
  }

  /* -------------------------------- the copy ------------------------------- */

  function money(item) {
    if (typeof item.price !== "number") return '<em>see site</em>';
    var n = item.price % 1 === 0 ? item.price.toFixed(0) : item.price.toFixed(2);
    return (item.priceFrom ? '<span class="kit-from">from</span> ' : "") + "$" + n;
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // "drinklmnt.com" — the reader should know where the link goes before they take it
  function host_of(url) {
    try { return new URL(url).hostname.replace(/^www\./, ""); }
    catch (e) { return "the maker"; }
  }

  function cell(item) {
    var label = item.brand + " " + item.name +
                (item.variant ? ", " + item.variant : "") +
                " — opens " + host_of(item.url) + " in a new tab";

    return '<a class="kit-item" id="kit-' + esc(item.id) + '" href="' + esc(item.url) + '"' +
             ' target="_blank" rel="noopener" aria-label="' + esc(label) + '">' +
             '<span class="kit-art">' + tile(item.form) + '</span>' +
             '<span class="kit-what">' + esc(item.what) + '</span>' +
             '<span class="kit-name">' + esc(item.brand) + ' <strong>' + esc(item.name) + '</strong></span>' +
             (item.variant ? '<span class="kit-variant">' + esc(item.variant) + '</span>' : "") +
             '<span class="kit-foot">' +
               '<span class="kit-price">' + money(item) + '</span>' +
               '<span class="kit-go">' + esc(host_of(item.url)) + ' &rarr;</span>' +
             '</span>' +
           '</a>';
  }

  function group(g, first) {
    var head =
      '<div class="cov-section-head">' +
        '<h2>' + esc(g.label) + '</h2>' +
        '<span class="cov-meta">' + g.items.length +
          (g.items.length === 1 ? " item" : " items") + '</span>' +
      '</div>' +
      (g.blurb ? '<p class="kit-blurb">' + esc(g.blurb) + '</p>' : "");

    var grid = '<div class="kit-grid kit-grid--' + esc(g.id) + '">' +
               g.items.map(cell).join("") +
               (g.pending ? '<p class="kit-pending">' + esc(g.pending) + '</p>' : "") +
               '</div>';

    // the signature divider between sections, not before the first one
    var rule = first ? "" :
      '<div class="elevation elevation--sm" aria-hidden="true">' +
        '<svg viewBox="0 0 800 60" preserveAspectRatio="none">' +
          '<path class="fill" d="M0,45 L100,30 200,42 300,20 400,38 500,15 600,35 700,22 800,32 800,60 0,60 Z"/>' +
          '<path class="line" d="M0,45 L100,30 200,42 300,20 400,38 500,15 600,35 700,22 800,32"/>' +
        '</svg>' +
      '</div>';

    /* No data-reveal on anything generated here: reveal.js observes once at
       load, so an element built afterwards is never seen and stays at opacity
       zero for good. The static wrapper in kit.html carries the reveal, the
       same way trips.html wraps the map. */
    return rule + '<section class="kit-group" data-kit="' + esc(g.id) + '">' +
           head + grid + '</section>';
  }

  /* -------------------------------- the page ------------------------------- */

  function asOfLabel(s) {
    var p = String(s).split("-");
    var months = ["January", "February", "March", "April", "May", "June", "July",
                  "August", "September", "October", "November", "December"];
    var m = months[parseInt(p[1], 10) - 1];
    return m ? m + " " + p[0] : s;
  }

  function boot() {
    host.innerHTML = window.KIT.groups.map(function (g, i) {
      return group(g, i === 0);
    }).join("");

    var total = window.KIT.groups.reduce(function (n, g) { return n + g.items.length; }, 0);
    var meta = document.getElementById("kitMeta");
    if (meta) {
      meta.textContent = total + (total === 1 ? " item" : " items") + " · " +
        window.KIT.groups.length + " lists";
    }

    var stamp = document.getElementById("kitAsOf");
    if (stamp) stamp.textContent = asOfLabel(window.KIT.asOf);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else { boot(); }
})();
