// Pure GitHub helpers shared by the server route, the client cache and tests.
// Everything shown on the page is derived from fields GitHub actually returns;
// the only time series is each repository's own `pushed_at` date.

export const CACHE_KEY = "github-stats-cache-v2";
export const CACHE_TTL_MS = 30 * 60 * 1000;
export const VIEW_MODEL_VERSION = 2;

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const num = (v) => (Number.isFinite(v) ? v : 0);

export function sanitizeRepos(raw) {
  if (!Array.isArray(raw)) return null;
  return raw
    .filter((r) => isObj(r) && typeof r.name === "string" && typeof r.html_url === "string" && !r.fork)
    .map((r) => ({
      id: num(r.id) || r.name,
      name: r.name,
      url: r.html_url,
      description: typeof r.description === "string" ? r.description : "",
      language: typeof r.language === "string" ? r.language : null,
      stars: num(r.stargazers_count),
      forks: num(r.forks_count),
      pushedAt: typeof r.pushed_at === "string" ? r.pushed_at : null,
    }));
}

export function sanitizeUser(raw) {
  if (!isObj(raw) || typeof raw.login !== "string") return null;
  return {
    login: raw.login,
    name: typeof raw.name === "string" ? raw.name : raw.login,
    bio: typeof raw.bio === "string" ? raw.bio : "",
    avatarUrl: typeof raw.avatar_url === "string" ? raw.avatar_url : null,
    publicRepos: num(raw.public_repos),
    followers: num(raw.followers),
    following: num(raw.following),
  };
}

// Repositories grouped by the calendar month of their most recent push,
// over the last `months` months ending at `now`. Honest: one repo counts once,
// in the month it was last pushed. It is not a commit history.
export function lastPushByMonth(repos, now = new Date(), months = 12) {
  const buckets = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    buckets.push({ key: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`, label: d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }), year: d.getUTCFullYear(), count: 0 });
  }
  for (const r of repos) {
    if (!r.pushedAt) continue;
    const d = new Date(r.pushedAt);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const b = buckets.find((x) => x.key === key);
    if (b) b.count += 1;
  }
  return buckets;
}

export function buildViewModel(userRaw, reposRaw, now = new Date()) {
  const user = sanitizeUser(userRaw);
  const repos = sanitizeRepos(reposRaw);
  if (!user || !repos) return null;
  const byStars = [...repos].sort((a, b) => b.stars - a.stars || String(b.pushedAt).localeCompare(String(a.pushedAt)));
  const counts = {};
  for (const r of repos) if (r.language) counts[r.language] = (counts[r.language] || 0) + 1;
  const withLanguage = Object.values(counts).reduce((a, b) => a + b, 0);
  const languages = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, count]) => ({ name, count, pct: withLanguage ? Math.round((count / withLanguage) * 100) : 0 }));
  return {
    version: VIEW_MODEL_VERSION,
    fetchedAt: now.toISOString(),
    user,
    totals: { repos: repos.length, stars: repos.reduce((a, r) => a + r.stars, 0), reposWithLanguage: withLanguage },
    top: byStars.slice(0, 6),
    starLeaders: byStars.filter((r) => r.stars > 0).slice(0, 5),
    languages,
    pushes: lastPushByMonth(repos, now),
  };
}

export function isValidViewModel(vm) {
  return (
    isObj(vm) &&
    vm.version === VIEW_MODEL_VERSION &&
    typeof vm.fetchedAt === "string" &&
    isObj(vm.user) &&
    isObj(vm.totals) &&
    Array.isArray(vm.top) &&
    Array.isArray(vm.languages) &&
    Array.isArray(vm.pushes)
  );
}
