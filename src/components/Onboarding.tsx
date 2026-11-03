import { useRef, useState, type ChangeEvent } from 'react';
import { PhotoError, toProfilePhoto } from '../lib/photo';
import { CERT_LEVELS, INTERESTS, type CertLevel, type Profile } from '../lib/profile';
import { Avatar } from './ui';
import { useToast } from './Toast';
import { MAX_NAME_LENGTH, type LatLon } from '../lib/prefs';
import { requestLocation } from '../lib/geo';
import { DiveFlag, Icon } from './Icon';

type OnboardingProps = {
  initialName: string;
  photo: string | null;
  onPhoto: (dataUrl: string) => boolean;
  profile: Profile;
  onProfile: (update: (profile: Profile) => Profile) => void;
  onFinish: (result: { name: string; location: LatLon | null; locationDenied: boolean }) => void;
};

const PAGES = 4;

export const Onboarding = ({ initialName, photo, onPhoto, profile, onProfile, onFinish }: OnboardingProps) => {
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const pickPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      if (!onPhoto(await toProfilePhoto(file))) toast({ message: 'This browser has no room to save the photo', tone: 'error' });
    } catch (error) {
      toast({ message: error instanceof PhotoError ? error.message : 'Couldn’t use that photo', tone: 'error' });
    }
  };

  const [page, setPage] = useState(0);
  const [name, setName] = useState(initialName);
  const [locating, setLocating] = useState(false);

  const finish = (location: LatLon | null, locationDenied = false) => onFinish({ name: name.trim().slice(0, MAX_NAME_LENGTH), location, locationDenied });

  const allowLocation = async () => {
    setLocating(true);
    try {
      finish(await requestLocation());
    } catch {
      finish(null, true);
    }
  };

  return (
    <div className="onboarding" role="dialog" aria-modal="true" aria-label="Welcome">
      <div className="onboarding-top">
        {page < PAGES - 1 && (
          <button className="btn btn-plain" type="button" onClick={() => setPage(PAGES - 1)}>Skip</button>
        )}
      </div>

      {page === 0 && (
        <div className="onboarding-page" key="p0">
          <DiveFlag size={96} />
          <h1 className="t-large" style={{ marginTop: 12 }}>Phuket Dive Week</h1>
          <p className="t-sub">Eight days in the Andaman Sea, planned one day at a time.</p>
          <label className="sr-only" htmlFor="onboard-name">Your first name (optional)</label>
          <input id="onboard-name" value={name} maxLength={MAX_NAME_LENGTH} placeholder="Your first name (optional)" autoComplete="given-name" onChange={(e) => setName(e.target.value)} />
          <input ref={fileInput} type="file" accept="image/*" hidden onChange={pickPhoto} />
          <button className="btn btn-plain onboard-photo-btn" type="button" onClick={() => fileInput.current?.click()}>
            <Avatar name={name} photo={photo} size={32} />
            {photo ? 'Change photo' : 'Add a photo (optional)'}
          </button>
        </div>
      )}

      {page === 1 && (
        <div className="onboarding-page" key="p-diving">
          <span className="onboarding-art teal"><Icon name="waves" /></span>
          <h1 className="t-title">About your diving</h1>
          <p className="t-sub">Used to tailor plans and chat answers. You can change it later in You.</p>
          <label className="field onboarding-field">
            <span>Certification</span>
            <select value={profile.certLevel} onChange={(e) => onProfile((p) => ({ ...p, certLevel: e.target.value as CertLevel }))}>
              {CERT_LEVELS.map((level) => <option key={level}>{level}</option>)}
            </select>
          </label>
          <div className="chips" aria-label="Interests">
            {INTERESTS.map((interest) => (
              <label key={interest} className="chip-toggle">
                <input
                  type="checkbox"
                  checked={profile.interests.includes(interest)}
                  onChange={() =>
                    onProfile((p) => ({ ...p, interests: p.interests.includes(interest) ? p.interests.filter((i) => i !== interest) : [...p.interests, interest] }))
                  }
                />
                <span>{interest}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {page === 2 && (
        <div className="onboarding-page" key="p1">
          <span className="onboarding-art blue"><Icon name="today" /></span>
          <h1 className="t-title">Everything for the day, in one place</h1>
          <div className="feature-list">
            <div className="feature"><Icon name="clockStart" /><p><b>Plan and timeline.</b> <span className="t-sub">Pickup times, dive sites, what to bring and who to call.</span></p></div>
            <div className="feature"><Icon name="checklist" /><p><b>Checklists.</b> <span className="t-sub">Tick things off and add your own items.</span></p></div>
            <div className="feature"><Icon name="note" /><p><b>Notes.</b> <span className="t-sub">Log each day. Notes stay private on this device.</span></p></div>
          </div>
        </div>
      )}

      {page === 3 && (
        <div className="onboarding-page" key="p2">
          <span className="onboarding-art teal"><Icon name="sun" /></span>
          <h1 className="t-title">Live weather where you are</h1>
          <p className="t-sub">
            See wind, waves and sunset times for your spot. Your location is only used to fetch the forecast. You can change this any time.
          </p>
        </div>
      )}

      <div className="onboarding-foot">
        <div className="dots" aria-hidden="true">
          {Array.from({ length: PAGES }, (_, i) => <span key={i} className={i === page ? 'on' : undefined} />)}
        </div>
        {page < PAGES - 1 ? (
          <button className="btn btn-block" type="button" onClick={() => setPage(page + 1)}>Continue</button>
        ) : (
          <>
            <button className="btn btn-block" type="button" onClick={allowLocation} disabled={locating}>
              <Icon name="location" size={18} />
              {locating ? 'Waiting for permission…' : 'Use my location'}
            </button>
            <button className="btn btn-plain" type="button" onClick={() => finish(null)}>Not now, show Phuket</button>
          </>
        )}
      </div>
    </div>
  );
};
