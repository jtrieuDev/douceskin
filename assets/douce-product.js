/*
  DOUCE: prev/next arrows on the main product image.
  The arrows only click Dawn's own thumbnail buttons, so media-gallery.js
  keeps handling the active image, ARIA state and variant media switching.
*/
(function () {
  const ARROW =
    '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5l7 7-7 7"/></svg>';

  function setup(root) {
    root.querySelectorAll('media-gallery').forEach((gallery) => {
      if (gallery.dataset.douceArrows) return;
      const viewer = gallery.querySelector('slider-component[id^="GalleryViewer-"]');
      const thumbnails = () => Array.from(gallery.querySelectorAll('.thumbnail-list__item button.thumbnail'));
      if (!viewer || thumbnails().length < 2) return;
      gallery.dataset.douceArrows = 'true';

      const nav = document.createElement('div');
      nav.className = 'douce-gallery-arrows';
      [
        ['prev', 'Previous image', -1],
        ['next', 'Next image', 1],
      ].forEach(([name, label, step]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `douce-gallery-arrow douce-gallery-arrow--${name}`;
        button.setAttribute('aria-label', label);
        button.innerHTML = ARROW;
        button.addEventListener('click', () => {
          const list = thumbnails();
          const current = Math.max(
            0,
            list.findIndex((thumb) => thumb.getAttribute('aria-current') === 'true')
          );
          list[(current + step + list.length) % list.length].click();
        });
        nav.appendChild(button);
      });
      viewer.appendChild(nav);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setup(document));
  } else {
    setup(document);
  }
  document.addEventListener('shopify:section:load', (event) => setup(event.target));
  // Dawn re-mounts <product-info> when it swaps to another product (combined listings).
  document.addEventListener('product-info:loaded', (event) => setup(event.target));
})();

/*
  DOUCE: purchase options (Subscribe & Save / one-time).
  Keeps the hidden `selling_plan` input of the native product form in sync
  with the selected card, and re-renders the cards when the variant changes
  (prices differ per variant) while keeping the shopper's choice.
*/
(function () {
  function sync(container) {
    const input = container.querySelector('.douce-purchase__input');
    const checked = container.querySelector('.douce-purchase__radio-input:checked');
    if (!input) return;
    const value = checked ? checked.value : '';
    input.value = value;
    input.disabled = value === '';
  }

  document.addEventListener('change', (event) => {
    if (!event.target.classList || !event.target.classList.contains('douce-purchase__radio-input')) return;
    const container = event.target.closest('.douce-purchase');
    if (container) sync(container);
  });

  function onVariantChange({ data }) {
    if (!data || !data.html || !data.sectionId) return;
    const id = `DoucePurchase-${data.sectionId}`;
    const current = document.getElementById(id);
    const fresh = data.html.getElementById(id);
    if (!current || !fresh) return;

    const previous = current.querySelector('.douce-purchase__radio-input:checked');
    const previousValue = previous ? previous.value : null;
    current.innerHTML = fresh.innerHTML;

    if (previousValue !== null) {
      const radios = Array.from(current.querySelectorAll('.douce-purchase__radio-input'));
      const match =
        radios.find((radio) => radio.value === previousValue) ||
        (previousValue !== '' ? radios.find((radio) => radio.value !== '') : null);
      if (match) match.checked = true;
    }
    sync(current);
  }

  function init() {
    document.querySelectorAll('.douce-purchase').forEach(sync);
    if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
      subscribe(PUB_SUB_EVENTS.variantChange, onVariantChange);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
