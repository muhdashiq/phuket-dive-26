import { Icon } from './Icon';
import { useToast } from './Toast';

export const useCopy = () => {
  const toast = useToast();
  return async (text: string, what = 'Number') => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ message: `${what} copied`, tone: 'success' });
    } catch {
      toast({ message: "Couldn't copy. Press and hold to select it instead.", tone: 'error' });
    }
  };
};

type ContactProps = {
  display: string;
  copy?: string;
  whatsapp?: string;
  note?: string;
};

// One phone number or email with call, WhatsApp and copy actions.
export const Contact = ({ display, copy, whatsapp, note }: ContactProps) => {
  const copyText = useCopy();
  const isEmail = display.includes('@');
  const dial = copy ?? display;
  return (
    <div className="contact">
      <span className="num">
        {display}
        {note && <small>{note}</small>}
      </span>
      <a className="icon-btn" href={isEmail ? `mailto:${display}` : `tel:${dial}`} aria-label={`${isEmail ? 'Email' : 'Call'} ${display}`}>
        <Icon name={isEmail ? 'mail' : 'phone'} />
      </a>
      {whatsapp && (
        <a className="icon-btn" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener" aria-label={`WhatsApp ${display}`}>
          <Icon name="message" />
        </a>
      )}
      <button className="icon-btn" type="button" aria-label={`Copy ${display}`} onClick={() => copyText(dial, isEmail ? 'Email' : 'Number')}>
        <Icon name="copy" />
      </button>
    </div>
  );
};
