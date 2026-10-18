(function(){
'use strict';
var D=JSON.parse(document.getElementById('academy-data').textContent);
var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function $(s,r){return (r||document).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function track(n,p){if(window.vbAnalytics&&window.vbAnalytics.track)window.vbAnalytics.track(n,p||{});else if(window.gtag)window.gtag('event',n,p||{})}
function mmss(s){s=Math.max(0,Math.floor(s));return ('0'+Math.floor(s/60)).slice(-2)+':'+('0'+s%60).slice(-2)}
function replay(el,cls){el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls)}

/* hero reel: agenda follows the reel's four acts */
var reel=$('[data-reel]'),agenda=$$('[data-agenda]'),cuts=[2.6,11.1,19.6,28.1];
if(reel){
  var cur=-1;
  reel.addEventListener('timeupdate',function(){var t=reel.currentTime,i=-1;cuts.forEach(function(c,k){if(t>=c)i=k});if(i!==cur){cur=i;agenda.forEach(function(a,k){a.classList.toggle('on',k===i)})}});
  if(reduce){reel.removeAttribute('autoplay');reel.pause()}
  var tg=$('[data-reel-toggle]');
  function sync(){tg.textContent=reel.paused?'PLAY':'PAUSE';tg.setAttribute('aria-pressed',reel.paused?'true':'false')}
  tg.addEventListener('click',function(){if(reel.paused)reel.play();else reel.pause();sync()});
  reel.addEventListener('play',sync);reel.addEventListener('pause',sync);sync();
}

/* readiness check */
var LEVELS=[[0,'Foundation track','Start at the beginning. Your experience gives you context; the modules give you the vocabulary and the numbers.'],[4,'Bridge track','You have real foundations. Close the specific gaps below, then move straight to AI workflows and interview drills.'],[7,'Interview-ready sprint','You can do the work. Focus on AI-assisted workflows, sharper stories and a recorded mock.']];
var boxes=$$('[data-check] input');
function score(){
  var n=boxes.filter(function(b){return b.checked}).length,lv=LEVELS[0];
  LEVELS.forEach(function(l){if(n>=l[0])lv=l});
  $('[data-score]').textContent=n;$('[data-meter]').style.width=(n/boxes.length*100)+'%';
  $('[data-level]').textContent=lv[1];$('[data-level-copy]').textContent=lv[2];
  var gaps=[];boxes.forEach(function(b){var m=+b.getAttribute('data-mod');if(!b.checked&&gaps.indexOf(m)<0)gaps.push(m)});
  if(n<4)gaps=[0,1].concat(gaps.filter(function(g){return g>1}));
  gaps=gaps.slice(0,3);if(!gaps.length)gaps=[7];
  $('[data-start]').innerHTML=gaps.map(function(g){var m=D.modules[g];return '<li><b>'+m.n+'</b>'+esc(m.t)+'</li>'}).join('');
  var f=$('#score');if(f)f.value=n+' / '+boxes.length+' — '+lv[1];
}
boxes.forEach(function(b){b.addEventListener('change',function(){score();track('academy_readiness',{score:boxes.filter(function(x){return x.checked}).length})})});score();

/* workflow before / after */
var WF={before:{title:'The traditional week.',copy:'Most of the effort goes into moving data. The thinking gets squeezed into the last hour before the meeting.',note:'MOST TIME: MOVING DATA',total:'~6 hrs',rows:[['MON','Export four ERP reports by hand','manual'],['MON','Copy-paste into the master workbook','manual'],['TUE','Fix broken lookups and duplicates','manual'],['TUE','Rebuild the pivot and charts','manual'],['WED','Write commentary an hour before the meeting','rushed']]},
after:{title:'The AI-ready week.',copy:'A query refreshes the data, AI drafts the first commentary, and your hours go to checking, deciding and explaining.',note:'MOST TIME: JUDGEMENT',total:'~2 hrs',rows:[['MON','Saved query refreshes PSI by account','auto'],['MON','Reconciliation check flags mismatches','auto'],['TUE','AI drafts WoW commentary from the pivot','ai'],['TUE','You re-calculate the three numbers that matter','you'],['WED','You walk into consensus with evidence and a decision','you']]}};
var tagLabel={manual:'MANUAL',rushed:'RUSHED',auto:'AUTOMATED',ai:'AI DRAFT',you:'YOU'};
function wf(k){var d=WF[k];
  $('[data-shift-title]').textContent=d.title;$('[data-shift-copy]').textContent=d.copy;$('[data-wf-note]').textContent=d.note;$('[data-wf-total]').textContent=d.total+' / week';
  $('[data-workflow]').innerHTML=d.rows.map(function(r,i){var c=r[2]==='ai'?'ai':(r[2]==='you'?'you':'');return '<li style="animation-delay:'+(i*70)+'ms"><span>'+r[0]+'</span>'+esc(r[1])+'<em class="'+c+'">'+tagLabel[r[2]]+'</em></li>'}).join('');
  $$('[data-shift]').forEach(function(b){var on=b.getAttribute('data-shift')===k;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on?'true':'false')});
}
$$('[data-shift]').forEach(function(b){b.addEventListener('click',function(){wf(b.getAttribute('data-shift'));track('academy_workflow_toggle',{view:b.getAttribute('data-shift')})})});wf('before');

/* curriculum */
var panel=$('[data-module-panel]');
function showModule(i,anim){var m=D.modules[i];
  $$('[data-module]').forEach(function(b){b.setAttribute('aria-selected',+b.getAttribute('data-module')===i?'true':'false')});
  panel.setAttribute('aria-labelledby','mod-tab-'+m.n);
  var res=m.r.map(function(r){return '<li><b style="color:var(--paper)">'+esc(r[0])+':</b> '+esc(r[1])+'</li>'}).join('');
  var links='<a class="text-link" href="#library">Open the playbooks →</a><a class="text-link" href="#interview">Practise the questions →</a>';
  if(m.v)links='<a class="btn btn-primary" href="#cinema" data-jump="'+m.v[0]+'" data-jt="'+m.v[1]+'">Watch the lesson chapter ↘</a>'+links;
  panel.innerHTML='<p class="case-no">MODULE '+m.n+' / '+esc(m.t.toUpperCase())+'</p><h3>'+esc(m.h)+'</h3><p class="summary">'+esc(m.s)+'</p><div class="module-cols"><div><p class="micro">Concepts</p><ul>'+m.c.map(function(c){return '<li>'+esc(c)+'</li>'}).join('')+'</ul></div><div><p class="micro">Resources</p><ul>'+res+'</ul></div><div><p class="micro">AI exercise · verified by you</p><p>'+esc(m.ai)+'</p></div><div><p class="micro">You leave with</p><p>'+esc(m.o)+'</p></div></div><div class="module-links">'+links+'</div>';
  if(anim&&!reduce)replay(panel,'swap');
}
$$('[data-module]').forEach(function(b){b.addEventListener('click',function(){showModule(+b.getAttribute('data-module'),true);track('academy_module',{module:b.getAttribute('data-module')})});
  b.addEventListener('keydown',function(e){var i=+b.getAttribute('data-module'),n=D.modules.length,j=null;if(e.key==='ArrowDown'||e.key==='ArrowRight')j=(i+1)%n;if(e.key==='ArrowUp'||e.key==='ArrowLeft')j=(i-1+n)%n;if(j!==null){e.preventDefault();showModule(j,true);$('[data-module="'+j+'"]').focus()}})});
showModule(0,false);

/* lesson cinema */
var LESSONS={fundamentals:{src:'./assets/video/supply-chain-fundamentals-metrics-mastery.mp4',vtt:'./assets/video/fundamentals-chapters.vtt',poster:'./assets/video/fundamentals-poster.webp',label:'LESSON 01 / FUNDAMENTALS',time:'06:45',dur:405,ch:D.fund,cap:'<cite>Supply Chain Fundamentals: Metrics, Alignment and Mastery</cite> — inventory risk, ABC, S&amp;OP, OTIF, turns, accuracy vs bias, a live reorder-point simulation and STAR interview answers.'},
architecture:{src:'../careers/assets/mentoring/architecture-of-supply-end-to-end-chain.mp4',vtt:'./assets/video/architecture-chapters.vtt',poster:'./assets/video/architecture-poster.webp',label:'LESSON 02 / ARCHITECTURE',time:'09:57',dur:597,ch:D.arch,cap:'<cite>The Architecture of Supply: Engineering the End-to-End Chain</cite> — the three flows, equilibrium, forecasting, bullwhip, ABC, replenishment, safety stock and working capital.'}};
var vid=$('[data-lesson-video]'),chList=$('[data-chapters]'),wipe=$('[data-wipe]'),curLesson='fundamentals';
function renderCh(L){chList.innerHTML=L.ch.map(function(c){return '<li><button type="button" data-t="'+c[0]+'"><span>'+mmss(c[0])+'</span>'+esc(c[1])+'<i class="prog"></i></button></li>'}).join('')}
function loadLesson(k,t,play){
  var L=LESSONS[k];
  $$('[data-lesson]').forEach(function(b){b.setAttribute('aria-selected',b.getAttribute('data-lesson')===k?'true':'false')});
  if(k===curLesson&&vid.currentSrc){if(t!=null){vid.currentTime=t;if(play)vid.play()}return}
  curLesson=k;
  function swap(){
    vid.pause();vid.innerHTML='<source src="'+L.src+'" type="video/mp4"/><track kind="chapters" srclang="en" src="'+L.vtt+'" default/>';vid.poster=L.poster;vid.load();
    $('[data-lesson-label]').textContent=L.label;$('[data-lesson-time]').textContent=L.time;$('[data-lesson-caption]').innerHTML=L.cap;renderCh(L);
    if(t!=null){vid.addEventListener('loadedmetadata',function h(){vid.removeEventListener('loadedmetadata',h);vid.currentTime=t;if(play)vid.play()})}
  }
  if(reduce){swap();return}
  replay(wipe,'run');setTimeout(swap,340);
}
$$('[data-lesson]').forEach(function(b){b.addEventListener('click',function(){loadLesson(b.getAttribute('data-lesson'));track('academy_lesson',{lesson:b.getAttribute('data-lesson')})})});
chList.addEventListener('click',function(e){var b=e.target.closest('button[data-t]');if(!b)return;vid.currentTime=+b.getAttribute('data-t');vid.play();track('academy_chapter',{lesson:curLesson,t:+b.getAttribute('data-t')})});
vid.addEventListener('timeupdate',function(){var L=LESSONS[curLesson],t=vid.currentTime,btns=$$('button[data-t]',chList);
  btns.forEach(function(b,i){var s=L.ch[i][0],e=i+1<L.ch.length?L.ch[i+1][0]:L.dur,on=t>=s&&t<e;b.classList.toggle('on',on);b.querySelector('.prog').style.width=on?((t-s)/(e-s)*100)+'%':'0'})});
document.addEventListener('click',function(e){var a=e.target.closest('[data-jump]');if(!a)return;e.preventDefault();$('#cinema').scrollIntoView({behavior:reduce?'auto':'smooth'});loadLesson(a.getAttribute('data-jump'),+a.getAttribute('data-jt'),true)});

/* playbook decks */
function range(a,b){var r=[];for(var i=a;i<=b;i++)r.push(i);return r}
var DECKS={practitioner:{dir:'practitioner',pages:range(1,15),name:'Practitioner’s Playbook',copy:'Inventory strategy, ABC, S&amp;OP, the practitioner’s scorecard, KPI math and traps, a live reorder-point simulation, and the interview playbook.',dl:'./assets/docs/supply-chain-practitioner-playbook.pdf'},
developer:{dir:'developer',pages:range(2,15),name:'PSI & BizOps Playbook',copy:'Sell-in vs sell-through, the 24-week rolling horizon, PSI ledger, weeks of supply, demand cleaning, MAPE vs WAPE vs bias, reconciliation, allocation levers and the honest-bridge interview framework — each with a “developer translation”.',dl:null}};
var deck='practitioner',idx=0,stage=$('[data-stage]'),img=$('[data-slide]'),thumbsEl=$('[data-thumbs]');
function src(d,i){return './assets/playbooks/'+DECKS[d].dir+'/'+('0'+DECKS[d].pages[i]).slice(-2)+'.webp'}
function renderThumbs(){thumbsEl.innerHTML=DECKS[deck].pages.map(function(p,k){return '<button type="button" data-i="'+k+'" aria-label="Slide '+(k+1)+'"><img src="'+src(deck,k)+'" alt="" loading="lazy" width="200" height="112"/></button>'}).join('')}
function go(i,dir){var n=DECKS[deck].pages.length;i=(i+n)%n;var changed=i!==idx;idx=i;
  var set=function(){img.src=src(deck,idx);img.alt='Slide '+(idx+1)+' of the '+DECKS[deck].name;$('[data-count]').textContent=('0'+(idx+1)).slice(-2)+' / '+('0'+n).slice(-2);$$('button',thumbsEl).forEach(function(b){b.classList.toggle('on',+b.getAttribute('data-i')===idx)})};
  if(reduce||!changed){set();return}
  img.classList.add('out');setTimeout(function(){set();img.classList.remove('out');img.classList.add(dir<0?'in-prev':'in-next');requestAnimationFrame(function(){requestAnimationFrame(function(){img.classList.remove('in-prev','in-next')})})},260);
  var pre=new Image();pre.src=src(deck,(idx+1)%n);
}
function loadDeck(k){deck=k;idx=-1;renderThumbs();go(0,1);var d=DECKS[k];$('[data-deck-copy]').innerHTML=d.copy;var dl=$('[data-deck-dl]');if(d.dl){dl.hidden=false;dl.href=d.dl}else dl.hidden=true;
  $$('[data-deck]').forEach(function(b){b.setAttribute('aria-selected',b.getAttribute('data-deck')===k?'true':'false')})}
$$('[data-deck]').forEach(function(b){b.addEventListener('click',function(){loadDeck(b.getAttribute('data-deck'));track('academy_deck',{deck:b.getAttribute('data-deck')})})});
thumbsEl.addEventListener('click',function(e){var b=e.target.closest('button[data-i]');if(b){var i=+b.getAttribute('data-i');go(i,i<idx?-1:1)}});
$('[data-prev]').addEventListener('click',function(){go(idx-1,-1)});$('[data-next]').addEventListener('click',function(){go(idx+1,1)});
stage.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();go(idx+1,1)}if(e.key==='ArrowLeft'){e.preventDefault();go(idx-1,-1)}});
$('[data-full]').addEventListener('click',function(){if(document.fullscreenElement)document.exitFullscreen();else if(stage.requestFullscreen)stage.requestFullscreen()});
var sx=null;stage.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});stage.addEventListener('touchend',function(e){if(sx===null)return;var dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>40)go(idx+(dx<0?1:-1),dx<0?1:-1);sx=null});
idx=-1;go(0,1);

/* ROP simulator */
var rop=$('[data-rop]'),BASE={d:40,lt:5,ss:60,oh:180,oo:30,bo:10},curved=0;
function v(k){return Math.max(0,+$('[data-in="'+k+'"]',rop).value||0)}
function calcRop(){var d=v('d'),lt=v('lt'),ss=v('ss'),ltd=d*lt,r=ltd+ss,pos=v('oh')+v('oo')-v('bo'),cover=d?pos/d:0,el=$('[data-verdict]');
  $('[data-out="ltd"]').textContent=ltd;$('[data-out="rop"]').textContent=r;$('[data-out="pos"]').textContent=pos;$('[data-out="cover"]').textContent=d?cover.toFixed(1)+' days':'—';
  var gap=r-pos;
  if(curved&&pos<r){el.className='verdict alert';el.innerHTML='Reorder now — and act on the delay.<small>Lead time is now '+lt+' days (+'+curved+'): '+(d*curved)+' extra units of demand before arrival. Position '+pos+' vs reorder point '+r+'. Expedite freight, protect top customers, or secure alternate supply.</small>'}
  else if(pos<r){el.className='verdict go';el.innerHTML='Trigger the reorder.<small>Inventory position '+pos+' is '+gap+' below the reorder point of '+r+'.</small>'}
  else{el.className='verdict hold';el.innerHTML='Hold — no order today.<small>Position '+pos+' covers the reorder point of '+r+' by '+(pos-r)+' units.</small>'}
}
$$('input',rop).forEach(function(i){i.addEventListener('input',calcRop)});
$('[data-curve]',rop).addEventListener('click',function(){var l=$('[data-in="lt"]',rop);l.value=v('lt')+2;curved+=2;calcRop();track('academy_sim_curveball')});
$('[data-reset]',rop).addEventListener('click',function(){Object.keys(BASE).forEach(function(k){$('[data-in="'+k+'"]',rop).value=BASE[k]});curved=0;calcRop()});
calcRop();

/* accuracy simulator */
var acc=$('[data-acc]');
function calcAcc(){var rows=$$('tbody tr',acc),sa=0,sae=0,se=0,ape=0,n=0,worst=null;
  rows.forEach(function(r){var f=+$('[data-f]',r).value||0,a=+$('[data-a]',r).value||0,e=a?Math.abs(f-a)/a:0;sa+=a;sae+=Math.abs(f-a);se+=f-a;if(a){ape+=e;n++}$('.err',r).textContent=a?(e*100).toFixed(1)+'%':'—';$('.err',r).style.color=e>1?'#f2b8a8':'';if(!worst||e>worst.e)worst={e:e,m:r.cells[0].textContent}});
  var mape=n?ape/n*100:0,wape=sa?sae/sa*100:0,bias=sa?se/sa*100:0;
  $('[data-mape]').textContent=mape.toFixed(1)+'%';$('[data-wape]').textContent=wape.toFixed(1)+'%';$('[data-bias]').textContent=(bias>0?'+':'')+bias.toFixed(1)+'%';
  $('[data-acc-lesson]').innerHTML=mape>wape*2?'<b>MAPE is being skewed.</b> Model '+esc(worst.m)+' is a tiny item with a huge percentage error, so it dominates the simple average. WAPE weights by volume and tells you the business impact.':(Math.abs(bias)>5?'<b>Watch the bias.</b> '+(bias>0?'Consistent over-forecasting builds aged stock':'Consistent under-forecasting builds shortages')+' even when accuracy looks acceptable.':'<b>Balanced.</b> Accuracy and bias tell a consistent story here — now check it at SKU level, not just the total.');
}
$$('input',acc).forEach(function(i){i.addEventListener('input',calcAcc)});calcAcc();

/* copy prompts */
$$('[data-copy]').forEach(function(b){b.addEventListener('click',function(){var t=b.parentNode.querySelector('pre').textContent;
  var done=function(){b.textContent='COPIED ✓';b.classList.add('done');setTimeout(function(){b.textContent='COPY PROMPT';b.classList.remove('done')},1800)};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(done,function(){});else{var ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');done()}catch(x){}ta.remove()}
  track('academy_prompt_copy')})});

/* S&OP rhythm */
var sp=$('[data-step-panel]');
function step(i,anim){var s=D.sop[i];$$('[data-step]').forEach(function(b){b.setAttribute('aria-selected',+b.getAttribute('data-step')===i?'true':'false')});
  sp.innerHTML='<div><p class="micro">'+esc(s[0])+'</p><h3>'+esc(s[1])+'</h3></div><div><p class="micro">Owner</p><p>'+esc(s[2])+'</p></div><div><p class="micro">Required output · completion check</p><p>'+esc(s[3])+'</p></div>';
  if(anim&&!reduce)replay(sp,'swap')}
$$('[data-step]').forEach(function(b){b.addEventListener('click',function(){step(+b.getAttribute('data-step'),true)})});step(6,false);

/* interview filters */
var qs=$$('.q');
$$('[data-filter]').forEach(function(b){b.addEventListener('click',function(){var f=b.getAttribute('data-filter'),n=0;
  $$('[data-filter]').forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});
  qs.forEach(function(q,i){var show=f==='all'||q.getAttribute('data-track')===f;q.hidden=!show;if(show){n++;if(!reduce){q.style.animationDelay=Math.min(n,10)*35+'ms';replay(q,'enter')}}});
  $('[data-qcount]').textContent=n+' QUESTIONS';track('academy_interview_filter',{track:f})})});

/* join form */
var form=$('#join-form');
form.addEventListener('submit',function(e){e.preventDefault();var g=function(id){return form.elements[id].value.trim()},err=$('#form-error');
  var ok=g('name')&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(g('email'))&&g('current')&&g('years');err.hidden=!!ok;if(!ok)return;
  var body='Name: '+g('name')+'\nEmail: '+g('email')+'\nCurrent role: '+g('current')+'\nYears of experience: '+g('years')+'\nGoal: '+(g('goal')||'—')+'\nReadiness check: '+(g('score')||'not taken');
  track('academy_join_submit');window.location.href='mailto:vinayakbhadani@zohomail.in?subject='+encodeURIComponent('AI-Ready Academy fit check — '+g('name'))+'&body='+encodeURIComponent(body)});

/* reveal */
var items=$$('.reveal');
if('IntersectionObserver' in window&&!reduce){var ob=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-visible');ob.unobserve(e.target)}})},{threshold:.1});items.forEach(function(i){ob.observe(i)})}
else items.forEach(function(i){i.classList.add('is-visible')});
track('academy_view');
})();
