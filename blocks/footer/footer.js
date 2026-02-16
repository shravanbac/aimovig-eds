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
 * Strips button/button-container classes added by decorateButtons.
 * @param {Element} container The element to clean up
 */
function stripButtonClasses(container) {
  container.querySelectorAll('.button').forEach((btn) => { btn.className = ''; });
  container.querySelectorAll('.button-container').forEach((bc) => { bc.className = ''; });
}

/**
 * Extracts brand/copyright content from the last legal <li> into a new section.
 *
 * The footer fragment packs the last <li> with:
 *   <p><a>AdChoices</a></p>  ← stays in legal links
 *   <hr>                      ← removed (replaced by CSS border)
 *   <p>Copyright text</p>    ← moves to brand section
 *   <ul><li><picture></li></ul>  ← Aimovig logo → legal row right side
 *   <ul><li><picture></li></ul>  ← Amgen logo   → brand section right side
 *
 * @param {Element} footer The footer wrapper element
 */
function extractBrandSection(footer) {
  const legalSection = footer.querySelector('.footer-legal');
  if (!legalSection) return;

  const wrapper = legalSection.querySelector('.default-content-wrapper');
  if (!wrapper) return;

  const legalUl = wrapper.querySelector(':scope > ul');
  if (!legalUl) return;

  const lastLi = legalUl.querySelector(':scope > li:last-child');
  if (!lastLi) return;

  const hr = lastLi.querySelector('hr');
  if (!hr) return;

  // Gather all nodes after the <hr>
  const afterHr = [];
  let node = hr.nextSibling;
  while (node) {
    afterHr.push(node);
    node = node.nextSibling;
  }

  // Categorise: copyright <p> and logo <ul>s (containing <picture>)
  let copyrightP = null;
  const logoUls = [];

  afterHr.forEach((n) => {
    if (n.nodeType !== 1) return;
    if (n.tagName === 'P' && !n.querySelector('a')) copyrightP = n;
    if (n.tagName === 'UL' && n.querySelector('picture')) logoUls.push(n);
  });

  // Move Aimovig logo (first) into legal section as right-aligned element
  if (logoUls[0]) {
    const logoDiv = document.createElement('div');
    logoDiv.className = 'footer-legal-logo';
    const pic = logoUls[0].querySelector('picture');
    if (pic) logoDiv.append(pic);
    wrapper.append(logoDiv);
  }

  // Build brand section: copyright text (left) + Amgen logo (right)
  const brandSection = document.createElement('div');
  brandSection.classList.add('section', 'footer-brand');
  const brandWrapper = document.createElement('div');
  brandWrapper.className = 'default-content-wrapper';

  if (copyrightP) {
    copyrightP.classList.add('footer-copyright');
    brandWrapper.append(copyrightP);
  }

  if (logoUls[1]) {
    const logosDiv = document.createElement('div');
    logosDiv.className = 'footer-logos';
    const pic = logoUls[1].querySelector('picture');
    if (pic) logosDiv.append(pic);
    brandWrapper.append(logosDiv);
  }

  brandSection.append(brandWrapper);

  // Clean up: remove <hr> and remaining extracted nodes from last <li>
  hr.remove();
  afterHr.forEach((n) => { if (n.parentNode) n.remove(); });

  // Insert brand section after legal
  legalSection.after(brandSection);
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

  // Strip button classes that decorateButtons adds to all links in the fragment
  stripButtonClasses(footer);

  // assign section classes: nav, legal (brand is created dynamically below)
  const sections = [...footer.querySelectorAll(':scope > .section')];
  if (sections[0]) sections[0].classList.add('footer-nav');
  if (sections[1]) sections[1].classList.add('footer-legal');

  // build nav columns from heading + list pairs
  const navSection = footer.querySelector('.footer-nav');
  if (navSection) buildNavColumns(navSection);

  // extract brand/copyright section from packed legal <li>
  extractBrandSection(footer);

  // add back-to-top button
  buildBackToTop(footer);

  block.append(footer);
}
