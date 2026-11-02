import { useState } from 'react';
import { requestLocation } from '../lib/geo';
import type { LatLon } from '../lib/prefs';
import { Icon } from './Icon';
import { Sheet } from './Sheet';
import { useToast } from './Toast';

type LocationSheetProps = {
  open: boolean;
  onClose: () => void;
  location: LatLon | null;
  onChange: (location: LatLon | null) => void;
};

export const LocationSheet = ({ open, onClose, location, onChange }: LocationSheetProps) => {
  const toast = useToast();
  const [locating, setLocating] = useState(false);

  const useMine = async () => {
    setLocating(true);
    try {
      onChange(await requestLocation());
      toast({ message: 'Showing weather for your location', tone: 'success' });
      onClose();
    } catch {
      toast({ message: 'Location wasn’t shared, so weather stays on Phuket', tone: 'error' });
    } finally {
      setLocating(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Weather location">
      <p className="t-sub">
        Live conditions can follow you around the island. Your browser will ask first, and your position is only used to fetch the forecast.
      </p>
      <div className="group">
        <button
          type="button"
          className="row row-icon"
          aria-pressed={!location}
          onClick={() => {
            onChange(null);
            onClose();
          }}
        >
          <span className="tile-icon red"><Icon name="pin" size={18} /></span>
          <span className="row-body"><span className="row-title">Phuket</span><span className="row-sub">Patong area forecast</span></span>
          {!location && <Icon name="check" />}
        </button>
        <button type="button" className="row row-icon" aria-pressed={!!location} onClick={useMine} disabled={locating}>
          <span className="tile-icon"><Icon name="location" size={18} /></span>
          <span className="row-body">
            <span className="row-title">{locating ? 'Finding you…' : 'My location'}</span>
            <span className="row-sub">{location ? `Around ${location.lat}, ${location.lon}` : 'Uses your device location'}</span>
          </span>
          {location && <Icon name="check" />}
        </button>
      </div>
    </Sheet>
  );
};
