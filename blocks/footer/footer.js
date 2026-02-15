import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Groups <p><strong> headings with their following <ul> into column divs.
 * @param {Element} section The nav section element
 */
function buildNavColumns(section) {
  const wrapper = section.querySelector('.default-content-wrapper');
  if (!wrapper) return;

  const columns = document.createElement('div');
  columns.className = 'footer-columns';
  let col = null;

  [...wrapper.children].forEach((el) => {
    const isHeading = el.tagName === 'P' && el.querySelector('strong');
    if (isHeading) {
      col = document.createElement('div');
      col.className = 'footer-column';
      const heading = document.createElement('p');
      heading.className = 'footer-column-heading';
      heading.textContent = el.textContent;
      col.append(heading);
      columns.append(col);
    } else if (col && el.tagName === 'UL') {
      col.append(el);
    }
  });

  wrapper.textContent = '';
  wrapper.append(columns);
}

/**
 * Creates the Back to Top button and prepends it to the footer.
 * @param {Element} footer The footer wrapper element
 */
function buildBackToTop(footer) {
  const btn = document.createElement('button');
  btn.className = 'footer-back-to-top';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = `<span>Back to Top</span>
    <svg width="14" height="8" viewBox="0 0 14 8" fill="none" aria-hidden="true">
      <path d="M1 7L7 1L13 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  footer.prepend(btn);
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // assign section classes: nav, legal, brand
  const classes = ['nav', 'legal', 'brand'];
  classes.forEach((c, i) => {
    const section = footer.children[i];
    if (section) section.classList.add(`footer-${c}`);
  });

  // build nav columns from heading + list pairs
  const navSection = footer.querySelector('.footer-nav');
  if (navSection) buildNavColumns(navSection);

  // add back-to-top button
  buildBackToTop(footer);

  block.append(footer);
}
