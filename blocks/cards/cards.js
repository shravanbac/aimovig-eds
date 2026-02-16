import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * For the CTA variant, wraps each card in a link and appends an arrow icon.
 * @param {Element} block The cards block
 * @param {HTMLUListElement} ul The card list
 */
function decorateCtaVariant(block, ul) {
  ul.querySelectorAll('li').forEach((li) => {
    const bodies = [...li.querySelectorAll('.cards-card-body')];
    const primaryBody = bodies[0];
    if (!primaryBody) return;

    // Find the link inside the card body
    const link = primaryBody.querySelector('a');
    if (!link) return;

    const { href } = link;
    const title = link.textContent;

    // Collect subtitle text from additional body divs
    let subtitle = '';
    for (let i = 1; i < bodies.length; i += 1) {
      const text = bodies[i].textContent.trim();
      if (text) subtitle = text;
      bodies[i].remove();
    }

    // Rebuild the primary body with proper <p> structure
    primaryBody.textContent = '';
    const titleP = document.createElement('p');
    const titleStrong = document.createElement('strong');
    titleStrong.textContent = title;
    titleP.append(titleStrong);
    primaryBody.append(titleP);

    if (subtitle) {
      const subtitleP = document.createElement('p');
      subtitleP.textContent = subtitle;
      primaryBody.append(subtitleP);
    }

    // Create a wrapper <a> around the entire card content
    const wrapper = document.createElement('a');
    wrapper.href = href;
    wrapper.className = 'cards-card-link';
    wrapper.append(primaryBody);

    // Add arrow SVG
    const arrow = document.createElement('span');
    arrow.className = 'cards-card-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    wrapper.append(arrow);

    li.append(wrapper);
  });
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));

  // Auto-detect CTA variant: no images and has strong > a links
  if (!block.classList.contains('cta') && !ul.querySelector('picture') && ul.querySelector('strong > a')) {
    block.classList.add('cta');
  }

  block.replaceChildren(ul);

  // Decorate CTA variant
  if (block.classList.contains('cta')) {
    decorateCtaVariant(block, ul);
  }
}
