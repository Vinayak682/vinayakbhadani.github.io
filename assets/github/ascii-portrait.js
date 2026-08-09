(() => {
  const card = document.querySelector('.ascii-portrait');
  const liveLayer = card?.querySelector('[data-ascii-source]');

  if (!card || !liveLayer) return;

  let observer;

  const replay = () => {
    card.classList.remove('ascii-entered');
    void card.offsetWidth;
    card.classList.add('ascii-entered');
  };

  const prepareSvg = (markup) => {
    const svgDocument = new DOMParser().parseFromString(markup, 'image/svg+xml');
    if (svgDocument.querySelector('parsererror')) return null;

    const sourceSvg = svgDocument.documentElement;
    sourceSvg.querySelectorAll('style, script, foreignObject').forEach((node) => node.remove());
    sourceSvg.removeAttribute('width');
    sourceSvg.removeAttribute('height');
    sourceSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    sourceSvg.setAttribute('focusable', 'false');
    sourceSvg.setAttribute('aria-hidden', 'true');

    sourceSvg.querySelectorAll('text').forEach((row, index) => {
      row.removeAttribute('class');
      row.removeAttribute('style');
      row.classList.add('github-ascii-row');
      row.style.setProperty('--github-ascii-delay', `${(index * 0.055).toFixed(3)}s`);
    });

    return document.importNode(sourceSvg, true);
  };

  const mount = async () => {
    try {
      const response = await fetch(liveLayer.dataset.asciiSource, { cache: 'force-cache' });
      if (!response.ok) return;

      const svg = prepareSvg(await response.text());
      if (!svg) return;

      liveLayer.replaceChildren(svg);
      card.classList.add('ascii-ready');

      if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) replay();
          else card.classList.remove('ascii-entered');
        }, { threshold: 0.16, rootMargin: '12% 0px' });
        observer.observe(card);
      } else {
        replay();
      }
    } catch {
      card.classList.add('ascii-static');
    }
  };

  window.addEventListener('pagehide', () => observer?.disconnect(), { once: true });
  mount();
})();
