import { useEffect, useState } from 'react';
import { useTrip } from '../data/trip';
import type { DayId } from '../data/types';
import { tripToText } from '../lib/dayText';
import type { NoteStore } from '../lib/notes';
import type { TodoStore } from '../lib/todos';
import { Icon } from './Icon';
import { Sheet } from './Sheet';
import { useToast } from './Toast';
import { Segmented } from './ui';

type ShareSheetProps = {
  open: boolean;
  onClose: () => void;
  initial: DayId[];
  todos: TodoStore;
  notes: NoteStore;
};

type Detail = 'summary' | 'full';

export const ShareSheet = ({ open, onClose, initial, todos, notes }: ShareSheetProps) => {
  const toast = useToast();
  const { days } = useTrip();
  const [selected, setSelected] = useState<DayId[]>(initial);
  const [detail, setDetail] = useState<Detail>('full');
  const [withChecklist, setWithChecklist] = useState(false);
  const [withNotes, setWithNotes] = useState(false);

  useEffect(() => {
    if (open) setSelected(initial.length ? initial : days.map((d) => d.id));
    // Reset the selection each time the sheet opens.
  }, [open]);

  const chosen = days.filter((d) => selected.includes(d.id));
  const allSelected = chosen.length === days.length;
  const link = window.location.href.split('#')[0] ?? window.location.href;
  const text = tripToText(chosen, { full: detail === 'full', checklist: withChecklist, notes: withNotes }, todos, notes, link);

  const toggle = (id: DayId) => setSelected((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Phuket Dive Week', text });
        onClose();
      } catch {
        /* the user closed the share sheet */
      }
      return;
    }
    await copy();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ message: `${chosen.length} ${chosen.length === 1 ? 'day' : 'days'} copied. Paste it into a chat.`, tone: 'success' });
      onClose();
    } catch {
      toast({ message: 'Couldn’t copy. Select the preview text instead.', tone: 'error' });
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Share with friends">
      <div className="section-head" style={{ padding: 0 }}>
        <p className="t-headline">Days to share</p>
        <button className="btn btn-plain btn-small" type="button" onClick={() => setSelected(allSelected ? [] : days.map((d) => d.id))}>
          {allSelected ? 'Clear all' : 'Select all'}
        </button>
      </div>
      <ul className="checklist">
        {days.map((day) => (
          <li key={day.id} className="check-row">
            <label className="check">
              <input type="checkbox" checked={selected.includes(day.id)} onChange={() => toggle(day.id)} />
              <span className="box"><Icon name="check" /></span>
              <span className="share-day">
                <span className="tnum share-date">{day.dow} {day.dom}</span>
                <span>{day.title}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>

      <Segmented<Detail>
        name="share-detail"
        label="How much to include"
        value={detail}
        options={[{ value: 'summary', label: 'Summary' }, { value: 'full', label: 'Full plan' }]}
        onChange={setDetail}
      />
      <div className="group">
        <label className="row">
          <span className="row-body"><span className="row-title">Include checklists</span></span>
          <input className="switch" type="checkbox" role="switch" checked={withChecklist} onChange={(e) => setWithChecklist(e.target.checked)} />
        </label>
        <label className="row">
          <span className="row-body">
            <span className="row-title">Include my notes</span>
            <span className="row-sub">Off by default; notes are private</span>
          </span>
          <input className="switch" type="checkbox" role="switch" checked={withNotes} onChange={(e) => setWithNotes(e.target.checked)} />
        </label>
      </div>

      <details className="share-preview">
        <summary>Preview</summary>
        <textarea readOnly value={text} rows={10} aria-label="Text that will be shared" />
      </details>

      <button className="btn btn-block" type="button" disabled={chosen.length === 0} onClick={() => void share()}>
        <Icon name="share" size={18} />
        {chosen.length === 0 ? 'Select at least one day' : `Share ${chosen.length} ${chosen.length === 1 ? 'day' : 'days'}`}
      </button>
      {typeof navigator.share === 'function' && chosen.length > 0 && (
        <button className="btn btn-plain" type="button" onClick={() => void copy()}>Copy as text instead</button>
      )}
    </Sheet>
  );
};
