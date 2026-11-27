"use client";

import { useEffect, useMemo, useState } from "react";

import {
  GITHUB_CACHE_KEY,
  GITHUB_CACHE_TTL_MS,
  GITHUB_FETCH_TIMEOUT_MS,
  GITHUB_USERNAME,
} from "./constants";
import {
  GithubDisplayError,
  GITHUB_GENERIC_ERROR,
  buildGithubViewModel,
  getGithubErrorMessage,
  isGithubCacheFresh,
  isValidGithubCache,
  isValidGithubRepos,
  isValidGithubUser,
  toGithubDisplayMessage,
} from "../../lib/githubData.js";

export { buildGithubViewModel };

// Unauthenticated on purpose: any token in client code would be public.
const GITHUB_HEADERS = {
  Accept: "application/vnd.github+json",
};

const removeGithubCache = () => {
  try {
    localStorage.removeItem(GITHUB_CACHE_KEY);
  } catch {
    // Ignore storage access errors.
  }
};

const readGithubCache = () => {
  if (typeof window === "undefined") return null;

  try {
    const cached = localStorage.getItem(GITHUB_CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    if (!isValidGithubCache(parsed)) {
      removeGithubCache();
      return null;
    }

    return parsed;
  } catch {
    removeGithubCache();
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

const useGithubData = () => {
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [langData, setLangData] = useState([]);
  const [totalStars, setTotalStars] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fromCache, setFromCache] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;
    let timeoutId = null;

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

    if (cached && isGithubCacheFresh(cached, GITHUB_CACHE_TTL_MS)) {
      return () => {
        disposed = true;
        controller.abort();
      };
    }

    if (cached) {
      setIsRefreshing(true);
    }

    const fetchAll = async () => {
      timeoutId = window.setTimeout(
        () => controller.abort(),
        GITHUB_FETCH_TIMEOUT_MS,
      );

      try {
        const [uRes, rRes] = await Promise.all([
          fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
            headers: GITHUB_HEADERS,
            signal: controller.signal,
          }),
          fetch(
            `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=pushed`,
            {
              headers: GITHUB_HEADERS,
              signal: controller.signal,
            },
          ),
        ]);

        if (!uRes.ok || !rRes.ok) {
          throw new GithubDisplayError(getGithubErrorMessage(uRes, rRes));
        }

        const userData = await uRes.json();
        const reposData = await rRes.json();

        if (!isValidGithubUser(userData) || !isValidGithubRepos(reposData)) {
          throw new GithubDisplayError(GITHUB_GENERIC_ERROR);
        }

        const payload = buildGithubViewModel(userData, reposData);

        if (disposed) return;
        applyViewModel(payload);
        setFromCache(false);
        setRefreshFailed(false);
        setError("");
        writeGithubCache(payload);
      } catch (fetchError) {
        // Unmounted (or StrictMode re-run): nothing to report.
        if (disposed) return;

        // Timeouts surface as AbortError here and are treated as failures.
        if (cached) {
          setRefreshFailed(true);
        } else {
          setError(toGithubDisplayMessage(fetchError));
        }
      } finally {
        window.clearTimeout(timeoutId);
        if (!disposed) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    fetchAll();

    return () => {
      disposed = true;
      window.clearTimeout(timeoutId);
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
    refreshFailed,
  };
};

export default useGithubData;
