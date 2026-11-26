// Pure helpers for the GitHub stats section: view-model construction, cache /
// API response shape validation and HTTP error mapping. No React or browser
// globals here so they can be unit-tested with `node --test`.

import { LANG_COLORS } from "../sections/github/constants.js";

export const GITHUB_GENERIC_ERROR = "Unable to fetch GitHub data.";
export const GITHUB_RATE_LIMIT_ERROR =
  "GitHub API rate limit reached. Please try again later.";

// Tolerated clock skew for cachedAt values slightly in the future.
const CACHE_FUTURE_SKEW_MS = 5 * 60 * 1000;

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const isFiniteNumber = (value) =>
  typeof value === "number" && Number.isFinite(value);

export const buildGithubViewModel = (userData, reposData) => {
  const safeRepos = Array.isArray(reposData) ? reposData : [];
  const byStars = [...safeRepos].sort(
    (a, b) => b.stargazers_count - a.stargazers_count,
  );

  const stars = safeRepos.reduce(
    (sum, repo) => sum + (repo?.stargazers_count || 0),
    0,
  );

  const counts = {};
  safeRepos.forEach((repo) => {
    if (repo?.language) {
      counts[repo.language] = (counts[repo.language] || 0) + 1;
    }
  });

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const langs = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, count]) => ({
      name,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
      color: LANG_COLORS[name] || "#94A3B8",
    }));

  return {
    user: userData ?? null,
    repos: byStars,
    totalStars: stars,
    langData: langs,
    cachedAt: Date.now(),
  };
};

/** GET /users/:name must be an object with a string login. */
export const isValidGithubUser = (userData) =>
  isPlainObject(userData) &&
  typeof userData.login === "string" &&
  userData.login.length > 0;

/** GET /users/:name/repos must be an array of objects. */
export const isValidGithubRepos = (reposData) =>
  Array.isArray(reposData) && reposData.every(isPlainObject);

const isValidLangEntry = (entry) =>
  isPlainObject(entry) &&
  typeof entry.name === "string" &&
  isFiniteNumber(entry.count) &&
  isFiniteNumber(entry.pct) &&
  typeof entry.color === "string";

/**
 * Validates a parsed localStorage cache payload (as written by
 * buildGithubViewModel). Anything else (missing user, non-array repos,
 * empty `{}`, non-finite or far-future cachedAt) is treated as no cache.
 */
export const isValidGithubCache = (payload, now = Date.now()) => {
  if (!isPlainObject(payload)) return false;
  if (!isValidGithubUser(payload.user)) return false;
  if (!isValidGithubRepos(payload.repos)) return false;
  if (!Array.isArray(payload.langData) || !payload.langData.every(isValidLangEntry)) {
    return false;
  }
  if (!isFiniteNumber(payload.totalStars)) return false;
  if (!isFiniteNumber(payload.cachedAt) || payload.cachedAt <= 0) return false;
  if (payload.cachedAt > now + CACHE_FUTURE_SKEW_MS) return false;
  return true;
};

export const isGithubCacheFresh = (payload, ttlMs, now = Date.now()) =>
  now - payload.cachedAt < ttlMs;

const readHeader = (response, name) => {
  const headers = response?.headers;
  if (!headers) return null;
  if (typeof headers.get === "function") return headers.get(name);
  return headers[name] ?? null;
};

/** True when a GitHub response signals primary/secondary rate limiting. */
export const isRateLimitedResponse = (response) => {
  if (!response) return false;
  if (response.status === 429) return true;
  if (response.status === 403) {
    return readHeader(response, "x-ratelimit-remaining") === "0";
  }
  return false;
};

/**
 * Maps failed GitHub responses to user-facing copy. Only explicit rate-limit
 * signals mention the rate limit; everything else gets the generic message.
 */
export const getGithubErrorMessage = (...responses) =>
  responses.some(isRateLimitedResponse)
    ? GITHUB_RATE_LIMIT_ERROR
    : GITHUB_GENERIC_ERROR;

/** Error whose message is safe to show to visitors. */
export class GithubDisplayError extends Error {
  constructor(message) {
    super(message);
    this.name = "GithubDisplayError";
  }
}

/** Never surface raw exception text (parser errors, "Failed to fetch", ...). */
export const toGithubDisplayMessage = (error) =>
  error instanceof GithubDisplayError ? error.message : GITHUB_GENERIC_ERROR;
