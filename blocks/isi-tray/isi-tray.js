/**
 * decorate the isi-tray block
 * @param {Element} block the block element
 */
export default function decorate(block) {
  // Extract all content from the block rows into a single container
  const content = document.createElement('div');
  content.className = 'isi-tray-content';

  [...block.children].forEach((row) => {
    const cell = row.querySelector(':scope > div');
    if (!cell || !cell.textContent.trim()) return;

    // If cell has block-level elements, move all child nodes (including text)
    if (cell.querySelector('h1, h2, h3, h4, h5, h6, p, ul, ol')) {
      while (cell.firstChild) content.append(cell.firstChild);
    } else {
      // Bare text or inline-only content — wrap in <p>
      const p = document.createElement('p');
      while (cell.firstChild) p.append(cell.firstChild);
      content.append(p);
    }
  });

  block.textContent = '';

  // Build the sticky bar (collapsed preview)
  const stickyBar = document.createElement('div');
  stickyBar.className = 'isi-tray-sticky';
  stickyBar.setAttribute('aria-hidden', 'false');

  const stickyInner = document.createElement('div');
  stickyInner.className = 'isi-tray-sticky-inner';

  // Extract preview text: first heading + first 2 paragraphs
  const previewContent = document.createElement('div');
  previewContent.className = 'isi-tray-preview';

  const firstHeading = content.querySelector('h2, h3');
  if (firstHeading) {
    const previewHeading = firstHeading.cloneNode(true);
    previewContent.append(previewHeading);
  }

  const firstParagraphs = content.querySelectorAll('p');
  for (let i = 0; i < Math.min(2, firstParagraphs.length); i += 1) {
    const previewP = firstParagraphs[i].cloneNode(true);
    previewContent.append(previewP);
  }

  // Toggle button
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'isi-tray-toggle';
  toggleBtn.type = 'button';
  toggleBtn.setAttribute('aria-label', 'Expand Important Safety Information');
  toggleBtn.setAttribute('aria-expanded', 'false');
  toggleBtn.textContent = '+';

  stickyInner.append(previewContent, toggleBtn);
  stickyBar.append(stickyInner);

  // Build the full inline content area
  const fullContent = document.createElement('div');
  fullContent.className = 'isi-tray-full';
  fullContent.id = 'isi-tray-full';

  const fullInner = document.createElement('div');
  fullInner.className = 'isi-tray-full-inner';
  fullInner.append(content);
  fullContent.append(fullInner);

  block.append(stickyBar, fullContent);

  // State management
  let expanded = false;

  function collapse() {
    expanded = false;
    stickyBar.setAttribute('aria-hidden', 'false');
    toggleBtn.textContent = '+';
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-label', 'Expand Important Safety Information');
    fullContent.classList.remove('isi-tray-full-visible');
  }

  function expand() {
    expanded = true;
    toggleBtn.textContent = '\u2013';
    toggleBtn.setAttribute('aria-expanded', 'true');
    toggleBtn.setAttribute('aria-label', 'Collapse Important Safety Information');
    fullContent.classList.add('isi-tray-full-visible');
    fullContent.scrollIntoView({ behavior: 'smooth' });
  }

  toggleBtn.addEventListener('click', () => {
    if (expanded) {
      collapse();
    } else {
      expand();
    }
  });

  // Hide sticky bar when inline ISI is visible in viewport
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        stickyBar.setAttribute('aria-hidden', 'true');
      } else if (!expanded) {
        stickyBar.setAttribute('aria-hidden', 'false');
      }
    },
    { threshold: 0.1 },
  );

  observer.observe(fullContent);
}
