/**
 * For the promo variant, adds quote icon before the CTA link
 * and marks the footnote paragraph.
 * @param {Element} block The columns block
 */
function decoratePromoVariant(block) {
  const textCol = block.querySelector('div > div:not(.columns-img-col)');
  if (!textCol) return;

  // Find the CTA link (strong > a pattern)
  const ctaStrong = textCol.querySelector('p > strong > a');
  if (ctaStrong) {
    const ctaParagraph = ctaStrong.closest('p');
    ctaParagraph.classList.add('columns-promo-cta');

    // Add coral quote marks icon before the CTA
    const quoteIcon = document.createElement('span');
    quoteIcon.className = 'columns-promo-quote';
    quoteIcon.setAttribute('aria-hidden', 'true');
    quoteIcon.innerHTML = `<svg width="40" height="32" viewBox="0 0 40 32" fill="none">
      <path d="M0 32V19.2C0 15.47 0.53 12.13 1.6 9.2C2.67 6.27 4.67 3.2 7.6 0L14.4 4.8C12.27 7.47 10.8 9.87 10 12C9.2 14.13 8.8 16.4 8.8 18.8H16V32H0ZM24 32V19.2C24 15.47 24.53 12.13 25.6 9.2C26.67 6.27 28.67 3.2 31.6 0L38.4 4.8C36.27 7.47 34.8 9.87 34 12C33.2 14.13 32.8 16.4 32.8 18.8H40V32H24Z" fill="currentColor"/>
    </svg>`;
    ctaParagraph.before(quoteIcon);
  }

  // Mark footnote (last <p> with <em>)
  const paragraphs = textCol.querySelectorAll('p');
  const lastP = paragraphs[paragraphs.length - 1];
  if (lastP && lastP.querySelector('em')) {
    lastP.classList.add('columns-promo-footnote');
  }
}

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  // Decorate promo variant
  if (block.classList.contains('promo')) {
    decoratePromoVariant(block);
  }
}
