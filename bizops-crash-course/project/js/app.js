/* Planner Project app: saved progress, router, the mission step-runner, The Loop, the Interview Studio, the decoder and the project portfolio. */
(function () {
  "use strict";
  const PP = window.PP;
  const { $, $$, esc, fmt, shuffle } = PA.u;

  /* ---------- saved progress (this browser only) ---------- */
  const KEY = "planner-project-v1";
  const fresh = () => ({ m: {}, ch: {}, st: {}, loop: {}, seen: {} });
  let P;
  try { P = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { P = fresh(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) { /* storage unavailable: progress lasts for this visit */ } };
  const today = PA.today;
  const xp = (n, why) => { try { PA.addXP(n, why); } catch (e) { /* XP is a bonus, never a blocker */ } };
  const once = (k, n, why) => { if (P.seen[k]) return; P.seen[k] = 1; save(); xp(n, why); };
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const missionOf = id => PP.missions.find(m => m.id === id);
  const qOf = id => PP.QS.find(q => q.id === id);
  const doneCount = () => PP.missions.filter(m => P.m[m.id]).length;
  const nextMission = () => PP.missions.find(m => !P.m[m.id]);
  const cast = (k, small) => { const c = PP.CAST[k]; return '<span class="av" style="background:' + c[2] + (small ? ";width:28px;height:28px;font-size:.78rem" : "") + '" title="' + esc(c[0] + " · " + c[1]) + '">' + c[0][0] + "</span>"; };
  const DAYN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Month-end"];

  /* ---------- icons ---------- */
  const IC = {
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    loop: '<circle cx="12" cy="12" r="8"/><path d="M12 4l3 2.5-3 2.5"/><path d="M12 20l-3-2.5 3-2.5"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    decode: '<path d="M4 6h16M4 12h10M4 18h7"/><circle cx="17.5" cy="16.5" r="3"/><path d="M20 19l2 2"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M8 7h7M8 11h7"/>',
    play: '<path d="M7 4l13 8-13 8z"/>', stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
    clue: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/>', lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    check: '<path d="M4 12l5 5L20 6"/>', print: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>', copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    shuffle: '<path d="M3 7h4l10 10h4M3 17h4l3-3M14 10l3-3h4M18 4l3 3-3 3M18 14l3 3-3 3"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2 6"/><path d="M20 4v7h-7"/>'
  };
  const icon = n => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (IC[n] || "") + "</svg>";

  /* ---------- cleanup between views (timers, microphone) ---------- */
  let cleanups = [];
  const onLeave = fn => cleanups.push(fn);
  const runCleanups = () => { cleanups.forEach(f => { try { f(); } catch (e) { /* ignore */ } }); cleanups = []; };

  const view = () => $("#view");
  const NAV = [["#/", "Home", "home", "home"], ["#/loop", "The Loop", "loop", "loop"], ["#/studio", "Studio", "mic", "studio"], ["#/decoder", "Decoder", "decode", "decoder"], ["#/stories", "My project", "book", "stories"]];
  const setNav = k => $$("#topnav a, #dock a").forEach(a => a.classList.toggle("on", a.dataset.k === k));

  /* ======================= HOME ======================= */
  function home() {
    setNav("home");
    const nm = nextMission(), dc = doneCount(), prac = Object.keys(P.st).length;
    let h = '<div class="view">';
    h += '<section class="hero"><div class="hero-l"><span class="eyebrow">A project, not a reading list</span><h1>Don\'t just learn demand planning. <span class="hl">Do the job.</span></h1>' +
      '<p class="sub">Eight weeks as the new demand planner at Nova Mobile US, an invented electronics company. Real situations, real numbers, your decisions. Every week becomes a story you can tell in an interview, and then you practise telling it out loud.</p>' +
      '<div class="row">' + (nm ? '<a class="btn sun" href="#/m/' + nm.id + '">' + icon("play") + (dc ? "Continue: Week " + nm.week + " · " + esc(nm.title) : "Start Week 40: " + esc(nm.title)) + "</a>" : '<a class="btn sun" href="#/stories">' + icon("book") + "See your project</a>") +
      '<a class="btn" href="#/loop">' + icon("loop") + "See the whole job first</a></div></div>" +
      '<div class="card stack"><span class="eyebrow">Your progress</span><div class="kpis">' + PA.kpi("Weeks done", dc + " / 8", "acc") + PA.kpi("Stories unlocked", dc) + PA.kpi("Questions practised", prac + " / " + PP.QS.length, "warn") + "</div>" +
      '<div class="meter" aria-hidden="true"><i style="width:' + (dc / 8 * 100) + '%;background:linear-gradient(90deg,var(--sun),var(--s4))"></i></div>' +
      '<small class="muted">You are the <b>' + esc(PP.CO.you) + "</b> at " + esc(PP.CO.name) + ", " + esc(PP.CO.what) + "</small></div></section>";

    h += '<section class="stack"><div><span class="eyebrow">Why good candidates freeze</span><h2>Three gaps, three fixes</h2></div><div class="freeze">' +
      [["You know the terms but can't explain the process", "The Loop: one picture of the whole job that you trace out loud, stop by stop.", "#/loop"],
       ["You've never done the work, so you have no example", "Eight missions: you make the calls, see what happens and keep the numbers.", nm ? "#/m/" + nm.id : "#/stories"],
       ["You know the answer but it comes out jumbled", "The Studio: one structure per question type, practised out loud and checked.", "#/studio"]].map(f => '<a class="f" href="' + f[2] + '" style="text-decoration:none;color:inherit"><span class="x">✗ ' + f[0] + '</span><b>' + f[1].split(":")[0] + '</b><small class="muted">' + f[1].split(": ")[1] + '</small><span class="y">✓ fix it →</span></a>').join("") + "</div></section>";

    h += '<section class="stack"><div><span class="eyebrow">Your path</span><h2>Five steps, about three hours in total</h2></div><div class="path">' +
      [["1", "The Loop", "The whole job in one picture, plus the planner's Monday-to-Friday. About 10 minutes.", "#/loop", P.loop.traced ? "done ✓" : "10 min"],
       ["2", "Eight weeks on the job", "One situation per week: read a PSI, clean a spike, find a stock-out, survive cutoff, write the report, fix a late ship, clear old stock, grade the month.", nm ? "#/m/" + nm.id : "#/m/m1", dc + " / 8 done"],
       ["3", "Interview Studio", PP.QS.length + " questions with a structure for each type. Speak or type, then check which key points you hit.", "#/studio", prac + " practised"],
       ["4", "Decode the job description", "Paste a JD or your resume. Each line is explained and linked to the week where you did it.", "#/decoder", "5 min"],
       ["5", "Your project", "Your stories with numbers, and an honest way to list the project on your resume.", "#/stories", dc + " stories"]].map(s => '<a class="pstep" href="' + s[3] + '"><span class="pn">' + s[0] + "</span><span><b>" + s[1] + "</b><small>" + s[2] + '</small></span><span class="go">' + s[4] + " →</span></a>").join("") + "</div></section>";

    h += '<section class="stack"><div class="sec-h"><div><span class="eyebrow">The eight weeks</span><h2>One situation, one picture, one story each</h2></div><span class="muted small">Do them in order: the numbers carry over.</span></div><div class="mtiles">' +
      PP.missions.map(m => '<a class="mtile' + (P.m[m.id] ? " done" : "") + (nm && nm.id === m.id ? " next" : "") + '" href="#/m/' + m.id + '"><span class="art">' + PP.ART[m.art] + '</span><span><span class="tn">Week ' + m.week + " · " + DAYN[m.day[0]] + " · " + m.mins + " min" + (P.m[m.id] ? ' <span class="pill good">done</span>' : "") + "</span><b>" + esc(m.title) + "</b><small>" + esc(m.sub) + "</small></span></a>").join("") + "</div></section>";

    h += '<section class="callout sun"><b>How to talk about this honestly</b><span class="small">This is a simulation with an invented company. In an interview, say “<i>in my demand planning simulation project…</i>”. Interviewers respect hands-on project work. What falls apart is claiming a job you didn\'t do. Your answers here hold up under follow-up questions because you actually did each step and know where every number came from.</span></section>';
    h += "</div>";
    view().innerHTML = h;
  }

  /* ======================= MISSION RUNNER ======================= */
  const RUN = {
    chat(st, body, ctx, done) {
      let k = 0;
      const add = () => {
        const [who, html] = st.msgs[k]; const c = PP.CAST[who];
        body.insertAdjacentHTML("beforeend", '<div class="msg">' + cast(who) + '<div><span class="who"><b>' + c[0] + "</b> · " + esc(c[1]) + '</span><div class="txt">' + html + "</div></div></div>");
        k++; if (k < st.msgs.length) { const t = setTimeout(add, reduced() ? 0 : 700); ctx.cleanup(() => clearTimeout(t)); } else done();
      };
      add();
    },
    info(st, body, ctx, done) {
      body.innerHTML = typeof st.html === "function" ? st.html(ctx) : st.html;
      if (st.mount) st.mount(body, ctx);
      done();
    },
    mcq(st, body, ctx, done) {
      body.innerHTML = (st.html ? '<div class="stack">' + st.html + "</div>" : "") + "<p><b>" + st.q + '</b></p><div class="opts">' + st.opts.map((o, i) => '<button type="button" class="opt" data-i="' + i + '"><span class="ol">' + "ABCD"[i] + "</span><span>" + o.t + "</span></button>").join("") + '</div><div class="fbslot"></div><div class="cslot"></div>';
      let fin = false;
      body.addEventListener("click", e => {
        const b = e.target.closest(".opt"); if (!b || b.disabled) return;
        const i = +b.dataset.i, o = st.opts[i];
        let first = true;
        if (st.key) { const c = ctx.ch[st.key] = ctx.ch[st.key] || {}; if (c.first == null) c.first = i; else first = false; c.last = i; ctx.save(); }
        const cls = o.ok === true ? "right" : o.ok === "part" ? "part" : "wrong";
        if (st.decide) $$(".opt", body).forEach(x => x.classList.remove("picked"));
        b.classList.add(cls); if (st.decide) b.classList.add("picked");
        $(".fbslot", body).innerHTML = '<div class="why ' + (o.ok === true ? "good" : o.ok === "part" ? "part" : "bad") + '"><b>' + (o.ok === true ? "Strong call. " : o.ok === "part" ? "Partly. " : "Not this one. ") + "</b>" + o.fb + (st.decide && o.ok !== true ? " <i>Try the other options to compare what happens.</i>" : "") + "</div>";
        if (st.conseq) st.conseq($(".cslot", body), i, ctx);
        if (st.decide) { if (!fin) { fin = true; if (o.ok === true && first) xp(10, "good call first time"); done(); } }
        else if (o.ok === true) { $$(".opt", body).forEach(x => { x.disabled = true; }); if (!fin) { fin = true; done(); } }
        else b.disabled = true;
      });
    },
    calc(st, body, ctx, done) {
      body.innerHTML = '<div class="stack">' + (st.html || "") + '</div><div class="calcf">' + st.fields.map((f, i) => '<label>' + f.label + '<span class="in">' + (f.pre ? "<span>" + f.pre + "</span>" : "") + '<input type="text" inputmode="decimal" autocomplete="off" data-i="' + i + '"' + (f.ans < 0 ? ' placeholder="use − for a fall"' : "") + ">" + (f.suf ? "<span>" + f.suf + "</span>" : "") + "</span></label>").join("") +
        '</div><div class="row"><button class="btn primary" type="button" data-a="check">Check</button><button class="btn ghost" type="button" data-a="show" hidden>Show me the working</button></div><div class="fbslot"></div>';
      let tries = 0, fin = false;
      const num = s => { const t = String(s).replace(/[,$%\s]/g, "").replace(/[−–]/g, "-"); return t === "" || t === "-" ? NaN : +t; };
      const finish = ok => {
        $(".fbslot", body).innerHTML = '<div class="why ' + (ok ? "good" : "part") + '"><b>' + (ok ? "Correct. " : "Here's the working. ") + "</b>" + st.sol + "</div>";
        $('[data-a="show"]', body).hidden = true;
        if (!fin) { fin = true; if (ok && tries === 1) xp(5, "maths right first time"); done(); }
      };
      $('[data-a="check"]', body).addEventListener("click", () => {
        tries++; let all = true;
        $$("input", body).forEach(inp => {
          const f = st.fields[+inp.dataset.i], v = num(inp.value);
          let ok = isFinite(v) && Math.abs(v - f.ans) <= f.tol + 1e-9;
          if (!ok && f.suf === "%" && isFinite(v) && Math.abs(v) < 1) ok = Math.abs(v * 100 - f.ans) <= f.tol + 1e-9;
          inp.classList.toggle("ok", ok); inp.classList.toggle("bad", !ok); if (!ok) all = false;
        });
        if (all) finish(true);
        else { $(".fbslot", body).innerHTML = '<div class="why bad">Not yet: fix the red box' + ($$("input.bad", body).length > 1 ? "es" : "") + ". Work it on paper first.</div>"; if (tries >= 2) $('[data-a="show"]', body).hidden = false; }
      });
      $('[data-a="show"]', body).addEventListener("click", () => finish(false));
      $$("input", body).forEach(inp => inp.addEventListener("keydown", e => { if (e.key === "Enter") $('[data-a="check"]', body).click(); }));
    },
    clues(st, body, ctx, done) {
      body.innerHTML = '<div class="clues">' + st.clues.map((c, i) => '<button type="button" class="clue" aria-expanded="false" data-i="' + i + '"><b>' + icon("clue") + esc(c[0]) + '</b><small class="tap">Tap to check</small><span class="cb">' + c[1] + "</span></button>").join("") + '</div><p class="small mono muted" data-n></p>';
      const seen = new Set(); let fin = false;
      const count = () => { $("[data-n]", body).textContent = "Checked " + seen.size + " of " + st.clues.length + (seen.size < st.need ? " · open at least " + st.need : " · enough to decide, but keep looking if you like"); };
      body.addEventListener("click", e => {
        const b = e.target.closest(".clue"); if (!b) return;
        const open = !b.classList.contains("open"); b.classList.toggle("open", open); b.setAttribute("aria-expanded", open);
        seen.add(b.dataset.i); count();
        if (seen.size >= st.need && !fin) { fin = true; done(); }
      });
      count();
    },
    custom(st, body, ctx, done) { st.mount(body, ctx, done); },
    debrief(st, body, ctx, done) {
      const m = ctx.m;
      body.innerHTML = '<div class="grid2" style="align-items:start"><div class="stack"><p>' + m.recap + '</p><div><span class="eyebrow">Concepts you just used</span><div class="concepts" style="margin-top:6px">' + m.concepts.map(c => '<a class="pill" href="' + c[1] + '" target="_blank" rel="noopener">' + esc(c[0]) + " ↗</a>").join("") + '</div></div><div class="callout info"><span class="eyebrow">The Excel move</span><span class="small">' + m.excel + '</span></div></div>' +
        '<div class="card flat stack" style="justify-items:center;text-align:center"><span class="eyebrow">Remember the picture</span><span style="width:180px;display:block">' + PP.ART[m.art].replace("<svg", '<svg style="width:180px;height:120px"') + '</span><b style="font-family:var(--display)">' + esc(m.hook) + '</b><small class="muted">In the interview, picture this first. The words follow the picture.</small></div></div>';
      done();
    },
    story(st, body, ctx, done) {
      const m = ctx.m, s = m.story(ctx.ch);
      body.innerHTML = storyCard(m, s, true) + '<div class="stack"><span class="eyebrow">This story answers</span><div class="qlist">' + m.qs.map(id => { const q = qOf(id); return q ? qRow(q) : ""; }).join("") + "</div></div>";
      done();
    }
  };

  function storyCard(m, s, full) {
    return '<div class="storycard"><div class="sec-h"><div><span class="eyebrow">Week ' + m.week + " · " + esc(m.title) + '</span><h3>Your STAR story</h3></div><span class="pill sun">say: “in my simulation project…”</span></div>' +
      [["S", "Situation", s.s], ["T", "Task", s.t], ["A", "Action", s.a], ["R", "Result", s.r], ["L", "Learning", s.l]].map(x => '<div class="star"><span class="l" title="' + x[1] + '">' + x[0] + "</span><p><b>" + x[1] + ".</b> " + esc(x[2]) + "</p></div>").join("") +
      (full ? '<div class="callout"><span class="eyebrow">Resume line from this week</span><span class="small">' + esc(m.bullet) + "</span></div>" : "") + "</div>";
  }

  function missionView(id) {
    const m = missionOf(id); if (!m) return home();
    setNav("home");
    const ch = P.ch[id] = P.ch[id] || {}, i0 = PP.missions.indexOf(m), nx = PP.missions[i0 + 1];
    let h = '<div class="view col">';
    h += '<div class="crumbs"><a href="#/">← All weeks</a><span>·</span><span>Week ' + m.week + "</span><span>·</span><span>Mission " + m.n + " of 8</span></div>";
    h += '<header class="mhead"><div class="stack"><span class="eyebrow">Week ' + m.week + " · " + DAYN[m.day[0]] + " · about " + m.mins + " min</span><h1>" + esc(m.title) + '</h1><p class="sub">' + esc(m.sub) + '</p>' +
      '<div class="weekstrip" aria-label="Where this sits in the planner\'s week">' + DAYN.map((d, k) => '<span class="' + (m.day.indexOf(k) >= 0 ? "on" : "") + '">' + d + "</span>").join("") + "</div>" +
      '<div class="row" style="gap:6px">' + m.cast.map(k => cast(k, true)).join("") + '<small class="muted">' + m.cast.map(k => PP.CAST[k][0]).join(", ") + "</small></div></div>" +
      '<div class="anchor">' + PP.ART[m.art] + "<small><b>The picture:</b> " + esc(m.hook) + "</small></div></header>";
    h += '<div class="dots" id="dots" aria-hidden="true">' + m.steps.map(() => "<i></i>").join("") + "</div>";
    if (P.m[id]) h += '<div class="callout good"><b>You\'ve finished this week.</b><span class="small">Replay it to try other choices, or <a href="#/stories">read its story</a>.</span></div>';
    h += '<div class="feed" id="feed"></div><nav class="row" id="mend" hidden style="justify-content:space-between;border-top:1px solid var(--line);padding-top:18px"></nav></div>';
    view().innerHTML = h;

    const feed = $("#feed"), dots = $$("#dots i");
    const ctx = { m, ch, save, xp, cleanup: onLeave };
    let idx = -1;
    const mark = () => dots.forEach((d, k) => { d.className = k < idx ? "done" : k === idx ? "on" : ""; });
    const next = () => {
      idx++; if (idx >= m.steps.length) return;
      const me = idx, st = m.steps[me];
      const title = st.title || (st.type === "chat" ? "Messages" : st.type === "debrief" ? "What you just did, in planner language" : st.type === "story" ? "Your story from this week" : "");
      const el = document.createElement("section");
      el.className = "stp" + (st.type === "chat" ? " chatstep" : "");
      el.innerHTML = '<div class="sh"><h3>' + title + '</h3><span class="k">' + (me + 1) + " / " + m.steps.length + '</span></div><div class="body"></div><div class="next"></div>';
      feed.appendChild(el); mark();
      if (me > 0) el.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
      let fin = false;
      const done = () => {
        if (fin) return; fin = true;
        const nxt = $(".next", el);
        if (me < m.steps.length - 1) {
          nxt.innerHTML = '<button class="btn primary" type="button">Continue →</button>';
          $("button", nxt).addEventListener("click", () => { nxt.innerHTML = ""; next(); }, { once: true });
        } else finishMission();
      };
      try { RUN[st.type](st, $(".body", el), ctx, done); } catch (e) { console.error(e); done(); }
    };
    const finishMission = () => {
      idx = m.steps.length; mark();
      const first = !P.m[id];
      P.m[id] = { d: today() }; save();
      if (first) { xp(60, "Week " + m.week + " complete"); PA.confetti(); }
      const end = $("#mend"); end.hidden = false;
      end.innerHTML = '<a class="btn" href="#/studio/q/' + m.qs[0] + '">' + icon("mic") + "Practise this week's answers</a>" + (nx ? '<a class="btn sun" href="#/m/' + nx.id + '">Next: Week ' + nx.week + " · " + esc(nx.title) + " →</a>" : '<a class="btn sun" href="#/stories">' + icon("book") + "See your whole project →</a>");
    };
    next();
  }

  /* ======================= THE LOOP ======================= */
  function loopView() {
    setNav("loop");
    const cx = 230, cy = 230, R = 150, angs = [198, 234, 270, 306, 342, 18, 54, 90, 126, 162];
    const pt = (a, r) => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)];
    let s = '<svg class="ring" viewBox="-48 0 556 460" role="img" aria-label="The planning loop: goods flow from factory to consumer across the top, information flows back to the factory along the bottom, with the demand planner in the middle">';
    s += '<path class="flow" d="M' + (cx - R) + " " + cy + " A" + R + " " + R + " 0 0 1 " + (cx + R) + " " + cy + '" fill="none" style="stroke:var(--s1)" stroke-width="6" stroke-linecap="round"/>';
    s += '<path class="flow" d="M' + (cx + R) + " " + cy + " A" + R + " " + R + " 0 0 1 " + (cx - R) + " " + cy + '" fill="none" style="stroke:var(--s5)" stroke-width="6" stroke-linecap="round"/>';
    angs.slice(6).forEach(a => { const p = pt(a, R - 22); s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) + '" style="stroke:var(--sun)" stroke-width="1.5" stroke-dasharray="3 4" opacity=".6"/>'; });
    s += '<text x="' + cx + '" y="' + (cy - 70) + '" text-anchor="middle" style="fill:var(--s1);font-family:var(--mono);font-size:11px;letter-spacing:.08em">PRODUCT FLOWS →</text>';
    s += '<text x="' + cx + '" y="' + (cy + 80) + '" text-anchor="middle" style="fill:var(--s5);font-family:var(--mono);font-size:11px;letter-spacing:.08em">← INFORMATION FLOWS BACK</text>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="44" style="fill:var(--sun)"/><text x="' + cx + '" y="' + (cy - 3) + '" text-anchor="middle" style="fill:var(--sun-ink);font-family:var(--display);font-weight:800;font-size:18px">YOU</text><text x="' + cx + '" y="' + (cy + 15) + '" text-anchor="middle" style="fill:var(--sun-ink);font-size:10.5px">demand planner</text>';
    PP.LOOP.forEach((n, i) => {
      const p = pt(angs[i], R), lp = pt(angs[i], R + 34), c = Math.cos(angs[i] * Math.PI / 180);
      const anchor = c > 0.35 ? "start" : c < -0.35 ? "end" : "middle", col = n.side === "goods" ? "var(--s1)" : "var(--s5)";
      s += '<g class="node" data-i="' + i + '" tabindex="0" role="button" aria-label="' + (i + 1) + ". " + esc(n.n) + '"><circle class="dot" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="19" style="fill:' + col + ';stroke:var(--surface);stroke-width:3"/><text class="nn" x="' + p[0].toFixed(1) + '" y="' + (p[1] + 5).toFixed(1) + '" text-anchor="middle" style="fill:#fff;font-family:var(--display);font-weight:800;font-size:15px">' + (i + 1) + '</text><text class="lab" x="' + lp[0].toFixed(1) + '" y="' + (lp[1] + 4).toFixed(1) + '" text-anchor="' + anchor + '" style="font-weight:700">' + esc(n.n) + "</text></g>";
    });
    s += "</svg>";

    let h = '<div class="view">';
    h += '<header class="stack"><span class="eyebrow">Step 1 · about 10 minutes</span><h1>The Loop: the whole job in one picture</h1><p class="sub">When an interviewer says “walk me through the process”, trace this circle. Product flows clockwise across the top. Information flows back along the bottom. You sit in the middle, working on the information half.</p></header>';
    const leg = '<ol class="ringlegend" aria-hidden="true">' + PP.LOOP.map((n, i) => '<li class="' + n.side + '"><b>' + (i + 1) + "</b>" + esc(n.n) + "</li>").join("") + "</ol>";
    h += '<section class="loopwrap"><div class="card" id="lp-card">' + s + leg + '<div class="row" style="justify-content:center"><button class="btn sun" type="button" id="lp-play">' + icon("play") + 'Play the loop</button><button class="btn" type="button" id="lp-test">Test yourself</button></div></div>' +
      '<div class="card stack" id="lp-detail" aria-live="polite"></div></section>';
    h += '<section class="stack"><div><span class="eyebrow">The planner\'s week</span><h2>Monday to Friday, plus month-end</h2><p class="muted">A typical rhythm. Every team schedules it a little differently: ask in the interview how theirs runs.</p></div><div class="days">' +
      PP.DAYS.map((d, i) => '<button type="button" class="day" data-i="' + i + '"><span class="d">' + d.d + "</span><b>" + esc(d.t) + "</b><small>" + esc(d.s) + "</small></button>").join("") + '</div><div class="card stack" id="dy-detail"></div></section>';
    h += '<section class="card stack"><div><span class="eyebrow">Lock it in</span><h3>Put the week in order</h3><p class="small muted">Tap the five weekday jobs in the order they happen.</p></div><div class="order" id="wk-order"></div><div class="row"><button class="btn sm" type="button" id="wk-reset">' + icon("shuffle") + 'Shuffle and retry</button></div><div id="wk-fb"></div></section>';
    const pq = qOf("p-week");
    h += '<section class="stack"><div><span class="eyebrow">Your 60-second answer</span><h2>“Walk me through a typical week.”</h2></div><div class="card model">' + pq.model.map(x => '<div class="mp"><span>' + esc(x[0]) + "</span><p>" + esc(x[1]) + "</p></div>").join("") + '</div><div class="row"><a class="btn sun" href="#/studio/q/p-week">' + icon("mic") + 'Say it out loud in the Studio</a><a class="btn" href="#/studio/q/p-flow">“How does a forecast become a product on the shelf?”</a></div></section>';
    h += "</div>";
    view().innerHTML = h;

    const nodes = $$(".ring .node"), det = $("#lp-detail");
    let cur = -1, test = null, playT = null;
    const show = i => {
      cur = i; nodes.forEach((g, k) => g.classList.toggle("on", k === i));
      const n = PP.LOOP[i], m = missionOf(n.m);
      det.innerHTML = '<div class="row"><span class="pill ' + (n.side === "goods" ? "" : "violet") + '">' + (n.side === "goods" ? "Product flow" : "Information flow") + '</span><span class="eyebrow">Stop ' + (i + 1) + " of 10</span></div><h2>" + esc(n.n) + '</h2><dl class="kv"><dt>What happens</dt><dd>' + esc(n.what) + "</dd><dt>Data</dt><dd>" + esc(n.data) + "</dd><dt>Who</dt><dd>" + esc(n.who) + "</dd><dt>When</dt><dd>" + esc(n.when) + "</dd><dt>Measured by</dt><dd>" + esc(n.metric) + '</dd></dl><p class="say"><b>Say it:</b> “' + esc(n.say) + '”</p>' + (m ? '<a class="btn sm" href="#/m/' + m.id + '">Live it: Week ' + m.week + " · " + esc(m.title) + " →</a>" : "");
    };
    const intro = () => { det.innerHTML = '<span class="eyebrow">Tap any stop</span><h2>Ten stops, one circle</h2><p>Stops 1–5 are the <b style="color:var(--s1)">product</b>: factory → ship → our DC → account → consumer. Stops 6–10 are the <b style="color:var(--s5)">information</b> coming back: sales data → PSI and cleaning → consensus and load → report and S&amp;OP → supply and POs, which tells the factory what to build next.</p><p class="muted small">The dotted lines from the centre show where you, the planner, do the work.</p>'; };
    intro();
    nodes.forEach(g => { const go = () => { if (test) return testTap(+g.dataset.i); stopPlay(); show(+g.dataset.i); }; g.addEventListener("click", go); g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } }); });
    const stopPlay = () => { if (playT) { clearInterval(playT); playT = null; $("#lp-play").innerHTML = icon("play") + "Play the loop"; } };
    $("#lp-play").addEventListener("click", () => {
      if (playT) return stopPlay();
      endTest(); let i = 0; show(0); $("#lp-play").innerHTML = icon("stop") + "Stop";
      playT = setInterval(() => { i++; if (i >= 10) { stopPlay(); P.loop.played = 1; save(); once("loop-play", 10, "played The Loop"); return; } show(i); }, reduced() ? 2600 : 3200);
    });
    onLeave(stopPlay);
    function endTest() { test = null; nodes.forEach(g => g.classList.remove("hidelab")); $("#lp-card").classList.remove("testing"); $("#lp-test").textContent = "Test yourself"; }
    function testTap(i) {
      const want = test.k;
      if (i === want) {
        test.k++; nodes[i].classList.add("on"); nodes[i].classList.remove("hidelab");
        det.innerHTML = '<span class="eyebrow">Test · ' + test.k + " of 10</span><h2>" + esc(PP.LOOP[i].n) + ' ✓</h2><p class="muted">' + esc(PP.LOOP[i].say) + "</p>" + (test.k < 10 ? "<p><b>What comes next?</b></p>" : "");
        if (test.k >= 10) {
          const miss = test.miss; endTest(); P.loop.traced = 1; save(); once("loop-test", 20, "traced The Loop from memory");
          det.innerHTML = '<span class="eyebrow">Test complete</span><h2>All ten stops, in order</h2><p>' + (miss ? miss + " wrong tap" + (miss > 1 ? "s" : "") + " along the way. Run it again until it's zero." : "No wrong taps. You can now answer “walk me through the process” from a picture.") + '</p><a class="btn sm sun" href="#/studio/q/p-flow">Now say it out loud →</a>';
        }
      } else { test.miss++; const g = nodes[i]; g.style.opacity = ".35"; setTimeout(() => { g.style.opacity = ""; }, 400); det.querySelector("p:last-child") && (det.querySelector("p:last-child").innerHTML = "<b>Not that one.</b> Where does the " + (want < 5 ? "product" : "information") + " go next?"); }
    }
    $("#lp-test").addEventListener("click", () => {
      stopPlay();
      if (test) { endTest(); intro(); return; }
      test = { k: 0, miss: 0 }; nodes.forEach(g => { g.classList.remove("on"); g.classList.add("hidelab"); }); $("#lp-card").classList.add("testing");
      $("#lp-test").textContent = "End test";
      det.innerHTML = '<span class="eyebrow">Test yourself</span><h2>Labels hidden</h2><p>Tap the ten stops in order, starting at the <b>factory</b>. Say each one out loud as you tap it.</p><p></p>';
    });

    const days = $$(".day"), dd = $("#dy-detail");
    const showDay = i => {
      days.forEach((d, k) => d.classList.toggle("on", k === i));
      const d = PP.DAYS[i];
      dd.innerHTML = '<span class="eyebrow">' + d.d + "</span><h3>" + esc(d.t) + '</h3><dl class="kv"><dt>Comes in</dt><dd>' + esc(d.in) + "</dd><dt>You do</dt><dd>" + esc(d.do) + "</dd><dt>Goes out</dt><dd>" + esc(d.out) + "</dd><dt>With</dt><dd>" + esc(d.who) + "</dd><dt>Tools</dt><dd>" + esc(d.tool) + '</dd></dl><p class="say"><b>Say it:</b> “' + esc(d.say) + '”</p><div class="row">' + d.m.map(id => { const m = missionOf(id); return '<a class="btn sm" href="#/m/' + id + '">Live it: Week ' + m.week + " · " + esc(m.title) + " →</a>"; }).join("") + "</div>";
    };
    days.forEach((d, i) => d.addEventListener("click", () => showDay(i)));
    showDay(0);

    const W5 = PP.DAYS.slice(0, 5);
    const buildOrder = () => {
      const ord = shuffle(W5.map((_, i) => i)); let picks = [];
      $("#wk-order").innerHTML = ord.map(i => '<button type="button" class="oitem" data-i="' + i + '"><span class="on">·</span><span><b>' + esc(W5[i].t) + "</b> · " + esc(W5[i].s) + "</span></button>").join("");
      $("#wk-fb").innerHTML = "";
      $$("#wk-order .oitem").forEach(b => b.addEventListener("click", () => {
        const i = +b.dataset.i; if (picks.indexOf(i) >= 0 || picks.length >= 5) return;
        picks.push(i); b.classList.add("sel"); $(".on", b).textContent = picks.length;
        if (picks.length === 5) {
          const ok = picks.every((p, k) => p === k);
          $$("#wk-order .oitem").forEach(x => { const xi = +x.dataset.i; x.classList.add(picks.indexOf(xi) === xi ? "ok" : "no"); });
          $("#wk-fb").innerHTML = ok ? '<div class="why good"><b>Right.</b> Check → clean → agree and load → report → supply. Each day needs the one before it: you can\'t agree a number you haven\'t cleaned.</div>' : '<div class="why bad">Not quite. Ask what each day <i>needs</i>: you can\'t clean data you haven\'t checked, or report a number you haven\'t loaded. Shuffle and retry.</div>';
          if (ok) once("week-order", 10, "put the week in order");
        }
      }));
    };
    $("#wk-reset").addEventListener("click", buildOrder);
    buildOrder();
  }

  /* ======================= INTERVIEW STUDIO ======================= */
  const TL = { P: "Process", C: "Concept", S: "Case", B: "Story", R: "Resume line" };
  const TC = { P: "", C: "violet", S: "warn", B: "sun", R: "good" };
  const qRow = q => { const r = P.st[q.id], m = missionOf(q.m); return '<a class="qrow" href="#/studio/q/' + q.id + '"><span class="pill ' + TC[q.t] + '">' + TL[q.t] + "</span><span>" + esc(q.q) + (m ? ' <small class="muted">· Week ' + m.week + "</small>" : "") + '</span><span class="st' + (r ? " r" + r.r : "") + '" title="' + (r ? ["Missed it", "Shaky", "Nailed it"][r.r] : "Not practised") + '"></span></a>'; };
  let mock = null;
  function startMock() {
    const by = t => shuffle(PP.QS.filter(q => q.t === t));
    const p = by("P"), c = by("C"), s = by("S"), br = shuffle(by("B").concat(by("R")));
    mock = { q: [p[0], c[0], s[0], c[1], s[1], br[0]].map(q => q.id), i: 0, res: [] };
    location.hash = "#/studio/q/" + mock.q[0];
  }
  function studioView(filter) {
    setNav("studio");
    filter = filter || "all";
    const weak = PP.QS.filter(q => P.st[q.id] && P.st[q.id].r < 2);
    let h = '<div class="view">';
    h += '<header class="stack"><span class="eyebrow">Step 3 · Interview Studio</span><h1>Knowing it isn\'t enough. Say it in order.</h1><p class="sub">Pick a question. Recall the picture from the week where you did it, follow the structure, say your answer out loud (or type it), then check which key points you hit. Rate yourself and the weak ones come back.</p></header>';
    h += '<section class="stack"><div><span class="eyebrow">Five question types, five structures</span><h2>Match the structure to the question</h2></div><div class="fws">' +
      Object.keys(PP.FW).map(k => { const f = PP.FW[k]; return '<div class="fw"><span class="pill ' + TC[k] + '" style="justify-self:start">' + TL[k] + "</span><b>" + esc(f.name) + '</b><span class="seq">' + f.seq.map(esc).join(" → ") + "</span><small>" + esc(f.tip) + "</small></div>"; }).join("") + "</div></section>";
    h += '<section class="card stack"><div class="row"><button class="btn sun" type="button" id="st-mock">' + icon("mic") + "Mock interview · 6 questions</button><button class=\"btn\" type=\"button\" id=\"st-rand\">" + icon("shuffle") + "Random question</button>" + (weak.length ? '<button class="btn" type="button" id="st-weak">Weak spots (' + weak.length + ")</button>" : "") + "</div>" +
      '<div class="chips" id="st-f">' + [["all", "All " + PP.QS.length]].concat(Object.keys(TL).map(k => [k, TL[k] + " " + PP.QS.filter(q => q.t === k).length])).concat(weak.length ? [["weak", "Weak spots"]] : []).map(c => '<button type="button" class="chip' + (c[0] === filter ? " on" : "") + '" data-v="' + c[0] + '">' + c[1] + "</button>").join("") + "</div>" +
      '<div class="qlist" id="st-list"></div><p class="small muted">Dots: <span style="color:var(--good)">●</span> nailed it · <span style="color:var(--gold)">●</span> shaky · <span style="color:var(--bad)">●</span> missed it · grey = not practised yet.</p></section>';
    h += "</div>";
    view().innerHTML = h;
    const list = f => { $("#st-list").innerHTML = PP.QS.filter(q => f === "all" ? true : f === "weak" ? P.st[q.id] && P.st[q.id].r < 2 : q.t === f).map(qRow).join(""); };
    list(filter);
    $("#st-f").addEventListener("click", e => { const b = e.target.closest(".chip"); if (!b) return; $$("#st-f .chip").forEach(x => x.classList.toggle("on", x === b)); list(b.dataset.v); });
    $("#st-mock").addEventListener("click", startMock);
    $("#st-rand").addEventListener("click", () => { mock = null; const q = shuffle(PP.QS)[0]; location.hash = "#/studio/q/" + q.id; });
    if ($("#st-weak")) $("#st-weak").addEventListener("click", () => { mock = null; location.hash = "#/studio/q/" + shuffle(weak)[0].id; });
  }

  function practiceView(id) {
    const q = qOf(id); if (!q) return studioView();
    setNav("studio");
    if (mock && mock.q[mock.i] !== id) { const k = mock.q.indexOf(id); if (k >= 0) mock.i = k; else mock = null; }
    const f = PP.FW[q.t], m = missionOf(q.m), SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const cueArt = m ? PP.ART[m.art] : PP.ART.loop;
    const cueTxt = m ? '<span class="eyebrow">Recall the picture · Week ' + m.week + "</span><b style=\"font-family:var(--display)\">" + esc(m.title) + '</b><small class="muted">' + esc(m.hook) + "</small>" + (P.m[m.id] ? "" : '<a class="small" href="#/m/' + m.id + '">You haven\'t done this week yet. Do it first for a real story →</a>') :
      '<span class="eyebrow">Recall the picture</span><b style="font-family:var(--display)">The Loop</b><small class="muted">Factory → ship → our DC → account → consumer, then data back → PSI → consensus → report → POs.</small><a class="small" href="#/loop">Open The Loop →</a>';
    let mine = "";
    if (m && P.m[m.id] && (q.t === "B" || q.t === "R" || q.t === "S")) { const s = m.story(P.ch[m.id] || {}); mine = '<details class="deep"><summary>Your story from Week ' + m.week + "</summary><div>" + storyCard(m, s, false) + "</div></details>"; }
    let h = '<div class="view col">';
    h += '<div class="crumbs"><a href="#/studio">← Studio</a><span>·</span><span>' + TL[q.t] + " question</span>" + (mock ? '<span>·</span><span class="pill sun">Mock interview · ' + (mock.i + 1) + " of " + mock.q.length + "</span>" : "") + "</div>";
    h += '<p class="qbig">“' + esc(q.q) + '”</p>';
    h += '<div class="grid2"><div class="card cue">' + cueArt + '<div class="stack" style="gap:4px">' + cueTxt + '</div></div><div class="card stack"><span class="eyebrow">Structure · ' + esc(f.name) + '</span><div class="skel">' + f.seq.map(x => "<span>" + esc(x) + "</span>").join("<i>→</i>") + '</div><small class="muted">' + esc(f.tip) + "</small></div></div>" + mine;
    h += '<section class="card stack"><div class="sec-h"><h3>Your answer</h3><span class="timer" id="pr-t">0:00</span></div>' +
      '<div class="row">' + (SR ? '<button class="btn sun" type="button" id="pr-mic">' + icon("mic") + "Start speaking</button>" : "") + '<button class="btn" type="button" id="pr-hint">Show key points</button><button class="btn ghost" type="button" id="pr-model">Show a model answer</button></div>' +
      (SR ? '<small class="muted">Your browser turns speech into text; in some browsers (Chrome, for example) that audio is processed by the browser maker\'s servers. This page doesn\'t store it. You can also just type.</small>' : '<small class="muted">Voice input isn\'t available in this browser. Type your answer, or use your phone keyboard\'s microphone button to dictate.</small>') +
      '<textarea id="pr-a" rows="7" placeholder="Speak or type your answer here. Aim for 60–90 seconds. Follow the structure above."></textarea><div id="pr-hints"></div>' +
      '<div class="row"><button class="btn primary" type="button" id="pr-check">' + icon("check") + 'Check my answer</button><span class="small muted" id="pr-wc"></span></div></section>';
    h += '<section class="stack" id="pr-res" hidden></section></div>';
    view().innerHTML = h;

    const ta = $("#pr-a"), tEl = $("#pr-t");
    let t0 = null, tick = null, rec = null, recOn = false;
    const fmtT = s => Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
    const startT = () => { if (tick) return; t0 = Date.now(); tick = setInterval(() => { const s = Math.round((Date.now() - t0) / 1000); tEl.textContent = fmtT(s) + (s < 60 ? "" : s <= 90 ? " ✓" : ""); tEl.classList.toggle("over", s > 120); }, 500); };
    const stopT = () => { if (tick) { clearInterval(tick); tick = null; } };
    const words = () => (ta.value.trim().match(/\S+/g) || []).length;
    ta.addEventListener("input", () => { startT(); $("#pr-wc").textContent = words() + " words"; });
    const stopRec = () => { recOn = false; if (rec) { try { rec.stop(); } catch (e) { /* already stopped */ } } const b = $("#pr-mic"); if (b) { b.classList.remove("rec"); b.innerHTML = icon("mic") + "Start speaking"; } };
    onLeave(() => { stopT(); stopRec(); });
    if (SR) $("#pr-mic").addEventListener("click", () => {
      if (recOn) { stopRec(); stopT(); return; }
      rec = new SR(); rec.lang = "en-US"; rec.continuous = true; rec.interimResults = true;
      const base = ta.value.trim() ? ta.value.trim() + " " : "";
      rec.onresult = e => { let fin = "", tmp = ""; for (let i = 0; i < e.results.length; i++) { const r = e.results[i]; if (r.isFinal) fin += r[0].transcript; else tmp += r[0].transcript; } ta.value = base + fin + tmp; $("#pr-wc").textContent = words() + " words"; };
      rec.onerror = e => { stopRec(); $("#pr-hints").innerHTML = '<div class="why part">' + (e.error === "not-allowed" || e.error === "service-not-allowed" ? "The microphone is blocked for this page. Allow it in the browser's address bar, or type your answer." : e.error === "no-speech" ? "Didn't hear anything. Try again, closer to the microphone." : "Voice input stopped (" + esc(e.error) + "). You can keep typing.") + "</div>"; };
      rec.onend = () => { if (recOn) { try { rec.start(); } catch (err) { stopRec(); } } };
      try { rec.start(); recOn = true; startT(); const b = $("#pr-mic"); b.classList.add("rec"); b.innerHTML = icon("stop") + "Stop"; } catch (err) { stopRec(); }
    });
    const modelHTML = () => '<div class="card model">' + q.model.map(x => '<div class="mp"><span>' + esc(x[0]) + "</span><p>" + esc(x[1]) + "</p></div>").join("") + "</div>";
    $("#pr-hint").addEventListener("click", () => { $("#pr-hints").innerHTML = '<div class="callout"><span class="eyebrow">Key points a strong answer hits</span><ul class="small">' + q.beats.map(b => "<li>" + esc(b[0]) + "</li>").join("") + "</ul></div>"; });
    $("#pr-model").addEventListener("click", () => { $("#pr-hints").innerHTML = '<span class="eyebrow">A model answer, in the ' + esc(f.name) + " structure. Read it, close it, then say it in your own words.</span>" + modelHTML(); });

    $("#pr-check").addEventListener("click", () => {
      const txt = ta.value.trim();
      if (words() < 8) { $("#pr-hints").innerHTML = '<div class="why part">Say or type an answer first, even a rough one. Getting it out in order is the skill you\'re practising.</div>'; return; }
      stopRec(); stopT();
      const hits = q.beats.map(b => b[1].test(txt)), n = hits.filter(Boolean).length, secs = t0 ? Math.round((Date.now() - t0) / 1000) : 0;
      const res = $("#pr-res"); res.hidden = false;
      res.innerHTML = '<div class="card stack"><div class="sec-h"><h3>You hit ' + n + " of " + q.beats.length + ' key points</h3><span class="pill ' + (n >= q.beats.length - 1 ? "good" : n >= q.beats.length / 2 ? "gold" : "bad") + '">' + words() + " words" + (secs ? " · " + fmtT(secs) : "") + '</span></div><div class="beats">' +
        q.beats.map((b, i) => '<div class="beat ' + (hits[i] ? "hit" : "miss") + '"><span class="ic">' + (hits[i] ? "✓" : "✗") + "</span><span>" + esc(b[0]) + "</span></div>").join("") +
        '</div><small class="muted">The check looks for the words a strong answer usually contains, so treat it as a guide, not a grade. If you made the point in other words, give yourself the tick.</small></div>' +
        '<div class="stack"><span class="eyebrow">Model answer · ' + esc(f.name) + "</span>" + modelHTML() + "</div>" +
        '<div class="stack"><span class="eyebrow">They\'ll ask next</span>' + q.fu.map(x => '<details class="deep"><summary>' + esc(x[0]) + "</summary><div><p>" + esc(x[1]) + "</p></div></details>").join("") + "</div>" +
        '<div class="card stack"><h3>How did that feel?</h3><div class="rate" id="pr-rate">' + [[2, "Nailed it", "came out in order"], [1, "Shaky", "knew it, jumbled it"], [0, "Missed it", "need another go"]].map(r => '<button type="button" data-r="' + r[0] + '"><b>' + r[1] + "</b><small>" + r[2] + "</small></button>").join("") + '</div><div class="row" id="pr-next"></div></div>';
      res.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
      if (mock) mock.res[mock.i] = { id, n, of: q.beats.length };
      $("#pr-rate").addEventListener("click", e => {
        const b = e.target.closest("button"); if (!b) return;
        $$("#pr-rate button").forEach(x => x.classList.toggle("on", x === b));
        const r = +b.dataset.r, prev = P.st[id];
        P.st[id] = { r, n: (prev ? prev.n : 0) + 1, d: today() }; save();
        once("st:" + id + ":" + today(), 5, "practised an answer");
        if (mock) mock.res[mock.i].r = r;
        const nxt = $("#pr-next");
        if (mock && mock.i < mock.q.length - 1) nxt.innerHTML = '<a class="btn sun" href="#/studio/q/' + mock.q[mock.i + 1] + '" id="pr-go">Next question (' + (mock.i + 2) + " of " + mock.q.length + ") →</a>";
        else if (mock) nxt.innerHTML = '<a class="btn sun" href="#/studio/mock-done">See your mock interview results →</a>';
        else nxt.innerHTML = (r < 2 ? '<button class="btn" type="button" id="pr-again">' + icon("refresh") + "Try it again now</button>" : "") + '<a class="btn sun" href="#/studio/q/' + shuffle(PP.QS.filter(x => x.id !== id))[0].id + '">Another question →</a><a class="btn ghost" href="#/studio">Back to the Studio</a>';
        const ag = $("#pr-again"); if (ag) ag.addEventListener("click", () => practiceView(id));
      });
    });
  }

  function mockDone() {
    setNav("studio");
    if (!mock) return studioView();
    const rs = mock.res.filter(Boolean), hit = rs.reduce((s, r) => s + r.n, 0), of = rs.reduce((s, r) => s + r.of, 0);
    once("mock:" + today(), 30, "finished a mock interview");
    let h = '<div class="view col"><div class="crumbs"><a href="#/studio">← Studio</a></div><header class="stack"><span class="eyebrow">Mock interview complete</span><h1>' + hit + " of " + of + ' key points</h1><p class="sub">Across ' + rs.length + " questions. Practise the ones you rated shaky or missed until they come out in order without the hints.</p></header><div class=\"qlist\">" +
      mock.q.map((id, i) => { const q = qOf(id), r = mock.res[i]; return '<a class="qrow" href="#/studio/q/' + id + '"><span class="pill ' + TC[q.t] + '">' + TL[q.t] + "</span><span>" + esc(q.q) + ' <small class="muted">· ' + (r ? r.n + "/" + r.of + " points" : "skipped") + '</small></span><span class="st' + (r && r.r != null ? " r" + r.r : "") + '"></span></a>'; }).join("") +
      '</div><div class="row"><button class="btn sun" type="button" id="mk-again">' + icon("shuffle") + 'Another mock interview</button><a class="btn" href="#/studio">Back to the Studio</a></div></div>';
    mock = null;
    view().innerHTML = h;
    $("#mk-again").addEventListener("click", startMock);
  }

  /* ======================= DECODER ======================= */
  function decoderView() {
    setNav("decoder");
    let h = '<div class="view col">';
    h += '<header class="stack"><span class="eyebrow">Step 4 · Decode the job description</span><h1>What does that line actually mean?</h1><p class="sub">Paste a job description or your resume bullets. Each line is matched to what the work really is, the week where you did it, and how to answer when they ask about it.</p></header>';
    h += '<section class="card stack"><label for="dc-in" class="eyebrow">Paste a JD or resume here</label><textarea id="dc-in" rows="6" placeholder="e.g. Analyze weekly PSI to identify demand fluctuation by accounts and products. Load AP2 forecast including buffer management…"></textarea><div class="row"><button class="btn sm" type="button" id="dc-ex">Try an example JD</button><button class="btn sm ghost" type="button" id="dc-clear">Clear</button></div><div id="dc-out" class="stack"></div></section>';
    h += '<section class="stack"><div><span class="eyebrow">The ' + PP.DEC.length + ' lines you\'ll see most</span><h2>Every line, decoded</h2></div><div class="dec" id="dc-list">' + PP.DEC.map(decItem).join("") + "</div></section>";
    h += '<section class="callout sun"><b>About your resume</b><span class="small">If a line describes work you did in this simulation, put it under a <b>Projects</b> heading (“Demand Planning Simulation Project”), not under a job. Under a job, keep only what you really did there. A line you can explain step by step, with numbers, survives the second follow-up question. A line you can\'t explain becomes the question that ends the interview.</span></section>';
    h += "</div>";
    view().innerHTML = h;
    const inp = $("#dc-in"), out = $("#dc-out");
    const run = () => {
      const txt = inp.value.trim(); $$("#dc-list details").forEach(d => d.classList.remove("match"));
      if (!txt) { out.innerHTML = ""; return; }
      const frags = txt.replace(/([.;])\s+/g, "$1\n").split(/\n+|\s*[•·▪●◦*]\s+|\s+-\s+/).map(s => s.trim()).filter(s => s.length > 12);
      const hitIds = new Set();
      const rows = frags.map(fr => { const ms = PP.DEC.filter(d => d.re.test(fr)); ms.forEach(d => hitIds.add(d.id)); return [fr, ms]; });
      hitIds.forEach(id => { const d = $("#dc-" + id); if (d) d.classList.add("match"); });
      const matched = rows.filter(r => r[1].length);
      out.innerHTML = '<div class="sec-h"><b>' + matched.length + " of " + rows.length + " lines matched · " + hitIds.size + ' topics</b><span class="small muted">Matched topics are highlighted below.</span></div><div class="maplist">' +
        rows.map(r => '<div class="mapit"><span>' + esc(r[0].length > 160 ? r[0].slice(0, 157) + "…" : r[0]) + '</span><span class="chips">' + (r[1].length ? r[1].map(d => '<a class="pill sun" href="#dc-' + d.id + '" data-open="' + d.id + '">' + esc(shortName(d)) + "</a>").join("") : '<span class="pill">general</span>') + "</span></div>").join("") + "</div>";
      if (txt.length > 40) once("decoder-used", 10, "decoded a job description");
    };
    let deb = null;
    inp.addEventListener("input", () => { clearTimeout(deb); deb = setTimeout(run, 250); });
    out.addEventListener("click", e => { const a = e.target.closest("[data-open]"); if (!a) return; e.preventDefault(); const d = $("#dc-" + a.dataset.open); d.open = true; d.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" }); });
    $("#dc-ex").addEventListener("click", () => {
      inp.value = "Analyze weekly Purchase Sales Inventory (PSI) to identify demand fluctuation by accounts & products.\nWeekly demand shaping/cleaning prior to weekly cutoff timing.\nLoad AP2 Forecast (including buffer management & logic) based on leadership direction & consensus.\nPrepare weekly reports including week over week changes, risks, and financial implications.\nMonitor product arrival schedules from factories to execute weekly Purchase Order Confirmation.\nWeekly aging product monitoring, depletion plan and re-allocate EOH.\nAdvanced Excel skills; experience with Claude or AI tools helpful.";
      run();
    });
    $("#dc-clear").addEventListener("click", () => { inp.value = ""; run(); });
  }
  const shortName = d => ({ psi: "PSI", clean: "Cleansing & shaping", load: "Forecast load + buffer", report: "Weekly report", po: "Arrivals & POs", alloc: "Allocation", aging: "Aging & depletion", recon: "Reconciliation", acc: "Accuracy & bias", sop: "S&OP", collab: "Stakeholders", excel: "Excel & data" })[d.id];
  function decItem(d) {
    const m = missionOf(d.m), q = qOf(d.q);
    return '<details id="dc-' + d.id + '"><summary><span><b>' + esc(d.line) + "</b><small>" + esc(d.plain) + '</small></span><span class="pill sun">Week ' + m.week + "</span></summary><div>" +
      '<div class="grid2" style="align-items:start"><div class="stack"><span class="eyebrow">What you actually do</span><ol class="small">' + d.steps.map(s => "<li>" + esc(s) + "</li>").join("") + '</ol></div><dl class="kv small"><dt>Comes in</dt><dd>' + esc(d.io[0]) + "</dd><dt>Goes out</dt><dd>" + esc(d.io[1]) + "</dd><dt>With</dt><dd>" + esc(d.who) + "</dd><dt>Tools</dt><dd>" + esc(d.tool) + "</dd></dl></div>" +
      '<div class="cue card flat">' + PP.ART[m.art] + '<div class="stack" style="gap:4px"><span class="eyebrow">Where you did it</span><b style="font-family:var(--display)">Week ' + m.week + " · " + esc(m.title) + '</b><small class="muted">' + esc(m.hook) + '</small><a class="small" href="#/m/' + m.id + '">' + (P.m[m.id] ? "Replay this week →" : "Do this week →") + "</a></div></div>" +
      (q ? '<div class="stack"><span class="eyebrow">When they ask about it</span><b>' + esc(q.q) + '</b><div class="card flat model">' + q.model.map(x => '<div class="mp"><span>' + esc(x[0]) + "</span><p>" + esc(x[1]) + "</p></div>").join("") + '</div><a class="btn sm sun" href="#/studio/q/' + q.id + '" style="justify-self:start">' + icon("mic") + "Practise saying it</a></div>" : "") +
      "</div></details>";
  }

  /* ======================= MY PROJECT ======================= */
  function storiesView() {
    setNav("stories");
    const done = PP.missions.filter(m => P.m[m.id]);
    let h = '<div class="view col">';
    h += '<header class="stack"><span class="eyebrow">Step 5 · Your project</span><h1>Your project portfolio</h1><p class="sub">Every week you finish becomes a STAR story with real numbers, built from the choices you made. This page collects them, with an honest way to put the project on your resume.</p><div class="row noprint"><button class="btn" type="button" id="sv-print">' + icon("print") + "Print or save as PDF</button></div></header>";
    h += '<section class="callout sun"><b>Say it honestly, and it holds up</b><span class="small">Start each story with “<i>In my demand planning simulation project…</i>”. You did every step: you can explain where each number came from, which is what follow-up questions test. If someone asks whether it was real company data, say no, it was a simulation with invented companies, and the methods and calculations are the real ones.</span></section>';
    h += '<section class="card stack"><div class="sec-h"><div><span class="eyebrow">For the Projects section of your resume</span><h3>Demand Planning Simulation Project · self-directed</h3><small class="muted">8 weekly planning cycles · 3 accounts (carrier, retailer, online) · 3 products · consumer electronics · Excel</small></div><button class="btn sm noprint" type="button" id="sv-copy">' + icon("copy") + "Copy</button></div>" +
      (done.length ? '<ul id="sv-bul">' + done.map(m => "<li>" + esc(m.bullet) + "</li>").join("") + "</ul>" : '<p class="muted">Finish a week to unlock its resume line.</p>') +
      (done.length && done.length < 8 ? '<small class="muted">' + (8 - done.length) + " more week" + (8 - done.length > 1 ? "s" : "") + " to unlock. Pick your strongest three or four bullets for the resume itself.</small>" : "") + "</section>";
    h += '<section class="stack"><div><span class="eyebrow">Your stories</span><h2>' + done.length + " of 8 unlocked</h2></div>" +
      PP.missions.map(m => P.m[m.id] ? storyCard(m, m.story(P.ch[m.id] || {}), false) + '<div class="row noprint">' + m.qs.slice(0, 3).map(id => '<a class="btn sm" href="#/studio/q/' + id + '">' + icon("mic") + esc(qOf(id).q.length > 46 ? qOf(id).q.slice(0, 44) + "…" : qOf(id).q) + "</a>").join("") + "</div>" :
        '<a class="mtile locked noprint" href="#/m/' + m.id + '"><span class="art">' + PP.ART[m.art] + '</span><span><span class="tn">' + icon("lock").replace("<svg", '<svg style="width:12px;height:12px"') + " Week " + m.week + "</span><b>" + esc(m.title) + "</b><small>Finish this week to unlock its story.</small></span></a>").join("") + "</section>";
    h += "</div>";
    view().innerHTML = h;
    $("#sv-print").addEventListener("click", () => window.print());
    $("#sv-copy").addEventListener("click", e => {
      const txt = "Demand Planning Simulation Project · self-directed\n" + done.map(m => "• " + m.bullet).join("\n");
      const ok = () => { e.target.closest("button").innerHTML = icon("check") + "Copied"; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, () => PA.toast("Copy blocked: select the text and copy it"));
      else PA.toast("Copy isn't available here: select the text and copy it");
    });
  }

  /* ======================= ROUTER ======================= */
  function route() {
    runCleanups();
    const hsh = location.hash.replace(/^#\/?/, ""), parts = hsh.split("/");
    if (parts[0].indexOf("dc-") === 0) return;
    if (parts[0] === "m" && parts[1]) missionView(parts[1]);
    else if (parts[0] === "loop") loopView();
    else if (parts[0] === "studio" && parts[1] === "q" && parts[2]) practiceView(parts[2]);
    else if (parts[0] === "studio" && parts[1] === "mock-done") mockDone();
    else if (parts[0] === "studio") { mock = null; studioView(); }
    else if (parts[0] === "decoder") decoderView();
    else if (parts[0] === "stories") storiesView();
    else home();
    window.scrollTo(0, 0);
    const t = $("h1", view()) || $(".qbig", view());
    document.title = (t && hsh ? t.textContent.replace(/[“”]/g, "").slice(0, 60) + " · " : "") + "Planner Project";
  }

  function boot() {
    const nav = NAV.map(n => '<a href="' + n[0] + '" data-k="' + n[3] + '">' + icon(n[2]) + "<span>" + n[1] + "</span></a>").join("");
    $("#topnav").innerHTML = nav; $("#dock").innerHTML = nav;
    let theme = null; try { theme = localStorage.getItem("pa-theme"); } catch (e) { /* none */ }
    if (theme) document.documentElement.dataset.theme = theme;
    $("#theme-btn").addEventListener("click", () => {
      const dark = document.documentElement.dataset.theme ? document.documentElement.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
      const t = dark ? "light" : "dark"; document.documentElement.dataset.theme = t;
      try { localStorage.setItem("pa-theme", t); } catch (e) { /* none */ }
      $$(".chart").forEach(c => c._draw && c._draw());
    });
    PA.hud();
    window.addEventListener("hashchange", route);
    route();
  }
  PP.P = P;
  boot();
})();
