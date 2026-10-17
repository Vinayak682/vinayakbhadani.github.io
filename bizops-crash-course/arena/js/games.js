/* Arena games: Beat the Bots, Beer Game, ROP Survival, ABC Sprint, Rapid Fire, Forecast Detective, S&OP Boardroom, flashcards, final exam. */
(function () {
  "use strict";
  const { $, $$, esc, fmt, pct, sgn, money, clamp, sum, mean, sd, rng, gauss, shuffle, MONTHS } = PA.u;
  const S = PA.S, fc = PA.fc, G = PA.games;
  const av = (init, color) => `<span class="av" style="background:${color}">${init}</span>`;
  const board = (rows, fmtS) => `<div class="board">${rows.map((r, i) => `<div class="brow${r.me ? " me" : ""}${i === 0 ? " p1" : ""}"><span class="pos">${i === 0 ? "🏆" : i + 1}</span>${av(r.init, r.color)}<span class="nm">${esc(r.name)}<small>${r.sub || ""}</small></span><span class="sc">${fmtS ? fmtS(r.s) : r.s}</span></div>`).join("")}</div>`;
  const ME = () => ({ name: S.name ? S.name + " (you)" : "You", init: (S.name || "Y").slice(0, 2).toUpperCase(), color: "linear-gradient(135deg,var(--accent),var(--violet))", me: true });

  /* ======================= BEAT THE BOTS ======================= */
  const PROFILES = [["Smartphone", [0.85, 0.80, 1.00, 0.92, 0.90, 0.88, 0.96, 1.02, 1.12, 1.00, 1.25, 1.30]], ["Laptop", [0.85, 0.80, 0.90, 0.85, 0.90, 0.95, 1.20, 1.35, 1.05, 0.90, 1.15, 1.10]], ["Game console", [0.70, 0.65, 0.75, 0.70, 0.70, 0.80, 0.80, 0.80, 0.85, 0.95, 1.90, 2.20]], ["Fitness wearable", [1.30, 1.00, 0.95, 0.90, 0.95, 0.95, 0.90, 0.85, 0.85, 0.90, 1.10, 1.35]]];
  G.bots = {
    title: "Beat the Bots", icon: "bot", color: "linear-gradient(135deg,var(--s1),var(--s5))", skill: "Forecasting · modules 04–10",
    desc: "Forecast 12 months of demand against six forecasting algorithms. Use market intel they can't see.",
    long: "You get two years of history for a product. Each round, forecast next month, lock it in, and see the actual. Six bots (each a real forecasting method) forecast the same months. Lowest WAPE wins. You have one edge: market intel the bots can't read. Some of it is real. Some isn't.",
    fmtBest: v => v.toFixed(1) + "% WAPE",
    mount(el) {
      let g;
      const setup = () => {
        const seed = Math.floor(Math.random() * 1e6), r = rng(seed), P = PROFILES[Math.floor(r() * PROFILES.length)], lvl = Math.round(400 + r() * 900), gr = 0.004 + r() * 0.012, pm = mean(P[1]);
        const y = []; for (let t = 0; t < 36; t++) y.push(lvl * Math.pow(1 + gr, t) * P[1][t % 12] / pm * (1 + 0.06 * gauss(r)));
        const promo = 24 + 2 + Math.floor(r() * 8); let hype = 24 + 1 + Math.floor(r() * 10); if (hype === promo) hype = promo === 34 ? 27 : promo + 1;
        y[promo] *= 1.3;
        g = { seed, P, y: y.map(Math.round), promo, hype, t: 24, mine: Array(36).fill(null), bots: {}, lab: y.map((_, i) => MONTHS[i % 12] + " Y" + (Math.floor(i / 12) + 1)) };
        PA.BOTS.forEach(b => g.bots[b.id] = Array(36).fill(null));
        round();
      };
      const botF = (id, t) => {
        const known = g.y.slice(0, t).concat([0]);
        const f = { naive: fc.naive, snaive: fc.snaive, ma: yy => fc.ma(yy, 3), ses: yy => fc.ses(yy, 0.3), holt: yy => fc.holt(yy, 0.3, 0.1), hw: yy => fc.hw(yy, 0.3, 0.1, 0.2) }[id](known);
        return f[t];
      };
      const standings = upto => {
        const rows = PA.BOTS.map(b => { const m = fc.metrics(g.bots[b.id], g.y, 24, upto); return { name: b.name, init: b.init, color: b.color, sub: b.method + (m.n ? " · bias " + (m.bias > 0 ? "+" : "") + pct(m.bias) : ""), s: m.n ? m.wape * 100 : null }; });
        const mm = fc.metrics(g.mine, g.y, 24, upto); rows.push(Object.assign(ME(), { sub: "Judgment + intel" + (mm.n ? " · bias " + (mm.bias > 0 ? "+" : "") + pct(mm.bias) : ""), s: mm.n ? mm.wape * 100 : null }));
        return rows.sort((a, b) => (a.s == null ? 999 : a.s) - (b.s == null ? 999 : b.s));
      };
      const round = () => {
        const t = g.t, k = t - 24, ly = g.y[t - 12], last = g.y[t - 1], ma3 = mean(g.y.slice(t - 3, t)), yoy = sum(g.y.slice(t - 12, t)) / sum(g.y.slice(t - 24, t - 12)) - 1;
        const intel = t === g.promo ? `<div class="intel"><b>Market intel:</b> the account team confirms a <b>two-week carrier promotion</b> in ${MONTHS[t % 12]}. Similar promotions added 25–35% last year.</div>` : t === g.hype ? `<div class="intel"><b>Market intel:</b> a sales manager says ${MONTHS[t % 12]} “will be massive, add at least 40%”. There's no promotion, launch or new listing behind it.</div>` : "";
        const lo = Math.round(ly * 0.5), hi = Math.round(ly * 1.9), start = Math.round(ly * (1 + yoy));
        el.innerHTML = `<div class="grid2" style="align-items:start"><div class="card stack"><div class="scoreline"><span class="pill violet">Round ${k + 1} / 12</span><span class="pill">${esc(g.P[0])} · season #${g.seed}</span></div>
          <h3>Forecast ${g.lab[t].replace(" Y3", "")} (year 3)</h3>${intel}
          <div class="kpis">${PA.kpi("Same month last year", fmt(ly))}${PA.kpi("Last month", fmt(last))}${PA.kpi("Average of last 3", fmt(ma3))}${PA.kpi("Last 12 months vs prior 12", (yoy > 0 ? "+" : "") + pct(yoy))}</div>
          <label class="ctl"><span class="lab"><span>Your forecast</span><b id="bb-v">${fmt(start)}</b></span><input type="range" id="bb-r" min="${lo}" max="${hi}" step="1" value="${start}"></label>
          <div class="row"><input type="number" id="bb-n" value="${start}" style="max-width:140px" aria-label="Your forecast"><button class="btn primary" id="bb-go" type="button">${PA.icon("check")}Lock it in</button></div>
          <div id="bb-res"></div></div>
          <div class="card stack"><h3>Leaderboard</h3><div id="bb-board">${board(standings(t), s => s == null ? "–" : s.toFixed(1) + "%")}</div><small class="muted">Cumulative WAPE on the months played so far. Lower is better.</small></div></div>
          <div class="card"><div class="chart" id="bb-chart"></div></div>`;
        const show = () => PA.line($("#bb-chart", el), { labels: g.lab, series: [{ name: "Actual", data: g.y.map((v, i) => i < g.t ? v : null), color: "var(--s0)", width: 2.6 }, { name: "Your forecasts", data: g.mine, color: "var(--accent)", dots: true, width: 2, dash: "4 3" }, { name: "Holt-Winters Hana", data: g.bots.hw, color: "var(--s1)", dash: "2 4", width: 1.6 }], bands: [{ x0: 24, x1: 35, color: "var(--accent-soft)", label: "year 3: the contest", op: 0.5 }], yZero: true, aria: "History, your forecasts and the actuals" });
        show();
        const r = $("#bb-r", el), n = $("#bb-n", el);
        r.addEventListener("input", () => { n.value = r.value; $("#bb-v", el).textContent = fmt(+r.value); });
        n.addEventListener("input", () => { r.value = n.value; $("#bb-v", el).textContent = fmt(+n.value || 0); });
        $("#bb-go", el).addEventListener("click", () => {
          const mine = Math.max(0, +n.value || 0); g.mine[t] = mine; PA.BOTS.forEach(b => g.bots[b.id][t] = botF(b.id, t)); g.t++;
          const a = g.y[t], e = mine - a;
          const best = PA.BOTS.map(b => [b, Math.abs(g.bots[b.id][t] - a)]).sort((p, q) => p[1] - q[1])[0];
          $("#bb-res", el).innerHTML = `<div class="why ${Math.abs(e) / a < 0.08 ? "good" : "bad"}"><b>Actual: ${fmt(a)}.</b> You were ${sgn(e)} (${pct(Math.abs(e) / a)} off). Closest bot: ${best[0].name} at ${fmt(g.bots[best[0].id][t])}. ${t === g.promo ? "The promotion was real: the bots couldn't know." : t === g.hype ? "There was no uplift. Unsupported optimism is how over-forecasting starts." : ""}</div><button class="btn primary" id="bb-next" type="button">${g.t < 36 ? "Next month →" : "See final results"}</button>`;
          $("#bb-go", el).disabled = true; $("#bb-board", el).innerHTML = board(standings(g.t), s => s == null ? "–" : s.toFixed(1) + "%"); show();
          $("#bb-next", el).addEventListener("click", () => g.t < 36 ? round() : finish());
        });
      };
      const finish = () => {
        const st = standings(36), pos = st.findIndex(r => r.me) + 1, me = st[pos - 1], mm = fc.metrics(g.mine, g.y, 24, 36), beaten = st.length - pos;
        const isBest = PA.recordRun("bots", +me.s.toFixed(1), false);
        const xp = 20 + beaten * 8 + (pos === 1 ? 30 : 0);
        el.innerHTML = `<div class="grid2" style="align-items:start"><div class="card stack"><span class="eyebrow">Final standings</span><div class="bigscore">${pos === 1 ? "1st 🏆" : pos + (pos === 2 ? "nd" : pos === 3 ? "rd" : "th")}</div><p>Your WAPE: <b>${pct(mm.wape)}</b> · bias <b>${(mm.bias > 0 ? "+" : "") + pct(mm.bias)}</b>${isBest ? ' · <span class="pill gold">personal best</span>' : ""}</p>
          <p class="small">${Math.abs(mm.bias) > 0.04 ? `Your bias shows you leaned ${mm.bias > 0 ? "high (over-forecasting)" : "low (under-forecasting)"} on balance. Check module 09.` : "Low bias: your misses were balanced."} ${pos > 3 ? "Tip: start from the same month last year × the growth rate, then adjust only for intel you can back up." : ""}</p>
          <div class="row"><button class="btn primary" id="bb-again" type="button">${PA.icon("refresh")}New product</button><a class="btn" href="#/arena">Arena</a></div></div>
          <div class="card">${board(st, s => s.toFixed(1) + "%")}</div></div><div class="card"><div class="chart" id="bb-fin"></div></div>`;
        PA.line($("#bb-fin", el), { labels: g.lab.slice(24), series: [{ name: "Actual", data: g.y.slice(24), color: "var(--s0)", width: 3 }, { name: "You", data: g.mine.slice(24), color: "var(--accent)", dots: true }].concat(PA.BOTS.filter(b => ["hw", "snaive", "naive"].indexOf(b.id) >= 0).map(b => ({ name: b.name, data: g.bots[b.id].slice(24), color: b.color, dash: "5 3" }))), aria: "Year 3 forecasts vs actual" });
        $("#bb-again", el).addEventListener("click", setup);
        PA.addXP(xp, "Beat the Bots: finished " + pos + " of 7"); if (pos === 1) { PA.award("botslayer"); PA.confetti(); }
      };
      el.innerHTML = `<div class="card stack" style="max-width:640px"><h3>How it works</h3><ul><li>12 rounds. Each round, forecast one month of year 3.</li><li>Your helpers: same month last year, last month, a 3-month average, and the year-over-year growth rate.</li><li>Watch for <b>market intel</b>. Use the real kind; ignore the hype.</li><li>Lowest cumulative WAPE wins. Finishing 1st unlocks a badge.</li></ul><div class="row"><button class="btn primary" id="bb-start" type="button">${PA.icon("play")}Start</button></div></div>`;
      $("#bb-start", el).addEventListener("click", setup);
    }
  };

  /* ======================= BEER GAME ======================= */
  G.beer = {
    title: "The Beer Game", icon: "wave", color: "linear-gradient(135deg,var(--s4),var(--s2))", skill: "Bullwhip effect · module 17",
    desc: "Run one tier of a four-tier supply chain for 30 weeks. Keep costs down while the whip cracks.",
    long: "A simplified version of MIT's classic supply chain game (the original uses two-week order and shipping delays). You run one tier: each week you see the order you received, your stock and backlog, and what's on its way, then you place an order upstream. Shipping takes two weeks and orders take one week to arrive. Holding a unit costs $0.50 a week; a unit of backlog costs $1.00. Three bots play the other tiers like typical first-time players. Beat their team cost.",
    fmtBest: v => money(v),
    mount(el) {
      let role = 1, seeCons = false, m, D, seed;
      const intro = () => {
        el.innerHTML = `<div class="card stack" style="max-width:680px"><h3>Pick your role</h3>${PA.chips("bg-role", PA.TIERS.map((t, i) => [String(i), t[0]]), "1")}<label class="row small"><input type="checkbox" id="bg-see"> Easy mode: let me see consumer demand (information sharing)</label>
          <ul class="small"><li>Each week: receive a shipment, ship what's owed downstream, then order upstream.</li><li>Your order arrives about 3 weeks later (1 week for the order, 2 weeks to ship), if upstream has stock.</li><li>Score = <b>team cost</b> over 30 weeks. The bots over-react; can you stay calm?</li></ul>
          <div class="row"><button class="btn primary" id="bg-start" type="button">${PA.icon("play")}Start week 1</button></div></div>`;
        PA.onChips(el, "bg-role", v => role = +v);
        $("#bg-start", el).addEventListener("click", () => { seeCons = $("#bg-see", el).checked; start(); });
      };
      const start = () => {
        seed = Math.floor(Math.random() * 1e6); const r = rng(seed), stepAt = 3 + Math.floor(r() * 4), size = 15 + Math.floor(r() * 16);
        D = []; for (let t = 0; t < 30; t++) D.push(Math.max(0, Math.round((t < stepAt ? 100 : 100 + size) + 4 * gauss(r))));
        m = PA.beerModel({ demand: D, weeks: 30, theta: 0.25, aS: 0.35, beta: 0.3, player: role });
        week();
      };
      const week = () => {
        m.begin(); const t = m.t, p = m.T[role], d = p.dem[t];
        const nxt = p.arr[t + 1] || 0, nxt2 = p.arr[t + 2] || 0;
        el.innerHTML = `<div class="grid2" style="align-items:start"><div class="card stack"><div class="scoreline"><span class="pill violet">Week ${t + 1} / 30</span><span class="pill" style="color:${PA.TIERS[role][1]}">You: ${PA.TIERS[role][0]}</span></div>
          <div class="kpis">${PA.kpi("Order received this week", fmt(d), "acc")}${PA.kpi("Shipment received", fmt(p.recv[t]))}${PA.kpi("You shipped", fmt(p.ship[t]))}${PA.kpi("Inventory", fmt(p.inv), p.inv > 300 ? "warn" : "good")}${PA.kpi("Backlog owed", fmt(p.back), p.back ? "bad" : "")}${PA.kpi("On order (not yet received)", fmt(p.on))}</div>
          <p class="small">Arriving next week: <b>${fmt(nxt)}</b> · in 2 weeks: <b>${fmt(nxt2)}</b>${seeCons ? ` · consumer demand this week: <b>${fmt(D[t])}</b>` : ""}</p>
          <label class="ctl"><span class="lab"><span>Your order upstream</span></span><input type="number" id="bg-o" value="${d}" min="0" aria-label="Order quantity"></label>
          <div class="chips">${[["d", "= order received"], ["-20", "−20"], ["-10", "−10"], ["+10", "+10"], ["+20", "+20"]].map(x => `<button type="button" class="chip" data-q="${x[0]}">${x[1]}</button>`).join("")}</div>
          <button class="btn primary" id="bg-go" type="button">${PA.icon("check")}Place order</button>
          <small class="muted">Your cost so far: ${money(p.cost)} · team: ${money(m.total())}</small></div>
          <div class="card"><div class="chart" id="bg-chart"></div><small class="muted">Watch for the moment orders received stop matching what you ordered: that's your pipeline catching up.</small></div></div>`;
        const lab = Array.from({ length: t + 1 }, (_, i) => "W" + (i + 1));
        PA.line($("#bg-chart", el), { labels: lab, series: [{ name: "Orders you received", data: p.dem.slice(0, t + 1), color: "var(--s0)", width: 2.4 }, { name: "Orders you placed", data: p.orders.slice(0, t), color: PA.TIERS[role][1], width: 2.4, dots: true }, { name: "Your inventory", data: p.invH.slice(0, t), color: "var(--s3)", dash: "4 3" }], yMin: 0, height: 230, aria: "Your orders and inventory" });
        const o = $("#bg-o", el);
        $$(".chip[data-q]", el).forEach(c => c.addEventListener("click", () => { const q = c.dataset.q; o.value = q === "d" ? d : Math.max(0, (+o.value || 0) + +q); }));
        $("#bg-go", el).addEventListener("click", () => { m.finish(+o.value || 0); m.t < 30 ? week() : finish(); });
      };
      const finish = () => {
        const bots = PA.beerModel({ demand: D, weeks: 30, theta: 0.25, aS: 0.35, beta: 0.3 }).run(), smart = PA.beerModel({ demand: D, weeks: 30, theta: 0.25, aS: 0.25, beta: 1, share: true }).run();
        const mine = m.total(), isBest = PA.recordRun("beer", Math.round(mine), false, { role });
        const rows = [Object.assign(ME(), { s: mine, sub: "Your team, you as " + PA.TIERS[role][0] }), { name: "Bot team (typical players)", init: "BT", color: "var(--s2)", s: bots.total(), sub: "Under-count the pipeline, forecast from orders" }, { name: "Smart policy (reference)", init: "SP", color: "var(--s3)", s: smart.total(), sub: "Counts the pipeline, shares sell-through" }].sort((a, b) => a.s - b.s);
        const beat = mine < bots.total();
        el.innerHTML = `<div class="grid2" style="align-items:start"><div class="card stack"><span class="eyebrow">30 weeks done</span><div class="bigscore">${money(mine)}</div><p>Team cost ${isBest ? '<span class="pill gold">personal best</span>' : ""}. Your own tier: <b>${money(m.T[role].cost)}</b>. Your order swing: <b>×${m.amp(role).toFixed(1)}</b> the consumer's.</p>
          <p class="small">${beat ? "You beat the typical-player team. You probably counted what was already on order instead of panicking when backlog appeared." : "The bot team did better. The usual trap: ordering big while backlogged, forgetting that earlier orders are still on their way. Then everything arrives at once."}</p>
          <div class="row"><button class="btn primary" id="bg-again" type="button">${PA.icon("refresh")}Play again</button><a class="btn" href="#/m/bullwhip">Review module 17</a></div></div><div class="card">${board(rows, s => money(s))}</div></div>
          <div class="card"><div class="chart" id="bg-fin"></div></div>`;
        PA.line($("#bg-fin", el), { labels: D.map((_, i) => "W" + (i + 1)), series: [{ name: "Consumer demand", data: D, color: "var(--s0)", width: 3 }].concat(PA.TIERS.map((t, i) => ({ name: t[0] + (i === role ? " (you)" : ""), data: m.T[i].orders, color: t[1], width: i === role ? 3.2 : 1.8 }))), yMin: 0, aria: "Orders by tier in your game" });
        $("#bg-again", el).addEventListener("click", intro);
        PA.addXP(30 + (beat ? 40 : 0), "Beer Game"); if (beat) PA.award("whip");
      };
      intro();
    }
  };

  /* ======================= ROP SURVIVAL ======================= */
  const ROPC = { d: 500, sd: 120, lt: 3, hold: 1, order: 400, lost: 60, weeks: 52, start: 2000 };
  function ropRun(rop, q, dem, lts, keep) {
    let oh = ROPC.start, on = 0, hold = 0, orders = 0, lost = 0, sold = 0, so = 0; const pipe = new Float64Array(ROPC.weeks + 12), ohH = [], lostH = [];
    for (let t = 0; t < ROPC.weeks; t++) {
      const a = pipe[t]; oh += a; on -= a;
      const d = dem[t], s = Math.min(oh, d); oh -= s; sold += s; const l = d - s; lost += l; if (l > 0) so++;
      hold += oh;
      let ip = oh + on, guard = 0;
      while (ip <= rop && guard++ < 20) { pipe[t + lts[t] + 1] += q; on += q; ip += q; orders++; }
      if (keep) { ohH.push(oh); lostH.push(l); }
    }
    const cost = hold * ROPC.hold + orders * ROPC.order + lost * ROPC.lost;
    return { cost, hold: hold * ROPC.hold, ord: orders * ROPC.order, lostC: lost * ROPC.lost, orders, lost, fill: sold / sum(dem), so, avg: hold / ROPC.weeks, ohH, lostH };
  }
  G.rop = {
    title: "ROP Survival", icon: "box", color: "linear-gradient(135deg,var(--s3),var(--s6))", skill: "Reorder point · safety stock · modules 12–16",
    desc: "Set a reorder point and order size, then survive 52 weeks of random demand at the lowest cost.",
    long: "Weekly demand averages 500 (standard deviation 120); lead time is 3 weeks. Stock is checked once a week, so an order placed today has to cover the lead time plus one review week. Holding costs $1 per unit per week, each order costs $400, and every lost sale costs $60. Choose your reorder point and order quantity, run the season, and see how you rank against four bots, including one that cheats with hindsight.",
    fmtBest: v => money(v),
    mount(el, opt) {
      let season = 1 + Math.floor(Math.random() * 999), chaos = false;
      const tara = [Math.round(ROPC.d * (ROPC.lt + 1) + 1.65 * ROPC.sd * Math.sqrt(ROPC.lt + 1)), Math.round(Math.sqrt(2 * ROPC.d * 52 * ROPC.order / (ROPC.hold * 52)))];
      el.innerHTML = `<div class="card sim"><div class="sim-h"><span class="pill violet" id="rs-season"></span><label class="row small"><input type="checkbox" id="rs-chaos"> Chaos mode: port congestion pushes lead time to 5 weeks in weeks 20–31</label></div>
        <div class="ctls">${PA.ctl("rs-rop", "Your reorder point", 500, 5000, 50, 1500)}${PA.ctl("rs-q", "Your order quantity", 200, 4000, 50, 1000)}</div>
        <div class="row"><button class="btn primary" id="rs-run" type="button">${PA.icon("play")}Run the season</button><button class="btn" id="rs-new" type="button">${PA.icon("refresh")}New season</button><span class="small muted">Hint: weekly checks mean covering LT + 1 week: ROP = d × (LT + 1) + Z × σ × √(LT + 1). EOQ = √(2DS ÷ H).</span></div>
        <div class="chart" id="rs-chart"></div><div class="kpis" id="rs-k"></div><div id="rs-board"></div></div>`;
      PA.bindCtls(el, ["rs-rop", "rs-q"], () => { });
      const label = () => $("#rs-season", el).textContent = "Season #" + season + (chaos ? " · chaos" : "");
      label();
      $("#rs-chaos", el).addEventListener("change", e => { chaos = e.target.checked; label(); });
      $("#rs-new", el).addEventListener("click", () => { season = 1 + Math.floor(Math.random() * 999); label(); $("#rs-board", el).innerHTML = ""; $("#rs-k", el).innerHTML = ""; $("#rs-chart", el).innerHTML = ""; });
      let anim = null; PA._cleanup = (prev => () => { if (anim) clearInterval(anim); if (prev) prev(); })(PA._cleanup);
      $("#rs-run", el).addEventListener("click", () => {
        const r = rng(season * 7919), dem = Array.from({ length: 52 }, () => Math.max(0, Math.round(ROPC.d + ROPC.sd * gauss(r)))), lts = dem.map((_, t) => chaos && t >= 20 && t <= 31 ? 5 : ROPC.lt);
        const rop = +$("#rs-rop", el).value, q = +$("#rs-q", el).value, me = ropRun(rop, q, dem, lts, true);
        let best = null; for (let a = 500; a <= 5000; a += 100) for (let b = 200; b <= 4000; b += 100) { const x = ropRun(a, b, dem, lts); if (!best || x.cost < best.cost) best = Object.assign(x, { a, b }); }
        const bots = [["Textbook Tara", "TT", "var(--s1)", tara[0], tara[1], "Weekly review: ROP = d(LT+1) + 1.65σ√(LT+1), Q = EOQ"], ["Hoarder Hank", "HH", "var(--s2)", 3500, 3000, "Never wants to run out"], ["Lean Lucy", "LL", "var(--s4)", 1500, 500, "No safety stock, small orders"]].map(b => Object.assign(ropRun(b[3], b[4], dem, lts), { name: b[0], init: b[1], color: b[2], sub: b[5] + ` (ROP ${fmt(b[3])}, Q ${fmt(b[4])})` }));
        const lab = dem.map((_, i) => "W" + (i + 1)); let k = 0;
        if (anim) clearInterval(anim);
        const frame = () => {
          k = Math.min(52, k + 2);
          PA.line($("#rs-chart", el), { labels: lab, series: [{ name: "On hand (end of week)", data: me.ohH.map((v, i) => i < k ? v : null), color: "var(--s1)", width: 2.4, area: true }, { name: "Demand", data: dem.map((v, i) => i < k ? v : null), color: "var(--muted)", width: 1.4, dash: "3 3" }, { name: "Lost sales", data: me.lostH.map((v, i) => i < k ? v : null), color: "var(--bad)", width: 2, step: true }], hlines: [{ y: rop, label: "your ROP", color: "var(--s2)" }], bands: chaos ? [{ x0: 20, x1: 31, color: "var(--warn-soft)", label: "congestion", op: 0.8 }] : [], yMin: 0, tip: k >= 52, aria: "Your inventory over the season" });
          if (k >= 52) { clearInterval(anim); anim = null; done(); }
        };
        const done = () => {
          $("#rs-k", el).innerHTML = PA.kpi("Total cost", money(me.cost), "acc") + PA.kpi("Holding", money(me.hold)) + PA.kpi("Ordering (" + me.orders + " orders)", money(me.ord)) + PA.kpi("Lost sales (" + fmt(me.lost) + " units)", money(me.lostC), me.lost ? "bad" : "good") + PA.kpi("Fill rate", pct(me.fill), me.fill >= 0.99 ? "good" : me.fill < 0.95 ? "bad" : "warn") + PA.kpi("Average on hand", fmt(me.avg));
          const rows = [Object.assign(ME(), { s: me.cost, sub: `ROP ${fmt(rop)}, Q ${fmt(q)} · fill ${pct(me.fill)}` })].concat(bots.map(b => ({ name: b.name, init: b.init, color: b.color, s: b.cost, sub: b.sub + " · fill " + pct(b.fill) })), [{ name: "Hindsight Hal", init: "H?", color: "var(--s5)", s: best.cost, sub: `Cheats: knew the season in advance (ROP ${fmt(best.a)}, Q ${fmt(best.b)}) · fill ${pct(best.fill)}` }]).sort((a, b) => a.s - b.s);
          $("#rs-board", el).innerHTML = `<h3>Season #${season} leaderboard</h3>` + board(rows, s => money(s)) + `<p class="say">${me.cost < bots[0].cost ? "You beat Textbook Tara." : "Textbook Tara beat you."} ${me.lost > 300 ? "Lost sales are the expensive part: at $60 a unit, a thin cushion costs more than the stock it saves." : me.avg > 2000 ? "Holding cost is eating you: a lot of stock sits around all year." : "Good balance between cushion and cost."} ${chaos ? "In chaos mode the textbook rule, built for a 3-week lead time, gets caught out when the lead time jumps. That's lead-time variability." : ""}</p>`;
          const isBest = PA.recordRun("rop", Math.round(me.cost), false);
          if (!opt || !opt.embedded || isBest) PA.addXP(me.cost < bots[0].cost ? 50 : 20, "ROP Survival season");
          if (me.fill >= 0.99) PA.award("neverout"); if (me.cost < bots[0].cost) PA.award("lean");
        };
        anim = setInterval(frame, 45); frame();
      });
    }
  };

  /* ======================= ABC SPRINT ======================= */
  const POOL = [["Flagship phone", 450, 700], ["Mid-range phone", 150, 260], ["Budget phone", 70, 120], ["Foldable phone", 700, 1000], ["Tablet", 200, 400], ["Laptop", 400, 900], ["Smartwatch", 100, 220], ["Fitness band", 25, 60], ["Earbuds", 30, 90], ["Headphones", 60, 180], ["Soundbar", 120, 300], ["Fast charger", 8, 20], ["USB-C cable", 2, 6], ["Phone case", 4, 12], ["Screen protector", 1.5, 4], ["Power bank", 12, 30], ["Stylus", 15, 35], ["Smart tag", 8, 15], ["Car mount", 5, 12], ["Memory card", 6, 20]];
  G.abc = {
    title: "ABC Sprint", icon: "layers", color: "linear-gradient(135deg,var(--s1),var(--s6))", skill: "ABC classification · module 11",
    desc: "12 random SKUs, 75 seconds. Classify every one as A, B or C with the 80/95 rule.",
    long: "Each SKU shows its annual consumption value and its share of the total. Sort them in your head (or tap Sort by value), add up the cumulative shares, and assign A (cumulative up to 80%), B (up to 95%) or C. +10 for each correct class, −3 for each wrong one, and a time bonus if you finish early.",
    fmtBest: v => fmt(v) + " pts",
    mount(el) {
      let items, pick, timer, left, sorted;
      const gen = () => {
        for (let tries = 0; tries < 50; tries++) {
          const r = Math.random, names = shuffle(POOL).slice(0, 12);
          const its = names.map(p => { const c = +(p[1] + r() * (p[2] - p[1])).toFixed(p[1] < 10 ? 1 : 0), u = Math.round(Math.exp(Math.log(300) + r() * (Math.log(30000) - Math.log(300))) / 10) * 10; return { n: p[0], u, c, v: u * c }; });
          const cl = PA.abcClassify(its, 0.8, 0.95);
          if (cl[0].cum <= 0.8 && cl.filter(x => x.cls === "A").length >= 2) return cl;
        }
        return PA.abcClassify([], 0.8, 0.95);
      };
      const intro = () => { el.innerHTML = `<div class="card stack" style="max-width:640px"><h3>Rules</h3><ul><li>A: cumulative share up to 80% · B: up to 95% · C: the rest.</li><li>The top item is always A.</li><li>75 seconds. Submit early for a time bonus.</li></ul><div class="row"><button class="btn primary" id="ab-go" type="button">${PA.icon("play")}Start sprint</button></div></div>`; $("#ab-go", el).addEventListener("click", start); };
      const start = () => {
        items = shuffle(gen()); pick = {}; left = 75; sorted = false;
        const tot = sum(items.map(x => x.v));
        const render = () => {
          const list = sorted ? items.slice().sort((a, b) => b.v - a.v) : items;
          $("#ab-grid", el).innerHTML = list.map(x => `<div class="sku" data-n="${esc(x.n)}"><b>${esc(x.n)}</b><span class="sv">${fmt(x.u)} × $${x.c} = <b>${money(x.v)}</b></span><span class="sv">Share of total: <b>${pct(x.v / tot)}</b></span><div class="abc">${["A", "B", "C"].map(c => `<button type="button" data-c="${c}" class="${pick[x.n] === c ? "on" : ""}">${c}</button>`).join("")}</div></div>`).join("");
        };
        el.innerHTML = `<div class="card sim"><div class="scoreline"><span>Time left: <b id="ab-t">75</b>s</span><span>Classified: <b id="ab-c">0</b> / 12</span><button class="btn sm" id="ab-sort" type="button">Sort by value</button></div><div class="timer"><i id="ab-bar" style="width:100%"></i></div><div class="skus" id="ab-grid"></div><div class="row"><button class="btn primary" id="ab-sub" type="button">Submit</button></div></div>`;
        render();
        $("#ab-grid", el).addEventListener("click", e => { const b = e.target.closest("button[data-c]"); if (!b) return; const n = b.closest(".sku").dataset.n; pick[n] = b.dataset.c; $$("button", b.parentElement).forEach(x => x.classList.toggle("on", x === b)); $("#ab-c", el).textContent = Object.keys(pick).length; });
        $("#ab-sort", el).addEventListener("click", () => { sorted = !sorted; render(); });
        $("#ab-sub", el).addEventListener("click", end);
        timer = setInterval(() => { left--; $("#ab-t", el).textContent = left; $("#ab-bar", el).style.width = (left / 75 * 100) + "%"; if (left <= 0) end(); }, 1000);
        PA._cleanup = () => clearInterval(timer);
      };
      const end = () => {
        clearInterval(timer);
        const ok = items.filter(x => pick[x.n] === x.cls).length, wrong = items.filter(x => pick[x.n] && pick[x.n] !== x.cls).length, all = Object.keys(pick).length === 12;
        const score = Math.max(0, ok * 10 - wrong * 3 + (all ? Math.floor(Math.max(0, left) / 2) : 0)), isBest = PA.recordRun("abc", score, true);
        const cl = items.slice().sort((a, b) => b.v - a.v);
        const rows = [Object.assign(ME(), { s: score, sub: ok + " of 12 correct" }), { name: "Planner Priya (bot)", init: "PP", color: "var(--s5)", s: 130, sub: "Fast and accurate" }, { name: "Analyst Arjun (bot)", init: "AA", color: "var(--s2)", s: 100, sub: "Solid" }, { name: "Intern Ivy (bot)", init: "II", color: "var(--s6)", s: 60, sub: "Still learning" }].sort((a, b) => b.s - a.s);
        el.innerHTML = `<div class="grid2" style="align-items:start"><div class="card stack"><span class="eyebrow">Sprint over</span><div class="bigscore">${score} pts</div><p>${ok} correct, ${wrong} wrong, ${12 - Object.keys(pick).length} skipped ${isBest ? '<span class="pill gold">personal best</span>' : ""}</p><div class="row"><button class="btn primary" id="ab-again" type="button">${PA.icon("refresh")}Again</button><a class="btn" href="#/m/abc">Module 11</a></div></div><div class="card">${board(rows)}</div></div>
          <div class="tbl"><table><thead><tr><th>SKU</th><th class="n">ACV</th><th class="n">Cumulative</th><th>Answer</th><th>Yours</th></tr></thead><tbody>${cl.map(x => `<tr${pick[x.n] !== x.cls ? ' class="hl"' : ""}><td>${esc(x.n)}</td><td class="n">${money(x.v)}</td><td class="n">${pct(x.cum)}</td><td class="cls-${x.cls}">${x.cls}</td><td>${pick[x.n] || "–"}</td></tr>`).join("")}</tbody></table></div>`;
        $("#ab-again", el).addEventListener("click", start);
        PA.addXP(Math.round(score / 3), "ABC Sprint"); if (ok === 12) PA.award("sprinter");
      };
      intro();
    }
  };

  /* ======================= RAPID FIRE ======================= */
  G.rapid = {
    title: "Rapid Fire", icon: "flame", color: "linear-gradient(135deg,var(--s2),var(--bad))", skill: "All modules",
    desc: "60 seconds, questions from every module. Streaks multiply your score.",
    long: "Answer as many questions as you can in 60 seconds. +10 for each correct answer, plus a combo bonus of +2 for every answer in your current streak (up to +10). A wrong answer resets the streak. Four bots have fixed benchmark scores.",
    fmtBest: v => fmt(v) + " pts",
    mount(el) {
      let pool, i, score, combo, right, total, left, timer, misses, lock;
      const intro = () => { el.innerHTML = `<div class="card stack" style="max-width:560px"><h3>Ready?</h3><p>Questions come from all 17 modules. Speed matters, but streaks matter more.</p><div class="row"><button class="btn primary" id="rf-go" type="button">${PA.icon("play")}Go</button></div></div>`; $("#rf-go", el).addEventListener("click", start); };
      const start = () => {
        pool = shuffle(PA.allQuestions()); i = 0; score = 0; combo = 0; right = 0; total = 0; left = 60; misses = [];
        el.innerHTML = `<div class="card sim" style="max-width:760px"><div class="scoreline"><span>Score <b id="rf-s">0</b></span><span class="combo" id="rf-c"></span><span><b id="rf-t">60</b>s</span></div><div class="timer"><i id="rf-bar" style="width:100%"></i></div><div id="rf-q"></div></div>`;
        timer = setInterval(() => { left--; $("#rf-t", el).textContent = left; $("#rf-bar", el).style.width = (left / 60 * 100) + "%"; if (left <= 0) end(); }, 1000);
        PA._cleanup = () => clearInterval(timer);
        ask();
      };
      const ask = () => {
        const q = pool[i % pool.length], ord = shuffle(q.o.map((_, k) => k)); lock = false;
        $("#rf-q", el).innerHTML = `<div class="qz" style="border:0;padding:0"><div class="qt">${q.q}</div><div class="opts">${ord.map((k, j) => `<button type="button" class="opt" data-o="${k}"><span class="ol">${"ABCD"[j]}</span><span>${q.o[k]}</span></button>`).join("")}</div></div>`;
        $$(".opt", el).forEach(b => b.addEventListener("click", () => {
          if (lock) return; lock = true; total++;
          const ok = +b.dataset.o === q.a;
          if (ok) { right++; score += 10 + Math.min(combo, 5) * 2; combo++; b.classList.add("right"); } else { combo = 0; b.classList.add("wrong"); $$(".opt", el).forEach(x => { if (+x.dataset.o === q.a) x.classList.add("right"); }); misses.push(q); }
          $("#rf-s", el).textContent = score; $("#rf-c", el).textContent = combo >= 2 ? "🔥 ×" + combo + " streak" : "";
          setTimeout(() => { i++; if (left > 0) ask(); }, ok ? 350 : 900);
        }));
      };
      const end = () => {
        clearInterval(timer); if (left < -1) return; left = -2;
        const isBest = PA.recordRun("rapid", score, true);
        const rows = [Object.assign(ME(), { s: score, sub: right + " / " + total + " correct" }), { name: "S&OP Lead Leo (bot)", init: "LL", color: "var(--s5)", s: 240, sub: "Benchmark" }, { name: "Senior Sara (bot)", init: "SS", color: "var(--s1)", s: 180, sub: "Benchmark" }, { name: "Analyst Arjun (bot)", init: "AA", color: "var(--s2)", s: 120, sub: "Benchmark" }, { name: "Intern Ivy (bot)", init: "II", color: "var(--s6)", s: 60, sub: "Benchmark" }].sort((a, b) => b.s - a.s);
        el.innerHTML = `<div class="grid2" style="align-items:start"><div class="card stack"><span class="eyebrow">Time!</span><div class="bigscore">${score}</div><p>${right} of ${total} correct (${total ? pct(right / total, 0) : "–"}) ${isBest ? '<span class="pill gold">personal best</span>' : ""}</p><div class="row"><button class="btn primary" id="rf-again" type="button">${PA.icon("refresh")}Again</button></div></div><div class="card">${board(rows)}</div></div>
          ${misses.length ? `<section class="stack"><h3>Review your misses</h3>${misses.slice(0, 10).map(q => `<div class="qz"><div class="qt">${q.q}</div><div class="why good"><b>${q.o[q.a]}.</b> ${q.why}</div></div>`).join("")}</section>` : ""}`;
        $("#rf-again", el).addEventListener("click", start);
        PA.addXP(Math.round(score / 4), "Rapid Fire"); if (score >= 180) PA.award("speed");
      };
      intro();
    }
  };

  /* ======================= FORECAST DETECTIVE ======================= */
  const CASES = [
    ["Carrier A's launch-week forecast was raised 30% because “stock was tight last year”. Allocation was cut anyway, and the carrier ordered the full amount.", "over", ["Shortage gaming: inflating to win allocation", "Censored demand", "Lagging model", "Sandbagging"], 0, "Inflating forecasts or orders to secure a bigger share of scarce supply is shortage gaming, one of the bullwhip causes."],
    ["Last March a one-off government order of 8,000 tablets stayed in the history. This March's statistical forecast is 7,000 above normal.", "over", ["Promotion double-counted", "One-off left in history", "Cannibalisation ignored", "New channel missed"], 1, "Uncleaned outliers teach the model a pattern that won't repeat. Clean, tag as an event, and keep it out of the baseline."],
    ["The old phone is still forecast at its usual run-rate, but its successor launches next month.", "over", ["Cannibalisation and lifecycle ignored", "Censored demand", "Sandbagging", "Order batching"], 0, "New models take demand from old ones. Plan the old model's depletion before launch."],
    ["Sales cut its forecast 15% every quarter, then beat quota every time.", "under", ["Lagging model", "Sandbagging", "Buffer stacking", "One-off left in"], 1, "Lowballing to beat a quota is sandbagging. Separate the forecast from the target and track bias by contributor."],
    ["Earbuds were out of stock for three weeks last August. History shows a weak August, so this August is forecast low again.", "under", ["Censored demand from stock-outs", "Hype", "Promotion double-counted", "Buffer stacking"], 0, "Recorded sales were capped by stock, not demand. Estimate true demand for stock-out periods before forecasting."],
    ["Marketing added a +20% uplift for the summer promotion on top of a baseline that already contained last summer's promotion spike.", "over", ["Promotion double-counted", "Sandbagging", "Censored demand", "Lagging model"], 0, "If the baseline already includes past promotion effects, adding the uplift again counts it twice. Clean promotions out of the baseline first."],
    ["Demand is growing about 4% a month, but the team uses a 6-month moving average.", "under", ["Hype", "Lagging model on a trend", "One-off left in", "Shortage gaming"], 1, "Moving averages and simple smoothing trail a trend, so they under-forecast growing products every month. Use a model with a trend term."],
    ["A new online channel opened in May, but nobody told demand planning.", "under", ["New channel missed", "Buffer stacking", "Promotion double-counted", "Cannibalisation"], 0, "Demand from a channel the plan doesn't know about shows up as a surprise. Collaboration (step 3 of the 6 Cs) exists to catch this."],
    ["The region adds a 5% buffer, the country adds 5%, and HQ adds 5% before loading.", "over", ["Buffer stacking", "Censored demand", "Lagging model", "Sandbagging"], 0, "1.05³ ≈ 1.158: almost 16% above the honest number. Hold one explicit buffer, ideally as safety stock."],
    ["Finance's annual budget figure, set well above the recent run-rate, was loaded as the forecast for the next quarter.", "over", ["Target used as a forecast", "Censored demand", "New channel missed", "Order batching"], 0, "A budget is what the business wants; a forecast is what will probably happen. Loading targets as forecasts usually biases high."]
  ];
  G.detective = {
    title: "Forecast Detective", icon: "search", color: "linear-gradient(135deg,var(--s5),var(--s4))", skill: "Over- and under-forecasting · module 10",
    desc: "Ten case files. Name the direction of the miss and the root cause.",
    long: "Each case describes a forecast that went wrong in a way planners see every year. Decide whether it was over- or under-forecast, then pick the root cause. Solve 8 or more to earn the Detective badge.",
    fmtBest: v => v + " / 10",
    mount(el, opt) {
      let order, k, solved, dir, cause;
      const start = () => { order = shuffle(CASES); k = 0; solved = 0; show(); };
      const show = () => {
        const c = order[k], ord = shuffle(c[2].map((_, i) => i)); dir = null; cause = null;
        el.innerHTML = `<div class="card sim" style="max-width:760px"><div class="scoreline"><span class="pill violet">Case ${k + 1} / 10</span><span>Solved: <b>${solved}</b></span></div><div class="intel" style="font-size:1rem">${c[0]}</div>
          <b class="small">1 · Direction</b><div class="chips" id="dt-dir"><button type="button" class="chip" data-v="over">Over-forecast</button><button type="button" class="chip" data-v="under">Under-forecast</button></div>
          <b class="small">2 · Root cause</b><div class="opts" id="dt-cause">${ord.map((i, j) => `<button type="button" class="opt" data-o="${i}"><span class="ol">${"ABCD"[j]}</span><span>${c[2][i]}</span></button>`).join("")}</div>
          <div class="row"><button class="btn primary" id="dt-go" type="button" disabled>Close the case</button></div><div id="dt-res"></div></div>`;
        const ready = () => $("#dt-go", el).disabled = !(dir && cause != null);
        $("#dt-dir", el).addEventListener("click", e => { const b = e.target.closest(".chip"); if (!b) return; $$("#dt-dir .chip", el).forEach(x => x.classList.remove("on")); b.classList.add("on"); dir = b.dataset.v; ready(); });
        $("#dt-cause", el).addEventListener("click", e => { const b = e.target.closest(".opt"); if (!b || b.disabled) return; $$("#dt-cause .opt", el).forEach(x => x.style.borderColor = ""); b.style.borderColor = "var(--accent)"; cause = +b.dataset.o; ready(); });
        $("#dt-go", el).addEventListener("click", () => {
          const okD = dir === c[1], okC = cause === c[3], ok = okD && okC; if (ok) solved++;
          $$("#dt-cause .opt", el).forEach(x => { x.disabled = true; if (+x.dataset.o === c[3]) x.classList.add("right"); else if (+x.dataset.o === cause) x.classList.add("wrong"); });
          $("#dt-go", el).remove();
          $("#dt-res", el).innerHTML = `<div class="why ${ok ? "good" : "bad"}"><b>${ok ? "Case closed." : "Not quite."}</b> It was an <b>${c[1]}-forecast</b>${okD ? "" : " (you said " + dir + ")"}. ${c[4]}</div><div class="row" style="margin-top:8px"><button class="btn primary" id="dt-next" type="button">${k < 9 ? "Next case →" : "See results"}</button></div>`;
          $("#dt-next", el).addEventListener("click", () => { k++; k < 10 ? show() : finish(); });
        });
      };
      const finish = () => {
        const isBest = PA.recordRun("detective", solved, true);
        el.innerHTML = `<div class="card stack" style="max-width:560px"><span class="eyebrow">Investigation complete</span><div class="bigscore">${solved} / 10</div><p>${solved >= 8 ? "Sharp. You'd spot these in a real review." : "Revisit the HOPED and SLICE lists in module 10, then try again."} ${isBest ? '<span class="pill gold">personal best</span>' : ""}</p><div class="row"><button class="btn primary" id="dt-again" type="button">${PA.icon("refresh")}New case files</button></div></div>`;
        $("#dt-again", el).addEventListener("click", start);
        if (!(opt && opt.embedded) || isBest) PA.addXP(solved * 4, "Forecast Detective"); if (solved >= 8) PA.award("detective");
      };
      el.innerHTML = `<div class="card stack" style="max-width:640px"><p>Ten cases, two calls each: direction and cause. No timer: think like an analyst.</p><div class="row"><button class="btn primary" id="dt-start" type="button">${PA.icon("search")}Open the first file</button></div></div>`;
      $("#dt-start", el).addEventListener("click", start);
    }
  };

  /* ======================= S&OP BOARDROOM ======================= */
  const ROUNDS = [
    { t: "Round 1 · The holiday flagship", brief: "Q4 plan for the flagship phone. Margin is $250 a unit. Units left unsold after the quarter get marked down at a loss of $120 each. Standard capacity is 100k; it can flex to 115k with overtime and air freight at an extra $15 a unit above 100k.",
      voices: [["Demand planning", "The statistical baseline is 95k."], ["Sales", "Make it 120k. There's a big carrier promotion coming."], ["Marketing", "The promotion is confirmed with one carrier only. Last time that added about 10k."], ["Supply", "100k standard, 115k maximum with flex."], ["Finance", "The budget assumes 110k."]],
      opts: [["Commit 95k: the baseline", 95], ["Commit 105k: baseline + the validated promotion", 105], ["Commit 115k: max flex, close to budget", 115], ["Commit 120k: what sales asked for", 120]],
      truth: "Actual demand: 104k.",
      calc: c => { const dem = 104, built = Math.min(c, 115), sold = Math.min(built, dem), left = built - sold, flex = Math.max(0, built - 100); return { v: sold * 250e3 - left * 120e3 - flex * 15e3, note: `${fmt(built)}k built, ${fmt(sold)}k sold, ${fmt(left)}k left over, ${fmt(Math.max(0, dem - built))}k demand missed` + (c > 115 ? ". Supply could only build 115k: the 120k plan was never feasible" : "") }; },
      react: ["Sales: “We left the promotion on the table.” About 9k units of demand went unserved.", "Everyone signs off: the one assumption that was validated, nothing extra. A tiny leftover, almost no lost sales.", "Finance hit its budget number on paper, then wrote down 11k phones.", "The plan was never buildable. Supply capped at 115k, and the carrier was promised units that didn't exist."] },
    { t: "Round 2 · End of life", brief: "The old model's successor launches in 8 weeks. Retailers and carriers hold 30k units (6 weeks of supply). Sell-through is 5k a week and falling about 10% a week since the announcement. Any unit still in the channel at launch costs about $100 in price protection or markdown. How big should the final production run be?",
      voices: [["Sales", "Build 25k so we hit the quarter."], ["Supply", "The line can run anything up to 40k."], ["Demand planning", "Look at the channel inventory before you decide."], ["Finance", "Price protection is coming out of our margin."]],
      opts: [["0: no final run", 0], ["10k", 10], ["25k", 25], ["40k", 40]],
      truth: "Over 8 weeks, sell-through at a 10% weekly decline adds up to about 28.5k. (A simplified model: a steady decline, channel stock spread evenly across accounts, no service stock.)",
      calc: c => { const dem = 5 * (1 - Math.pow(0.9, 8)) / 0.1, left = Math.max(0, 30 + c - dem); return { v: -left * 100e3, note: `${fmt(left, 1)}k units left in the channel at launch` }; },
      react: ["In this model, channel stock alone covers the remaining demand. Only about 1.5k units need a final promotion.", "Ten thousand more units that nobody will buy at full price.", "The quarter looks good in sell-in, then price protection eats it.", "A warehouse full of last year's phone."] },
    { t: "Round 3 · Allocation under shortage", brief: "Only 60k units of a hot model are available. Orders: Carrier A 50k (ordered first), Retailer B 30k, Carrier C 25k. Weekly sell-through: A 4k, B 3k, C 3k. Channel stock today: A 30k, B 3k, C 6k. Lost sales cost $250 a unit in margin; excess costs about $20 a unit to carry.",
      voices: [["Carrier A", "We ordered first. We expect 50k."], ["Sales", "Pro-rata is the fair thing to do."], ["Demand planning", "Look at weeks of supply, not order size."]],
      opts: [["Pro-rata to orders", "pro"], ["By sell-through: equalise weeks of supply", "fair"], ["First come, first served", "fcfs"], ["Equal split: 20k each", "eq"]],
      truth: "Demand over the next 10 weeks: A 40k, B 30k, C 30k.",
      calc: c => { const st = [30, 3, 6], rate = [4, 3, 3], ord = [50, 30, 25]; let al;
        if (c === "pro") al = ord.map(o => o / 105 * 60); else if (c === "fcfs") al = [50, 10, 0]; else if (c === "eq") al = [20, 20, 20]; else { const wk = (sum(st) + 60) / sum(rate); al = st.map((s, i) => Math.max(0, wk * rate[i] - s)); }
        let lost = 0, ex = 0; al.forEach((a, i) => { const have = st[i] + a, need = rate[i] * 10; lost += Math.max(0, need - have); ex += Math.max(0, have - need); });
        return { v: -(lost * 250e3 + ex * 20e3), note: `Allocated A ${fmt(al[0], 1)}k · B ${fmt(al[1], 1)}k · C ${fmt(al[2], 1)}k → ${fmt(lost, 1)}k lost sales, ${fmt(ex, 1)}k excess` }; },
      react: ["Carrier A, already sitting on 7.5 weeks of stock, gets the most. B and C run dry. Pro-rata also rewards inflated orders.", "Every account ends with about 10 weeks of cover. Almost nothing is lost, and nobody gains by inflating orders next time.", "Carrier A gets 20 weeks of stock; Carrier C gets nothing.", "Better than pro-rata, but A still gets far more than it can sell."] }
  ];
  G.boardroom = {
    title: "S&OP Boardroom", icon: "gavel", color: "linear-gradient(135deg,var(--s5),var(--s1))", skill: "S&OP and stakeholders · module 03",
    desc: "Chair three executive S&OP decisions. Every stakeholder has a view; the numbers decide.",
    long: "Three real-world S&OP calls: a holiday build, an end-of-life run, and an allocation under shortage. Hear the stakeholders, decide, then see the P&L for every option. Score = money left on the table versus the best call.",
    fmtBest: v => v === 0 ? "Perfect" : money(-v),
    mount(el, opt) {
      let k, regret, perfect;
      const start = () => { k = 0; regret = 0; perfect = 0; show(); };
      const show = () => {
        const R = ROUNDS[k];
        el.innerHTML = `<div class="card sim" style="max-width:860px"><div class="scoreline"><span class="pill violet">${R.t}</span><span class="small">Left on the table so far: <b>${money(regret)}</b></span></div><p>${R.brief}</p>
          <div class="defs">${R.voices.map(v => `<div class="def"><span class="eyebrow">${v[0]}</span><small>“${v[1]}”</small></div>`).join("")}</div>
          <b>Your decision</b><div class="opts" id="br-o">${R.opts.map((o, i) => `<button type="button" class="opt" data-i="${i}"><span class="ol">${"ABCD"[i]}</span><span>${o[0]}</span></button>`).join("")}</div><div id="br-res"></div></div>`;
        $("#br-o", el).addEventListener("click", e => {
          const b = e.target.closest(".opt"); if (!b || b.disabled) return; const i = +b.dataset.i;
          const res = R.opts.map(o => R.calc(o[1])), best = res.reduce((bi, r, j) => r.v > res[bi].v ? j : bi, 0), lost = res[best].v - res[i].v;
          regret += lost; if (i === best) perfect++;
          $$("#br-o .opt", el).forEach(x => { x.disabled = true; const j = +x.dataset.i; if (j === best) x.classList.add("right"); else if (j === i) x.classList.add("wrong"); });
          $("#br-res", el).innerHTML = `<div class="why ${i === best ? "good" : "bad"}"><b>${R.truth}</b> ${R.react[i]}</div>
            <div class="tbl"><table><thead><tr><th>Option</th><th class="n">${k === 0 ? "Profit" : "Cost"}</th><th>What happened</th></tr></thead><tbody>${res.map((r, j) => `<tr${j === best ? ' class="hl"' : ""}><td>${"ABCD"[j]}${j === i ? " (you)" : ""}${j === best ? " ★" : ""}</td><td class="n">${money(Math.abs(r.v))}</td><td class="small">${r.note}</td></tr>`).join("")}</tbody></table></div>
            <p class="small">${i === best ? "Best call." : "Versus the best call you left " + money(lost) + " on the table."}</p><button class="btn primary" id="br-next" type="button">${k < 2 ? "Next decision →" : "See your scorecard"}</button>`;
          $("#br-next", el).addEventListener("click", () => { k++; k < 3 ? show() : finish(); });
        });
      };
      const finish = () => {
        const isBest = PA.recordRun("boardroom", Math.round(regret), false);
        el.innerHTML = `<div class="card stack" style="max-width:620px"><span class="eyebrow">Board scorecard</span><div class="bigscore">${perfect} / 3</div><p>Best calls made. Money left on the table: <b>${money(regret)}</b> ${isBest ? '<span class="pill gold">personal best</span>' : ""}</p><p class="small">The pattern: validate assumptions before committing (round 1), check channel inventory before building (round 2), allocate on sell-through rather than order size (round 3).</p><div class="row"><button class="btn primary" id="br-again" type="button">${PA.icon("refresh")}Replay</button></div></div>`;
        $("#br-again", el).addEventListener("click", start);
        if (!(opt && opt.embedded) || isBest) PA.addXP(perfect * 25, "S&OP Boardroom"); if (perfect === 3) { PA.award("boardroom"); PA.confetti(); }
      };
      el.innerHTML = `<div class="card stack" style="max-width:640px"><p>Three decisions. You'll see what every option would have made or cost.</p><div class="row"><button class="btn primary" id="br-start" type="button">${PA.icon("gavel")}Open the meeting</button></div></div>`;
      $("#br-start", el).addEventListener("click", start);
    }
  };

  /* ======================= FLASHCARDS ======================= */
  G.cards = {
    title: "Flashcards", icon: "cards", color: "linear-gradient(135deg,var(--s6),var(--s3))", skill: "Spaced repetition · all modules", route: "cards", nav: "cards",
    desc: "Cards you know come back less often; cards you miss come back first. Five boxes to mastery.",
    long: "Say the answer out loud, then flip. Tap “Again” if you missed it (back to box 1), “Hard” to keep it where it is, or “Got it” to move it up a box. Each session serves the cards from the lowest boxes first, so the cards you struggle with come back most often. Keys: space flips, 1 / 2 / 3 rate.",
    fmtBest: v => fmt(v) + " cards",
    mount(el) {
      let filter = "all", q = [], i = 0, flipped = false, done = 0;
      const deck = () => PA.cards.filter(c => filter === "all" || (PA.modules.find(m => m.id === c.m) || {}).act === +filter);
      const box = c => (S.cards[c.id] || {}).b || 1;
      const stats = () => { const d = deck(), b = [1, 2, 3, 4, 5].map(n => d.filter(c => box(c) === n).length), mast = d.length ? sum(d.map(c => box(c) - 1)) / (4 * d.length) : 0; return { b, mast, n: d.length }; };
      const build = () => { q = deck().slice().sort((a, b) => box(a) - box(b) || ((S.cards[a.id] || {}).s || 0) - ((S.cards[b.id] || {}).s || 0)).slice(0, 20); i = 0; flipped = false; done = 0; };
      const render = () => {
        const st = stats();
        el.innerHTML = `<div class="stack" style="max-width:760px"><div class="sim-h">${PA.chips("fc-f", [["all", "All"]].concat(PA.ACTS.map((a, k) => [String(k + 1), "Act " + a[0]])), filter)}<span class="pill gold">Mastery ${pct(st.mast, 0)}</span></div>
          <div class="boxes">${st.b.map((n, k) => `<div>Box ${k + 1}<b>${n}</b></div>`).join("")}</div>
          ${q.length && i < q.length ? `<div class="scoreline small"><span>Card ${i + 1} of ${q.length} this session</span><span class="muted">${esc((PA.modules.find(m => m.id === q[i].m) || {}).title || "")} · box ${box(q[i])}</span></div>
          <div class="fcwrap"><div class="fc${flipped ? " flip" : ""}" id="fc" role="button" tabindex="0" aria-label="Flashcard, tap to flip"><div class="face front"><span class="corner eyebrow">Question</span><b>${q[i].f}</b><span class="small muted">Tap or press space to flip</span></div><div class="face back"><span class="corner eyebrow">Answer</span><div class="stack"><p>${q[i].b}</p>${q[i].x ? `<div class="formula wrap" style="justify-self:center">${q[i].x}</div>` : ""}</div></div></div></div>
          <div class="row" style="justify-content:center">${flipped ? `<button class="btn" data-r="1" type="button">1 · Again</button><button class="btn" data-r="2" type="button">2 · Hard</button><button class="btn primary" data-r="3" type="button">3 · Got it</button>` : `<button class="btn primary" id="fc-flip" type="button">Flip</button>`}</div>`
          : `<div class="card stack" style="text-align:center;justify-items:center"><h3>Session complete</h3><p>${done} cards reviewed. Come back tomorrow: the cards you missed will be waiting at the front.</p><button class="btn primary" id="fc-more" type="button">Another 20</button></div>`}</div>`;
        PA.onChips(el, "fc-f", v => { filter = v; build(); render(); });
        const fcEl = $("#fc", el);
        if (fcEl) { fcEl.addEventListener("click", () => { flipped = !flipped; render(); }); }
        const fl = $("#fc-flip", el); if (fl) fl.addEventListener("click", () => { flipped = true; render(); });
        $$("[data-r]", el).forEach(b => b.addEventListener("click", () => rate(+b.dataset.r)));
        const more = $("#fc-more", el); if (more) more.addEventListener("click", () => { build(); render(); });
      };
      const rate = r => {
        const c = q[i], cur = box(c), nb = r === 1 ? 1 : r === 2 ? cur : Math.min(5, cur + 1);
        S.cards[c.id] = { b: nb, s: Date.now() }; S.reviews = (S.reviews || 0) + 1; PA.save();
        done++; i++; flipped = false;
        if (done % 5 === 0) PA.addXP(10 + (r === 3 ? 2 : 0), "5 flashcards reviewed"); else PA.hud();
        if (S.reviews >= 50) PA.award("cards50");
        render();
      };
      const key = e => { if (!document.body.contains(el) || !q[i]) return; if (e.target.matches("input,textarea")) return; if (e.key === " ") { e.preventDefault(); flipped = !flipped; render(); } else if (flipped && ["1", "2", "3"].indexOf(e.key) >= 0) rate(+e.key); };
      document.addEventListener("keydown", key); PA._cleanup = () => document.removeEventListener("keydown", key);
      build(); render();
    }
  };

  /* ======================= FINAL EXAM ======================= */
  G.exam = {
    title: "Final exam", icon: "cap", color: "linear-gradient(135deg,var(--gold),var(--warn))", skill: "Certification · all modules", route: "exam", nav: "exam",
    desc: "20 questions across all 17 modules. Score 80% to earn your certificate.",
    long: "One question from every module plus three wildcards, in random order. No timer, no hints. Score 16 or more out of 20 to pass and print a certificate. It's a self-assessment for your own learning, not an accredited qualification.",
    fmtBest: v => v + " / 20",
    mount(el) {
      let qs, i, ans;
      const intro = () => {
        const best = S.best.exam;
        el.innerHTML = `<div class="card stack" style="max-width:620px"><label class="ctl"><span class="lab"><span>Name for your certificate (stays in this browser)</span></span><input type="text" id="ex-name" maxlength="40" value="${esc(S.name || "")}" placeholder="Your name"></label>
          <p class="small muted">${best != null ? "Your best so far: " + best + " / 20." : "Tip: clear the boss checks first. The exam draws on the same topics."}</p><div class="row"><button class="btn gold" id="ex-go" type="button">${PA.icon("cap")}Start the exam</button></div></div>`;
        $("#ex-go", el).addEventListener("click", () => { S.name = $("#ex-name", el).value.trim(); PA.save(); start(); });
      };
      const start = () => {
        const all = PA.allQuestions(), picked = [];
        PA.modules.forEach(m => { const pool = all.filter(q => q.m === m.id); if (pool.length) picked.push(pool[Math.floor(Math.random() * pool.length)]); });
        const rest = shuffle(all.filter(q => picked.indexOf(q) < 0)); while (picked.length < 20 && rest.length) picked.push(rest.pop());
        qs = shuffle(picked); i = 0; ans = []; ask();
      };
      const ask = () => {
        const q = qs[i], ord = shuffle(q.o.map((_, k) => k));
        el.innerHTML = `<div class="card sim" style="max-width:760px"><div class="scoreline"><span class="pill gold">Question ${i + 1} / ${qs.length}</span><span class="small muted">${esc((PA.modules.find(m => m.id === q.m) || {}).title || "")}</span></div><div class="meter"><i style="width:${i / qs.length * 100}%;background:var(--gold)"></i></div>
          <div class="qt" style="font-weight:700">${q.q}</div><div class="opts">${ord.map((k, j) => `<button type="button" class="opt" data-o="${k}"><span class="ol">${"ABCD"[j]}</span><span>${q.o[k]}</span></button>`).join("")}</div></div>`;
        $$(".opt", el).forEach(b => b.addEventListener("click", () => { ans.push(+b.dataset.o); i++; i < qs.length ? ask() : finish(); }));
      };
      const finish = () => {
        const sc = qs.filter((q, k) => ans[k] === q.a).length, pass = sc >= 16, first = !S.badges.certified;
        PA.recordRun("exam", sc, true); S.exam = { best: Math.max(sc, (S.exam || {}).best || 0), d: PA.today() }; PA.save();
        el.innerHTML = `<div class="stack"><div class="card stack noprint" style="max-width:620px"><span class="eyebrow">${pass ? "Passed" : "Not yet"}</span><div class="bigscore">${sc} / 20</div><p>${pass ? "You passed. Your certificate is below. Use the print button to save it as a PDF." : "You need 16 to pass. Review the questions you missed, revisit those modules, and try again."}</p><div class="row">${pass ? `<button class="btn gold" id="ex-print" type="button">Print / save certificate</button>` : ""}<button class="btn" id="ex-again" type="button">${PA.icon("refresh")}Retake</button></div></div>
          ${pass ? `<div class="cert printme"><span class="eyebrow">Planning Arena · Certificate of completion</span><span class="nm">${esc(S.name || "Planning Arena graduate")}</span><p style="margin:0 auto">passed the Planning Arena final exam on demand planning, forecasting, inventory and S&amp;OP with <b>${sc} / 20</b>.</p><span class="mono small">${PA.today()} · self-assessed, not an accredited qualification</span></div>` : ""}
          <section class="stack noprint"><h3>Review</h3>${qs.map((q, k) => `<div class="qz"><div class="qt">${k + 1}. ${q.q}</div><div class="why ${ans[k] === q.a ? "good" : "bad"}"><b>${ans[k] === q.a ? "Correct" : "You said: " + q.o[ans[k]] + ". Answer: " + q.o[q.a]}.</b> ${q.why}</div></div>`).join("")}</section></div>`;
        const pr = $("#ex-print", el); if (pr) pr.addEventListener("click", () => window.print());
        $("#ex-again", el).addEventListener("click", intro);
        if (pass) { PA.award("certified"); PA.confetti(); if (first) PA.addXP(150, "passed the final exam"); } else PA.addXP(20, "exam attempt");
      };
      intro();
    }
  };
})();
