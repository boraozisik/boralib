// Runs in the browser: shrinks a cover image before upload so it takes up
// ~30-80 KB in the database instead of several MB.

const MAX_WIDTH = 480;
const MAX_HEIGHT = 720;
const QUALITY = 0.82;

function toBlob(canvas: HTMLCanvasElement, type: string) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

export async function resizeImage(source: Blob): Promise<File> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(source);
  } catch {
    throw new Error("This image couldn't be read. Try a JPG, PNG or WEBP file.");
  }
  const scale = Math.min(1, MAX_WIDTH / bitmap.width, MAX_HEIGHT / bitmap.height);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // WEBP is smallest; browsers that can't encode it return PNG, so fall back to JPEG.
  let blob = await toBlob(canvas, "image/webp");
  if (!blob || blob.type !== "image/webp") blob = await toBlob(canvas, "image/jpeg");
  if (!blob) throw new Error("The image couldn't be processed.");

  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  return new File([blob], `cover.${ext}`, { type: blob.type });
}

/** Downloads an image from a link (through our admin-only proxy) and resizes it. */
export async function resizeImageFromUrl(url: string): Promise<File> {
  const res = await fetch(`/api/image-proxy?url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error((await res.text()) || "Could not download the image.");
  return resizeImage(await res.blob());
}
