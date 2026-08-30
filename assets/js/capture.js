/*
  Result-moment capture.

  The tools stay free and ungated — this never blocks a calculation, an export, or
  a page. It appends a card at the end of the tool and only reveals it once the
  visitor has actually done work here: two edits to the inputs, or a click on an
  export/run control. Someone who lands, reads and leaves is never asked anything.

  Include per page with the tool's own slug:

    <script src="assets/js/capture.js" data-tool="safety-stock-calculator"
            data-headline="Keep this result." defer></script>

  BEFORE PROMOTING ANY TOOL PAGE: the card promises the visitor their inputs and
  the working by email. That promise is delivered by a MailerLite automation, not
  by this file — a static site cannot send mail. Create an automation on the group
  that echoes the `result_summary` custom field back to the subscriber, and add
  `source`, `entry` and `result_summary` as custom fields, or the values below are
  posted and silently discarded. Same caveat as the workbook on ramadan-pack.html.
*/
(() => {
  const script = document.currentScript
    || document.querySelector('script[src*="capture.js"]');
  const anchor = document.querySelector('section.vb-author');

  if (!script || !anchor) return;

  const tool = script.dataset.tool;
  if (!tool) return;

  const headline = script.dataset.headline || 'Keep this result.';
  const blurb = script.dataset.blurb
    || 'Your inputs and the working, sent over — plus The Corridor, one corridor decision a week.';

  const ENDPOINT = 'https://assets.mailerlite.com/jsonp/2475995/forms/191521736629421236/subscribe';
  const STORE_KEY = 'vb_capture_done';
  const REVEAL_AFTER_EDITS = 2;

  // Someone who already subscribed should never see the ask again.
  const alreadySubscribed = () => {
    try {
      return localStorage.getItem(STORE_KEY) === '1';
    } catch (error) {
      return false;
    }
  };

  const remember = () => {
    try {
      localStorage.setItem(STORE_KEY, '1');
    } catch (error) {
      /* private browsing — the card simply reappears next visit */
    }
  };

  if (alreadySubscribed()) return;

  const track = (name, label) => {
    if (typeof gtag === 'function') {
      gtag('event', name, { event_category: 'conversion', event_label: label });
    }
  };

  /* ── styles ─────────────────────────────────────────────────────────
     Every page this mounts on is dark and builds its chrome from white
     alpha, the same idiom as .vb-author. Inheriting that rather than
     importing a palette keeps the card native on all ten. */
  const style = document.createElement('style');
  style.textContent = `
.vbc{max-width:1100px;margin:0 auto;padding:0 24px;font-family:inherit;}
.vbc-card{border:1px solid rgba(255,255,255,.16);border-radius:14px;
  background:rgba(255,255,255,.04);padding:22px 24px;
  display:flex;flex-wrap:wrap;align-items:center;gap:16px 28px;
  opacity:0;transform:translateY(8px);transition:opacity .4s ease,transform .4s ease;}
.vbc-card.vbc-in{opacity:1;transform:none;}
.vbc-copy{flex:1 1 300px;min-width:0;}
.vbc-h{margin:0 0 5px;font-size:1rem;font-weight:700;letter-spacing:-.01em;}
.vbc-p{margin:0;font-size:.83rem;line-height:1.55;opacity:.72;}
.vbc-form{display:flex;flex-wrap:wrap;gap:9px;flex:1 1 320px;}
.vbc-form input[type=email]{flex:1 1 190px;min-width:0;padding:11px 14px;border-radius:9px;
  border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.28);color:inherit;
  font-family:inherit;font-size:.84rem;}
.vbc-form input[type=email]::placeholder{color:currentColor;opacity:.42;}
.vbc-form input[type=email]:focus{outline:2px solid rgba(255,255,255,.55);outline-offset:1px;
  border-color:rgba(255,255,255,.4);}
.vbc-form button{padding:11px 20px;border-radius:9px;border:0;cursor:pointer;
  background:rgba(255,255,255,.92);color:#0a1119;
  font-family:inherit;font-size:.82rem;font-weight:700;letter-spacing:.01em;
  transition:background .18s,transform .18s;}
.vbc-form button:hover{background:#fff;transform:translateY(-1px);}
.vbc-form button:focus-visible{outline:2px solid rgba(255,255,255,.85);outline-offset:2px;}
.vbc-fine{flex:1 1 100%;margin:0;font-size:.72rem;opacity:.5;}
.vbc-done{margin:0;font-size:.9rem;line-height:1.55;}
.vbc-done b{font-weight:700;}
@media(max-width:640px){
  .vbc{padding:0 18px;}
  .vbc-card{padding:18px;gap:14px;}
  .vbc-form button{flex:1 1 100%;}
}
@media(prefers-reduced-motion:reduce){
  .vbc-card{transition:none;transform:none;}
}`;
  document.head.appendChild(style);

  /* MailerLite's endpoint is JSONP and posts cross-origin, so the response is
     unreadable here. The form targets a hidden iframe, exactly as the Corridor
     and Ramadan pack forms do, and the card confirms optimistically. */
  let frame = document.querySelector('iframe[name="ml_iframe"]');
  if (!frame) {
    frame = document.createElement('iframe');
    frame.name = 'ml_iframe';
    frame.setAttribute('aria-hidden', 'true');
    frame.setAttribute('tabindex', '-1');
    frame.style.cssText = 'position:absolute;width:0;height:0;border:0;left:-9999px;';
    document.body.appendChild(frame);
  }

  const wrap = document.createElement('div');
  wrap.className = 'vbc';
  wrap.innerHTML = `
  <div class="vbc-card">
    <div class="vbc-copy">
      <p class="vbc-h">${headline}</p>
      <p class="vbc-p">${blurb}</p>
    </div>
    <form class="vbc-form" action="${ENDPOINT}" method="post" target="ml_iframe">
      <input type="hidden" name="fields[source]" value="tool">
      <input type="hidden" name="fields[entry]" value="${tool}">
      <input type="hidden" name="fields[result_summary]" value="">
      <input type="email" name="fields[email]" aria-label="Your email address"
             placeholder="you@company.com" required autocomplete="email">
      <button type="submit">Send it over</button>
      <p class="vbc-fine">Free. No account. Unsubscribe any time.</p>
    </form>
  </div>`;
  anchor.parentNode.insertBefore(wrap, anchor);

  const card = wrap.querySelector('.vbc-card');
  const form = wrap.querySelector('.vbc-form');
  const summaryField = wrap.querySelector('input[name="fields[result_summary]"]');

  /* ── reveal ─────────────────────────────────────────────────────────
     "Did work here" beats "arrived here". Several of these tools compute
     on load, so a mutation on the results block is not evidence of intent
     — a person changing the inputs is. */
  let edits = 0;
  let revealed = false;

  const reveal = (via) => {
    if (revealed) return;
    revealed = true;
    // Straight class flip, no rAF: the card was inserted and painted at load, and
    // rAF callbacks are parked in a backgrounded tab — someone who switches away
    // mid-calculation would come back to a card that never appeared.
    card.classList.add('vbc-in');
    track('capture_offered', `${tool}:${via}`);
  };

  /* Chrome the visitor passes through rather than works in. Deliberately not
     <header>: several of these pages put real tool controls in it — the scorecard
     runs its benchmark buttons from there — so excluding it would silence the card
     on exactly the pages that need it. Nav is links, and only buttons are counted. */
  const CHROME = 'nav,footer,.vb-author,.vbc';

  const isToolControl = (node) => node
    && !wrap.contains(node)
    && !node.closest(CHROME);

  const count = (via) => {
    if (++edits >= REVEAL_AFTER_EDITS) reveal(via);
  };

  // What the visitor actually typed is the part worth mailing back to them.
  const touched = new Set();

  const onEdit = (event) => {
    if (!isToolControl(event.target)) return;
    if (!event.target.matches('input,select,textarea')) return;
    touched.add(event.target);
    count('edit');
  };

  document.addEventListener('input', onEdit, true);
  document.addEventListener('change', onEdit, true);

  /* Not every tool here is input-driven. The scorecard has one select and runs off
     benchmark buttons; the forecasting model has no form controls at all and runs
     off category buttons. Counting only field edits would mean the card never
     appears on either, so a click on any control inside the tool counts too. */
  const INTENT = /export|download|csv|calculate|run |simulate|optimi[sz]e|generate|plan\b/i;

  document.addEventListener('click', (event) => {
    const control = event.target.closest('button,[role=button],summary');
    if (!isToolControl(control)) return;
    // An export or a run is the strongest signal on the page — take it at once.
    if (INTENT.test(control.textContent || '')) return reveal('export');
    count('interact');
  }, true);

  /* Not everything here is operable. The Fuso dashboard has no controls of its own
     — it is a dashboard to read, not a tool to run — so no amount of interaction
     watching will ever fire. Reaching the end of the page is that reader's
     equivalent, and it keeps the card from sitting there during the task itself. */
  if ('IntersectionObserver' in window) {
    const seen = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      seen.disconnect();
      reveal('scroll');
    }, { threshold: 0.6 });
    seen.observe(card);
  } else {
    reveal('nofallback');
  }

  /* ── submit ─────────────────────────────────────────────────────────
     Scrape whatever the visitor typed into the tool so the welcome mail can
     echo their own numbers back. Labels where the page provides them, the
     field name otherwise. Capped so a large form cannot blow the field. */
  /* These pages are hand-written and label their fields every which way — some with
     label[for], some with a bare <label> above the input inside a field group, some
     with nothing but a placeholder. Walk the options rather than emitting "ss-avg". */
  const labelFor = (field) => {
    const byFor = field.id && document.querySelector(`label[for="${CSS.escape(field.id)}"]`);
    const wrapping = field.closest('label');
    const grouped = field.parentElement?.querySelector('label');
    const text = (byFor || wrapping || grouped)?.textContent;
    return (text || field.getAttribute('aria-label') || field.placeholder
      || field.name || field.id || '').replace(/\s+/g, ' ').trim();
  };

  const summarise = () => {
    // Prefer the fields they edited; fall back to everything for button-driven tools.
    let fields = [...touched];
    if (!fields.length) {
      fields = [...document.querySelectorAll('input,select,textarea')]
        .filter((field) => isToolControl(field));
    }

    const parts = [];
    fields.forEach((field) => {
      if (field.type === 'hidden' || field.type === 'submit') return;
      if ((field.type === 'checkbox' || field.type === 'radio') && !field.checked) return;

      const value = (field.value || '').trim();
      const name = labelFor(field);
      if (!value || !name) return;
      parts.push(`${name}: ${value}`);
    });
    return parts.join(' | ').slice(0, 900);
  };

  form.addEventListener('submit', () => {
    summaryField.value = summarise();
    track('newsletter_signup', tool);
    remember();

    // The iframe swallows the response, so confirm on our own terms.
    window.setTimeout(() => {
      card.innerHTML = `<p class="vbc-done"><b>On its way.</b> Check your inbox —
        and your spam folder, once, so the next one lands where it should.</p>`;
    }, 350);
  });
})();
