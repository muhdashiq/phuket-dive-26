import { useEffect, useState } from 'react';
import { getDay } from '../data/trip';
import type { DayId } from '../data/types';
import { formatDateTime, formatDuration, TRIP_TZ } from '../lib/dates';
import { delivered, KIND_LABELS, REMINDER_KINDS, upcoming, type NotifyState, type Reminder, type ReminderKind } from '../lib/reminders';
import { currentPermission, notifySupport, requestPermission, showAlert, type NotifyPermission } from '../lib/systemNotify';
import { Icon, type IconName } from './Icon';
import { Sheet } from './Sheet';
import { useToast } from './Toast';
import { EmptyState } from './ui';

const KIND_STYLE: Record<ReminderKind, { icon: IconName; tile: string }> = {
  plan: { icon: 'today', tile: '' },
  weather: { icon: 'rain', tile: 'amber' },
  checklist: { icon: 'checklist', tile: 'green' },
  note: { icon: 'note', tile: 'indigo' },
};

const ago = (ms: number) => (ms < 6e4 ? 'Just now' : `${formatDuration(ms)} ago`);

type ReminderRowProps = { reminder: Reminder; unread?: boolean; when: string; onOpen: (day: DayId) => void };

const ReminderRow = ({ reminder, unread = false, when, onOpen }: ReminderRowProps) => {
  const style = KIND_STYLE[reminder.kind];
  const day = getDay(reminder.day);
  return (
    <button type="button" className={`row row-icon notif-row${unread ? ' unread' : ''}`} onClick={() => onOpen(reminder.day)}>
      <span className={`tile-icon ${style.tile}`}><Icon name={style.icon} size={18} /></span>
      <span className="row-body">
        <span className="notif-top">
          <span className="row-title">{reminder.title}</span>
          <span className="t-cap">{when}</span>
        </span>
        <span className="row-sub">{reminder.body}</span>
        <span className="t-cap">{day ? `${day.dow} ${day.dom} · ` : ''}{KIND_LABELS[reminder.kind].label}</span>
      </span>
      {unread && <span className="unread-dot" aria-label="Unread" />}
    </button>
  );
};

type CenterProps = {
  open: boolean;
  onClose: () => void;
  reminders: Reminder[];
  state: NotifyState;
  readBefore: string[];
  now: number;
  onOpenDay: (day: DayId) => void;
  onClearAll: (ids: string[]) => void;
  onOpenSettings: () => void;
};

// The in-app notification list, opened from the bell on Today.
export const NotificationCenter = ({ open, onClose, reminders, state, readBefore, now, onOpenDay, onClearAll, onOpenSettings }: CenterProps) => {
  const arrived = delivered(reminders, state, now);
  const next = upcoming(reminders, state, now);
  const support = notifySupport();
  const openDay = (day: DayId) => {
    onClose();
    onOpenDay(day);
  };

  return (
    <Sheet open={open} onClose={onClose} title="Notifications">
      {!state.system && support !== 'unsupported' && (
        <button type="button" className="notif-banner" onClick={onOpenSettings}>
          <Icon name="bell" size={20} />
          <span>
            <b>Get alerts on this device</b>
            <span className="t-foot">Pickups, cash reminders and weather warnings as they come up.</span>
          </span>
          <Icon name="chevronRight" size={16} />
        </button>
      )}

      {arrived.length === 0 ? (
        <EmptyState icon="bell" title="You’re all caught up" text="Reminders for pickups, weather and your checklist appear here when they’re due." />
      ) : (
        <div className="section" style={{ marginTop: 0 }}>
          <div className="section-head">
            <h3 className="t-headline">Recent</h3>
            <button className="btn btn-plain btn-small" type="button" onClick={() => onClearAll(arrived.map((r) => r.id))}>Clear all</button>
          </div>
          <div className="group">
            {arrived.map((r) => (
              <ReminderRow key={r.id} reminder={r} unread={!readBefore.includes(r.id)} when={ago(now - r.at)} onOpen={openDay} />
            ))}
          </div>
        </div>
      )}

      {next.length > 0 && (
        <div className="section" style={{ marginTop: 8 }}>
          <div className="section-head"><h3 className="t-headline">Coming up</h3></div>
          <div className="group">
            {next.map((r) => (
              <ReminderRow key={r.id} reminder={r} when={formatDateTime(r.at, TRIP_TZ)} onOpen={openDay} />
            ))}
          </div>
        </div>
      )}

      <button className="btn btn-tinted btn-block" type="button" onClick={onOpenSettings}>
        <Icon name="settings" size={18} />
        Notification settings
      </button>
    </Sheet>
  );
};

type SettingsProps = {
  open: boolean;
  onClose: () => void;
  state: NotifyState;
  onChange: (update: (state: NotifyState) => NotifyState) => void;
};

const PERMISSION_TEXT: Record<NotifyPermission, string> = {
  granted: 'Allowed',
  denied: 'Blocked in browser settings',
  default: 'Not asked yet',
  unsupported: 'Not available',
};

export const NotificationSettings = ({ open, onClose, state, onChange }: SettingsProps) => {
  const toast = useToast();
  const support = notifySupport();
  const [permission, setPermission] = useState<NotifyPermission>(currentPermission);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    if (open) setPermission(currentPermission());
  }, [open]);

  const toggleSystem = async (on: boolean) => {
    if (!on) {
      onChange((s) => ({ ...s, system: false }));
      return;
    }
    setAsking(true);
    const result = await requestPermission();
    setAsking(false);
    setPermission(result);
    if (result === 'granted') {
      onChange((s) => ({ ...s, system: true }));
      toast({ message: 'Alerts are on for this device', tone: 'success' });
    } else if (result === 'denied') {
      toast({ message: 'Notifications are blocked. Allow them in your browser’s site settings.', tone: 'error' });
    }
  };

  const test = async () => {
    const ok = await showAlert({ id: 'test', title: 'Phuket Dive Week', body: 'Alerts are working. You’ll get trip reminders like this one.', hash: '#trip' });
    toast(ok ? { message: 'Test alert sent', tone: 'success' } : { message: 'Couldn’t show an alert. Check notification permission.', tone: 'error' });
  };

  return (
    <Sheet open={open} onClose={onClose} title="Notification settings">
      <div className="section" style={{ marginTop: 0 }}>
        <div className="group">
          <label className="row row-icon">
            <span className="tile-icon red"><Icon name="bell" size={18} /></span>
            <span className="row-body">
              <span className="row-title">Alerts on this device</span>
              <span className="row-sub">{asking ? 'Waiting for your answer…' : `Permission: ${PERMISSION_TEXT[permission]}`}</span>
            </span>
            <input
              className="switch"
              type="checkbox"
              role="switch"
              checked={state.system && permission === 'granted'}
              disabled={support !== 'supported' || asking}
              onChange={(e) => toggleSystem(e.target.checked)}
            />
          </label>
          {state.system && permission === 'granted' && (
            <button type="button" className="row row-icon" onClick={test}>
              <span className="tile-icon gray"><Icon name="sparkles" size={18} /></span>
              <span className="row-body"><span className="row-title">Send a test alert</span></span>
            </button>
          )}
        </div>
        <p className="section-foot t-foot">
          {support === 'ios-needs-install'
            ? 'On iPhone and iPad, add Dive Week to your Home Screen first: tap Share, then Add to Home Screen. Open it from there and turn alerts on.'
            : support === 'unsupported'
              ? 'This browser doesn’t support notifications. Reminders still appear under the bell.'
              : 'Alerts appear while Dive Week is open or running in the background. There’s no server, so a fully closed app can’t wake your phone. The bell always keeps the full list.'}
        </p>
      </div>

      <div className="section" style={{ marginTop: 4 }}>
        <div className="section-head"><h3 className="t-headline">Remind me about</h3></div>
        <div className="group">
          {REMINDER_KINDS.map((kind) => (
            <label key={kind} className="row row-icon">
              <span className={`tile-icon ${KIND_STYLE[kind].tile}`}><Icon name={KIND_STYLE[kind].icon} size={18} /></span>
              <span className="row-body">
                <span className="row-title">{KIND_LABELS[kind].label}</span>
                <span className="row-sub">{KIND_LABELS[kind].detail}</span>
              </span>
              <input
                className="switch"
                type="checkbox"
                role="switch"
                checked={state.kinds[kind]}
                onChange={(e) => onChange((s) => ({ ...s, kinds: { ...s.kinds, [kind]: e.target.checked } }))}
              />
            </label>
          ))}
        </div>
      </div>
    </Sheet>
  );
};
