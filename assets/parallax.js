(function () {
  "use strict";

  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!(window.matchMedia && window.matchMedia("(pointer: fine)").matches)) return;

  var bg = document.querySelector(".topo-bg");
  if (!bg) return;

  var raf = null;

  window.addEventListener("mousemove", function (e) {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      var x = (e.clientX / window.innerWidth - 0.5) * 2;
      var y = (e.clientY / window.innerHeight - 0.5) * 2;
      bg.style.setProperty("--parallax-x", x.toFixed(3));
      bg.style.setProperty("--parallax-y", y.toFixed(3));
      raf = null;
    });
  });
})();
