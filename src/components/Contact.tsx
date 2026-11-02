import { useState } from 'react';

type CopyButtonProps = { text: string };

const CopyButton = ({ text }: CopyButtonProps) => {
  const [label, setLabel] = useState('Copy');

  const flash = (next: string) => {
    setLabel(next);
    window.setTimeout(() => setLabel('Copy'), 1400);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      flash('Copied');
    } catch {
      flash('Copy failed');
    }
  };

  return (
    <button className="copy" type="button" onClick={copy}>
      {label}
    </button>
  );
};

type ContactProps = {
  display: string;
  copy?: string;
  whatsapp?: string;
  note?: string;
};

// One phone number or email with a copy button and optional WhatsApp link.
export const Contact = ({ display, copy, whatsapp, note }: ContactProps) => (
  <div className="contact">
    <span className="num">{display}</span>
    <CopyButton text={copy ?? display} />
    {whatsapp && (
      <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener">
        WhatsApp
      </a>
    )}
    {note && <span className="op-meta">{note}</span>}
  </div>
);
