/* Acts IV and V: ABC classification, inventory levels, holding cost, lead time, safety stock, reorder point, bullwhip effect. */
(function () {
  "use strict";
  const { $, $$, esc, fmt, pct, sgn, money, clamp, sum, mean, sd, rng, gauss, zOf, zr, normPdf, normCdf, MONTHS } = PA.u;

  /* ---------- shared: ABC classification ---------- */
  PA.abcClassify = (items, ca, cb) => {
    const tot = sum(items.map(x => x.v)) || 1; let cum = 0;
    return items.slice().sort((a, b) => b.v - a.v).map((x, i) => { cum += x.v; const c = cum / tot; return Object.assign({}, x, { share: x.v / tot, cum: c, cls: i === 0 || c <= ca + 1e-9 ? "A" : c <= cb + 1e-9 ? "B" : "C" }); });
  };
  const SKUS = [["X-Pro phone", 6000, 550, 1.1], ["A-Series phone", 13500, 160, 0.25], ["Tablet", 2000, 280, 0.6], ["Smartwatch", 2500, 140, 0.8], ["Earbuds", 4200, 50, 0.45], ["Fast charger", 15000, 11, 0.3], ["Phone case", 20000, 6, 0.7], ["Screen protector", 24000, 2.5, 0.55], ["USB-C cable", 15000, 3, 0.4], ["Stylus", 1200, 25, 1.3]];
  const CLSCOL = { A: "var(--s1)", B: "var(--s5)", C: "var(--muted)" };

  /* ======================= 11 ABC CLASSIFICATION ======================= */
  PA.modules.push({
    id: "abc", num: 11, act: 4, mins: 11,
    title: "ABC classification",
    tag: "A few items carry most of the value. Find them, then manage each class differently",
    line: "ABC classification ranks items by annual value. Usually about 20% of items carry about 80% of the value, so you spend your attention where the money is and run the rest on simple rules.",
    html() {
      return PA.sec("01", "The idea", `<div class="prose"><p>The <b>Pareto principle</b> shows up everywhere in inventory: a small share of items accounts for most of the money. ABC classification makes that explicit.</p></div>
        <div class="formula">Annual consumption value (ACV) = annual units × unit cost</div>
        <ol class="takeaways" style="counter-reset:none"><li style="grid-template-columns:1fr"><span><b>1.</b> Calculate ACV for every item. <b>2.</b> Sort from highest to lowest. <b>3.</b> Add up the cumulative % of total value. <b>4.</b> Cut: A up to about 80%, B up to about 95%, C the rest. Companies tune the cut-offs.</span></li></ol>
        <div class="defs"><div class="def"><b class="cls-A">A: about 20% of items, 80% of value</b><small>Weekly review, consensus forecasting, closely managed safety stock, frequent cycle counts, close supplier collaboration.</small></div><div class="def"><b class="cls-B">B: about 30% of items, 15% of value</b><small>Monthly review, statistical forecast, standard safety stock.</small></div><div class="def"><b class="cls-C">C: about 50% of items, 5% of value</b><small>Simple min/max rules, larger and less frequent orders, automated replenishment, annual counts.</small></div></div>`) +
        PA.sec("02", "Live example: ten SKUs", `<div class="card flat sim"><p class="small">Edit units or unit cost; the table re-sorts and re-classifies itself. Move the cut-offs too.</p>
          <div class="ctls">${PA.ctl("abc-a", "A cut-off (cumulative value)", 60, 90, 1, 80, "%")}${PA.ctl("abc-b", "B cut-off", 85, 99, 1, 95, "%")}</div>
          <div class="tbl"><table><thead><tr><th>#</th><th>SKU</th><th class="n">Annual units</th><th class="n">Unit cost</th><th class="n">ACV</th><th class="n">Share</th><th class="n">Cumulative</th><th>Class</th></tr></thead><tbody id="abc-body"></tbody></table></div>
          <div class="chart" id="abc-chart"></div><div class="kpis" id="abc-k"></div><p class="say" id="abc-say"></p></div>`) +
        PA.sec("03", "See it: ABC × XYZ", `<div class="prose"><p>ABC says how much an item is <b>worth</b>. <b>XYZ</b> says how <b>predictable</b> it is, using the coefficient of variation of demand (CoV = standard deviation ÷ mean). Common cut-offs: X below 0.5 (steady), Y 0.5–1.0 (variable), Z above 1.0 (erratic). Cut-offs vary by company.</p></div><div id="xyz" class="stack"></div>`) +
        PA.sec("04", "Practise under pressure", `<div class="card flat row" style="justify-content:space-between"><div><b>ABC Sprint</b><br><small class="muted">12 random SKUs, 75 seconds, classify them all. Bots set the pace.</small></div><a class="btn primary" href="#/play/abc">${PA.icon("play")}Play ABC Sprint</a></div>`) +
        PA.sec("05", "Go deeper", `<details class="deep"><summary>Service levels by class: two schools</summary><div><p>Many companies give A items the highest service level because stock-outs there cost the most revenue. Others give C items a very high service level because their safety stock is cheap, and use tight control on A. Both are defensible. What matters is a deliberate policy per class.</p></div></details>
          <details class="deep"><summary>Value isn't the only criterion</summary><div><p>Multi-criteria ABC adds margin, criticality (a cheap part that stops a production line), lead time or customer importance. A $2 cable bundled with every phone is a C by value but critical in practice.</p></div></details>
          <details class="deep"><summary>Re-run it regularly</summary><div><p>Products move between classes as they launch, peak and decline. A quarterly re-run is common; for fast lifecycles like phones, monthly.</p></div></details>`);
    },
    mount(root) {
      const data = SKUS.map(s => ({ n: s[0], u: s[1], c: s[2], cov: s[3] }));
      let ca = 0.8, cb = 0.95;
      const body = $("#abc-body", root);
      const draw = () => {
        const cl = PA.abcClassify(data.map((d, i) => ({ n: d.n, i, v: d.u * d.c })), ca, cb);
        body.innerHTML = cl.map((x, r) => { const d = data[x.i]; return `<tr><td>${r + 1}</td><td>${esc(d.n)}</td><td class="n"><input type="number" data-k="u" data-i="${x.i}" value="${d.u}" min="0" aria-label="Units ${esc(d.n)}"></td><td class="n"><input type="number" data-k="c" data-i="${x.i}" value="${d.c}" min="0" step="0.5" aria-label="Unit cost ${esc(d.n)}"></td><td class="n">${money(x.v)}</td><td class="n">${pct(x.share)}</td><td class="n">${pct(x.cum)}</td><td class="cls-${x.cls}">${x.cls}</td></tr>`; }).join("");
        PA.bars($("#abc-chart", root), { labels: cl.map(x => x.n.split(" ")[0]), series: [{ name: "Annual value (bar colour = class)", color: "var(--s1)", data: cl.map(x => x.v), colors: cl.map(x => CLSCOL[x.cls]) }], line: { name: "Cumulative % of value", data: cl.map(x => x.cum * 100), color: "var(--s2)", max: 100, marks: [{ y: ca * 100, label: "A cut-off " + Math.round(ca * 100) + "%", color: "var(--s1)" }, { y: cb * 100, label: "B cut-off " + Math.round(cb * 100) + "%", color: "var(--s5)" }] }, yTick: v => "$" + (v >= 1e6 ? (v / 1e6).toFixed(1) + "M" : (v / 1e3).toFixed(0) + "k"), yFmt: v => money(v), rotate: true, aria: "Pareto chart of annual consumption value" });
        const g = k => cl.filter(x => x.cls === k), sv = k => sum(g(k).map(x => x.share));
        $("#abc-k", root).innerHTML = ["A", "B", "C"].map(k => PA.kpi("Class " + k + ": " + g(k).length + " of " + cl.length + " items hold", pct(sv(k)) + " of value", k === "A" ? "acc" : "")).join("");
        $("#abc-say", root).innerHTML = `<b>${g("A").length} items (${pct(g("A").length / cl.length, 0)}) carry ${pct(sv("A"))} of the value.</b> ${g("A").map(x => x.n).join(" and ")} deserve weekly attention and consensus forecasts. The ${g("C").length} C items together are only ${pct(sv("C"))}: put them on automatic min/max and spend the saved time on A.`;
        drawXYZ(cl);
      };
      const drawXYZ = cl => {
        const xyz = c => c < 0.5 ? "X" : c <= 1 ? "Y" : "Z", pol = { AX: "Automate the forecast, lean safety stock, frequent replenishment.", AY: "Statistical + consensus, moderate buffer, monthly review.", AZ: "Highest attention: work with accounts, watch sell-through, consider make-to-order.", BX: "Statistical forecast, periodic review.", BY: "Statistical with exception alerts.", BZ: "Review the drivers; pool stock centrally.", CX: "Min/max, big orders, fully automatic.", CY: "Min/max, periodic review.", CZ: "Make to order, or consider delisting." };
        let h = '<div class="tbl"><table><thead><tr><th></th><th>X · steady</th><th>Y · variable</th><th>Z · erratic</th></tr></thead><tbody>';
        ["A", "B", "C"].forEach(a => { h += `<tr><td class="cls-${a}"><b>${a}</b></td>` + ["X", "Y", "Z"].map(x => { const its = cl.filter(c => c.cls === a && xyz(data[c.i].cov) === x); return `<td style="min-width:150px"><b class="small">${a}${x}</b> ${its.map(c => `<span class="pill" style="color:${CLSCOL[a]}">${esc(c.n)} · ${data[c.i].cov}</span>`).join(" ")}<br><small class="muted">${pol[a + x]}</small></td>`; }).join("") + "</tr>"; });
        $("#xyz", root).innerHTML = h + "</tbody></table></div><p class='small muted'>The number on each item is its CoV. The X-Pro is <b>AZ</b>: high value and erratic (launch spikes, promotions), so it gets the most human attention of anything in the range.</p>";
      };
      body.addEventListener("change", e => { const t = e.target; if (!t.dataset.k) return; data[+t.dataset.i][t.dataset.k] = Math.max(0, +t.value || 0); draw(); });
      PA.bindCtls(root, ["abc-a", "abc-b"], v => { ca = v["abc-a"] / 100; cb = Math.max(v["abc-b"], v["abc-a"] + 1) / 100; draw(); });
    },
    ask: ["What is ABC classification and how would you use it?", "Rank items by annual consumption value (units × cost), then cut by cumulative share: A is roughly the top 80% of value, usually about 20% of items; B the next 15%; C the last 5%. A items get weekly review, consensus forecasting and tight control; C items get simple automated rules. I'd add XYZ for predictability and re-run it every quarter."],
    boss: [
      { q: "An item sells 2,000 units a year at a unit cost of $50. Annual consumption value?", o: ["$2,050", "$40,000", "$100,000", "$1,000,000"], a: 2, why: "ACV = 2,000 × $50 = $100,000." },
      { q: "Typically, A items are about…", o: ["80% of items and 20% of value", "20% of items and 80% of value", "50% of items and 50% of value", "5% of items and 5% of value"], a: 1, why: "The Pareto pattern: a small share of items carries most of the value." },
      { q: "An item's demand has a coefficient of variation of 1.4. Which XYZ class?", o: ["X", "Y", "Z", "A"], a: 2, why: "CoV above 1.0 is erratic, which is Z on the common cut-offs. (A is a value class, not a variability class.)" }
    ],
    take: ["ACV = annual units × unit cost; sort, add up the cumulative %, cut at about 80/95.", "A gets attention (weekly, consensus, tight control); C gets rules (min/max, automation).", "Add XYZ (CoV) to see predictability. AZ items need the most human judgment."],
    mnem: ["A = Attention · B = Balance · C = Control by rules", "Spend your hours where the money is."]
  });

  /* ======================= 12 INVENTORY LEVELS ======================= */
  PA.modules.push({
    id: "levels", num: 12, act: 4, mins: 10,
    title: "Inventory levels",
    tag: "Cycle, safety, pipeline and anticipation stock; inventory position; turns and days",
    line: "Inventory isn't one number. It's layers with different jobs: cycle stock that runs down and refills, safety stock underneath, stock in transit, and stock built ahead of a peak. Reorder decisions use inventory position, not just what's on the shelf.",
    html() {
      return PA.sec("01", "The idea: the layers", `<div class="defs">${[["Cycle stock", "var(--s1)", "Runs down as you sell and refills when an order arrives. Averages about half the order quantity (Q ÷ 2)."], ["Safety stock", "var(--s3)", "The cushion underneath for demand and supply surprises (module 15)."], ["Pipeline (in-transit)", "var(--s5)", "Ordered and on its way. Pipeline = demand rate × transit time."], ["Anticipation stock", "var(--s2)", "Built ahead of a known event: holiday peak, promotion, factory shutdown."], ["Decoupling stock", "var(--s6)", "Buffers between stages so one stage's hiccup doesn't stop the next."], ["Excess and obsolete", "var(--bad)", "More than you'll sell before it ages. The cost of over-forecasting."]].map(x => `<div class="def"><b style="color:${x[1]}">${x[0]}</b><small>${x[2]}</small></div>`).join("")}</div>
        <div class="grid2"><div class="formula">Average inventory ≈ Safety stock + Q ÷ 2</div><div class="formula">Inventory position = On hand + On order − Backorders</div><div class="formula">Turns = Annual COGS ÷ Average inventory value</div><div class="formula">Days of inventory (DIO) = 365 ÷ Turns</div></div>`) +
        PA.sec("02", "See it: the sawtooth", `<div class="card flat sim"><div class="ctls">${PA.ctl("lv-d", "Weekly demand", 100, 1500, 50, 500)}${PA.ctl("lv-q", "Order quantity Q", 250, 5000, 250, 2000)}${PA.ctl("lv-ss", "Safety stock", 0, 1500, 50, 400)}${PA.ctl("lv-c", "Unit cost", 20, 1000, 10, 500, "")}</div>
          <div class="chart" id="lv-chart"></div><div class="kpis" id="lv-k"></div><p class="say" id="lv-say"></p></div>`) +
        PA.sec("03", "Live example: where is my stock?", `<div class="card flat sim"><p class="small">The warehouse system shows 800 on the shelf. Is it time to reorder (reorder point 2,400)? Move the other numbers and see why on-hand alone misleads.</p>
          <div class="ctls">${PA.ctl("ip-oh", "On hand", 0, 3000, 50, 800)}${PA.ctl("ip-oo", "On order (open POs, in transit)", 0, 4000, 50, 1500)}${PA.ctl("ip-bo", "Backorders (owed to customers)", 0, 1500, 50, 200)}</div>
          <div id="ip-vis" class="stack"></div><p class="say" id="ip-say"></p></div>
          <div class="callout info"><b>Anticipation stock, worked</b>Factories close for 3 weeks over Lunar New Year. Weekly demand is 500, so the plan builds <b>3 × 500 = 1,500</b> extra units before the shutdown, plus extra transit time if shipping slows down too. Without it, stores run dry in February.</div>
          <div class="callout"><b>Pipeline stock, worked</b>Shipping 500 units a week on a 5-week ocean route means <b>500 × 5 = 2,500</b> units are always at sea. Depending on shipping terms you may already own them, and pay holding cost on them, before anyone can sell them. That's Little's law: inventory = throughput × flow time.</div>`) +
        PA.sec("04", "Go deeper", `<details class="deep"><summary>Policies: (s, Q), (s, S) and (R, S)</summary><div><p><b>(s, Q):</b> when inventory position falls to s (the reorder point), order a fixed Q. <b>(s, S)</b> or min/max: at s, order up to S. <b>(R, S):</b> every R days, order up to S, whatever the level. Periodic review is easier to run but needs more safety stock, because it covers R + lead time.</p></div></details>
          <details class="deep"><summary>Turns differ hugely by industry</summary><div><p>Fresh food turns weekly; heavy machinery a few times a year. Compare a product with its own target and its own history, not with a universal benchmark.</p></div></details>
          <details class="deep"><summary>Channel inventory is inventory too</summary><div><p>Stock at carriers and retailers isn't on the brand's balance sheet once it's sold in, but it decides the next orders. See the crash course's <a href="../#concepts">channel inventory and weeks-of-supply concepts</a>.</p></div></details>`);
    },
    mount(root) {
      PA.bindCtls(root, ["lv-d", "lv-q", "lv-ss", "lv-c"], v => {
        const d = v["lv-d"], Q = v["lv-q"], ss = v["lv-ss"], c = v["lv-c"], days = 7 * 20, dd = d / 7, cyc = Q / dd;
        const inv = [], lab = [];
        for (let t = 0; t <= days; t++) { inv.push(ss + Q - dd * (t % cyc)); lab.push("W" + Math.floor(t / 7)); }
        const avg = ss + Q / 2, turns = d * 52 / avg, dio = 365 / turns;
        PA.line($("#lv-chart", root), { labels: lab, series: [{ name: "On hand", data: inv, color: "var(--s1)", width: 2.4, area: true, areaBase: ss, areaOp: 0.18 }], hbands: [{ y0: 0, y1: ss, color: "var(--s3)", op: 0.22, label: ss ? "safety stock" : "" }], hlines: [{ y: avg, label: "average " + fmt(avg), color: "var(--s2)" }], yMin: 0, xEvery: 14, tip: false, legend: false, aria: "Sawtooth inventory over 20 weeks" });
        $("#lv-k", root).innerHTML = PA.kpi("Average inventory", fmt(avg) + " units", "acc") + PA.kpi("Inventory value", money(avg * c)) + PA.kpi("Turns per year", turns.toFixed(1)) + PA.kpi("Days of inventory", dio.toFixed(1)) + PA.kpi("Average weeks of supply", (avg / d).toFixed(1)) + PA.kpi("Orders per year", (d * 52 / Q).toFixed(1));
        $("#lv-say", root).innerHTML = `Each order of ${fmt(Q)} lasts ${(Q / d).toFixed(1)} weeks. The blue cycle stock averages Q ÷ 2 = ${fmt(Q / 2)}; the green safety stock (${fmt(ss)}) sits underneath and is only touched when something goes wrong. Halve Q and average inventory falls to ${fmt(ss + Q / 4)}, but you place twice as many orders. That trade-off is EOQ (module 13).`;
      });
      PA.bindCtls(root, ["ip-oh", "ip-oo", "ip-bo"], v => {
        const oh = v["ip-oh"], oo = v["ip-oo"], bo = v["ip-bo"], ip = oh + oo - bo, rop = 2400, mx = Math.max(oh + oo, 1);
        const bar = (lab, val, col) => `<div class="hbar"><span>${lab}</span><span class="bar"><i style="width:${Math.abs(val) / mx * 100}%;background:${col}"></i></span><span class="v">${sgn(val)}</span></div>`;
        $("#ip-vis", root).innerHTML = bar("On hand", oh, "var(--s1)") + bar("On order", oo, "var(--s5)") + bar("Backorders", -bo, "var(--bad)") + `<div class="kpis">${PA.kpi("Inventory position", fmt(ip), "acc")}${PA.kpi("Reorder point", fmt(rop))}${PA.kpi("Decision", ip <= rop ? "Order now" : "Wait", ip <= rop ? "bad" : "good")}</div>`;
        $("#ip-say", root).innerHTML = `Inventory position = ${fmt(oh)} + ${fmt(oo)} − ${fmt(bo)} = <b>${fmt(ip)}</b>. ` + (oh <= rop && ip > rop ? "On-hand alone says reorder, but enough is already on its way. Ordering now would double-order: the classic way to create excess (and a little bullwhip)." : ip <= rop ? "Even counting what's on order, you're at or below the reorder point: place an order." : "Comfortably above the reorder point. Nothing to do.");
      });
    },
    ask: ["What's the difference between on-hand and inventory position, and why does it matter?", "On-hand is what's physically in the warehouse. Inventory position adds what's on order and subtracts backorders. Reorder decisions should use inventory position; otherwise you reorder stock that's already on its way and create excess."],
    boss: [
      { q: "Order quantity Q = 1,000 and safety stock = 300. Approximate average inventory?", o: ["300", "800", "1,000", "1,300"], a: 1, why: "Average ≈ SS + Q ÷ 2 = 300 + 500 = 800." },
      { q: "On hand 600, on order 1,000, backorders 100. Inventory position?", o: ["500", "1,500", "1,600", "1,700"], a: 1, why: "600 + 1,000 − 100 = 1,500." },
      { q: "Annual COGS $12M, average inventory $2M. Turns and days of inventory?", o: ["6 turns, about 61 days", "24 turns, about 15 days", "0.17 turns, 2,190 days", "10 turns, 36.5 days"], a: 0, why: "Turns = 12 ÷ 2 = 6. Days = 365 ÷ 6 ≈ 61." }
    ],
    take: ["Inventory has layers: cycle, safety, pipeline, anticipation, decoupling, and the excess you didn't want.", "Average inventory ≈ SS + Q ÷ 2. Turns = COGS ÷ average inventory; DIO = 365 ÷ turns.", "Reorder on inventory position (on hand + on order − backorders), never on-hand alone."],
    mnem: ["“Can Some Pirates Always Dig Deep?”", "Cycle · Safety · Pipeline · Anticipation · Decoupling · Dead (excess and obsolete)."]
  });

  /* ======================= 13 HOLDING COST ======================= */
  const HC = [["Capital", "var(--s1)", 10, "Money tied up in stock could earn a return elsewhere (often the cost of capital, WACC)."], ["Storage", "var(--s6)", 4, "Warehouse space, handling, utilities, staff."], ["Service", "var(--s5)", 2, "Insurance, taxes, inventory systems."], ["Risk", "var(--bad)", 9, "Obsolescence, damage, theft (shrinkage), and price erosion: big for electronics."]];
  PA.modules.push({
    id: "holding", num: 13, act: 4, mins: 10,
    title: "Inventory holding cost",
    tag: "What a unit sitting on a shelf really costs per year, and the order size that minimises total cost",
    line: "Stock isn't free once it's paid for. Every unit on the shelf costs money each month it sits there: capital, space, service and risk. A common rule of thumb is 20–30% of its value a year (practitioner estimates run from about 15% to 35%), often more for electronics.",
    html() {
      return PA.sec("01", "The idea: Capital, Storage, Service, Risk", `<div class="defs">${HC.map(h => `<div class="def"><b style="color:${h[1]}">${h[0]}</b><small>${h[3]}</small></div>`).join("")}</div>
        <div class="grid2"><div class="formula">Annual holding cost = Average inventory value × holding rate</div><div class="formula">H (per unit per year) = unit cost × holding rate</div></div>`) +
        PA.sec("02", "Simulate: build your holding rate", `<div class="card flat sim"><div class="grid2" style="align-items:center"><div id="hc-donut"></div><div class="stack">${HC.map((h, i) => PA.ctl("hc-" + i, h[0], 0, 25, 0.5, h[2], "%")).join("")}</div></div>
          <div class="ctls">${PA.ctl("hc-u", "Average units on hand", 100, 10000, 100, 1400)}${PA.ctl("hc-c", "Unit cost", 10, 1000, 10, 500)}${PA.ctl("hc-pe", "Price erosion per month (electronics)", 0, 4, 0.25, 1.5, "%")}</div>
          <div class="kpis" id="hc-k"></div><p class="say" id="hc-say"></p></div>
          <p class="small muted">Starting values are illustrative. Real holding rates come from your finance team; ask them how it's calculated.</p>`) +
        PA.sec("03", "See it: the economic order quantity (EOQ)", `<div class="card flat sim"><p class="small">Big orders mean few ordering costs but lots of stock to hold. Small orders mean little stock but many orders. Total cost bottoms out at the EOQ.</p>
          <div class="formula">EOQ = √( 2 × D × S ÷ H )</div>
          <div class="ctls">${PA.ctl("eq-d", "Annual demand D", 1000, 60000, 1000, 26000)}${PA.ctl("eq-s", "Cost per order S", 25, 2000, 25, 400)}${PA.ctl("eq-h", "H = holding cost per unit per year", 5, 300, 5, 125)}${PA.ctl("eq-q", "Your order size Q", 50, 3000, 10, 1000)}</div>
          <div class="chart" id="eq-chart"></div><div class="kpis" id="eq-k"></div><p class="say" id="eq-say"></p></div>`) +
        PA.sec("04", "Go deeper", `<details class="deep"><summary>EOQ's assumptions</summary><div><p>Steady, known demand; a fixed cost per order; a holding cost proportional to stock; no quantity discounts; whole orders arriving at once. Real life breaks most of these. EOQ is still a useful anchor, and the curve is flat near the bottom, so being 20% off EOQ costs little.</p></div></details>
          <details class="deep"><summary>The hidden holding cost in electronics</summary><div><p>A phone loses value every month it sits unsold as newer models and price cuts arrive. Stock sold into the channel can come back as <b>price protection</b>: the brand pays accounts for the price drop on units they still hold. That's why buffers shrink as a model ages.</p></div></details>
          <details class="deep"><summary>“The warehouse is already paid for”</summary><div><p>Fixed storage feels free, but the capital and risk components still apply, and a full warehouse forces overflow storage or blocks better products. Use the full rate when deciding whether to hold stock.</p></div></details>`);
    },
    mount(root) {
      const ids = HC.map((_, i) => "hc-" + i).concat(["hc-u", "hc-c", "hc-pe"]);
      PA.bindCtls(root, ids, v => {
        const parts = HC.map((_, i) => v["hc-" + i]), tot = sum(parts) || 0.0001, u = v["hc-u"], c = v["hc-c"], pe = v["hc-pe"];
        let a = -90, g = "";
        parts.forEach((p, i) => { if (!p) return; const sw = p / tot * 360, a1 = a + sw - 0.8, p0 = PA.polar(110, 110, 92, a), p1 = PA.polar(110, 110, 92, a1), q0 = PA.polar(110, 110, 58, a1), q1 = PA.polar(110, 110, 58, a), lg = sw > 180 ? 1 : 0; g += `<path d="M${p0[0]} ${p0[1]} A92 92 0 ${lg} 1 ${p1[0]} ${p1[1]} L${q0[0]} ${q0[1]} A58 58 0 ${lg} 0 ${q1[0]} ${q1[1]}Z" style="fill:${HC[i][1]}"/>`; a += sw; });
        g += `<text x="110" y="108" text-anchor="middle" style="font-family:var(--display);font-weight:800;font-size:28px;fill:var(--ink)">${tot.toFixed(1)}%</text><text x="110" y="128" text-anchor="middle" style="font-size:11px;fill:var(--muted)">per year</text>`;
        $("#hc-donut", root).innerHTML = `<svg class="diagram" style="max-width:240px" viewBox="0 0 220 220" role="img" aria-label="Holding cost breakdown">${g}</svg>`;
        const rate = tot / 100, annual = u * c * rate, perMonth = c * rate / 12, ero = c * pe / 100 * 3, hold3 = perMonth * 3;
        $("#hc-k", root).innerHTML = PA.kpi("Holding rate", tot.toFixed(1) + "% a year", "acc") + PA.kpi("Annual holding cost", money(annual), "bad") + PA.kpi("Per unit per month", money(perMonth, 2)) + PA.kpi("Per week, whole stock", money(annual / 52));
        $("#hc-say", root).innerHTML = `${fmt(u)} units × ${money(c)} × ${tot.toFixed(1)}% = <b>${money(annual)} a year</b> just to keep this stock. One unit sitting <b>3 extra months</b> costs ${money(hold3, 2)} in holding` + (pe ? ` plus about ${money(ero, 2)} in lost value from price erosion at ${pe}% a month: <b>${money(hold3 + ero, 2)}</b>, or ${pct((hold3 + ero) / c)} of its cost.` : ".");
      });
      PA.bindCtls(root, ["eq-d", "eq-s", "eq-h", "eq-q"], v => {
        const D = v["eq-d"], Sx = v["eq-s"], H = v["eq-h"], Q = v["eq-q"], eoq = Math.sqrt(2 * D * Sx / H);
        const qs = []; for (let q = 50; q <= 3000; q += 50) qs.push(q);
        const oc = q => D / q * Sx, hcost = q => q / 2 * H;
        const i = Math.round((Q - 50) / 50), ie = Math.round((clamp(eoq, 50, 3000) - 50) / 50);
        PA.line($("#eq-chart", root), { labels: qs.map(String), series: [{ name: "Ordering cost (D ÷ Q × S)", data: qs.map(oc), color: "var(--s2)" }, { name: "Holding cost (Q ÷ 2 × H)", data: qs.map(hcost), color: "var(--s1)" }, { name: "Total", data: qs.map(q => oc(q) + hcost(q)), color: "var(--s0)", width: 3 }], yMin: 0, yMax: Math.max(oc(eoq) + hcost(eoq), 1) * 3, marks: [{ x: clamp(i, 0, qs.length - 1), y: oc(Q) + hcost(Q), label: "your Q", color: "var(--s4)" }, { x: ie, y: oc(eoq) + hcost(eoq), label: "EOQ", color: "var(--good)" }], yTick: x => "$" + (x / 1000).toFixed(0) + "k", yFmt: x => money(x), xLabelW: 40, aria: "EOQ cost curves" });
        const tq = oc(Q) + hcost(Q), te = oc(eoq) + hcost(eoq);
        $("#eq-k", root).innerHTML = PA.kpi("EOQ", fmt(eoq) + " units", "good") + PA.kpi("Total cost at EOQ", money(te)) + PA.kpi("Total cost at your Q", money(tq), tq > te * 1.1 ? "bad" : "") + PA.kpi("Orders a year at EOQ", (D / eoq).toFixed(1));
        $("#eq-say", root).innerHTML = `At EOQ the ordering and holding costs are equal (${money(oc(eoq))} each). Your Q of ${fmt(Q)} costs <b>${pct(tq / te - 1)}</b> more than EOQ. Notice how flat the bottom of the curve is: anywhere from about ${fmt(eoq * 0.75)} to ${fmt(eoq * 1.3)} costs less than 5% extra.`;
      });
    },
    ask: ["What goes into inventory holding cost?", "Capital cost (the return the money could earn elsewhere), storage and handling, service costs like insurance and taxes, and risk: obsolescence, damage, shrinkage and, in electronics, price erosion. A common rule of thumb is 20–30% of item value a year, higher for fast-ageing products. I'd confirm the company's rate with finance."],
    boss: [
      { q: "Average inventory is worth $2M and the holding rate is 25%. Annual holding cost?", o: ["$50k", "$250k", "$500k", "$8M"], a: 2, why: "$2M × 25% = $500,000 a year." },
      { q: "Which component is usually the biggest part of holding cost?", o: ["Insurance", "Cost of capital", "Taxes", "Warehouse lighting"], a: 1, why: "Typically the cost of capital, the return the tied-up cash could have earned. For electronics, obsolescence and price erosion can rival it." },
      { q: "D = 1,000 a year, S = $50 per order, H = $4 per unit per year. EOQ?", o: ["50", "112", "158", "250"], a: 2, why: "√(2 × 1,000 × 50 ÷ 4) = √25,000 ≈ 158." }
    ],
    take: ["Holding cost = Capital + Storage + Service + Risk, as a % of value per year.", "Annual cost = average inventory value × holding rate; electronics adds price erosion on top.", "EOQ = √(2DS ÷ H) balances ordering and holding cost, and the curve is flat near the bottom."],
    mnem: ["“Cash Sits, Stuff Rots”", "Capital · Storage · Service · Risk. Every month on the shelf costs money."]
  });

  /* ======================= 14 LEAD TIME ======================= */
  const LT = [["PO processing", "var(--s6)", 1], ["Supplier production", "var(--s2)", 6], ["Transit", "var(--s1)", 5], ["Customs and receiving", "var(--s5)", 1], ["DC to store", "var(--s3)", 1]];
  PA.modules.push({
    id: "lead-time", num: 14, act: 4, mins: 11,
    title: "Lead time",
    tag: "The wait between deciding and having, and how it shapes the whole demand plan",
    line: "Lead time is the gap between deciding to order and having stock you can sell. It sets how far ahead you must forecast, what's locked in your plan, and how much safety stock you need.",
    html() {
      return PA.sec("01", "The idea", `<div class="prose"><p><b>Lead time</b> = the time from the order decision until the goods are available to sell. It's a chain of smaller waits, and every link can slip.</p></div>
        <div class="defs"><div class="def"><b>Supplier lead time</b><small>PO sent → goods shipped.</small></div><div class="def"><b>Transit time</b><small>Ocean, air, truck, rail. Mode is a cost-versus-speed decision.</small></div><div class="def"><b>Cumulative lead time</b><small>The longest path through the bill of materials: the time to build from scratch.</small></div><div class="def"><b>Customer lead time</b><small>Order → delivery, as the customer sees it.</small></div><div class="def"><b>Lead-time variability (σLT)</b><small>How much the actual wait swings. Often hurts more than the average.</small></div></div>`) +
        PA.sec("02", "See it: build a lead time", `<div class="card flat sim"><div class="sim-h">${PA.chips("lt-mode", [["sea", "Ocean freight"], ["air", "Air freight"]], "sea")}<span class="small muted">Air: about 1 week in transit, costs more per unit</span></div>
          <div class="ctls">${LT.map((l, i) => PA.ctl("lt-" + i, l[0], 0, 12, 1, l[2], " wk")).join("")}</div>
          <div id="lt-gantt" class="stack"></div>
          <div class="ctls">${PA.ctl("lt-need", "Stock needed in stores by week", 10, 52, 1, 47)}${PA.ctl("lt-units", "Units", 1000, 50000, 1000, 20000)}</div>
          <div class="kpis" id="lt-k"></div><p class="say" id="lt-say"></p></div>`) +
        PA.sec("03", "How lead time is factored into the demand plan", `<div class="steps">${[["Horizon", "The forecast must reach beyond the cumulative lead time. If parts take 16 weeks, a 12-week forecast is useless for buying them."], ["Order timing", "Order date = need date − lead time. Forecasts are offset by lead time to generate purchase orders."], ["Time fences", "Inside the lead time the plan is frozen (changes are expensive or impossible); further out it's slushy, then liquid."], ["Demand during lead time", "d × LT is what you'll sell while you wait. It sets the reorder point (module 16)."], ["Safety stock", "Grows with √LT and with lead-time variability (module 15)."], ["Accuracy lag", "Judge the forecast made one lead time ahead, because that's the one supply acted on (module 08)."]].map((s, i) => `<div class="step"><span class="sn">${i + 1}</span><div><b>${s[0]}</b><br><small>${s[1]}</small></div></div>`).join("")}</div>
          <div class="card flat sim"><h3>Time fences on a 24-week horizon</h3><div class="ctls">${PA.ctl("tf-f", "Frozen until week", 1, 12, 1, 4)}${PA.ctl("tf-s", "Slushy until week", 2, 20, 1, 12)}</div><div id="tf-strip"></div><p class="small" id="tf-say"></p></div>`) +
        PA.sec("04", "Simulate: what variability does to safety stock", `<div class="card flat sim"><p class="small">Weekly demand 500 (σ 120), average lead time 4 weeks, 95% service. Now let deliveries wobble.</p>${PA.ctl("ltv", "Lead-time variability σLT", 0, 2, 0.25, 0, " wk")}<div class="kpis" id="ltv-k"></div><p class="say" id="ltv-say"></p></div>`) +
        PA.sec("05", "Go deeper", `<details class="deep"><summary>Quoted vs actual lead time</summary><div><p>Suppliers quote one number; reality is a distribution. Track actual receipt minus PO date for every order and plan on the real average and spread, not the brochure.</p></div></details>
          <details class="deep"><summary>Shorter lead times calm the whole chain</summary><div><p>Every week of lead time is a week of forecast you have to get right. Cutting lead time reduces forecast error, safety stock and the bullwhip effect (module 17).</p></div></details>`);
    },
    mount(root) {
      let mode = "sea";
      const draw = () => {
        const w = LT.map((_, i) => +$("#lt-" + i, root).value); if (mode === "air") w[2] = 1;
        const tot = sum(w), need = +$("#lt-need", root).value, units = +$("#lt-units", root).value;
        LT.forEach((_, i) => { $("#lt-" + i + "-v", root).textContent = (i === 2 && mode === "air" ? 1 : w[i]) + " wk"; });
        let acc = 0;
        $("#lt-gantt", root).innerHTML = `<div style="display:flex;height:34px;border-radius:8px;overflow:hidden;border:1px solid var(--line)">${w.map((x, i) => x ? `<div title="${LT[i][0]}" style="flex:${x};background:${LT[i][1]};color:#fff;font-size:.72rem;display:grid;place-items:center;white-space:nowrap;overflow:hidden">${x}w</div>` : "").join("")}</div><div class="legend">${LT.map(l => `<span><i style="background:${l[1]}"></i>${l[0]}</span>`).join("")}</div>`;
        const ow = need - tot, owTxt = ow >= 1 ? "week " + ow : "week " + (52 + ow) + " of last year";
        const sea = sum(LT.map((_, i) => +$("#lt-" + i, root).value)), airCost = units * 8, saved = sea - (sea - (+$("#lt-2", root).value) + 1);
        $("#lt-k", root).innerHTML = PA.kpi("Total lead time", tot + " weeks", "acc") + PA.kpi("Order by", owTxt, "bad") + PA.kpi("Air freight premium (illustrative $8/unit)", mode === "air" ? money(airCost) : "–");
        $("#lt-say", root).innerHTML = `To have stock in stores by week ${need}, the purchase order must go out by <b>${owTxt}</b>. Everything inside those ${tot} weeks runs on a forecast nobody can change cheaply. ` + (mode === "air" ? `Air cuts ${saved} weeks of transit and buys ${saved} weeks of forecast freshness, for about ${money(airCost)} on ${fmt(units)} units. Worth it for a hot launch; rarely for a steady seller.` : `Switching to air would cut transit to about 1 week: a later order date, a fresher forecast, a higher freight bill.`);
      };
      [0, 1, 2, 3, 4].forEach(i => $("#lt-" + i, root).addEventListener("input", draw));
      ["lt-need", "lt-units"].forEach(id => $("#" + id, root).addEventListener("input", () => { $("#" + id + "-v", root).textContent = fmt(+$("#" + id, root).value); draw(); }));
      $("#lt-need-v", root).textContent = 47; $("#lt-units-v", root).textContent = fmt(20000);
      PA.onChips(root, "lt-mode", v => { mode = v; draw(); }); draw();
      PA.bindCtls(root, ["tf-f", "tf-s"], v => {
        const f = v["tf-f"], s = Math.max(v["tf-s"], f + 1);
        $("#tf-strip", root).innerHTML = `<div style="display:grid;grid-template-columns:repeat(24,1fr);gap:2px">${Array.from({ length: 24 }, (_, i) => `<span title="Week +${i + 1}" style="height:28px;border-radius:3px;background:${i < f ? "var(--s1)" : i < s ? "var(--s5)" : "var(--accent-soft)"};opacity:${i < f ? 1 : i < s ? 0.6 : 1}"></span>`).join("")}</div><div class="legend" style="margin-top:6px"><span><i style="background:var(--s1)"></i>Frozen: weeks 1–${f}</span><span><i style="background:var(--s5);opacity:.6"></i>Slushy: ${f + 1}–${s}</span><span><i style="background:var(--accent-soft)"></i>Liquid: ${s + 1}–24</span></div>`;
        $("#tf-say", root).innerHTML = `Frozen ≈ manufacturing and transit lead time: product is already being built or shipped, so changes cost expedites or cancellations. Slushy ≈ component lead time: changes are possible within limits (mix, not total). Liquid: change freely. A demand planner spends most of the week on the slushy and liquid zones.`;
      });
      PA.bindCtls(root, ["ltv"], v => {
        const z = 1.65, d = 500, sdd = 120, L = 4, sl = v.ltv, ss1 = z * sdd * Math.sqrt(L), ss2 = z * Math.sqrt(L * sdd * sdd + d * d * sl * sl);
        $("#ltv-k", root).innerHTML = PA.kpi("Safety stock, demand variability only", fmt(ss1)) + PA.kpi("Safety stock with σLT = " + sl, fmt(ss2), sl ? "bad" : "good") + PA.kpi("Increase", pct(ss2 / ss1 - 1, 0), "warn");
        $("#ltv-say", root).innerHTML = sl ? `One week of lead-time wobble adds d² × σLT² = 500² × ${sl}² = ${fmt(d * d * sl * sl)} to the variance under the square root, versus ${fmt(L * sdd * sdd)} from demand. Unreliable supply can cost more buffer than unpredictable customers.` : "With perfectly reliable deliveries, only demand variability needs covering. Slide σLT up.";
      }, { ltv: x => x.toFixed(2) + " wk" });
    },
    ask: ["How do you factor lead time into a demand plan?", "Lead time decides how far ahead the forecast has to be right and when orders go out: order date = need date − lead time. The plan inside the lead time is frozen, so accuracy is measured at that lag. Demand during lead time sets the reorder point, and safety stock grows with the square root of lead time and with lead-time variability. If a lead time grows, say port congestion, I'd raise the order point and safety stock and flag the risk."],
    boss: [
      { q: "Stock is needed in week 40 and the total lead time is 9 weeks. When must the order go out?", o: ["Week 31", "Week 40", "Week 49", "Week 36"], a: 0, why: "Order date = need date − lead time = 40 − 9 = week 31." },
      { q: "Demand is 300 a week and lead time is 4 weeks. Demand during lead time?", o: ["75", "304", "1,200", "3,000"], a: 2, why: "d × LT = 300 × 4 = 1,200 units sold while you wait." },
      { q: "What usually happens to the plan inside the frozen time fence?", o: ["It changes freely every week", "It's locked: changes are costly or impossible", "It's ignored", "Finance owns it"], a: 1, why: "Inside the frozen zone product is already being built or shipped; changing it means expedites, cancellations or idle capacity." }
    ],
    take: ["Lead time = processing + production + transit + customs and receiving (+ to store). Track the actuals, not the quote.", "Order date = need date − lead time; forecast beyond the cumulative lead time.", "Lead time sets time fences, the reorder point and safety stock. Its variability can cost more than demand's."],
    mnem: ["“Order = Need − Lead”", "Work backwards from the date you need it, and don't touch what's frozen."]
  });

  /* ======================= 15 SAFETY STOCK ======================= */
  const ZT = [[0.90, 1.28], [0.95, 1.65], [0.975, 1.96], [0.98, 2.05], [0.99, 2.33], [0.999, 3.09]];
  PA.modules.push({
    id: "safety", num: 15, act: 4, mins: 12,
    title: "Safety stock",
    tag: "The cushion against surprises: service level, Z-scores, and why 99.9% gets expensive",
    line: "Safety stock is extra inventory held to absorb surprises in demand and supply while you wait for replenishment. You choose a service level; statistics tells you how big the cushion must be.",
    html() {
      return PA.sec("01", "The idea", `<div class="prose"><p>During the lead time, demand might come in above forecast, or the delivery might be late. <b>Safety stock</b> covers that risk up to a chosen <b>service level</b>.</p>
        <p><b>Cycle service level (CSL)</b> is the probability of not running out during a replenishment cycle. (Fill rate, the % of demand served from stock, is a different and usually higher number.)</p></div>
        <div class="stack"><div class="formula">Demand varies only: SS = Z × σd × √LT</div><div class="formula">Lead time varies only: SS = Z × d × σLT</div><div class="formula">Both vary: SS = Z × √( LT × σd² + d² × σLT² )</div></div>
        <div class="tbl"><table><thead><tr><th>Service level</th>${ZT.map(z => `<th class="n">${pct(z[0], z[0] === 0.975 || z[0] === 0.999 ? 1 : 0)}</th>`).join("")}</tr></thead><tbody><tr><td><b>Z</b></td>${ZT.map(z => `<td class="n">${z[1]}</td>`).join("")}</tr></tbody></table></div>
        <p class="small muted">σd is the standard deviation of demand per period; LT is in the same periods. In practice use the standard deviation of <b>forecast error</b>, because the forecast already explains part of the variation.</p>`) +
        PA.sec("02", "See it: the bell curve", `<div class="card flat sim">${PA.ctl("sv", "Service level", 0.8, 0.999, 0.001, 0.95)}<div id="sv-curve"></div><p class="say" id="sv-say"></p></div>`) +
        PA.sec("03", "Live example and calculator", `<div class="card flat sim"><div class="ctls">${PA.ctl("ss-d", "Average weekly demand d", 100, 2000, 50, 500)}${PA.ctl("ss-sd", "σd (weekly)", 10, 600, 10, 120)}${PA.ctl("ss-lt", "Lead time LT (weeks)", 1, 16, 1, 4)}${PA.ctl("ss-slt", "σLT (weeks)", 0, 3, 0.25, 1)}${PA.ctl("ss-sl", "Service level", 0.8, 0.999, 0.001, 0.95)}${PA.ctl("ss-c", "Unit cost ($), holding 25%", 10, 1000, 10, 500)}</div>
          <div class="kpis" id="ss-k"></div><div class="chart" id="ss-chart"></div><p class="say" id="ss-say"></p>
          <div class="row"><button class="btn primary" id="ss-sim" type="button">${PA.icon("play")}Prove it: run 2,000 cycles</button><span id="ss-res" class="mono"></span></div></div>`) +
        PA.sec("04", "Go deeper", `<details class="deep"><summary>Risk pooling: the square-root law</summary><div><p>Four warehouses each holding 400 units of safety stock (1,600 in total) can be replaced by one central warehouse holding 400 × √4 = <b>800</b>, if demand at the four is independent. Highs in one region offset lows in another. It's why central stock and smart reallocation (moving stock between locations) save so much.</p></div></details>
          <details class="deep"><summary>Periodic review needs more</summary><div><p>If you only check stock every R weeks, you're exposed for R + LT weeks: SS = Z × σd × √(R + LT).</p></div></details>
          <details class="deep"><summary>Safety stock vs buffer on the forecast</summary><div><p>The crash course's “buffer %” adds a margin to the loaded forecast. Safety stock is the cleaner tool: it keeps the forecast honest and sizes protection from measured variability and a chosen service level.</p></div></details>`);
    },
    mount(root) {
      PA.bindCtls(root, ["sv"], v => {
        const p = v.sv, z = zr(p), W = 420, H = 190, X = x => 20 + (x + 3.6) / 7.2 * (W - 40), Y = y => H - 30 - y / 0.42 * (H - 50);
        let curve = "", fill = `M${X(-3.6)} ${Y(0)}`;
        for (let x = -3.6; x <= 3.6001; x += 0.05) { curve += (x === -3.6 ? "M" : "L") + X(x).toFixed(1) + " " + Y(normPdf(x)).toFixed(1); if (x <= z) fill += "L" + X(x).toFixed(1) + " " + Y(normPdf(x)).toFixed(1); }
        fill += `L${X(Math.min(z, 3.6))} ${Y(0)}Z`;
        let tail = `M${X(Math.min(z, 3.6))} ${Y(0)}`; for (let x = Math.min(z, 3.6); x <= 3.6001; x += 0.05) tail += "L" + X(x).toFixed(1) + " " + Y(normPdf(x)).toFixed(1); tail += `L${X(3.6)} ${Y(0)}Z`;
        const g = `<path d="${fill}" style="fill:var(--good);opacity:.28"/><path d="${tail}" style="fill:var(--bad);opacity:.45"/><path d="${curve}" fill="none" style="stroke:var(--ink);stroke-width:2"/><line x1="${X(0)}" x2="${X(0)}" y1="${Y(0)}" y2="${Y(0.4)}" style="stroke:var(--muted);stroke-dasharray:4 4"/><line x1="${X(z)}" x2="${X(z)}" y1="${Y(0)}" y2="22" style="stroke:var(--bad);stroke-width:2"/><text x="${X(z)}" y="16" text-anchor="middle" style="font-size:12px;fill:var(--bad);font-weight:700">reorder point (Z = ${z.toFixed(2)})</text><text x="${X(0)}" y="${H - 12}" text-anchor="middle" style="font-size:11px;fill:var(--muted)">expected demand during lead time</text><text x="${X(-1.6)}" y="${Y(0.12)}" text-anchor="middle" style="font-size:12px;fill:var(--good);font-weight:700">no stock-out ${pct(p, 1)}</text><line x1="${X(0)}" x2="${X(Math.min(z, 3.6))}" y1="${Y(0.02)}" y2="${Y(0.02)}" style="stroke:var(--s1);stroke-width:3"/><text x="${(X(0) + X(Math.min(z, 3.6))) / 2}" y="${Y(0.02) - 6}" text-anchor="middle" style="font-size:11px;fill:var(--s1);font-weight:700">safety stock</text>`;
        $("#sv-curve", root).innerHTML = `<svg class="diagram" viewBox="0 0 ${W} ${H}" role="img" aria-label="Normal curve of demand during lead time, shaded to the service level">${g}</svg>`;
        $("#sv-say", root).innerHTML = `Demand during the lead time follows a bell curve. Stock up to <b>Z = ${z.toFixed(2)}</b> standard deviations above the expected amount and you avoid a stock-out in <b>${pct(p, 1)}</b> of cycles. The red tail (${pct(1 - p, 1)}) is the risk you've chosen to accept.`;
      }, { sv: x => pct(x, 1) });
      let P = {};
      const draw = () => {
        const { d, sdd, L, sl, p, c } = P, z = zr(p), ss1 = z * sdd * Math.sqrt(L), ss2 = z * Math.sqrt(L * sdd * sdd + d * d * sl * sl), rop = d * L + ss2;
        $("#ss-k", root).innerHTML = PA.kpi("Z", z.toFixed(2)) + PA.kpi("SS, demand only", fmt(ss1)) + PA.kpi("SS, demand + lead time", fmt(ss2), "acc") + PA.kpi("Reorder point d×LT + SS", fmt(rop)) + PA.kpi("SS holding cost a year", money(ss2 * c * 0.25), "bad");
        const lv = [0.8, 0.85, 0.9, 0.92, 0.94, 0.95, 0.96, 0.97, 0.98, 0.99, 0.995, 0.998, 0.999];
        PA.line($("#ss-chart", root), { labels: lv.map(x => pct(x, x >= 0.995 ? 1 : 0)), series: [{ name: "Safety stock needed", data: lv.map(x => zr(x) * Math.sqrt(L * sdd * sdd + d * d * sl * sl)), color: "var(--s5)", width: 2.8, dots: true, area: true }], marks: [{ x: lv.reduce((bi, x, i) => Math.abs(x - p) < Math.abs(lv[bi] - p) ? i : bi, 0), y: ss2, label: "you", color: "var(--bad)" }], yZero: true, xLabelW: 46, aria: "Safety stock rising steeply with service level" });
        $("#ss-say", root).innerHTML = `Worked: Z × √(${L} × ${sdd}² + ${d}² × ${sl}²) = ${z.toFixed(2)} × ${fmt(Math.sqrt(L * sdd * sdd + d * d * sl * sl))} = <b>${fmt(ss2)} units</b>. ` + (sl ? `Lead-time variability raises the cushion by ${pct(ss2 / ss1 - 1, 0)} versus demand alone (${fmt(ss1)}). ` : "") + `Going from 95% to 99% raises safety stock by ${pct(2.33 / 1.65 - 1, 0)}; to 99.9% by ${pct(3.09 / 1.65 - 1, 0)}. The last few points of service are the most expensive.`;
        $("#ss-res", root).textContent = "";
      };
      PA.bindCtls(root, ["ss-d", "ss-sd", "ss-lt", "ss-slt", "ss-sl", "ss-c"], v => { P = { d: v["ss-d"], sdd: v["ss-sd"], L: v["ss-lt"], sl: v["ss-slt"], p: v["ss-sl"], c: v["ss-c"] }; draw(); }, { "ss-sl": x => pct(x, 1), "ss-slt": x => x.toFixed(2), "ss-c": x => "$" + x });
      $("#ss-sim", root).addEventListener("click", () => {
        const { d, sdd, L, sl, p } = P, z = zr(p), ss = z * Math.sqrt(L * sdd * sdd + d * d * sl * sl), rop = d * L + ss, r = rng(Date.now() % 100000);
        let ok = 0; const N = 2000;
        for (let k = 0; k < N; k++) { const lt = Math.max(0.25, L + sl * gauss(r)), ddlt = d * lt + sdd * Math.sqrt(lt) * gauss(r); if (ddlt <= rop) ok++; }
        $("#ss-res", root).innerHTML = `Target ${pct(p, 1)} · achieved <b>${pct(ok / N, 1)}</b> in ${fmt(N)} simulated cycles`;
        PA.miniWin("ss-sim", 5, "proved safety stock by simulation");
      });
    },
    ask: ["How do you calculate safety stock?", "Pick a service level and get its Z (1.65 for 95%). If only demand varies, SS = Z × σ of demand (better, of forecast error) × √lead time. If lead time varies too, SS = Z × √(LT·σd² + d²·σLT²). Then I sanity-check the cost: going from 95% to 99% service adds about 41% more safety stock, so the target should differ by item class."],
    boss: [
      { q: "Z = 1.65, σd = 100 a week, LT = 4 weeks (demand variability only). Safety stock?", o: ["165", "330", "660", "1,650"], a: 1, why: "1.65 × 100 × √4 = 1.65 × 100 × 2 = 330." },
      { q: "Raising the service level from 95% to 99% increases safety stock by about…", o: ["4%", "18%", "41%", "100%"], a: 2, why: "Z goes from 1.65 to 2.33: 2.33 ÷ 1.65 ≈ 1.41, so about 41% more." },
      { q: "Lead time grows from 4 to 9 weeks (demand-only formula). Safety stock is multiplied by…", o: ["1.5", "2.25", "0.67", "5"], a: 0, why: "SS scales with √LT: √9 ÷ √4 = 3 ÷ 2 = 1.5." }
    ],
    take: ["SS = Z × σd × √LT, or Z × √(LT·σd² + d²·σLT²) when lead time varies too.", "Z: 90% 1.28 · 95% 1.65 · 98% 2.05 · 99% 2.33. The last points of service cost the most.", "Use forecast-error σ, pool stock where you can, and set service by class."],
    mnem: ["“Zebras Stand Still Longer”", "Z × σ × √LT: the safety stock formula, in order."]
  });

  /* ======================= 16 REORDER POINT ======================= */
  PA.modules.push({
    id: "rop", num: 16, act: 4, mins: 11,
    title: "Reorder point",
    tag: "When to order: demand during the lead time plus the cushion",
    line: "The reorder point is the inventory level that triggers a new order. Set it to cover what you'll sell while you wait, plus safety stock, and check it against inventory position.",
    html() {
      return PA.sec("01", "The idea", `<div class="formula">Reorder point (ROP) = d × LT + SS</div><div class="prose"><p>“What you'll sell while you wait, plus a cushion.” With continuous review, the moment <b>inventory position</b> (on hand + on order − backorders) touches the ROP, you order. With periodic review you check every R periods and order up to a level S instead:</p></div><div class="formula">Order-up-to S = d × (R + LT) + Z × σd × √(R + LT)</div>`) +
        PA.sec("02", "See it: one product, 26 weeks", `<div class="card flat sim"><div class="sim-h">${PA.chips("rp-sc", [["normal", "Normal demand"], ["spike", "Demand spike during a lead time"], ["late", "A late delivery"]], "normal")}</div><div class="chart" id="rp-chart"></div><p class="say" id="rp-say"></p></div>
          <p class="small muted">Weekly demand 500, lead time 2 weeks, safety stock 300, so ROP = 500 × 2 + 300 = 1,300. Order quantity 2,000.</p>`) +
        PA.sec("03", "Live example and calculator", `<div class="card flat sim"><div class="ctls">${PA.ctl("rc-d", "Daily demand", 10, 1000, 10, 200)}${PA.ctl("rc-lt", "Lead time (days)", 1, 60, 1, 5)}${PA.ctl("rc-ss", "Safety stock", 0, 5000, 50, 300)}${PA.ctl("rc-oh", "On hand", 0, 10000, 100, 1000)}${PA.ctl("rc-oo", "On order", 0, 10000, 100, 0)}</div><div class="kpis" id="rc-k"></div><p class="say" id="rc-say"></p></div>
          <div class="callout"><b>Periodic review, worked</b>Review every 2 weeks, lead time 4 weeks, d = 500 a week, σd = 120, 95%: S = 500 × 6 + 1.65 × 120 × √6 = 3,000 + 485 = <b>3,485</b>. Each review, order 3,485 minus inventory position.</div>`) +
        PA.sec("04", "Simulate: ROP Survival", `<p class="small">Pick your reorder point and order quantity, then survive a 52-week season of random demand. Stock is only checked once a week, so your reorder point has to cover the lead time <i>plus</i> that review week (the periodic-review idea above). Beat Textbook Tara.</p><div id="rp-game"></div>`) +
        PA.sec("05", "Go deeper", `<details class="deep"><summary>The two-bin system</summary><div><p>The physical version of a reorder point: two bins of stock; when the first is empty, order, and live off the second (sized to ROP) until the delivery arrives. Still common for small parts.</p></div></details>
          <details class="deep"><summary>Min/max is (s, S)</summary><div><p>Min = reorder point; max = the order-up-to level. Order whatever brings inventory position back to max. ERP systems implement this everywhere.</p></div></details>
          <details class="deep"><summary>Reorder points must move</summary><div><p>A static ROP set in January is wrong in November. Recalculate as forecasts, lead times and variability change; seasonal items need seasonal reorder points.</p></div></details>`);
    },
    mount(root) {
      const sim = sc => {
        const days = 182, d = 500 / 7, L = 14, rop = 1300, Q = 2000; let oh = 2300; const pipe = {}, inv = [], marks = []; let n = 0, first = true;
        for (let t = 0; t < days; t++) {
          if (pipe[t]) { oh += pipe[t]; if (first) { marks.push({ x: t, y: oh, label: "delivery", color: "var(--s3)", r: 5 }); first = false; } }
          let dem = d; if (sc === "spike" && t >= 70 && t < 77) dem = d * 1.9;
          oh -= dem; inv.push(oh);
          const onOrder = sum(Object.keys(pipe).filter(k => +k > t).map(k => pipe[k]));
          if (oh + onOrder <= rop) { n++; const lt = sc === "late" && n === 3 ? L + 7 : L; pipe[t + lt] = (pipe[t + lt] || 0) + Q; marks.push({ x: t, y: oh, label: n === 1 ? "order placed" : "", color: "var(--s2)", r: 4 }); }
        }
        return { inv, marks };
      };
      const draw = sc => {
        const r = sim(sc), lab = r.inv.map((_, t) => "W" + Math.floor(t / 7)), out = r.inv.some(v => v < 0);
        PA.line($("#rp-chart", root), { labels: lab, series: [{ name: "On hand", data: r.inv, color: "var(--s1)", width: 2.4 }], hlines: [{ y: 1300, label: "ROP 1,300", color: "var(--s2)" }, { y: 300, label: "safety stock 300", color: "var(--s3)" }], hbands: [{ y0: -800, y1: 0, color: "var(--bad)", op: 0.15, label: "stock-out" }], marks: r.marks, yMin: -800, yMax: 2600, xEvery: 28, tip: false, legend: false, aria: "Inventory sawtooth with reorder point" });
        $("#rp-say", root).innerHTML = { normal: "Each time stock touches the ROP (orange dot), an order goes out. During the 2-week lead time you sell 1,000 units and land on the 300 cushion just as the delivery arrives. Safety stock is never touched.", spike: "Demand nearly doubles for a week during a lead time. Safety stock absorbs " + (out ? "part of it, but not all: the line dips below zero. A bigger cushion, or a higher service level, would have covered it." : "the hit and the line stays above zero. That's exactly the job of safety stock."), late: "The third delivery arrives a week late. A whole extra week of demand (500) comes out of a 300-unit cushion, so the shelf runs dry. That's lead-time variability, and why the σLT term exists." }[sc];
      };
      PA.onChips(root, "rp-sc", draw); draw("normal");
      PA.bindCtls(root, ["rc-d", "rc-lt", "rc-ss", "rc-oh", "rc-oo"], v => {
        const rop = v["rc-d"] * v["rc-lt"] + v["rc-ss"], ip = v["rc-oh"] + v["rc-oo"];
        $("#rc-k", root).innerHTML = PA.kpi("Demand during lead time", fmt(v["rc-d"] * v["rc-lt"])) + PA.kpi("Reorder point", fmt(rop), "acc") + PA.kpi("Inventory position", fmt(ip)) + PA.kpi("Decision", ip <= rop ? "Order now" : "Wait", ip <= rop ? "bad" : "good");
        $("#rc-say", root).innerHTML = `ROP = ${fmt(v["rc-d"])} × ${v["rc-lt"]} + ${fmt(v["rc-ss"])} = <b>${fmt(rop)}</b>. Inventory position ${fmt(ip)} is ${ip <= rop ? "at or below it: order now." : "above it: no order yet."}` + (v["rc-oh"] <= rop && ip > rop ? " On-hand alone would have triggered a duplicate order." : "");
      });
      if (PA.games.rop) PA.games.rop.mount($("#rp-game", root), { embedded: true });
    },
    ask: ["How do you set a reorder point?", "Reorder point = average demand × lead time + safety stock. I compare inventory position, not just on-hand, against it, recalculate it when demand, lead time or variability changes, and use an order-up-to level when stock is reviewed periodically."],
    boss: [
      { q: "Daily demand 200, lead time 5 days, safety stock 300. Reorder point?", o: ["500", "1,000", "1,300", "1,500"], a: 2, why: "200 × 5 + 300 = 1,300." },
      { q: "On hand 1,000, on order 2,000, ROP 2,500. Order now?", o: ["Yes: on hand is below the ROP", "No: inventory position is 3,000, above the ROP", "Yes: always order weekly", "Only if it's an A item"], a: 1, why: "Inventory position = 1,000 + 2,000 = 3,000 > 2,500. Ordering now would double-order." },
      { q: "With continuous review, the reorder point is compared against…", o: ["On-hand stock", "Inventory position", "Last month's sales", "The forecast"], a: 1, why: "Inventory position counts what's already ordered, so it's the right trigger." }
    ],
    take: ["ROP = d × LT + SS: what you'll sell while you wait, plus a cushion.", "Trigger on inventory position (on hand + on order − backorders).", "Periodic review: order up to S = d(R + LT) + Z·σd·√(R + LT). Recalculate as things change."],
    mnem: ["“Sell while you wait, plus a cushion”", "ROP = demand during lead time + safety stock."]
  });

  /* ======================= 17 BULLWHIP EFFECT ======================= */
  PA.beerModel = function (o) {
    const W = o.weeks || 30, OD = 1, SD = o.ship || 2, L = OD + SD, N = 4, D = o.demand, base = o.base || 100;
    const T = Array.from({ length: N }, () => ({ inv: 2 * base, back: 0, E: base, on: L * base, arr: {}, oin: {}, cost: 0, orders: [], recv: [], dem: [], ship: [], invH: [], backH: [], bucket: 0, costH: [] }));
    for (let i = 0; i < N; i++) { for (let w = 0; w < (i === 3 ? L : SD); w++) T[i].arr[w] = base; if (i > 0) T[i].oin[0] = base; }
    let t = 0;
    const api = {
      T, D, W, L, get t() { return t; },
      begin() {
        for (let i = 0; i < N; i++) { const a = T[i].arr[t] || 0; T[i].inv += a; T[i].on -= a; T[i].recv.push(a); }
        for (let i = 0; i < N; i++) { const p = T[i], d = i === 0 ? D[t] : (p.oin[t] || 0); p.dem.push(d); const due = p.back + d, sh = Math.min(p.inv, due); p.inv -= sh; p.back = due - sh; p.ship.push(sh); if (i > 0) T[i - 1].arr[t + SD] = (T[i - 1].arr[t + SD] || 0) + sh; }
      },
      policy(i) {
        const p = T[i], sig = o.share ? D[t] : p.dem[t]; p.E = o.theta * sig + (1 - o.theta) * p.E;
        const S = p.inv - p.back, Sst = 2 * p.E, SLst = (L - 1) * p.E;
        let O = Math.max(0, p.E + o.aS * ((Sst - S) + o.beta * (SLst - p.on - (o.batch ? p.bucket : 0))));
        if (o.panic && p.back > 0) O *= 1.5;
        if (o.forward && i === 0 && (t === 8 || t === 9)) O *= 2.5;
        if (o.batch) { p.bucket += O; O = ((t + i) % 4 === 0) ? p.bucket : 0; if (O) p.bucket = 0; }
        return Math.round(O);
      },
      finish(playerOrder) {
        for (let i = 0; i < N; i++) {
          const p = T[i]; let O = (o.player === i && playerOrder != null) ? Math.max(0, Math.round(playerOrder)) : api.policy(i);
          if (o.player === i && playerOrder != null) { const sig = o.share ? D[t] : p.dem[t]; p.E = o.theta * sig + (1 - o.theta) * p.E; }
          p.orders.push(O); p.on += O;
          if (i < 3) T[i + 1].oin[t + OD] = (T[i + 1].oin[t + OD] || 0) + O; else p.arr[t + L] = (p.arr[t + L] || 0) + O;
          const c = 0.5 * p.inv + 1 * p.back; p.cost += c; p.costH.push(c); p.invH.push(p.inv); p.backH.push(p.back);
        }
        t++;
      },
      run() { while (t < W) { api.begin(); api.finish(); } return api; },
      amp(i) { const d = D.slice(0, t), s0 = sd(d) || 1; return sd(T[i].orders) / s0; },
      total() { return sum(T.map(p => p.cost)); }
    };
    return api;
  };
  PA.beerDemand = (pattern, seed, W) => {
    const r = rng(seed || 5), out = []; W = W || 36;
    for (let t = 0; t < W; t++) { let b = 100; if (pattern === "step") b = t < 4 ? 100 : 120; if (pattern === "spike") b = (t === 8 || t === 9) ? 160 : 100; if (pattern === "noisy") b = 100 + 12 * gauss(r); out.push(Math.max(0, Math.round(b + (pattern === "noisy" ? 0 : 4 * gauss(r))))); }
    return out;
  };
  PA.TIERS = [["Retailer", "var(--s4)"], ["Wholesaler", "var(--s2)"], ["Distributor", "var(--s3)"], ["Factory", "var(--s1)"]];
  function whipSVG() {
    const xs = [40, 120, 200, 280, 360], names = ["Consumer", "Retailer", "Wholesaler", "Distributor", "Factory"], amps = [4, 7, 12, 20, 30];
    let g = "";
    xs.forEach((x, i) => {
      let d = ""; for (let k = 0; k <= 60; k++) { const yy = 70 + amps[i] * Math.sin(k / 60 * Math.PI * 3) * (i === 0 ? 1 : 1); d += (k ? "L" : "M") + (x - 30 + k).toFixed(1) + " " + yy.toFixed(1); }
      g += `<path d="${d}" fill="none" style="stroke:${i ? PA.TIERS[i - 1][1] : "var(--s0)"};stroke-width:3;stroke-linecap:round"/><text x="${x}" y="128" text-anchor="middle" style="font-family:var(--display);font-weight:600;font-size:12px;fill:var(--ink)">${names[i]}</text><text x="${x}" y="144" text-anchor="middle" style="font-size:10.5px;fill:var(--muted)">swing ±${[5, 9, 15, 25, 38][i]}%</text>`;
      if (i < 4) g += `<text x="${x + 40}" y="74" text-anchor="middle" style="font-size:14px;fill:var(--muted)">→</text>`;
    });
    g += `<text x="200" y="18" text-anchor="middle" style="font-size:11px;fill:var(--muted)">orders travel upstream →  and the swing grows at every step</text>`;
    return `<svg class="diagram" style="max-width:640px" viewBox="0 0 400 152" role="img" aria-label="Order swings growing from consumer to factory">${g}</svg>`;
  }
  PA.modules.push({
    id: "bullwhip", num: 17, act: 5, mins: 14,
    title: "The bullwhip effect",
    tag: "How, in our simulation, a 20% rise at the till becomes a fourfold spike in factory orders",
    line: "The bullwhip effect: orders swing harder at every step up the supply chain. A small change in what consumers buy becomes huge swings in factory orders, built by sensible-looking local decisions.",
    html() {
      const causes = [["Forecasts (demand signal processing)", "Each tier forecasts from the orders it receives, not from real consumer demand, and adds its own safety margin. Every handoff amplifies.", "Share sell-through / point-of-sale data with every tier; one shared forecast (CPFR); shorter lead times."], ["Batches (order batching)", "Ordering once a month or in full truckloads turns smooth demand into lumpy orders.", "Smaller, more frequent orders; mixed loads; lower ordering costs (EDI, automation)."], ["Prices (price fluctuation)", "Discounts and trade promotions make buyers forward-buy, then order nothing for weeks.", "Everyday low pricing (EDLP); pay promotions on sell-through, not sell-in."], ["Panic (rationing and shortage gaming)", "When supply is short and allocated pro-rata, buyers inflate orders to get more, then cancel.", "Allocate on past sales or sell-through; share capacity information; penalise cancellations."]];
      return PA.sec("01", "The idea", `<div class="prose"><p>Procter &amp; Gamble noticed that retail sales of its diapers varied only modestly (babies are fairly predictable), yet distributors' orders to P&amp;G varied much more, and P&amp;G's own orders to its suppliers varied more still. Hau Lee, V. Padmanabhan and Seungjin Whang named the four causes in a 1997 paper, “The Bullwhip Effect in Supply Chains”. MIT's Beer Distribution Game, developed around 1960, has been recreating it in classrooms ever since.</p></div>
        <div class="defs">${causes.map((c, i) => `<div class="def"><span class="pill violet">Cause ${i + 1}</span><b>${c[0]}</b><small>${c[1]}</small><small><b>Fix:</b> ${c[2]}</small></div>`).join("")}</div>`) +
        PA.sec("02", "See it", `<div class="card flat">${whipSVG()}<p class="small muted" style="text-align:center">Illustrative: each tier sees only the orders of the tier below it, and over-reacts a little more.</p></div>`) +
        PA.sec("03", "Live example: consumer demand rises 20%, once", `<div class="card flat stack"><p class="small">A four-tier chain. Consumer demand steps from about 100 to about 120 units a week in week 5 and stays there. Each tier follows a reasonable-sounding rule (forecast with smoothing, keep two weeks of stock, top up the pipeline) but under-counts what's already on order, as people do in the Beer Game.</p><div class="chart" id="bw-ex"></div><div class="tbl" id="bw-tbl"></div><div id="bw-amp" class="stack"></div></div>`) +
        PA.sec("04", "Simulate: pull the levers", `<div class="card flat sim"><div class="sim-h">${PA.chips("bw-pat", [["step", "Demand steps +20%"], ["spike", "Two-week promo spike"], ["noisy", "Noisy demand"]], "step")}</div>
          <div class="ctls">${PA.ctl("bw-beta", "Counts what's already on order (β)", 0, 1, 0.05, 0.3)}${PA.ctl("bw-ship", "Shipping delay (weeks)", 1, 4, 1, 2)}</div>
          <div class="chips" id="bw-tog"><button type="button" class="chip" data-v="share">Share consumer sell-through with all tiers</button><button type="button" class="chip" data-v="batch">Order batching (every 4 weeks)</button><button type="button" class="chip" data-v="forward">Trade promotion: retailer forward-buys</button><button type="button" class="chip" data-v="panic">Shortage panic: over-order when out of stock</button></div>
          <div class="chart" id="bw-chart"></div><div class="kpis" id="bw-k"></div><p class="say" id="bw-say"></p>
          <div class="row"><a class="btn primary" href="#/play/beer">${PA.icon("play")}Play the Beer Game yourself</a></div></div>`) +
        PA.sec("05", "In consumer electronics", `<div class="defs"><div class="def"><b>Sell-in vs sell-through</b><small>Carriers and retailers order (sell-in) based on their own forecasts and stock targets. If the brand plans on sell-in alone, it's planning on an amplified signal. Plan on sell-through.</small></div><div class="def"><b>Launch allocation</b><small>A hot new phone is allocated; accounts over-order to win a bigger share, then cancel or sit on stock. Classic shortage gaming.</small></div><div class="def"><b>Channel inventory swings</b><small>Accounts build stock before promotions and destock after. Sell-in swings while consumer demand barely moves.</small></div><div class="def"><b>The fix in practice</b><small>Weekly sell-through and channel inventory feeds, allocation on sell-through and weeks of supply, and one consensus number.</small></div></div>`);
    },
    mount(root) {
      const D = PA.beerDemand("step", 5, 36), m = PA.beerModel({ demand: D, weeks: 36, theta: 0.25, aS: 0.35, beta: 0.3 }).run(), wk = D.map((_, i) => "W" + (i + 1));
      PA.line($("#bw-ex", root), { labels: wk, series: [{ name: "Consumer demand", data: D, color: "var(--s0)", width: 3 }].concat(PA.TIERS.map((t, i) => ({ name: t[0] + " orders", data: m.T[i].orders, color: t[1], width: 2.2 }))), yMin: 0, aria: "Orders by tier showing amplification" });
      const rows = [0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 19];
      $("#bw-tbl", root).innerHTML = `<table><thead><tr><th>Week</th><th class="n">Consumer</th>${PA.TIERS.map(t => `<th class="n">${t[0]}</th>`).join("")}</tr></thead><tbody>${rows.map(t => `<tr><td>${t + 1}</td><td class="n">${D[t]}</td>${m.T.map(p => `<td class="n">${p.orders[t]}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
      const amps = [0, 1, 2, 3].map(i => m.amp(i)), mx = Math.max.apply(null, amps);
      const peak = m.T[3].orders.reduce((a, b) => Math.max(a, b), 0);
      $("#bw-amp", root).innerHTML = `<b>Order swing vs consumer swing (standard deviation ratio)</b>` + PA.TIERS.map((t, i) => `<div class="hbar"><span>${t[0]}</span><span class="bar"><i style="width:${amps[i] / mx * 100}%;background:${t[1]}"></i></span><span class="v">×${amps[i].toFixed(1)}</span></div>`).join("") + `<p class="say">Consumers moved about 20%. The factory's orders peaked at <b>${peak}</b> (${(peak / 100).toFixed(1)}× the normal 100) and then fell to <b>${Math.min.apply(null, m.T[3].orders.slice(8))}</b>, as everyone discovered the stock they'd over-ordered. Nobody did anything crazy. The structure did it.</p>`;
      const tog = {};
      const draw = () => {
        const beta = +$("#bw-beta", root).value, ship = +$("#bw-ship", root).value, pat = root._pat || "step", Dm = PA.beerDemand(pat, 5, 36);
        $("#bw-beta-v", root).textContent = beta.toFixed(2); $("#bw-ship-v", root).textContent = ship;
        const s = PA.beerModel({ demand: Dm, weeks: 36, theta: 0.25, aS: 0.35, beta, ship, share: tog.share, batch: tog.batch, forward: tog.forward, panic: tog.panic }).run();
        PA.line($("#bw-chart", root), { labels: wk, series: [{ name: "Consumer demand", data: Dm, color: "var(--s0)", width: 3 }].concat(PA.TIERS.map((t, i) => ({ name: t[0], data: s.T[i].orders, color: t[1], width: 2 }))), yMin: 0, aria: "Orders by tier under chosen levers" });
        const a3 = s.amp(3), cost = s.total();
        $("#bw-k", root).innerHTML = PA.TIERS.map((t, i) => PA.kpi(t[0] + " swing", "×" + s.amp(i).toFixed(1), i === 3 ? (a3 > 5 ? "bad" : a3 < 2.5 ? "good" : "warn") : "")).join("") + PA.kpi("Team cost (36 wks)", money(cost), "acc");
        const tips = [];
        if (tog.share) tips.push("Sharing consumer sell-through calms every tier: they forecast from the real signal, not an amplified one.");
        if (tog.batch) tips.push("Batching turns smooth demand into lumpy orders; upstream tiers see feast-or-famine.");
        if (tog.forward) tips.push("The trade promotion makes the retailer buy ahead, then go quiet, and the wave travels up the chain.");
        if (tog.panic) tips.push("Panic ordering during shortages feeds more volume into an already-overloaded chain.");
        if (beta >= 0.9) tips.push("Counting what's already on order (β near 1) is the single most powerful fix inside a tier.");
        if (ship >= 3) tips.push("Longer delays mean more forecast exposure and bigger overshoots.");
        $("#bw-say", root).innerHTML = (tips.length ? tips.join(" ") : "Toggle a cause on or off, or move β, and watch the factory line.") + ` Factory swing: <b>×${a3.toFixed(1)}</b>.`;
      };
      $("#bw-tog", root).addEventListener("click", e => { const b = e.target.closest(".chip"); if (!b) return; b.classList.toggle("on"); tog[b.dataset.v] = b.classList.contains("on"); draw(); if (tog.share && +$("#bw-beta", root).value >= 0.9) PA.miniWin("bw-tame", 10, "tamed the bullwhip"); });
      ["bw-beta", "bw-ship"].forEach(id => $("#" + id, root).addEventListener("input", () => { draw(); if (tog.share && +$("#bw-beta", root).value >= 0.9) PA.miniWin("bw-tame", 10, "tamed the bullwhip"); }));
      PA.onChips(root, "bw-pat", v => { root._pat = v; draw(); });
      draw();
    },
    ask: ["What is the bullwhip effect and how would you reduce it?", "Order variability grows as you move upstream: a small change in consumer demand becomes big swings at the factory. The four classic causes are forecasting from orders instead of real demand, order batching, price promotions that cause forward buying, and shortage gaming. Fixes: share sell-through data and plan on it, one consensus forecast, shorter lead times, smaller frequent orders, stable pricing, and allocating on sell-through. In electronics that means planning on sell-through and channel inventory, not sell-in alone."],
    boss: [
      { q: "Which of these is NOT one of Lee, Padmanabhan and Whang's four causes?", o: ["Order batching", "Price fluctuations", "Rationing and shortage gaming", "Consumer fashion trends"], a: 3, why: "The four are demand signal processing, order batching, price fluctuations, and rationing and shortage gaming." },
      { q: "Best fix for demand signal processing (each tier forecasting from orders it receives)?", o: ["Bigger safety stock everywhere", "Share consumer sell-through data with every tier", "Order less often", "Run more trade promotions"], a: 1, why: "If every tier sees the real consumer signal, nobody is forecasting from an already-amplified order stream." },
      { q: "Retailer orders vary ±10% while factory orders vary ±60%. What is this?", o: ["Seasonality", "The bullwhip effect", "Forecast bias", "Cannibalisation"], a: 1, why: "Variability amplifying as you move upstream is the bullwhip effect." }
    ],
    take: ["Order swings grow at every step upstream, even when every decision looks sensible locally.", "Four causes: Forecasts, Batches, Prices, Panic.", "Fixes: share sell-through, count the pipeline, cut lead times, order small and often, stable pricing, allocate on sell-through."],
    mnem: ["“Forecasts, Batches, Prices, Panic”", "The four cracks of the whip, and each has a fix."]
  });
})();
