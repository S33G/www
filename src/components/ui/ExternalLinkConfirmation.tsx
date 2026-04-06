import { useState, useEffect, useRef, useCallback } from 'react';

const STORAGE_KEY = 'external-link-no-confirm';

function resetExternalLinkPreference(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export default function ExternalLinkConfirmation() {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [neverAskAgain, setNeverAskAgain] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    setNeverAskAgain(false);
    // Restore focus to the element that triggered the dialog
    triggerRef.current?.focus();
  }, []);

  const handleConfirm = useCallback(() => {
    if (neverAskAgain) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    setIsOpen(false);
    setNeverAskAgain(false);
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [neverAskAgain, url]);

  // Listen for the custom dispatch event from ExternalLinkHandler
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      triggerRef.current = detail.triggerElement || null;
      setUrl(detail.url);
      setIsOpen(true);
    };

    window.addEventListener('external-link-clicked', handler);
    return () => window.removeEventListener('external-link-clicked', handler);
  }, []);

  // Focus trap, Escape key, and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const getFocusableElements = () =>
      dialog.querySelectorAll<HTMLElement>(
        'button, input, [tabindex]:not([tabindex="-1"])'
      );

    // Auto-focus the Cancel button (safe default)
    const focusable = getFocusableElements();
    if (focusable.length > 0) {
      focusable[0].focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        handleCancel();
        return;
      }

      if (e.key !== 'Tab') return;

      const els = getFocusableElements();
      if (els.length === 0) return;

      const first = els[0];
      const last = els[els.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleCancel]);

  // Expose reset function for console access
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__resetExternalLinkPref = resetExternalLinkPreference;
  }, []);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  const domain = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();

  return (
    <div
      className="external-link-confirmation-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-title"
      aria-describedby="confirmation-url"
    >
      <div className="external-link-confirmation" ref={dialogRef}>
        <div className="external-link-confirmation-content">
          <h2 id="confirmation-title" className="external-link-confirmation-title">
            You're leaving this site
          </h2>

          <p className="external-link-confirmation-message">
            This link will take you to an external website:
          </p>

          <div className="external-link-confirmation-url" id="confirmation-url">
            <span className="external-link-confirmation-domain">{domain}</span>
          </div>

          <label className="external-link-confirmation-checkbox">
            <input
              type="checkbox"
              checked={neverAskAgain}
              onChange={(e) => setNeverAskAgain(e.target.checked)}
            />
            <span>Don't ask me again</span>
          </label>

          <div className="external-link-confirmation-actions">
            <button
              className="external-link-confirmation-button external-link-confirmation-button-secondary"
              onClick={handleCancel}
              type="button"
            >
              Go Back
            </button>
            <button
              className="external-link-confirmation-button external-link-confirmation-button-primary"
              onClick={handleConfirm}
              type="button"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


