import { Contact } from '../components/Contact';
import { MapLink } from '../components/MapLink';

export const ContactsView = () => (
  <section className="ref" aria-labelledby="contacts-h">
    <h2 id="contacts-h">Contacts</h2>
    <p>Emergency numbers first, then the operators for each day. Tap Copy to paste a number into your phone or WhatsApp.</p>
    <div className="cards2">
      <div className="card sos">
        <h3>Diving emergency</h3>
        <Contact display="+66 81 081 9000" copy="+66810819000" note="Hyperbaric Services Thailand (SSS), 24 h" />
        <div className="contact">
          <span className="num">+66 76 361 888</span>
          <a className="btn" href="tel:+6676361888">Call</a>
          <span className="op-meta">Bangkok Hospital Siriroj, hyperbaric chamber; hotline 1719<MapLink place="siriroj" /></span>
        </div>
        <p>Ask each shop for its own emergency plan at the briefing.</p>
      </div>
      <div className="card sos">
        <h3>Thailand emergency numbers</h3>
        <ul className="sos-list">
          <li><a className="num" href="tel:1669">1669</a> ambulance</li>
          <li><a className="num" href="tel:1155">1155</a> tourist police</li>
          <li><a className="num" href="tel:1196">1196</a> marine police</li>
          <li><a className="num" href="tel:1182">1182</a> Thai Met Dept weather line</li>
        </ul>
      </div>
      <div className="card">
        <h3>PNT · Phi Phi tour (Tue 3 Nov)</h3>
        <p className="op-meta">Phuket New Generation Travel, the Klook operator</p>
        <Contact display="+66 81 538 7695" copy="+66815387695" note="late pickup, changes" />
        <Contact display="kunmee16@gmail.com" />
      </div>
      <div className="card">
        <h3>Sea Bees Diving</h3>
        <p className="op-meta">1/3 Moo 9 Viset Road, Chalong<MapLink place="seaBees" /></p>
        <Contact display="+66 76 381 765" copy="+6676381765" />
        <Contact display="+66 81 270 8817" copy="+66812708817" note="mobile, from Google listing" />
        <Contact display="info@sea-bees.com" />
      </div>
      <div className="card">
        <h3>Sunrise Divers</h3>
        <p className="op-meta">269/24 Patak Road, Karon Beach<MapLink place="sunriseDivers" /></p>
        <Contact display="+66 84 626 4646" copy="+66846264646" whatsapp="66846264646" />
        <Contact display="+66 76 398 040" copy="+6676398040" note="shop" />
      </div>
      <div className="card">
        <h3>Phuket Dive Tours</h3>
        <p className="op-meta">Kata Beach office, 95 Soi Pakbang<MapLink place="phuketDiveTours" /></p>
        <Contact display="+66 87 022 5356" copy="+66870225356" whatsapp="66870225356" />
        <Contact display="+66 86 690 8157" copy="+66866908157" note="Thai" />
      </div>
      <div className="card">
        <h3>Thailand Divers (Similan)</h3>
        <p className="op-meta">Books by WhatsApp or the contact form</p>
        <Contact display="+44 7340 764006" copy="+447340764006" whatsapp="447340764006" />
        <a href="https://thailand-divers.com/contact-thailand-divers/" target="_blank" rel="noopener">Contact form</a>
      </div>
    </div>
  </section>
);
