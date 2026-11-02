import { useEffect, useRef, useState } from 'react';
import type { PhotoInfo } from '../data/types';

const COMMONS = 'https://commons.wikimedia.org/wiki/';
const fileUrl = (file: string, width: number) => `${COMMONS}Special:FilePath/${encodeURIComponent(file)}?width=${width}`;
const pageUrl = (file: string) => `${COMMONS}File:${encodeURIComponent(file)}`;

type PhotoProps = { photo: PhotoInfo; compact?: boolean };

export const Photo = ({ photo, compact = false }: PhotoProps) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);

  if (failed) return null;

  return (
    <>
      <figure className={`photo${loaded ? ' loaded' : ''}${compact ? ' compact' : ''}`}>
        <button className="photo-btn" type="button" aria-label={`Enlarge photo: ${photo.alt}`} onClick={() => setOpen(true)}>
          <img
            src={fileUrl(photo.file, 960)}
            srcSet={[640, 960, 1280].map((w) => `${fileUrl(photo.file, w)} ${w}w`).join(', ')}
            sizes="(min-width: 1000px) 1000px, 100vw"
            alt={photo.alt}
            loading="lazy"
            decoding="async"
            width={1280}
            height={720}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        </button>
        <figcaption>
          <span>{photo.caption}</span>
          <a href={pageUrl(photo.file)} target="_blank" rel="noopener">
            Photo: Wikimedia Commons
          </a>
        </figcaption>
      </figure>
      {open && <Lightbox photo={photo} onClose={() => setOpen(false)} />}
    </>
  );
};

type LightboxProps = { photo: PhotoInfo; onClose: () => void };

const Lightbox = ({ photo, onClose }: LightboxProps) => {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.documentElement.classList.add('lb-lock');
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('lb-lock');
      previous?.focus();
    };
  }, [onClose]);

  return (
    <div className="lightbox open" role="dialog" aria-modal="true" aria-label="Photo" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <button ref={closeRef} className="lb-close" type="button" aria-label="Close photo" onClick={onClose}>
        ×
      </button>
      <img src={fileUrl(photo.file, 1600)} alt={photo.alt} />
      <p className="lb-cap">
        <span>{photo.caption}</span>
        <a href={pageUrl(photo.file)} target="_blank" rel="noopener">
          Photo: Wikimedia Commons
        </a>
      </p>
    </div>
  );
};
