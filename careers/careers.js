(function(){
  'use strict';

  var paths={
    resume:{title:'Resume evidence rebuild',copy:'Turn vague responsibilities into defensible evidence matched to the roles you want.',items:['Target-role gap review','Resume + LinkedIn rebuild','Defend-every-line interview drill'],subject:'Resume evidence rebuild'},
    interview:{title:'Role-specific interview sprint',copy:'Use the actual job description and interview date to focus every hour of preparation.',items:['JD teardown and study plan','Excel practice + question bank','Live mock with written feedback'],subject:'Interview preparation sprint'},
    switch:{title:'Supply Chain Career Lab',copy:'Build planning knowledge, practical artifacts and credible interview stories in a structured sequence.',items:['Eight hands-on modules','Planning tools + portfolio project','Career materials alongside'],subject:'Supply Chain Career Lab'}
  };

  function track(name,params){
    if(window.vbAnalytics&&window.vbAnalytics.track)window.vbAnalytics.track(name,params||{});
    else if(window.gtag)window.gtag('event',name,params||{});
  }

  document.querySelectorAll('[data-path]').forEach(function(button){
    button.addEventListener('click',function(){
      var key=button.getAttribute('data-path'),data=paths[key];
      document.querySelectorAll('[data-path]').forEach(function(item){item.setAttribute('aria-selected',item===button?'true':'false')});
      document.querySelector('[data-path-title]').textContent=data.title;
      document.querySelector('[data-path-copy]').textContent=data.copy;
      document.querySelector('[data-path-list]').innerHTML=data.items.map(function(item){return '<li>'+item+'</li>'}).join('');
      document.querySelector('[data-path-link]').setAttribute('data-selected-path',data.subject);
      track('careers_path_selected',{path:key});
    });
  });

  var resume={
    before:{state:'BEFORE',summary:'Hard-working professional with experience in inventory and Excel, seeking a challenging role.',items:['Responsible for inventory reports.','Worked on SAP and Excel.','Handled stock issues with stores.'],note:'Problem: responsibilities are listed, but the work cannot be pictured or verified.'},
    after:{state:'AFTER',summary:'Inventory coordinator with 2 years in retail distribution, moving into demand planning with evidence built from real work.',items:['Built a weekly stock-cover report in Excel from SAP exports for 12 store managers.','Reconciled system stock against cycle counts and traced the cause of each gap.','Reported items aged over 90 days so the buying team could plan markdowns.'],note:'Change: tools, users and decisions are visible. No employer, title or number was invented.'}
  };
  document.querySelectorAll('[data-resume-view]').forEach(function(button){
    button.addEventListener('click',function(){
      var key=button.getAttribute('data-resume-view'),data=resume[key],sheet=document.querySelector('[data-resume-sheet]');
      document.querySelectorAll('[data-resume-view]').forEach(function(item){var active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',active?'true':'false')});
      document.querySelector('[data-sheet-state]').textContent=data.state;
      document.querySelector('[data-sheet-summary]').textContent=data.summary;
      document.querySelector('[data-sheet-list]').innerHTML=data.items.map(function(item){return '<li>'+item+'</li>'}).join('');
      document.querySelector('[data-sheet-note]').textContent=data.note;
      sheet.classList.toggle('after-view',key==='after');sheet.classList.toggle('before-view',key==='before');
      track('careers_resume_example_viewed',{view:key});
    });
  });

  var form=document.getElementById('fit-form');
  if(form)form.addEventListener('submit',function(event){
    event.preventDefault();
    var error=document.getElementById('form-error');
    if(!form.checkValidity()){error.hidden=false;form.querySelector(':invalid').focus();return}
    error.hidden=true;
    var data=new FormData(form),selected=document.querySelector('[data-selected-path]');
    var subject='Career fit check — '+data.get('role');
    var body=['Name: '+data.get('name'),'Email: '+data.get('email'),'Target role(s): '+data.get('role'),'Country / market: '+data.get('market'),'Interview date or timeline: '+(data.get('deadline')||'Not specified'),'Background: '+data.get('background'),'Recommended path selected: '+(selected?selected.getAttribute('data-selected-path'):'Not selected')].join('\n\n');
    track('careers_fit_check_started',{role:data.get('role'),market:data.get('market')});
    window.location.href='mailto:vinayakbhadani@zohomail.in?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  });

  document.querySelectorAll('[data-cta-name]').forEach(function(link){link.addEventListener('click',function(){track(link.getAttribute('data-cta-name'))})});
  document.querySelectorAll('[data-mentor-resource]').forEach(function(link){link.addEventListener('click',function(){track('careers_mentor_resource_opened',{resource:link.getAttribute('data-mentor-resource')})})});
  var mentorVideo=document.querySelector('[data-mentor-video]');
  if(mentorVideo){
    var mentorVideoQuarterTracked=false;
    mentorVideo.addEventListener('play',function(){track('careers_mentor_video_play')},{once:true});
    mentorVideo.addEventListener('timeupdate',function(){
      if(!mentorVideoQuarterTracked&&mentorVideo.duration&&mentorVideo.currentTime/mentorVideo.duration>=.25){
        mentorVideoQuarterTracked=true;
        track('careers_mentor_video_progress',{progress_percent:25});
      }
    });
    mentorVideo.addEventListener('ended',function(){track('careers_mentor_video_complete')},{once:true});
  }
  var items=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}})},{threshold:.12});
    items.forEach(function(item){observer.observe(item)});
  }else items.forEach(function(item){item.classList.add('is-visible')});
  track('careers_view',{content_type:'career_coaching_redesign'});
})();
