import { test } from "node:test";
import assert from "node:assert/strict";

import {
  GITHUB_GENERIC_ERROR,
  GITHUB_RATE_LIMIT_ERROR,
  GithubDisplayError,
  buildGithubViewModel,
  getGithubErrorMessage,
  isGithubCacheFresh,
  isRateLimitedResponse,
  isValidGithubCache,
  isValidGithubRepos,
  isValidGithubUser,
  toGithubDisplayMessage,
} from "../../app/lib/githubData.js";
import {
  GITHUB_CACHE_KEY,
  GITHUB_CACHE_TTL_MS,
  GITHUB_FETCH_TIMEOUT_MS,
} from "../../app/sections/github/constants.js";

const NOW = 1_800_000_000_000;

const fixtureUser = { login: "KhareV", avatar_url: "https://example.invalid/a.png" };
const fixtureRepos = [
  { id: 1, name: "a", stargazers_count: 2, language: "JavaScript" },
  { id: 2, name: "b", stargazers_count: 9, language: "Python" },
  { id: 3, name: "c", stargazers_count: 0, language: "JavaScript" },
  { id: 4, name: "d", stargazers_count: 5, language: null },
];

const validCache = (overrides = {}) => ({
  ...buildGithubViewModel(fixtureUser, fixtureRepos),
  cachedAt: NOW - 1000,
  ...overrides,
});

const res = (status, headers = {}) => ({ status, headers: new Headers(headers) });

test("cache key / TTL / timeout constants are unchanged or as specified", () => {
  assert.equal(GITHUB_CACHE_KEY, "github-stats-cache-v1");
  assert.equal(GITHUB_CACHE_TTL_MS, 30 * 60 * 1000);
  assert.equal(GITHUB_FETCH_TIMEOUT_MS, 10000);
});

test("buildGithubViewModel computations are unchanged", () => {
  const vm = buildGithubViewModel(fixtureUser, fixtureRepos);
  assert.deepEqual(
    vm.repos.map((r) => r.id),
    [2, 4, 1, 3],
    "sorted by stars desc",
  );
  assert.equal(vm.totalStars, 16);
  assert.deepEqual(vm.langData, [
    { name: "JavaScript", count: 2, pct: 67, color: "#F7DF1E" },
    { name: "Python", count: 1, pct: 33, color: "#3776AB" },
  ]);
  assert.equal(vm.user, fixtureUser);
  assert.equal(typeof vm.cachedAt, "number");
});

test("isValidGithubCache accepts a cache written by buildGithubViewModel", () => {
  assert.equal(isValidGithubCache(validCache(), NOW), true);
  // Round-trip through JSON like localStorage does.
  assert.equal(isValidGithubCache(JSON.parse(JSON.stringify(validCache())), NOW), true);
});

test("isValidGithubCache rejects malformed / empty / tampered caches", () => {
  const bad = {
    "null": null,
    "array": [],
    "string": "x",
    "empty object": {},
    "repos string (crash repro)": validCache({ repos: "oops" }),
    "repos with null entry": validCache({ repos: [null] }),
    "langData object": validCache({ langData: {} }),
    "langData bad entry": validCache({ langData: [{ name: 1 }] }),
    "user null": validCache({ user: null }),
    "user without login": validCache({ user: {} }),
    "totalStars string": validCache({ totalStars: "9" }),
    "totalStars NaN": validCache({ totalStars: Number.NaN }),
    "missing cachedAt": validCache({ cachedAt: undefined }),
    "cachedAt string": validCache({ cachedAt: String(NOW) }),
    "cachedAt far future": validCache({ cachedAt: NOW + 24 * 60 * 60 * 1000 }),
    "cachedAt zero": validCache({ cachedAt: 0 }),
  };
  for (const [name, payload] of Object.entries(bad)) {
    assert.equal(isValidGithubCache(payload, NOW), false, name);
  }
});

test("isGithubCacheFresh uses the 30 min TTL", () => {
  assert.equal(isGithubCacheFresh({ cachedAt: NOW - 1000 }, GITHUB_CACHE_TTL_MS, NOW), true);
  assert.equal(
    isGithubCacheFresh({ cachedAt: NOW - GITHUB_CACHE_TTL_MS }, GITHUB_CACHE_TTL_MS, NOW),
    false,
  );
  assert.equal(
    isGithubCacheFresh({ cachedAt: NOW - 30 * 24 * 3600 * 1000 }, GITHUB_CACHE_TTL_MS, NOW),
    false,
  );
});

test("API response shape validation", () => {
  assert.equal(isValidGithubUser(fixtureUser), true);
  assert.equal(isValidGithubUser({ message: "Not Found" }), false);
  assert.equal(isValidGithubUser(null), false);
  assert.equal(isValidGithubUser([]), false);
  assert.equal(isValidGithubRepos(fixtureRepos), true);
  assert.equal(isValidGithubRepos([]), true);
  assert.equal(isValidGithubRepos({ message: "x" }), false, "object 200 is rejected (D-13)");
  assert.equal(isValidGithubRepos([1, 2]), false);
  assert.equal(isValidGithubRepos(null), false);
});

test("403 is only a rate limit when x-ratelimit-remaining is 0; 429 always", () => {
  assert.equal(isRateLimitedResponse(res(403, { "x-ratelimit-remaining": "0" })), true);
  assert.equal(isRateLimitedResponse(res(403, { "x-ratelimit-remaining": "12" })), false);
  assert.equal(isRateLimitedResponse(res(403)), false);
  assert.equal(isRateLimitedResponse(res(429)), true);
  assert.equal(isRateLimitedResponse(res(500)), false);
  assert.equal(isRateLimitedResponse(res(200)), false);
  assert.equal(isRateLimitedResponse({ status: 403, headers: { "x-ratelimit-remaining": "0" } }), true);
});

test("getGithubErrorMessage maps either failing response", () => {
  assert.equal(getGithubErrorMessage(res(200), res(429)), GITHUB_RATE_LIMIT_ERROR);
  assert.equal(
    getGithubErrorMessage(res(403, { "x-ratelimit-remaining": "0" }), res(200)),
    GITHUB_RATE_LIMIT_ERROR,
  );
  assert.equal(getGithubErrorMessage(res(403), res(200)), GITHUB_GENERIC_ERROR);
  assert.equal(getGithubErrorMessage(res(401), res(500)), GITHUB_GENERIC_ERROR);
});

test("raw exception text is never shown", () => {
  assert.equal(
    toGithubDisplayMessage(new SyntaxError("Unexpected token '<', \"<html>\" is not valid JSON")),
    GITHUB_GENERIC_ERROR,
  );
  assert.equal(toGithubDisplayMessage(new TypeError("Failed to fetch")), GITHUB_GENERIC_ERROR);
  assert.equal(
    toGithubDisplayMessage(new DOMException("signal is aborted without reason", "AbortError")),
    GITHUB_GENERIC_ERROR,
  );
  assert.equal(toGithubDisplayMessage(undefined), GITHUB_GENERIC_ERROR);
  assert.equal(
    toGithubDisplayMessage(new GithubDisplayError(GITHUB_RATE_LIMIT_ERROR)),
    GITHUB_RATE_LIMIT_ERROR,
  );
});
