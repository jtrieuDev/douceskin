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
