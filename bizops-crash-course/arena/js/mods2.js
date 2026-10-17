/* Act III: forecasting techniques, choosing a technique, accuracy, bias, over- and under-forecasting. */
(function () {
  "use strict";
  const { $, $$, esc, fmt, pct, sgn, money, clamp, sum, mean, sd, rng, gauss, zOf, MONTHS } = PA.u;
  const fc = PA.fc;

  /* Bots double as forecasting methods. They also appear in Beat the Bots. */
  PA.BOTS = [
    { id: "naive", name: "Naive Nora", method: "Naive", color: "var(--s6)", init: "NN" },
    { id: "snaive", name: "Seasonal Sid", method: "Seasonal naive", color: "var(--s2)", init: "SS" },
    { id: "ma", name: "Moving-Average Max", method: "Moving average", color: "var(--s3)", init: "MM" },
    { id: "ses", name: "Smooth Sam", method: "Exponential smoothing", color: "var(--s4)", init: "SM" },
    { id: "holt", name: "Holt Hank", method: "Holt (trend)", color: "var(--s5)", init: "HH" },
    { id: "hw", name: "Holt-Winters Hana", method: "Holt-Winters (trend + season)", color: "var(--s1)", init: "HW" }
  ];

  function dartboards() {
    const r = rng(9), cells = [["Precise and unbiased", 0, 0, 7], ["Precise but biased", 26, -18, 6], ["Unbiased but noisy", 0, 0, 24], ["Noisy and biased", 24, -16, 22]];
    let g = "";
    cells.forEach((c, k) => {
      const cx = 85 + (k % 2) * 170, cy = 80 + Math.floor(k / 2) * 178;
      g += [62, 42, 22].map((rr, j) => `<circle cx="${cx}" cy="${cy}" r="${rr}" style="fill:${j === 2 ? "var(--accent-soft)" : "none"};stroke:var(--line);stroke-width:1.5"/>`).join("") + `<circle cx="${cx}" cy="${cy}" r="3" style="fill:var(--ink)"/>`;
      for (let i = 0; i < 10; i++) g += `<circle cx="${(cx + c[1] + c[3] * gauss(r)).toFixed(1)}" cy="${(cy + c[2] + c[3] * gauss(r)).toFixed(1)}" r="4.5" style="fill:${k === 0 ? "var(--good)" : k === 3 ? "var(--bad)" : "var(--warn)"};opacity:.85"/>`;
      g += `<text x="${cx}" y="${cy + 84}" text-anchor="middle" style="font-family:var(--display);font-weight:600;font-size:13px;fill:var(--ink)">${c[0]}</text>`;
    });
    return `<svg class="diagram" style="max-width:420px" viewBox="0 0 340 350" role="img" aria-label="Four targets showing accuracy versus bias">${g}</svg>`;
  }
  PA.dartboards = dartboards;

  /* ======================= 06 FORECASTING TECHNIQUES ======================= */
  PA.modules.push({
    id: "techniques", num: 6, act: 3, mins: 14,
    title: "Forecasting techniques",
    tag: "Judgment, time series, causal and machine learning, raced against each other on real-looking data",
    line: "Every forecasting method is a different guess about which part of the past will repeat. Learn what each one assumes, then race them against each other and let the error decide.",
    html() {
      const fam = [
        ["Judgment", "var(--s2)", "Executive opinion, sales-force composite, Delphi panels, market research", "New products, no history, disruptions, long horizons", "Optimism, politics, anchoring"],
        ["Time series", "var(--s1)", "Naive, seasonal naive, moving average, exponential smoothing, Holt, Holt-Winters, ARIMA, Croston", "Stable products with history; the statistical baseline", "Can't see promotions, launches or price changes coming"],
        ["Causal", "var(--s3)", "Regression on price, promotion, distribution, weather, marketing spend", "When you know the drivers and can forecast them", "Needs clean driver data, and forecasts of the drivers too"],
        ["Machine learning", "var(--s5)", "Gradient-boosted trees (e.g. LightGBM), neural networks, trained across many series", "Thousands of SKUs, rich data, many drivers", "Harder to explain; must beat simple benchmarks to earn its place"],
        ["New product", "var(--s4)", "Like-item (analogue) curves, Bass diffusion, test-market reads", "Launches and anything without history", "The analogue may not be that alike"]
      ];
      const M = [
        ["Naive", "F = last actual", "A benchmark every model must beat", "Chases every wiggle; lags turns"],
        ["Seasonal naive", "F = same month last year", "Strongly seasonal, stable lines", "Ignores growth, so it's biased low on growing products"],
        ["Moving average (n)", "F = average of the last n", "Flat, stable demand", "Lags any trend; ignores seasonality"],
        ["Weighted moving average", "F = Σ wᵢ·Aᵢ ÷ Σ wᵢ", "When recent periods matter more", "Weights are a judgment call"],
        ["Exponential smoothing (SES)", "F(t+1) = α·A(t) + (1−α)·F(t)", "Level only: no trend, no season", "Lags trends; α trades reaction speed against noise"],
        ["Holt (double)", "level + trend, each smoothed", "Trending products without seasonality", "Can overshoot when the trend turns"],
        ["Holt-Winters (triple)", "level + trend + seasonal index", "Seasonal products with 2+ years of history", "Needs at least two full seasons to start"],
        ["ARIMA / SARIMA", "models autocorrelation in the series", "Rich, stable histories", "Needs care and expertise to fit"],
        ["Croston / SBA", "forecasts size and interval separately", "Intermittent demand (spare parts)", "Not for smooth, high-volume items"]
      ];
      return PA.sec("01", "The idea: five families", `<div class="defs">${fam.map(f => `<div class="def"><b style="color:${f[1]}">${f[0]}</b><small><b>Methods:</b> ${f[2]}</small><small><b>Best for:</b> ${f[3]}</small><small><b>Watch out:</b> ${f[4]}</small></div>`).join("")}</div>
        <div class="callout info"><b>An illustrative planning stack</b>Planning systems such as SAP IBP and o9 offer statistical baselines (exponential smoothing, ARIMA and machine-learning models) by product and account. A typical setup then plans the channel on sell-through, uses <b>like-item curves</b> for launches, and adds a <b>judgmental overlay</b> from account teams in the consensus meeting. Not one method, but a stack.</div>`) +
        PA.sec("02", "See it: the method cheat table", `<div class="tbl"><table><thead><tr><th>Method</th><th>Formula idea</th><th>Good for</th><th>Watch out</th></tr></thead><tbody>${M.map(r => `<tr><td><b>${r[0]}</b></td><td class="mono small">${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join("")}</tbody></table></div>`) +
        PA.sec("03", "Live example: the method duel", `<div class="card flat sim"><div class="sim-h"><div><h3>Six bots, one product, one year to prove it</h3><small class="muted" id="du-sub"></small></div><div class="row"><button class="btn sm" id="du-tune" type="button">${PA.icon("bolt")}Auto-tune</button></div></div>
          <div class="chips" id="du-show">${PA.BOTS.map(b => `<button type="button" class="chip${b.id === "hw" || b.id === "snaive" || b.id === "ses" ? " on" : ""}" data-v="${b.id}"><span class="sw" style="background:${b.color}"></span>${b.method}</button>`).join("")}</div>
          <div class="chart" id="du-chart"></div>
          <div class="ctls">${PA.ctl("du-n", "Moving average: n months", 2, 12, 1, 3)}${PA.ctl("du-a", "SES and Holt: α (level)", 0.05, 0.95, 0.05, 0.3)}${PA.ctl("du-b", "Holt and HW: β (trend)", 0.01, 0.5, 0.01, 0.1)}${PA.ctl("du-ha", "Holt-Winters: α (level)", 0.05, 0.95, 0.05, 0.3)}${PA.ctl("du-g", "Holt-Winters: γ (season)", 0.05, 0.95, 0.05, 0.2)}</div>
          <div class="board" id="du-board"></div><p class="say" id="du-say"></p>
          <details class="deep"><summary>Use your own numbers</summary><div><p class="small">Paste a monthly series (commas, spaces or new lines). Holt-Winters needs at least 26 points; seasonal naive needs at least 13.</p><textarea id="du-data" rows="3" placeholder="e.g. 120, 132, 101, 134, 90, ..."></textarea><div class="row"><button class="btn sm primary" id="du-use" type="button">Race my data</button><button class="btn sm" id="du-reset" type="button">Back to A-Series</button><span class="small" id="du-msg"></span></div></div></details></div>`) +
        PA.sec("04", "By hand: exponential smoothing in four steps", `<div class="prose"><p>SES keeps a running “level” and nudges it toward each new actual by a fraction <b>α</b>. With α = 0.3, each new month gets 30% of the say and the old level keeps 70%.</p></div><div class="formula">F(t+1) = α × A(t) + (1 − α) × F(t)</div><div class="tbl" id="du-ses"></div>
          <div class="formula wrap"><b>Holt-Winters (multiplicative, season length m)</b><br>Level: ℓ<sub>t</sub> = α·(A<sub>t</sub> ÷ s<sub>t−m</sub>) + (1−α)·(ℓ<sub>t−1</sub> + b<sub>t−1</sub>)<br>Trend: b<sub>t</sub> = β·(ℓ<sub>t</sub> − ℓ<sub>t−1</sub>) + (1−β)·b<sub>t−1</sub><br>Season: s<sub>t</sub> = γ·(A<sub>t</sub> ÷ ℓ<sub>t</sub>) + (1−γ)·s<sub>t−m</sub><br>Forecast h ahead: F<sub>t+h</sub> = (ℓ<sub>t</sub> + h·b<sub>t</sub>) × s<sub>t+h−m</sub></div>`) +
        PA.sec("05", "Go deeper", `<details class="deep"><summary>Simple often wins: the M competitions</summary><div><p>The Makridakis (M) competitions test methods on thousands of real series. A recurring lesson is that simple methods and <b>combinations</b> of methods are hard to beat. In M4 (2018) combinations did very well and a hybrid of exponential smoothing and a neural network won. In M5 (2020, Walmart sales data), models built on gradient-boosted trees (LightGBM) led on accuracy. Machine learning wins when there's lots of related data, not by default.</p></div></details>
          <details class="deep"><summary>Never tune on the data you score on</summary><div><p>The Auto-tune button picks parameters using 2024 only, then the league table scores them on 2025, which the tuning never saw. Tune and score on the same months and you'll fool yourself.</p></div></details>
          <details class="deep"><summary>Where to learn more</summary><div><p><a href="https://otexts.com/fpp3/" target="_blank" rel="noopener">Forecasting: Principles and Practice</a> (Hyndman &amp; Athanasopoulos) is free online and the standard practical text.</p></div></details>`);
    },
    mount(root) {
      let y = PA.DATA.aseries.slice(), labels = PA.DATA.labels36.slice(), custom = false, P = {};
      let show = ["hw", "snaive", "ses"];
      const compute = () => {
        const n = y.length, from = n >= 36 ? n - 12 : n >= 26 ? 24 : Math.max(2, n - Math.max(3, Math.floor(n / 3)));
        const F = {
          naive: fc.naive(y), snaive: n >= 13 ? fc.snaive(y) : y.map(() => null), ma: fc.ma(y, P.n), ses: fc.ses(y, P.a), holt: fc.holt(y, P.a, P.b), hw: n >= 26 ? fc.hw(y, P.ha, P.b, P.g) : y.map(() => null)
        };
        const next = { naive: y[n - 1], snaive: n >= 12 ? y[n - 12] : null, ma: mean(y.slice(n - P.n)), ses: F.ses.next, holt: F.holt.state ? F.holt.state.l + F.holt.state.tr : null, hw: F.hw.state ? fc.hwAhead(F.hw.state, 1) : null };
        return { F, from, next, n };
      };
      const draw = () => {
        const { F, from, next, n } = compute();
        const ok = id => F[id].slice(from).every(v => v != null);
        const res = PA.BOTS.map(b => Object.assign({ b, ok: ok(b.id), next: next[b.id] }, ok(b.id) ? fc.metrics(F[b.id], y, from, n) : {})).sort((p, q) => (p.ok ? p.wape : 9) - (q.ok ? q.wape : 9));
        const series = [{ name: "Actual", data: y, color: "var(--s0)", width: 2.6 }].concat(PA.BOTS.filter(b => show.indexOf(b.id) >= 0 && ok(b.id)).map(b => ({ name: b.method, data: F[b.id].map((v, i) => i >= from ? v : null), color: b.color, dash: "6 3", width: 2.2 })));
        PA.line($("#du-chart", root), { labels, series, bands: [{ x0: from, x1: n - 1, color: "var(--accent-soft)", label: "scored months", op: 0.55 }], yZero: false, aria: "Actual demand and method forecasts" });
        $("#du-sub", root).textContent = (custom ? "Your data" : "A-Series sell-through, thousand units (illustrative)") + " · one-step-ahead forecasts, scored on the last " + (n - from) + " periods";
        $("#du-board", root).innerHTML = res.map((r, i) => `<div class="brow${i === 0 && r.ok ? " p1" : ""}"><span class="pos">${r.ok ? (i === 0 ? "🏆" : i + 1) : "–"}</span><span class="av" style="background:${r.b.color}">${r.b.init}</span><span class="nm">${r.b.name}<small>${r.b.method}${r.ok ? " · bias " + (r.bias > 0 ? "+" : "") + pct(r.bias) + " · next: " + fmt(r.next, 1) : " · needs more history"}</small></span><span class="sc">${r.ok ? "WAPE " + pct(r.wape) : ""}</span></div>`).join("");
        const w = res[0], sn = res.find(r => r.b.id === "snaive"), se = res.find(r => r.b.id === "ses");
        $("#du-say", root).innerHTML = custom ? `On your data, <b>${w.b.method}</b> wins with WAPE ${pct(w.wape)}. Check the bias column: a winner with a big bias still needs fixing.` : `<b>${w.b.method}</b> wins (WAPE ${pct(w.wape)}) because the A-Series has all three layers: level, trend <i>and</i> season. Seasonal naive gets the shape right but is biased low (${pct(sn.bias)}): it copies last year and ignores 12 months of growth. SES lags (${pct(se.bias)} bias) because it can't see trend or season. Try α = 0.9 on SES: it reacts faster, but still can't see December coming.`;
      };
      PA.bindCtls(root, ["du-n", "du-a", "du-b", "du-ha", "du-g"], v => { P = { n: v["du-n"], a: v["du-a"], b: v["du-b"], ha: v["du-ha"], g: v["du-g"] }; draw(); }, { "du-a": x => x.toFixed(2), "du-b": x => x.toFixed(2), "du-ha": x => x.toFixed(2), "du-g": x => x.toFixed(2) });
      $("#du-show", root).addEventListener("click", e => { const b = e.target.closest(".chip"); if (!b) return; b.classList.toggle("on"); show = $$("#du-show .chip.on", root).map(x => x.dataset.v); draw(); });
      const setv = (id, v) => { const el = $("#" + id, root); el.value = v; el.dispatchEvent(new Event("input")); };
      $("#du-tune", root).addEventListener("click", () => {
        const n = y.length, a = fc.tuneSES(y, Math.max(2, n - 24), n - 12); setv("du-a", a);
        if (n >= 37) { const t = fc.tuneHW(y, 12, n - 12); setv("du-ha", t[0]); setv("du-b", t[1]); setv("du-g", t[2]); }
        PA.toast("Tuned on the earlier year, scored on the last year"); PA.miniWin("du-tune", 5, "auto-tuned a model");
      });
      $("#du-use", root).addEventListener("click", () => {
        const nums = ($("#du-data", root).value.match(/-?\d+(\.\d+)?/g) || []).map(Number).filter(isFinite);
        if (nums.length < 8) { $("#du-msg", root).textContent = "Paste at least 8 numbers."; return; }
        y = nums; labels = nums.map((_, i) => "P" + (i + 1)); custom = true; $("#du-msg", root).textContent = nums.length + " points loaded."; draw();
      });
      $("#du-reset", root).addEventListener("click", () => { y = PA.DATA.aseries.slice(); labels = PA.DATA.labels36.slice(); custom = false; $("#du-msg", root).textContent = ""; draw(); });
      const ya = PA.DATA.aseries, fs = fc.ses(ya, 0.3);
      $("#du-ses", root).innerHTML = `<table><thead><tr><th>Month</th><th class="n">Actual A</th><th class="n">Forecast F</th><th>How F was made (α = 0.3)</th></tr></thead><tbody>${[0, 1, 2, 3, 4, 5].map(t => `<tr><td>${PA.DATA.labels36[t]}</td><td class="n">${ya[t]}</td><td class="n">${t ? fs[t].toFixed(1) : "–"}</td><td class="mono small">${t === 0 ? "start: level = first actual (78)" : t === 1 ? "F = starting level = 78" : `0.3 × ${ya[t - 1]} + 0.7 × ${fs[t - 1].toFixed(1)} = ${fs[t].toFixed(1)}`}</td></tr>`).join("")}</tbody></table>`;
    },
    ask: ["Which forecasting methods do you know, and when would you use each?", "Naive and seasonal naive as benchmarks. Moving averages and exponential smoothing for stable demand; Holt when there's a trend; Holt-Winters or seasonal ARIMA when there's seasonality and two or more years of history; Croston for intermittent parts; regression or machine learning when price and promotions drive demand; like-item curves and judgment for launches. I'd pick by data and pattern, benchmark against naive, and keep whichever adds value."],
    boss: [
      { q: "SES with α = 0.3. Last forecast 100, actual 120. Next forecast?", o: ["100", "106", "114", "120"], a: 1, why: "0.3 × 120 + 0.7 × 100 = 36 + 70 = 106. The forecast moves 30% of the way toward the actual." },
      { q: "Which method models level, trend and seasonality together?", o: ["Moving average", "Simple exponential smoothing", "Holt's method", "Holt-Winters"], a: 3, why: "Holt-Winters (triple exponential smoothing) adds a seasonal index to Holt's level and trend." },
      { q: "3-month moving average of 90, 100 and 110?", o: ["90", "100", "105", "110"], a: 1, why: "(90 + 100 + 110) ÷ 3 = 100. On a rising series it lags: the next actual is probably above 110." }
    ],
    take: ["Five families: judgment, time series, causal, machine learning, new-product methods.", "Match the method to the pattern: level → SES, trend → Holt, season → Holt-Winters.", "Race methods out of sample, check bias as well as WAPE, and always beat naive."],
    mnem: ["“Just Try Clever Methods, Newbie”", "Judgment · Time series · Causal · Machine learning · New-product methods."]
  });

  /* ======================= 07 CHOOSING THE TECHNIQUE ======================= */
  const SBC = {
    smooth: ["Phone, weekly", [520, 480, 505, 530, 495, 510, 470, 525, 500, 515, 490, 505, 498, 520, 487, 512]],
    erratic: ["Accessory with promos", [300, 120, 850, 200, 90, 640, 150, 400, 80, 900, 210, 130, 520, 95, 760, 180]],
    intermittent: ["Repair spare part", [0, 0, 3, 0, 0, 0, 4, 0, 0, 3, 0, 0, 0, 5, 0, 0, 4, 0, 0, 0]],
    lumpy: ["B2B project order", [0, 0, 0, 120, 0, 0, 5, 0, 0, 0, 0, 300, 0, 0, 40, 0, 0, 0, 0, 0]]
  };
  function classify(d) {
    const nz = d.filter(v => v > 0), adi = nz.length ? d.length / nz.length : Infinity, m = mean(nz), cv2 = nz.length ? Math.pow(sd(nz) / m, 2) : 0;
    const cls = adi < 1.32 ? (cv2 < 0.49 ? "Smooth" : "Erratic") : (cv2 < 0.49 ? "Intermittent" : "Lumpy");
    const rec = { Smooth: "Exponential smoothing, Holt-Winters or ARIMA. Normal safety stock maths works.", Erratic: "Smoothing plus causal drivers (promotions, price) or machine learning. Expect more safety stock.", Intermittent: "Croston or SBA (Syntetos-Boylan approximation), or forecast at a higher level. Use min/max for stock.", Lumpy: "Hardest to forecast. Croston/SBA, collaborate with the customer for advance orders, or make to order." }[cls];
    return { adi, cv2, cls, rec };
  }
  PA.modules.push({
    id: "choose", num: 7, act: 3, mins: 10,
    title: "Choosing the right technique",
    tag: "Six questions, one decision tree, and a demand-pattern classifier",
    line: "There's no best forecasting method, only the best one for this data, this pattern and this decision. Ask six questions, then test the winner against a naive benchmark.",
    html() {
      return PA.sec("01", "The idea: six questions", `<div class="defs">${[["1 · History", "How much clean, relevant history? None means judgment and like-item curves; two or more seasons opens up seasonal models."], ["2 · Pattern", "Level, trend, seasonality, or lots of zeros (intermittent)?"], ["3 · Drivers", "Do price, promotions, weather or distribution move demand, and can you forecast them?"], ["4 · Horizon", "Days to weeks: demand sensing and smoothing. Months: time series plus intel. Years: aggregate trends and scenarios."], ["5 · Scale", "Ten key products or 20,000 SKU-store pairs? Scale and data favour machine learning; a few items favour attention and judgment."], ["6 · Cost of error", "A-class items (module 11) earn the effort. C-class items get simple, automatic rules."]].map(x => `<div class="def"><b>${x[0]}</b><small>${x[1]}</small></div>`).join("")}</div>`) +
        PA.sec("02", "See it: the decision tree", `<div class="card flat stack">
          <div class="step on"><span class="sn">?</span><div><b>Two or more years of relevant history?</b></div></div>
          <div class="grid2"><div class="callout warn"><b>No → new product</b>Like-item (analogue) curves, Delphi or sales-force input, Bass diffusion for adoption, test markets.</div>
          <div class="stack"><div class="step on"><span class="sn">?</span><div><b>Yes → are many periods zero?</b></div></div>
            <div class="callout"><b>Yes → intermittent</b>Croston / SBA, or forecast at a higher level; min/max for stock.</div>
            <div class="step on"><span class="sn">?</span><div><b>No → what's the pattern?</b></div></div>
            <div class="grid3"><div class="callout info"><b>Level only</b>SES or moving average</div><div class="callout info"><b>Trend</b>Holt (double smoothing)</div><div class="callout info"><b>Season (± trend)</b>Holt-Winters (ETS) or seasonal ARIMA</div></div>
            <div class="callout good"><b>Then add:</b> causal drivers if price or promotions move demand; machine learning if you have thousands of related series and a data team. Always benchmark against naive.</div></div></div></div>`) +
        PA.sec("03", "Simulate: the technique picker", `<div class="card flat sim" id="pk">
          ${[["h", "History available", [["none", "None (new)"], ["short", "Under 2 years"], ["long", "2+ years"]]], ["p", "Pattern", [["zeros", "Mostly zeros"], ["flat", "Flat"], ["trend", "Trend"], ["season", "Seasonal"], ["both", "Seasonal + trend"]]], ["d", "Do promotions or price cause big swings?", [["no", "No"], ["yes", "Yes"]]], ["s", "Scale", [["few", "A few key items"], ["many", "Thousands of SKUs + data team"]]], ["z", "Horizon", [["weeks", "Next few weeks"], ["months", "Months"], ["years", "Years"]]]].map(q => `<div class="stack" style="gap:6px"><b class="small">${q[1]}</b>${PA.chips("pk-" + q[0], q[2], q[2][q[0] === "h" ? 2 : q[0] === "p" ? 4 : 0][0])}</div>`).join("")}
          <div class="callout good" id="pk-out"></div></div>`) +
        PA.sec("04", "Simulate: classify the demand pattern", `<div class="card flat sim"><div class="sim-h">${PA.chips("sb", Object.keys(SBC).map(k => [k, SBC[k][0]]), "smooth")}</div>
          <div class="grid2" style="align-items:center"><div id="sb-plot"></div><div class="stack"><div class="chart" id="sb-series"></div><div class="kpis" id="sb-k"></div></div></div><p class="say" id="sb-say"></p>
          <details class="deep"><summary>Classify your own series</summary><div><textarea id="sb-data" rows="2" placeholder="0, 0, 4, 0, 6, 0, 0, 3 ..."></textarea><button class="btn sm primary" id="sb-go" type="button">Classify</button></div></details>
          <p class="small muted"><b>ADI</b> = average periods between non-zero demands (here: periods ÷ non-zero periods). <b>CV²</b> = squared coefficient of variation of the non-zero sizes. Cut-offs 1.32 and 0.49 come from Syntetos, Boylan &amp; Croston (2005).</p></div>`) +
        PA.sec("05", "Challenge: pick the method", `<p class="small">Seven real-world situations. +5 XP per correct answer, first time through.</p><div id="ch-q" class="stack"></div>`) +
        PA.sec("06", "Go deeper", `<details class="deep"><summary>Benchmark everything against naive</summary><div><p>If a sophisticated model can't beat “same as last period” or “same as last year”, it's adding cost, not value. Report forecast value added (FVA) for every method and every override.</p></div></details>
          <details class="deep"><summary>Combine forecasts</summary><div><p>Averaging two or three reasonable methods often beats picking one, because their errors partly cancel. It's one of the most reliable findings in forecasting research.</p></div></details>
          <details class="deep"><summary>Forecast at the level the decision needs</summary><div><p>Factory capacity is decided monthly by product family; store replenishment is weekly by SKU. Forecasting at a higher level is more accurate. Forecast where the data is strong, then split down.</p></div></details>`);
    },
    mount(root) {
      const st = { h: "long", p: "both", d: "no", s: "few", z: "months" };
      const rec = () => {
        let m, why = [], also = "Benchmark it against seasonal naive and track bias every month.";
        if (st.h === "none") { m = "Like-item (analogue) curve + judgment"; why.push("No history, so borrow the launch shape of a similar past product and adjust with sales, marketing and account input (a Delphi round helps cut groupthink)."); also = "Switch to a statistical model once you have a few months of sell-through."; }
        else if (st.p === "zeros") { m = "Croston / SBA"; why.push("Mostly zeros: forecast the size of the demand and the gap between demands separately."); also = "Or aggregate to a higher level and use min/max for stock."; }
        else {
          const seasonal = st.p === "season" || st.p === "both";
          if (seasonal && st.h === "short") { m = "Seasonal naive or Holt with a borrowed seasonal profile"; why.push("Under two years isn't enough to estimate seasonality reliably. Borrow the index from the product family."); }
          else m = { flat: "Simple exponential smoothing (or a moving average)", trend: "Holt (double exponential smoothing)", season: "Holt-Winters or seasonal ARIMA", both: "Holt-Winters (multiplicative) or seasonal ARIMA" }[st.p];
          if (st.p !== "flat") why.push("The pattern has " + { trend: "a trend", season: "seasonality", both: "seasonality on top of a trend" }[st.p] + ", so the model must carry those components.");
          if (st.d === "yes") { m += " + causal drivers"; why.push("Promotions and price explain the big swings: add them as regressors, or use a model that takes features."); }
          if (st.s === "many") { m = (st.d === "yes" ? "Machine learning (gradient-boosted trees) with price, promo and calendar features" : "Automated exponential smoothing / ARIMA at scale, or machine learning") ; why.push("At thousands of series, automation matters, and models trained across many related series can learn shared patterns."); }
        }
        if (st.z === "weeks" && st.h !== "none") why.push("For the next few weeks, demand sensing (recent sell-through, orders, POS) can beat a monthly model.");
        if (st.z === "years") { why.push("Years out, detail is noise: forecast at an aggregate level and use scenarios and judgment."); m = st.h === "none" ? m : "Aggregate trend + scenarios (judgment-led)"; }
        $("#pk-out", root).innerHTML = `<b>Recommended: ${m}</b>${why.map(w => `<span>• ${w}</span>`).join("")}<span class="small muted">${also}</span>`;
      };
      ["h", "p", "d", "s", "z"].forEach(k => PA.onChips(root, "pk-" + k, v => { st[k] = v; rec(); PA.miniWin("pk-used", 5, "used the technique picker"); }));
      rec();
      const sbDraw = (d, name) => {
        const r = classify(d), W = 340, H = 250, m = { l: 40, b: 34, t: 10, r: 10 }, X = v => m.l + clamp(v - 1, 0, 5) / 5 * (W - m.l - m.r), Y = v => H - m.b - clamp(v, 0, 2) / 2 * (H - m.t - m.b);
        let g = `<rect x="${m.l}" y="${m.t}" width="${W - m.l - m.r}" height="${H - m.t - m.b}" style="fill:var(--surface2);stroke:var(--line)"/>`;
        g += `<line x1="${X(1.32)}" x2="${X(1.32)}" y1="${m.t}" y2="${H - m.b}" style="stroke:var(--muted);stroke-dasharray:4 4"/><line x1="${m.l}" x2="${W - m.r}" y1="${Y(0.49)}" y2="${Y(0.49)}" style="stroke:var(--muted);stroke-dasharray:4 4"/>`;
        [["Smooth", 1.05, 0.2], ["Erratic", 1.05, 1.6], ["Intermittent", 3.8, 0.2], ["Lumpy", 3.8, 1.6]].forEach(q => g += `<text x="${X(q[1])}" y="${Y(q[2])}" style="font-family:var(--display);font-weight:800;font-size:14px;fill:${q[0] === r.cls ? "var(--accent)" : "var(--muted)"}">${q[0]}</text>`);
        g += `<text x="${(W + m.l) / 2}" y="${H - 6}" text-anchor="middle" style="font-size:11px;fill:var(--muted)">ADI (1 → 6+)  ·  cut-off 1.32</text><text transform="translate(12 ${(H - m.b) / 2}) rotate(-90)" text-anchor="middle" style="font-size:11px;fill:var(--muted)">CV² (0 → 2)  ·  cut-off 0.49</text>`;
        g += `<circle cx="${X(r.adi)}" cy="${Y(r.cv2)}" r="9" style="fill:var(--accent);stroke:var(--surface);stroke-width:3"/>`;
        $("#sb-plot", root).innerHTML = `<svg class="diagram" viewBox="0 0 ${W} ${H}" role="img" aria-label="Demand pattern quadrant">${g}</svg>`;
        PA.bars($("#sb-series", root), { labels: d.map((_, i) => String(i + 1)), series: [{ name: name, data: d, color: "var(--s1)" }], legend: false, height: 150, xLabelW: 22 });
        $("#sb-k", root).innerHTML = PA.kpi("ADI", isFinite(r.adi) ? r.adi.toFixed(2) : "∞") + PA.kpi("CV²", r.cv2.toFixed(2)) + PA.kpi("Pattern", r.cls, "acc");
        $("#sb-say", root).innerHTML = `<b>${r.cls}.</b> ${r.rec}`;
      };
      PA.onChips(root, "sb", k => sbDraw(SBC[k][1], SBC[k][0])); sbDraw(SBC.smooth[1], SBC.smooth[0]);
      $("#sb-go", root).addEventListener("click", () => { const d = ($("#sb-data", root).value.match(/\d+(\.\d+)?/g) || []).map(Number); if (d.length >= 4 && d.some(v => v > 0)) sbDraw(d, "Your series"); });
      const qs = [
        { q: "A new foldable phone launches next month. There's no history, but last year's foldable launched in a similar way.", o: ["Holt-Winters", "Like-item (analogue) curve + judgment", "Croston", "Naive"], a: 1, why: "No history means no time series model can run. Borrow the analogue's launch curve and adjust it with market input." },
        { q: "A phone charger: three years of weekly history, stable, no seasonality, no promotions.", o: ["Simple exponential smoothing", "Holt-Winters", "Machine learning", "Delphi panel"], a: 0, why: "Flat, stable demand: SES (or a moving average) is cheap, explainable and hard to beat." },
        { q: "A game console: four years of monthly data, huge November–December peaks, growing every year.", o: ["Moving average", "Holt-Winters (multiplicative)", "Naive", "Croston"], a: 1, why: "Trend plus seasonality whose peaks grow with volume: multiplicative Holt-Winters (or seasonal ARIMA)." },
        { q: "A repair spare part sells in about one week out of five, in small, steady quantities.", o: ["Croston / SBA", "Holt", "Seasonal naive", "Regression on price"], a: 0, why: "Intermittent demand: Croston-type methods forecast size and interval separately." },
        { q: "TV sales move sharply with price cuts and promotions, and you have the promotion calendar.", o: ["Seasonal naive", "Causal regression or ML with price and promo features", "Moving average", "Naive"], a: 1, why: "When known drivers explain the swings, model them explicitly." },
        { q: "20,000 SKU-store combinations, rich daily data, and a data science team.", o: ["One Delphi panel per SKU", "Machine learning across all series, benchmarked against simple methods", "Hand-tuned Holt-Winters for each", "Naive only"], a: 1, why: "At this scale, models trained across many related series (e.g. gradient-boosted trees) can learn shared patterns. Keep simple benchmarks to prove the value." },
        { q: "A five-year capacity plan for a new factory.", o: ["Weekly SKU-level Holt-Winters", "Aggregate trend + scenarios + expert judgment", "Croston", "Seasonal naive"], a: 1, why: "Years out, detail is noise. Plan at aggregate level with scenarios and structured judgment." }
      ];
      PA.mcq($("#ch-q", root), qs, { onDone: c => PA.miniWin("ch-q", c * 5, "method challenge: " + c + "/7") });
    },
    ask: ["How do you choose a forecasting method for a product?", "I look at the history (how much, how clean), the pattern (level, trend, seasonality, intermittency), whether known drivers like price and promotions matter, the horizon, the scale, and how costly errors are. That narrows it to a few candidates. I test them out of sample, compare accuracy and bias against a naive benchmark, and keep the one that adds value. Often a combination wins."],
    boss: [
      { q: "A spare part sells in about one week out of four, in steady small sizes. Pattern and method?", o: ["Smooth: SES", "Intermittent: Croston / SBA", "Erratic: Holt-Winters", "Lumpy: naive"], a: 1, why: "Average interval above 1.32 with low size variation is intermittent. Croston-type methods fit." },
      { q: "A brand-new product with no history. Best starting point?", o: ["Holt-Winters", "ARIMA", "Like-item (analogue) curve + judgment", "Moving average"], a: 2, why: "Statistical methods need history. Use a similar product's launch curve, adjusted by people who know the market." },
      { q: "A machine learning model scores WAPE 31%; seasonal naive scores 29%. What do you do?", o: ["Use ML: it's more advanced", "Keep seasonal naive and find out why ML adds error", "Average the two WAPEs", "Report ML's number"], a: 1, why: "Negative forecast value added. A method has to beat the benchmark to earn its complexity." }
    ],
    take: ["Six questions decide the method: history, pattern, drivers, horizon, scale, cost of error.", "Smooth → smoothing; trend → Holt; season → Holt-Winters; zeros → Croston; no history → analogue + judgment.", "Benchmark against naive and consider combining methods."],
    mnem: ["“Have Patterns, Drivers, Horizon, Scale, Cost”", "History · Pattern · Drivers · Horizon · Scale · Cost of error. Then: beat naive."]
  });

  /* ======================= 08 FORECAST ACCURACY ======================= */
  const ACC = [["X-Pro phone", 1200, 1050], ["A-Series phone", 3000, 3300], ["Tablet", 400, 380], ["Smartwatch", 500, 610], ["Earbuds", 800, 760], ["Phone case", 50, 20]];
  PA.modules.push({
    id: "accuracy", num: 8, act: 3, mins: 11,
    title: "Forecast accuracy",
    tag: "MAE, MAPE, WAPE, RMSE: what each one hides, and which forecast to measure",
    line: "Accuracy measures how big your misses were. Pick a metric that weights misses by what they cost, and measure the forecast that was made one lead time ahead, because that's the one supply acted on.",
    html() {
      return PA.sec("01", "The idea", `<div class="prose"><p>Start with the error. On this page <b>error = forecast − actual</b>, so positive means you forecast too high. Some companies flip the sign, so always say which convention you're using.</p></div>
        <div class="defs">${[["MAE (MAD)", "Average absolute error, in units.", "Σ|F − A| ÷ n"], ["MAPE", "Average % error, each item counted equally. Small items can wreck it, and it fails when actual = 0.", "average of |F − A| ÷ A"], ["WAPE", "Total absolute error ÷ total actual. Weighted by volume. The usual headline.", "Σ|F − A| ÷ ΣA"], ["Accuracy", "The friendly version of WAPE. Floor it at 0%.", "1 − WAPE"], ["RMSE", "Squares the errors first, so big misses hurt far more.", "√(Σ(F − A)² ÷ n)"], ["Bias", "Direction, not size. See module 09.", "Σ(F − A) ÷ ΣA"]].map(x => `<div class="def"><b>${x[0]}</b><small>${x[1]}</small><code>${x[2]}</code></div>`).join("")}</div>`) +
        PA.sec("02", "See it: accuracy vs bias", `<div class="grid2" style="align-items:center"><div class="card flat">${dartboards()}</div><div class="prose"><p>Think of a dartboard. The <b>spread</b> of the darts is precision: random error. The <b>offset</b> of the whole cluster is bias: error that always leans one way. An accurate forecast needs both: a tight cluster, centred on the bullseye.</p><p>The top-right board is the dangerous one: the spread looks tight and the numbers feel precise, but every forecast misses the same way. Inventory builds up (or runs out) month after month.</p><p>Always report <b>both</b>: an accuracy number (such as WAPE) and a bias number.</p></div></div>`) +
        PA.sec("03", "Live example: six products, three verdicts", `<div class="card flat sim"><p class="small">Edit any forecast or actual. Watch how MAPE, WAPE and the total-level error tell different stories.</p>
          <div class="tbl"><table><thead><tr><th>Product</th><th class="n">Forecast</th><th class="n">Actual</th><th class="n">Error</th><th class="n">|% error|</th></tr></thead><tbody id="ac-body"></tbody></table></div>
          <div class="kpis" id="ac-k"></div><div class="chart" id="ac-chart"></div><p class="say" id="ac-say"></p></div>`) +
        PA.sec("04", "Simulate: which forecast do you measure?", `<div class="card flat sim"><p class="small">The March forecast was revised every month as March got closer. Actual March sales: <b>5,000</b>. Choose your supply lead time: the forecast that counts is the one made that many months ahead (the <b>lag</b>).</p>
          <div class="row"><span class="small">Lead time:</span>${PA.chips("lag", [["1", "1 month"], ["2", "2 months"], ["3", "3 months"], ["4", "4 months"], ["5", "5 months"]], "3")}</div>
          <div class="chart" id="lag-chart"></div><div class="kpis" id="lag-k"></div><p class="say" id="lag-say"></p></div>`) +
        PA.sec("05", "Go deeper", `<details class="deep"><summary>Why total-level accuracy always looks better</summary><div><p>Over-forecasts on one product cancel under-forecasts on another when you add them up. That's real (pooled stock benefits from it), but it hides SKU-level problems. Report accuracy at the level where decisions are made: product × location × the lead-time lag.</p></div></details>
          <details class="deep"><summary>Different definitions of “accuracy”</summary><div><p>Some teams divide by forecast instead of actual, some use min(F, A) ÷ max(F, A), some cap each item's error at 100%. None is wrong, but numbers from different definitions can't be compared. Write the formula on the report.</p></div></details>
          <details class="deep"><summary>Scaled errors (MASE)</summary><div><p>MASE divides your error by the error of a naive forecast. Below 1 means you beat naive. It works across products of any size and doesn't break at zero. A favourite in forecasting research.</p></div></details>`);
    },
    mount(root) {
      $("#ac-body", root).innerHTML = ACC.map((r, i) => `<tr><td>${r[0]}</td><td class="n"><input type="number" id="ac-f${i}" value="${r[1]}" min="0" aria-label="Forecast ${r[0]}"></td><td class="n"><input type="number" id="ac-a${i}" value="${r[2]}" min="0" aria-label="Actual ${r[0]}"></td><td class="n" id="ac-e${i}"></td><td class="n" id="ac-p${i}"></td></tr>`).join("") + `<tr class="total"><td>Total</td><td class="n" id="ac-tf"></td><td class="n" id="ac-ta"></td><td class="n" id="ac-te"></td><td></td></tr>`;
      const calc = () => {
        const F = ACC.map((_, i) => +$("#ac-f" + i, root).value || 0), A = ACC.map((_, i) => +$("#ac-a" + i, root).value || 0), E = F.map((f, i) => f - A[i]);
        E.forEach((e, i) => { $("#ac-e" + i, root).textContent = sgn(e); $("#ac-p" + i, root).textContent = A[i] ? pct(Math.abs(e) / A[i]) : "n/a"; });
        const sA = sum(A), sF = sum(F), sae = sum(E.map(Math.abs)), apes = E.map((e, i) => A[i] ? Math.abs(e) / A[i] : null).filter(v => v != null);
        const mape = mean(apes), wape = sae / sA, bias = sum(E) / sA, tot = Math.abs(sF - sA) / sA, rmse = Math.sqrt(mean(E.map(e => e * e))), mae = mean(E.map(Math.abs));
        $("#ac-tf", root).textContent = fmt(sF); $("#ac-ta", root).textContent = fmt(sA); $("#ac-te", root).textContent = sgn(sF - sA);
        $("#ac-k", root).innerHTML = PA.kpi("MAE", fmt(mae)) + PA.kpi("MAPE", pct(mape), mape > 0.3 ? "bad" : "") + PA.kpi("WAPE", pct(wape)) + PA.kpi("Accuracy", pct(Math.max(0, 1 - wape)), "good") + PA.kpi("Bias", (bias > 0 ? "+" : "") + pct(bias), "warn") + PA.kpi("RMSE", fmt(rmse)) + PA.kpi("Total-level error", pct(tot), "acc");
        PA.bars($("#ac-chart", root), { labels: ACC.map(r => r[0].split(" ")[0]), series: [{ name: "Error F − A (units)", data: E, colors: E.map(e => e >= 0 ? "var(--s2)" : "var(--s1)") }], legend: false, height: 200, aria: "Error by product" });
        const big = ACC[apes.indexOf(Math.max.apply(null, apes))];
        $("#ac-say", root).innerHTML = `Three verdicts on the same forecast. <b>MAPE ${pct(mape)}</b> looks awful because the ${big ? big[0].toLowerCase() : "smallest item"} has a huge % error on tiny volume. <b>WAPE ${pct(wape)}</b> (accuracy ${pct(Math.max(0, 1 - wape))}) weights by volume. And at total level the error is only <b>${pct(tot)}</b>, because overs and unders cancel. I'd report WAPE and bias at product level, and say that the total looks better because errors offset.`;
      };
      ACC.forEach((_, i) => { $("#ac-f" + i, root).addEventListener("input", calc); $("#ac-a" + i, root).addEventListener("input", calc); }); calc();
      const snaps = [["Oct (lag 5)", 5800], ["Nov (lag 4)", 5600], ["Dec (lag 3)", 5500], ["Jan (lag 2)", 5250], ["Feb (lag 1)", 5150], ["Mar (lag 0)", 5050]], act = 5000;
      const drawLag = L => {
        L = +L; const k = 5 - L, f = snaps[k][1], e = (f - act) / act;
        PA.line($("#lag-chart", root), { labels: snaps.map(s => s[0]), series: [{ name: "Forecast for March, as made in each month", data: snaps.map(s => s[1]), color: "var(--s1)", dots: true, width: 2.6 }], hlines: [{ y: act, label: "actual 5,000", color: "var(--s3)" }], marks: [{ x: k, y: f, label: "the one that counts", color: "var(--bad)" }], yMin: 4800, yMax: 6000, aria: "Forecast waterfall converging on actual" });
        $("#lag-k", root).innerHTML = PA.kpi("Forecast that counts", fmt(f)) + PA.kpi("Error", sgn(f - act)) + PA.kpi("Lag-" + L + " accuracy", pct(1 - Math.abs(e)), "good") + PA.kpi("Lag-0 accuracy (flattering)", pct(1 - Math.abs(snaps[5][1] - act) / act));
        $("#lag-say", root).innerHTML = `With a ${L}-month lead time, supply committed to March based on the <b>${snaps[k][0].split(" ")[0]}</b> forecast of ${fmt(f)}. Judge the forecast at <b>lag ${L}</b>: ${pct(1 - Math.abs(e))} accurate. Measuring the last-minute lag-0 number (${pct(1 - Math.abs(snaps[5][1] - act) / act)}) would flatter the process, because by then nothing could change.`;
      };
      PA.onChips(root, "lag", drawLag); drawLag(3);
    },
    ask: ["How do you measure forecast accuracy?", "WAPE for the headline, total absolute error over total actual, because it weights by volume, reported as accuracy = 1 − WAPE, alongside bias for direction. I'd measure at the lag that matches the supply lead time, at the level decisions are made, and say why total-level accuracy looks better than SKU level. MAPE only as a supporting view, because small items distort it."],
    boss: [
      { q: "Forecast 200, actual 160. Absolute percentage error (relative to actual)?", o: ["20%", "25%", "40%", "80%"], a: 1, why: "|200 − 160| ÷ 160 = 40 ÷ 160 = 25%." },
      { q: "Total absolute error 50, total actual 400. What is accuracy (1 − WAPE)?", o: ["12.5%", "50%", "87.5%", "92%"], a: 2, why: "WAPE = 50 ÷ 400 = 12.5%, so accuracy = 87.5%." },
      { q: "Your supply lead time is 3 months. Which forecast should accuracy be measured on?", o: ["The latest one (lag 0)", "The one made 3 months before (lag 3)", "The average of all of them", "The annual budget"], a: 1, why: "Supply acted on the forecast made one lead time ahead. That's the one whose errors turn into stock-outs or excess." }
    ],
    take: ["Error = F − A (say your convention). Report accuracy and bias together.", "WAPE weights by volume; MAPE is distorted by small items; RMSE punishes big misses.", "Measure at the lead-time lag and the decision level. Totals flatter because errors cancel."],
    mnem: ["“Weight it, lag it, sign it”", "Use WAPE (weighted), measure at the lead-time lag, and always state the bias sign."]
  });

  /* ======================= 09 FORECAST BIAS ======================= */
  PA.modules.push({
    id: "bias", num: 9, act: 3, mins: 10,
    title: "Forecast bias",
    tag: "Errors that always lean the same way, and the tracking signal that catches them",
    line: "Random errors cancel out over time. Bias doesn't: it leans the same way month after month, and inventory piles up or runs out until someone notices. The tracking signal is the alarm.",
    html() {
      return PA.sec("01", "The idea", `<div class="prose"><p><b>Bias</b> is the average direction of your errors. With error = F − A, positive bias means you forecast too high (over-forecasting) and negative means too low.</p></div>
        <div class="grid2"><div class="formula">Bias % = Σ(F − A) ÷ ΣA</div><div class="formula">Tracking signal = Σ(F − A) ÷ MAD</div></div>
        <div class="prose"><p>The <b>tracking signal</b> divides the running total of errors by the average absolute error (MAD). An unbiased forecast hovers around zero. A common rule of thumb: beyond <b>±4</b> the forecast is probably biased, so investigate. Some teams use wider limits, up to ±6.</p><p class="small muted">Many textbooks use error = A − F, which flips the sign of the tracking signal. The ±4 test works either way.</p></div>`) +
        PA.sec("02", "See it: same accuracy, different damage", `<div class="card flat"><div class="chart" id="bi-cum"></div><p class="say" id="bi-cumsay"></p></div>`) +
        PA.sec("03", "Live example: the tracking signal by hand", `<div class="tbl" id="bi-tbl"></div><div class="callout warn" id="bi-tsay"></div>`) +
        PA.sec("04", "Simulate: the bias detector", `<div class="card flat sim"><div class="sim-h">${PA.chips("bi-mode", [["human", "Human bias"], ["model", "Model lag on a growing product"]], "human")}</div>
          <div class="ctls" id="bi-ctl-h">${PA.ctl("bi-b", "Built-in bias", -20, 20, 1, 6, "%")}${PA.ctl("bi-n", "Random noise", 0, 25, 1, 8, "%")}</div>
          <div class="ctls" id="bi-ctl-m" hidden>${PA.ctl("bi-g", "Real growth per month", 0, 6, 0.5, 3, "%")}${PA.ctl("bi-al", "SES α", 0.05, 0.95, 0.05, 0.2)}</div>
          <div class="chart" id="bi-fa"></div><div class="chart" id="bi-ts"></div><p class="say" id="bi-say"></p></div>`) +
        PA.sec("05", "Go deeper", `<details class="deep"><summary>Why safety stock can't fix bias</summary><div><p>Safety stock (module 15) covers random variation around a correct centre. Bias moves the centre. A +5% bias on 10,000 units a month adds 500 extra units every month: 6,000 excess after a year, no matter how much safety stock you hold.</p></div></details>
          <details class="deep"><summary>Where bias comes from</summary><div><p><b>People:</b> sales inflating forecasts to secure supply, sandbagging to beat quota, targets loaded as forecasts, optimism about launches. <b>Models:</b> exponential smoothing on a growing product lags behind; seasonal naive ignores growth. <b>Process:</b> buffers added at several levels, uncleaned history. Module 10 goes cause by cause.</p></div></details>
          <details class="deep"><summary>How teams fix it</summary><div><p>Track bias by contributor (stat model, sales override, marketing uplift) using FVA. Feed back with numbers, not blame. Separate the forecast from the target, so nobody has a reason to bend it. For model lag, add a trend term or use a model that has one.</p></div></details>`);
    },
    mount(root) {
      const r0 = rng(31), n = 12, A = Array.from({ length: n }, () => Math.round(1000 * (1 + 0.08 * gauss(r0))));
      const r1 = rng(32), Fu = A.map(a => Math.round(a * (1 + 0.09 * gauss(r1)))), Fb = A.map((a, i) => Math.round(a * 1.06 + (Fu[i] - a) * 0.1));
      const cum = F => { let c = 0; return F.map((f, i) => (c += f - A[i])); };
      const wU = fc.metrics(Fu, A, 0, n).wape, wB = fc.metrics(Fb, A, 0, n).wape;
      PA.line($("#bi-cum", root), { labels: MONTHS, series: [{ name: "Noisy but unbiased: cumulative error", data: cum(Fu), color: "var(--s1)", width: 2.6 }, { name: "Biased +6%: cumulative error", data: cum(Fb), color: "var(--bad)", width: 2.6 }], hlines: [{ y: 0, color: "var(--muted)" }], aria: "Cumulative error of a biased and an unbiased forecast" });
      $("#bi-cumsay", root).innerHTML = `${wB <= wU ? `The biased forecast even scores <b>better</b> on accuracy (WAPE ${pct(wB)} vs ${pct(wU)}).` : `The two forecasts score similarly on accuracy (WAPE ${pct(wB)} vs ${pct(wU)}).`} But the unbiased one's errors cancel, so its running total stays near zero, while the biased one's running total climbs every month: after a year it has forecast <b>${fmt(cum(Fb)[11])}</b> units too many. That's stock sitting in a warehouse, and an accuracy report alone would never show it.`;
      const ex = [[100, 105], [96, 104], [105, 108], [98, 104], [102, 106], [99, 103]];
      let ce = 0, sa = 0; const rows = ex.map((r, i) => { const e = r[1] - r[0]; ce += e; sa += Math.abs(e); const mad = sa / (i + 1); return [i + 1, r[0], r[1], e, ce, mad, ce / mad]; });
      $("#bi-tbl", root).innerHTML = `<table><thead><tr><th>Month</th><th class="n">Actual</th><th class="n">Forecast</th><th class="n">Error F − A</th><th class="n">Running Σ</th><th class="n">MAD</th><th class="n">Tracking signal</th></tr></thead><tbody>${rows.map(r => `<tr${Math.abs(r[6]) > 4 ? ' class="hl"' : ""}><td>${r[0]}</td><td class="n">${r[1]}</td><td class="n">${r[2]}</td><td class="n">${sgn(r[3])}</td><td class="n">${r[4]}</td><td class="n">${r[5].toFixed(2)}</td><td class="n"><b>${r[6].toFixed(1)}</b></td></tr>`).join("")}</tbody></table>`;
      $("#bi-tsay", root).innerHTML = "<b>Every error is positive, so the signal climbs: 1, 2, 3, 4, 5, 6.</b> It reaches the limit in month 4 and breaks through in month 5. Each error is small (about 5 units, or 5%), so the accuracy report looks fine, but the forecast is consistently too high. Time to find out who or what is adding the extra.";
      let mode = "human", V = {};
      const draw = () => {
        const N = 18, r = rng(44), act = [], f = [];
        if (mode === "human") { for (let t = 0; t < N; t++) { const a = 1000 * (1 + 0.04 * gauss(r)); act.push(a); f.push(a * (1 + V["bi-b"] / 100) * (1 + V["bi-n"] / 100 * gauss(r))); } }
        else { for (let t = 0; t < N; t++) act.push(1000 * Math.pow(1 + V["bi-g"] / 100, t) * (1 + 0.03 * gauss(r))); const s = fc.ses(act, V["bi-al"]); for (let t = 0; t < N; t++) f.push(t ? s[t] : act[0]); }
        let c = 0, sa = 0; const ts = f.map((x, i) => { c += x - act[i]; sa += Math.abs(x - act[i]); const mad = sa / (i + 1); return mad ? c / mad : 0; });
        const lab = Array.from({ length: N }, (_, i) => "M" + (i + 1)), alarm = ts.findIndex(v => Math.abs(v) > 4);
        PA.line($("#bi-fa", root), { labels: lab, series: [{ name: "Actual", data: act, color: "var(--s0)", width: 2.6 }, { name: "Forecast", data: f, color: "var(--s2)", dash: "6 3" }], height: 200, aria: "Forecast versus actual" });
        PA.line($("#bi-ts", root), { labels: lab, series: [{ name: "Tracking signal", data: ts, color: "var(--s5)", width: 2.6, dots: true }], hbands: [{ y0: 4, y1: 12, color: "var(--bad)", op: 0.12, label: "biased high" }, { y0: -12, y1: -4, color: "var(--bad)", op: 0.12 }], hlines: [{ y: 4, label: "+4", color: "var(--bad)" }, { y: -4, label: "−4", color: "var(--bad)" }], yMin: -12, yMax: 12, marks: alarm >= 0 ? [{ x: alarm, y: clamp(ts[alarm], -12, 12), label: "alarm", color: "var(--bad)" }] : [], height: 210, aria: "Tracking signal with control limits" });
        const m = fc.metrics(f, act, 0, N);
        $("#bi-say", root).innerHTML = (alarm >= 0 ? `<b>Alarm in month ${alarm + 1}.</b> ` : "<b>No alarm.</b> ") + `Bias ${(m.bias > 0 ? "+" : "") + pct(m.bias)}, accuracy ${pct(m.acc)}. ` + (mode === "model" ? "Nobody here is lying: exponential smoothing has no trend term, so on a growing product it always trails behind. That's model-induced negative bias. Fix it with a model that has a trend (Holt), not by shouting at the planners." : Math.abs(V["bi-b"]) <= 1 ? "With no built-in bias, the signal wanders around zero however noisy it gets." : "Raise the noise and the alarm comes later: noise hides bias. That's why you track bias explicitly, not just accuracy.");
      };
      PA.bindCtls(root, ["bi-b", "bi-n", "bi-g", "bi-al"], v => { V = v; draw(); }, { "bi-b": x => (x > 0 ? "+" : "") + x + "%", "bi-al": x => x.toFixed(2), "bi-g": x => x.toFixed(1) + "%" });
      PA.onChips(root, "bi-mode", v => { mode = v; $("#bi-ctl-h", root).hidden = v !== "human"; $("#bi-ctl-m", root).hidden = v !== "model"; draw(); if (v === "model") PA.miniWin("bi-model", 5, "found model-induced bias"); });
    },
    ask: ["Accuracy looks fine but inventory keeps building. What's going on?", "Probably bias. Accuracy measures the size of errors, not their direction, so a forecast can be 90% accurate and still be too high every month. I'd check bias and the tracking signal by product and by contributor (stat model, sales overrides, marketing uplifts), and also look for buffers stacked at several levels and sell-in running ahead of sell-through."],
    boss: [
      { q: "Six months of errors (F − A) sum to +30 and MAD is 5. Tracking signal and verdict?", o: ["+1.2: fine", "+6: biased high", "−6: biased low", "+30: can't tell"], a: 1, why: "TS = 30 ÷ 5 = +6, beyond the usual ±4 limit. Using F − A, positive means forecasts are consistently too high." },
      { q: "Bias is +15% (with error = F − A). What's happening?", o: ["Under-forecasting", "Over-forecasting", "Accuracy is 85%", "Nothing: bias is fine"], a: 1, why: "Positive Σ(F − A) means forecasts exceed actuals on balance, so excess inventory builds." },
      { q: "Why can't safety stock fix a biased forecast?", o: ["Safety stock is too expensive", "It covers random variation around the forecast, but bias shifts the centre itself", "It only works for A items", "It can, if you double it"], a: 1, why: "Safety stock absorbs noise. A biased forecast is wrong in the same direction every period, so the error accumulates whatever buffer you hold." }
    ],
    take: ["Bias = direction of error; accuracy = size. Track both.", "Tracking signal = running Σ error ÷ MAD; beyond ±4 means investigate.", "Bias comes from people (targets, sandbagging), models (lagging trend) and process (stacked buffers)."],
    mnem: ["“Noise cancels, bias compounds”", "Random errors wash out; biased errors pile up as stock or stock-outs."]
  });

  /* ======================= 10 OVER- AND UNDER-FORECASTING ======================= */
  PA.modules.push({
    id: "over-under", num: 10, act: 3, mins: 11,
    title: "Over- and under-forecasting",
    tag: "The usual causes, what each mistake costs, and where to put the asymmetry",
    line: "Over-forecasting fills warehouses; under-forecasting empties shelves. Both have causes you can name, and the costs are rarely equal. Keep the forecast honest and put the asymmetry in the buffer.",
    html() {
      const over = [["H", "Hype", "Optimism about launches and hockey-stick plans."], ["O", "One-offs left in history", "A bulk order or event that never got cleaned out."], ["P", "Promotions double-counted", "A promo uplift added on top of a baseline that already contains last year's promo."], ["E", "Extra buffers stacked", "5% at region, country and HQ is about 15.8% in total."], ["D", "Demand cannibalised but ignored", "The successor launches; the old model's forecast doesn't drop."], ["", "Also", "Targets or budgets loaded as forecasts; inflating orders to win allocation; launch pipeline fill mistaken for demand."]];
      const under = [["S", "Sandbagging", "Sales lowball to beat quota."], ["L", "Lagging models", "Moving averages and SES trail a growing trend."], ["I", "Ignored events", "Promotions, competitor stock-outs, viral moments not in the plan."], ["C", "Censored demand", "Stock-outs recorded as low sales, so the model learns demand was low."], ["E", "Expanded channels missed", "A new retailer or online channel nobody told planning about."], ["", "Also", "Using shipments when the channel was destocking; over-aggressive outlier removal."]];
      const card = (l, cls) => l.map(x => `<div class="def"><b>${x[0] ? `<span class="pill ${cls}">${x[0]}</span> ` : ""}${x[1]}</b><small>${x[2]}</small></div>`).join("");
      return PA.sec("01", "The idea: two failure modes", `<div class="grid2"><div class="callout bad"><b>Over-forecast → too much stock</b><span>Holding cost, aging, markdowns, price protection paid to accounts, obsolescence write-offs, cash tied up, crowded warehouses.</span></div><div class="callout warn"><b>Under-forecast → too little stock</b><span>Stock-outs, lost sales, expensive air freight, missed OTIF, lost shelf space, customers switching brand, panic orders upstream.</span></div></div>`) +
        PA.sec("02", "See it: the usual suspects", `<h3>Over-forecasting: you <span style="color:var(--bad)">HOPED</span> too much</h3><div class="defs">${card(over, "bad")}</div><h3>Under-forecasting: it <span style="color:var(--warn)">SLICEs</span> your sales</h3><div class="defs">${card(under, "warn")}</div>`) +
        PA.sec("03", "Simulate: what does a miss cost?", `<div class="card flat sim"><p class="small">A phone: actual demand 10,000 units, cost $500, margin $250 a unit, holding cost 25% a year. Air freight to recover a shortage costs an extra $40 a unit. Move the forecast error and watch the cost.</p>
          <div class="ctls">${PA.ctl("ou-e", "Forecast error vs actual", -40, 40, 1, 15, "%")}${PA.ctl("ou-md", "Markdown on leftovers (% of cost)", 0, 50, 1, 20, "%")}${PA.ctl("ou-m", "Months to clear excess", 1, 12, 1, 3)}${PA.ctl("ou-x", "Shortage recovered by air freight", 0, 80, 5, 30, "%")}</div>
          <div class="chart" id="ou-chart"></div><div class="kpis" id="ou-k"></div><p class="say" id="ou-say"></p></div>`) +
        PA.sec("04", "Game: Forecast Detective", `<p class="small">Each case file describes a forecast that went wrong. Name the direction and the root cause.</p><div id="ou-game"></div>`) +
        PA.sec("05", "Go deeper", `<details class="deep"><summary>The critical ratio: putting asymmetry in the right place</summary><div><p>When a shortage costs more than an excess, it's rational to hold extra stock. But the extra belongs in the <b>buffer or safety stock</b>, not in the forecast. Inflate the forecast and every downstream user (finance, supply, the factory) inherits a wrong number.</p><div class="formula">Critical ratio = Cu ÷ (Cu + Co)</div><p>Cu = cost of being one unit short; Co = cost of one unit too many. Stock to that percentile of demand. This is the classic “newsvendor” result.</p></div></details>
          <details class="deep"><summary>Estimating censored demand</summary><div><p>If a product was out of stock for 3 days of a 7-day week and sold 400, a rough estimate of true demand is 400 ÷ (4/7) = 700. Better: use the sell rate on in-stock days at similar stores. Either way, tag the week so the model doesn't learn from a capped number.</p></div></details>
          <details class="deep"><summary>Fix the incentives, not just the numbers</summary><div><p>If sales gets more supply by forecasting high, or a bonus by beating a low forecast, bias will come back however good the model is. Separate the forecast (what will happen) from the target (what we want to happen), and show FVA by contributor.</p></div></details>`);
    },
    mount(root) {
      const D = 10000, C = 500, MG = 250, H = 0.25;
      const draw = v => {
        const md = v["ou-md"] / 100, mo = v["ou-m"], rec = v["ou-x"] / 100;
        const co = C * H / 12 * mo + C * md, cu = rec * 40 + (1 - rec) * MG;
        const cost = e => e >= 0 ? D * e * co : D * -e * cu;
        const xs = []; for (let e = -40; e <= 40; e += 2) xs.push(e);
        const e = v["ou-e"] / 100, cr = cu / (cu + co), z = zOf(clamp(cr, 0.01, 0.99));
        PA.line($("#ou-chart", root), { labels: xs.map(x => (x > 0 ? "+" : "") + x + "%"), series: [{ name: "Cost of the miss", data: xs.map(x => cost(x / 100)), color: "var(--s5)", width: 2.6, area: true }], marks: [{ x: (v["ou-e"] + 40) / 2, y: cost(e), label: money(cost(e)), color: e >= 0 ? "var(--bad)" : "var(--warn)" }], yZero: true, yTick: x => "$" + (x >= 1e6 ? (x / 1e6).toFixed(1) + "M" : (x / 1e3).toFixed(0) + "k"), yFmt: x => money(x), aria: "Cost of forecast error, over versus under", xLabelW: 48 });
        $("#ou-k", root).innerHTML = PA.kpi(e >= 0 ? "Excess units" : "Short units", fmt(Math.abs(e) * D), e >= 0 ? "bad" : "warn") + PA.kpi("Cost per unit over (Co)", money(co, 2)) + PA.kpi("Cost per unit short (Cu)", money(cu, 2)) + PA.kpi("Cost of this miss", money(cost(e)), "acc") + PA.kpi("Critical ratio", pct(cr, 0), "good");
        $("#ou-say", root).innerHTML = `Being short costs <b>${money(cu, 0)}</b> a unit; being over costs <b>${money(co, 0)}</b>. The cost curve is ${cu > co ? "steeper on the under side" : "steeper on the over side"}. The critical ratio is <b>${pct(cr, 0)}</b>, so stock to about the ${pct(cr, 0)} point of demand: about ${z >= 0 ? "+" : ""}${z.toFixed(2)} standard deviations ${z >= 0 ? "above" : "below"} the forecast. Put that cushion in safety stock and keep the forecast itself unbiased.`;
      };
      PA.bindCtls(root, ["ou-e", "ou-md", "ou-m", "ou-x"], draw, { "ou-e": x => (x > 0 ? "+" : "") + x + "%" });
      if (PA.games.detective) PA.games.detective.mount($("#ou-game", root), { embedded: true });
    },
    ask: ["What causes over-forecasting, and how would you spot it?", "Usually optimism or targets loaded as forecasts, one-offs left in history, promotions double-counted, buffers stacked at several levels, and cannibalisation ignored at launches. I'd spot it with a positive bias and a tracking signal beyond +4, then trace it by contributor with FVA. The fix is cleaning, separating targets from forecasts, and putting any deliberate cushion into safety stock."],
    boss: [
      { q: "Earbuds stocked out for three weeks last August. This August's forecast is low again. Direction and cause?", o: ["Over: hype", "Under: censored demand", "Over: buffer stacking", "Under: sandbagging"], a: 1, why: "Stock-outs capped recorded sales, so the history understates real demand, and the model repeats the mistake." },
      { q: "Region adds a 5% buffer, the country adds 5%, HQ adds 5%. Total inflation?", o: ["5%", "10%", "15%", "About 15.8%"], a: 3, why: "1.05 × 1.05 × 1.05 = 1.158, so about 15.8% above the honest forecast." },
      { q: "Margin lost per unit short: $300. Loss per unsold unit: $150. Critical ratio?", o: ["33%", "50%", "67%", "200%"], a: 2, why: "Cu ÷ (Cu + Co) = 300 ÷ 450 ≈ 67%. Stock to about the 67th percentile of demand, via safety stock rather than by inflating the forecast." }
    ],
    take: ["Over: you HOPED (Hype, One-offs, Promos double-counted, Extra buffers, Demand cannibalised).", "Under: it SLICEs (Sandbagging, Lagging models, Ignored events, Censored demand, Expanded channels).", "Shortage and excess cost different amounts. Keep the forecast honest and put the asymmetry in safety stock."],
    mnem: ["HOPED vs SLICE", "Over-forecast when you HOPED too much; under-forecast when you let something SLICE your sales."]
  });
})();
