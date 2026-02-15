let modalEl = null;
let previousFocus = null;
let pendingUrl = null;

/**
 * Traps focus within the modal dialog.
 * @param {KeyboardEvent} e The keydown event
 */
function trapFocus(e) {
  if (e.key !== 'Tab' || !modalEl) return;
  const focusable = modalEl.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) {
      last.focus();
      e.preventDefault();
    }
  } else if (document.activeElement === last) {
    first.focus();
    e.preventDefault();
  }
}

/**
 * Closes the modal and restores focus.
 */
function closeModal() {
  if (!modalEl) return;
  modalEl.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  // eslint-disable-next-line no-use-before-define
  document.removeEventListener('keydown', handleKeydown);
  document.removeEventListener('keydown', trapFocus);
  pendingUrl = null;
  if (previousFocus) {
    previousFocus.focus();
    previousFocus = null;
  }
}

/**
 * Opens the modal with a pending external URL.
 * @param {string} url The external URL
 * @param {Element} triggerEl The element that triggered the modal
 */
function openModal(url, triggerEl) {
  if (!modalEl) return;
  pendingUrl = url;
  previousFocus = triggerEl || document.activeElement;
  modalEl.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  // eslint-disable-next-line no-use-before-define
  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('keydown', trapFocus);

  // Focus the first focusable element inside the modal
  const firstBtn = modalEl.querySelector('button');
  if (firstBtn) firstBtn.focus();
}

/**
 * Handles Escape key to close modal.
 * @param {KeyboardEvent} e The keydown event
 */
function handleKeydown(e) {
  if (e.key === 'Escape') closeModal();
}

/**
 * Checks if a URL is external (different hostname from current site).
 * @param {string} href The URL to check
 * @returns {boolean} True if external
 */
function isExternalUrl(href) {
  try {
    const url = new URL(href, window.location.origin);
    return url.hostname !== window.location.hostname
      && url.protocol.startsWith('http');
  } catch {
    return false;
  }
}

/**
 * Builds the modal DOM element and appends it to document body.
 */
function buildModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'External link confirmation');
  modal.setAttribute('aria-hidden', 'true');

  const card = document.createElement('div');
  card.className = 'modal-card';

  card.innerHTML = `
    <h3 class="modal-heading">You are now leaving aimovig.com</h3>
    <p class="modal-text">You are about to leave the aimovig.com website and enter a website operated by a third party. Amgen is not responsible for and does not endorse or control the content contained on this third-party website.</p>
    <div class="modal-actions">
      <button type="button" class="modal-continue">Continue</button>
      <button type="button" class="modal-cancel">Cancel</button>
    </div>
  `;

  modal.append(card);

  // Continue button — opens the external URL
  card.querySelector('.modal-continue').addEventListener('click', () => {
    if (pendingUrl) {
      window.open(pendingUrl, '_blank', 'noopener,noreferrer');
    }
    closeModal();
  });

  // Cancel button
  card.querySelector('.modal-cancel').addEventListener('click', closeModal);

  // Click on overlay background closes modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.body.append(modal);
  modalEl = modal;
}

/**
 * Intercepts external link clicks and shows the interstitial modal.
 * Called from buildAutoBlocks in scripts.js.
 */
export default function decorate() {
  buildModal();

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    if (!isExternalUrl(link.href)) return;

    e.preventDefault();
    openModal(link.href, link);
  });
}
