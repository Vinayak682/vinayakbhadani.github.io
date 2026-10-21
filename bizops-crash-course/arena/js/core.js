/* Planning Arena core: utilities, saved progress, XP and ranks, router, charts, forecasting maths and the quiz widget. */
(function () {
  "use strict";
  const PA = window.PA = { modules: [], games: {}, bank: [], cards: [] };

  /* ---------- utilities ---------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmt = (n, d) => (n == null || !isFinite(n)) ? "–" : Number(n).toLocaleString("en-US", { maximumFractionDigits: d || 0, minimumFractionDigits: d || 0 });
  const pct = (n, d) => (n == null || !isFinite(n)) ? "–" : (n * 100).toFixed(d == null ? 1 : d) + "%";
  const sgn = (n, f) => (n > 0 ? "+" : n < 0 ? "−" : "") + (f || fmt)(Math.abs(n));
  const money = (n, d) => (n < 0 ? "−$" : "$") + fmt(Math.abs(n), d);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const sum = a => a.reduce((s, x) => s + (x || 0), 0);
  const mean = a => a.length ? sum(a) / a.length : 0;
  const sd = a => { const m = mean(a); return Math.sqrt(mean(a.map(x => (x - m) * (x - m)))); };
  function rng(seed) { let a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function gauss(r) { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function shuffle(a, r) { r = r || Math.random; const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  /* inverse standard normal CDF (Acklam) */
  function zOf(p) {
    const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
    const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
    const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
    const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
    const pl = 0.02425; let q, r;
    if (p < pl) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    if (p > 1 - pl) { q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    q = p - 0.5; r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  function normPdf(x) { return Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI); }
  function normCdf(x) { const t = 1 / (1 + 0.2316419 * Math.abs(x)); const d = normPdf(x); const p = d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429)))); return x > 0 ? 1 - p : p; }
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  /* Z rounded the way the standard table shows it, so worked numbers match a hand calculation */
  const ZTAB = [[0.8, 0.84], [0.85, 1.04], [0.9, 1.28], [0.95, 1.65], [0.975, 1.96], [0.98, 2.05], [0.99, 2.33], [0.995, 2.58], [0.999, 3.09]];
  function zr(p) { const hit = ZTAB.find(z => Math.abs(z[0] - p) < 1e-6); return hit ? hit[1] : Math.round(zOf(p) * 100) / 100; }
  PA.u = { zr, $, $$, esc, fmt, pct, sgn, money, clamp, sum, mean, sd, rng, gauss, shuffle, hash, zOf, normPdf, normCdf, MONTHS };

  /* ---------- icons ---------- */
  const IC = {
    map: '<path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/>',
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
    cards: '<rect x="3" y="7" width="13" height="14" rx="2"/><path d="M8 3h11a2 2 0 0 1 2 2v12"/>',
    cap: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
    bot: '<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4M9 14h.01M15 14h.01"/>',
    wave: '<path d="M2 12c2-3 3-3 4 0s2 3 4 0 3-7 6-7 4 8 6 8"/>',
    box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/>',
    table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.6c2 .7 3.5 2.4 3.5 5.4"/>',
    flame: '<path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3.6 2-4.6 0 2 1 3 2 3 0-4-1-6 1-9.4z"/>',
    medal: '<circle cx="12" cy="15" r="6"/><path d="M8 3l4 6 4-6M12 12v6M10 14l2-2"/>',
    check: '<path d="M4 12l5 5L20 6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    play: '<path d="M7 4l13 8-13 8z"/>',
    gavel: '<path d="M14 4l6 6M11 7l6 6M5 19l7-7M3 21h8"/><path d="M12.5 5.5l6 6-2.5 2.5-6-6z"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2 6"/><path d="M20 4v7h-7"/>'
  };
  const STAR = '<path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z"/>';
  PA.icon = n => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (IC[n] || "") + "</svg>";
  PA.stars = (n, max) => '<span class="stars" aria-label="' + n + ' of ' + (max || 3) + ' stars">' + Array.from({ length: max || 3 }, (_, i) => '<svg viewBox="0 0 24 24" fill="currentColor" class="' + (i < n ? "on" : "") + '">' + STAR + "</svg>").join("") + "</span>";
  PA.bigStars = n => '<span class="bigstars">' + [0, 1, 2].map(i => '<svg viewBox="0 0 24 24" fill="currentColor" class="' + (i < n ? "on" : "") + '">' + STAR + "</svg>").join("") + "</span>";

  /* ---------- saved progress ---------- */
  const KEY = "planning-arena-v1";
  const fresh = () => ({ xp: 0, stars: {}, best: {}, runs: {}, cards: {}, badges: {}, streak: { last: "", n: 0 }, daily: {}, name: "", reviews: 0, exam: null });
  let S;
  try { S = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { S = fresh(); }
  PA.S = S;
  PA.save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable: progress lasts for this visit only */ } };
  PA.reset = () => { const keep = S.name; Object.keys(S).forEach(k => delete S[k]); Object.assign(S, fresh(), { name: keep }); PA.save(); hud(); };
  const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  PA.today = today;

  /* ---------- ranks, XP, badges ---------- */
  PA.RANKS = [[0, "Trainee Planner"], [150, "Junior Analyst"], [400, "Demand Analyst"], [800, "Senior Planner"], [1400, "S&OP Lead"], [2200, "Planning Director"], [3200, "Chief Supply Chain Officer"]];
  PA.rankOf = xp => { let i = 0; PA.RANKS.forEach((r, k) => { if (xp >= r[0]) i = k; }); return i; };
  PA.BADGES = [
    ["first", "First Blood", "Clear your first boss check", "flag"],
    ["pareto", "Pareto Pro", "3 stars on ABC classification", "table"],
    ["botslayer", "Bot Slayer", "Finish 1st in Beat the Bots", "bot"],
    ["whip", "Whip Tamer", "Beat the bot team's cost in the Beer Game", "wave"],
    ["neverout", "Never Out", "Fill rate of 99% or more in ROP Survival", "box"],
    ["lean", "Lean Machine", "Beat Textbook Tara's cost in ROP Survival", "bolt"],
    ["speed", "Speed Demon", "Score 180+ in Rapid Fire", "flame"],
    ["sprinter", "ABC Sprinter", "A perfect ABC Sprint", "layers"],
    ["detective", "Detective", "Solve 8+ cases in Forecast Detective", "search"],
    ["boardroom", "Boardroom Ready", "Best call in all 3 S&OP rounds", "gavel"],
    ["cards50", "Card Shark", "Review 50 flashcards", "cards"],
    ["streak3", "On Fire", "A 3-day streak", "flame"],
    ["campaign", "Campaign Clear", "At least 1 star in all 17 modules", "map"],
    ["perfect", "Perfectionist", "3 stars in all 17 modules", "medal"],
    ["certified", "Certified", "Pass the final exam", "cap"]
  ];
  function touchStreak() {
    const t = today(); if (S.streak.last === t) return;
    const y = new Date(); y.setDate(y.getDate() - 1);
    const ys = y.getFullYear() + "-" + String(y.getMonth() + 1).padStart(2, "0") + "-" + String(y.getDate()).padStart(2, "0");
    S.streak.n = S.streak.last === ys ? S.streak.n + 1 : 1; S.streak.last = t;
    if (S.streak.n >= 3) PA.award("streak3");
  }
  PA.addXP = (n, why) => {
    if (!n) return;
    const before = PA.rankOf(S.xp); S.xp += Math.round(n); touchStreak(); PA.save(); hud();
    toast("<b>+" + Math.round(n) + " XP</b> " + esc(why || ""));
    const after = PA.rankOf(S.xp);
    if (after > before) setTimeout(() => levelUp(after), 500);
  };
  PA.award = id => {
    if (S.badges[id]) return; const b = PA.BADGES.find(x => x[0] === id); if (!b) return;
    S.badges[id] = today(); PA.save();
    toast(PA.icon(b[3]) + " Badge unlocked: <b>" + esc(b[1]) + "</b>");
    setTimeout(() => PA.addXP(25, "badge bonus"), 400);
  };
  PA.totalStars = () => sum(Object.values(S.stars));
  PA.checkCampaign = () => {
    const ids = PA.modules.map(m => m.id);
    if (ids.length && ids.every(i => (S.stars[i] || 0) >= 1)) PA.award("campaign");
    if (ids.length && ids.every(i => (S.stars[i] || 0) >= 3)) PA.award("perfect");
  };
  PA.recordRun = (game, score, higherBetter, extra) => {
    const runs = S.runs[game] = S.runs[game] || [];
    runs.push(Object.assign({ s: score, d: today() }, extra || {}));
    runs.sort((a, b) => higherBetter ? b.s - a.s : a.s - b.s); runs.length = Math.min(runs.length, 10);
    const prev = S.best[game]; const isBest = prev == null || (higherBetter ? score > prev : score < prev);
    if (isBest) S.best[game] = score; PA.save(); return isBest;
  };

  /* ---------- HUD, toast, modal, confetti ---------- */
  function hud() {
    const i = PA.rankOf(S.xp), cur = PA.RANKS[i], nxt = PA.RANKS[i + 1];
    $("#hud-rank").textContent = cur[1];
    $("#hud-xp").textContent = nxt ? fmt(S.xp) + " / " + fmt(nxt[0]) + " XP" : fmt(S.xp) + " XP · max rank";
    $("#hud-bar").style.width = (nxt ? (S.xp - cur[0]) / (nxt[0] - cur[0]) * 100 : 100) + "%";
    $("#hud-streak").textContent = S.streak.n || 0;
    $("#hud-stars").textContent = PA.totalStars();
  }
  PA.hud = hud;
  function toast(html) {
    const t = document.createElement("div"); t.className = "toast"; t.innerHTML = html; $("#toasts").appendChild(t);
    setTimeout(() => { t.style.transition = "opacity .4s"; t.style.opacity = "0"; setTimeout(() => t.remove(), 450); }, 2600);
  }
  PA.toast = toast;
  PA.modal = (html, onClose) => {
    const m = document.createElement("div"); m.className = "modal"; m.innerHTML = '<div class="card" role="dialog" aria-modal="true">' + html + '<button class="btn primary" type="button" data-close>Keep going</button></div>';
    document.body.appendChild(m);
    const close = () => { m.remove(); if (onClose) onClose(); };
    m.addEventListener("click", e => { if (e.target === m || e.target.closest("[data-close]")) close(); });
    $("[data-close]", m).focus();
  };
  function levelUp(i) {
    confetti();
    PA.modal('<span class="eyebrow">Promotion</span><div class="lv">' + (i + 1) + '</div><h2>' + esc(PA.RANKS[i][1]) + '</h2><p class="muted">You reached ' + fmt(PA.RANKS[i][0]) + " XP. " + (PA.RANKS[i + 1] ? "Next rank: " + esc(PA.RANKS[i + 1][1]) + " at " + fmt(PA.RANKS[i + 1][0]) + " XP." : "That's the top of the ladder.") + "</p>");
  }
  function confetti() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const c = document.createElement("canvas"); c.className = "confetti"; document.body.appendChild(c);
    const ctx = c.getContext("2d"), W = c.width = innerWidth, H = c.height = innerHeight;
    const cols = ["#2457d6", "#6a49d6", "#ffc65c", "#4ade9b", "#f472b6", "#22d3ee"];
    const P = Array.from({ length: 140 }, () => ({ x: W / 2 + (Math.random() - .5) * 120, y: H * .35, vx: (Math.random() - .5) * 13, vy: -Math.random() * 13 - 4, s: 4 + Math.random() * 6, c: cols[Math.floor(Math.random() * cols.length)], r: Math.random() * 6 }));
    const t0 = performance.now();
    (function f(t) {
      ctx.clearRect(0, 0, W, H);
      P.forEach(p => { p.vy += .35; p.x += p.vx; p.y += p.vy; p.r += .2; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * .6); ctx.restore(); });
      if (t - t0 < 1800) requestAnimationFrame(f); else c.remove();
    })(t0);
  }
  PA.confetti = confetti;

  /* ---------- charts ---------- */
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(es => es.forEach(e => { const el = e.target; if (el._draw && Math.abs(el.clientWidth - (el._w || 0)) > 4) el._draw(); })) : null;
  function niceScale(lo, hi, n) {
    const span = hi - lo || 1, raw = span / n, mag = Math.pow(10, Math.floor(Math.log10(raw))), r = raw / mag;
    const step = (r <= 1 ? 1 : r <= 2 ? 2 : r <= 2.5 ? 2.5 : r <= 5 ? 5 : 10) * mag;
    return { min: Math.floor(lo / step) * step, max: Math.ceil(hi / step) * step, step };
  }
  const shortNum = v => { const a = Math.abs(v); if (a >= 1e6) return +(v / 1e6).toFixed(1) + "M"; if (a >= 1e4) return +(v / 1e3).toFixed(0) + "k"; if (a >= 1e3) return +(v / 1e3).toFixed(1) + "k"; return +v.toFixed(2) + ""; };
  function legendHTML(series) {
    const s = series.filter(x => x.legend !== false && x.name);
    return s.length ? '<div class="legend">' + s.map(x => '<span><i class="' + (x.dash ? "dash" : "") + '" style="background:' + x.color + ';color:' + x.color + '"></i>' + esc(x.name) + "</span>").join("") + "</div>" : "";
  }
  function attachTip(el, svg, cfg, xs, m, W, values) {
    const tip = document.createElement("div"); tip.className = "tip"; el.appendChild(tip);
    const cursor = svg.querySelector(".cursor");
    const move = ev => {
      const rect = svg.getBoundingClientRect(), px = (ev.clientX - rect.left) * (W / rect.width);
      let best = 0, bd = Infinity; xs.forEach((x, i) => { const d = Math.abs(x - px); if (d < bd) { bd = d; best = i; } });
      const rows = values(best).filter(r => r[1] != null && isFinite(r[1]));
      if (!rows.length) { tip.classList.remove("on"); return; }
      tip.innerHTML = "<b>" + esc(cfg.labels[best]) + "</b><br>" + rows.map(r => '<i style="background:' + r[2] + '"></i>' + esc(r[0]) + ": " + (cfg.yFmt || (v => fmt(v, Math.abs(v) < 10 ? 2 : 0)))(r[1])).join("<br>");
      const x = xs[best] * rect.width / W; tip.style.left = clamp(x, 70, rect.width - 70) + "px"; tip.style.top = (m.t * rect.height / svg.viewBox.baseVal.height + 4) + "px";
      tip.classList.add("on");
      if (cursor) { cursor.setAttribute("x1", xs[best]); cursor.setAttribute("x2", xs[best]); cursor.style.opacity = 1; }
    };
    svg.addEventListener("pointermove", move); svg.addEventListener("pointerdown", move);
    svg.addEventListener("pointerleave", () => { tip.classList.remove("on"); if (cursor) cursor.style.opacity = 0; });
  }
  PA.line = function line(el, cfg) {
    el._draw = () => line(el, cfg); el._w = el.clientWidth; if (ro && !el._obs) { ro.observe(el); el._obs = true; }
    const W = Math.max(280, el.clientWidth || 600), H = cfg.height || (W < 520 ? 220 : 270);
    const m = { l: cfg.ml || 48, r: cfg.mr || 14, t: 14, b: 30 };
    const N = cfg.labels.length, pw = W - m.l - m.r, ph = H - m.t - m.b;
    const vals = [];
    cfg.series.forEach(s => s.data.forEach(v => { if (v != null && isFinite(v)) vals.push(v); }));
    (cfg.hlines || []).forEach(h => vals.push(h.y));
    let lo = cfg.yMin != null ? cfg.yMin : Math.min.apply(null, vals), hi = cfg.yMax != null ? cfg.yMax : Math.max.apply(null, vals);
    if (cfg.yZero && lo > 0) lo = 0;
    if (!isFinite(lo) || !isFinite(hi)) { lo = 0; hi = 1; }
    if (hi === lo) { hi += 1; lo -= 1; }
    const ns = niceScale(lo, hi, W < 520 ? 4 : 5), y0 = cfg.yMin != null ? cfg.yMin : ns.min, y1 = cfg.yMax != null ? cfg.yMax : ns.max;
    const X = i => m.l + (N <= 1 ? pw / 2 : i * pw / (N - 1)), Y = v => m.t + (y1 - v) / (y1 - y0) * ph;
    const step = N > 1 ? pw / (N - 1) : pw;
    const yf = cfg.yTick || shortNum;
    let g = "";
    (cfg.bands || []).forEach(b => { const xa = Math.max(m.l, X(b.x0) - step / 2), xb = Math.min(W - m.r, X(b.x1) + step / 2); g += '<rect x="' + xa + '" y="' + m.t + '" width="' + Math.max(0, xb - xa) + '" height="' + ph + '" style="fill:' + (b.color || "var(--grid)") + ';opacity:' + (b.op || 0.5) + '"/>' + (b.label ? '<text x="' + (xa + 4) + '" y="' + (m.t + 12) + '" style="fill:' + (b.tc || "var(--muted)") + '">' + esc(b.label) + "</text>" : ""); });
    (cfg.hbands || []).forEach(b => { const ya = Y(Math.min(y1, b.y1)), yb = Y(Math.max(y0, b.y0)); g += '<rect x="' + m.l + '" y="' + ya + '" width="' + pw + '" height="' + Math.max(0, yb - ya) + '" style="fill:' + b.color + ';opacity:' + (b.op || 0.25) + '"/>' + (b.label ? '<text x="' + (m.l + 6) + '" y="' + (ya + 13) + '" style="fill:' + (b.tc || "var(--muted)") + '">' + esc(b.label) + "</text>" : ""); });
    for (let v = ns.min; v <= ns.max + 1e-9; v += ns.step) { if (v < y0 - 1e-9 || v > y1 + 1e-9) continue; const yy = Y(v); g += '<line class="gl" x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + yy + '" y2="' + yy + '"/><text x="' + (m.l - 6) + '" y="' + (yy + 4) + '" text-anchor="end">' + esc(yf(v)) + "</text>"; }
    const maxLab = Math.max(2, Math.floor(pw / (cfg.xLabelW || 44))), every = cfg.xEvery || Math.ceil(N / maxLab);
    cfg.labels.forEach((l, i) => { if (i % every === 0 || (cfg.xLast && i === N - 1)) g += '<text x="' + X(i) + '" y="' + (H - 10) + '" text-anchor="middle">' + esc(l) + "</text>"; });
    g += '<line class="ax" x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + (m.t + ph) + '" y2="' + (m.t + ph) + '"/>';
    (cfg.vlines || []).forEach(v => { const xx = X(v.x) + (v.off || 0); g += '<line x1="' + xx + '" x2="' + xx + '" y1="' + m.t + '" y2="' + (m.t + ph) + '" style="stroke:' + (v.color || "var(--muted)") + ';stroke-dasharray:4 4"/>' + (v.label ? '<text x="' + (xx + 4) + '" y="' + (m.t + 11) + '" style="fill:' + (v.color || "var(--muted)") + '">' + esc(v.label) + "</text>" : ""); });
    cfg.series.forEach(s => {
      let d = "", pen = false, area = "", first = null, last = null;
      s.data.forEach((v, i) => {
        if (v == null || !isFinite(v)) { pen = false; return; }
        const xx = X(i), yy = Y(clamp(v, y0, y1));
        if (s.step && pen) d += "H" + xx.toFixed(1) + "V" + yy.toFixed(1); else d += (pen ? "L" : "M") + xx.toFixed(1) + " " + yy.toFixed(1);
        pen = true; if (first == null) first = i; last = i;
      });
      if (s.area && first != null) { const base = Y(Math.max(y0, Math.min(y1, s.areaBase != null ? s.areaBase : y0))); area = '<path d="' + d + "L" + X(last) + " " + base + "L" + X(first) + " " + base + 'Z" style="fill:' + s.color + ';opacity:' + (s.areaOp || 0.12) + '"/>'; }
      g += area + '<path d="' + d + '" fill="none" style="stroke:' + s.color + ";stroke-width:" + (s.width || 2.2) + (s.dash ? ";stroke-dasharray:" + s.dash : "") + '" stroke-linejoin="round" stroke-linecap="round"/>';
      if (s.dots) s.data.forEach((v, i) => { if (v != null && isFinite(v)) g += '<circle cx="' + X(i) + '" cy="' + Y(clamp(v, y0, y1)) + '" r="' + (s.r || 3) + '" style="fill:' + s.color + '"/>'; });
    });
    (cfg.hlines || []).forEach(h => { const yy = Y(h.y); g += '<line x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + yy + '" y2="' + yy + '" style="stroke:' + (h.color || "var(--muted)") + ';stroke-width:1.5;stroke-dasharray:' + (h.dash || "6 4") + '"/>' + (h.label ? '<text x="' + (W - m.r - 4) + '" y="' + (yy - 5) + '" text-anchor="end" style="fill:' + (h.color || "var(--muted)") + ';font-weight:600">' + esc(h.label) + "</text>" : ""); });
    (cfg.marks || []).forEach(k => { const xx = X(k.x), yy = Y(k.y); g += '<circle cx="' + xx + '" cy="' + yy + '" r="' + (k.r || 5) + '" style="fill:' + (k.color || "var(--bad)") + ';stroke:var(--surface);stroke-width:2"/>' + (k.label ? '<text x="' + clamp(xx, m.l + 30, W - m.r - 30) + '" y="' + (yy - 10) + '" text-anchor="middle" style="fill:' + (k.color || "var(--bad)") + ';font-weight:600">' + esc(k.label) + "</text>" : ""); });
    g += '<line class="cursor" x1="0" x2="0" y1="' + m.t + '" y2="' + (m.t + ph) + '" style="stroke:var(--muted);opacity:0"/>';
    el.innerHTML = (cfg.legend === false ? "" : legendHTML(cfg.series)) + '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(cfg.aria || "Line chart") + '">' + g + "</svg>";
    if (cfg.tip !== false) attachTip(el, $("svg", el), cfg, cfg.labels.map((_, i) => X(i)), m, W, i => cfg.series.filter(s => s.tip !== false).map(s => [s.name, s.data[i], s.color]));
  };
  PA.bars = function bars(el, cfg) {
    el._draw = () => bars(el, cfg); el._w = el.clientWidth; if (ro && !el._obs) { ro.observe(el); el._obs = true; }
    const W = Math.max(280, el.clientWidth || 600), H = cfg.height || (W < 520 ? 220 : 260);
    const rot = cfg.rotate && W < 640;
    const m = { l: cfg.ml || 48, r: cfg.line ? 42 : 14, t: 14, b: rot ? 64 : 30 };
    const N = cfg.labels.length, pw = W - m.l - m.r, ph = H - m.t - m.b, bw = pw / N;
    const series = cfg.series;
    const tot = i => cfg.stacked ? sum(series.map(s => Math.max(0, s.data[i] || 0))) : Math.max.apply(null, series.map(s => s.data[i] || 0));
    const neg = Math.min(0, Math.min.apply(null, series.map(s => Math.min.apply(null, s.data.map(v => v || 0)))));
    let hi = cfg.yMax != null ? cfg.yMax : Math.max.apply(null, cfg.labels.map((_, i) => tot(i)).concat((cfg.hlines || []).map(h => h.y)));
    const ns = niceScale(neg, hi || 1, 4), y0 = ns.min, y1 = cfg.yMax != null ? cfg.yMax : ns.max;
    const Y = v => m.t + (y1 - v) / (y1 - y0) * ph, yf = cfg.yTick || shortNum;
    let g = "";
    for (let v = ns.min; v <= y1 + 1e-9; v += ns.step) { const yy = Y(v); g += '<line class="gl" x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + yy + '" y2="' + yy + '"/><text x="' + (m.l - 6) + '" y="' + (yy + 4) + '" text-anchor="end">' + esc(yf(v)) + "</text>"; }
    const gw = cfg.stacked ? bw * 0.66 : bw * 0.74 / series.length;
    cfg.labels.forEach((l, i) => {
      let acc = 0;
      series.forEach((s, k) => {
        const v = s.data[i] || 0, col = (s.colors && s.colors[i]) || s.color;
        let x, ya, yb;
        if (cfg.stacked) { x = m.l + i * bw + (bw - gw) / 2; ya = Y(acc + v); yb = Y(acc); acc += v; }
        else { x = m.l + i * bw + bw * 0.13 + k * gw; ya = Y(Math.max(0, v)); yb = Y(Math.min(0, v)); }
        g += '<rect x="' + x.toFixed(1) + '" y="' + ya.toFixed(1) + '" width="' + Math.max(1, gw - 1).toFixed(1) + '" height="' + Math.max(0, yb - ya).toFixed(1) + '" rx="3" style="fill:' + col + '"/>';
        if (cfg.valueLabels && !cfg.stacked && W > 420) g += '<text x="' + (x + gw / 2) + '" y="' + (ya - 4) + '" text-anchor="middle" style="fill:var(--ink)">' + esc((cfg.vFmt || shortNum)(v)) + "</text>";
      });
      const lx = m.l + i * bw + bw / 2;
      const every = Math.ceil(N / Math.max(2, Math.floor(pw / (rot ? 18 : (cfg.xLabelW || 40)))));
      if (i % every === 0) g += rot ? '<text transform="translate(' + lx + "," + (m.t + ph + 10) + ') rotate(-40)" text-anchor="end">' + esc(l) + "</text>" : '<text x="' + lx + '" y="' + (H - 10) + '" text-anchor="middle">' + esc(l) + "</text>";
    });
    g += '<line class="ax" x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + Y(0) + '" y2="' + Y(0) + '"/>';
    (cfg.hlines || []).forEach(h => { const yy = Y(h.y); g += '<line x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + yy + '" y2="' + yy + '" style="stroke:' + (h.color || "var(--muted)") + ';stroke-width:1.5;stroke-dasharray:6 4"/>' + (h.label ? '<text x="' + (W - m.r - 4) + '" y="' + (yy - 5) + '" text-anchor="end" style="fill:' + (h.color || "var(--muted)") + ';font-weight:600">' + esc(h.label) + "</text>" : ""); });
    if (cfg.line) {
      const L = cfg.line, lmax = L.max || 100, Y2 = v => m.t + (lmax - v) / lmax * ph;
      let d = ""; L.data.forEach((v, i) => { d += (i ? "L" : "M") + (m.l + i * bw + bw / 2).toFixed(1) + " " + Y2(v).toFixed(1); });
      g += '<path d="' + d + '" fill="none" style="stroke:' + L.color + ';stroke-width:2.4"/>' + L.data.map((v, i) => '<circle cx="' + (m.l + i * bw + bw / 2) + '" cy="' + Y2(v) + '" r="3.2" style="fill:' + L.color + '"/>').join("");
      [0, 25, 50, 75, 100].forEach(v => { g += '<text x="' + (W - m.r + 6) + '" y="' + (Y2(v * lmax / 100) + 4) + '">' + v + "%</text>"; });
      (L.marks || []).forEach(h => { const yy = Y2(h.y); g += '<line x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + yy + '" y2="' + yy + '" style="stroke:' + h.color + ';stroke-dasharray:5 4;stroke-width:1.4"/><text x="' + (m.l + 6) + '" y="' + (yy - 5) + '" style="fill:' + h.color + ';font-weight:600">' + esc(h.label) + "</text>"; });
    }
    el.innerHTML = (cfg.legend === false ? "" : legendHTML(series.concat(cfg.line && cfg.line.name ? [cfg.line] : []))) + '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(cfg.aria || "Bar chart") + '">' + g + "</svg>";
    if (cfg.tip !== false) attachTip(el, $("svg", el), cfg, cfg.labels.map((_, i) => m.l + i * bw + bw / 2), m, W, i => series.map(s => [s.name || cfg.vName || "Value", s.data[i], (s.colors && s.colors[i]) || s.color]).concat(cfg.line ? [[cfg.line.name || "Cumulative", cfg.line.data[i], cfg.line.color]] : []));
  };

  /* ---------- forecasting maths ---------- */
  const fc = PA.fc = {
    naive: y => y.map((_, t) => t ? y[t - 1] : null),
    snaive: (y, m) => { m = m || 12; return y.map((_, t) => t >= m ? y[t - m] : null); },
    ma: (y, n) => y.map((_, t) => t >= n ? mean(y.slice(t - n, t)) : null),
    wma: (y, w) => y.map((_, t) => { if (t < w.length) return null; let s = 0; w.forEach((wt, k) => { s += wt * y[t - 1 - k]; }); return s / sum(w); }),
    ses(y, a) { const f = Array(y.length).fill(null); let l = y[0]; for (let t = 1; t < y.length; t++) { f[t] = l; l = a * y[t] + (1 - a) * l; } f.next = l; return f; },
    holt(y, a, b) { const f = Array(y.length).fill(null); if (y.length < 3) return f; let l = y[1], tr = y[1] - y[0]; for (let t = 2; t < y.length; t++) { f[t] = l + tr; const ln = a * y[t] + (1 - a) * (l + tr); tr = b * (ln - l) + (1 - b) * tr; l = ln; } f.state = { l, tr }; return f; },
    hw(y, a, b, g, m) {
      m = m || 12; const f = Array(y.length).fill(null); if (y.length < 2 * m + 1) return f;
      const A1 = mean(y.slice(0, m)), A2 = mean(y.slice(m, 2 * m)); let tr = (A2 - A1) / m;
      const s = []; for (let i = 0; i < m; i++) { const c = (i - (m - 1) / 2) * tr; s[i] = (y[i] / (A1 + c) + y[i + m] / (A2 + c)) / 2; }
      const sm = mean(s); for (let i = 0; i < m; i++) s[i] /= sm;
      let l = A1 + ((m - 1) / 2) * tr;
      for (let t = m; t < y.length; t++) { const si = s[t % m]; f[t] = (l + tr) * si; const ln = a * y[t] / si + (1 - a) * (l + tr); tr = b * (ln - l) + (1 - b) * tr; s[t % m] = g * y[t] / ln + (1 - g) * si; l = ln; }
      f.state = { l, tr, s: s.slice(), n: y.length, m }; return f;
    },
    hwAhead(st, h) { return (st.l + h * st.tr) * st.s[(st.n + h - 1) % st.m]; },
    metrics(f, y, from, to) {
      let ae = 0, e = 0, A = 0, se = 0, ape = 0, n = 0, napes = 0;
      for (let t = from; t < to; t++) { if (f[t] == null || y[t] == null) continue; const er = f[t] - y[t]; ae += Math.abs(er); e += er; A += y[t]; se += er * er; n++; if (y[t] > 0) { ape += Math.abs(er) / y[t]; napes++; } }
      const wape = A ? ae / A : NaN;
      return { wape, acc: Math.max(0, 1 - wape), bias: A ? e / A : NaN, mae: n ? ae / n : NaN, rmse: n ? Math.sqrt(se / n) : NaN, mape: napes ? ape / napes : NaN, n };
    },
    tuneSES(y, from, to) { let best = [1e18, 0.3]; for (let a = 0.05; a < 0.96; a += 0.05) { const f = fc.ses(y, a); let e = 0; for (let t = from; t < to; t++) e += Math.abs(f[t] - y[t]); if (e < best[0]) best = [e, +a.toFixed(2)]; } return best[1]; },
    tuneHW(y, from, to) { const G = [0.05, 0.1, 0.2, 0.3, 0.5, 0.7]; let best = [1e18, [0.3, 0.1, 0.2]]; G.forEach(a => G.forEach(b => G.forEach(g => { const f = fc.hw(y, a, b, g); let e = 0; for (let t = from; t < to; t++) e += Math.abs(f[t] - y[t]); if (e < best[0]) best = [e, [a, b, g]]; }))); return best[1]; }
  };

  /* ---------- multiple-choice widget (boss checks, daily, exam) ---------- */
  PA.mcq = function (root, qs, opts) {
    opts = opts || {};
    const L = "ABCDEFG", ans = {};
    const order = qs.map(q => shuffle(q.o.map((_, i) => i)));
    root.innerHTML = qs.map((q, i) => '<div class="qz" data-i="' + i + '"><div class="qt">' + (qs.length > 1 ? (i + 1) + ". " : "") + q.q + '</div><div class="opts">' +
      order[i].map((oi, k) => '<button type="button" class="opt" data-o="' + oi + '"><span class="ol">' + L[k] + '</span><span>' + q.o[oi] + "</span></button>").join("") + '</div><div class="whyslot"></div></div>').join("");
    root.addEventListener("click", e => {
      const b = e.target.closest(".opt"); if (!b || b.disabled) return;
      const box = b.closest(".qz"), i = +box.dataset.i, q = qs[i], o = +b.dataset.o;
      if (ans[i] != null) return; ans[i] = o;
      $$(".opt", box).forEach(x => { x.disabled = true; const xo = +x.dataset.o; if (xo === q.a) x.classList.add("right"); else if (xo === o) x.classList.add("wrong"); });
      $(".whyslot", box).innerHTML = '<div class="why ' + (o === q.a ? "good" : "bad") + '"><b>' + (o === q.a ? "Correct. " : "Not quite. ") + "</b>" + q.why + "</div>";
      if (opts.onAnswer) opts.onAnswer(i, o === q.a);
      if (Object.keys(ans).length === qs.length && opts.onDone) opts.onDone(qs.filter((q, k) => ans[k] === q.a).length, qs.length);
    });
  };

  /* ---------- section helpers for modules ---------- */
  PA.sec = (k, title, body, id) => '<section class="msec"' + (id ? ' id="' + id + '"' : "") + '><div class="sh"><span class="k">' + k + "</span><h2>" + title + "</h2></div>" + body + "</section>";
  PA.ctl = (id, label, min, max, step, val, unit) => '<label class="ctl" for="' + id + '"><span class="lab"><span>' + label + '</span><b id="' + id + '-v"></b></span><input type="range" id="' + id + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"' + (unit ? ' data-unit="' + unit + '"' : "") + "></label>";
  PA.bindCtls = (root, ids, fn, fmtv) => {
    const read = () => { const v = {}; ids.forEach(id => { const el = $("#" + id, root); v[id] = +el.value; const out = $("#" + id + "-v", root); if (out) out.textContent = fmtv && fmtv[id] ? fmtv[id](+el.value) : fmt(+el.value, el.step && el.step.indexOf(".") >= 0 ? (el.step.split(".")[1] || "").length : 0) + (el.dataset.unit || ""); }); fn(v); };
    ids.forEach(id => $("#" + id, root).addEventListener("input", read)); read();
  };
  PA.kpi = (label, value, cls, id) => '<div class="kpi ' + (cls || "") + '"><span>' + label + '</span><b' + (id ? ' id="' + id + '"' : "") + ">" + value + "</b></div>";
  PA.chips = (name, items, on) => '<div class="chips" role="group" data-chips="' + name + '">' + items.map(it => '<button type="button" class="chip' + (it[0] === on ? " on" : "") + '" data-v="' + esc(it[0]) + '">' + it[1] + "</button>").join("") + "</div>";
  PA.onChips = (root, name, fn, multi) => {
    const box = $('[data-chips="' + name + '"]', root);
    box.addEventListener("click", e => { const b = e.target.closest(".chip"); if (!b) return; if (multi) b.classList.toggle("on"); else { $$(".chip", box).forEach(x => x.classList.remove("on")); b.classList.add("on"); } fn(multi ? $$(".chip.on", box).map(x => x.dataset.v) : b.dataset.v); });
  };

  /* ---------- views ---------- */
  const NAV = [["#/", "Map", "map", "home"], ["#/arena", "Arena", "trophy", "arena"], ["#/cards", "Cards", "cards", "cards"], ["#/exam", "Exam", "cap", "exam"], ["#/profile", "Profile", "user", "profile"]];
  const ACTS = [["I", "The Big Picture", "How product, information and money move, and where planning fits"], ["II", "Read the Demand", "Patterns hiding in the history: seasonality and trend"], ["III", "Forecast It", "Methods, choosing one, and measuring how wrong you were"], ["IV", "Stock It", "How much to hold, what it costs, and when to reorder"], ["V", "Tame the System", "Why small wobbles become big swings upstream"]];
  PA.ACTS = ACTS;
  const view = () => $("#view");
  function setNav(k) { $$("#topnav a, #dock a").forEach(a => a.classList.toggle("on", a.dataset.k === k)); }
  function nextModule() { return PA.modules.find(m => !(S.stars[m.id] >= 1)) || PA.modules.find(m => (S.stars[m.id] || 0) < 3); }
  PA.nextModule = nextModule;

  function dailyQ() { const pool = PA.allQuestions(); return pool[hash("daily" + today()) % pool.length]; }
  PA.allQuestions = () => PA.modules.reduce((a, m) => a.concat(m.boss.map(q => Object.assign({ m: m.id }, q))), []).concat(PA.bank);

  function home() {
    setNav("home");
    const nm = nextModule(), done = PA.modules.filter(m => S.stars[m.id] >= 1).length, ri = PA.rankOf(S.xp);
    const dq = dailyQ(), dd = S.daily[today()];
    let h = '<div class="view">';
    h += '<section class="hero"><div class="hero-l"><span class="eyebrow">Demand planning · forecasting · inventory · S&amp;OP</span><h1>Learn demand planning <span class="hl">by playing it.</span></h1>' +
      '<p class="sub">17 short modules, each with a picture, a worked example, a simulation you can break, and a boss check. Then take it to the Arena: forecast against bots, run a supply chain, and survive a season of stock-outs.</p>' +
      '<div class="row">' + (nm ? '<a class="btn primary" href="#/m/' + nm.id + '">' + PA.icon("play") + (done ? "Continue: " : "Start: ") + esc(nm.title) + "</a>" : '<a class="btn gold" href="#/exam">' + PA.icon("cap") + "Take the final exam</a>") + '<a class="btn" href="#/arena">' + PA.icon("trophy") + "Enter the Arena</a></div>" +
      '<a class="card flat" href="../project/" style="display:grid;gap:4px;text-decoration:none;color:var(--ink);border-color:var(--gold)"><span class="eyebrow">New · Planner Project</span><b style="font-family:var(--display)">Do the job for 8 weeks, then practise the answers out loud →</b><small class="muted">The Loop, hands-on missions that become interview stories, an Interview Studio and a job-description decoder. XP earned there counts here.</small></a></div>' +
      '<div class="card season"><span class="eyebrow">Your season</span><div class="big">' + esc(PA.RANKS[ri][1]) + '</div><div class="kpis">' + PA.kpi("XP", fmt(S.xp), "acc") + PA.kpi("Modules cleared", done + " / " + PA.modules.length) + PA.kpi("Stars", PA.totalStars() + " / " + PA.modules.length * 3, "warn") + PA.kpi("Streak", (S.streak.n || 0) + " day" + (S.streak.n === 1 ? "" : "s")) + "</div>" +
      '<div class="meter" aria-hidden="true"><i style="width:' + (PA.totalStars() / (PA.modules.length * 3) * 100) + '%;background:linear-gradient(90deg,var(--gold),var(--warn))"></i></div><small class="muted">Badges: ' + Object.keys(S.badges).length + " of " + PA.BADGES.length + ' · <a href="#/profile">see profile</a></small></div></section>';
    h += '<section class="card daily"><div class="sec-h"><div><span class="eyebrow">Daily challenge · ' + today() + '</span><h3>One question a day keeps the streak alive</h3></div><span class="pill gold">+25 XP</span></div><div id="daily"></div></section>';
    h += '<section class="stack"><div class="sec-h"><div><span class="eyebrow">The campaign</span><h2>17 modules in 5 acts</h2></div><span class="muted small">Recommended order: left to right, top to bottom.</span></div>';
    ACTS.forEach((a, ai) => {
      const ms = PA.modules.filter(m => m.act === ai + 1);
      h += '<div class="act"><div class="act-h"><span class="act-n">' + a[0] + '</span><div><h3>' + a[1] + '</h3><small class="muted">' + a[2] + '</small></div></div><div class="tiles">' +
        ms.map(m => { const st = S.stars[m.id] || 0; return '<a class="tile' + (st >= 3 ? " done" : "") + (nm && nm.id === m.id ? " next" : "") + '" href="#/m/' + m.id + '"><span class="tn"><span>Module ' + String(m.num).padStart(2, "0") + " · " + m.mins + " min</span>" + PA.stars(st) + "</span><b>" + esc(m.title) + "</b><small>" + esc(m.tag) + "</small></a>"; }).join("") + "</div></div>";
    });
    h += "</section>";
    h += '<section class="stack"><div class="sec-h"><div><span class="eyebrow">The Arena</span><h2>Games that make it stick</h2></div><a class="btn sm" href="#/arena">All games</a></div>' + gameGrid() + "</section>";
    h += '<section class="card tint stack"><span class="eyebrow">Why this works</span><div class="grid3">' +
      [["1 · See it", "Every idea starts with a picture and a worked example, not a definition."], ["2 · Break it", "Simulations let you push sliders until the idea fails. That's when it clicks."], ["3 · Prove it", "Boss checks and timed games force you to recall. Recall is what builds memory."], ["4 · Repeat it", "Flashcards come back on a spaced schedule, so you review just before you'd forget."]].map(x => '<div class="def"><b>' + x[0] + "</b><small>" + x[1] + "</small></div>").join("") + "</div></section>";
    h += "</div>";
    view().innerHTML = h;
    const dEl = $("#daily");
    if (dd) dEl.innerHTML = '<div class="why ' + (dd.ok ? "good" : "bad") + '"><b>' + (dd.ok ? "Done for today, and correct." : "Done for today.") + "</b> " + dq.why + ' Come back tomorrow for a new one.</div>';
    else PA.mcq(dEl, [dq], { onDone: c => { S.daily[today()] = { ok: c === 1 }; PA.save(); PA.addXP(c ? 25 : 5, "daily challenge"); } });
  }
  function gameGrid() {
    return '<div class="games">' + Object.keys(PA.games).filter(k => !PA.games[k].hidden).map(k => {
      const g = PA.games[k], best = S.best[k];
      return '<a class="game" href="#/' + (g.route || "play/" + k) + '"><span class="gi" style="background:' + g.color + '">' + PA.icon(g.icon) + "</span><b>" + esc(g.title) + "</b><small>" + g.desc + '</small><span class="pb"><span>' + esc(g.skill || "") + "</span><span>" + (best != null ? "Best: " + (g.fmtBest ? g.fmtBest(best) : fmt(best)) : "Not played") + "</span></span></a>";
    }).join("") + "</div>";
  }
  function arena() {
    setNav("arena");
    view().innerHTML = '<div class="view"><div class="stack"><span class="eyebrow">The Arena</span><h1>Compete, simulate, remember.</h1><p class="sub muted" style="font-size:1.05rem">Each game drills one skill from the campaign. Your rivals are reference strategies (bots) with fixed playbooks. Beat them, then beat your own best.</p></div>' + gameGrid() + "</div>";
  }
  function moduleView(id) {
    const i = PA.modules.findIndex(m => m.id === id); if (i < 0) return home();
    setNav("home");
    const m = PA.modules[i], prev = PA.modules[i - 1], next = PA.modules[i + 1], st = S.stars[m.id] || 0, act = ACTS[m.act - 1];
    let h = '<div class="view col">';
    h += '<div class="crumbs"><a href="#/">← Map</a><span>·</span><span>Act ' + act[0] + ": " + act[1] + "</span><span>·</span><span>Module " + String(m.num).padStart(2, "0") + " of " + PA.modules.length + "</span></div>";
    h += '<header class="mhead"><h1>' + esc(m.title) + '</h1><div class="meta"><span class="pill">' + PA.icon("clock").replace("<svg", '<svg style="width:12px;height:12px"') + m.mins + ' min</span><span class="pill gold" id="mstars">' + st + '/3 stars</span><span class="pill violet">up to 80 XP</span></div><p class="oneline">' + m.line + "</p></header>";
    h += m.html();
    h += PA.sec("★", "Interview angle", '<div class="card flat ask"><span class="eyebrow">They ask</span><span class="q">“' + m.ask[0] + '”</span><span class="a">' + m.ask[1] + "</span></div>");
    h += PA.sec("⚔", "Boss check", '<div class="card boss stack"><div class="boss-res"><div><b>Three questions. Each correct answer is a star.</b><br><small class="muted">Your best result is kept. Retry any time.</small></div><div id="boss-stars">' + PA.bigStars(st) + '</div></div><div id="boss" class="stack"></div><div class="row" id="boss-after"></div></div>', "boss-sec");
    h += PA.sec("✓", "Lock it in", '<ol class="takeaways">' + m.take.map(t => "<li><span>" + t + "</span></li>").join("") + '</ol><div class="mnemonic">' + m.mnem[0] + "<small>" + m.mnem[1] + "</small></div>");
    h += '<nav class="mnav">' + (prev ? '<a class="btn" href="#/m/' + prev.id + '">← ' + esc(prev.title) + "</a>" : '<a class="btn" href="#/">← Map</a>') + (next ? '<a class="btn primary" href="#/m/' + next.id + '">' + esc(next.title) + " →</a>" : '<a class="btn gold" href="#/exam">Final exam →</a>') + "</nav></div>";
    view().innerHTML = h;
    try { m.mount(view()); } catch (e) { console.error(e); }
    const runBoss = () => {
      $("#boss-after").innerHTML = "";
      PA.mcq($("#boss"), m.boss, {
        onDone: c => {
          const prevS = S.stars[m.id] || 0;
          $("#boss-stars").innerHTML = PA.bigStars(Math.max(c, prevS));
          $("#boss-after").innerHTML = '<span class="pill ' + (c === 3 ? "good" : c ? "gold" : "bad") + '">' + c + " / 3 correct</span>" + (c < 3 ? '<button class="btn sm" type="button" id="boss-retry">' + PA.icon("refresh") + "Retry</button>" : "") + (next ? '<a class="btn sm primary" href="#/m/' + next.id + '">Next module →</a>' : "");
          const rb = $("#boss-retry"); if (rb) rb.addEventListener("click", runBoss);
          if (c > prevS) {
            S.stars[m.id] = c; PA.save(); $("#mstars").textContent = c + "/3 stars";
            PA.addXP((c - prevS) * 20 + (c === 3 ? 20 : 0), m.title + " boss check");
            if (c === 3) PA.confetti();
            PA.award("first"); if (m.id === "abc" && c === 3) PA.award("pareto"); PA.checkCampaign();
          } else if (c) PA.toast("Score kept: your best is still " + prevS + " stars");
        }
      });
    };
    runBoss();
  }
  function profile() {
    setNav("profile");
    const ri = PA.rankOf(S.xp);
    let h = '<div class="view"><div class="stack"><span class="eyebrow">Profile</span><h1>' + esc(PA.RANKS[ri][1]) + '</h1><div class="kpis" style="max-width:720px">' + PA.kpi("Total XP", fmt(S.xp), "acc") + PA.kpi("Stars", PA.totalStars() + " / " + PA.modules.length * 3, "warn") + PA.kpi("Badges", Object.keys(S.badges).length + " / " + PA.BADGES.length) + PA.kpi("Cards reviewed", fmt(S.reviews || 0)) + PA.kpi("Best streak now", (S.streak.n || 0) + " days") + "</div></div>";
    h += '<div class="grid2"><section class="card stack"><h3>The rank ladder</h3><div class="ladder">' + PA.RANKS.map((r, k) => '<div class="rung' + (k <= ri ? " got" : "") + (k === ri ? " cur" : "") + '"><span class="ri">' + (k + 1) + "</span><span>" + esc(r[1]) + '</span><span class="mono small muted">' + fmt(r[0]) + " XP</span></div>").join("") + "</div></section>";
    h += '<section class="card stack"><h3>Personal bests</h3><div class="tbl"><table><thead><tr><th>Game</th><th class="n">Best</th><th class="n">Runs</th></tr></thead><tbody>' + Object.keys(PA.games).filter(k => !PA.games[k].hidden).map(k => { const g = PA.games[k]; return "<tr><td>" + esc(g.title) + '</td><td class="n">' + (S.best[k] != null ? (g.fmtBest ? g.fmtBest(S.best[k]) : fmt(S.best[k])) : "–") + '</td><td class="n">' + ((S.runs[k] || []).length) + "</td></tr>"; }).join("") + "</tbody></table></div>" +
      '<h3>Module stars</h3><div class="tbl"><table><tbody>' + PA.modules.map(m => '<tr><td><a href="#/m/' + m.id + '">' + String(m.num).padStart(2, "0") + " · " + esc(m.title) + '</a></td><td class="n">' + PA.stars(S.stars[m.id] || 0) + "</td></tr>").join("") + "</tbody></table></div></section></div>";
    h += '<section class="stack"><h2>Badges</h2><div class="badges">' + PA.BADGES.map(b => '<div class="badge' + (S.badges[b[0]] ? " got" : "") + '"><span class="bi">' + PA.icon(b[3]) + "</span><b>" + esc(b[1]) + "</b><small>" + esc(b[2]) + "</small>" + (S.badges[b[0]] ? '<span class="pill gold">' + S.badges[b[0]] + "</span>" : "") + "</div>").join("") + "</div></section>";
    h += '<section class="card tint stack"><h3>Start over</h3><p class="muted small">Progress lives in this browser only. Resetting clears XP, stars, scores, badges and flashcard boxes.</p><div><button class="btn" id="reset" type="button">Reset all progress</button></div></section></div>';
    view().innerHTML = h;
    $("#reset").addEventListener("click", e => { if (e.target.dataset.sure) { PA.reset(); profile(); PA.toast("Progress reset"); } else { e.target.dataset.sure = 1; e.target.textContent = "Tap again to confirm reset"; e.target.classList.add("gold"); } });
  }
  function playView(k) {
    const g = PA.games[k]; if (!g) return home();
    setNav(g.nav || "arena");
    view().innerHTML = '<div class="view"><div class="crumbs noprint"><a href="#/arena">← Arena</a><span>·</span><span>' + esc(g.skill || "") + '</span></div><header class="stack noprint"><div class="row"><span class="gi" style="width:44px;height:44px;border-radius:12px;display:grid;place-items:center;color:#fff;background:' + g.color + '">' + PA.icon(g.icon) + "</span><h1>" + esc(g.title) + '</h1></div><p class="muted" style="max-width:70ch">' + g.long + '</p></header><div id="game"></div></div>';
    g.mount($("#game"));
  }

  /* ---------- router ---------- */
  function route() {
    const hsh = location.hash.replace(/^#\/?/, ""), parts = hsh.split("/");
    if (PA._cleanup) { try { PA._cleanup(); } catch (e) { /* ignore */ } PA._cleanup = null; }
    if (parts[0] === "m" && parts[1]) moduleView(parts[1]);
    else if (parts[0] === "play" && parts[1]) playView(parts[1]);
    else if (parts[0] === "arena") arena();
    else if (parts[0] === "cards") playView("cards");
    else if (parts[0] === "exam") playView("exam");
    else if (parts[0] === "profile") profile();
    else home();
    window.scrollTo(0, 0);
    const t = $("h1", view()); document.title = (t && hsh ? t.textContent + " · " : "") + "Planning Arena";
  }
  PA.boot = function () {
    PA.modules.sort((a, b) => a.num - b.num);
    const nav = NAV.map(n => '<a href="' + n[0] + '" data-k="' + n[3] + '">' + PA.icon(n[2]) + "<span>" + n[1] + "</span></a>").join("");
    $("#topnav").innerHTML = nav; $("#dock").innerHTML = nav;
    let theme = null; try { theme = localStorage.getItem("pa-theme"); } catch (e) { /* none */ }
    if (theme) document.documentElement.dataset.theme = theme;
    $("#theme-btn").addEventListener("click", () => {
      const dark = document.documentElement.dataset.theme ? document.documentElement.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
      const t = dark ? "light" : "dark"; document.documentElement.dataset.theme = t;
      try { localStorage.setItem("pa-theme", t); } catch (e) { /* none */ }
      $$(".chart").forEach(c => c._draw && c._draw());
    });
    hud(); window.addEventListener("hashchange", route); route();
  };
})();
