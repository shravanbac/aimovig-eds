/**
 * decorate the indications-bar block
 * @param {Element} block the block element
 */
export default function decorate(block) {
  // Check if user already dismissed this session
  if (sessionStorage.getItem('indications-dismissed') === 'true') {
    block.closest('.section').remove();
    return;
  }

  block.setAttribute('role', 'alert');

  // Build close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'indications-bar-close';
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Dismiss approved use notice');
  closeBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`;
  closeBtn.addEventListener('click', () => {
    sessionStorage.setItem('indications-dismissed', 'true');
    const section = block.closest('.section');
    if (section) section.remove();
    document.documentElement.style.setProperty('--indications-bar-height', '0px');
  });

  // Wrap existing content
  const content = document.createElement('div');
  content.className = 'indications-bar-content';
  while (block.firstElementChild) {
    const row = block.firstElementChild;
    while (row.firstElementChild) content.append(row.firstElementChild);
    row.remove();
  }

  const inner = document.createElement('div');
  inner.className = 'indications-bar-inner';
  inner.append(content, closeBtn);
  block.append(inner);

  // Measure height and publish CSS variable so the header can offset below
  requestAnimationFrame(() => {
    const h = block.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--indications-bar-height', `${h}px`);
  });
}
