/* Field Notes — "The Ground Covered".
 *
 * An interactive map of every place in assets/places.js, drawn from the baked
 * coastlines in assets/geo.js. No mapping library, no tiles, no network: the
 * whole thing is inline SVG in the site palette.
 *
 * Projection is equidistant cylindrical with a standard parallel — plate
 * carrée with the x axis compressed by cos(lat0). That makes it an affine
 * transform of a single set of lon/lat paths, so geometry is built once at
 * startup and every view change (and every frame of a fly-to) is just a new
 * transform string on one <g>. Markers are positioned in screen space so their
 * glyphs never stretch.
 */
(function () {
  "use strict";

  var host = document.getElementById("fieldMap");
  if (!host || !window.PLACES || !window.GEO) return;

  var REDUCED = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var NS = "http://www.w3.org/2000/svg";
  // 1000x520 is close to the world view's own aspect at these bounds, so the
  // default framing fills the plate instead of floating in dead sea. On a phone
  // the plate goes taller, because a 2:1 map inside a 366px column is 180px of
  // nothing.
  var W = 1000, H = 520, PAD = 26;

  /* viewBox units per CSS pixel. Marker glyphs, hit areas and the clustering
     and separation distances are all authored in screen pixels and multiplied
     by this, so a marker is the same size under the finger on a phone as it is
     under the cursor on a desktop. Without it everything is specified in
     viewBox units and shrinks with the canvas: at 366px wide, a 6.6-unit
     marker renders 2.4px across. */
  var UI = 1;
  /* Radius of a marker's invisible tap area, in CSS pixels. A pin's glyph is
     about 16px across, which is a fine mouse target and a poor thumb one, so
     touch widths get a wider catchment than the desktop does. */
  var HIT_R = 11;
  var DEG = Math.PI / 180;

  var KINDS = {
    backcountry: { label: "Backcountry", plural: "routes" },
    dive:        { label: "Dive",        plural: "dive sites" },
    ski:         { label: "Ski",         plural: "mountains" }
  };

  var state = {
    kind: "all",        // all | backcountry | dive | ski
    wish: true,         // show the on-the-list places
    view: "world",
    selected: null,
    frame: null
  };

  /* ------------------------------ projection ------------------------------ */
  // Geometry is stored as x = lon, y = -lat. A view is a lon/lat box; fitting
  // it yields the scale and offset that turn that box into the viewBox.

  function fitView(bounds) {
    var w = bounds[0], s = bounds[1], e = bounds[2], n = bounds[3];
    var lat0 = (s + n) / 2;
    var cos = Math.max(0.08, Math.cos(lat0 * DEG));

    var spanX = (e - w) * cos;
    var spanY = (n - s);
    var k = Math.min((W - PAD * 2) / spanX, (H - PAD * 2) / spanY);

    var sx = k * cos, sy = k;
    // centre of the box, in geometry space, mapped to the centre of the canvas
    var cx = (w + e) / 2, cy = -(s + n) / 2;
    return {
      sx: sx, sy: sy,
      tx: W / 2 - cx * sx,
      ty: H / 2 - cy * sy,
      bounds: bounds.slice()
    };
  }

  function toScreen(t, lon, lat) {
    return [lon * t.sx + t.tx, -lat * t.sy + t.ty];
  }

  /* Fit a box to some places. `padFactor` is a share of the box's own span, not
     a fixed number of degrees — a fixed pad that frames six western states
     sensibly is absurd around two ski resorts a mile apart. `minSpan` is the
     floor, and it has to be small: zooming a two-marker cluster has to actually
     separate those two markers, or clicking it does nothing and the cluster
     can never be opened. */
  function boundsOf(list, padFactor, minSpan) {
    if (!list.length) return WORLD.slice();

    var w = 180, s = 90, e = -180, n = -90;
    list.forEach(function (p) {
      if (p.lon < w) w = p.lon;
      if (p.lon > e) e = p.lon;
      if (p.lat < s) s = p.lat;
      if (p.lat > n) n = p.lat;
    });

    var floor = minSpan == null ? 0.06 : minSpan;     // ~6 km
    if (e - w < floor) { var mx = (w + e) / 2; w = mx - floor / 2; e = mx + floor / 2; }
    if (n - s < floor * 0.6) { var my = (s + n) / 2; s = my - floor * 0.3; n = my + floor * 0.3; }

    var f = padFactor == null ? 0.18 : padFactor;
    var padX = (e - w) * f, padY = (n - s) * f;
    return [
      Math.max(-180, w - padX), Math.max(-89, s - padY),
      Math.min(180, e + padX),  Math.min(89, n + padY)
    ];
  }

  /* Recomputed by layout() for whatever shape the plate is. The globe is much
     wider than it is tall, so forcing all 360 degrees into a plate that is not
     2:1 leaves the rest as empty sea — on a phone that was a third of the map.
     See worldFrame(). */
  var WORLD = [-180, -86, 180, 84];

  /* Grow a box until it matches the plate's shape, so the room the plate has
     goes to showing more world rather than more water, then pull the centre
     back inside the globe. Past about 300 degrees of longitude there is little
     left to gain, so it snaps to the whole globe instead of cutting a slice out
     of one side — that is what keeps the desktop view a complete world map. */
  function expandToAspect(b, plateAspect) {
    var w = b[0], s = b[1], e = b[2], n = b[3];
    var lat0 = (s + n) / 2;
    var cos = Math.max(0.08, Math.cos(lat0 * DEG));

    var spanX = (e - w) * cos, spanY = n - s;
    if (spanX / spanY < plateAspect) spanX = spanY * plateAspect;
    else spanY = spanX / plateAspect;

    var lonSpan = spanX / cos;
    lonSpan = lonSpan > 300 ? 360 : Math.min(360, lonSpan);
    var latSpan = Math.min(178, spanY);

    var cx = (w + e) / 2, cy = lat0;
    cx = Math.max(-180 + lonSpan / 2, Math.min(180 - lonSpan / 2, cx));
    cy = Math.max(-89 + latSpan / 2, Math.min(89 - latSpan / 2, cy));

    return [cx - lonSpan / 2, cy - latSpan / 2, cx + lonSpan / 2, cy + latSpan / 2];
  }

  // Every place, including the ones still on the list, so reset always shows all of them.
  function worldFrame(plateAspect) {
    return expandToAspect(boundsOf(window.PLACES, 0.06, 4), plateAspect);
  }

  // A box's shape once projected, which is what the plate has to match.
  function frameAspect(b) {
    var cos = Math.max(0.08, Math.cos(((b[1] + b[3]) / 2) * DEG));
    return ((b[2] - b[0]) * cos) / (b[3] - b[1]);
  }

  /* Zoom and pan operate on the view box in degrees, then re-fit. Limits keep
     you from zooming past the point where the baked 110m coastline has any
     detail left, or panning off into blank sea with no way back. */
  var MIN_SPAN = 0.02;     // degrees of longitude across the plate
  var MAX_SPAN = 360;

  function clampBounds(b) {
    var w = b[0], s = b[1], e = b[2], n = b[3];
    var spanX = Math.min(MAX_SPAN, Math.max(MIN_SPAN, e - w));
    var spanY = Math.min(178, Math.max(MIN_SPAN * 0.6, n - s));

    var cx = (w + e) / 2, cy = (s + n) / 2;
    // keep the centre on the globe, so the map can always be recovered
    cx = Math.max(-180, Math.min(180, cx));
    cy = Math.max(-88, Math.min(86, cy));
    return [cx - spanX / 2, cy - spanY / 2, cx + spanX / 2, cy + spanY / 2];
  }

  function zoomBy(factor, originX, originY) {
    var b = view.bounds;
    var w = b[0], s = b[1], e = b[2], n = b[3];

    // Anchor on a screen point when given one (double-click), else the centre.
    var ax = originX == null ? 0.5 : originX / W;
    var ay = originY == null ? 0.5 : originY / H;
    var lon = w + (e - w) * ax;
    var lat = n - (n - s) * ay;

    var spanX = (e - w) / factor;
    var spanY = (n - s) / factor;
    setBounds(clampBounds([
      lon - spanX * ax,       lat - spanY * (1 - ay),
      lon + spanX * (1 - ax), lat + spanY * ay
    ]), true);
  }

  function setBounds(b, animate) {
    state.view = "auto";
    syncViewButtons();
    if (animate) flyTo(b);
    else { view = fitView(b); render(); }
    syncZoomButtons();
  }

  /* ------------------------------- geometry ------------------------------- */

  /* Three rings in the baked geography cross the antimeridian — Antarctica,
     Afro-Eurasia and Fiji. Their longitudes jump from +179 to -180 between
     consecutive points, and in projected space that jump is a straight segment
     drawn all the way back across the plate. It showed as a cream band over the
     Arctic, a green line at 16 degrees south and a slab along the bottom, on
     every load, at every zoom.

     Unwrapping removes the jump: keep adding or subtracting a turn so the ring
     stays continuous even where it runs past the dateline. Two things follow
     from that. A ring that unwraps a whole turn is going round a pole, and
     closing it needs two points at the pole itself or the cap gets sliced off
     by the closing segment. And an unwrapped ring lives in one 360-degree
     window, so it has to be drawn again a turn either side to show up at the
     opposite edge of the plate. */

  function unwrapRing(r) {
    var out = [r[0], r[1]], prev = r[0], i, lon;
    for (i = 2; i < r.length; i += 2) {
      lon = r[i];
      while (lon - prev > 180) lon -= 360;
      while (lon - prev < -180) lon += 360;
      out.push(lon, r[i + 1]);
      prev = lon;
    }
    return out;
  }

  function ringPath(r, shift) {
    var d = "", i;
    for (i = 0; i < r.length; i += 2) {
      d += (i ? "L" : "M") + (r[i] + shift).toFixed(2) + "," + (-r[i + 1]);
    }
    return d + "Z";
  }

  function ringsToPath(groups) {
    var d = "";
    groups.forEach(function (rings) {
      rings.forEach(function (raw) {
        var r = unwrapRing(raw);
        var lo = Infinity, hi = -Infinity, i;
        for (i = 0; i < r.length; i += 2) {
          if (r[i] < lo) lo = r[i];
          if (r[i] > hi) hi = r[i];
        }

        /* Afro-Eurasia unwraps a whole turn west of where it belongs, so bring
           the ring back over the globe before deciding which copies to draw. */
        var base = -360 * Math.round(((lo + hi) / 2) / 360);
        lo += base; hi += base;

        var turn = r[r.length - 2] - r[0];
        if (Math.abs(turn) > 350) {
          /* Encircles a pole: walk back along it so the cap fills instead of
             being sliced off by the closing segment. The walk goes a few
             degrees past the pole, because the plate carries PAD units of
             margin outside the fitted frame and there is no geography out
             there to fill it — closing at exactly ±90 left Antarctica with a
             dead-straight edge and a band of sea between it and the bottom of
             the map. Nothing below the pole is ever read as a latitude; it is
             fill that the plate clips. */
          var pole = r[1] < 0 ? -96 : 96;
          r = r.concat([r[r.length - 2], pole, r[0], pole]);
        }

        // only the copies that can actually land on the globe
        for (var k = -1; k <= 1; k++) {
          var s = base + k * 360;
          if (k !== 0 && !(lo + k * 360 < 180 && hi + k * 360 > -180)) continue;
          d += ringPath(r, s);
        }
      });
    });
    return d;
  }

  function graticulePath(stepLon, stepLat) {
    var d = "", lon, lat;
    for (lon = -180; lon <= 180; lon += stepLon) {
      d += "M" + lon + ",-84";
      for (lat = -82; lat <= 84; lat += 4) d += "L" + lon + "," + (-lat);
    }
    for (lat = -80; lat <= 80; lat += stepLat) {
      d += "M-180," + (-lat) + "L180," + (-lat);
    }
    return d;
  }

  /* -------------------------------- markers -------------------------------- */
  // Each kind gets its own glyph so the map reads without leaning on colour
  // alone: a peak for backcountry, a dive-flag roundel, a chevron for ski.
  // Wishlist places are the same glyph, hollow.

  function glyph(kind) {
    if (kind === "backcountry") return "M0,-8.4 L7.6,6 L-7.6,6 Z";
    if (kind === "ski")         return "M0,-8.2 L8,6.4 L0,2.2 L-8,6.4 Z";
    return null;                 // dive uses a circle
  }

  function el(name, attrs) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) n.setAttribute(k, attrs[k]);
    return n;
  }

  /* --------------------------------- build --------------------------------- */

  var svg, seaRect, gGeo, gMark, gClust, tip, card, markers = [], view;

  function build() {
    host.innerHTML = "";
    host.classList.add("fmap");

    // ---- controls
    var bar = document.createElement("div");
    bar.className = "fmap-bar";

    var chips = document.createElement("div");
    chips.className = "fmap-chips";
    chips.setAttribute("role", "group");
    chips.setAttribute("aria-label", "Filter places by kind");
    [["all", "All"]].concat(Object.keys(KINDS).map(function (k) {
      return [k, KINDS[k].label];
    })).forEach(function (pair) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "fmap-chip" + (pair[0] === state.kind ? " is-active" : "");
      b.setAttribute("data-kind", pair[0]);
      b.setAttribute("aria-pressed", String(pair[0] === state.kind));
      b.textContent = pair[1];
      b.addEventListener("click", function () { setKind(pair[0]); });
      chips.appendChild(b);
    });

    var wishBtn = document.createElement("button");
    wishBtn.type = "button";
    wishBtn.className = "fmap-chip fmap-chip--wish is-active";
    wishBtn.setAttribute("aria-pressed", "true");
    wishBtn.innerHTML = '<span class="fmap-chip-dot" aria-hidden="true"></span>On the list';
    wishBtn.addEventListener("click", function () {
      state.wish = !state.wish;
      wishBtn.classList.toggle("is-active", state.wish);
      wishBtn.setAttribute("aria-pressed", String(state.wish));
      if (!state.wish && state.selected && state.selected.status === "wish") select(null);
      render();
      flyTo(boundsFor());
    });
    chips.appendChild(wishBtn);

    var views = document.createElement("div");
    views.className = "fmap-views";
    views.setAttribute("role", "group");
    views.setAttribute("aria-label", "Map framing");
    window.PLACE_VIEWS.forEach(function (v) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "fmap-view" + (v.id === state.view ? " is-active" : "");
      b.setAttribute("data-view", v.id);
      b.textContent = v.label;
      b.addEventListener("click", function () {
        state.view = v.id;
        syncViewButtons();
        flyTo(v.bounds || WORLD);
      });
      views.appendChild(b);
    });

    bar.appendChild(chips);
    bar.appendChild(views);
    host.appendChild(bar);

    // ---- canvas
    var stage = document.createElement("div");
    stage.className = "fmap-stage";

    svg = el("svg", {
      viewBox: "0 0 " + W + " " + H,
      class: "fmap-svg",
      role: "img",
      "aria-label": "Map of logged trips, dive sites and ski mountains, with places still on the list"
    });

    var defs = el("defs");
    var grad = el("radialGradient", { id: "fmapSea", cx: "50%", cy: "42%", r: "72%" });
    grad.appendChild(el("stop", { offset: "0%", "stop-color": "var(--fmap-sea-hi)" }));
    grad.appendChild(el("stop", { offset: "100%", "stop-color": "var(--fmap-sea-lo)" }));
    defs.appendChild(grad);
    svg.appendChild(defs);

    seaRect = el("rect", { x: 0, y: 0, width: W, height: H, class: "fmap-sea", fill: "url(#fmapSea)" });
    svg.appendChild(seaRect);

    gGeo = el("g", { class: "fmap-geo" });
    gGeo.appendChild(el("path", { class: "fmap-grat", d: graticulePath(30, 15) }));
    gGeo.appendChild(el("path", { class: "fmap-land", d: ringsToPath(window.GEO.land) }));
    gGeo.appendChild(el("path", { class: "fmap-states", d: ringsToPath(window.GEO.states) }));
    svg.appendChild(gGeo);

    gMark = el("g", { class: "fmap-markers" });
    svg.appendChild(gMark);

    gClust = el("g", { class: "fmap-clusters" });
    svg.appendChild(gClust);

    stage.appendChild(svg);

    /* Zoom and reset. Before these existed you could drill into a cluster and
       then had no way back out except picking a preset — the map was a
       one-way trip. */
    var zoomBox = document.createElement("div");
    zoomBox.className = "fmap-zoom";
    [
      ["in",    "\u002b", "Zoom in",  function () { zoomBy(1.8); }],
      ["out",   "\u2212", "Zoom out", function () { zoomBy(1 / 1.8); }],
      ["reset", "\u21ba", "Reset to the whole world", function () {
        state.view = "world";
        syncViewButtons();
        select(null);
        flyTo(WORLD);
      }]
    ].forEach(function (spec) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "fmap-zoom-btn fmap-zoom-btn--" + spec[0];
      b.setAttribute("data-zoom", spec[0]);
      b.setAttribute("aria-label", spec[2]);
      b.setAttribute("title", spec[2]);
      b.textContent = spec[1];
      b.addEventListener("click", spec[3]);
      zoomBox.appendChild(b);
    });
    stage.appendChild(zoomBox);

    initPan(stage);

    tip = document.createElement("div");
    tip.className = "fmap-tip";
    tip.setAttribute("role", "status");
    tip.hidden = true;
    stage.appendChild(tip);

    host.appendChild(stage);

    // ---- readout
    card = document.createElement("div");
    card.className = "fmap-card";
    host.appendChild(card);

    var legend = document.createElement("p");
    legend.className = "fmap-legend";
    legend.innerHTML =
      '<span><svg viewBox="-10 -10 20 20" aria-hidden="true"><path d="' + glyph("backcountry") + '"/></svg>Backcountry</span>' +
      '<span><svg viewBox="-10 -10 20 20" aria-hidden="true"><circle r="6.6"/></svg>Dive</span>' +
      '<span><svg viewBox="-10 -10 20 20" aria-hidden="true"><path d="' + glyph("ski") + '"/></svg>Ski</span>' +
      '<span class="is-wish"><svg viewBox="-10 -10 20 20" aria-hidden="true"><circle r="6.2"/></svg>On the list</span>';
    host.appendChild(legend);

    buildMarkers();
    layout();
    view = fitView(WORLD);
    render();
    select(null);
    syncViewButtons();
    syncZoomButtons();
  }

  /* Recompute the plate's shape and the pixel-to-viewBox ratio for the current
     container width. Called at build and on resize.

     The plate and the world view are fitted to each other, in that order.
     A phone column is narrow, so it asks for a squarer plate to buy back some
     height; a desktop asks for a wide one. That target shapes the world frame,
     and then the plate takes its real height back from the frame, so the
     default view fills the plate exactly and there is no band of empty sea
     above or below the map. Before this, the phone plate was a third water and
     the desktop map floated clear of the bottom edge.

     The sea is resized here too. It was built at the desktop height and left
     there, which put the gradient's last stop a quarter of the way up every
     phone map and a flat slab below it. */
  function layout() {
    var px = host.clientWidth || W;
    UI = W / px;

    var want = px < 560 ? 1.46 : 2.03;            // plate shape we would like
    WORLD = worldFrame(want);

    HIT_R = px < 560 ? 16 : 11;
    markers.forEach(function (m) { m.hit.setAttribute("r", HIT_R); });
    H = Math.round(Math.max(420, Math.min(760, (W - PAD * 2) / frameAspect(WORLD) + PAD * 2)));

    if (svg) svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    if (seaRect) seaRect.setAttribute("height", H);
  }

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var wasWorld = state.view === "world";
      layout();
      view = fitView(wasWorld ? WORLD : (view ? view.bounds : WORLD));
      render();
      hideTip();
    }, 140);
  }, { passive: true });

  /* Drag to pan. A drag has to out-compete a marker click, so nothing moves
     until the pointer has travelled past a threshold; past it, the pointer is
     captured and the click that follows is swallowed. Pointer events cover
     mouse and touch with one path. */
  function initPan(stage) {
    var dragging = false, moved = false, startX = 0, startY = 0, startBounds = null;

    stage.addEventListener("pointerdown", function (e) {
      if (e.button != null && e.button !== 0) return;
      if (e.target.closest(".fmap-zoom")) return;     // the buttons are not canvas
      dragging = true; moved = false;
      startX = e.clientX; startY = e.clientY;
      startBounds = view.bounds.slice();
    });

    stage.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX, dy = e.clientY - startY;
      if (!moved && Math.hypot(dx, dy) < 4) return;   // still a click, not a drag

      if (!moved) {
        moved = true;
        stage.classList.add("is-panning");
        hideTip();
        if (stage.setPointerCapture) { try { stage.setPointerCapture(e.pointerId); } catch (err) {} }
        if (state.frame) { cancelAnimationFrame(state.frame); state.frame = null; }
      }
      e.preventDefault();

      // screen pixels -> degrees, using the scale the drag started at
      var t = fitView(startBounds);
      var px = W / (stage.clientWidth || W);
      var dLon = -(dx * px) / t.sx;
      var dLat = (dy * px) / t.sy;

      view = fitView(clampBounds([
        startBounds[0] + dLon, startBounds[1] + dLat,
        startBounds[2] + dLon, startBounds[3] + dLat
      ]));
      render();
    });

    function end(e) {
      if (!dragging) return;
      dragging = false;
      if (moved) {
        stage.classList.remove("is-panning");
        state.view = "auto";
        syncViewButtons();
        syncZoomButtons();
        if (stage.releasePointerCapture) { try { stage.releasePointerCapture(e.pointerId); } catch (err) {} }
      }
    }
    stage.addEventListener("pointerup", end);
    stage.addEventListener("pointercancel", end);

    // a drag ends on a marker often enough that the click must be suppressed
    stage.addEventListener("click", function (e) {
      if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; }
    }, true);

    stage.addEventListener("dblclick", function (e) {
      if (e.target.closest(".fmap-zoom")) return;
      var r = stage.getBoundingClientRect();
      zoomBy(2, (e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H);
    });
  }

  /* Grey out a zoom button once it can no longer do anything, so the limits are
     visible rather than a dead click. */
  function syncZoomButtons() {
    if (!view) return;
    var span = view.bounds[2] - view.bounds[0];
    var zi = host.querySelector('[data-zoom="in"]');
    var zo = host.querySelector('[data-zoom="out"]');
    if (zi) zi.disabled = span <= MIN_SPAN * 1.02;
    if (zo) zo.disabled = span >= MAX_SPAN * 0.999;
  }

  function syncViewButtons() {
    host.querySelectorAll(".fmap-view").forEach(function (b) {
      var on = b.getAttribute("data-view") === state.view;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-current", on ? "true" : "false");
    });
  }

  function buildMarkers() {
    markers = window.PLACES.map(function (p) {
      var g = el("g", {
        class: "fmap-pin fmap-pin--" + p.kind + (p.status === "wish" ? " is-wish" : "") +
               (p.summited ? " is-summited" : ""),
        tabindex: "0",
        role: "button",
        "aria-label": p.name + " — " + p.where + (p.status === "wish" ? " (on the list)" : "")
      });

      // A leader back to the true position, for pins the separation pass had
      // to nudge. Hidden until it has somewhere to point.
      var leader = el("line", { class: "fmap-leader", x1: 0, y1: 0, x2: 0, y2: 0 });
      var anchor = el("circle", { class: "fmap-anchor", r: 1.5 });
      g.appendChild(leader);
      g.appendChild(anchor);

      // The body carries the displacement, so the group stays on the true point.
      var body = el("g", { class: "fmap-pin-body" });
      var hit = el("circle", { class: "fmap-hit", r: HIT_R });
      body.appendChild(hit);
      if (p.summited) body.appendChild(el("circle", { class: "fmap-halo", r: 12 }));

      var d = glyph(p.kind);
      body.appendChild(d ? el("path", { class: "fmap-glyph", d: d })
                         : el("circle", { class: "fmap-glyph", r: 6.6 }));
      g.appendChild(body);

      g.addEventListener("mouseenter", function () { showTip(p, g); });
      g.addEventListener("mouseleave", hideTip);
      g.addEventListener("focus", function () { showTip(p, g); select(p, true); });
      g.addEventListener("blur", hideTip);
      g.addEventListener("click", function () { select(p); });
      g.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(p); }
      });

      gMark.appendChild(g);
      return { place: p, node: g, body: body, hit: hit, leader: leader, anchor: anchor,
               x: 0, y: 0, dx: 0, dy: 0 };
    });
  }

  /* -------------------------------- filtering -------------------------------- */

  function visible(p) {
    if (state.kind !== "all" && p.kind !== state.kind) return false;
    if (!state.wish && p.status === "wish") return false;
    return true;
  }

  function shown() { return window.PLACES.filter(visible); }

  function boundsFor() {
    if (state.view !== "auto") {
      var v = window.PLACE_VIEWS.filter(function (x) { return x.id === state.view; })[0];
      if (v) return v.bounds || WORLD;
    }
    return boundsOf(shown(), 0.14);
  }

  function setKind(kind) {
    state.kind = kind;
    host.querySelectorAll(".fmap-chip[data-kind]").forEach(function (b) {
      var on = b.getAttribute("data-kind") === kind;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", String(on));
    });
    if (state.selected && !visible(state.selected)) select(null);
    render();

    // Filtering to one kind implies you want to see it, so reframe to fit.
    state.view = "auto";
    syncViewButtons();
    flyTo(boundsOf(shown(), kind === "all" ? 0.16 : 0.13));
  }

  /* --------------------------------- render --------------------------------- */

  /* Clustering, then displacement.
   *
   * Real sites cluster hard — eight Florida springs inside two degrees, Alta
   * and Snowbird a mile apart. Two different problems at two different zooms:
   *
   *   At world scale, thirty-two markers inside North America cannot each have
   *   their own spot. Spreading them would draw a blob over the continent and
   *   put Ginnie Springs somewhere in Kansas, which is a lie. So points that
   *   fall within a short screen distance collapse into one disc carrying a
   *   count; clicking it flies in, and the group resolves into real markers.
   *
   *   Once zoomed in, only a few pins still overlap, and those get nudged
   *   apart with a leader line back to true position — displacement, which is
   *   visible and honest, rather than a stack you cannot click.
   */

  // All in CSS pixels; scaled into viewBox units by UI at use.
  var CLUSTER_R = 20;    // below this, points collapse into one disc
  var SEP = 27;          // and between CLUSTER_R and this, they get nudged apart
  var SEP_ROUNDS = 14;
  var MAX_SHIFT = 26;    // a pin nudged further than this stops meaning anything
  var MARGIN = 14;       // how far outside the frame still counts as on it

  function clusterize(list) {
    var groups = [];
    list.forEach(function (m) {
      for (var i = 0; i < groups.length; i++) {
        var g = groups[i];
        if (Math.hypot(m.x - g.x, m.y - g.y) <= CLUSTER_R * UI) {
          g.members.push(m);
          // running centroid, so a chain of near points stays one group
          g.x += (m.x - g.x) / g.members.length;
          g.y += (m.y - g.y) / g.members.length;
          return;
        }
      }
      groups.push({ x: m.x, y: m.y, members: [m] });
    });
    return groups;
  }

  function separate(list) {
    list.forEach(function (m) { m.dx = 0; m.dy = 0; });

    for (var round = 0; round < SEP_ROUNDS; round++) {
      var moved = false;
      for (var i = 0; i < list.length; i++) {
        for (var j = i + 1; j < list.length; j++) {
          var a = list[i], b = list[j];
          var dx = (b.x + b.dx) - (a.x + a.dx);
          var dy = (b.y + b.dy) - (a.y + a.dy);
          var dist = Math.hypot(dx, dy);
          var sep = SEP * UI;
          if (dist >= sep) continue;

          // Exactly coincident points need a deterministic direction to split
          // along, or they sit on top of each other forever.
          if (dist < 0.001) {
            var ang = i * 2.399963;          // golden angle, so ties fan out
            dx = Math.cos(ang); dy = Math.sin(ang); dist = 1;
          }
          var push = (sep - dist) / 2;
          var ux = dx / dist, uy = dy / dist;
          a.dx -= ux * push; a.dy -= uy * push;
          b.dx += ux * push; b.dy += uy * push;
          moved = true;
        }
      }
      if (!moved) break;
    }

    var cap = MAX_SHIFT * UI;
    list.forEach(function (m) {
      var d = Math.hypot(m.dx, m.dy);
      if (d > cap) { m.dx *= cap / d; m.dy *= cap / d; }
    });
  }

  function kindOf(members) {
    var k = members[0].place.kind;
    return members.every(function (m) { return m.place.kind === k; }) ? k : "mixed";
  }

  function clusterRadius(n) {
    return (11 + Math.min(7, Math.log(n + 1) * 4)) * UI;
  }

  function drawClusters(groups) {
    while (gClust.firstChild) gClust.removeChild(gClust.firstChild);

    groups.forEach(function (g) {
      var n = g.members.length;
      var r = g.r || clusterRadius(n);
      var allWish = g.members.every(function (m) { return m.place.status === "wish"; });

      var node = el("g", {
        class: "fmap-cluster fmap-cluster--" + kindOf(g.members) + (allWish ? " is-wish" : ""),
        transform: "translate(" + g.x.toFixed(1) + "," + g.y.toFixed(1) + ")",
        tabindex: "0",
        role: "button",
        "aria-label": n + " places here — activate to zoom in"
      });
      node.appendChild(el("circle", { class: "fmap-cluster-ring", r: r + 4 * UI }));
      node.appendChild(el("circle", { class: "fmap-cluster-disc", r: r }));

      var t = el("text", {
        class: "fmap-cluster-n",
        y: 4.4 * UI,
        "font-size": (13 * UI).toFixed(1)
      });
      t.textContent = String(n);
      node.appendChild(t);

      function zoomIn() {
        state.view = "auto";
        syncViewButtons();
        hideTip();
        flyTo(boundsOf(g.members.map(function (m) { return m.place; }), 0.3));
      }
      node.addEventListener("click", zoomIn);
      node.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); zoomIn(); }
      });
      node.addEventListener("mouseenter", function () { showClusterTip(g, r); });
      node.addEventListener("mouseleave", hideTip);
      node.addEventListener("focus", function () { showClusterTip(g, r); });
      node.addEventListener("blur", hideTip);

      gClust.appendChild(node);
    });
  }

  function showClusterTip(g, r) {
    var kinds = {};
    g.members.forEach(function (m) { kinds[m.place.kind] = (kinds[m.place.kind] || 0) + 1; });
    tip.innerHTML =
      '<strong>' + g.members.length + ' places</strong>' +
      '<span>' + Object.keys(kinds).map(function (k) {
        return kinds[k] + " " + KINDS[k].plural;
      }).join(" \u00b7 ") + '</span>' +
      '<span class="fmap-tip-wish">zoom in</span>';
    tip.hidden = false;
    tip.style.left = (g.x / W * 100).toFixed(2) + "%";
    tip.style.top = ((g.y - r) / H * 100).toFixed(2) + "%";
    tip.classList.toggle("is-low", g.y < H * 0.3);
  }

  function render() {
    var t = view;
    gGeo.setAttribute("transform",
      "translate(" + t.tx.toFixed(2) + "," + t.ty.toFixed(2) + ") scale(" +
      t.sx.toFixed(4) + "," + t.sy.toFixed(4) + ")");

    // state outlines only earn their keep once the frame is regional
    gGeo.classList.toggle("show-states", t.sy > 7);

    var live = [], offscreen = [];
    markers.forEach(function (m) {
      if (!visible(m.place)) { m.node.style.display = "none"; m.node.setAttribute("tabindex", "-1"); return; }
      var xy = toScreen(t, m.place.lon, m.place.lat);
      m.x = xy[0]; m.y = xy[1];
      // Only points inside the frame take part in clustering. A cluster drawn
      // off-canvas is invisible but still focusable, which is worse than
      // useless — and its count would describe places you cannot see.
      (m.x > -MARGIN * UI && m.x < W + MARGIN * UI && m.y > -MARGIN * UI && m.y < H + MARGIN * UI
        ? live : offscreen).push(m);
    });

    offscreen.forEach(function (m) {
      m.node.style.display = "";
      m.node.setAttribute("tabindex", "-1");
      m.node.classList.add("is-offscreen");
      m.node.classList.remove("is-shifted");
      m.dx = 0; m.dy = 0;
      m.node.setAttribute("transform", "translate(" + m.x.toFixed(1) + "," + m.y.toFixed(1) + ")");
      m.body.setAttribute("transform", "scale(" + UI.toFixed(3) + ")");
    });

    var groups = clusterize(live);
    var loose = [];
    var clustered = [];
    groups.forEach(function (g) {
      // A selected place always stays a real marker — collapsing the thing the
      // reader just picked into an anonymous count is the one unhelpful case.
      if (g.members.length > 1 && !g.members.some(function (m) { return m.place === state.selected; })) {
        clustered.push(g);
      } else {
        g.members.forEach(function (m) { loose.push(m); });
      }
    });

    // Clusters can collide with each other as well; the same nudge applies,
    // using each disc's own radius so big counts claim more room.
    clustered.forEach(function (g) { g.r = clusterRadius(g.members.length); });
    for (var round = 0; round < 10; round++) {
      var moved = false;
      for (var i = 0; i < clustered.length; i++) {
        for (var j = i + 1; j < clustered.length; j++) {
          var a = clustered[i], b = clustered[j];
          var dx = b.x - a.x, dy = b.y - a.y;
          var dist = Math.hypot(dx, dy);
          var want = a.r + b.r + 7 * UI;
          if (dist >= want) continue;
          if (dist < 0.001) { dx = 1; dy = 0; dist = 1; }
          var push = (want - dist) / 2;
          a.x -= dx / dist * push; a.y -= dy / dist * push;
          b.x += dx / dist * push; b.y += dy / dist * push;
          moved = true;
        }
      }
      if (!moved) break;
    }

    drawClusters(clustered);
    clustered.forEach(function (g) {
      g.members.forEach(function (m) {
        m.node.style.display = "none";
        m.node.setAttribute("tabindex", "-1");
      });
    });

    separate(loose);

    loose.forEach(function (m) {
      m.node.style.display = "";
      m.node.setAttribute("tabindex", "0");
      m.node.setAttribute("transform",
        "translate(" + m.x.toFixed(1) + "," + m.y.toFixed(1) + ")");
      m.body.setAttribute("transform",
        "translate(" + m.dx.toFixed(1) + "," + m.dy.toFixed(1) + ") scale(" + UI.toFixed(3) + ")");

      var shifted = Math.hypot(m.dx, m.dy) > 3;
      m.node.classList.toggle("is-shifted", shifted);
      if (shifted) {
        m.leader.setAttribute("x2", m.dx.toFixed(1));
        m.leader.setAttribute("y2", m.dy.toFixed(1));
      }

      m.node.classList.remove("is-offscreen");
    });
  }

  /* --------------------------------- fly-to --------------------------------- */

  function flyTo(bounds) {
    if (state.frame) { cancelAnimationFrame(state.frame); state.frame = null; }

    if (REDUCED) { view = fitView(bounds); render(); syncZoomButtons(); return; }

    var from = view.bounds.slice();
    var to = bounds.slice();
    var same = from.every(function (v, i) { return Math.abs(v - to[i]) < 0.001; });
    if (same) return;

    var start = performance.now();
    var dur = 620;

    function step(now) {
      var k = Math.min(1, (now - start) / dur);
      // easeInOutCubic
      var e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      var b = from.map(function (v, i) { return v + (to[i] - v) * e; });
      view = fitView(b);
      render();
      state.frame = k < 1 ? requestAnimationFrame(step) : null;
      if (!state.frame) syncZoomButtons();
    }
    state.frame = requestAnimationFrame(step);
  }

  /* -------------------------------- tooltip -------------------------------- */

  function showTip(p, node) {
    var m = markers.filter(function (x) { return x.place === p; })[0];
    var xy = toScreen(view, p.lon, p.lat);
    if (m) { xy = [xy[0] + m.dx, xy[1] + m.dy]; }
    tip.innerHTML =
      '<strong>' + p.name + '</strong>' +
      '<span>' + p.where + (p.when ? " · " + p.when : "") + '</span>' +
      (p.status === "wish" ? '<span class="fmap-tip-wish">on the list</span>' : "");
    tip.hidden = false;
    tip.style.left = (xy[0] / W * 100).toFixed(2) + "%";
    tip.style.top = (xy[1] / H * 100).toFixed(2) + "%";
    tip.classList.toggle("is-low", xy[1] < H * 0.28);
    if (node) node.classList.add("is-hot");
  }

  function hideTip() {
    tip.hidden = true;
    host.querySelectorAll(".fmap-pin.is-hot").forEach(function (n) {
      n.classList.remove("is-hot");
    });
  }

  /* ------------------------------ detail card ------------------------------ */

  function counts() {
    var done = window.PLACES.filter(function (p) { return p.status === "done"; });
    var wish = window.PLACES.length - done.length;
    var parts = Object.keys(KINDS).map(function (k) {
      var n = done.filter(function (p) { return p.kind === k; }).length;
      return n + " " + KINDS[k].plural;
    });
    return parts.join(" · ") + " · " + wish + " still on the list";
  }

  function select(p, quiet) {
    state.selected = p;
    markers.forEach(function (m) {
      m.node.classList.toggle("is-selected", m.place === p);
    });
    // re-run layout so the selected place breaks out of its cluster
    if (view) render();

    if (!p) {
      card.className = "fmap-card";
      card.innerHTML = '<p class="fmap-summary">' + counts() + '</p>' +
        '<p class="fmap-hint">Pick a marker for the detail, or use the filters to reframe.</p>';
      return;
    }

    card.className = "fmap-card is-open fmap-card--" + p.kind;
    var html = '<p class="fmap-card-kind">' + KINDS[p.kind].label +
      (p.status === "wish" ? " · on the list" : "") + '</p>' +
      '<h3>' + p.name + '</h3>' +
      '<p class="fmap-card-where">' + p.where + (p.when ? " · " + p.when : "") +
      (p.meta ? " · " + p.meta : "") + '</p>';

    if (p.stats) {
      html += '<div class="fmap-card-stats">' + p.stats.map(function (s) {
        return '<span><strong>' + s[0] + '</strong><small>' + s[1] + '</small></span>';
      }).join("") + '</div>';
    }
    if (p.note) html += '<p class="fmap-card-note">' + p.note + '</p>';

    html += '<p class="fmap-card-coord">' +
      Math.abs(p.lat).toFixed(3) + "°" + (p.lat >= 0 ? "N" : "S") + " " +
      Math.abs(p.lon).toFixed(3) + "°" + (p.lon >= 0 ? "E" : "W") + '</p>';

    var anchor = document.getElementById("place-" + p.id);
    if (anchor) html += '<button type="button" class="fmap-card-jump" data-jump="' + p.id + '">Read the write-up ↓</button>';

    card.innerHTML = html;

    var jump = card.querySelector("[data-jump]");
    if (jump) {
      jump.addEventListener("click", function () {
        var target = document.getElementById("place-" + p.id);
        if (!target) return;
        // The write-up may be inside a tab that isn't open. Let the page react
        // (Field Notes switches its Backcountry/Dive/Ski panel) before scrolling.
        host.dispatchEvent(new CustomEvent("fieldmap:jump", {
          bubbles: true, detail: { place: p, target: target }
        }));
        target.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "center" });
        target.classList.add("is-flagged");
        setTimeout(function () { target.classList.remove("is-flagged"); }, 2200);
      });
    }

    if (!quiet) {
      state.view = "auto";
      syncViewButtons();
    }
  }

  /* ------------------------------ arrow keys ------------------------------ */
  // Left/right walk the visible pins in the order they appear in PLACES, so
  // keyboard users can tour the map without tabbing through everything.

  host.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && state.selected) { select(null); return; }
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var focused = markers.filter(function (m) { return m.node === document.activeElement; })[0];
    if (!focused) return;
    e.preventDefault();
    var list = markers.filter(function (m) { return visible(m.place); });
    var i = list.indexOf(focused);
    var next = list[(i + (e.key === "ArrowRight" ? 1 : -1) + list.length) % list.length];
    if (next) next.node.focus();
  });

  build();

  window.FieldMap = {
    select: function (id) {
      var p = window.PLACES.filter(function (x) { return x.id === id; })[0];
      if (!p) return;
      if (!visible(p)) { state.kind = "all"; state.wish = true; render(); }
      select(p);
      flyTo(boundsOf([p], 0.25, p.kind === "dive" ? 0.35 : 1.6));
      var m = markers.filter(function (x) { return x.place === p; })[0];
      if (m) m.node.focus();
    }
  };
})();
