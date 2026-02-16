/**
 * decorate the promo block
 * @param {Element} block the block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // Separate image and text content from all rows
  let picture = null;
  const textCol = document.createElement('div');
  textCol.className = 'promo-text';

  rows.forEach((row) => {
    [...row.children].forEach((cell) => {
      // Capture the first picture element found
      const pic = cell.querySelector('picture');
      if (pic && !picture) {
        picture = pic;
        return;
      }
      if (!cell.textContent.trim()) return;

      // If cell has block-level elements, move all child nodes
      if (cell.querySelector('h1, h2, h3, h4, h5, h6, p, ul, ol')) {
        while (cell.firstChild) textCol.append(cell.firstChild);
      } else {
        // Bare text or inline-only content — wrap in <p>
        const p = document.createElement('p');
        while (cell.firstChild) p.append(cell.firstChild);
        textCol.append(p);
      }
    });
  });

  // Clear block and build layout
  block.textContent = '';

  const layout = document.createElement('div');
  layout.className = 'promo-layout';

  // Mark CTA link paragraph
  const ctaLink = textCol.querySelector('a');
  if (ctaLink) {
    const ctaP = ctaLink.closest('p');
    if (ctaP) ctaP.classList.add('promo-cta');
  }

  // Mark footnote (last <p> containing <em>)
  const allPs = [...textCol.querySelectorAll('p')];
  for (let i = allPs.length - 1; i >= 0; i -= 1) {
    if (allPs[i].querySelector('em')) {
      allPs[i].classList.add('promo-footnote');
      break;
    }
  }

  layout.append(textCol);

  if (picture) {
    const imgCol = document.createElement('div');
    imgCol.className = 'promo-image';
    imgCol.append(picture);
    layout.append(imgCol);
  }

  block.append(layout);
}
