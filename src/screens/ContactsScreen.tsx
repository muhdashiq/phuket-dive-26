import { mapsUrl, PLACES } from '../data/places';
import { EMERGENCY, OPERATORS } from '../data/reference';
import { useCopy } from '../components/Contact';
import { Icon } from '../components/Icon';
import { Avatar, ScreenHeader, Section } from '../components/ui';

export const ContactsScreen = () => {
  const copy = useCopy();

  return (
    <div className="screen">
      <ScreenHeader title="Contacts" eyebrow="Help and operators" />

      <Section id="sos-h" title="Emergency" footer="Ask each shop for its own emergency plan at the dive briefing.">
        <div className="sos-card">
          {EMERGENCY.map((entry) => (
            <a key={entry.dial} className="row sos-row" href={`tel:${entry.dial}`} aria-label={`Call ${entry.label}, ${entry.display}`}>
              <span className="call-btn"><Icon name="phone" size={19} /></span>
              <span className="row-body">
                <span className="row-title">{entry.label}</span>
                <span className="row-sub">{entry.display} · {entry.detail}</span>
              </span>
              <span className="row-value">Call</span>
            </a>
          ))}
        </div>
      </Section>

      <Section id="ops-h" title="Tour and dive operators">
        {OPERATORS.map((entry) => (
          <div key={entry.name} className="contact-card">
            <div className="contact-head">
              <Avatar name={entry.name.replace(/[^A-Za-z ]/g, ' ')} size={44} soft />
              <span className="row-body">
                <span className="t-headline">{entry.name}</span>
                <span className="t-foot">{entry.role}</span>
              </span>
              {entry.place && (
                <a className="icon-btn" href={mapsUrl(PLACES[entry.place])} target="_blank" rel="noopener" aria-label={`Open ${entry.name} in Google Maps`}>
                  <Icon name="pin" size={19} />
                </a>
              )}
            </div>
            {entry.phones.map((phone) => (
              <div key={phone.dial} className="phone-line">
                <span className="num">
                  {phone.display}
                  {phone.note && <small>{phone.note}</small>}
                </span>
                <span className="phone-actions">
                  <a className="call-btn blue" href={`tel:${phone.dial}`} aria-label={`Call ${entry.name} on ${phone.display}`}>
                    <Icon name="phone" size={18} />
                  </a>
                  {phone.whatsapp && (
                    <a className="call-btn blue" href={`https://wa.me/${phone.whatsapp}`} target="_blank" rel="noopener" aria-label={`WhatsApp ${entry.name}`}>
                      <Icon name="message" size={18} />
                    </a>
                  )}
                  <button className="call-btn blue" style={{ border: 0, cursor: 'pointer' }} type="button" aria-label={`Copy ${phone.display}`} onClick={() => copy(phone.dial)}>
                    <Icon name="copy" size={18} />
                  </button>
                </span>
              </div>
            ))}
            {entry.emails?.map((email) => (
              <div key={email} className="phone-line">
                <span className="num">{email}<small>Email</small></span>
                <span className="phone-actions">
                  <a className="call-btn blue" href={`mailto:${email}`} aria-label={`Email ${entry.name}`}>
                    <Icon name="mail" size={18} />
                  </a>
                  <button className="call-btn blue" style={{ border: 0, cursor: 'pointer' }} type="button" aria-label={`Copy ${email}`} onClick={() => copy(email, 'Email')}>
                    <Icon name="copy" size={18} />
                  </button>
                </span>
              </div>
            ))}
            {entry.link && (
              <a className="phone-line" href={entry.link.href} target="_blank" rel="noopener">
                <span className="num">{entry.link.label}</span>
                <Icon name="external" size={18} />
              </a>
            )}
          </div>
        ))}
      </Section>
    </div>
  );
};
