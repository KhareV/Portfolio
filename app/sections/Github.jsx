"use client";

import Image from "next/image";
import { useMemo } from "react";

import { ContribBar, DonutChart, ImpactAreaChart, RepoBarChart } from "./github/charts";
import { RepoCard, StatCard } from "./github/cards";
import { SKILL_GROUPS } from "./github/constants";
import useGithubData from "./github/useGithubData";

const PANEL_CLASSNAME =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

const Github = () => {
  const {
    username,
    user,
    repos,
    topRepos,
    langData,
    totalStars,
    loading,
    error,
    fromCache,
    isRefreshing,
  } = useGithubData();

  const skillGroups = useMemo(() => Object.entries(SKILL_GROUPS), []);
  const showAnalytics = repos.length > 1;

  if (loading) {
    return (
      <section className="w-full bg-[#FEFFFC] py-6">
        <div className="mx-auto w-full max-w-[1280px] rounded-[20px] border border-slate-200 bg-[#FDFEFB] p-6">
          <div className="grid place-items-center py-12" role="status" aria-live="polite">
            <div className="mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-emerald-500" />
            <p className="text-sm text-slate-500">Fetching GitHub data...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full bg-[#FEFFFC] py-6">
        <div className="mx-auto w-full max-w-[1280px] rounded-[20px] border border-slate-200 bg-[#FDFEFB] p-6">
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-8 text-center">
            <p className="text-sm font-medium text-rose-700">{error}</p>
            <p className="mt-2 text-xs text-rose-600">GitHub stats could not be loaded right now.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-[#FEFFFC] py-6" aria-label="GitHub analytics section">
      <div className="mx-auto w-full max-w-[1280px] rounded-[20px] border border-slate-200 bg-[#FDFEFB] p-4 sm:p-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 px-2">
          <div className="space-y-1">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-600">
              Overview
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">GitHub Stats</h2>
          </div>

          <div className="text-xs font-medium text-slate-500" aria-live="polite">
            {isRefreshing ? (
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
                Refreshing latest data...
              </span>
            ) : fromCache ? (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700">
                Loaded from fresh cache
              </span>
            ) : null}
          </div>
        </div>

        <div className={`${PANEL_CLASSNAME} mb-5 flex flex-wrap items-center gap-6`}>
          {user?.avatar_url && (
            <a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="relative shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              aria-label={`Open ${username} GitHub profile`}
            >
              <Image
                src={user.avatar_url}
                alt={username}
                width={64}
                height={64}
                sizes="64px"
                className="rounded-full"
              />
              <span className="pointer-events-none absolute -inset-[3px] rounded-full border-2 border-emerald-500" />
            </a>
          )}

          <div className="min-w-[180px] flex-1">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">{user?.name || username}</h3>
            <a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm font-semibold text-emerald-600 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              @{username}
            </a>
            {user?.bio && <p className="mt-2 text-sm leading-6 text-slate-500">{user.bio}</p>}
          </div>

          {showAnalytics && (
            <div className="w-full max-w-[220px] sm:w-[220px]">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                Activity Trend
              </p>
              <ContribBar repos={repos} />
            </div>
          )}
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Repositories"
            value={user?.public_repos}
            accent="#10B981"
            link={`https://github.com/${username}?tab=repositories`}
          />
          <StatCard
            label="Total Stars"
            value={totalStars}
            accent="#0284C7"
            link={`https://github.com/${username}?tab=repositories&sort=stargazers`}
          />
          <StatCard
            label="Followers"
            value={user?.followers}
            accent="#EA580C"
            link={`https://github.com/${username}?tab=followers`}
          />
          <StatCard
            label="Following"
            value={user?.following}
            accent="#8B5CF6"
            link={`https://github.com/${username}?tab=following`}
          />
        </div>

        <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <article className={PANEL_CLASSNAME}>
            <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Star Distribution (Top Repos)
            </h3>
            <RepoBarChart repos={repos} />
          </article>

          <article className={PANEL_CLASSNAME}>
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Repo Activity Spectrum
            </h3>
            <ImpactAreaChart repos={repos} />
          </article>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-[260px_minmax(0,1fr)]">
          <article className={PANEL_CLASSNAME}>
            <h3 className="mb-5 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Top Languages
            </h3>
            <div className="mb-5 flex justify-center">
              <DonutChart data={langData} size={150} />
            </div>
            <p className="mb-3 text-[11px] text-slate-500">By repository count</p>
            <div className="flex flex-col gap-2.5">
              {langData.map((lang) => (
                <div key={lang.name} className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: lang.color }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1 truncate text-xs text-slate-800">{lang.name}</span>
                  <div className="h-[3px] w-10 overflow-hidden rounded bg-slate-100">
                    <div
                      className="h-full"
                      style={{ width: `${lang.pct}%`, background: lang.color }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono text-[11px] text-slate-500">{lang.pct}%</span>
                </div>
              ))}
            </div>
          </article>

          <article>
            <h3 className="mb-3 px-1 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Top Repositories
            </h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {topRepos.map((repo) => (
                <RepoCard key={repo.id} repo={repo} />
              ))}
            </div>
          </article>
        </div>

        <article className={PANEL_CLASSNAME}>
          <h3 className="mb-5 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
            Technologies &amp; Tools
          </h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {skillGroups.map(([group, items]) => (
              <div key={group}>
                <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.06em] text-emerald-600">
                  {group}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((skill) => (
                    <span
                      key={skill.name}
                      className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
};

export default Github;
