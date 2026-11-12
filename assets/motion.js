/* Motion layer for the portfolio (no dependencies, no globals).
   - scroll-reveal for cards and section headings
   - animated KPI counters on first reveal
   - chart entry animations: on first reveal, and again whenever a filter is used
   - soft page transitions between portfolio pages
   Everything is skipped when the visitor prefers reduced motion. */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) { root.classList.add("rm"); return; }
  root.classList.add("mo");

  /* chart animations after a deliberate interaction (not on hover or resize) */
  var pulseT;
  function pulse() { root.classList.add("anim"); clearTimeout(pulseT); pulseT = setTimeout(function () { root.classList.remove("anim"); }, 950); }
  function isControl(t) { return t && t.closest && !t.closest(".themebtn") && t.closest("button,select,input,.hit,tr,th,td.cellhit,.hm td"); }
  document.addEventListener("click", function (e) { if (isControl(e.target)) pulse(); }, true);
  document.addEventListener("change", pulse, true);
  document.addEventListener("input", function (e) { if (e.target && e.target.type === "range") pulse(); }, true);
  document.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && isControl(e.target)) pulse(); }, true);

  /* counters: animate the first number in a KPI value, keep prefix/suffix and precision */
  function countUp(node) {
    var full = node.textContent, m = full.match(/\d[\d,]*(\.\d+)?/);
    if (!m || node.dataset.counted) return; node.dataset.counted = "1";
    var raw = m[0], target = parseFloat(raw.replace(/,/g, "")), dec = (raw.split(".")[1] || "").length, commas = raw.indexOf(",") >= 0;
    if (!isFinite(target) || target === 0) return;
    var pre = full.slice(0, m.index), post = full.slice(m.index + raw.length), t0 = null, last = full, dur = 750;
    function fmt(v) { var s = v.toFixed(dec); if (commas) { var p = s.split("."); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","); s = p.join("."); } return pre + s + post; }
    function step(ts) {
      if (node.textContent !== last) return;            // the dashboard re-rendered this value: stop
      if (t0 == null) t0 = ts; var k = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      last = k < 1 ? fmt(target * e) : full; node.textContent = last;
      if (k < 1) requestAnimationFrame(step);
    }
    last = fmt(0); node.textContent = last; requestAnimationFrame(step);
  }

  /* scroll reveal */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return; var n = en.target; io.unobserve(n);
      n.classList.add("in", "in-now");
      n.querySelectorAll(".kpi .v, .stat b, .big, .count").forEach(countUp);
      if (n.matches(".kpi, .stat")) { var v = n.querySelector(".v, b"); if (v) countUp(v); }
      setTimeout(function () { n.classList.remove("rv", "in", "in-now"); n.style.transitionDelay = ""; }, 1100);
    });
  }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
  function tag() {
    var sel = "main .card, main h2.sec, main .secsub, main > h2, .hero > *, .hero2 > *, .flow .step";
    var nodes = [].slice.call(document.querySelectorAll(sel)).filter(function (n) { return !n.closest(".filters") && !(n.parentElement && n.parentElement.closest(".card")); });
    var vh = innerHeight, rowTop = null, k = 0;
    nodes.forEach(function (n) {
      var r = n.getBoundingClientRect();
      if (rowTop !== null && Math.abs(r.top - rowTop) < 8) k++; else { k = 0; rowTop = r.top; }
      n.classList.add("rv"); n.style.transitionDelay = Math.min(k * 70, 280) + "ms";
      io.observe(n);
    });
  }
  tag();

  /* page transitions for links inside the portfolio */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var href = a.getAttribute("href");
    if (a.target === "_blank" || a.hasAttribute("download") || !href || href.charAt(0) === "#" || /^(mailto:|tel:|https?:)/i.test(href)) return;
    if (!/\.html($|[?#])|\/$/.test(href)) return;
    e.preventDefault(); root.classList.add("leaving");
    setTimeout(function () { location.href = a.href; }, 150);
  });
  addEventListener("pageshow", function () { root.classList.remove("leaving"); });
})();
