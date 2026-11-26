// GET /api/github → 200 view model | 502/503 { error, rateLimited? }
// Runs on the server so an optional GITHUB_TOKEN never reaches the browser.
// Responses are cached at the edge for 30 minutes (stale-while-revalidate),
// so visitors share one upstream request instead of each spending their own
// unauthenticated rate limit.
import { buildViewModel } from "../../lib/github.js";
import { profile } from "../../content/site.js";

export const dynamic = "force-dynamic";

const API = process.env.GITHUB_API_BASE || "https://api.github.com";
const TIMEOUT_MS = 6000;

export async function GET() {
  const headers = { Accept: "application/vnd.github+json", "User-Agent": "portfolio-site" };
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;
  const user = profile.githubUser;

  try {
    const [u, r] = await Promise.all([
      fetch(`${API}/users/${user}`, { headers, signal: AbortSignal.timeout(TIMEOUT_MS), next: { revalidate: 1800 } }),
      fetch(`${API}/users/${user}/repos?per_page=100&sort=pushed`, { headers, signal: AbortSignal.timeout(TIMEOUT_MS), next: { revalidate: 1800 } }),
    ]);
    if (!u.ok || !r.ok) {
      const rateLimited = [u, r].some((x) => x.status === 403 || x.status === 429);
      return Response.json(
        { error: rateLimited ? "GitHub rate limit reached." : "GitHub is unavailable.", rateLimited },
        { status: rateLimited ? 503 : 502, headers: { "Cache-Control": "no-store" } },
      );
    }
    const vm = buildViewModel(await u.json(), await r.json());
    if (!vm) {
      return Response.json({ error: "GitHub returned an unexpected response." }, { status: 502, headers: { "Cache-Control": "no-store" } });
    }
    return Response.json(vm, {
      headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400" },
    });
  } catch (error) {
    console.warn("[github] upstream failed:", error?.name || error?.message);
    return Response.json({ error: "GitHub is unavailable." }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
