import { MapLink } from '../components/MapLink';
import { PLACES } from '../data/places';
import { PLACE_GROUPS } from '../data/reference';

export const PlacesView = () => (
  <section className="ref" aria-labelledby="places-h">
    <h2 id="places-h">Places on Google Maps</h2>
    <p>Every pier, dive site, shop and stop in this plan. Each link opens Google Maps in a new tab, ready for directions or to send to a driver.</p>
    <div className="cards2">
      {PLACE_GROUPS.map((group) => (
        <div className="card" key={group.title}>
          <h3>{group.title}</h3>
          <ul className="placelist">
            {group.items.map((item) => (
              <li key={item.place}>
                <span className="pl">
                  {PLACES[item.place].name}
                  <small>{item.note}</small>
                </span>
                <MapLink place={item.place} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </section>
);
