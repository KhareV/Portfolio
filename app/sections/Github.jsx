"use client";

import { useEffect, useState } from "react";
import { profile } from "../content/site";
import { CACHE_KEY, CACHE_TTL_MS, isValidViewModel } from "../lib/github";

const LANG_COLORS = {
  JavaScript: "#E2C93A", TypeScript: "#3178C6", Python: "#3776AB", HTML: "#E34F26", CSS: "#264DE4", "C++": "#00599C",
  Solidity: "#8A92B2", Java: "#ED8B00", "Jupyter Notebook": "#DA5B0B", Shell: "#89E051", Go: "#00ADD8", Rust: "#DEA584",
};

const SKILL_GROUPS = {
  Frontend: ["React", "Next.js", "TypeScript", "Tailwind", "Three.js", "Redux", "D3.js", "Sass"],
  Backend: ["Node.js", "GraphQL", "PostgreSQL", "MongoDB", "Supabase", "Firebase", "Appwrite"],
  Cloud: ["AWS", "Docker", "Kubernetes", "Cloudflare", "Vercel", "Netlify", "IPFS"],
  Tools: ["Git", "Figma", "Linux", "Vite", "GitHub", "VS Code", "npm"],
};

const readCache = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    return isValidViewModel(parsed) ? parsed : null;
  } catch {
    return null;
  }
};
const writeCache = (vm) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(vm));
  } catch {}
};

function useGithub() {
  const [state, setState] = useState({ status: "loading", vm: null, message: "" });
  useEffect(() => {
    const ctrl = new AbortController();
    const cached = readCache();
    const fresh = cached && Date.now() - Date.parse(cached.fetchedAt) < CACHE_TTL_MS;
    if (cached) setState({ status: fresh ? "ready" : "refreshing", vm: cached, message: "" });
    if (fresh) return () => ctrl.abort();
    fetch("/api/github", { signal: ctrl.signal })
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (!res.ok || !isValidViewModel(body)) {
          const err = new Error(body?.error || "GitHub data is unavailable right now.");
          err.rateLimited = Boolean(body?.rateLimited);
          throw err;
        }
        writeCache(body);
        setState({ status: "ready", vm: body, message: "" });
      })
      .catch((e) => {
        if (e?.name === "AbortError") return;
        const message = e?.rateLimited ? "GitHub's rate limit was reached." : "GitHub data is unavailable right now.";
        setState(cached ? { status: "stale", vm: cached, message } : { status: "error", vm: null, message });
      });
    return () => ctrl.abort();
  }, []);
  return state;
}

const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
const PANEL = "rounded-3xl border border-slate-200/70 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]";

function PushChart({ pushes }) {
  const max = Math.max(1, ...pushes.map((p) => p.count));
  const total = pushes.reduce((a, p) => a + p.count, 0);
  return (
    <figure>
      <div className="flex h-36 items-end gap-1.5" role="img" aria-label={`Repositories by month of their latest push, last 12 months: ${pushes.map((p) => `${p.label} ${p.year} ${p.count}`).join(", ")}.`}>
        {pushes.map((p) => (
          <div key={p.key} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <span className="text-[10px] tabular-nums text-slate-500">{p.count || ""}</span>
            <div className="w-full rounded-t bg-emerald-500/80" style={{ height: `${(p.count / max) * 100}%`, minHeight: p.count ? 4 : 1 }} />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5 text-[10px] text-slate-500">
        {pushes.map((p) => (
          <span key={p.key} className="flex-1 text-center">{p.label}</span>
        ))}
      </div>
      <figcaption className="mt-3 text-xs text-slate-500">
        {total} of the listed repositories were last pushed in this window. Each repository counts once, in the month of its latest push — not a commit history.
      </figcaption>
    </figure>
  );
}

function Skeleton() {
  return (
    <div role="status" className="grid gap-6">
      <span className="sr-only">Loading GitHub data…</span>
      <div className={`${PANEL} h-[8.5rem] animate-pulse bg-slate-100/70 motion-reduce:animate-none`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className={`${PANEL} h-[17rem] animate-pulse bg-slate-100/70 motion-reduce:animate-none`} />
        <div className={`${PANEL} h-[17rem] animate-pulse bg-slate-100/70 motion-reduce:animate-none`} />
      </div>
      <div className={`${PANEL} h-[26rem] animate-pulse bg-slate-100/70 motion-reduce:animate-none`} />
    </div>
  );
}

export default function Github() {
  const { status, vm, message } = useGithub();

  return (
    <section id="github" data-anchor aria-labelledby="github-title" className="relative bg-slate-50 px-5 py-20 sm:px-10 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="github-title" data-anchor-heading className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              On GitHub
            </h2>
            <p className="mt-3 text-slate-600">
              Public activity for{" "}
              <a href={profile.github} target="_blank" rel="noopener noreferrer" className="font-medium text-emerald-700 underline underline-offset-4">
                @{profile.githubUser}<span className="sr-only"> (opens in a new tab)</span>
              </a>
              .
            </p>
          </div>
          <p className="text-xs text-slate-500" aria-live="polite">
            {status === "refreshing" && "Showing saved data while refreshing…"}
            {status === "stale" && vm && `${message} Showing data saved ${fmtDate(vm.fetchedAt)}.`}
            {status === "ready" && vm && `Updated ${fmtDate(vm.fetchedAt)}.`}
          </p>
        </div>

        {status === "loading" ? <Skeleton /> : null}

        {status === "error" ? (
          <div className={`${PANEL} grid h-[8.5rem] place-items-center text-center`}>
            <p className="text-slate-700">
              {message}{" "}
              <a href={profile.github} target="_blank" rel="noopener noreferrer" className="font-medium text-emerald-700 underline underline-offset-4">
                View the profile on GitHub<span className="sr-only"> (opens in a new tab)</span>
              </a>
              .
            </p>
          </div>
        ) : null}

        {vm ? (
          <div className="grid gap-6">
            <dl className={`${PANEL} grid h-auto grid-cols-2 gap-4 sm:h-[8.5rem] sm:grid-cols-4`}>
              {[
                ["Public repositories", vm.user.publicRepos],
                ["Stars across listed repos", vm.totals.stars],
                ["Followers", vm.user.followers],
                ["Following", vm.user.following],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col items-center justify-center text-center">
                  <dt className="order-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</dt>
                  <dd className="order-1 font-mono text-3xl font-bold text-slate-900">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="grid gap-6 lg:grid-cols-2">
              <article className={`${PANEL} lg:h-[17rem]`}>
                <h3 className="mb-4 text-sm font-semibold text-slate-700">Repositories by month of latest push</h3>
                <PushChart pushes={vm.pushes} />
              </article>
              <article className={`${PANEL} lg:h-[17rem]`}>
                <h3 className="mb-4 text-sm font-semibold text-slate-700">Stars by repository</h3>
                {vm.starLeaders.length ? (
                  <ul className="flex flex-col gap-3">
                    {vm.starLeaders.map((r) => (
                      <li key={r.id}>
                        <div className="flex justify-between text-[13px]">
                          <span className="truncate font-medium text-slate-700">{r.name}</span>
                          <span className="font-mono text-slate-500">{r.stars} ★</span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(r.stars / vm.starLeaders[0].stars) * 100}%` }} />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">No listed repository has stars yet.</p>
                )}
              </article>
            </div>

            <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
              <article className={PANEL}>
                <h3 className="text-sm font-semibold text-slate-700">Primary language</h3>
                <p className="mb-4 text-xs text-slate-500">Share of {vm.totals.reposWithLanguage} repositories that report one (one language per repository).</p>
                {vm.languages.length ? (
                  <ul className="flex flex-col gap-3">
                    {vm.languages.map((l) => (
                      <li key={l.name} className="flex items-center gap-3 text-[13px]">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: LANG_COLORS[l.name] || "#94A3B8" }} aria-hidden="true" />
                        <span className="flex-1 truncate text-slate-700">{l.name}</span>
                        <span className="font-mono text-slate-500">
                          {l.count} · {l.pct}%
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">No language data.</p>
                )}
              </article>
              <article>
                <h3 className="mb-3 px-1 text-sm font-semibold text-slate-700">Top repositories</h3>
                {vm.top.length ? (
                  <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {vm.top.map((r) => (
                      <li key={r.id}>
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex h-full min-h-[8.5rem] flex-col justify-between rounded-2xl border border-slate-200/70 bg-white p-5 hover:border-slate-300">
                          <span>
                            <span className="block truncate font-semibold text-slate-800">{r.name}</span>
                            <span className="mt-1 line-clamp-2 block text-[13px] text-slate-500">{r.description || "No description provided."}</span>
                          </span>
                          <span className="mt-3 flex gap-4 text-xs text-slate-500">
                            {r.language ? <span>{r.language}</span> : null}
                            <span>{r.stars} ★</span>
                            <span>{r.forks} forks</span>
                          </span>
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">No public repositories to show.</p>
                )}
              </article>
            </div>
          </div>
        ) : null}

        <article className={`${PANEL} mt-6`}>
          <h3 className="mb-5 text-sm font-semibold text-slate-700">Ecosystem &amp; tools</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {Object.entries(SKILL_GROUPS).map(([group, items]) => (
              <div key={group}>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-emerald-700">{group}</h4>
                <ul className="flex flex-wrap gap-2">
                  {items.map((s) => (
                    <li key={s} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[12px] text-slate-700">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
