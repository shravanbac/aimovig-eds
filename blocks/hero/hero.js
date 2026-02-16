/**
 * decorate the hero block
 * @param {Element} block the block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // Row 0 = image background
  const picture = rows[0]?.querySelector('picture');
  if (picture) {
    picture.classList.add('hero-bg');
    block.prepend(picture);
  }

  // Build text overlay from all remaining rows (supports 2-row and 3+-row structures)
  const overlay = document.createElement('div');
  overlay.className = 'hero-overlay';
  const content = document.createElement('div');
  content.className = 'hero-content';

  for (let i = 1; i < rows.length; i += 1) {
    [...rows[i].children].forEach((cell) => {
      if (!cell.textContent.trim()) return;

      // If cell has block-level elements, move all child nodes
      if (cell.querySelector('h1, h2, h3, h4, h5, h6, p, ul, ol')) {
        while (cell.firstChild) content.append(cell.firstChild);
      } else {
        // Bare text or inline-only content — wrap in <p>
        const p = document.createElement('p');
        while (cell.firstChild) p.append(cell.firstChild);
        content.append(p);
      }
    });
  }

  // Style subtext: first <p> element (headings are h1/h2, not <p>)
  const firstP = content.querySelector('p');
  if (firstP) {
    firstP.classList.add('hero-subtext');
  }

  overlay.append(content);
  block.append(overlay);

  // Clean up original rows
  rows.forEach((row) => row.remove());
}
