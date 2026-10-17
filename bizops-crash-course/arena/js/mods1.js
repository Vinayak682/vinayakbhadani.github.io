/* Acts I and II: supply chain cycle, demand planning cycle, demand-to-delivery and S&OP, seasonality, seasonal trends. */
(function () {
  "use strict";
  const { $, $$, esc, fmt, pct, sgn, money, clamp, sum, mean, rng, gauss, MONTHS } = PA.u;
  const S = PA.S;
  S.mini = S.mini || {};
  PA.miniWin = (key, xp, label) => { if (S.mini[key]) return; S.mini[key] = 1; PA.save(); PA.addXP(xp, label); };
  const polar = (cx, cy, r, deg) => [cx + r * Math.cos(deg * Math.PI / 180), cy + r * Math.sin(deg * Math.PI / 180)];
  PA.polar = polar;

  /* Shared dataset: A-Series phone sell-through, thousand units per month, Jan 2023 to Dec 2025. Illustrative. */
  PA.DATA = {
    aseries: [78, 78, 96, 90, 92, 98, 103, 104, 113, 90, 147, 163, 100, 92, 125, 114, 109, 99, 131, 123, 125, 116, 165, 179, 104, 96, 132, 124, 119, 120, 144, 134, 152, 130, 180, 199],
    years: [2023, 2024, 2025],
    phoneIdx: [0.82, 0.78, 1.02, 0.92, 0.90, 0.88, 0.97, 1.04, 1.06, 0.95, 1.28, 1.38]
  };
  PA.DATA.labels36 = PA.DATA.aseries.map((_, i) => MONTHS[i % 12] + " " + String(23 + Math.floor(i / 12)));
  PA.seasonalIndex = (y, m) => {
    m = m || 12; const yrs = Math.floor(y.length / m), out = [];
    for (let k = 0; k < m; k++) { let s = 0; for (let j = 0; j < yrs; j++) { const yr = y.slice(j * m, j * m + m); s += y[j * m + k] / mean(yr); } out.push(s / yrs); }
    const a = mean(out); return out.map(v => v / a);
  };

  /* ======================= 01 SUPPLY CHAIN CYCLE ======================= */
  const SCOR = [
    ["Plan", "var(--s1)", "Decide what to make, buy and ship, and when. Demand planning and S&OP live here.", "Forecast the new model for Q4; S&OP agrees how many to build.", "Demand and supply planning", "Forecast accuracy, plan adherence", "A wrong forecast sends every later step in the wrong direction."],
    ["Source", "var(--s2)", "Buy the parts, materials and services.", "Order chips, displays and batteries. Some components take months to arrive.", "Procurement / sourcing", "Supplier on-time delivery, cost", "One single-source chip runs short and the whole line stops."],
    ["Make", "var(--s3)", "Turn parts into finished, tested, packed goods.", "Assemble and test phones at the factory or a contract manufacturer.", "Manufacturing", "Schedule adherence, yield", "Low yield on a new model means fewer good units than planned."],
    ["Deliver", "var(--s5)", "Store, move and hand over the product; take and fill orders.", "Ship by sea or air to the country warehouse, then to carrier and retailer warehouses and stores.", "Logistics, warehousing, order management", "OTIF (on time, in full), delivery lead time", "Port congestion adds weeks and the stock lands after the promotion."],
    ["Return", "var(--s4)", "Take products back: faulty, unwanted, trade-ins, end of life.", "Process returns and trade-ins, then repair, refurbish or recycle.", "Reverse logistics, service", "Return rate, recovery value", "Returns nobody processes become dead stock."]
  ];
  function cycleSVG() {
    const cx = 200, cy = 185, R = 122; let g = '<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:var(--muted)"/></marker></defs>';
    SCOR.forEach((s, k) => {
      const a0 = -90 + 72 * k + 21, a1 = -90 + 72 * (k + 1) - 21; const p0 = polar(cx, cy, R, a0), p1 = polar(cx, cy, R, a1);
      g += '<path d="M' + p0[0].toFixed(1) + " " + p0[1].toFixed(1) + " A" + R + " " + R + " 0 0 1 " + p1[0].toFixed(1) + " " + p1[1].toFixed(1) + '" fill="none" style="stroke:var(--muted);stroke-width:2" marker-end="url(#ah)"/>';
    });
    g += '<circle cx="' + cx + '" cy="' + cy + '" r="52" style="fill:var(--surface2);stroke:var(--line)"/><text x="' + cx + '" y="' + (cy - 4) + '" text-anchor="middle" style="font-family:var(--display);font-weight:800;font-size:16px;fill:var(--ink)">Enable</text><text x="' + cx + '" y="' + (cy + 14) + '" text-anchor="middle" style="font-size:11px;fill:var(--muted)">data · rules · systems</text>';
    SCOR.forEach((s, k) => {
      const p = polar(cx, cy, R, -90 + 72 * k);
      g += '<g class="scn" data-k="' + k + '" style="cursor:pointer" tabindex="0" role="button" aria-label="' + s[0] + '"><circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="40" style="fill:' + s[1] + ';stroke:var(--surface);stroke-width:4"/><text x="' + p[0].toFixed(1) + '" y="' + (p[1] + 5).toFixed(1) + '" text-anchor="middle" style="font-family:var(--display);font-weight:800;font-size:15px;fill:#fff">' + s[0] + "</text></g>";
    });
    return '<svg class="diagram" viewBox="0 0 400 370" role="img" aria-label="The SCOR cycle: Plan, Source, Make, Deliver, Return around Enable">' + g + "</svg>";
  }
  function flowsSVG() {
    const xs = [46, 128, 210, 292, 374], names = ["Suppliers", "Factory", "Brand DC", "Retailer", "Consumer"];
    let g = "";
    xs.forEach((x, i) => { g += '<rect x="' + (x - 38) + '" y="16" width="76" height="40" rx="9" style="fill:var(--surface);stroke:var(--line)"/><text x="' + x + '" y="41" text-anchor="middle" style="font-family:var(--display);font-weight:600;font-size:14px;fill:var(--ink)">' + names[i] + "</text>"; });
    const lane = (key, y, label, col, dir) => {
      let s = '<g data-lane="' + key + '"><text x="8" y="' + (y - 8) + '" style="font-size:14px;fill:' + col + ';font-weight:700">' + label + '</text><line x1="8" x2="412" y1="' + y + '" y2="' + y + '" style="stroke:' + col + ';stroke-width:2;opacity:.35"/>';
      for (let k = 0; k < 4; k++) {
        const fwd = dir === 1 || (dir === 0 && k % 2 === 0);
        s += '<circle r="5" cy="' + y + '" cx="' + (fwd ? 8 : 412) + '" style="fill:' + col + '"><animate attributeName="cx" from="' + (fwd ? 8 : 412) + '" to="' + (fwd ? 412 : 8) + '" dur="6s" begin="' + (k * 1.5) + 's" repeatCount="indefinite"/></circle>';
      }
      return s + "</g>";
    };
    g += lane("product", 92, "Product  →  (downstream)", "var(--s1)", 1) + lane("info", 134, "Information  ⇄  (orders, sales data, plans)", "var(--s5)", 0) + lane("money", 176, "Money  ←  (upstream)", "var(--s3)", -1);
    return '<svg class="diagram" style="max-width:640px" viewBox="0 0 420 190" role="img" aria-label="Product flows downstream, money upstream, information both ways">' + g + "</svg>";
  }
  const PUSH = [
    null,
    ["Pull everything (make-to-order)", "Weeks to months", 95, 8, "Nothing is built until an order arrives. Custom servers, big B2B contracts, special editions."],
    ["Push components, pull assembly (configure-to-order)", "1–3 weeks", 55, 38, "Parts are stocked on a forecast; the laptop is assembled to your spec after you click Buy."],
    ["Push to the warehouse, pull to the door", "1–3 days", 16, 70, "Finished goods wait in a central warehouse; an online order triggers pick, pack and ship."],
    ["Push all the way to the shelf", "0 days: take it home", 2, 95, "Phones in carrier stores, earbuds at retailers. Instant availability, but every unit was built on a forecast."]
  ];
  PA.modules.push({
    id: "sc-cycle", num: 1, act: 1, mins: 9,
    title: "The supply chain cycle",
    tag: "Plan, Source, Make, Deliver, Return, and the three flows that connect them",
    line: "A supply chain is a loop, not a line: product flows down to the customer, while information and money flow back up and start the next round.",
    html() {
      return PA.sec("01", "The idea", `<div class="prose"><p>Every phone you've bought went through five kinds of work. The <b>SCOR model</b> (Supply Chain Operations Reference, maintained by ASCM, the supply chain professional body) names them <b>Plan, Source, Make, Deliver</b> and <b>Return</b>, with <b>Enable</b> underneath: the data, rules and systems that support the other five.</p>
        <p>It's a <b>cycle</b> because Deliver feeds Plan. What sold this month changes what you build next month. Break the feedback and the chain keeps building what nobody wants.</p></div>
        <div class="defs">${SCOR.map(s => `<div class="def"><b style="color:${s[1]}">${s[0]}</b><small>${s[2]}</small></div>`).join("")}</div>`) +
        PA.sec("02", "See it", `<div class="grid2"><div class="card flat">${cycleSVG()}<p class="small muted" style="text-align:center">Tap a process to open it.</p></div><div class="card flat stack" id="scor-detail" aria-live="polite"></div></div>
        <div class="card flat stack"><div class="sim-h"><h3>The three flows</h3>${PA.chips("flows", [["product", "Product"], ["info", "Information"], ["money", "Money"]])}</div>${flowsSVG()}
        <p class="small muted">Tap the chips to show or hide a flow. <b>Product</b> moves toward the consumer. <b>Money</b> moves back toward suppliers. <b>Information</b> moves both ways: orders and sell-through data go up; plans, ship notices and invoices come down. Demand planning lives on the information flow.</p></div>`) +
        PA.sec("03", "Live example: follow one phone", `<div class="tbl"><table><thead><tr><th>Step</th><th>What happens</th><th>Typical time*</th><th>Owner</th><th>Scorecard</th></tr></thead><tbody>
          <tr><td><b>Plan</b></td><td>Forecast for the new model; S&amp;OP sets the build plan</td><td>Monthly cycle, weekly refresh</td><td>Planning</td><td>Forecast accuracy</td></tr>
          <tr><td><b>Source</b></td><td>Order chips, display, battery, camera modules</td><td>8–16+ weeks for key parts</td><td>Procurement</td><td>Supplier on-time %</td></tr>
          <tr><td><b>Make</b></td><td>Assemble, test, pack</td><td>1–2 weeks</td><td>Factory / contract manufacturer</td><td>Yield, schedule adherence</td></tr>
          <tr><td><b>Deliver</b></td><td>Sea (4–6 weeks) or air (about a week) to the country DC, then to carriers, retailers, stores</td><td>1–7 weeks</td><td>Logistics</td><td>OTIF</td></tr>
          <tr><td><b>Return</b></td><td>Trade-ins, faulty units, end-of-life recycling</td><td>Ongoing</td><td>Service / reverse logistics</td><td>Return rate</td></tr></tbody></table></div>
          <p class="small muted">*Illustrative ranges for teaching. Real numbers vary by company, product and shipping lane.</p>
          <div class="card flat stack"><h3>Where the money waits: cash-to-cash cycle</h3><p class="small">The company pays suppliers, holds stock, sells, then waits to be paid. The <b>cash-to-cash cycle</b> is how many days its own cash is tied up.</p>
          <div class="formula">Cash-to-cash = DIO + DSO − DPO</div>
          <div class="ctls">${PA.ctl("c2c-dio", "DIO: days inventory is held", 5, 120, 1, 45, " d")}${PA.ctl("c2c-dso", "DSO: days to collect from customers", 0, 90, 1, 30, " d")}${PA.ctl("c2c-dpo", "DPO: days to pay suppliers", 0, 120, 1, 50, " d")}</div>
          <div id="c2c-vis" class="stack"></div><p class="say" id="c2c-say"></p></div>`) +
        PA.sec("04", "Simulate: move the push/pull boundary", `<div class="card flat sim"><p class="small">Everything <b>before</b> the boundary is done on a forecast (push). Everything <b>after</b> waits for a real order (pull). Slide it and watch the trade-off.</p>
          ${PA.ctl("pp", "Boundary position", 1, 4, 1, 4)}
          <div class="flowrow" id="pp-chain"></div>
          <div class="grid2"><div class="stack"><span class="small">Customer waits</span><div class="meter"><i id="pp-wait" style="background:var(--warn)"></i></div><b class="mono" id="pp-wait-t"></b></div>
          <div class="stack"><span class="small">Inventory built on a forecast (risk if the forecast is wrong)</span><div class="meter"><i id="pp-risk" style="background:var(--bad)"></i></div><b class="mono" id="pp-risk-t"></b></div></div>
          <p class="say" id="pp-say"></p></div>`) +
        PA.sec("05", "Go deeper", `<details class="deep"><summary>The cycle view: four cycles, four handoffs</summary><div><p>A classic textbook (Chopra &amp; Meindl, <i>Supply Chain Management</i>) splits the chain into four cycles, each a handoff between two stages:</p>
          <ul><li><b>Customer order cycle</b>: consumer ↔ retailer</li><li><b>Replenishment cycle</b>: retailer ↔ distributor or brand warehouse</li><li><b>Manufacturing cycle</b>: warehouse ↔ factory</li><li><b>Procurement cycle</b>: factory ↔ component suppliers</li></ul><p>Every cycle has its own order, lead time and inventory. Every one is a place where the bullwhip effect (module 17) can start.</p></div></details>
          <details class="deep"><summary>SCOR has been updated</summary><div><p>The 2022 SCOR Digital Standard reorganises the processes as Orchestrate, Plan, Order, Source, Transform, Fulfill and Return. The classic five are still widely used and remain a safe way to describe the chain.</p></div></details>
          <details class="deep"><summary>Why phones are pushed all the way to the shelf</summary><div><p>People expect to walk out of a store with a phone, and carriers sell plans with the device. That pushes the boundary to the shelf, so the entire chain runs on the forecast, and the cost of a wrong forecast lands as channel inventory, price protection or stock-outs.</p></div></details>`);
    },
    mount(root) {
      const det = $("#scor-detail", root);
      const show = k => { const s = SCOR[k]; det.innerHTML = `<span class="eyebrow">Process ${k + 1} of 5</span><h3 style="color:${s[1]}">${s[0]}</h3><p>${s[2]}</p><dl class="stack small" style="margin:0"><div><b>Phone example:</b> ${s[3]}</div><div><b>Owner:</b> ${s[4]}</div><div><b>Scorecard:</b> ${s[5]}</div><div class="callout warn"><b>What goes wrong</b>${s[6]}</div></dl>`; $$(".scn circle", root).forEach((c, i) => c.style.strokeWidth = i === k ? 7 : 4); $$(".scn circle", root).forEach((c, i) => c.style.stroke = i === k ? "var(--ink)" : "var(--surface)"); };
      $$(".scn", root).forEach(n => { n.addEventListener("click", () => show(+n.dataset.k)); n.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(+n.dataset.k); } }); });
      show(0);
      $$('[data-chips="flows"] .chip', root).forEach(c => c.classList.add("on"));
      PA.onChips(root, "flows", on => { ["product", "info", "money"].forEach(k => { const l = $('[data-lane="' + k + '"]', root); if (l) l.style.display = on.indexOf(k) >= 0 ? "" : "none"; }); }, true);
      PA.bindCtls(root, ["c2c-dio", "c2c-dso", "c2c-dpo"], v => {
        const dio = v["c2c-dio"], dso = v["c2c-dso"], dpo = v["c2c-dpo"], c = dio + dso - dpo, mx = Math.max(dio + dso, dpo, 1);
        const bar = (lab, a, b, col) => `<div class="hbar"><span>${lab}</span><span class="bar" style="position:relative"><i style="position:absolute;left:${a / mx * 100}%;width:${(b - a) / mx * 100}%;background:${col}"></i></span><span class="v">${b - a} d</span></div>`;
        $("#c2c-vis", root).innerHTML = bar("Holding stock", 0, dio, "var(--s1)") + bar("Waiting for customers", dio, dio + dso, "var(--s2)") + bar("Supplier credit", 0, dpo, "var(--s3)");
        $("#c2c-say", root).innerHTML = c > 0 ? `Cash is tied up for <b>${c} days</b>: ${dio} + ${dso} − ${dpo}. Cut inventory days (better forecasts, less safety stock) and this number falls. That's why finance cares about the forecast.` : `Cash-to-cash is <b>${c} days</b>: customers pay before suppliers are paid, so suppliers are funding the business. Some retailers and online sellers run like this.`;
      });
      PA.bindCtls(root, ["pp"], v => {
        const p = v.pp, d = PUSH[p], stages = ["Components", "Assembly", "Warehouse", "Shelf"];
        $("#pp-chain", root).innerHTML = stages.map((s, i) => `<div class="node${i < p ? " on" : ""}"><b>${s}</b><small>${i < p ? "Push: built on forecast" : "Pull: waits for an order"}</small></div>` + (i < 3 ? `<span class="arr">${i === p - 1 ? "┃" : "→"}</span>` : "")).join("");
        $("#pp-wait", root).style.width = d[2] + "%"; $("#pp-risk", root).style.width = d[3] + "%";
        $("#pp-wait-t", root).textContent = d[1]; $("#pp-risk-t", root).textContent = d[3] >= 90 ? "Highest" : d[3] >= 60 ? "High" : d[3] >= 30 ? "Medium" : "Low";
        $("#pp-say", root).innerHTML = `<b>${d[0]}.</b> ${d[4]}`;
      }, { pp: v => ["", "Pull everything", "After components", "After the warehouse", "At the shelf"][v] });
    },
    ask: ["Walk me through the supply chain for a smartphone.", "Plan: the forecast and S&amp;OP set the build. Source: components, some with months of lead time. Make: assembly and test at the factory or a contract manufacturer. Deliver: sea or air to the country warehouse, then to carriers and retailers. Return: trade-ins, repairs, recycling. Product flows down; sell-through data and money flow back up and start the next cycle."],
    boss: [
      { q: "In the cycle view, which cycle links the factory with its component suppliers?", o: ["Customer order cycle", "Replenishment cycle", "Manufacturing cycle", "Procurement cycle"], a: 3, why: "The procurement cycle is the handoff between the manufacturer and its suppliers. Manufacturing links the warehouse and the factory; replenishment links the retailer and the warehouse." },
      { q: "DIO is 40 days, DSO 35 days, DPO 50 days. What is the cash-to-cash cycle?", o: ["125 days", "55 days", "25 days", "5 days"], a: 2, why: "Cash-to-cash = DIO + DSO − DPO = 40 + 35 − 50 = 25 days." },
      { q: "A brand builds 2 million phones before launch, based on a forecast. That production is…", o: ["Pull", "Push", "Return", "Enable"], a: 1, why: "Anything done in anticipation of demand, on a forecast, is push. Pull waits for a real customer order." }
    ],
    take: ["Product flows down; information flows both ways; money flows up.", "The five processes are Plan, Source, Make, Deliver and Return, with Enable underneath.", "Everything before the push/pull boundary runs on a forecast. For phones that's the whole chain, which is why demand planning matters so much."],
    mnem: ["“Please Send More Delivery Returns”", "Plan · Source · Make · Deliver · Return. Enable holds it all together."]
  });

  /* ======================= 02 DEMAND PLANNING CYCLE ======================= */
  const SIXC = [
    ["Clean", "var(--s1)", "Gather sales, orders, stock-outs and promotions. Fix errors, remove one-offs, estimate demand lost to stock-outs."],
    ["Calculate", "var(--s6)", "Run statistical models on the cleaned history to get a baseline: what happens if nothing special happens."],
    ["Collaborate", "var(--s2)", "Sales, marketing and key accounts add what the history can't know: launches, promotions, price changes, new listings."],
    ["Commit", "var(--s5)", "The demand review agrees one unconstrained number, with assumptions and risks written down."],
    ["Communicate", "var(--s3)", "Publish to supply planning (to buy and build), finance (revenue) and logistics (capacity)."],
    ["Check", "var(--s4)", "Measure accuracy, bias and forecast value added. Feed what you learn into the next cycle."]
  ];
  function wheelSVG() {
    const cx = 150, cy = 150, ro = 144, ri = 72; let g = "";
    SIXC.forEach((c, k) => {
      const a0 = -90 + 60 * k + 1.5, a1 = -90 + 60 * (k + 1) - 1.5;
      const p0 = polar(cx, cy, ro, a0), p1 = polar(cx, cy, ro, a1), p2 = polar(cx, cy, ri, a1), p3 = polar(cx, cy, ri, a0), mid = polar(cx, cy, (ro + ri) / 2, (a0 + a1) / 2);
      g += `<g class="wseg" data-k="${k}" style="cursor:pointer" tabindex="0" role="button" aria-label="${c[0]}"><path d="M${p0[0]} ${p0[1]} A${ro} ${ro} 0 0 1 ${p1[0]} ${p1[1]} L${p2[0]} ${p2[1]} A${ri} ${ri} 0 0 0 ${p3[0]} ${p3[1]}Z" style="fill:${c[1]};opacity:.85"/><text class="wl" x="${mid[0]}" y="${mid[1] - 2}" text-anchor="middle" style="font-family:var(--display);font-weight:800;font-size:${c[0].length > 8 ? 11 : 13}px;fill:#fff">${c[0]}</text><text class="wl" x="${mid[0]}" y="${mid[1] + 13}" text-anchor="middle" style="font-size:10px;fill:#fff;opacity:.85">step ${k + 1}</text></g>`;
    });
    g += `<text x="150" y="146" text-anchor="middle" style="font-family:var(--display);font-weight:800;font-size:15px;fill:var(--ink)">The 6 Cs</text><text x="150" y="164" text-anchor="middle" style="font-size:11px;fill:var(--muted)">monthly · weekly refresh</text>`;
    return '<svg class="diagram" style="max-width:340px" viewBox="0 0 300 300" role="img" aria-label="Demand planning cycle: Clean, Calculate, Collaborate, Commit, Communicate, Check">' + g + "</svg>";
  }
  const DPC = {
    labels: ["Jan 25", "Feb 25", "Mar 25", "Apr 25", "May 25", "Jun 25", "Jul 25", "Aug 25", "Sep 25", "Oct 25", "Nov 25", "Dec 25", "Jan 26", "Feb 26", "Mar 26"],
    raw: [4100, 3900, 4300, 4200, 9600, 4400, 4500, 4700, 4600, 4800, 5600, 6900],
    stat: [4600, 4400, 4800], collab: [4600, 5060, 5400], actual: [4450, 5200, 5000], asp: 50
  };
  PA.modules.push({
    id: "dp-cycle", num: 2, act: 1, mins: 9,
    title: "The demand planning cycle",
    tag: "Six steps that turn messy history and market intel into one agreed number",
    line: "Demand planning is a loop that runs every month (often every week): clean the history, calculate a baseline, add what people know, agree one number, publish it, then check how wrong it was.",
    html() {
      const nul = n => Array(n).fill(null);
      return PA.sec("01", "The idea", `<div class="prose"><p>A forecast isn't a number someone types in. It's the output of a repeatable process. Most companies run it monthly to feed S&amp;OP (module 03), and fast-moving businesses refresh it weekly. The six steps are the same either way.</p>
        <p>One rule runs through all of it: the demand plan is <b>unconstrained</b>. It says what customers would buy if supply were unlimited. Whether you can actually build it is decided later, in the supply review.</p></div>
        <div class="defs">${SIXC.map((c, k) => `<div class="def"><span class="pill" style="color:${c[1]}">Step ${k + 1}</span><b>${c[0]}</b><small>${c[2]}</small></div>`).join("")}</div>`) +
        PA.sec("02", "See it: watch one forecast get built", `<div class="grid2" style="align-items:start"><div class="card flat">${wheelSVG()}<p class="small muted" style="text-align:center">Tap a step on the wheel or use the buttons.</p></div>
          <div class="card flat stack"><div class="sim-h"><span class="eyebrow" id="dp-k">Step 1 of 6</span><div class="row"><button class="btn sm" id="dp-prev" type="button">← Back</button><button class="btn sm primary" id="dp-next" type="button">Next step →</button></div></div><h3 id="dp-t"></h3><div id="dp-txt" class="prose small"></div></div></div>
          <div class="card flat"><div class="chart" id="dp-chart"></div><div id="dp-extra" class="stack" style="margin-top:10px"></div></div>
          <p class="small muted">Earbuds, units per month, one account. Illustrative numbers.</p>`) +
        PA.sec("03", "Simulate: clean the data", `<div class="card flat sim"><p class="small">Eight weeks of history are about to go into the model. Decide which rows to <b>keep</b> as they are and which to <b>fix</b> first. Then check.</p>
          <div class="tbl"><table><thead><tr><th>Week</th><th class="n">Units</th><th>Note from the data</th><th>Your call</th></tr></thead><tbody id="cl-body"></tbody></table></div>
          <div class="row"><button class="btn primary" id="cl-check" type="button">Check my calls</button><span id="cl-score" class="mono"></span></div><div id="cl-why" class="stack"></div></div>`) +
        PA.sec("04", "Go deeper", `<details class="deep"><summary>Forecast value added (FVA): does each step help?</summary><div><p>Every step should make the forecast better, or it's just cost. FVA compares accuracy before and after each step, usually starting from a naive forecast.</p><div class="formula">FVA of a step = error before the step − error after the step</div><p>Example: naive WAPE 30%, statistical 22% (+8 points of value), after sales overrides 25% (−3 points). The overrides made it worse, so look at which ones and why. The idea was popularised by Michael Gilliland at SAS.</p></div></details>
          <details class="deep"><summary>Levels: top-down, bottom-up, middle-out</summary><div><p>Forecasts live in a hierarchy: total → category → product → account → week. <b>Bottom-up</b> adds up detailed forecasts. <b>Top-down</b> forecasts the total and splits it by historical shares. <b>Middle-out</b> forecasts at a level with enough data (say, product × month) and goes both ways. Totals are more accurate because errors cancel (module 08).</p></div></details>
          <details class="deep"><summary>Demand sensing</summary><div><p>For the next few days or weeks, recent signals such as point-of-sale data, orders and even weather can beat a monthly model. Demand sensing updates the near term with these signals; the monthly cycle still owns the longer horizon.</p></div></details>
          <details class="deep"><summary>How this connects to the weekly Biz Ops loop</summary><div><p>The <a href="../#loop">six-step weekly loop</a> in the crash course is this cycle run weekly: check PSI (clean), shape demand (collaborate), agree and load (commit), publish the report (communicate), match supply, and monitor aging (check).</p></div></details>`);
    },
    mount(root) {
      const nul = n => Array(n).fill(null), D = DPC;
      const clean = D.raw.slice(); clean[4] = 4300;
      const join = arr => nul(11).concat([clean[11]], arr);
      let k = 0;
      const steps = [
        { t: "Clean", txt: "<p>May's 9,600 includes a one-off corporate order of about 5,300 units. Left in, it tells every model that May is huge. Replace it with a typical May (about 4,300) and log the 5,300 as an event, so it's remembered but not repeated.</p><p>Same idea for stock-outs: if the shelf was empty, recorded sales are lower than real demand, so you estimate what you missed.</p>",
          ser: () => [{ name: "Raw history", data: D.raw.concat(nul(3)), color: "var(--bad)", dash: "4 4" }, { name: "Cleaned history", data: clean.concat(nul(3)), color: "var(--s0)" }], marks: [{ x: 4, y: 9600, label: "one-off", color: "var(--bad)" }] },
        { t: "Calculate", txt: "<p>A statistical model reads the cleaned history (its level, gentle growth and holiday peak) and projects a <b>baseline</b>: Jan 4,600, Feb 4,400, Mar 4,800.</p><p>The baseline is the answer to “what happens if nothing special happens?”. It's the starting point, not the final word.</p>",
          ser: () => [{ name: "Cleaned history", data: clean.concat(nul(3)), color: "var(--s0)" }, { name: "Statistical baseline", data: join(D.stat), color: "var(--s6)", dash: "6 4" }] },
        { t: "Collaborate", txt: "<p>Marketing confirms a Valentine's promotion in February: <b>+15%</b>, so 4,400 → 5,060. Sales reports a new retailer listing from 1 March: <b>+600</b>, so 4,800 → 5,400.</p><p>Sales also asks for another <b>+1,000 in March “to be safe”</b> (the red dot).</p>",
          ser: () => [{ name: "Cleaned history", data: clean.concat(nul(3)), color: "var(--s0)" }, { name: "Statistical baseline", data: join(D.stat), color: "var(--s6)", dash: "6 4" }, { name: "With market intel", data: join(D.collab), color: "var(--s2)" }], marks: [{ x: 14, y: 6400, label: "sales ask", color: "var(--bad)" }] },
        { t: "Commit", txt: "<p>The demand review agrees one number. The extra +1,000 is rejected: <b>protection against uncertainty belongs in safety stock, not in the forecast</b> (module 15). The assumptions are written down: promotion confirmed; listing in 120 stores from 1 March.</p><p>Consensus: Jan 4,600 · Feb 5,060 · Mar 5,400.</p>",
          ser: () => [{ name: "Cleaned history", data: clean.concat(nul(3)), color: "var(--s0)" }, { name: "Consensus demand plan", data: join(D.collab), color: "var(--s5)", width: 3.2 }] },
        { t: "Communicate", txt: "<p>The consensus goes to <b>supply planning</b>, which places orders one lead time ahead (module 14), and to <b>finance</b>, which turns units into revenue at the average selling price (ASP).</p>",
          ser: () => [{ name: "Cleaned history", data: clean.concat(nul(3)), color: "var(--s0)" }, { name: "Published plan", data: join(D.collab), color: "var(--s3)", width: 3.2 }],
          extra: () => `<div class="tbl"><table><thead><tr><th>Month</th><th class="n">Units</th><th class="n">Revenue at $${D.asp} ASP</th></tr></thead><tbody>${D.collab.map((u, i) => `<tr><td>${D.labels[12 + i]}</td><td class="n">${fmt(u)}</td><td class="n">${money(u * D.asp)}</td></tr>`).join("")}<tr class="total"><td>Total</td><td class="n">${fmt(sum(D.collab))}</td><td class="n">${money(sum(D.collab) * D.asp)}</td></tr></tbody></table></div>` },
        { t: "Check", txt: "", ser: () => [{ name: "Cleaned history", data: clean.concat(nul(3)), color: "var(--s0)" }, { name: "Statistical baseline", data: join(D.stat), color: "var(--s6)", dash: "6 4" }, { name: "Consensus", data: join(D.collab), color: "var(--s5)" }, { name: "Actual", data: nul(11).concat([clean[11]], D.actual), color: "var(--s4)", width: 3, dots: true }],
          extra: () => {
            const A = sum(D.actual), ec = D.collab.map((f, i) => f - D.actual[i]), es = D.stat.map((f, i) => f - D.actual[i]);
            const wc = sum(ec.map(Math.abs)) / A, ws = sum(es.map(Math.abs)) / A, bc = sum(ec) / A;
            return `<div class="kpis">${PA.kpi("Consensus WAPE", pct(wc), "good")}${PA.kpi("Accuracy (1 − WAPE)", pct(1 - wc), "good")}${PA.kpi("Bias (+ = too high)", (bc > 0 ? "+" : "") + pct(bc), "warn")}${PA.kpi("Baseline-only WAPE", pct(ws), "bad")}${PA.kpi("FVA of collaboration", "+" + ((ws - wc) * 100).toFixed(1) + " pts", "acc")}</div>`;
          } }
      ];
      steps[5].txt = "<p>Actuals arrive: Jan 4,450 · Feb 5,200 · Mar 5,000. Collaboration beat the baseline-only forecast, because the promotion was real. But March came in 400 under the plan: the new listing ramped up slower than assumed.</p><p>That lesson goes back into step 1 next cycle: new listings ramp over several weeks, so phase them in.</p>";
      const draw = () => {
        const s = steps[k];
        $("#dp-k", root).textContent = "Step " + (k + 1) + " of 6"; $("#dp-t", root).textContent = (k + 1) + ". " + s.t; $("#dp-t", root).style.color = SIXC[k][1];
        $("#dp-txt", root).innerHTML = s.txt; $("#dp-extra", root).innerHTML = s.extra ? s.extra() : "";
        PA.line($("#dp-chart", root), { labels: D.labels, series: s.ser(), marks: s.marks, yMin: 0, yMax: 10000, bands: [{ x0: 12, x1: 14, color: "var(--accent-soft)", label: "forecast", op: 0.6 }], aria: "Earbuds history and forecast, step " + (k + 1) });
        $$(".wseg", root).forEach((g, i) => { $("path", g).style.opacity = i === k ? 1 : 0.32; $$(".wl", g).forEach(t => t.style.fill = i === k ? "#fff" : "var(--ink)"); });
        $("#dp-prev", root).disabled = k === 0; $("#dp-next", root).textContent = k === 5 ? "Start again ↺" : "Next step →";
      };
      $("#dp-prev", root).addEventListener("click", () => { k = Math.max(0, k - 1); draw(); });
      $("#dp-next", root).addEventListener("click", () => { k = k === 5 ? 0 : k + 1; draw(); if (k === 5) PA.miniWin("dp-walk", 10, "built a forecast end to end"); });
      $$(".wseg", root).forEach(n => { const go = () => { k = +n.dataset.k; draw(); }; n.addEventListener("click", go); n.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } }); });
      draw();
      const rows = [
        ["W1", 1020, "Normal week", "keep", "Nothing unusual. Keep it."],
        ["W2", 1980, "The same sales file was uploaded twice", "fix", "Duplicate load: real sales were about 990. Fix the data at the source."],
        ["W3", 990, "Normal week", "keep", "Nothing unusual. Keep it."],
        ["W4", 310, "Shelves empty from Wednesday to Sunday", "fix", "Stock-out. Sales were capped by stock, not demand (censored demand). Estimate true demand, or the model learns that week 4 is weak."],
        ["W5", 1050, "Normal week", "keep", "Nothing unusual. Keep it."],
        ["W6", 2400, "One-off bulk order from a corporate client", "fix", "One-off event. Remove it from the baseline and log it as an event, or it inflates future forecasts."],
        ["W7", 1880, "Black Friday week (happens every year)", "keep", "A recurring peak is seasonality, not an outlier. Keep it (tagged), so the model learns the yearly pattern."],
        ["W8", 1010, "Normal week", "keep", "Nothing unusual. Keep it."]
      ];
      const pick = {};
      $("#cl-body", root).innerHTML = rows.map((r, i) => `<tr data-i="${i}"><td>${r[0]}</td><td class="n">${fmt(r[1])}</td><td>${r[2]}</td><td><div class="chips" data-row="${i}"><button type="button" class="chip" data-v="keep">Keep</button><button type="button" class="chip" data-v="fix">Fix</button></div></td></tr>`).join("");
      $("#cl-body", root).addEventListener("click", e => { const b = e.target.closest(".chip"); if (!b) return; const box = b.parentElement; $$(".chip", box).forEach(x => x.classList.remove("on")); b.classList.add("on"); pick[box.dataset.row] = b.dataset.v; });
      $("#cl-check", root).addEventListener("click", () => {
        let ok = 0; rows.forEach((r, i) => { const tr = $('tr[data-i="' + i + '"]', root); const right = pick[i] === r[3]; if (right) ok++; tr.className = right ? "" : "hl"; });
        $("#cl-score", root).textContent = ok + " / 8 right";
        $("#cl-why", root).innerHTML = rows.map((r, i) => `<div class="why ${pick[i] === r[3] ? "good" : "bad"}"><b>${r[0]}: ${r[3] === "fix" ? "Fix" : "Keep"}.</b> ${r[4]}</div>`).join("");
        if (ok === 8) PA.miniWin("dp-clean", 15, "clean data, perfect score");
      });
    },
    ask: ["Describe your demand planning process.", "A monthly cycle with weekly refreshes. Clean the history (outliers, stock-outs, data errors), generate a statistical baseline, enrich it with sales and marketing intel with every assumption written down, agree one unconstrained consensus number in the demand review, publish it to supply and finance, then measure accuracy, bias and forecast value added and feed the lessons back."],
    boss: [
      { q: "When do you remove a one-off spike from the history?", o: ["Clean", "Collaborate", "Commit", "Check"], a: 0, why: "Cleaning happens first, before any model sees the data. A spike left in the history inflates every forecast built on it." },
      { q: "The statistical forecast had a WAPE of 18%. After sales overrides it was 23%. What is the FVA of the overrides?", o: ["+5 points", "−5 points: they made it worse", "0 points", "Can't tell"], a: 1, why: "FVA = error before − error after = 18 − 23 = −5 points. The overrides added error, so review which ones and why." },
      { q: "The demand plan handed to supply planning should be…", o: ["Constrained to current factory capacity", "Unconstrained: what customers would buy", "Equal to the sales target", "Equal to the finance budget"], a: 1, why: "The demand plan is unconstrained. The supply review then tests it against capacity, and S&OP decides what to do about the gaps." }
    ],
    take: ["Clean → Calculate → Collaborate → Commit → Communicate → Check, every cycle.", "The demand plan is unconstrained and honest. Protection belongs in safety stock, not in the forecast.", "Measure forecast value added: every step and every override should make the forecast better."],
    mnem: ["The 6 Cs", "Clean · Calculate · Collaborate · Commit · Communicate · Check."]
  });

  /* ======================= 03 DEMAND TO DELIVERY + S&OP ======================= */
  const SH = {
    cust: ["Customers (carriers, retailers)", "var(--s4)", "Orders, sell-through data, promotion calendars", "Product available when promised, healthy margins, not too much stock", "Sell-through, stock turns, margin", "When supply is tight they inflate orders to get a bigger share."],
    sales: ["Sales and account teams", "var(--s2)", "Customer intel, deal pipeline, account plans", "Product to sell, allocation for their accounts", "Revenue vs quota", "Optimism to secure supply, or sandbagging to beat quota."],
    mkt: ["Marketing and product management", "var(--s5)", "Launch dates, promotions, pricing, end-of-life plans", "A successful launch and campaign", "Market share, campaign return", "Launch hype vs a realistic ramp-up."],
    dp: ["Demand planning", "var(--s1)", "Statistical baseline, the consensus process, accuracy tracking", "One honest, agreed number", "Forecast accuracy, bias, FVA", "Pressure to make the forecast equal the target."],
    sp: ["Supply planning", "var(--s6)", "Capacity, the master production schedule, constraints", "A stable plan inside the time fences", "Plan adherence, inventory, service level", "Late changes inside the frozen zone."],
    proc: ["Procurement", "var(--s3)", "Supplier capacity, component lead times, cost", "Early, firm signals", "Cost savings, supplier on-time delivery", "Minimum order quantities vs demand that keeps changing."],
    mfg: ["Manufacturing", "var(--s0)", "Production schedule, yield, changeovers", "Level, predictable loading", "Utilisation, cost per unit, schedule adherence", "Long stable runs vs frequent mix changes."],
    log: ["Logistics and warehousing", "var(--s2)", "Transport and warehouse capacity, deployment", "Predictable volumes", "OTIF, cost per unit shipped", "Expensive air freight when planning is late."],
    fin: ["Finance", "var(--s3)", "Revenue and margin plan, working capital view", "A plan in dollars that ties to the budget", "Revenue vs budget, cash, inventory value", "Budget vs a realistic forecast."],
    cs: ["Customer service and order management", "var(--s5)", "Order promising (ATP), backorder handling", "Accurate availability dates", "Order fill rate, response time", "Promising dates the supply plan can't meet."],
    exec: ["Executive leadership", "var(--s4)", "Decision rights on trade-offs", "One plan, no surprises", "Profit, growth, market share", "Wanting growth and low inventory at the same time."],
    sup: ["Suppliers and contract manufacturers", "var(--s6)", "Capacity commitments, quality", "A firm, stable forecast", "On-time delivery, quality", "Committing capacity on a forecast that later drops."]
  };
  const D2D = [
    ["Market signal", ["cust", "sales"], "Sell-through, orders, promotion calendars and account plans arrive.", "Raw demand signals"],
    ["Statistical baseline", ["dp"], "Clean the history; models project a baseline.", "Unconstrained baseline"],
    ["Market intelligence", ["sales", "mkt", "dp"], "Launches, promotions, pricing and new listings are added, each with its assumption.", "Enriched forecast"],
    ["Demand review", ["dp", "sales", "mkt", "fin"], "Agree one unconstrained demand number; record assumptions and risks.", "Consensus demand plan"],
    ["Supply review", ["sp", "proc", "mfg", "log"], "Test the plan against capacity, materials and logistics; size the gaps.", "Constrained supply plan + gaps"],
    ["Integrated reconciliation (pre-S&OP)", ["fin", "dp", "sp"], "Put both plans in dollars; build scenarios to close the gaps.", "Decision options"],
    ["Executive S&OP", ["exec", "fin", "dp", "sp", "sales"], "Decide the trade-offs between service, cost, cash and risk.", "One approved plan"],
    ["Schedule and purchase orders", ["sp", "proc", "sup"], "Master production schedule; purchase orders placed one lead time ahead.", "Firm orders to suppliers"],
    ["Make", ["mfg", "sup"], "Assemble, test, pack.", "Finished goods"],
    ["Deploy and distribute", ["log", "sp"], "Decide which warehouse gets what; ship by sea or air.", "Stock positioned near demand"],
    ["Order capture and promise", ["cs", "sales", "cust"], "Orders arrive; available-to-promise (ATP) gives dates; allocation rules apply if short.", "Confirmed orders"],
    ["Pick, pack, ship, deliver", ["log", "cust"], "The warehouse fulfils the order and the carrier delivers.", "On-time, in-full delivery"],
    ["Invoice, cash and feedback", ["fin", "cust", "dp"], "Invoice and collect; sell-through and accuracy results feed step 1.", "Cash + lessons → next cycle"]
  ];
  PA.modules.push({
    id: "sop", num: 3, act: 1, mins: 12,
    title: "Demand to delivery and S&OP",
    tag: "The integrated flow, every stakeholder, and the meeting where trade-offs get decided",
    line: "S&OP is the monthly rhythm where every function agrees one plan. Demand-to-delivery is how that plan becomes a box at the customer's door, and how sales data loops back to start the next plan.",
    html() {
      return PA.sec("01", "The idea", `<div class="prose"><p><b>S&amp;OP (Sales and Operations Planning)</b> is a monthly process that gets sales, marketing, planning, supply, finance and leadership to agree <b>one plan</b>. Many companies now call the broader version <b>IBP (Integrated Business Planning)</b>, which adds full financial integration. A common structure has five steps across the month:</p></div>
        <div class="steps">${[["1", "Portfolio review", "Week 1", "Launches, end-of-life, product changes. What will we be selling?"], ["2", "Demand review", "Week 2", "Agree the unconstrained consensus demand, with assumptions and risks."], ["3", "Supply review", "Week 2–3", "Can we build and ship it? Capacity, materials, logistics. Where are the gaps?"], ["4", "Integrated reconciliation (pre-S&OP)", "Week 3", "Put demand and supply in dollars, build scenarios, prepare decisions."], ["5", "Executive S&OP", "Week 4", "Leaders decide the trade-offs and approve one plan."]].map(s => `<div class="step"><span class="sn">${s[0]}</span><div><b>${s[1]}</b> <span class="pill">${s[2]}</span><br><small class="muted">${s[3]}</small></div></div>`).join("")}</div>`) +
        PA.sec("02", "See it: the demand-to-delivery flow", `<div class="card flat sim"><div class="sim-h"><span class="small">Follow one stakeholder to see where they act, or play the whole flow.</span><button class="btn sm primary" id="d2d-play" type="button">${PA.icon("play")}Play the flow</button></div>
          <div class="chips" id="d2d-who"><button type="button" class="chip on" data-v="">Everyone</button>${Object.keys(SH).map(k => `<button type="button" class="chip" data-v="${k}"><span class="sw" style="background:${SH[k][1]}"></span>${SH[k][0].split(" (")[0]}</button>`).join("")}</div>
          <div class="steps" id="d2d"></div><p class="say" id="d2d-say">Steps 1–7 are planning (the S&amp;OP month). Steps 8–12 are execution. Step 13 closes the loop back to step 1.</p></div>`) +
        PA.sec("03", "Who's in the room", `<div class="stack">${Object.keys(SH).map(k => { const s = SH[k]; return `<details class="deep"><summary><span><span class="sw" style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${s[1]};margin-right:8px"></span>${s[0]}</span></summary><div><div class="defs"><div class="def"><span class="eyebrow">Brings</span><small>${s[2]}</small></div><div class="def"><span class="eyebrow">Wants</span><small>${s[3]}</small></div><div class="def"><span class="eyebrow">Measured on</span><small>${s[4]}</small></div><div class="def"><span class="eyebrow">Typical tension</span><small>${s[5]}</small></div></div></div></details>`; }).join("")}</div>
          <h3>Who does what in each S&amp;OP step</h3><div class="tbl"><table><thead><tr><th>Step</th><th>Demand planning</th><th>Sales</th><th>Marketing</th><th>Supply planning</th><th>Finance</th><th>Executives</th></tr></thead><tbody>
          ${[["Portfolio review", "C", "C", "A/R", "I", "C", "I"], ["Demand review", "A/R", "R", "C", "I", "C", "I"], ["Supply review", "C", "I", "I", "A/R", "C", "I"], ["Pre-S&OP", "R", "C", "C", "R", "A", "I"], ["Executive S&OP", "R", "C", "C", "R", "R", "A"]].map(r => `<tr><td><b>${r[0]}</b></td>${r.slice(1).map(c => `<td class="mono">${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
          <p class="small muted">R = responsible (does the work), A = accountable (signs off), C = consulted, I = informed. A typical split; it varies by company.</p>`) +
        PA.sec("04", "Simulate: the S&OP boardroom", `<p class="small">You chair the executive meeting. Three real-world decisions. Every option has a cost, and the numbers will show who was right.</p><div id="sop-game"></div>`) +
        PA.sec("05", "Go deeper", `<details class="deep"><summary>Why one number matters</summary><div><p>If sales plans on 120k, finance budgets 110k and supply builds 95k, the company has three plans and no plan. S&amp;OP exists to replace them with one set of numbers everyone executes, with the gaps and risks visible.</p></div></details>
          <details class="deep"><summary>Time fences tie S&amp;OP to execution</summary><div><p>Decisions inside the supply lead time are mostly locked (frozen zone). S&amp;OP spends its time on the horizon it can still change: beyond the frozen zone, on a rolling horizon that typically reaches 12–24 months. See module 14.</p></div></details>
          <details class="deep"><summary>Allocation is an S&amp;OP decision</summary><div><p>When supply is short, the rule for who gets what is a policy decision, not a clerical one. Allocating by sell-through also removes the reward for inflating orders, one of the four causes of the bullwhip effect (module 17).</p></div></details>`);
    },
    mount(root) {
      let who = "", playing = null;
      const render = (active) => {
        $("#d2d", root).innerHTML = D2D.map((s, i) => { const hit = !who || s[1].indexOf(who) >= 0; return `<div class="step${active === i ? " on" : ""}${hit ? "" : " dim"}"><span class="sn">${i + 1}</span><div><b>${s[0]}</b>${i < 7 ? ' <span class="pill violet">plan</span>' : i < 12 ? ' <span class="pill good">execute</span>' : ' <span class="pill gold">loop</span>'}<br><small>${s[2]}</small><div class="who">${s[1].map(k => `<span class="pill" style="color:${SH[k][1]}">${SH[k][0].split(" (")[0]}</span>`).join("")}<span class="pill">→ ${s[3]}</span></div></div></div>`; }).join("");
      };
      render(-1);
      $("#d2d-who", root).addEventListener("click", e => { const b = e.target.closest(".chip"); if (!b) return; $$("#d2d-who .chip", root).forEach(x => x.classList.remove("on")); b.classList.add("on"); who = b.dataset.v; render(-1); $("#d2d-say", root).innerHTML = who ? `<b>${SH[who][0]}</b> act in ${D2D.filter(s => s[1].indexOf(who) >= 0).length} of 13 steps. They bring ${SH[who][2].toLowerCase()}.` : "Steps 1–7 are planning (the S&amp;OP month). Steps 8–12 are execution. Step 13 closes the loop back to step 1."; });
      $("#d2d-play", root).addEventListener("click", () => {
        if (playing) { clearInterval(playing); playing = null; render(-1); return; }
        let i = 0; render(0); playing = setInterval(() => { i++; if (i >= D2D.length) { clearInterval(playing); playing = null; render(-1); PA.miniWin("d2d-play", 5, "walked the demand-to-delivery flow"); return; } render(i); const el = $$("#d2d .step", root)[i]; if (el && el.getBoundingClientRect().top > innerHeight - 80) el.scrollIntoView({ block: "center", behavior: "smooth" }); }, 1100);
      });
      PA._cleanup = () => { if (playing) clearInterval(playing); };
      if (PA.games.boardroom) PA.games.boardroom.mount($("#sop-game", root), { embedded: true });
    },
    ask: ["Walk me through how a forecast turns into a delivery.", "Signals from accounts feed a cleaned statistical baseline. Sales and marketing add intel. The demand review agrees one unconstrained number. The supply review tests it against capacity and materials. Pre-S&amp;OP puts both in dollars with scenarios, and the executive meeting decides the trade-offs. Then execution: production schedule and POs, manufacturing, deployment, order promising and allocation, delivery, invoicing. Sell-through and accuracy results feed back into the next cycle."],
    boss: [
      { q: "Which S&OP step checks whether the demand plan can actually be built and shipped?", o: ["Portfolio review", "Demand review", "Supply review", "Executive S&OP"], a: 2, why: "The supply review tests the unconstrained demand plan against capacity, materials and logistics, and sizes the gaps." },
      { q: "Supply is short. Which allocation rule best limits lost sales and order gaming?", o: ["Pro-rata to what each account ordered", "First come, first served", "By sell-through and weeks of supply", "Biggest account first"], a: 2, why: "Allocating by sell-through puts stock where it will sell and removes the reward for inflating orders, which is a bullwhip cause." },
      { q: "Who makes the final call when demand and supply can't be matched?", o: ["The demand planner", "The executive S&OP meeting", "The factory", "The biggest customer"], a: 1, why: "Planners prepare the options and their costs; the executive S&OP meeting owns the trade-off decision." }
    ],
    take: ["Five steps a month: portfolio, demand, supply, reconciliation, executive decision.", "Demand-to-delivery runs plan → make → move → promise → deliver → cash, and sell-through loops back to the start.", "Every stakeholder wants something different. S&OP turns those tensions into one visible plan with the trade-offs decided."],
    mnem: ["“Products Drive Supply, Reconcile, Decide”", "Portfolio · Demand · Supply · Reconciliation · Decision."]
  });

  /* ======================= 04 SEASONALITY ======================= */
  const PRESETS = {
    phones: ["Smartphones", [0.85, 0.80, 1.00, 0.92, 0.90, 0.88, 0.96, 1.02, 1.12, 1.00, 1.25, 1.30], "Spring and autumn flagship launches, back-to-school, then the holiday peak."],
    laptops: ["Laptops", [0.85, 0.80, 0.90, 0.85, 0.90, 0.95, 1.20, 1.35, 1.05, 0.90, 1.15, 1.10], "Back-to-school (July–August) is the big one, then holidays."],
    consoles: ["Game consoles", [0.70, 0.65, 0.75, 0.70, 0.70, 0.80, 0.80, 0.80, 0.85, 0.95, 1.90, 2.20], "Almost everything happens in November and December."],
    wearables: ["Fitness wearables", [1.30, 1.00, 0.95, 0.90, 0.95, 0.95, 0.90, 0.85, 0.85, 0.90, 1.10, 1.35], "New Year's resolutions in January, gifting in December."],
    ac: ["Room air conditioners", [0.40, 0.45, 0.70, 1.10, 1.70, 2.00, 1.80, 1.30, 0.80, 0.60, 0.55, 0.60], "Summer heat drives everything (northern hemisphere)."]
  };
  PA.modules.push({
    id: "seasonality", num: 4, act: 2, mins: 9,
    title: "Seasonality",
    tag: "Patterns that repeat on the calendar, and how to measure them with a seasonal index",
    line: "Seasonality is a pattern that repeats on a fixed calendar rhythm. Measure it once as a seasonal index, and you can separate “it's December” from “we're growing”.",
    html() {
      return PA.sec("01", "The idea", `<div class="prose"><p><b>Seasonality</b> is a pattern with a fixed, known period: the month of the year, the week of the year, the day of the week. Its causes are on the calendar: holidays, weather, school terms, paydays, festivals, product launch cycles, even fiscal year-ends for business buyers.</p>
        <p>Don't confuse it with a <b>trend</b> (a steady rise or fall), a <b>cycle</b> (economic ups and downs with no fixed length) or <b>noise</b> (random wobble).</p>
        <p>The tool is the <b>seasonal index</b>: how a period compares with an average period.</p></div>
        <div class="formula">Seasonal index (month m) = average of [ sales in m ÷ that year's monthly average ] across years</div>
        <div class="defs"><div class="def"><b>e.g. index 1.38</b><small>That month sells 38% more than an average month.</small></div><div class="def"><b>e.g. index 0.78</b><small>That month sells 22% less than an average month.</small></div><div class="def"><b>Deseasonalise</b><small>Actual ÷ index. Shows the underlying run-rate.</small></div><div class="def"><b>Reseasonalise</b><small>Baseline × index. Turns a flat baseline into a monthly forecast.</small></div></div>`) +
        PA.sec("02", "See it: three years on one calendar", `<div class="card flat"><div class="chart" id="se-plot"></div><p class="small muted">A-Series phone sell-through, thousand units, 2023–2025 (illustrative). Each line is one year. The same shape every year is seasonality; each line sitting higher than the last is the trend.</p></div>
          <div class="card flat"><div class="chart" id="se-idx"></div></div>`) +
        PA.sec("03", "Live example: calculate the index", `<div class="tbl" id="se-table"></div><div class="callout info" id="se-use"></div>`) +
        PA.sec("04", "Simulate: the seasonality lab", `<div class="card flat sim"><div class="sim-h">${PA.chips("se-preset", Object.keys(PRESETS).map(k => [k, PRESETS[k][0]]), "consoles")}</div>
          <p class="small muted" id="se-desc"></p>
          <div class="ctls">${PA.ctl("se-amp", "Seasonal strength", 0, 150, 5, 100, "%")}${PA.ctl("se-noise", "Random noise", 0, 25, 1, 6, "%")}${PA.ctl("se-grow", "Growth per year", -20, 40, 1, 10, "%")}</div>
          <div class="callout gold" id="se-guess"><b>Before you look: which month peaks?</b><div class="chips" id="se-gm">${MONTHS.map((m, i) => `<button type="button" class="chip" data-v="${i}">${m}</button>`).join("")}</div><span id="se-gr"></span></div>
          <div class="chart" id="se-lab"></div><div class="chart" id="se-labidx"></div>
          <p class="say" id="se-labsay"></p></div>`) +
        PA.sec("05", "Go deeper", `<details class="deep"><summary>When there's a strong trend, use a moving average</summary><div><p>Dividing by each year's average works when growth is moderate. With strong growth, the textbook method is <b>ratio to moving average</b>: compute a centred 12-month moving average (which contains no seasonality), divide each month by it, then average those ratios month by month.</p></div></details>
          <details class="deep"><summary>Moving holidays</summary><div><p>Easter, Diwali, Ramadan and Lunar New Year move between weeks, sometimes months, from year to year, and even fixed-date events like Singles' Day (11 November) or Black Friday land in a different week number. A fixed monthly index blurs them. Model them as <b>events</b> on their actual dates, then apply the effect.</p></div></details>
          <details class="deep"><summary>Weekly and 4-4-5 calendars</summary><div><p>Weekly planning uses 52 buckets, with a 53rd week some years. Many companies use a 4-4-5 retail calendar (two 4-week months, then a 5-week month), so “March” can be 5 weeks long. Compare like with like, or the index picks up calendar effects instead of demand.</p></div></details>`);
    },
    mount(root) {
      const y = PA.DATA.aseries, yrs = PA.DATA.years, idx = PA.seasonalIndex(y), col = ["var(--s6)", "var(--s2)", "var(--s1)"];
      PA.line($("#se-plot", root), { labels: MONTHS, series: yrs.map((yr, j) => ({ name: String(yr), data: y.slice(j * 12, j * 12 + 12), color: col[j], dots: true, width: j === 2 ? 3 : 2 })), yMin: 60, aria: "Seasonal plot of three years" });
      PA.bars($("#se-idx", root), { labels: MONTHS, series: [{ name: "Seasonal index", data: idx, colors: idx.map(v => v >= 1.1 ? "var(--s2)" : v <= 0.9 ? "var(--s6)" : "var(--s1)") }], hlines: [{ y: 1, label: "average month = 1.00", color: "var(--muted)" }], yTick: v => v.toFixed(1), vFmt: v => v.toFixed(2), valueLabels: true, legend: false, yFmt: v => v.toFixed(2), aria: "Seasonal index by month" });
      const ym = yrs.map((_, j) => mean(y.slice(j * 12, j * 12 + 12)));
      $("#se-table", root).innerHTML = `<table><thead><tr><th>Month</th>${yrs.map(yr => `<th class="n">${yr}</th><th class="n">÷ avg</th>`).join("")}<th class="n">Index</th></tr></thead><tbody>${MONTHS.map((mo, k) => `<tr${k === 11 ? ' class="hl"' : ""}><td>${mo}</td>${yrs.map((_, j) => `<td class="n">${y[j * 12 + k]}</td><td class="n muted">${(y[j * 12 + k] / ym[j]).toFixed(2)}</td>`).join("")}<td class="n"><b>${idx[k].toFixed(2)}</b></td></tr>`).join("")}<tr class="total"><td>Year average</td>${ym.map(v => `<td class="n">${v.toFixed(1)}</td><td></td>`).join("")}<td class="n">1.00</td></tr></tbody></table>`;
      const r1 = v => Math.round(v * 10) / 10, r2 = v => Math.round(v * 100) / 100, base = r1(ym[2] * 1.08), use = k => `${base.toFixed(1)} × ${r2(idx[k]).toFixed(2)} = ${(base * r2(idx[k])).toFixed(0)}k`;
      $("#se-use", root).innerHTML = `<b>Use it.</b> 2025 averaged ${ym[2].toFixed(1)}k a month. Say the 2026 baseline grows 8%: ${base.toFixed(1)}k a month, deseasonalised. Reseasonalise: <b>November = ${use(10)}</b>, <b>December = ${use(11)}</b>, February = ${use(1)}. One baseline, twelve different months.<br><span class="small muted">One catch: this product grows all year, so late-year months look a bit bigger against their own year's average. That inflates December's index a little; the ratio-to-moving-average method (see Go deeper) gives about 1.43 instead of ${r2(idx[11]).toFixed(2)}.</span>`;
      let preset = "consoles", guessed = false;
      const draw = v => {
        const P = PRESETS[preset], amp = v["se-amp"] / 100, nz = v["se-noise"] / 100, gr = v["se-grow"] / 100;
        const prof = P[1].map(x => 1 + (x - 1) * amp), pm = mean(prof), r = rng(77), data = [];
        for (let t = 0; t < 36; t++) data.push(Math.max(0, 100 * Math.pow(1 + gr, t / 12) * prof[t % 12] / pm * (1 + nz * gauss(r))));
        const est = PA.seasonalIndex(data);
        $("#se-desc", root).textContent = P[2];
        PA.line($("#se-lab", root), { labels: PA.DATA.labels36, series: [{ name: P[0] + " (index 100 = average month in year 1)", data, color: "var(--s1)", area: true }], yZero: true, aria: "Simulated three-year series" });
        const pk = est.indexOf(Math.max.apply(null, est)), lo = est.indexOf(Math.min.apply(null, est));
        if (guessed) {
          PA.bars($("#se-labidx", root), { labels: MONTHS, series: [{ name: "Estimated index", data: est, colors: est.map((x, i) => i === pk ? "var(--s2)" : i === lo ? "var(--s6)" : "var(--s1)") }], hlines: [{ y: 1, label: "1.00", color: "var(--muted)" }], yTick: x => x.toFixed(1), yFmt: x => x.toFixed(2), legend: false, height: 200 });
          $("#se-labsay", root).innerHTML = `Peak: <b>${MONTHS[pk]}</b> at ${est[pk].toFixed(2)} (${pct(est[pk] - 1, 0)} above an average month). Low: <b>${MONTHS[lo]}</b> at ${est[lo].toFixed(2)}. Peak-to-trough ratio: <b>${(est[pk] / est[lo]).toFixed(1)}×</b>. Push noise up and watch the estimated index get wobbly: that's why you want at least two or three years of history.`;
        } else { $("#se-labidx", root).innerHTML = ""; $("#se-labsay", root).textContent = "Make your guess above to reveal the index."; }
        root._peak = pk;
      };
      let cur = {};
      PA.bindCtls(root, ["se-amp", "se-noise", "se-grow"], v => { cur = v; draw(v); }, { "se-grow": x => (x > 0 ? "+" : "") + x + "%" });
      PA.onChips(root, "se-preset", v => { preset = v; guessed = false; $$("#se-gm .chip", root).forEach(c => c.classList.remove("on")); $("#se-gr", root).textContent = ""; draw(cur); });
      $("#se-gm", root).addEventListener("click", e => {
        const b = e.target.closest(".chip"); if (!b || guessed) return; guessed = true; draw(cur);
        const ok = +b.dataset.v === root._peak; b.classList.add("on");
        $("#se-gr", root).innerHTML = ok ? ' <span class="pill good">Correct</span>' : ' <span class="pill bad">The peak is ' + MONTHS[root._peak] + "</span>";
        if (ok) PA.miniWin("se-" + preset, 5, "spotted the " + PRESETS[preset][0].toLowerCase() + " peak");
      });
    },
    ask: ["How do you account for seasonality in a forecast?", "Measure seasonal indices from at least two or three years of cleaned history. Deseasonalise to see the real trend, forecast the baseline, then multiply back by the index for each period. Moving holidays and promotions are modelled as events on their actual dates, not baked into a fixed monthly index."],
    boss: [
      { q: "December's seasonal index is 1.50 and the deseasonalised baseline is 80k a month. What's the December forecast?", o: ["53k", "80k", "120k", "130k"], a: 2, why: "Reseasonalise: baseline × index = 80k × 1.50 = 120k." },
      { q: "November actual sales were 132k and November's index is 1.20. What were deseasonalised sales?", o: ["110k", "132k", "158k", "120k"], a: 0, why: "Deseasonalise: actual ÷ index = 132k ÷ 1.20 = 110k. That's the underlying run-rate." },
      { q: "Which of these is seasonality?", o: ["Sales growing 2% every month", "A spike every December", "A one-off bulk order", "A dip during a recession"], a: 1, why: "Seasonality repeats on a fixed calendar period. Steady growth is trend, a one-off is an outlier, and a recession is a cycle." }
    ],
    take: ["Seasonality repeats on a fixed calendar period; trend, cycle and noise don't.", "Seasonal index = how a period compares with an average period (1.00).", "Deseasonalise with ÷ index to see the truth; reseasonalise with × index to forecast."],
    mnem: ["“Divide to see, multiply to plan”", "Actual ÷ index = underlying demand. Baseline × index = the forecast for that month."]
  });

  /* ======================= 05 SEASONAL TRENDS ======================= */
  const CAL = [
    ["Jan", [["Post-holiday dip", "d"], ["Wearables: resolution spike", "d"], ["CES announcements", "d"], ["Lunar New Year factory shutdown (Jan or Feb)", "s"]]],
    ["Feb", [["Spring flagship launches (some brands)", "d"], ["Lunar New Year: pre-build needed", "s"]]],
    ["Mar", [["Launch ramp-up", "d"], ["Fiscal year-end for some B2B buyers", "d"]]],
    ["Apr", [["Quiet: baseline months", "d"]]],
    ["May", [["Summer starts: ACs, fans", "d"]]],
    ["Jun", [["Mid-year sales in some markets", "d"]]],
    ["Jul", [["Mid-year online mega-sales (June or July)", "d"], ["Back-to-school starts", "d"]]],
    ["Aug", [["Back-to-school peak: laptops, tablets", "d"], ["Holiday pre-build begins", "s"]]],
    ["Sep", [["Autumn flagship launches (some brands)", "d"], ["Old model starts to decline", "d"]]],
    ["Oct", [["Diwali (India, Oct or Nov)", "d"], ["Peak-season shipping capacity tight", "s"]]],
    ["Nov", [["Singles' Day 11.11 (China)", "d"], ["Black Friday and Cyber Monday", "d"]]],
    ["Dec", [["Holiday gifting peak", "d"], ["Carriers and ports congested", "s"]]]
  ];
  const LIFE = [0.7, 1.0, 0.8, 0.62, 0.5, 0.4, 0.33, 0.27, 0.22, 0.18, 0.15, 0.12, 0.07, 0.05, 0.03, 0.02, 0.01, 0.01];
  PA.modules.push({
    id: "trends", num: 5, act: 2, mins: 10,
    title: "Seasonal trends and decomposition",
    tag: "Split sales into level, trend, season and noise, and stop confusing season with growth",
    line: "Every sales history is a stack of layers: level, trend, seasonality and noise. Pull them apart and you can tell real growth from “it's just November”.",
    html() {
      return PA.sec("01", "The idea", `<div class="prose"><p>Decomposition splits a series into parts you can reason about:</p></div>
        <div class="defs"><div class="def"><b>Level</b><small>The typical volume right now.</small></div><div class="def"><b>Trend</b><small>The direction over time: growing, flat or declining.</small></div><div class="def"><b>Seasonality</b><small>The repeating calendar shape (module 04).</small></div><div class="def"><b>Noise</b><small>What's left: random variation you can't forecast.</small></div></div>
        <div class="grid2"><div class="formula wrap"><b>Additive:</b> Sales = Trend + Season + Noise<br><small>Seasonal swings stay the same size in units.</small></div><div class="formula wrap"><b>Multiplicative:</b> Sales = Trend × Season × Noise<br><small>Seasonal swings grow as the business grows. Many growing consumer electronics lines behave like this.</small></div></div>`) +
        PA.sec("02", "Simulate: the decomposition studio", `<div class="card flat sim"><div class="sim-h">${PA.chips("tr-model", [["mul", "Multiplicative"], ["add", "Additive"]], "mul")}<label class="row small"><input type="checkbox" id="tr-ev"> Add a Black Friday event</label></div>
          <div class="ctls">${PA.ctl("tr-trend", "Trend per month", -2, 3, 0.1, 1.2, "%")}${PA.ctl("tr-amp", "Seasonal strength", 0, 150, 5, 100, "%")}${PA.ctl("tr-noise", "Noise", 0, 20, 1, 5, "%")}</div>
          <div class="chart" id="tr-main"></div>
          <div class="grid3"><div><span class="eyebrow">Trend</span><div class="chart" id="tr-c1"></div></div><div><span class="eyebrow">Seasonal component</span><div class="chart" id="tr-c2"></div></div><div><span class="eyebrow">Noise</span><div class="chart" id="tr-c3"></div></div></div>
          <p class="say" id="tr-say"></p></div>`) +
        PA.sec("03", "Live example: growth or just the season?", `<div class="card flat stack"><p class="small">Month-over-month comparisons lie during seasonal swings. A phone line has these seasonal indices: Jan 0.82, Feb 0.78, Mar 1.02, Jul 0.97, Aug 1.04, Oct 0.95, Nov 1.28, Dec 1.38. Judge each headline. Within ±5% of what the season predicts counts as “just the season”.</p><div id="tr-game" class="stack"></div><div class="row"><button class="btn primary" id="tr-check" type="button">Reveal</button><span class="mono" id="tr-score"></span></div></div>
          <div class="formula">Expected change from season alone = index(this month) ÷ index(last month) − 1</div>`) +
        PA.sec("04", "See it: the consumer electronics calendar", `<div class="grid3">${CAL.map(c => `<div class="def"><b>${c[0]}</b>${c[1].map(e => `<span class="pill ${e[1] === "s" ? "warn" : ""}" style="white-space:normal">${e[1] === "s" ? "Supply: " : ""}${e[0]}</span>`).join("")}</div>`).join("")}</div>
          <p class="small muted">Blue = demand-side events; orange = supply-side events. Dates and sizes vary by market and year. The official Lunar New Year holiday lasts about a week, but output at many factories, mostly in China, slows for two to four weeks around it, so planners build stock ahead.</p>`) +
        PA.sec("05", "See it: the product lifecycle meets the calendar", `<div class="card flat sim"><div class="sim-h"><span class="small">Same phone, same lifecycle. Only the launch month changes.</span>${PA.chips("tr-launch", [["2", "Launch in March"], ["8", "Launch in September"]], "8")}</div><div class="chart" id="tr-life"></div><p class="say" id="tr-lsay"></p></div>`) +
        PA.sec("06", "Go deeper", `<details class="deep"><summary>Year-over-year (YoY) is the simplest seasonality filter</summary><div><p>Comparing this November with last November cancels the season automatically. Use YoY for headlines and month-over-month only on deseasonalised numbers.</p></div></details>
          <details class="deep"><summary>Lifecycle beats history for launches</summary><div><p>A phone's history only starts at launch, so there's no seasonal history to learn from. Planners borrow the shape of a similar past launch (a like-item curve, module 07) and multiply by the seasonal index for each calendar month.</p></div></details>
          <details class="deep"><summary>Statistical decomposition</summary><div><p>Tools such as STL (Seasonal-Trend decomposition using Loess) do this automatically and robustly. <a href="https://otexts.com/fpp3/decomposition.html" target="_blank" rel="noopener">Forecasting: Principles and Practice</a> (Hyndman &amp; Athanasopoulos, free online) has a clear chapter on it.</p></div></details>`);
    },
    mount(root) {
      const idx0 = PA.DATA.phoneIdx, im = mean(idx0), idx = idx0.map(v => v / im);
      let model = "mul";
      const draw = v => {
        const g = v["tr-trend"] / 100, amp = v["tr-amp"] / 100, nz = v["tr-noise"] / 100, ev = $("#tr-ev", root).checked, r = rng(5);
        const L = 100, T = [], Sc = [], N = [], Y = [];
        for (let t = 0; t < 36; t++) {
          const tr = model === "mul" ? L * Math.pow(1 + g, t) : L + L * g * t;
          const s = 1 + (idx[t % 12] - 1) * amp + (ev && t % 12 === 10 ? 0.25 : 0), z = gauss(r);
          let y, sc, n;
          if (model === "mul") { sc = tr * (s - 1); n = tr * s * nz * z; y = tr * s + n; } else { sc = L * (s - 1); n = L * nz * z; y = tr + sc + n; }
          T.push(tr); Sc.push(sc); N.push(n); Y.push(Math.max(0, y));
        }
        PA.line($("#tr-main", root), { labels: PA.DATA.labels36, series: [{ name: "Sales (sum of the layers)", data: Y, color: "var(--s1)", width: 2.6, area: true }, { name: "Trend", data: T, color: "var(--s0)", dash: "6 4" }], yZero: true, aria: "Composed series with trend" });
        const small = (id, data, color) => PA.line($(id, root), { labels: PA.DATA.labels36, series: [{ name: "", data, color, legend: false }], height: 130, legend: false, ml: 36, xLabelW: 70 });
        small("#tr-c1", T, "var(--s0)"); small("#tr-c2", Sc, "var(--s2)"); small("#tr-c3", N, "var(--s4)");
        const d1 = Sc[11], d3 = Sc[35];
        $("#tr-say", root).innerHTML = model === "mul" ? `In the <b>multiplicative</b> model the December lift grows with the business: <b>${sgn(d1)}</b> units above trend in year 1, <b>${sgn(d3)}</b> in year 3. Many growing electronics lines look like this.` : `In the <b>additive</b> model the December lift is a fixed number of units every year (<b>${sgn(d1)}</b> in year 1 and ${sgn(d3)} in year 3), even as the trend moves. Use it when seasonal swings don't scale with volume.`;
      };
      let cur = {};
      PA.bindCtls(root, ["tr-trend", "tr-amp", "tr-noise"], v => { cur = v; draw(v); }, { "tr-trend": x => (x > 0 ? "+" : "") + x.toFixed(1) + "%" });
      PA.onChips(root, "tr-model", v => { model = v; draw(cur); });
      $("#tr-ev", root).addEventListener("change", () => draw(cur));
      const I = { Jan: 0.82, Feb: 0.78, Mar: 1.02, Jul: 0.97, Aug: 1.04, Oct: 0.95, Nov: 1.28, Dec: 1.38 };
      const G = [["Oct", "Nov", 0.35], ["Feb", "Mar", 0.05], ["Dec", "Jan", -0.40], ["Jul", "Aug", 0.20], ["Nov", "Dec", 0.02]].map(x => { const exp = I[x[1]] / I[x[0]] - 1, de = (1 + x[2]) / (1 + exp) - 1; return { h: `${x[1]} sales are <b>${x[2] > 0 ? "up" : "down"} ${Math.abs(x[2] * 100)}%</b> vs ${x[0]}.`, exp, de, ans: de > 0.05 ? "growth" : de < -0.05 ? "weak" : "season" }; });
      G.push({ h: "December sales are <b>up 15% vs last December</b>.", yoy: true, ans: "growth" });
      $("#tr-game", root).innerHTML = G.map((g, i) => `<div class="qz" data-i="${i}"><div>${g.h}</div><div class="chips">${[["growth", "Real growth"], ["season", "Just the season"], ["weak", "Weaker than it looks"]].map(o => `<button type="button" class="chip" data-v="${o[0]}">${o[1]}</button>`).join("")}</div><div class="whyslot"></div></div>`).join("");
      const pick = {};
      $("#tr-game", root).addEventListener("click", e => { const b = e.target.closest(".chip"); if (!b) return; const box = b.closest(".qz"); $$(".chip", box).forEach(x => x.classList.remove("on")); b.classList.add("on"); pick[box.dataset.i] = b.dataset.v; });
      $("#tr-check", root).addEventListener("click", () => {
        let ok = 0;
        G.forEach((g, i) => { const right = pick[i] === g.ans; if (right) ok++; const lab = { growth: "Real growth", season: "Just the season", weak: "Weaker than it looks" }[g.ans];
          $(`.qz[data-i="${i}"] .whyslot`, root).innerHTML = `<div class="why ${right ? "good" : "bad"}"><b>${lab}.</b> ${g.yoy ? "Year-over-year compares the same month, so the season cancels out. A 15% rise is real growth." : `The season alone predicts ${sgn(g.exp * 100, x => x.toFixed(1))}%. Deseasonalised change: <b>${sgn(g.de * 100, x => x.toFixed(1))}%</b>.`}</div>`; });
        $("#tr-score", root).textContent = ok + " / " + G.length + " right"; if (ok === G.length) PA.miniWin("tr-yoy", 15, "growth vs season, perfect score");
      });
      const life = lm => { const out = []; for (let k = 0; k < LIFE.length; k++) out.push(100 * LIFE[k] * idx[(lm + k) % 12]); return out; };
      const drawLife = lm => {
        lm = +lm; const a = life(2), b = life(8), sel = lm === 2 ? a : b, other = lm === 2 ? b : a;
        PA.line($("#tr-life", root), { labels: LIFE.map((_, k) => "M" + (k + 1)), series: [{ name: lm === 2 ? "Launch in March" : "Launch in September", data: sel, color: "var(--s1)", width: 3, area: true }, { name: lm === 2 ? "Launch in September" : "Launch in March", data: other, color: "var(--muted)", dash: "5 4" }, { name: "Lifecycle only (no season)", data: LIFE.map(x => 100 * x), color: "var(--s3)", dash: "2 4", width: 1.6 }], vlines: [{ x: 12, label: "successor launches", color: "var(--bad)" }], yZero: true, aria: "Lifecycle times seasonality" });
        const f12 = x => sum(x.slice(0, 12)), pk = x => Math.max.apply(null, x), dv = f12(b) / f12(a) - 1, dp = pk(b) / pk(a) - 1;
        $("#tr-lsay", root).innerHTML = `First-12-month volume: <b>${f12(sel).toFixed(0)}</b> vs ${f12(other).toFixed(0)} for the other launch month (index units). The September launch sells about <b>${pct(dv, 0)} more</b> in its first year and peaks about <b>${pct(dp, 0)} higher</b>, because its strongest early months land in October, November and December. ${lm === 8 ? "" : "A March launch spends its best months in the quiet part of the year; by the holidays the phone is already eight months old. "}Then the successor launches and the curve falls away: plan the old model's depletion before that happens.`;
      };
      PA.onChips(root, "tr-launch", drawLife); drawLife(8);
    },
    ask: ["Sales jumped 35% from October to November. Is the product growing?", "Not necessarily. I'd check the seasonal index or compare November with last November. If November's index is about 1.35× October's, a 35% jump is just the season. The deseasonalised or year-over-year number tells me whether there's real growth."],
    boss: [
      { q: "Sales rose 35% from October to November. What should you check before calling it growth?", o: ["Nothing: 35% is clearly growth", "Last November, or the seasonal index", "Only last month's forecast", "The finance budget"], a: 1, why: "Compare like with like. Year-over-year, or a deseasonalised month-over-month change, removes the seasonal effect." },
      { q: "Seasonal peaks get bigger every year as the business grows. Which model fits?", o: ["Additive", "Multiplicative", "Naive", "None of these"], a: 1, why: "In a multiplicative model the seasonal effect is a percentage of the trend, so peaks grow with volume." },
      { q: "Which is a supply-side seasonal event for electronics assembled in Asia?", o: ["Black Friday", "Lunar New Year factory shutdown", "Back-to-school", "Singles' Day"], a: 1, why: "Output at many factories, mostly in China, slows or stops for two to four weeks around Lunar New Year, so supply has to be built ahead. The others drive demand." }
    ],
    take: ["Sales = level + trend + season + noise (or multiplied, when swings grow with volume).", "Month-over-month lies in seasonal months. Use year-over-year or deseasonalised numbers.", "Launch timing × seasonality decides a model's lifetime volume. Plan depletion before the successor arrives."],
    mnem: ["“Strip the season, then judge the trend”", "Level · Trend · Season · Noise. Compare year-over-year or deseasonalise before calling anything growth."]
  });
})();
