/* Shared helpers for portfolio dashboards (no dependencies). */
const SVGNS = "http://www.w3.org/2000/svg";
const $ = id => document.getElementById(id);
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
function el(tag, attrs = {}, parent) { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
function txt(parent, x, y, s, attrs = {}) { const t = el("text", Object.assign({ x, y, fill: "var(--ink-2)", "font-size": 12 }, attrs), parent); t.textContent = s; return t; }
function h(tag, props = {}, ...kids) { const e = document.createElement(tag); for (const k in props) { if (k === "class") e.className = props[k]; else if (k === "text") e.textContent = props[k]; else if (k.startsWith("on")) e.addEventListener(k.slice(2), props[k]); else e.setAttribute(k, props[k]); } for (const c of kids) if (c != null) e.append(c); return e; }
function niceMax(v) { if (v <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(v))); const n = v / p; const m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10; return m * p; }
function niceTicks(lo, hi, n = 4) { const span = hi - lo || 1; const step0 = span / n; const p = Math.pow(10, Math.floor(Math.log10(step0))); const m = step0 / p; const step = (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p; const a = Math.floor(lo / step) * step, b = Math.ceil(hi / step) * step; const t = []; for (let v = a; v <= b + step / 2; v += step) t.push(+v.toFixed(12)); return t; }
function rr(x, y, w, h, r) { r = Math.min(r, h / 2, Math.max(w, 0)); if (w <= 0) return ""; return `M${x},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x}Z`; }
function rl(x, y, w, h, r) { r = Math.min(r, h / 2, Math.max(w, 0)); if (w <= 0) return ""; return `M${x + w},${y}H${x + r}Q${x},${y} ${x},${y + r}V${y + h - r}Q${x},${y + h} ${x + r},${y + h}H${x + w}Z`; }
function rt(x, y, w, h, r) { r = Math.min(r, w / 2, Math.max(h, 0)); if (h <= 0) return ""; return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`; }
const pctS = (v, d = 1) => v == null ? "n.m." : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v * 100).toFixed(d) + "%";
const pctP = (v, d = 1) => v == null ? "n.m." : (v < 0 ? "−" : "") + Math.abs(v * 100).toFixed(d) + "%";
function compact(v, prefix = "", d) {
  if (v == null) return "n.m.";
  const a = Math.abs(v), s = v < 0 ? "−" : "";
  let o;
  if (a >= 1e12) o = (a / 1e12).toFixed(d ?? 2) + "T";
  else if (a >= 1e9) o = (a / 1e9).toFixed(d ?? (a >= 1e11 ? 0 : 1)) + "B";
  else if (a >= 1e6) o = (a / 1e6).toFixed(d ?? (a >= 1e8 ? 0 : 1)) + "M";
  else if (a >= 1e3) o = (a / 1e3).toFixed(d ?? 1) + "K";
  else o = a.toFixed(d ?? 0);
  return s + prefix + o;
}

/* Tooltip: one shared element; content set with textContent only. */
let _tip;
function tipEl() { if (!_tip) { _tip = h("div", { class: "tip", role: "tooltip" }); document.body.appendChild(_tip); } return _tip; }
function showTip(ev, title, rows) {
  const tip = tipEl(); tip.replaceChildren(h("div", { class: "t", text: title }));
  for (const r of rows) {
    const l = h("span");
    if (r.color) { const k = h("i"); k.style.cssText = `width:12px;height:0;border-top:2px ${r.dash ? "dashed" : "solid"} ${r.color};display:inline-block`; l.appendChild(k); }
    l.append(document.createTextNode(r.label));
    const b = h("b", { text: r.value }); if (r.cls) b.className = r.cls;
    tip.appendChild(h("div", { class: "r" }, l, b));
  }
  moveTip(ev); tip.style.opacity = 1;
}
function moveTip(ev) {
  const tip = tipEl(); let x, y;
  if (ev.clientX != null && ev.type !== "focus") { x = ev.clientX; y = ev.clientY; }
  else { const r = ev.target.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top; }
  const w = tip.offsetWidth, hh = tip.offsetHeight; let lx = x + 14, ly = y - hh - 10;
  if (lx + w > innerWidth - 8) lx = x - w - 14; if (ly < 8) ly = y + 16;
  tip.style.left = Math.max(8, lx) + "px"; tip.style.top = ly + "px";
}
const hideTip = () => { if (_tip) _tip.style.opacity = 0; };
function bindTip(node, fn) {
  node.addEventListener("pointermove", e => showTip(e, ...fn()));
  node.addEventListener("pointerleave", hideTip);
  node.addEventListener("focus", e => showTip(e, ...fn()));
  node.addEventListener("blur", hideTip);
}
function onActivate(node, fn) { node.addEventListener("click", fn); node.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(e); } }); }

/* Theme toggle (per-viewer convenience only). */
function initTheme(onChange) {
  try { const th = localStorage.getItem("pf-theme"); if (th) document.documentElement.setAttribute("data-theme", th); } catch (e) { }
  const b = $("themeBtn"); if (!b) return;
  b.onclick = () => {
    const cur = document.documentElement.getAttribute("data-theme");
    const dark = cur ? cur === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.setAttribute("data-theme", dark ? "light" : "dark");
    try { localStorage.setItem("pf-theme", dark ? "light" : "dark"); } catch (e) { }
    onChange && onChange();
  };
}
function segBind(id, getter, setter, after) {
  $(id).querySelectorAll("button").forEach(b => b.onclick = () => { setter(b.dataset.v); after(); });
}
function segSync(id, val) { $(id).querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b.dataset.v === String(val))); }
function onResize(fn) { let t; addEventListener("resize", () => { clearTimeout(t); t = setTimeout(fn, 120); }); }
