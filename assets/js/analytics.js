(function (window, document) {
  'use strict';

  var EVENT_RE = /^[a-z][a-z0-9_]{1,39}$/;
  var BLOCKED_KEY_RE = /^(email|email_address|phone|telephone|full_name|first_name|last_name|message|street_address|form_value|input_value)$/i;
  var videoStates = typeof WeakMap === 'function' ? new WeakMap() : null;

  function safeValue(value) {
    if (typeof value === 'boolean' || typeof value === 'number') return value;
    if (typeof value !== 'string') return undefined;
    return value.replace(/\s+/g, ' ').trim().slice(0, 100);
  }

  function cleanParams(params) {
    var clean = {};
    Object.keys(params || {}).forEach(function (key) {
      if (BLOCKED_KEY_RE.test(key)) return;
      var value = safeValue(params[key]);
      if (value !== undefined && value !== '') clean[key] = value;
    });
    return clean;
  }

  function track(eventName, params) {
    if (!EVENT_RE.test(eventName || '')) return false;
    var payload = cleanParams(params);
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, payload);
      return true;
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: eventName }, payload));
    return true;
  }

  function locationFor(element) {
    if (!element) return 'unknown';
    if (element.dataset && element.dataset.analyticsLocation) return element.dataset.analyticsLocation;
    var region = element.closest && element.closest('[data-analytics-region],section,header,footer,nav');
    if (!region) return 'page';
    return (region.dataset && region.dataset.analyticsRegion) || region.id || region.tagName.toLowerCase();
  }

  function observeView(element, eventName, params, threshold) {
    if (!element) return null;
    if (!('IntersectionObserver' in window)) {
      track(eventName, params);
      return null;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        track(eventName, params);
        observer.disconnect();
      });
    }, { threshold: threshold || 0.25 });
    observer.observe(element);
    return observer;
  }

  function freshVideoState() {
    return { started: false, completed: false, milestones: {} };
  }

  function getVideoState(video) {
    if (videoStates) {
      if (!videoStates.has(video)) videoStates.set(video, freshVideoState());
      return videoStates.get(video);
    }
    if (!video.__vbAnalyticsState) video.__vbAnalyticsState = freshVideoState();
    return video.__vbAnalyticsState;
  }

  function videoParams(video, extra) {
    return Object.assign({
      video_id: video.dataset.videoId || video.id || 'portfolio_video',
      player_location: video.dataset.playerLocation || 'page'
    }, extra || {});
  }

  function resetVideo(video) {
    if (!video) return;
    if (videoStates) videoStates.set(video, freshVideoState());
    else video.__vbAnalyticsState = freshVideoState();
  }

  function bindVideo(video) {
    if (!video || video.dataset.analyticsBound === 'true') return;
    video.dataset.analyticsBound = 'true';

    video.addEventListener('play', function () {
      if (video.dataset.analyticsReady === 'false') return;
      var state = getVideoState(video);
      if (state.started) return;
      state.started = true;
      track('video_start', videoParams(video));
    });

    video.addEventListener('timeupdate', function () {
      if (video.dataset.analyticsReady === 'false' || !video.duration || !isFinite(video.duration)) return;
      var state = getVideoState(video);
      if (!state.started) return;
      var progress = video.currentTime / video.duration * 100;
      [25, 50, 75].forEach(function (milestone) {
        if (progress < milestone || state.milestones[milestone]) return;
        state.milestones[milestone] = true;
        track('video_progress', videoParams(video, { progress_percent: milestone }));
      });
    });

    video.addEventListener('ended', function () {
      if (video.dataset.analyticsReady === 'false') return;
      var state = getVideoState(video);
      if (state.completed) return;
      state.completed = true;
      track('video_complete', videoParams(video));
    });

    video.addEventListener('error', function () {
      if (video.dataset.analyticsReady === 'false') return;
      track('video_error', videoParams(video, {
        error_code: video.error && video.error.code ? video.error.code : 0
      }));
    });
  }

  document.addEventListener('click', function (event) {
    var element = event.target.closest && event.target.closest('[data-track-event],a');
    if (!element) return;

    var explicitEvent = element.dataset && element.dataset.trackEvent;
    if (explicitEvent) {
      track(explicitEvent, {
        project_name: element.dataset.projectName,
        project_type: element.dataset.projectType,
        cta_name: element.dataset.ctaName || (element.textContent || '').trim(),
        cta_location: locationFor(element)
      });
      return;
    }

    if (element.tagName !== 'A') return;
    var href = element.getAttribute('href') || '';
    var common = {
      cta_name: element.dataset.ctaName || (element.textContent || '').trim(),
      cta_location: locationFor(element)
    };
    if (/Vinayak-Bhadani-Resume-Demand-Planning-AI-Supply-Chain\.pdf(?:$|[?#])/i.test(href)) {
      track('cv_download', common);
    } else if (/linkedin\.com/i.test(href)) {
      track('linkedin_click', common);
    } else if (/^mailto:/i.test(href)) {
      track('email_click', common);
    } else if (/wa\.me|whatsapp/i.test(href)) {
      track('whatsapp_click', common);
    } else {
      var card = element.closest && element.closest('.pf-card,[data-project-name]');
      if (!card) return;
      var heading = card.querySelector('.pj-title,.pc-title,h3');
      var projectName = card.dataset.projectName || (heading && heading.textContent || 'portfolio_project').trim();
      var projectType = card.dataset.projectType || card.dataset.cat || 'portfolio';
      var eventName = /github\.com/i.test(href) ? 'repo_open' : (/^https?:/i.test(href) ? 'live_demo_open' : 'project_open');
      track(eventName, {
        project_name: projectName,
        project_type: projectType,
        cta_name: common.cta_name,
        cta_location: common.cta_location
      });
    }
  }, true);

  window.vbAnalytics = {
    bindVideo: bindVideo,
    locationFor: locationFor,
    observeView: observeView,
    resetVideo: resetVideo,
    track: track
  };
})(window, document);
