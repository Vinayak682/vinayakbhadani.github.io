/* Planner Project missions: eight weeks on the job at Nova Mobile US. Each week is one real situation, run step by step, ending in a story you can tell. */
(function () {
  "use strict";
  const PP = window.PP;
  const { $, $$, esc, fmt, pct, money, sum } = PA.u;
  const tbl = (head, rows, cls) => '<div class="tbl"><table><thead><tr>' + head.map(h => "<th" + (h[1] ? ' class="n"' : "") + ">" + h[0] + "</th>").join("") + "</tr></thead><tbody>" +
    rows.map(r => "<tr" + (r.cls ? ' class="' + r.cls + '"' : "") + ">" + (r.c || r).map((c, i) => "<td" + (head[i] && head[i][1] ? ' class="n' + (String(c).indexOf("?") === 0 ? " blank" : "") + '"' : "") + ">" + c + "</td>").join("") + "</tr>").join("") + "</tbody></table></div>" + (cls || "");
  const line = (el, cfg) => PA.line(el, Object.assign({ yZero: true }, cfg));
  /* the story mentions a wrong first instinct only when there was one */
  const det = (c, D) => (!c || !D[c.first] || D[c.first].ok === true) ? "" : "My first instinct was to " + D[c.first].fs + ", but when I projected it, " + D[c.first].fc + ". ";
  const proj = (el, labels, D, data, chosen, extra) => {
    const cols = ["var(--bad)", "var(--warn)", "var(--good)", "var(--s5)"];
    line(el, Object.assign({ labels, series: D.map((o, i) => ({ name: (i === chosen ? "▶ " : "") + o.short, data: data[i], color: o.ok === true ? "var(--good)" : o.ok === "part" ? "var(--warn)" : cols[i % 2 ? 3 : 0], width: i === chosen ? 3.6 : 1.6, dash: i === chosen ? null : "5 4", dots: i === chosen })), aria: "Projection for each option" }, extra || {}));
  };

  /* ======================= WEEK 40 · READ THE PSI ======================= */
  const D1 = [
    { t: "Load 1,500. The customer knows their business.", short: "Load 1,500", ok: false, fs: "load the 1,500 units", fc: "channel stock climbed to 10,150 units, more than 11 weeks of supply",
      fb: "Vertex's stock would climb to about <b>10,150 units</b> by Week 46: more than 11 weeks of supply. Carriers that full freeze orders, so December sell-in collapses. And if X1's price drops when its successor launches, Nova may owe price protection on every one of those units." },
    { t: "Cut Vertex's sell-in to zero for three weeks to burn the stock off.", short: "Zero for 3 weeks", ok: "part", fs: "stop shipping for three weeks", fc: "it fixed the stock but wiped out three weeks of revenue from our biggest account",
      fb: "Right direction, too blunt. Stock falls fast, but Finance sees almost nothing from your biggest account for three weeks (about 2,700 units, roughly <b>$2.2M</b> of planned sell-in pushed out), and stores with an uneven colour or storage mix run short of the popular ones. Glide down instead." },
    { t: "Show Marcus the numbers: sell-through is flat at ~925 and stock is 7.3 weeks against a 4-week target. Propose ~700 a week until holiday sell-through picks up, unless Vertex has a promotion that explains the build.", short: "~700/wk + ask why", ok: true,
      fb: "Stock glides down to about <b>5,150 by Black Friday week</b>, roughly 4 weeks of holiday demand. No order freeze, no surprise for Finance, and Marcus goes back to Vertex with data instead of a guess. Asking <i>why</i> keeps the door open: if Vertex has a promotion planned, you'd change the number." }
  ];
  PP.missions.push({
    id: "m1", n: 1, week: 40, day: [0], mins: 10, art: "tub", title: "Read the PSI",
    sub: "Your first Monday. The biggest account is buying far more than it sells.",
    hook: "Sell-in is the tap, sell-through is the drain, channel inventory is the water.",
    cast: ["priya", "marcus"],
    steps: [
      { type: "chat", msgs: [
        ["priya", "Welcome to Biz Ops! Every Monday starts the same way: open the <b>PSI</b> and find what moved. Start with our biggest line, <b>Nova X1</b> (our $800 flagship) at <b>Vertex Wireless</b>."],
        ["priya", "PSI = <b>P</b>urchases (what Vertex bought from us: our <b>sell-in</b>), <b>S</b>ales (what Vertex sold to consumers: <b>sell-through</b>), <b>I</b>nventory (what's left in Vertex's warehouses and stores: <b>channel inventory</b>)."],
        ["marcus", "Hey, new planner! Vertex wants <b>1,500 units</b> of X1 again next week for the holiday build. Can you load it?"]
      ] },
      { type: "custom", title: "The picture to remember: the bathtub", mount: tubMount },
      { type: "calc", title: "Fill the gaps in the PSI",
        html: '<p>Two cells are missing. Each week\'s ending stock becomes next week\'s opening stock.</p>' +
          tbl([["Wk"], ["Open", 1], ["P · sell-in", 1], ["S · sell-thru", 1], ["End (EOH)", 1]], [
            ["W35", "4,000", "1,000", "1,000", "4,000"], ["W36", "4,000", "1,200", "950", "4,250"], ["W37", "4,250", "1,500", "980", "? A"],
            ["W38", "? A", "1,600", "900", "? B"], ["W39", "5,470", "1,500", "920", "6,050"], ["W40", "6,050", "1,400", "900", "6,550"]]) +
          '<div class="formula">Ending = Opening + Purchases (sell-in) − Sales (sell-through)</div>',
        fields: [{ label: "A · W37 ending", ans: 4770, tol: 0, suf: "units" }, { label: "B · W38 ending", ans: 5470, tol: 0, suf: "units" }],
        sol: "W37: 4,250 + 1,500 − 980 = <b>4,770</b>. That becomes W38's opening: 4,770 + 1,600 − 900 = <b>5,470</b>. In Excel this is one running formula copied down: <code>=B3+C3-D3</code>." },
      { type: "mcq", title: "What is the PSI telling you?", q: "Look at weeks 37 to 40. What's happening at Vertex?",
        opts: [
          { t: "Vertex is selling more and more X1 to consumers.", ok: false, fb: "Sell-through is flat, even slightly down: 980, 900, 920, 900. The growth is only in what Vertex buys." },
          { t: "Vertex is buying much more than it sells, so stock is piling up in its stores.", ok: true, fb: "Sell-in averaged <b>1,500 a week</b> (W37–W40) while sell-through averaged about <b>925</b>. The gap, about 575 a week, is water filling the tub: channel stock rose from 4,250 to 6,550." },
          { t: "Vertex is about to run out of stock.", ok: false, fb: "The opposite. Stock rose every week." },
          { t: "Nothing unusual. Holiday is coming.", ok: false, fb: "Building some stock before the holidays is normal, but consumers aren't buying more yet, and stock is already well above target." }] },
      { type: "calc", title: "How many weeks will that stock last?",
        html: '<p>Vertex expects to sell <b>900 a week</b> for the next few weeks. Its target is <b>4 weeks of supply</b>.</p><div class="formula">Weeks of supply (WOS) = Ending stock ÷ forward weekly sell-through</div>',
        fields: [{ label: "WOS at the end of W40", ans: 7.28, tol: 0.08, suf: "weeks" }, { label: "Units above the 4-week target", ans: 2950, tol: 0, suf: "units" }],
        sol: "6,550 ÷ 900 = <b>7.3 weeks</b>, nearly double the target. Target stock = 4 × 900 = 3,600, so Vertex holds <b>2,950 units too many</b>. That's about $2.4M of phones at $800." },
      { type: "mcq", title: "Before you reply: reconcile", html: '<p>Marcus forwards Vertex\'s own stock report: <b>6,150</b> units. Our system says <b>6,550</b>. Dev from Supply tells you 300 units shipped on Friday are still on trucks, and Vertex has 100 units boxed up as returns we haven\'t received yet.</p>',
        q: "How much of the gap is still unexplained?",
        opts: [{ t: "400 units", ok: false, fb: "That's the total gap before you explain it." }, { t: "300 units", ok: false, fb: "You've explained the returns but not the trucks." }, { t: "100 units", ok: false, fb: "You've explained the trucks but not the returns." },
          { t: "0 units: fully explained", ok: true, fb: "6,550 − 6,150 = 400 = 300 in transit + 100 pending return. Our system counts a unit at Vertex as soon as it ships; Vertex counts it when it arrives. <b>Always reconcile before you act on a number.</b>" }] },
      { type: "mcq", title: "Your call", key: "m1", decide: true, q: "Marcus wants 1,500 next week. What do you recommend?", opts: D1,
        conseq(el, i) {
          el.innerHTML = '<div class="chart"></div><p class="small muted">Projected channel stock at Vertex. Holiday sell-through rises to 1,500 in Black Friday week (W47).</p>';
          proj($(".chart", el), ["W40", "W41", "W42", "W43", "W44", "W45", "W46", "W47", "W48"], D1, [
            [6550, 7150, 7750, 8350, 8950, 9550, 10150, 9650, 8450], [6550, 5650, 4750, 3850, 3850, 3850, 3850, 3250, 2950], [6550, 6350, 6150, 5950, 5750, 5550, 5350, 5150, 5150]], i,
            { hlines: [{ y: 3600, label: "4-week target (at 900/wk)", color: "var(--s3)" }] });
        } },
      { type: "debrief" }, { type: "story" }
    ],
    recap: "You read a PSI (ending = opening + purchases − sales), saw sell-in running ahead of sell-through, sized the build-up in weeks of supply, reconciled two stock numbers, and turned it into a recommendation with a reason. That is the whole Monday job in one account.",
    concepts: [["PSI and sell-in vs sell-through", "../#concepts"], ["Weeks of supply", "../#practice"], ["Inventory levels", "../arena/#/m/levels"], ["The bullwhip effect", "../arena/#/m/bullwhip"]],
    excel: "<code>=B3+C3-D3</code> for ending stock, copied down · <code>=IFERROR(E3/F3,0)</code> for weeks of supply · conditional formatting turns WOS red when it's more than double the target.",
    qs: ["c-psi", "c-sell", "c-wos", "c-recon", "r-psi"],
    bullet: "Built weekly PSI and weeks-of-supply analysis by account and product; caught sell-in running about 60% above sell-through at the largest account and proposed a sell-in plan that brings channel stock from 7.3 back to about 4 weeks.",
    story(ch) {
      return {
        s: "In Week 40 of my demand planning simulation project, our flagship phone at Vertex Wireless, a carrier and our biggest account, was buying about 1,500 units a week but selling only about 925 to consumers.",
        t: "The account manager asked me to load another 1,500. I had to decide what to recommend.",
        a: "I rebuilt the PSI (opening + purchases − sales), reconciled our 6,550 units against Vertex's 6,150 (300 in transit, 100 pending return) and calculated weeks of supply: 6,550 ÷ 900 = 7.3 weeks against a 4-week target, about 2,950 units too many. " + det(ch.m1, D1) + "I showed the account manager the numbers and proposed about 700 a week until holiday sell-through picked up, unless a promotion explained the build.",
        r: "Projected channel stock glides to about 5,150 by Black Friday week, roughly 4 weeks of holiday demand, instead of over 10,000 units and an order freeze.",
        l: "Sell-in isn't demand; sell-through is. When the two drift apart, the gap is channel inventory, and it predicts the next orders."
      };
    }
  });

  function tubMount(el, ctx, done) {
    const W = [35, 36, 37, 38, 39, 40], P = [1000, 1200, 1500, 1600, 1500, 1400], S = [1000, 950, 980, 900, 920, 900], E = [4000, 4250, 4770, 5470, 6050, 6550];
    const yOf = v => 194 - v / 8000 * 124;
    el.innerHTML = '<p>Before the numbers, the picture. Hold this one in your head for the interview: it explains sell-in, sell-through and channel inventory in one image.</p>' +
      '<div class="tub-wrap"><svg class="tub" viewBox="0 0 320 236" role="img" aria-label="A bathtub. The tap is sell-in, the drain is sell-through and the water level is Vertex\'s channel inventory.">' +
      '<defs><clipPath id="tubclip"><path d="M40 70h240l-14 112a14 14 0 0 1-14 12H68a14 14 0 0 1-14-12z"/></clipPath></defs>' +
      '<path d="M20 22h70v14H76v14H60V36H20z" style="fill:var(--s1)"/>' +
      '<rect id="tb-stream" x="65" y="50" width="6" height="40" rx="3" style="fill:var(--s1);opacity:.55"/>' +
      '<g clip-path="url(#tubclip)"><rect id="tb-water" x="40" y="150" width="240" height="60" style="fill:var(--s1);opacity:.28"/></g>' +
      '<line x1="50" x2="270" y1="' + yOf(3600) + '" y2="' + yOf(3600) + '" style="stroke:var(--s3)" stroke-width="2" stroke-dasharray="6 5"/>' +
      '<text x="268" y="' + (yOf(3600) - 5) + '" text-anchor="end" style="fill:var(--s3)">4-week target</text>' +
      '<path d="M30 70h260" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M40 70l14 112a14 14 0 0 0 14 12h184a14 14 0 0 0 14-12l14-112" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>' +
      '<rect id="tb-drain" x="227" y="194" width="10" height="28" style="fill:var(--s4)"/>' +
      '<text x="98" y="26">SELL-IN · the tap</text><text id="tb-p" class="big" x="98" y="44"></text>' +
      '<text x="218" y="214" text-anchor="end">SELL-THROUGH · the drain</text><text id="tb-s" class="big" x="218" y="231" text-anchor="end"></text>' +
      '<text id="tb-w" class="big" x="160" y="0" text-anchor="middle"></text>' +
      '</svg><div class="stack"><span class="eyebrow" id="tb-wk"></span><div class="kpis"><div class="kpi acc"><span>Channel stock</span><b id="tb-e"></b></div><div class="kpi"><span>Weeks of supply</span><b id="tb-wos"></b></div></div>' +
      '<p class="say" id="tb-say"></p><label class="small muted" for="tb-r">Move through the weeks</label><input type="range" id="tb-r" min="0" max="5" step="1" value="0"><div class="row"><button class="btn sm" type="button" id="tb-play">▶ Play weeks 35–40</button></div></div></div>';
    let fin = false;
    const draw = i => {
      const y = yOf(E[i]);
      $("#tb-water", el).setAttribute("y", y); $("#tb-water", el).setAttribute("height", 200 - y);
      const sw = Math.max(3, P[i] / 1600 * 13); $("#tb-stream", el).setAttribute("x", 68 - sw / 2); $("#tb-stream", el).setAttribute("width", sw); $("#tb-stream", el).setAttribute("height", Math.max(0, y - 50));
      const dw = Math.max(3, S[i] / 1600 * 13); $("#tb-drain", el).setAttribute("x", 232 - dw / 2); $("#tb-drain", el).setAttribute("width", dw);
      $("#tb-p", el).textContent = fmt(P[i]) + " / week"; $("#tb-s", el).textContent = fmt(S[i]) + " / week";
      const lab = $("#tb-w", el); lab.setAttribute("y", Math.min(186, y + 22)); lab.textContent = fmt(E[i]) + " in the channel";
      $("#tb-wk", el).textContent = "Week " + W[i] + " · Nova X1 at Vertex";
      $("#tb-e", el).textContent = fmt(E[i]); $("#tb-wos", el).textContent = (E[i] / 900).toFixed(1);
      $("#tb-say", el).innerHTML = i === 0 ? "Tap and drain are equal (1,000 in, 1,000 out), so the water level stays put. Healthy." : P[i] > S[i] ? "The tap (" + fmt(P[i]) + ") runs faster than the drain (" + fmt(S[i]) + "), so the water rises by <b>" + fmt(P[i] - S[i]) + "</b>. Stock is piling up at Vertex." : "The drain runs faster than the tap, so the water level falls.";
      if (i === 5 && !fin) { fin = true; done(); }
    };
    const r = $("#tb-r", el); r.addEventListener("input", () => draw(+r.value));
    let timer = null;
    $("#tb-play", el).addEventListener("click", () => { if (timer) return; let i = 0; r.value = 0; draw(0); timer = setInterval(() => { i++; r.value = i; draw(i); if (i >= 5) { clearInterval(timer); timer = null; } }, 900); });
    ctx.cleanup(() => { if (timer) clearInterval(timer); });
    draw(0);
  }

  /* ======================= WEEK 41 · THE SPIKE ======================= */
  const D2 = [
    { t: "Raise the baseline to 1,650 a week, as Elena asked.", short: "Raise to 1,650", ok: false, fs: "raise the baseline to 1,650", fc: "it over-forecast by about 3,300 units, roughly $990,000 of phones",
      fb: "Over the next five weeks MegaMart actually sold about <b>4,950</b>. You'd have planned <b>8,250</b>: 3,300 extra units, about <b>$990,000</b> of A5 with nowhere to go." },
    { t: "Tag Week 41 as a promotion: keep the baseline at about 1,000, save the +65% lift in the event library, and expect a small dip next week.", short: "Tag as promo", ok: true,
      fb: "Your forecast for the next five weeks totals 4,950, exactly what sold, with a weekly error of about 1.6%. You even caught the dip: Week 42 came in at 920 because some buyers had bought early. And you now know what a $50-off weekend does at MegaMart." },
    { t: "Delete Week 41 from the history as bad data.", short: "Delete the week", ok: "part", fs: "delete the week as bad data", fc: "the forecast was fine but I'd thrown away the promo lift I'd need for Black Friday",
      fb: "The forecast stays right for now, but the data wasn't bad: it was a real promotion. You've thrown away the lift. When MegaMart runs the same promo on Black Friday, you'll have nothing to plan it with." }
  ];
  PP.missions.push({
    id: "m2", n: 2, week: 41, day: [1], mins: 9, art: "spike", title: "The spike",
    sub: "MegaMart's sales jumped 65% in one week. The account manager wants the forecast raised.",
    hook: "A spike with a flag on it: an event, not the new normal.",
    cast: ["priya", "elena"],
    steps: [
      { type: "chat", msgs: [
        ["priya", "Tuesday is cleaning day. Before Wednesday's cutoff we fix the history and shape the future."],
        ["elena", "Great news!! <b>Nova A5</b> (our $300 phone) sell-through at MegaMart jumped to <b>1,650</b> last week. Consumers love it. Can we raise the forecast to 1,650 a week going forward?"],
        ["priya", "Before anyone touches the forecast, two questions: <b>is it real?</b> and <b>will it repeat?</b>"]
      ] },
      { type: "info", title: "The history", html: '<div class="chart" id="m2c"></div><p class="small muted">Nova A5 sell-through at MegaMart, units per week.</p>',
        mount(el) { line($("#m2c", el), { labels: ["W33", "W34", "W35", "W36", "W37", "W38", "W39", "W40", "W41"], series: [{ name: "Sell-through", data: [1000, 980, 1030, 990, 1010, 1020, 990, 1000, 1650], color: "var(--s1)", width: 3, dots: true }], marks: [{ x: 8, y: 1650, label: "1,650", color: "var(--s2)" }], aria: "A5 sell-through, flat near 1,000 with a spike to 1,650 in week 41" }); } },
      { type: "clues", title: "Investigate: open at least three clues", need: 3, clues: [
        ["Data feed", "1,180 of 1,180 stores reported, the same as every week. No duplicate files."],
        ["Sales by day", "Monday to Thursday about 140 a day, which is normal. Friday to Sunday about 360 a day."],
        ["MegaMart's weekly ad", "Week 41, Friday to Sunday only: <b>“Nova A5 $249 (save $50)”</b>."],
        ["Price next week", "Back to $299 from Monday."],
        ["Competitors", "No competitor stock-outs or price changes reported."],
        ["MegaMart's stock", "Fell from 4,000 to 3,350: still more than 3 weeks of supply. No stock-out."]] },
      { type: "mcq", title: "What caused it?", q: "What caused the spike?",
        opts: [{ t: "A real, lasting jump in demand", ok: false, fb: "Monday to Thursday were normal. Only the weekend jumped, and the price goes back up on Monday." },
          { t: "A data error", ok: false, fb: "All stores reported once, as usual. The sales are real." },
          { t: "A one-weekend $50-off promotion", ok: true, fb: "The weekend-only daily pattern, the ad and the price going back to $299 all point the same way. It's an <b>event</b>, not a new normal." },
          { t: "A competitor ran out of stock", ok: false, fb: "No competitor issues were reported." }] },
      { type: "calc", title: "Size the lift", html: "<p>Normal (baseline) demand is about <b>1,000</b> a week.</p><div class=\"formula\">Lift = (event week − baseline) ÷ baseline</div>",
        fields: [{ label: "Lift in units", ans: 650, tol: 0, suf: "units" }, { label: "Lift in %", ans: 65, tol: 0.5, suf: "%" }],
        sol: "1,650 − 1,000 = <b>650 units</b>; 650 ÷ 1,000 = <b>65%</b>. Write it in your event library: <i>MegaMart · A5 · $50 off · weekend · +65%</i>. Next time MegaMart plans that promo, you'll forecast the lift instead of guessing it." },
      { type: "mcq", title: "Your call", key: "m2", decide: true, q: "How do you treat Week 41?", opts: D2,
        conseq(el, i) {
          el.innerHTML = '<div class="chart"></div><p class="small muted">Forecast for weeks 42–46 under each choice, against what actually sold (black).</p>';
          const nul = n => Array(n).fill(null), act = [1000, 1650, 920, 990, 1010, 1000, 1030];
          const fc = [nul(2).concat([1650, 1650, 1650, 1650, 1650]), nul(2).concat([950, 1000, 1000, 1000, 1000]), nul(2).concat([1000, 1000, 1000, 1000, 1000])];
          line($(".chart", el), { labels: ["W40", "W41", "W42", "W43", "W44", "W45", "W46"], series: D2.map((o, k) => ({ name: (k === i ? "▶ " : "") + o.short, data: fc[k], color: o.ok === true ? "var(--good)" : o.ok === "part" ? "var(--warn)" : "var(--bad)", width: k === i ? 3.6 : 1.6, dash: k === i ? null : "5 4" })).concat([{ name: "Actual", data: act, color: "var(--s0)", width: 2.4, dots: true }]), aria: "Forecast options against actual sales" });
        } },
      { type: "debrief" }, { type: "story" }
    ],
    recap: "You treated a spike as a question, not an answer: checked the data was real, found the cause, sized the lift, protected the baseline and kept the lift for next time. That is demand <b>cleansing</b> (fixing history) feeding demand <b>shaping</b> (planning the next promo).",
    concepts: [["Demand cleaning and shaping", "../#concepts"], ["The demand planning cycle", "../arena/#/m/dp-cycle"], ["Over- and under-forecasting", "../arena/#/m/over-under"]],
    excel: "Add an <i>Event</i> column and tag promo weeks · baseline = <code>=AVERAGEIFS(Sales, Event, \"\")</code> so tagged weeks are skipped · lift = <code>=(B10-Baseline)/Baseline</code>.",
    qs: ["c-clean", "s-spike", "p-cycle", "r-clean", "b-mistake"],
    bullet: "Cleansed a promotion-driven spike (+65%) from demand history and started an event-lift library, avoiding about 3,300 units (about $990k) of over-forecast.",
    story(ch) {
      return {
        s: "In Week 41 of my simulation project, our $300 phone at MegaMart jumped from about 1,000 to 1,650 units in one week, and the account manager wanted the forecast raised to match.",
        t: "Decide, before the weekly cutoff, whether the spike was the new normal.",
        a: "I checked the data first (every store reported once, no duplicates), then looked at sales by day: normal Monday to Thursday, about 360 a day Friday to Sunday. MegaMart's ad showed a weekend-only $50-off promotion. " + det(ch.m2, D2) + "I tagged the week as a promo, kept the baseline at about 1,000 and saved the 65% lift in an event library.",
        r: "The next five weeks totalled 4,950 units, exactly what I forecast. Raising the baseline would have meant about 3,300 extra units, roughly $990k of stock.",
        l: "A spike is a question, not an answer. I ask “is it real?” and “will it repeat?” before I move a baseline."
      };
    }
  });

  /* ======================= WEEK 42 · THE EMPTY SHELF ======================= */
  const D3 = [
    { t: "Flag Week 42 as a stock-out week, keep the forecast at about 2,000, make sure the 3,000 delayed units land on Tuesday, and report the lost sales.", short: "Keep ~2,000", ok: true,
      fb: "Demand over the next four weeks was about <b>8,300</b>; your plan of 2,000 a week covers almost all of it, and safety stock absorbs the rest. You also told the business what the empty shelf cost: about <b>$108,000</b>." },
    { t: "Lower the forecast to 1,100. That's what sold.", short: "Cut to 1,100", ok: false, fs: "cut the forecast to what sold", fc: "it would have lost about 3,900 more units, roughly $468,000, over four weeks",
      fb: "The model learns that demand halved. You order half as much, the shelf empties again, and next week's low sales “prove” you right. That's the stock-out doom loop: about <b>3,900 units (~$468,000)</b> lost over four weeks." },
    { t: "Raise it to 2,900 to win back the 900 lost units.", short: "Raise to 2,900", ok: "part", fs: "raise the forecast to win the lost sales back", fc: "it would have built about 3,300 extra units of earbuds",
      fb: "Some shoppers come back, but many already bought elsewhere. Planning on all of them returning builds about <b>3,300 extra units (~$396,000)</b> over four weeks. Keep 2,000 and watch the first in-stock week." }
  ];
  PP.missions.push({
    id: "m3", n: 3, week: 42, day: [1], mins: 9, art: "shelf", title: "The empty shelf",
    sub: "Earbud sales crashed 45% online. Is demand fading, or is something else going on?",
    hook: "Sales fell because the shelf was empty, not because people stopped wanting it.",
    cast: ["sam", "priya"],
    steps: [
      { type: "chat", msgs: [
        ["sam", "Heads up: <b>Nova Buds</b> ($120 earbuds) sell-through at ShopFast crashed. <b>1,100</b> last week against about <b>2,000</b> normally. Maybe the hype is fading? Should we cut the forecast?"],
        ["priya", "A 45% drop in one week is rarely demand. <b>Sales can only happen when there's stock.</b> Check what the shelf looked like before you touch anything."]
      ] },
      { type: "info", title: "The history", html: '<div class="chart" id="m3c"></div>',
        mount(el) { line($("#m3c", el), { labels: ["W36", "W37", "W38", "W39", "W40", "W41", "W42"], series: [{ name: "Sell-through", data: [2050, 1980, 2010, 1990, 2020, 2000, 1100], color: "var(--s4)", width: 3, dots: true }], marks: [{ x: 6, y: 1100, label: "1,100", color: "var(--bad)" }], aria: "Earbud sell-through near 2,000 a week, falling to 1,100 in week 42" }); } },
      { type: "clues", title: "Investigate: open at least three clues", need: 3, clues: [
        ["Sales by day, W42", "Mon 290 · Tue 285 · Wed 280 · Thu 245 · <b>Fri 0 · Sat 0 · Sun 0</b>."],
        ["ShopFast's stock", "Hit <b>zero on Thursday afternoon</b>. The product page showed “Out of stock” Friday to Sunday."],
        ["Page views", "Normal all week. People were still looking for the earbuds."],
        ["Reviews and returns", "No new quality complaints. Return rate normal."],
        ["Inbound shipment", "3,000 units were due at ShopFast on Thursday. The truck missed its delivery slot; new arrival: <b>Tuesday of W43</b>."],
        ["Competitors", "No price changes."]] },
      { type: "mcq", title: "What caused it?", q: "Why did sales fall?",
        opts: [{ t: "Demand fell: the hype is fading", ok: false, fb: "Page views stayed normal and Monday to Wednesday sold at the usual rate. People still wanted them." },
          { t: "A stock-out: there was nothing to sell from Thursday to Sunday", ok: true, fb: "Sales were capped by stock, not by demand. The 1,100 is a <b>censored</b> number: it tells you what was available, not what people wanted." },
          { t: "A data error", ok: false, fb: "The zero days match the zero stock. The data is right; it's measuring the wrong thing." },
          { t: "A price increase", ok: false, fb: "Prices didn't change." }] },
      { type: "calc", title: "Estimate what demand really was", html: "<p>While in stock (Monday to Wednesday) the earbuds sold about <b>285 a day</b>. Recorded sales were <b>1,100</b>. ASP is <b>$120</b>.</p><div class=\"formula\">True weekly demand ≈ average in-stock daily sales × 7</div>",
        fields: [{ label: "True weekly demand", ans: 1995, tol: 60, suf: "units" }, { label: "Units of demand lost", ans: 900, tol: 60, suf: "units" }, { label: "Revenue lost", ans: 108000, tol: 8000, pre: "$" }],
        sol: "(290 + 285 + 280) ÷ 3 = 285 a day × 7 ≈ <b>2,000</b> a week. 2,000 − 1,100 = <b>900 units</b> lost. 900 × $120 ≈ <b>$108,000</b>." },
      { type: "mcq", title: "Your call", key: "m3", decide: true, q: "What do you do with the forecast?", opts: D3,
        conseq(el, i) {
          el.innerHTML = '<div class="chart"></div><p class="small muted">Weekly supply you would plan under each choice, against true demand (black) for weeks 43–46.</p>';
          const nul = [null];
          line($(".chart", el), { labels: ["W42", "W43", "W44", "W45", "W46"], series: D3.map((o, k) => ({ name: (k === i ? "▶ " : "") + o.short, data: nul.concat([[2000, 2000, 2000, 2000], [1100, 1100, 1100, 1100], [2900, 2900, 2900, 2900]][k]), color: o.ok === true ? "var(--good)" : o.ok === "part" ? "var(--warn)" : "var(--bad)", width: k === i ? 3.6 : 1.6, dash: k === i ? null : "5 4" })).concat([{ name: "True demand", data: [1995, 2150, 2050, 2000, 2100], color: "var(--s0)", width: 2.4, dots: true }]), aria: "Supply plans against true demand" });
        } },
      { type: "debrief" }, { type: "story" }
    ],
    recap: "You separated <b>sales</b> (what happened) from <b>demand</b> (what people wanted). A stock-out censors demand, so you estimated the true number from in-stock days, kept the forecast honest, fixed the supply problem and put a dollar figure on what the empty shelf cost.",
    concepts: [["Demand cleaning", "../#concepts"], ["The demand planning cycle", "../arena/#/m/dp-cycle"], ["Safety stock", "../arena/#/m/safety"]],
    excel: "Flag stock-out days with <code>=IF(Stock=0,1,0)</code> · in-stock daily rate = <code>=AVERAGEIFS(Sales, OOS, 0)</code> · true weekly demand = rate × 7.",
    qs: ["c-demand", "s-drop", "b-data", "r-clean"],
    bullet: "Identified a stock-out behind a 45% sales drop, estimated true demand from in-stock days, and quantified about $108k of lost sales instead of cutting the forecast.",
    story(ch) {
      return {
        s: "In Week 42 of my simulation project, earbud sales at an online account fell 45% in one week, from about 2,000 to 1,100.",
        t: "The account manager wanted to cut the forecast. I had to find out whether demand had really dropped.",
        a: "I broke the week into days: normal Monday to Wednesday, then zero from Thursday. The account's stock had hit zero after a delivery truck missed its slot, while page views stayed normal. In-stock days averaged 285 a day, so true demand was still about 2,000. " + det(ch.m3, D3) + "I kept the forecast, flagged the week as a stock-out and confirmed the delayed 3,000 units for Tuesday.",
        r: "Reported about 900 lost units, roughly $108,000. Cutting the forecast would have lost about 3,900 more units over the next four weeks.",
        l: "Sales are not demand. I check stock before I believe a drop."
      };
    }
  });

  /* ======================= WEEK 43 · CUTOFF WEDNESDAY ======================= */
  const D4 = [
    { t: "10,140: Marcus's number. Marcus knows the account.", short: "10,140 (+30%)", ok: false, fs: "load the account manager's 10,140", fc: "it left about 2,090 phones, roughly $1.7M, as the new model launched",
      fb: "Actual holiday sales were <b>8,050</b>. You'd have <b>2,090 extra phones</b> (about $1.67M at $800) sitting in the channel just as X2 launches: a price-protection and aging problem." },
    { t: "8,970: split the difference so everyone's happy.", short: "8,970 (split)", ok: false, fs: "split the difference at 8,970", fc: "it over-forecast by about 920 phones with no evidence behind them",
      fb: "Splitting the difference isn't consensus, it's a compromise with no evidence. You'd be <b>920 phones (11%) over</b>, about $736,000 of stock aging into the X2 launch." },
    { t: "8,262: the baseline plus the confirmed promo (8,100), plus a 2% end-of-life buffer, with every assumption written down.", short: "8,262 (evidence)", ok: true,
      fb: "Actual: <b>8,050</b>. You were <b>212 phones (2.6%) over</b>: a small buffer that clears in a week. Every unit you loaded has a reason you can point to." },
    { t: "7,800: the statistical baseline. Ignore the promo.", short: "7,800 (stat only)", ok: "part", fs: "load the statistical baseline and ignore the promo", fc: "Black Friday week came in at 1,820 against my 1,500",
      fb: "Close on total (250 under, −3.1%), but you'd be <b>320 short in Black Friday week</b> (1,500 planned, 1,820 sold): stock-outs in the biggest week of the year. The promo was confirmed, so it belonged in the number." }
  ];
  PP.missions.push({
    id: "m4", n: 4, week: 43, day: [2], mins: 11, art: "three", title: "Cutoff Wednesday",
    sub: "The account manager wants +30% “to be safe”. The forecast must be loaded by 5 pm.",
    hook: "Target is a wish. Forecast is the truth. Plan is the forecast plus a buffer.",
    cast: ["priya", "marcus", "grace"],
    steps: [
      { type: "chat", msgs: [
        ["priya", "Wednesday = consensus and cutoff. The forecast must be loaded by <b>5:00 pm</b>. Today: Nova X1 at Vertex for the holiday weeks, <b>W47 to W52</b>."],
        ["marcus", "Holiday is huge. Put in <b>10,140</b> for the six weeks: the stat number plus 30%. Better safe than sorry. Also my quota is 10,000, so I need it."],
        ["grace", "Reminder: what you load drives purchase orders. Too high and we're funding stock nobody buys; too low and we miss revenue."]
      ] },
      { type: "info", title: "The evidence board", html: '<div class="evid">' +
        '<div><span class="eyebrow">Statistical baseline</span><b>7,800 units</b><small>W47 1,500 · W48 1,200 · W49 1,200 · W50 1,300 · W51 1,400 · W52 1,200</small></div>' +
        '<div><span class="eyebrow">Marcus\'s track record</span><b>+18% bias</b><small>Marcus\'s last six overrides averaged 18% above what actually sold.</small></div>' +
        '<div><span class="eyebrow">Channel stock</span><b>About 6 weeks</b><small>Vertex is still working down the build-up you found in Week 40.</small></div>' +
        '<div><span class="eyebrow">Confirmed event</span><b>Black Friday promo, W47</b><small>$200 off with trade-in, funded by marketing. A similar promo last year lifted the week <b>+20%</b>.</small></div>' +
        '<div><span class="eyebrow">Product life stage</span><b>End-of-life</b><small>Nova X2 launches in W49. X1 demand will fade after that.</small></div></div>' },
      { type: "mcq", title: "Forecast, plan or target?", q: "Marcus's quota is 10,000. The honest forecast is lower. What's the right way to think about it?",
        opts: [{ t: "Raise the forecast to 10,000 so it matches the target.", ok: false, fb: "Then the factory builds phones to a wish. The forecast must stay an honest estimate, or nobody downstream can trust it." },
          { t: "Ignore the target. It's sales' problem.", ok: "part", fb: "It is sales' problem to close, but leadership needs to <i>see</i> it. Hiding the gap isn't neutral." },
          { t: "Target is what sales wants; forecast is what we expect. Show the gap in units and dollars and let leadership decide how to close it.", ok: true, fb: "Exactly. If the gap is closed, it's with actions (a promotion, more marketing), and then the forecast moves because the <i>drivers</i> moved." }] },
      { type: "calc", title: "Add only what's confirmed", html: "<p>Baseline for W47 is <b>1,500</b>. The confirmed Black Friday promo historically lifts the week by <b>20%</b>. The other weeks stay on baseline.</p>",
        fields: [{ label: "W47 with the promo", ans: 1800, tol: 0, suf: "units" }, { label: "Six-week consensus", ans: 8100, tol: 0, suf: "units" }],
        sol: "1,500 × 1.2 = <b>1,800</b>. Six weeks: 1,800 + 1,200 + 1,200 + 1,300 + 1,400 + 1,200 = <b>8,100</b>. The +30% has no evidence behind it, so it stays out. Write that down." },
      { type: "calc", title: "Apply the buffer", html: '<p>Nova\'s buffer policy depends on where the product is in its life:</p>' +
          tbl([["Life stage"], ["Buffer", 1]], [["New launch (first 3 months)", "10%"], ["Core / mature", "5%"], ["End-of-life (successor announced or launching)", "2%"]]) +
          '<div class="formula">Loaded quantity = consensus × (1 + buffer %)</div>',
        fields: [{ label: "Buffer for X1", ans: 2, tol: 0, suf: "%" }, { label: "Quantity to load", ans: 8262, tol: 0, suf: "units" }],
        sol: "X1 is end-of-life (X2 launches in W49), so <b>2%</b>. 8,100 × 1.02 = <b>8,262</b>. The buffer is <i>separate</i> from the forecast: protection lives in the buffer, so the forecast stays honest and measurable." },
      { type: "mcq", title: "4:45 pm. Your call.", key: "m4", decide: true, q: "What do you load?", opts: D4,
        conseq(el, i) {
          el.innerHTML = '<div class="chart"></div><p class="small muted">Six-week total you would load vs what actually sold (8,050).</p>';
          PA.bars($(".chart", el), { labels: D4.map(o => o.short), series: [{ name: "Loaded", data: [10140, 8970, 8262, 7800], colors: D4.map((o, k) => k === i ? "var(--sun)" : o.ok === true ? "var(--good)" : "var(--line)") }], hlines: [{ y: 8050, label: "Actual 8,050", color: "var(--s0)" }], legend: false, valueLabels: true, vFmt: v => fmt(v), yMax: 11000, aria: "Loaded quantity by option against actual" });
        } },
      { type: "custom", title: "Load it before cutoff", mount: loadMount },
      { type: "debrief" }, { type: "story" }
    ],
    recap: "You ran a consensus the right way: evidence over volume. Only the confirmed event went in, protection went into the buffer (sized by life stage, not by nerves), the gap to target went to leadership instead of into the forecast, and every assumption was logged before cutoff.",
    concepts: [["Forecast vs plan vs target", "../#concepts"], ["AP2 forecast and buffer", "../#concepts"], ["Forecast bias", "../arena/#/m/bias"], ["S&OP and stakeholders", "../arena/#/m/sop"]],
    excel: "Loaded = <code>=ROUND(B2*(1+$F$1),0)</code> with the buffer in one cell · keep an <i>Assumption</i> column next to every override · track each person's override bias: <code>=SUM(F-A)/SUM(A)</code> by owner.",
    qs: ["c-buffer", "c-target", "s-override", "b-push", "r-load", "p-people"],
    bullet: "Ran the weekly consensus and forecast load with life-stage buffer logic; held a holiday forecast to 8,262 units against a +30% sales request, landing within 3% of actuals (8,050).",
    story(ch) {
      return {
        s: "In Week 43 of my simulation project, the account manager for our biggest carrier asked me to add 30% to the holiday forecast for our flagship phone: 10,140 units instead of the 7,800 statistical baseline. Their quota was 10,000.",
        t: "Load a number I could defend before the 5 pm cutoff.",
        a: "I checked the evidence: their last six overrides averaged 18% too high, the channel already held about 6 weeks of stock, and only one promotion was confirmed, worth +20% in Black Friday week. " + det(ch.m4, D4) + "I loaded the baseline plus the promo, 8,100, with a 2% end-of-life buffer because the successor launched in Week 49: 8,262. I flagged the 1,900-unit gap to quota (about $1.5M) to leadership.",
        r: "Actual sales were 8,050, within 3%. The +30% would have left about 2,090 phones, roughly $1.7M, in the channel as the new model launched.",
        l: "Forecast and target are different numbers. The gap gets closed with actions, not by inflating the forecast."
      };
    }
  });

  function loadMount(el, ctx, done) {
    const wk = ["W47", "W48", "W49", "W50", "W51", "W52"], base = [1500, 1200, 1200, 1300, 1400, 1200], cons = [1800, 1200, 1200, 1300, 1400, 1200], load = cons.map(v => Math.round(v * 1.02));
    el.innerHTML = '<p>The agreed consensus goes into the planning system week by week. Whatever option you picked above, this is the number the evidence supports.</p>' +
      tbl([["Week"], ["Baseline", 1], ["Consensus", 1], ["+2% buffer", 1], ["Load", 1]], wk.map((w, i) => [w, fmt(base[i]), fmt(cons[i]), "+" + fmt(load[i] - cons[i]), "<b>" + fmt(load[i]) + "</b>"]).concat([{ c: ["Total", fmt(sum(base)), fmt(sum(cons)), "+" + fmt(sum(load) - sum(cons)), fmt(sum(load))], cls: "total" }])) +
      '<div class="callout"><span class="eyebrow">Assumption log</span><small>W47: Black Friday promo, $200 off with trade-in, +20% (event library) · Buffer 2%: end-of-life, X2 launches W49 · Not adopted: +30% request, no supporting evidence · Gap to quota: 1,900 units (≈ $1.5M), sent to leadership</small></div>' +
      '<div class="row"><button class="btn sun" type="button" id="ld-go">Load forecast</button><span class="mono" id="ld-clock">Wed 4:47 pm · cutoff 5:00 pm</span></div><div class="meter"><i id="ld-bar" style="width:0;background:var(--sun)"></i></div><p id="ld-msg" class="small"></p>';
    $("#ld-go", el).addEventListener("click", e => {
      e.target.disabled = true; let p = 0;
      const t = setInterval(() => { p += 10; $("#ld-bar", el).style.width = p + "%"; if (p >= 100) { clearInterval(t); $("#ld-clock", el).textContent = "Wed 4:52 pm · loaded ✓"; $("#ld-msg", el).innerHTML = "<b>6 rows loaded</b> for Vertex · Nova X1 · W47–W52, total <b>" + fmt(sum(load)) + "</b>, 8 minutes before cutoff. Purchase orders will be built from this number."; done(); } }, 90);
      ctx.cleanup(() => clearInterval(t));
    });
  }

  /* ======================= WEEK 44 · THE THURSDAY REPORT ======================= */
  const WOW = [["Vertex · Nova X1", 4700, 4100, 800, "Sell-through softer; channel stock still high"], ["MegaMart · Nova A5", 4700, 5600, 300, "Black Friday $50-off promo confirmed (lift from event library)"], ["ShopFast · Nova Buds", 7400, 8400, 120, "Back in stock, plus holiday gifting"], ["ShopFast · Nova A5", 1100, 900, 300, "New listing delayed two weeks"], ["MegaMart · Nova Buds", 150, 300, 120, "Added to holiday end-cap displays"]];
  const D5 = [
    { t: "Forecast is up 1,250 units this week.", ok: false, fb: "True, and misleading. The dollars went <i>down</i>. Leadership would walk away with the wrong message." },
    { t: "Several accounts changed their forecasts; see the attached table.", ok: false, fb: "There's no message here. If the first line doesn't carry the number, nobody reads the table." },
    { t: "Vertex is dragging the numbers down again.", ok: false, fb: "Blame with no number, no reason and no action." },
    { t: "November revenue forecast is $14.07M: down $132k week over week and $432k below plan, mainly softer Nova X1 sell-through at Vertex (−$480k), partly offset by MegaMart's confirmed Black Friday A5 promo (+$270k).", ok: true, fb: "Number, direction, gap to plan, the biggest driver and the biggest offset, in one sentence. A director can act on that without opening the table." }
  ];
  const D5b = [
    { t: "Nothing, it's just for your information.", ok: false, fb: "A report without an ask is a missed chance. You found a problem; propose the fix." },
    { t: "A decision: approve promotion funding for Nova X1 at Vertex to bring its channel stock down before X2 launches.", ok: true, fb: "That's the H-D-R-A shape: <b>H</b>eadline, <b>D</b>rivers, <b>R</b>isks, <b>A</b>sk. The ask turns a report into a decision." },
    { t: "More people in the planning team.", ok: false, fb: "Not what this report is about. Keep the ask tied to the numbers you just showed." }
  ];
  PP.missions.push({
    id: "m5", n: 5, week: 44, day: [3], mins: 10, art: "fall", title: "The Thursday report",
    sub: "Units are up, revenue is down. Explain it to the director in two lines.",
    hook: "Last week's number, the bridges, this week's number: the waterfall.",
    cast: ["priya", "ana"],
    steps: [
      { type: "chat", msgs: [
        ["priya", "Thursday is report day. Leadership reads the first two lines and nothing else. Make them count."],
        ["ana", "What changed in <b>November</b> this week, why, and what does it mean in dollars? Three lines, please."]
      ] },
      { type: "info", title: "What changed since last week (November, units)", html: tbl([["Account · product (ASP)"], ["Last week", 1], ["This week", 1], ["Change", 1], ["Why"]], WOW.map(r => [r[0] + ' <span class="muted">($' + r[3] + ")</span>", fmt(r[1]), fmt(r[2]), (r[2] - r[1] > 0 ? "+" : "−") + fmt(Math.abs(r[2] - r[1])), r[4]]).concat([{ c: ["Total change", "", "", "+1,250", ""], cls: "total" }])) +
        '<p class="small muted">November total for all products and accounts was <b>$14.20M</b> last week. The plan (budget) for November is <b>$14.50M</b>.</p>' },
      { type: "calc", title: "Turn units into dollars", html: '<div class="formula">$ impact = unit change × ASP</div>',
        fields: [{ label: "Vertex · X1 impact", ans: -480000, tol: 0, pre: "$" }, { label: "Net $ change, all five lines", ans: -132000, tol: 0, pre: "$" }],
        sol: "−600 × $800 = <b>−$480,000</b>. Then +900 × $300 = +$270,000; +1,000 × $120 = +$120,000; −200 × $300 = −$60,000; +150 × $120 = +$18,000. Net: <b>−$132,000</b>. Units up 1,250, dollars down $132k." },
      { type: "mcq", title: "How can both be true?", q: "Units are up 1,250 but dollars are down $132k. Why?",
        opts: [{ t: "A calculation error", ok: false, fb: "The maths is right. Check it line by line." }, { t: "Mix: the $800 phone went down while cheaper products went up", ok: true, fb: "<b>Mix.</b> Losing 600 phones at $800 outweighs gaining 1,000 earbuds at $120. This is why reports lead with dollars." }, { t: "Prices fell this week", ok: false, fb: "The ASPs didn't change." }, { t: "Returns were netted off", ok: false, fb: "No returns in this table." }] },
      { type: "custom", title: "The picture to remember: the waterfall", mount: fallMount },
      { type: "mcq", title: "Write the headline", key: "m5", q: "Pick the first line leadership will read.", opts: D5 },
      { type: "mcq", title: "Ana replies", html: "<div class=\"msg\"><span class=\"av\" style=\"background:#56627a\">A</span><div><span class=\"who\"><b>Ana</b> · Director, Biz Ops</span><div class=\"txt\">Clear, thanks. So what do you need from me?</div></div></div>", key: "m5b", q: "Your answer:", opts: D5b },
      { type: "debrief" }, { type: "story" }
    ],
    recap: "You built the weekly report the way leadership reads it: week-over-week change by line, converted to dollars, a waterfall from last week's number to this week's, one headline with the gap to plan, and an ask. You also spotted <b>mix</b>: units and dollars can move in opposite directions.",
    concepts: [["Week-over-week changes and $ impact", "../#concepts"], ["S&OP and stakeholders", "../arena/#/m/sop"]],
    excel: "WoW = <code>=SUMIFS(ThisWk,Acct,A2,Prod,B2)-SUMIFS(LastWk,Acct,A2,Prod,B2)</code> · $ = WoW × <code>XLOOKUP(B2, Products, ASP)</code> · a PivotTable by account × product · sort by absolute $ change.",
    qs: ["p-report", "s-mix", "b-present", "r-report"],
    bullet: "Produced the weekly forecast report with week-over-week changes, dollar impact and gap to plan; identified a product-mix effect (units +1,250, revenue −$132k) and framed the decision needed.",
    story() {
      return {
        s: "In Week 44 of my simulation project I wrote the weekly forecast report for the director. November units were up 1,250 week over week, but revenue was down.",
        t: "Give leadership one clear message they could act on in two lines.",
        a: "I converted every change to dollars with its average selling price and found the cause was mix: our $800 flagship fell 600 units (−$480k) while $120 earbuds rose 1,000 (+$120k). I built a waterfall from last week's $14.20M to this week's $14.07M and led with: November $14.07M, down $132k week over week and $432k below plan, mainly the flagship at our carrier, partly offset by a confirmed Black Friday promo. Then risks, and one ask: fund a promotion to clear the flagship's channel stock before its successor launched.",
        r: "The director could decide straight from the headline, without reading the table.",
        l: "Lead with dollars and the decision you need. Units alone can mislead."
      };
    }
  });

  function fallMount(el, ctx, done) {
    const lo = 13600, hi = 14600, x = v => (v - lo) / (hi - lo) * 100;
    const rows = [["Last week", 14200, null]].concat(WOW.map(r => [r[0], null, (r[2] - r[1]) * r[3] / 1000])).concat([["This week", 14068, null]]);
    let run = 14200, html = "";
    rows.forEach((r, i) => {
      let a, b, col, v;
      if (r[1] != null) { a = lo; b = r[1]; col = i === 0 ? "var(--muted)" : "var(--s1)"; v = "$" + (r[1] / 1000).toFixed(2) + "M"; }
      else { a = run; b = run + r[2]; run = b; col = r[2] < 0 ? "var(--bad)" : "var(--good)"; v = (r[2] < 0 ? "−$" : "+$") + fmt(Math.abs(r[2])) + "k"; }
      const L = Math.min(x(a), x(b)), Wd = Math.abs(x(b) - x(a));
      html += '<div class="wfr' + (i ? " hidden" : "") + '" data-i="' + i + '"><span>' + esc(r[0]) + '</span><span class="tr"><i style="left:' + L + "%;width:" + Math.max(0.8, Wd) + "%;background:" + col + '"></i><span class="plan" style="left:' + x(14500) + '%"></span></span><span class="v">' + v + "</span></div>";
    });
    el.innerHTML = '<p>Start from last week\'s total and add one change at a time. The black line is the plan ($14.50M). The axis starts at $13.6M so the changes are visible.</p><div class="wf">' + html + '</div><div class="row"><button class="btn sun" type="button" id="wf-add">Add the next change</button><span class="small muted" id="wf-n"></span></div><p class="say" id="wf-say">This is the picture behind every weekly report: <b>where we were → what moved → where we are</b>.</p>';
    let k = 0; const N = rows.length - 1;
    const step = () => {
      k++; const r = $('.wfr[data-i="' + k + '"]', el); if (r) r.classList.remove("hidden");
      $("#wf-n", el).textContent = Math.min(k, N) + " of " + N;
      if (k >= N) { $("#wf-add", el).disabled = true; $("#wf-say", el).innerHTML = "Down $132k to <b>$14.07M</b>, still <b>$432k below plan</b>. The single biggest bar is Vertex · X1. That's your headline."; done(); }
    };
    $("#wf-add", el).addEventListener("click", step);
    $("#wf-n", el).textContent = "0 of " + N;
  }

  /* ======================= WEEK 45 · THE LATE SHIP ======================= */
  const AC = [["Vertex", 800, 1600, 400, 600, 400], ["MegaMart", 1500, 900, 700, 1500, 800], ["ShopFast", 700, 500, 350, 600, 350]];
  const D6 = [
    { t: "Yes: protect $240,000 of revenue.", short: "Air all 800", ok: false, fs: "air-freight all 800 units", fc: "my allocation already covered Black Friday, so I'd have spent $20,000 for nothing",
      fb: "With your allocation nobody runs out on Black Friday, and the 800 still arrive in W48 for the following weeks. You'd spend <b>$20,000</b> moving stock that isn't needed early. Also: compare expedite cost with the <b>margin</b> at risk, not the revenue." },
    { t: "No. My allocation covers Black Friday with no lost sales, and the 800 arrive in W48 for the weeks after. Keep the $20,000.", short: "No air freight", ok: true,
      fb: "Right. Air freight is worth it when the margin you'd lose is bigger than the air cost <i>and</i> allocation alone can't cover the need. Here allocation solved it. At roughly $60 margin a unit, 800 lost units would have been ~$48k of margin: then $20k of air would have paid off." },
    { t: "Yes, but only 300 units, for MegaMart's promo.", short: "Air 300", ok: "part", fs: "air-freight 300 units for MegaMart", fc: "MegaMart's promo was already covered",
      fb: "Targeted is better than all 800, but only worth it if MegaMart would otherwise run short. With your allocation it doesn't." }
  ];
  PP.missions.push({
    id: "m6", n: 6, week: 45, day: [4], mins: 11, art: "ship", title: "The late ship",
    sub: "800 phones miss Black Friday. Who gets the 2,200 that arrive on time?",
    hook: "When supply is short, allocate by need (sell-through and weeks of supply), not by who shouts loudest.",
    cast: ["dev", "priya", "elena"],
    steps: [
      { type: "chat", msgs: [
        ["dev", "Bad news: the vessel carrying <b>Nova A5</b> is delayed. Of the <b>3,000</b> units due in our DC for Week 46, only <b>2,200</b> make it. The other <b>800</b> arrive in Week 48, after Black Friday."],
        ["priya", "Friday is supply day. Confirm the POs, decide who gets the 2,200, and tell people <b>early</b>."],
        ["elena", "MegaMart's Black Friday ad is already printed. We NEED our full 1,500."]
      ] },
      { type: "info", title: "What each account ordered, holds and will sell", html: tbl([["Account"], ["Ordered W47", 1], ["Stock now", 1], ["Sells W46", 1], ["Sells W47 (Black Fri)", 1], ["Sells W48", 1]], AC.map(a => [a[0], fmt(a[1]), fmt(a[2]), fmt(a[3]), fmt(a[4]), fmt(a[5])]).concat([{ c: ["Total", "3,000", "", "", "", ""], cls: "total" }])) + '<p class="small muted">Nova A5, ASP $300. MegaMart\'s W47 number includes its $50-off promo (the +65% lift you recorded in Week 41).</p>' },
      { type: "calc", title: "Size the gap", html: '<div class="formula">Gap = ordered − confirmed arrivals · revenue at risk = gap × ASP</div>',
        fields: [{ label: "Units short", ans: 800, tol: 0, suf: "units" }, { label: "Revenue at risk if all lost", ans: 240000, tol: 0, pre: "$" }],
        sol: "3,000 − 2,200 = <b>800</b>. 800 × $300 = <b>$240,000</b>. That's the worst case: it assumes every missing unit is a lost sale. Allocation decides how much of it really is." },
      { type: "custom", title: "Allocate the 2,200", mount: allocMount },
      { type: "mcq", title: "Dev's offer", key: "m6", decide: true, html: '<div class="msg"><span class="av" style="background:var(--s3)">D</span><div><span class="who"><b>Dev</b> · Supply Planner</span><div class="txt">I can air-freight the 800 delayed units to arrive in W46. Cost: <b>$25 a unit</b>, so $20,000.</div></div></div>', q: "Do you?", opts: D6 },
      { type: "info", title: "Confirm the PO and tell people", html: tbl([["PO line"], ["Qty", 1], ["Arrives"], ["Status"]], [["4500-1187 / 10", "2,200", "W46", '<span class="pill good">Confirmed</span>'], ["4500-1187 / 20", "800", "W48 (was W46)", '<span class="pill warn">Rescheduled</span>']]) +
        '<div class="evid"><div><b>To Elena (MegaMart)</b><small>Your Black Friday promo is covered: your allocation plus current stock covers the forecast promo week.</small></div><div><b>To Marcus (Vertex)</b><small>You hold 4 weeks of A5, so you get little or none this week; the W48 arrival tops you up.</small></div><div><b>To Sam (ShopFast)</b><small>Covered through Black Friday; tight in W48 until the delayed 800 land.</small></div><div><b>To Grace (Finance)</b><small>No revenue loss expected on Black Friday; 800 units of sell-in move from W46 to W48. No air freight.</small></div></div>',
        mount(el, ctx) { const c = ctx.ch.m6alloc; if (c && c.last) { const ev = $$(".evid small", el); ev[0].textContent = "Your Black Friday promo is covered: " + fmt(c.last[1]) + " units this week plus your current stock covers the promo forecast."; ev[1].textContent = "You hold 4 weeks of A5, so you get " + fmt(c.last[0]) + " this week; the W48 arrival tops you up."; ev[2].textContent = "You get " + fmt(c.last[2]) + " this week: covered through Black Friday, tight in W48 until the delayed 800 land."; } } },
      { type: "debrief" }, { type: "story" }
    ],
    recap: "You handled a supply problem the way a planner should: confirmed the facts with supply, sized the gap, allocated by <b>need</b> (sell-through minus stock) instead of pro-rata to orders, checked whether expediting was worth its cost, rescheduled the PO and told every stakeholder before Black Friday, not during it.",
    concepts: [["Factory arrivals and PO confirmation", "../#concepts"], ["Lead time", "../arena/#/m/lead-time"], ["Allocation in S&OP", "../arena/#/m/sop"]],
    excel: "Need = <code>=MAX(0, SellW46+SellW47-Stock)</code> · allocate in priority order with <code>=MIN(Need, Remaining)</code> · end stock = Stock + Alloc − sales; flag negatives red.",
    qs: ["s-delay", "s-alloc", "b-time", "r-po"],
    bullet: "Managed a supply shortfall (2,200 of 3,000 units) before Black Friday through need-based allocation and PO rescheduling: no stock-outs, and $20k of air freight avoided.",
    story(ch) {
      const a = ch.m6alloc, firstPro = a && a.firstPro;
      return {
        s: "In Week 45 of my simulation project, two weeks before Black Friday, the factory told us 800 of 3,000 mid-range phones would arrive two weeks late.",
        t: "Decide who got the 2,200 arriving in time, and whether to pay for air freight.",
        a: "I worked out each account's need from current stock and expected sales: one retailer's Black Friday promo needed at least 1,300, the online account 450, and the carrier already held 4 weeks. " + (firstPro ? "My first attempt split the units pro-rata to orders, which left the retailer 200 short in the middle of its promo, so I switched to allocating by need. " : "I allocated by need rather than pro-rata to orders. ") + "Then I rescheduled the late 800 on the PO to Week 48 and told every account manager their quantity and why.",
        r: "No account ran out on Black Friday, and we didn't need the $20,000 of air freight." + (firstPro ? "" : " A pro-rata split would have left the retailer 200 short mid-promo."),
        l: "Under pressure, the right rule beats spending money. And tell people early."
      };
    }
  });

  function allocMount(el, ctx, done) {
    const AV = 2200, a = [0, 0, 0];
    let tries = 0, fin = false;
    el.innerHTML = '<p>Move the sliders until all <b>2,200</b> units are allocated. Each bar shows what the account will have left at the end of Black Friday week. Red means it ran out and lost sales.</p>' +
      '<div class="alloc">' + AC.map((c, i) => '<div class="arow"><span class="nm"><b>' + c[0] + '</b><small>ordered ' + fmt(c[1]) + " · holds " + fmt(c[2]) + '</small></span><input type="range" min="0" max="' + AV + '" step="50" value="0" data-i="' + i + '" aria-label="Units for ' + c[0] + '"><span class="num" id="al-v' + i + '">0</span><div class="abar"><span class="meter"><i id="al-b' + i + '"></i></span><span id="al-t' + i + '"></span></div></div>').join("") + "</div>" +
      '<div class="kpis"><div class="kpi"><span>Unallocated</span><b id="al-left"></b></div><div class="kpi bad"><span>Lost sales (units)</span><b id="al-lost"></b></div><div class="kpi bad"><span>Lost revenue</span><b id="al-usd"></b></div></div>' +
      '<div class="row"><button class="btn" type="button" id="al-pro">Fill pro-rata to orders</button><button class="btn sun" type="button" id="al-go">Lock in allocation</button></div><div id="al-fb"></div>';
    const calc = () => AC.map((c, i) => { const end = c[2] + a[i] - c[3] - c[4]; return { end, lost: Math.max(0, -end), left: Math.max(0, end), wos: Math.max(0, end) / c[5] }; });
    const draw = () => {
      const r = calc(), used = sum(a), lost = sum(r.map(x => x.lost));
      r.forEach((x, i) => {
        $("#al-v" + i, el).textContent = fmt(a[i]);
        const b = $("#al-b" + i, el); b.style.width = Math.min(100, x.lost ? 100 : x.left / 1500 * 100) + "%"; b.style.background = x.lost ? "var(--bad)" : x.wos < 0.5 ? "var(--warn)" : "var(--good)";
        $("#al-t" + i, el).textContent = x.lost ? "runs out: −" + fmt(x.lost) : fmt(x.left) + " left · " + x.wos.toFixed(1) + " wks";
      });
      $("#al-left", el).textContent = fmt(AV - used); $("#al-lost", el).textContent = fmt(lost); $("#al-usd", el).textContent = money(lost * 300);
    };
    $$('input[type="range"]', el).forEach(s => s.addEventListener("input", () => {
      const i = +s.dataset.i, others = sum(a) - a[i]; a[i] = Math.min(+s.value, AV - others); s.value = a[i]; draw();
    }));
    let pro = false;
    $("#al-pro", el).addEventListener("click", () => { [600, 1100, 500].forEach((v, i) => { a[i] = v; $$('input[type="range"]', el)[i].value = v; }); pro = true; draw(); });
    $("#al-go", el).addEventListener("click", () => {
      const r = calc(), used = sum(a), lost = sum(r.map(x => x.lost)), fb = $("#al-fb", el);
      if (used < AV) { fb.innerHTML = '<div class="why part">You still have <b>' + fmt(AV - used) + "</b> units unallocated. Stock sitting in our DC on Black Friday helps nobody.</div>"; return; }
      tries++;
      const isPro = a[0] === 600 && a[1] === 1100 && a[2] === 500;
      const st = ctx.ch.m6alloc = ctx.ch.m6alloc || {};
      if (st.firstPro == null) st.firstPro = isPro || pro && lost > 0;
      st.last = a.slice(); ctx.save();
      if (lost > 0) {
        const who = AC.filter((c, i) => r[i].lost).map(c => c[0]).join(" and ");
        fb.innerHTML = '<div class="why bad"><b>' + who + " runs out during Black Friday week: " + fmt(lost) + " units, " + money(lost * 300) + " of lost sales.</b> " + (isPro ? "Pro-rata looks fair, but it gives every account the same share of its <i>order</i>, not of its <i>need</i>. Vertex already holds 4 weeks of stock." : "Someone is getting more than they need while someone else runs out.") + (tries >= 2 ? '<br><br><b>Hint:</b> need = sales in W46 + W47 − stock now. MegaMart: 700 + 1,500 − 900 = <b>1,300</b>. ShopFast: 350 + 600 − 500 = <b>450</b>. Vertex: 400 + 600 − 1,600 = <b>0</b>. Cover those, then share out the remaining 450.' : "") + "</div>";
        return;
      }
      fb.innerHTML = '<div class="why good"><b>No account runs out on Black Friday.</b> You allocated by need: sell-through minus stock on hand. MegaMart\'s promo is covered, ShopFast is covered, and Vertex lives on the 4 weeks it already holds. The delayed 800 top everyone up in W48.</div>';
      if (!fin) { fin = true; ctx.xp(10, "allocated by need"); done(); }
    });
    draw();
  }

  /* ======================= WEEK 46 · OLD STOCK, NEW PHONE ======================= */
  const D7 = [
    { t: "Yes. It's our product.", ok: false, fb: "It <i>was</i> ours. Once MegaMart bought it, it's MegaMart's stock. You can't move it." },
    { t: "Yes, as long as ShopFast agrees to take it.", ok: false, fb: "ShopFast agreeing doesn't change who owns it. MegaMart does." },
    { t: "No. MegaMart already bought it, so it's MegaMart's stock. I can move stock Nova still owns (our DC), and for MegaMart's stock I can slow sell-in, fund a promotion or negotiate a stock rotation.", ok: true, fb: "Ownership first, always. <b>Reallocation</b> applies to company-held stock (our DC). For stock an account owns, the levers are sell-in, sell-through support and negotiated rotations or returns." }
  ];
  PP.missions.push({
    id: "m7", n: 7, week: 46, day: [4], mins: 12, art: "ice", title: "Old stock, new phone",
    sub: "The new flagship was just announced. The old one stopped selling overnight.",
    hook: "Old stock is a melting ice cube: the longer it sits, the less it's worth.",
    cast: ["priya", "grace", "elena"],
    steps: [
      { type: "chat", msgs: [
        ["priya", "<b>Nova X2</b> was announced on Tuesday; it launches in <b>Week 49</b>. Nova X1 sell-through dropped about <b>40%</b> overnight. That's cannibalisation."],
        ["grace", "How much X1 do we have, how old is it, and what happens at launch? If X1's price drops $100, we may owe <b>price protection</b> on stock sitting at accounts. Terms vary by contract, but I need the exposure."]
      ] },
      { type: "info", title: "Where every X1 is, and who owns it", html: tbl([["Location"], ["Owner"], ["Units", 1], ["Sells per week", 1], ["Weeks to deplete", 1]], [["Nova DC", "Nova (us)", "5,000", "–", "–"], ["Vertex", "Vertex", "5,350", "540", "9.9"], { c: ["MegaMart", "MegaMart", "3,600", "300", "?"], cls: "hl" }, ["ShopFast", "ShopFast", "400", "400", "1.0"]]) +
        '<h3 style="margin-top:6px">Age of the stock in our DC</h3><div class="stack" id="m7age"></div>',
        mount(el) {
          const B = [["0–30 days", 1000, "var(--good)"], ["31–60 days", 1500, "var(--gold)"], ["61–90 days", 1800, "var(--warn)"], ["90+ days", 700, "var(--bad)"]];
          $("#m7age", el).innerHTML = B.map(b => '<div class="arow" style="grid-template-columns:100px 1fr 60px"><span class="small">' + b[0] + '</span><span class="meter"><i style="width:' + (b[1] / 1800 * 100) + "%;background:" + b[2] + '"></i></span><span class="num small">' + fmt(b[1]) + "</span></div>").join("") + '<p class="small muted">The older the bucket, the closer it is to needing a markdown. 2,500 units are already over 60 days old.</p>';
        } },
      { type: "calc", title: "Size the problem", html: '<div class="formula">Weeks to deplete = stock ÷ weekly sell-through · exposure ≈ account-held units × price drop</div>',
        fields: [{ label: "MegaMart weeks to deplete", ans: 12, tol: 0.05, suf: "weeks" }, { label: "Exposure if X1 drops $100 on all account-held units", ans: 935000, tol: 1000, pre: "$" }],
        sol: "3,600 ÷ 300 = <b>12 weeks</b>, but X2 launches in 3. Account-held units: 5,350 + 3,600 + 400 = 9,350 × $100 = up to <b>$935,000</b>, if the contracts cover all of it. Our own 5,000 in the DC aren't exposed to price protection, but they will need markdowns if they don't sell." },
      { type: "mcq", title: "Elena has an idea", key: "m7own", html: '<div class="msg"><span class="av" style="background:var(--s4)">E</span><div><span class="who"><b>Elena</b> · Account Manager, MegaMart</span><div class="txt">Easy fix: just move 2,000 of MegaMart\'s X1 to ShopFast, they sell faster.</div></div></div>', q: "Can you?", opts: D7 },
      { type: "custom", title: "Build the depletion plan", mount: leverMount },
      { type: "debrief" }, { type: "story" }
    ],
    recap: "You built an end-of-life plan: every unit located by owner and age, weeks to deplete by account, price-protection exposure sized for Finance, and levers chosen by ownership (reallocate what Nova owns; for account-owned stock, stop sell-in and fund sell-through). The lesson that loops back to Week 43: shrink the old model's buffer <i>before</i> the successor is announced.",
    concepts: [["Aging, depletion and reallocating EOH", "../#concepts"], ["Telecom launches and cannibalisation", "../#concepts"], ["Inventory levels", "../arena/#/m/levels"], ["Holding cost", "../arena/#/m/holding"]],
    excel: "Age buckets: <code>=IFS(Days<=30,\"0–30\",Days<=60,\"31–60\",Days<=90,\"61–90\",TRUE,\"90+\")</code> · weeks to deplete = <code>=IFERROR(Stock/WeeklyST,\"–\")</code> · exposure = <code>=SUMIFS(Units,Owner,\"<>Nova\")*PriceDrop</code>.",
    qs: ["c-aging", "s-launch", "s-12v1", "r-aging"],
    bullet: "Built an end-of-life depletion plan for 14,350 units of an outgoing model: stopped sell-in to over-stocked accounts, reallocated company-held stock to the fastest channel and sized price-protection exposure (up to about $935k).",
    story(ch) {
      const p = (ch.m7plan && ch.m7plan.last) || { re: true, stop: true, promo: true }, r = simX1(p), base = simX1({});
      const acts = [p.stop ? "stopped new sell-in to the two accounts holding 10 to 12 weeks" : null, p.re ? "sent our own DC stock to the online account, which sold the old model in about a week" : null, p.promo ? "proposed a funded Black Friday promotion at the two over-stocked accounts" : null].filter(Boolean);
      return {
        s: "In Week 46 of my simulation project, the successor to our flagship phone was announced, and the old model's sell-through dropped about 40% overnight. We had 5,000 units in our own warehouse and 9,350 at accounts.",
        t: "Build a plan to sell the old model down before the launch in Week 49, and size the financial exposure for Finance.",
        a: "I located every unit by owner and age (2,500 of ours were over 60 days old) and worked out weeks to deplete: 12 at one retailer, about 10 at the carrier. I made the point that we couldn't move stock an account already owned. Then I " + (acts.length ? acts.join(", ") : "modelled each lever") + ".",
        r: "Stock left in the channel at launch fell from about " + fmt(base.atLaunch) + " units to " + fmt(r.atLaunch) + ", cutting the price-protection exposure from up to about " + money(base.atLaunch * 100) + " to " + money(r.atLaunch * 100) + ".",
        l: "Old stock is a melting ice cube. The real fix is upstream: shrink the old model's buffer before the successor is announced."
      };
    }
  });

  function simX1(L) {
    let dc = 5000, promo = 0, atLaunch = 0;
    const st = { V: 5350, M: 3600, S: 400 }, d = { V: 540, M: 300, S: 400 }, dcS = [dc], chS = [9350];
    for (let w = 47; w <= 54; w++) {
      const lift = L.promo && (w === 47 || w === 48) ? 2 : 1;
      if (L.re) { const top = Math.min(dc, Math.max(0, d.S - st.S)); dc -= top; st.S += top; }
      if (!L.stop) { const v = Math.min(dc, 300); dc -= v; st.V += v; const m = Math.min(dc, 300); dc -= m; st.M += m; }
      const sV = Math.min(st.V, d.V * lift), sM = Math.min(st.M, d.M * lift), sS = Math.min(st.S, d.S);
      if (lift > 1) promo += sV + sM;
      st.V -= sV; st.M -= sM; st.S -= sS;
      dcS.push(dc); chS.push(st.V + st.M + st.S);
      if (w === 48) atLaunch = st.V + st.M + st.S;
    }
    return { dcS, chS, atLaunch, left: dc + st.V + st.M + st.S, promoCost: promo * 100 };
  }

  function leverMount(el, ctx, done) {
    const LV = [["re", "Send Nova DC stock to ShopFast as it sells", "Reallocate stock Nova still owns to the account that sells X1 in a week."], ["stop", "Stop X1 sell-in to Vertex and MegaMart", "They hold 10 to 12 weeks. Today they each take about 300 a week from our DC."], ["promo", "Fund a Black Friday promo at Vertex and MegaMart: $100 off X1, W47–W48", "Doubles their X1 sell-through for two weeks. Costs $100 for every unit sold on promo."]];
    const L = {};
    el.innerHTML = '<p>Pick your levers. The chart shows where the X1 units sit week by week: in <b>our DC</b> (ours: no price protection, but markdown risk) and <b>in the channel</b> (the accounts\' stock: exposed to price protection when X2 launches).</p><div class="levers">' +
      LV.map(l => '<label class="lever"><input type="checkbox" data-k="' + l[0] + '"><span><b>' + l[1] + "</b><small>" + l[2] + "</small></span></label>").join("") +
      '<div class="lever trap"><span style="font-size:1.1rem">🔒</span><span><b>Move 2,000 of MegaMart\'s X1 to ShopFast</b><small>Not ours to move: MegaMart owns it.</small></span></div></div>' +
      '<div class="chart" id="lv-c"></div><div class="kpis"><div class="kpi warn"><span>Channel stock at X2 launch</span><b id="lv-a"></b></div><div class="kpi bad"><span>Exposure if X1 drops $100</span><b id="lv-e"></b></div><div class="kpi"><span>X1 left at W54 (all)</span><b id="lv-l"></b></div><div class="kpi"><span>Promo cost</span><b id="lv-p"></b></div></div>' +
      '<div class="row"><button class="btn sun" type="button" id="lv-go">Submit the plan</button></div><div id="lv-fb" class="stack"></div>';
    const base = simX1({});
    const draw = () => {
      const r = simX1(L), lab = ["W46", "W47", "W48", "W49", "W50", "W51", "W52", "W53", "W54"];
      line($("#lv-c", el), { labels: lab, series: [{ name: "In the channel (your plan)", data: r.chS, color: "var(--bad)", width: 3, dots: true }, { name: "In our DC (your plan)", data: r.dcS, color: "var(--s1)", width: 3, dots: true }, { name: "Channel, do nothing", data: base.chS, color: "var(--bad)", width: 1.4, dash: "4 4" }, { name: "DC, do nothing", data: base.dcS, color: "var(--s1)", width: 1.4, dash: "4 4" }], vlines: [{ x: 2.5, label: "X2 launches", color: "var(--sun)" }], aria: "Nova X1 stock in the channel and in our DC by week" });
      $("#lv-a", el).textContent = fmt(r.atLaunch); $("#lv-e", el).textContent = money(r.atLaunch * 100); $("#lv-l", el).textContent = fmt(r.left); $("#lv-p", el).textContent = money(r.promoCost);
    };
    $$(".lever input", el).forEach(c => c.addEventListener("change", () => { L[c.dataset.k] = c.checked; draw(); }));
    let fin = false;
    $("#lv-go", el).addEventListener("click", () => {
      const r = simX1(L), st = ctx.ch.m7plan = ctx.ch.m7plan || {};
      if (!st.first) st.first = Object.assign({}, L); st.last = Object.assign({}, L); ctx.save();
      const fb = [
        L.re ? ["good", "Reallocation: our own DC stock now flows to ShopFast, where X1 sells in a week. That's reallocating EOH done right: stock we own, moved to where it sells."] : ["bad", "No reallocation: ShopFast sells out in W47 and then sells nothing. Your fastest channel sits empty while 5,000 units wait in our DC."],
        L.stop ? ["good", "Sell-in stopped: no new X1 goes into accounts already holding 10 to 12 weeks, so their exposure only falls."] : ["bad", "Sell-in continues: you keep pushing about 600 a week into accounts that can't sell it. That raises the channel stock exposed at launch and pushes the problem onto your customers."],
        L.promo ? ["good", "Promo: Black Friday plus $100 off doubles X1 sell-through at the two full accounts for two weeks. It costs " + money(r.promoCost) + ", which Finance has to approve. That's the ask in your weekly report."] : ["part", "No promo: MegaMart still needs about 12 weeks to clear. A funded promo costs money now but reduces the price protection and markdowns later. Model it and let Finance decide."]
      ];
      $("#lv-fb", el).innerHTML = fb.map(f => '<div class="why ' + f[0] + '">' + f[1] + "</div>").join("") + '<div class="callout sun"><b>Your plan vs doing nothing</b><small>Channel stock at launch: ' + fmt(base.atLaunch) + " → " + fmt(r.atLaunch) + " units · exposure " + money(base.atLaunch * 100) + " → " + money(r.atLaunch * 100) + " · X1 left at W54: " + fmt(base.left) + " → " + fmt(r.left) + (r.left > 0 ? ". What's still in our DC goes to an outlet channel or another market next." : ".") + "</small></div>";
      if (!fin) { fin = true; if (L.re && L.stop) ctx.xp(10, "sound depletion plan"); done(); }
    });
    draw();
  }

  /* ======================= WEEK 48 · SCORECARD AND S&OP ======================= */
  const SC = [["Vertex · Nova X1", 4100, 3700], ["MegaMart · Nova A5", 5600, 5900], ["ShopFast · Nova Buds", 8400, 8100], ["ShopFast · Nova A5", 900, 1000], ["MegaMart · Nova Buds", 300, 120]];
  PP.missions.push({
    id: "m8", n: 8, week: 48, day: [5], mins: 11, art: "dart", title: "Scorecard and S&OP",
    sub: "November is closed. How wrong were we, which way, and did our process help?",
    hook: "Accuracy is how tight the darts are. Bias is whether they all miss to one side.",
    cast: ["priya", "ana"],
    steps: [
      { type: "chat", msgs: [
        ["priya", "November is closed. Time to grade ourselves before Monday's <b>S&amp;OP demand review</b>."],
        ["ana", "Bring accuracy, bias and what we learned. And tell me whether our overrides helped or hurt."]
      ] },
      { type: "info", title: "November: forecast vs actual", html: tbl([["Line"], ["Forecast", 1], ["Actual", 1], ["F − A", 1], ["% error", 1]], SC.map(r => ({ c: [r[0], fmt(r[1]), fmt(r[2]), (r[1] - r[2] > 0 ? "+" : "−") + fmt(Math.abs(r[1] - r[2])), pct(Math.abs(r[1] - r[2]) / r[2])], cls: r[2] < 200 ? "hl" : "" })).concat([{ c: ["Total", fmt(sum(SC.map(r => r[1]))), fmt(sum(SC.map(r => r[2]))), "+480", ""], cls: "total" }])) + '<p class="small muted">The forecasts are the ones you published in the Week 44 report.</p>' },
      { type: "calc", title: "Grade the forecast", html: '<div class="formula">WAPE = Σ|F − A| ÷ ΣA · Accuracy = 1 − WAPE · Bias = Σ(F − A) ÷ ΣA</div>',
        fields: [{ label: "Total absolute error Σ|F − A|", ans: 1280, tol: 0, suf: "units" }, { label: "WAPE", ans: 6.8, tol: 0.1, suf: "%" }, { label: "Bias (+ = too high)", ans: 2.55, tol: 0.11, suf: "%" }],
        sol: "|errors| = 400 + 300 + 300 + 100 + 180 = <b>1,280</b>. Total actual 18,820. WAPE = 1,280 ÷ 18,820 = <b>6.8%</b>, so accuracy is <b>93.2%</b>. Bias = +480 ÷ 18,820 = <b>+2.6%</b>: slightly high overall." },
      { type: "mcq", title: "Which number goes on the slide?", q: "For the same five lines, MAPE is 35.9% but WAPE is 6.8%. Which do you report as the headline, and why?",
        opts: [{ t: "MAPE: it's stricter, so it's more honest.", ok: false, fb: "It's not stricter, it's distorted. One tiny line decides it." },
          { t: "WAPE: it weights by volume. MAPE is blown up by the tiny MegaMart Buds line (300 forecast vs 120 sold = 150% error).", ok: true, fb: "MAPE averages percentages, so a line selling 120 units counts as much as one selling 8,100. WAPE says how wrong we were in <i>units that matter</i>. Then look at the tiny line separately: it's still a miss." },
          { t: "The average of the two.", ok: false, fb: "Averaging two metrics that measure different things gives a number that means nothing." }] },
      { type: "mcq", title: "The picture to remember: the dartboard", html: dartHTML(), q: "Your darts cluster slightly to the “over” side. What does the +2.6% bias mean?",
        opts: [{ t: "We forecast a little too high overall. Not alarming for one month, but watch it: if it persists, stock builds.", ok: true, fb: "Exactly. Accuracy is how tight the darts are; bias is which side they miss on. One month of +2.6% is noise; three months running is a pattern that builds inventory." },
          { t: "We under-forecast, so we lost sales.", ok: false, fb: "With bias = Σ(F − A) ÷ ΣA, positive means the forecast was above actual." },
          { t: "Accuracy is 97.4%.", ok: false, fb: "Bias and accuracy are different things. Accuracy comes from WAPE: 93.2%." }] },
      { type: "mcq", title: "Did the process add value?", html: '<div class="evid"><div><span class="eyebrow">Statistical forecast only</span><b>9.1% WAPE</b></div><div><span class="eyebrow">After cleaning + consensus</span><b>6.8% WAPE</b></div><div><span class="eyebrow">Sales input, unadjusted</span><b>14.2% WAPE</b></div></div>', key: "m8fva",
        q: "What is the forecast value added (FVA) of the consensus process over the statistical forecast?",
        opts: [{ t: "+2.3 points: the process improved it", ok: true, fb: "FVA = error before − error after = 9.1 − 6.8 = <b>+2.3 points</b>. Your cleaning (Weeks 41–42) and evidence-based consensus (Week 43) earned their keep. Raw sales input would have been <b>5.1 points worse</b> than the model: the case for weighting overrides by their track record." },
          { t: "−2.3 points: the process made it worse", ok: false, fb: "Lower WAPE is better. Error went down from 9.1 to 6.8, so the process helped." },
          { t: "+7.4 points", ok: false, fb: "That compares sales input (14.2) with consensus (6.8). FVA is measured against the step before: the statistical forecast." }] },
      { type: "custom", title: "Build the demand review pack", mount: orderMount },
      { type: "debrief" }, { type: "story" }
    ],
    recap: "You closed the loop: graded the month with WAPE (not MAPE), read bias as direction, measured forecast value added to prove the process helped, and turned it into a four-part demand review: performance, changes, risks, decisions. Next month's Week 1 starts with these lessons.",
    concepts: [["Forecast accuracy: MAPE, WAPE, bias", "../#practice"], ["Forecast accuracy", "../arena/#/m/accuracy"], ["Forecast bias", "../arena/#/m/bias"], ["S&OP", "../arena/#/m/sop"]],
    excel: "WAPE = <code>=SUMPRODUCT(ABS(F2:F6-A2:A6))/SUM(A2:A6)</code> · bias = <code>=(SUM(F2:F6)-SUM(A2:A6))/SUM(A2:A6)</code> · FVA = previous step's WAPE − this step's WAPE.",
    qs: ["c-wape", "c-bias", "c-fva", "c-sop", "s-accinv", "r-acc", "p-cycle"],
    bullet: "Measured monthly accuracy (WAPE 6.8%, 93.2% accuracy), bias (+2.6%) and forecast value added (+2.3 points over the statistical forecast) and prepared the S&OP demand review.",
    story() {
      return {
        s: "At the end of November in my simulation project, I graded the month's forecast across five account-product lines before the S&OP demand review.",
        t: "Report accuracy and bias, and show whether our process (cleaning and consensus) actually improved the forecast.",
        a: "I calculated WAPE rather than MAPE, because one tiny line (300 forecast, 120 sold) pushed MAPE to 35.9%. WAPE was 6.8%, so 93.2% accuracy, with +2.6% bias. Then I measured forecast value added: the statistical forecast alone scored 9.1%, consensus 6.8%, and raw sales input would have scored 14.2%.",
        r: "The process added 2.3 points of accuracy, and the evidence supported weighting sales overrides by their track record. I built the demand review as performance, changes, risks, decisions.",
        l: "Report WAPE and bias together. Accuracy without direction hides the bias that builds inventory."
      };
    }
  });

  function dartHTML() {
    const cx = 160, cy = 110, R = 96, cap = 0.25;
    const ang = [-40, 205, 30, 150, -5], code = ["V·X1", "M·A5", "S·Buds", "S·A5", "M·Buds"];
    const darts = SC.map((r, i) => {
      const e = (r[1] - r[2]) / r[2], rad = Math.min(Math.abs(e), cap) / cap * (R - 8), side = e >= 0 ? 1 : -1, a = ang[i] * Math.PI / 180;
      const x = cx + side * Math.abs(Math.cos(a)) * rad, y = cy + Math.sin(a) * rad, tx = side > 0 ? x + 8 : x - 8;
      return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="6" style="fill:var(--s1);stroke:var(--surface);stroke-width:2"/><text x="' + tx.toFixed(1) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="' + (side > 0 ? "start" : "end") + '">' + code[i] + "</text>";
    }).join("");
    return '<svg viewBox="0 0 320 222" class="tub" style="max-width:440px;margin:0 auto" role="img" aria-label="Dartboard: one dart per forecast line, most of them slightly on the over side">' +
      [R, R * 0.66, R * 0.33].map((r, i) => '<circle cx="' + cx + '" cy="' + cy + '" r="' + r.toFixed(1) + '" fill="none" stroke="currentColor" stroke-width="2" opacity="' + (0.22 + i * 0.18) + '"/>').join("") +
      '<line x1="' + cx + '" x2="' + cx + '" y1="10" y2="210" stroke="currentColor" stroke-dasharray="3 4" opacity=".35"/><circle cx="' + cx + '" cy="' + cy + '" r="5" style="fill:var(--bad)"/>' +
      '<text x="' + (cx - 12) + '" y="12" text-anchor="end">← UNDER</text><text x="' + (cx + 12) + '" y="12">OVER →</text>' + darts + "</svg>" +
      '<div class="kpis"><div class="kpi acc"><span>Accuracy (1 − WAPE)</span><b>93.2%</b></div><div class="kpi warn"><span>Bias</span><b>+2.6% · slightly over</b></div><div class="kpi"><span>MAPE (for contrast)</span><b>35.9%</b></div></div>' +
      '<p class="small muted">Each dart is one account · product line. Distance from the bullseye is its % error, capped at 25%, which is why the tiny MegaMart Buds line (150% off) sits on the edge. V = Vertex, M = MegaMart, S = ShopFast.</p>';
  }

  function orderMount(el, ctx, done) {
    const right = ["Performance: accuracy 93.2%, bias +2.6%, FVA +2.3 points", "What changed and why: X1 softer at Vertex, A5 Black Friday promo, Buds back in stock", "Risks and opportunities: X1 end-of-life stock, A5 supply recovered in W48", "Decisions needed: approve X1 promo funding; agree end-of-life buffers for future launches"];
    const shuffled = [2, 0, 3, 1];
    let picks = [];
    el.innerHTML = '<p>Tap the four slides in the order you\'d present them on Monday.</p><div class="order">' + shuffled.map(i => '<button type="button" class="oitem" data-i="' + i + '"><span class="on">·</span><span>' + esc(right[i]) + "</span></button>").join("") + '</div><div class="row"><button class="btn" type="button" id="or-reset">Start again</button></div><div id="or-fb"></div>';
    const items = $$(".oitem", el);
    const reset = () => { picks = []; items.forEach(b => { b.className = "oitem"; $(".on", b).textContent = "·"; }); $("#or-fb", el).innerHTML = ""; };
    items.forEach(b => b.addEventListener("click", () => {
      const i = +b.dataset.i; if (picks.indexOf(i) >= 0 || picks.length >= 4) return;
      picks.push(i); b.classList.add("sel"); $(".on", b).textContent = picks.length;
      if (picks.length === 4) {
        const ok = picks.every((p, k) => p === k);
        items.forEach(x => { const xi = +x.dataset.i; x.classList.add(picks.indexOf(xi) === xi ? "ok" : "no"); });
        $("#or-fb", el).innerHTML = ok ? '<div class="why good"><b>That\'s the shape of a demand review:</b> how good were we → what changed → what could go wrong → what we need decided. Leaders get the trust (performance) before the asks.</div>' : '<div class="why bad">Not quite. A demand review goes <b>performance → changes → risks → decisions</b>: earn trust with the scorecard first, end with the decisions. Start again and try it.</div>';
        if (ok) done();
      }
    }));
    $("#or-reset", el).addEventListener("click", reset);
  }
})();
