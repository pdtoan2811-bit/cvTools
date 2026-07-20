/**
 * Images are resized in the browser and stored inside the CV as data URLs.
 *
 * No upload endpoint, no bucket, no credentials — a picture you add travels
 * with the document, so a share link is self-contained and nothing has to be
 * configured before the app works. The resize keeps that affordable: a phone
 * photo lands around 25 KB instead of 4 MB.
 */

export const MAX_SOURCE_BYTES = 12 * 1024 * 1024;

const readAsDataUrl = (file: Blob) =>
  new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(new Error("Could not read that file"));
    fr.readAsDataURL(file);
  });

/** Pick the smallest encoding this browser can produce that keeps transparency. */
function encode(canvas: HTMLCanvasElement, needsAlpha: boolean, quality: number) {
  if (needsAlpha) {
    const webp = canvas.toDataURL("image/webp", quality);
    // Safari < 14 ignores the type and hands back a PNG; either is fine.
    return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/png");
  }
  return canvas.toDataURL("image/jpeg", quality);
}

/**
 * Read an image file and return a resized data URL.
 * SVGs pass through untouched — they are already small and scale on their own.
 */
export async function fileToDataUrl(
  file: File,
  { maxPx = 512, quality = 0.82 }: { maxPx?: number; quality?: number } = {},
): Promise<string> {
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error("That image is larger than 12 MB.");
  }
  if (file.type === "image/svg+xml") return readAsDataUrl(file);

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("That file could not be read as an image.");
  }

  const scale = Math.min(1, maxPx / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser could not process the image.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  const needsAlpha = file.type !== "image/jpeg";
  return encode(canvas, needsAlpha, quality);
}

/** Rough byte size of a data URL, for warning about oversized documents. */
export function dataUrlBytes(url: string): number {
  const i = url.indexOf(",");
  if (!url.startsWith("data:") || i < 0) return 0;
  return Math.round((url.length - i - 1) * 0.75);
}
