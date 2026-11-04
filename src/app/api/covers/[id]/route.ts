import { COVER_ID_RE, getCover } from "@/lib/covers";

const ONE_YEAR = "public, max-age=31536000, immutable";

export async function GET(_req: Request, ctx: RouteContext<"/api/covers/[id]">) {
  const { id } = await ctx.params;
  const cover = COVER_ID_RE.test(id) ? await getCover(id) : undefined;
  if (!cover) return new Response("Not found", { status: 404 });

  return new Response(cover.data, {
    headers: {
      "Content-Type": cover.mime,
      // A cover id never changes its image (a new cover gets a new id), so
      // browsers and Netlify's CDN can keep it forever. "durable" shares the
      // cached copy across Netlify's edge, so the database is rarely hit.
      "Cache-Control": ONE_YEAR,
      "Netlify-CDN-Cache-Control": `${ONE_YEAR}, durable`,
    },
  });
}
