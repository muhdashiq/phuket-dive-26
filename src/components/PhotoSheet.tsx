import { useRef, useState, type ChangeEvent } from 'react';
import { PhotoError, toProfilePhoto } from '../lib/photo';
import { Icon } from './Icon';
import { Sheet } from './Sheet';
import { useToast } from './Toast';
import { Avatar } from './ui';

type PhotoSheetProps = {
  open: boolean;
  onClose: () => void;
  name: string;
  photo: string | null;
  onSave: (dataUrl: string) => boolean;
  onRemove: () => void;
};

export const PhotoSheet = ({ open, onClose, name, photo, onSave, onRemove }: PhotoSheetProps) => {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const library = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);

  const onPick = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await toProfilePhoto(file);
      if (onSave(dataUrl)) {
        toast({ message: 'Profile photo updated', tone: 'success' });
        onClose();
      } else {
        toast({ message: 'This browser has no room to save the photo', tone: 'error' });
      }
    } catch (error) {
      toast({ message: error instanceof PhotoError ? error.message : 'Couldn’t use that photo', tone: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Profile photo">
      <div className="photo-preview">
        <Avatar name={name} photo={photo} size={112} />
        <p className="t-foot">Cropped to a square and kept on this device only.</p>
      </div>
      <input ref={library} type="file" accept="image/*" hidden onChange={onPick} />
      <input ref={camera} type="file" accept="image/*" capture="user" hidden onChange={onPick} />
      <div className="group">
        <button type="button" className="row row-icon" disabled={busy} onClick={() => library.current?.click()}>
          <span className="tile-icon"><Icon name="photo" size={18} /></span>
          <span className="row-body"><span className="row-title">{busy ? 'Preparing photo…' : 'Choose from library'}</span></span>
        </button>
        <button type="button" className="row row-icon" disabled={busy} onClick={() => camera.current?.click()}>
          <span className="tile-icon gray"><Icon name="camera" size={18} /></span>
          <span className="row-body"><span className="row-title">Take a photo</span></span>
        </button>
        {photo && (
          <button
            type="button"
            className="row row-icon destructive"
            disabled={busy}
            onClick={() => {
              onRemove();
              toast({ message: 'Photo removed', tone: 'info' });
              onClose();
            }}
          >
            <span className="tile-icon red"><Icon name="trash" size={18} /></span>
            <span className="row-body"><span className="row-title">Remove photo</span></span>
          </button>
        )}
      </div>
    </Sheet>
  );
};
