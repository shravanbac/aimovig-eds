import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const expanded = navSections.querySelector('[aria-expanded="true"]');
    if (expanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      expanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('.nav-hamburger button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const expanded = navSections.querySelector('[aria-expanded="true"]');
    if (expanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isDrop = focused.classList.contains('nav-drop');
  if (isDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-items > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null
    ? !forceExpanded
    : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');

  // enable nav dropdown keyboard accessibility
  if (navSections) {
    const navDrops = navSections.querySelectorAll('.nav-drop');
    if (isDesktop.matches) {
      navDrops.forEach((drop) => {
        if (!drop.hasAttribute('tabindex')) {
          drop.setAttribute('tabindex', 0);
          drop.addEventListener('focus', focusNavSection);
        }
      });
    } else {
      navDrops.forEach((drop) => {
        drop.removeAttribute('tabindex');
        drop.removeEventListener('focus', focusNavSection);
      });
    }
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
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
 * Transforms the DA.live nav-sections content into a single <ul class="nav-items">
 * from the mixed <p><strong>heading</strong></p> + <ul> / standalone <p><strong><a>> structure.
 * @param {Element} navSections The nav-sections element
 */
function buildNavItems(navSections) {
  const wrapper = navSections.querySelector('.default-content-wrapper');
  if (!wrapper) return;

  const navList = document.createElement('ul');
  navList.className = 'nav-items';

  const children = [...wrapper.children];
  let i = 0;
  while (i < children.length) {
    const el = children[i];

    // Case 1: <p><strong>Text</strong></p> followed by <ul> → dropdown group
    if (el.tagName === 'P' && children[i + 1] && children[i + 1].tagName === 'UL') {
      const strong = el.querySelector('strong');
      const link = el.querySelector('a');
      if (strong && !link) {
        const li = document.createElement('li');
        li.classList.add('nav-drop');
        li.textContent = strong.textContent;
        li.append(children[i + 1]); // move the <ul> into this <li>
        navList.append(li);
        i += 2;
        // eslint-disable-next-line no-continue
        continue;
      }
    }

    // Case 2: <p><strong><a href="...">Label</a></strong></p> → standalone link
    if (el.tagName === 'P') {
      const link = el.querySelector('a');
      if (link) {
        const li = document.createElement('li');
        link.className = '';
        li.append(link);
        navList.append(li);
      }
    }

    i += 1;
  }

  wrapper.textContent = '';
  wrapper.append(navList);
}

/**
 * Identifies nav sections by content rather than index.
 * Resilient to extra sections injected by auto-blocks (e.g. indications-bar).
 * @param {Element} nav The nav element containing fragment sections
 * @returns {{ utility: Element|null, brand: Element|null,
 *             sections: Element|null, tools: Element|null }}
 */
function identifySections(nav) {
  const result = {
    utility: null, brand: null, sections: null, tools: null,
  };
  const sectionEls = [...nav.querySelectorAll(':scope > .section')];

  // Brand: the section containing a <picture> element (logo)
  result.brand = sectionEls.find((s) => s.querySelector('picture')) || null;

  // Sections: the section containing <ul> (nav link lists)
  result.sections = sectionEls.find((s) => s.querySelector('ul')) || null;

  // Utility & Tools: remaining sections in document order
  const remaining = sectionEls.filter(
    (s) => s !== result.brand && s !== result.sections,
  );

  // Utility comes before brand; tools comes after sections
  remaining.forEach((s) => {
    if (!result.brand) {
      result.tools = s;
      return;
    }
    const pos = s.compareDocumentPosition(result.brand);
    // eslint-disable-next-line no-bitwise
    if (pos & Node.DOCUMENT_POSITION_FOLLOWING) {
      result.utility = s;
    } else {
      result.tools = s;
    }
  });

  return result;
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // Remove any auto-block sections that leaked into the fragment (e.g. indications-bar)
  nav.querySelectorAll('.indications-bar-container').forEach((s) => s.remove());

  // Strip button classes that decorateButtons adds to all links in the fragment
  stripButtonClasses(nav);

  // Identify sections by content instead of fragile index order
  const {
    utility, brand, sections, tools,
  } = identifySections(nav);

  if (utility) {
    utility.classList.add('nav-utility');
    // Mark the last utility link (e.g. "For Healthcare Providers") for special styling
    const utilityLinks = utility.querySelectorAll('p');
    const lastLink = utilityLinks[utilityLinks.length - 1];
    if (lastLink) lastLink.classList.add('nav-utility-separated');
  }
  if (brand) brand.classList.add('nav-brand');
  if (sections) sections.classList.add('nav-sections');
  if (tools) tools.classList.add('nav-tools');

  // Transform nav-sections from DA.live <p>/<ul> structure into a navigable list
  const navSections = sections;
  if (navSections) {
    buildNavItems(navSections);

    navSections.querySelectorAll('.nav-items > li').forEach((navItem) => {
      if (navItem.classList.contains('nav-drop')) {
        navItem.addEventListener('click', () => {
          const dropExpanded = navItem.getAttribute('aria-expanded') === 'true';
          if (isDesktop.matches) {
            toggleAllNavSections(navSections);
          }
          navItem.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
        });
      }
    });
  }

  // decorate tools — style CTA button
  if (tools) {
    const ctaLink = tools.querySelector('a');
    if (ctaLink) {
      ctaLink.className = 'nav-cta';
    }
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  if (utility) navWrapper.append(utility);
  navWrapper.append(nav);
  block.append(navWrapper);
}
