import { useState } from 'react';
import { useTrip } from '../data/trip';
import { mapsUrl, PLACES, type PlaceKey } from '../data/places';
import { PLACE_GROUPS, RAINY_OPTIONS, type RainyOption } from '../data/reference';
import type { DayId } from '../data/types';
import { ProfileButton } from '../components/AppContext';
import { Icon } from '../components/Icon';
import { Photo } from '../components/Photo';
import { useToast } from '../components/Toast';
import { EmptyState, ScreenHeader, Section, Segmented } from '../components/ui';
import type { ExploreSegment } from '../lib/routes';
import { resultCount, searchTrip } from '../lib/search';

type ExploreScreenProps = {
  segment: ExploreSegment;
  onSegment: (segment: ExploreSegment) => void;
  favorites: PlaceKey[];
  onToggleFavorite: (key: PlaceKey) => void;
  onOpenDay: (id: DayId) => void;
};

type PlaceRowProps = { place: PlaceKey; note: string; favorite: boolean; onToggleFavorite: (key: PlaceKey) => void };

const PlaceRow = ({ place, note, favorite, onToggleFavorite }: PlaceRowProps) => {
  const target = PLACES[place];
  return (
    <div className="row place-row">
      <span className="pin"><Icon name="pin" /></span>
      <span className="row-body">
        <span className="row-title">{target.name}</span>
        <span className="row-sub">{note}</span>
      </span>
      <span className="actions">
        <button
          className={`icon-btn plain${favorite ? ' fav-on' : ''}`}
          type="button"
          aria-pressed={favorite}
          aria-label={favorite ? `Remove ${target.name} from favorites` : `Add ${target.name} to favorites`}
          onClick={() => onToggleFavorite(place)}
        >
          <Icon name="star" filled={favorite} size={21} />
        </button>
        <a className="icon-btn" href={mapsUrl(target)} target="_blank" rel="noopener" aria-label={`Open ${target.name} in Google Maps`}>
          <Icon name="external" size={18} />
        </a>
      </span>
    </div>
  );
};

const RainyCard = ({ option }: { option: RainyOption }) => (
  <article className="alt-card">
    {option.photo && <Photo photo={option.photo} compact />}
    <div className="alt-body">
      <span className={`pill ${option.tone}`} style={{ justifySelf: 'start' }}>{option.badge}</span>
      <h3 className="t-headline">{option.title}</h3>
      <dl className="alt-facts">
        {option.facts.map(([label, value]) => (
          <div key={label} style={{ display: 'contents' }}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  </article>
);

const firstNote = (key: PlaceKey) => PLACE_GROUPS.flatMap((g) => g.items).find((i) => i.place === key)?.note ?? '';

export const ExploreScreen = ({ segment, onSegment, favorites, onToggleFavorite, onOpenDay }: ExploreScreenProps) => {
  const [query, setQuery] = useState('');
  const { byId } = useTrip();
  const toast = useToast();
  const results = searchTrip(query);
  const searching = query.trim().length > 0;

  const toggleFavorite = (key: PlaceKey) => {
    const adding = !favorites.includes(key);
    onToggleFavorite(key);
    toast({ message: adding ? `${PLACES[key].name} added to Favorites` : `Removed from Favorites`, tone: adding ? 'success' : 'info' });
  };

  return (
    <div className="screen">
      <ScreenHeader title="Explore" eyebrow="Places, ideas and maps" actions={<ProfileButton />} />
      <div className="explore-tools">
        <div className="search" role="search">
          <Icon name="search" size={18} />
          <label className="sr-only" htmlFor="explore-search">Search places, days and ideas</label>
          <input id="explore-search" type="search" value={query} placeholder="Search piers, dive sites, markets…" onChange={(e) => setQuery(e.target.value)} />
          {searching && (
            <button className="icon-btn clear" type="button" aria-label="Clear search" onClick={() => setQuery('')}>
              <Icon name="close" size={14} />
            </button>
          )}
        </div>
        {!searching && (
          <Segmented
            name="explore-segment"
            label="Show"
            value={segment}
            options={[{ value: 'places', label: 'Places' }, { value: 'rainy', label: 'Rainy day' }]}
            onChange={onSegment}
          />
        )}
      </div>

      {searching ? (
        resultCount(results) === 0 ? (
          <EmptyState icon="search" title={`No results for “${query.trim()}”`} text="Try a place or activity, like pier, market, Racha or museum." />
        ) : (
          <>
            {results.days.length > 0 && (
              <Section id="res-days" title="Days">
                <div className="group">
                  {results.days.map((id) => (
                    <button key={id} type="button" className="row" onClick={() => onOpenDay(id)}>
                      <span className="row-body">
                        <span className="row-title">{byId.get(id)?.title}</span>
                        <span className="row-sub">{byId.get(id)?.dow} {byId.get(id)?.dom}</span>
                      </span>
                      <Icon name="chevronRight" className="row-chevron" />
                    </button>
                  ))}
                </div>
              </Section>
            )}
            {results.places.length > 0 && (
              <Section id="res-places" title="Places">
                <div className="group">
                  {results.places.map((item) => (
                    <PlaceRow key={item.place} place={item.place} note={`${item.group} · ${item.note}`} favorite={favorites.includes(item.place)} onToggleFavorite={toggleFavorite} />
                  ))}
                </div>
              </Section>
            )}
            {results.rainy.length > 0 && (
              <Section id="res-rainy" title="Rainy-day ideas">
                <div className="alt-grid">
                  {RAINY_OPTIONS.filter((o) => results.rainy.includes(o.title)).map((option) => <RainyCard key={option.title} option={option} />)}
                </div>
              </Section>
            )}
          </>
        )
      ) : segment === 'places' ? (
        <>
          <Section id="fav-h" title="Favorites">
            {favorites.length === 0 ? (
              <EmptyState compact icon="star" title="Pin the places you need" text="Tap the star on any place below to keep it here for quick directions." />
            ) : (
              <div className="group">
                {favorites.map((key) => (
                  <PlaceRow key={key} place={key} note={firstNote(key)} favorite onToggleFavorite={toggleFavorite} />
                ))}
              </div>
            )}
          </Section>
          {PLACE_GROUPS.map((group) => (
            <Section key={group.title} id={`g-${group.title}`} title={group.title}>
              <div className="group">
                {group.items.map((item) => (
                  <PlaceRow key={item.place} place={item.place} note={item.note} favorite={favorites.includes(item.place)} onToggleFavorite={toggleFavorite} />
                ))}
              </div>
            </Section>
          ))}
        </>
      ) : (
        <Section
          id="rainy-h"
          title="If the weather turns"
          footer="Drive times are from Patong. Grab and Bolt work across the island; agree tuk-tuk fares before you get in."
        >
          <div className="alt-grid">
            {RAINY_OPTIONS.map((option) => <RainyCard key={option.title} option={option} />)}
          </div>
        </Section>
      )}
    </div>
  );
};
