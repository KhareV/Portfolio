"use client";

import Image from "next/image";
import { memo, useMemo } from "react";

import {
  ContribBar,
  DonutChart,
  ImpactAreaChart,
  RepoBarChart,
} from "./github/charts";
import { RepoCard, StatCard } from "./github/cards";
import { SKILL_GROUPS } from "./github/constants";
import useGithubData from "./github/useGithubData";

// Premium panel styling
const PANEL_CLASSNAME =
  "group/panel relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]";

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
      <section className="w-full bg-[#FAFAFA] py-16 sm:py-24 relative overflow-hidden">
        <div className="mx-auto w-full max-w-[1280px] rounded-3xl border border-slate-200/60 bg-white/50 backdrop-blur-sm p-6 shadow-sm">
          <div className="grid place-items-center py-20" role="status">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-[3px] border-slate-100 border-t-emerald-500 shadow-sm" />
            <p className="text-sm font-medium text-slate-400 tracking-wide">
              Syncing GitHub ecosystem...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full bg-[#FAFAFA] py-16">
        <div className="mx-auto w-full max-w-[1280px] rounded-3xl border border-slate-200 bg-white p-6">
          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 px-5 py-10 text-center">
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <p className="mt-2 text-xs text-rose-500">
              Could not sync with the GitHub API at this time.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative w-full overflow-hidden bg-slate-50 py-16 sm:py-24"
      aria-label="GitHub analytics section"
    >
      {/* Absolute Dot Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px][mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

      <div className="relative mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-emerald-600">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              Developer Metrics
            </span>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
              GitHub Stats
            </h2>
          </div>

          <div className="text-xs font-medium" aria-live="polite">
            {isRefreshing ? (
              <span className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-500 shadow-sm">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                Refreshing...
              </span>
            ) : fromCache ? (
              <span className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-emerald-700 shadow-sm">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Up to date
              </span>
            ) : null}
          </div>
        </div>

        {/* Profile Card */}
        <div
          className={`${PANEL_CLASSNAME} mb-6 flex flex-wrap items-center gap-6 sm:p-8`}
        >
          {user?.avatar_url && (
            <a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group/avatar relative shrink-0 rounded-full"
            >
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-emerald-500 to-sky-400 opacity-0 blur transition-all duration-500 group-hover/avatar:opacity-40" />
              <Image
                src={user.avatar_url}
                alt={username}
                width={80}
                height={80}
                sizes="80px"
                className="relative z-10 rounded-full ring-4 ring-white shadow-md transition-transform duration-500 group-hover/avatar:scale-105"
              />
            </a>
          )}

          <div className="min-w-[180px] flex-1">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">
              {user?.name || username}
            </h3>
            <a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-1 font-mono text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-500"
            >
              @{username}
            </a>
            {user?.bio && (
              <p className="mt-3 text-sm leading-relaxed text-slate-500 max-w-xl">
                {user.bio}
              </p>
            )}
          </div>

          {showAnalytics && (
            <div className="w-full max-w-[240px] sm:w-[240px]">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Activity Sparkline
              </p>
              <ContribBar repos={repos} />
            </div>
          )}
        </div>

        {/* Stat Grid */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Repositories"
            value={user?.public_repos}
            accent="#10B981"
            link={`https://github.com/${username}?tab=repositories`}
          />
          <StatCard
            label="Total Stars"
            value={totalStars}
            accent="#0ea5e9"
            link={`https://github.com/${username}?tab=repositories&sort=stargazers`}
          />
          <StatCard
            label="Followers"
            value={user?.followers}
            accent="#f97316"
            link={`https://github.com/${username}?tab=followers`}
          />
          <StatCard
            label="Following"
            value={user?.following}
            accent="#8b5cf6"
            link={`https://github.com/${username}?tab=following`}
          />
        </div>

        {/* Charts Grid */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <article className={PANEL_CLASSNAME}>
            <h3 className="mb-6 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Star Distribution
            </h3>
            <RepoBarChart repos={repos} />
          </article>
          <article className={PANEL_CLASSNAME}>
            <h3 className="mb-6 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Impact Spectrum
            </h3>
            <ImpactAreaChart repos={repos} />
          </article>
        </div>

        {/* Bottom Split Grid */}
        <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <article className={PANEL_CLASSNAME}>
            <h3 className="mb-8 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Languages
            </h3>
            <div className="mb-8 flex justify-center">
              <DonutChart data={langData} size={170} />
            </div>
            <div className="flex flex-col gap-3.5">
              {langData.map((lang) => (
                <div key={lang.name} className="group flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full shadow-sm transition-transform duration-300 group-hover:scale-125"
                    style={{ background: lang.color }}
                  />
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-slate-700 transition-colors group-hover:text-slate-950">
                    {lang.name}
                  </span>
                  <div className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${lang.pct}%`, background: lang.color }}
                    />
                  </div>
                  <span className="w-9 text-right font-mono text-[11px] text-slate-400 group-hover:text-slate-600">
                    {lang.pct}%
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article>
            <h3 className="mb-4 px-2 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Top Repositories
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {topRepos.map((repo) => (
                <RepoCard key={repo.id} repo={repo} />
              ))}
            </div>
          </article>
        </div>

        {/* Technologies / Skills */}
        <article className={PANEL_CLASSNAME}>
          <h3 className="mb-6 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Ecosystem &amp; Tools
          </h3>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {skillGroups.map(([group, items]) => (
              <div key={group}>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-600">
                  {group}
                </p>
                <div className="flex flex-wrap gap-2">
                  {items.map((skill) => (
                    <span
                      key={skill.name}
                      className="group flex cursor-default items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50/50 px-3 py-1.5 text-[12px] font-medium text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:text-slate-900 hover:shadow-md"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full shadow-[inset_0_1px_1px_rgba(0,0,0,0.1)] transition-transform duration-300 group-hover:scale-150"
                        style={{ backgroundColor: skill.color }}
                      />
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

export default memo(Github);
