import { PLACES, mapsUrl, type PlaceKey } from '../data/places';
import { Icon } from './Icon';

type MapLinkProps = { place: PlaceKey; label?: string };

export const MapLink = ({ place, label = 'Map' }: MapLinkProps) => {
  const target = PLACES[place];
  return (
    <a className="map" href={mapsUrl(target)} target="_blank" rel="noopener" aria-label={`Open ${target.query} in Google Maps`}>
      <Icon name="pin" />
      {label}
    </a>
  );
};
