import { Photo } from '../components/Photo';
import { RAINY_OPTIONS } from '../data/reference';

export const PlanBView = () => (
  <section className="ref" aria-labelledby="planb-h">
    <h2 id="planb-h">Rainy-day options</h2>
    <p>Drive times are from Patong and approximate where marked ≈. Grab and Bolt work across the island; agree tuk-tuk fares before you get in, and check the app price first.</p>
    <div className="alts">
      {RAINY_OPTIONS.map((option) => (
        <article className="alt" key={option.title}>
          {option.photo && <Photo photo={option.photo} compact />}
          <span className={`badge s-${option.tone}`}>{option.badge}</span>
          <h3>{option.title}</h3>
          <dl>
            {option.facts.map(([label, value]) => (
              <div className="fact" key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </article>
      ))}
    </div>
  </section>
);
