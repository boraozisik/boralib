import { isAdmin } from "@/lib/auth";

// Lets the admin's browser load an image from another site (which would
// normally be blocked by CORS) so it can be resized and saved as a cover.
// Admin-only, so it can't be used as an open proxy.

const MAX_BYTES = 15 * 1024 * 1024;

/** Blocks requests to this machine or a private network (e.g. "localhost", "10.0.0.5"). */
function isPrivateHost(hostname: string) {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host === "::1" || host === "::") return true;
  if (/^(fc|fd|fe8|fe9|fea|feb)/.test(host) && host.includes(":")) return true; // IPv6 private / link-local
  const v4 = host.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (!v4) return false;
  const [a, b] = [Number(v4[1]), Number(v4[2])];
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127)
  );
}

export async function GET(req: Request) {
  if (!(await isAdmin())) return new Response("Forbidden", { status: 403 });

  const raw = new URL(req.url).searchParams.get("url") ?? "";
  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return new Response("The image link is not valid.", { status: 400 });
  }
  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return new Response("The image link must start with http(s).", { status: 400 });
  }
  if (isPrivateHost(target.hostname)) {
    return new Response("The image link is not valid.", { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(target, { signal: AbortSignal.timeout(15_000) });
  } catch {
    return new Response("Could not download the image.", { status: 502 });
  }
  // A redirect could lead somewhere private, so check where it ended up too.
  if (res.url && isPrivateHost(new URL(res.url).hostname)) {
    return new Response("The image link is not valid.", { status: 400 });
  }
  const type = (res.headers.get("content-type") ?? "").split(";")[0].trim();
  if (!res.ok || !type.startsWith("image/")) {
    return new Response("That link doesn't point to an image.", { status: 422 });
  }
  if (Number(res.headers.get("content-length") ?? 0) > MAX_BYTES) {
    return new Response("The image is too large.", { status: 413 });
  }
  const bytes = await res.arrayBuffer();
  if (bytes.byteLength > MAX_BYTES) {
    return new Response("The image is too large.", { status: 413 });
  }
  return new Response(bytes, {
    headers: {
      "Content-Type": type,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
