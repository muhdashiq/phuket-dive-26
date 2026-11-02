import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from './Icon';

// Opens and closes a native <dialog> to match the `open` prop.
const useDialog = (open: boolean) => {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return ref;
};

type SheetProps = { open: boolean; onClose: () => void; title: string; children: ReactNode };

// Bottom sheet on phones, centred panel on wider screens.
export const Sheet = ({ open, onClose, title, children }: SheetProps) => {
  const ref = useDialog(open);
  return (
    <dialog ref={ref} className="sheet" aria-label={title} onClose={onClose} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet-grabber" aria-hidden="true" />
      <div className="sheet-head">
        <h2 className="t-headline">{title}</h2>
        <button className="icon-btn" type="button" aria-label="Close" onClick={onClose}>
          <Icon name="close" size={18} />
        </button>
      </div>
      <div className="sheet-body">{open && children}</div>
    </dialog>
  );
};

type AlertProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

// iOS-style confirmation for destructive actions.
export const Alert = ({ open, title, message, confirmLabel, onConfirm, onCancel }: AlertProps) => {
  const ref = useDialog(open);
  return (
    <dialog ref={ref} className="alert" aria-labelledby="alert-title" aria-describedby="alert-message" onClose={onCancel}>
      <div className="alert-body">
        <h2 id="alert-title" className="t-headline">{title}</h2>
        <p id="alert-message" className="t-foot">{message}</p>
      </div>
      <div className="alert-actions">
        <button type="button" onClick={onCancel} autoFocus>Cancel</button>
        <button type="button" className="destructive" onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </dialog>
  );
};
