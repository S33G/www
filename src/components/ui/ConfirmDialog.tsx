import type { ReactNode } from 'react';
import { LuX, LuExternalLink } from 'react-icons/lu';

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  url?: string;
}

export default function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Leave site?',
  message = 'You are about to leave this site and visit an external link.',
  confirmText = 'Continue',
  cancelText = 'Cancel',
  url,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div
      className="confirm-dialog-overlay"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      <div className="confirm-dialog">
        <header className="confirm-dialog-header">
          <h2 id="dialog-title" className="confirm-dialog-title">
            {title}
          </h2>
          <button
            className="confirm-dialog-close"
            onClick={onCancel}
            aria-label="Close dialog"
            type="button"
          >
            <LuX size={16} />
          </button>
        </header>

        <div className="confirm-dialog-body">
          <p id="dialog-description" className="confirm-dialog-message">
            {message}
          </p>
          {url && (
            <div className="confirm-dialog-url">
              <LuExternalLink size={16} />
              <span className="confirm-dialog-url-text">{url}</span>
            </div>
          )}
        </div>

        <footer className="confirm-dialog-footer">
          <button
            className="confirm-dialog-button confirm-dialog-button-cancel"
            onClick={onCancel}
            type="button"
          >
            {cancelText}
          </button>
          <button
            className="confirm-dialog-button confirm-dialog-button-confirm"
            onClick={onConfirm}
            type="button"
            autoFocus
          >
            {confirmText}
          </button>
        </footer>
      </div>
    </div>
  );
}
