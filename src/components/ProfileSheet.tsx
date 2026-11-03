import { useEffect, useState, type FormEvent } from 'react';
import { CERT_LEVELS, INTERESTS, PACES, sanitizeProfile, type CertLevel, type Pace, type Profile } from '../lib/profile';
import { Sheet } from './Sheet';
import { useToast } from './Toast';
import { Segmented } from './ui';

type ProfileSheetProps = {
  open: boolean;
  onClose: () => void;
  profile: Profile;
  onSave: (profile: Profile) => void;
};

const numberOrNull = (value: string) => (value.trim() === '' ? null : Number(value));

export const ProfileSheet = ({ open, onClose, profile, onSave }: ProfileSheetProps) => {
  const toast = useToast();
  const [draft, setDraft] = useState(profile);
  const [dives, setDives] = useState('');
  const [depth, setDepth] = useState('');
  const [budget, setBudget] = useState('');

  useEffect(() => {
    if (!open) return;
    setDraft(profile);
    setDives(profile.loggedDives?.toString() ?? '');
    setDepth(profile.maxDepth?.toString() ?? '');
    setBudget(profile.budgetPerDay?.toString() ?? '');
  }, [open, profile]);

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const toggleInterest = (interest: string) =>
    set('interests', draft.interests.includes(interest) ? draft.interests.filter((i) => i !== interest) : [...draft.interests, interest]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSave(sanitizeProfile({ ...draft, loggedDives: numberOrNull(dives), maxDepth: numberOrNull(depth), budgetPerDay: numberOrNull(budget) }));
    toast({ message: 'Profile saved', tone: 'success' });
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Profile details">
      <form className="form" onSubmit={submit}>
        <p className="t-sub">Used to tailor the days you plan and the chat. Saved on this device only.</p>

        <div className="group">
          <label className="field">
            <span>Home country</span>
            <input value={draft.homeCountry} maxLength={60} placeholder="e.g. India" autoComplete="country-name" onChange={(e) => set('homeCountry', e.target.value)} />
          </label>
          <label className="field">
            <span>Certification</span>
            <select value={draft.certLevel} onChange={(e) => set('certLevel', e.target.value as CertLevel)}>
              {CERT_LEVELS.map((level) => <option key={level}>{level}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Logged dives</span>
            <input type="number" inputMode="numeric" min={0} max={20000} value={dives} placeholder="e.g. 40" onChange={(e) => setDives(e.target.value)} />
          </label>
          <label className="field">
            <span>Comfortable depth (m)</span>
            <input type="number" inputMode="numeric" min={0} max={130} value={depth} placeholder="e.g. 30" onChange={(e) => setDepth(e.target.value)} />
          </label>
          <label className="row">
            <span className="row-body"><span className="row-title">Nitrox certified</span></span>
            <input className="switch" type="checkbox" role="switch" checked={draft.nitrox} onChange={(e) => set('nitrox', e.target.checked)} />
          </label>
          <label className="row">
            <span className="row-body"><span className="row-title">Prone to seasickness</span></span>
            <input className="switch" type="checkbox" role="switch" checked={draft.seasick} onChange={(e) => set('seasick', e.target.checked)} />
          </label>
        </div>

        <fieldset className="chips-field">
          <legend className="t-headline">Interests</legend>
          <div className="chips">
            {INTERESTS.map((interest) => (
              <label key={interest} className="chip-toggle">
                <input type="checkbox" checked={draft.interests.includes(interest)} onChange={() => toggleInterest(interest)} />
                <span>{interest}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field-block">
          <p className="t-headline">Pace</p>
          <Segmented<Pace>
            name="pace"
            label="Pace"
            value={draft.pace}
            options={PACES.map((p) => ({ value: p, label: p[0]?.toUpperCase() + p.slice(1) }))}
            onChange={(pace) => set('pace', pace)}
          />
        </div>

        <div className="group">
          <label className="field">
            <span>Budget per day (THB)</span>
            <input type="number" inputMode="numeric" min={0} value={budget} placeholder="e.g. 5000" onChange={(e) => setBudget(e.target.value)} />
          </label>
          <label className="field">
            <span>Diet</span>
            <input value={draft.diet} maxLength={80} placeholder="e.g. vegetarian, halal" onChange={(e) => set('diet', e.target.value)} />
          </label>
          <label className="field stacked">
            <span>Anything else</span>
            <textarea value={draft.notes} maxLength={300} rows={3} placeholder="e.g. first time on a wreck, want photos of turtles" onChange={(e) => set('notes', e.target.value)} />
          </label>
        </div>

        <button className="btn btn-block" type="submit">Save profile</button>
      </form>
    </Sheet>
  );
};
