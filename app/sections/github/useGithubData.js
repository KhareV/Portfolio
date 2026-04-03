"use client";

import { useEffect, useMemo, useState } from "react";

import {
  GITHUB_CACHE_KEY,
  GITHUB_CACHE_TTL_MS,
  GITHUB_USERNAME,
  LANG_COLORS,
} from "./constants";

const buildGithubHeaders = () => {
  const headers = {
    Accept: "application/vnd.github+json",
  };

  const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN?.trim();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const readGithubCache = () => {
  if (typeof window === "undefined") return null;

  try {
    const cached = localStorage.getItem(GITHUB_CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    if (!parsed || typeof parsed !== "object") return null;

    return parsed;
  } catch {
    return null;
  }
};

const writeGithubCache = (payload) => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(GITHUB_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota / private mode errors.
  }
};

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

const useGithubData = () => {
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [langData, setLangData] = useState([]);
  const [totalStars, setTotalStars] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fromCache, setFromCache] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const applyViewModel = (payload) => {
      setUser(payload?.user ?? null);
      setRepos(payload?.repos ?? []);
      setTotalStars(payload?.totalStars ?? 0);
      setLangData(payload?.langData ?? []);
    };

    const cached = readGithubCache();

    if (cached) {
      applyViewModel(cached);
      setFromCache(true);
      setLoading(false);
    }

    const isCacheFresh =
      cached?.cachedAt && Date.now() - cached.cachedAt < GITHUB_CACHE_TTL_MS;

    if (isCacheFresh) {
      return () => {
        controller.abort();
      };
    }

    if (cached) {
      setIsRefreshing(true);
    }

    const fetchAll = async () => {
      try {
        const headers = buildGithubHeaders();

        const [uRes, rRes] = await Promise.all([
          fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
            headers,
            signal: controller.signal,
          }),
          fetch(
            `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=pushed`,
            {
              headers,
              signal: controller.signal,
            },
          ),
        ]);

        if (!uRes.ok || !rRes.ok) {
          if (uRes.status === 403 || rRes.status === 403) {
            throw new Error(
              "GitHub API rate limit reached. Please try again later.",
            );
          }

          throw new Error("Unable to fetch GitHub data.");
        }

        const userData = await uRes.json();
        const reposData = await rRes.json();
        const payload = buildGithubViewModel(userData, reposData);

        applyViewModel(payload);
        setFromCache(false);
        setError("");
        writeGithubCache(payload);
      } catch (fetchError) {
        if (fetchError?.name === "AbortError") {
          return;
        }

        if (!cached) {
          setError(fetchError?.message || "Could not load GitHub data.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    fetchAll();

    return () => {
      controller.abort();
    };
  }, []);

  const topRepos = useMemo(() => repos.slice(0, 6), [repos]);

  return {
    username: GITHUB_USERNAME,
    user,
    repos,
    topRepos,
    langData,
    totalStars,
    loading,
    error,
    fromCache,
    isRefreshing,
  };
};

export default useGithubData;
