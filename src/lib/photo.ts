// Profile photos are cropped to a small square JPEG and kept as a data URL.

export const PHOTO_SIZE = 256;
export const MAX_PHOTO_CHARS = 400_000;
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const PHOTO_PATTERN = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;

export const sanitizePhoto = (raw: unknown): string | null =>
  typeof raw === 'string' && raw.length <= MAX_PHOTO_CHARS && PHOTO_PATTERN.test(raw) ? raw : null;

export class PhotoError extends Error {}

const loadImage = async (file: File): Promise<CanvasImageSource & { width: number; height: number }> => {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file);
    } catch {
      /* fall back to <img> below */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
};

// Centre-crops the picked image to a square and shrinks it.
export const toProfilePhoto = async (file: File): Promise<string> => {
  if (!file.type.startsWith('image/')) throw new PhotoError('That file isn’t an image.');
  if (file.size > MAX_FILE_BYTES) throw new PhotoError('That image is too large. Try one under 25 MB.');
  let image;
  try {
    image = await loadImage(file);
  } catch {
    throw new PhotoError('Couldn’t open that image. Try a JPEG or PNG.');
  }
  const side = Math.min(image.width, image.height);
  if (!side) throw new PhotoError('That image is empty.');
  const canvas = document.createElement('canvas');
  canvas.width = PHOTO_SIZE;
  canvas.height = PHOTO_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new PhotoError('This browser can’t process images.');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, (image.width - side) / 2, (image.height - side) / 2, side, side, 0, 0, PHOTO_SIZE, PHOTO_SIZE);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.86);
  if (!sanitizePhoto(dataUrl)) throw new PhotoError('Couldn’t save that image.');
  return dataUrl;
};
