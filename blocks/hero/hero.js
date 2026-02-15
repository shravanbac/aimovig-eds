/**
 * decorate the hero block
 * @param {Element} block the block element
 */
export default function decorate(block) {
  // Row 0 = image, Row 1 = text content
  const rows = [...block.children];
  const imageRow = rows[0];
  const textRow = rows[1];

  // Extract picture from first row
  const picture = imageRow?.querySelector('picture');
  if (picture) {
    picture.classList.add('hero-bg');
    block.prepend(picture);
  }

  // Build text overlay
  if (textRow) {
    const overlay = document.createElement('div');
    overlay.className = 'hero-overlay';

    const content = document.createElement('div');
    content.className = 'hero-content';

    // Move all text content children into content wrapper
    const textCell = textRow.querySelector('div');
    if (textCell) {
      while (textCell.firstElementChild) content.append(textCell.firstElementChild);
    }

    // Wrap the subtext paragraph with a highlight span
    const subtext = content.querySelector('p');
    if (subtext) {
      subtext.classList.add('hero-subtext');
    }

    overlay.append(content);
    block.append(overlay);
  }

  // Clean up original rows
  rows.forEach((row) => row.remove());
}
