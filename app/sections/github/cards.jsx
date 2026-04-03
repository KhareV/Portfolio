"use client";

import { memo } from "react";

import { LANG_COLORS } from "./constants";

export const StatCard = memo(function StatCard({
  label,
  value,
  accent = "#10B981",
  link = "#",
}) {
  const readableValue = value ?? "—";

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label}: ${readableValue}`}
      className="group block overflow-hidden rounded-[14px] border border-slate-200 bg-white px-4 py-5 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
      style={{
        color: accent,
      }}
    >
      <div
        className="mb-1 font-mono text-[28px] font-extrabold leading-none"
        style={{ color: accent }}
      >
        {readableValue}
      </div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
        {label}
      </div>
    </a>
  );
});

export const RepoCard = memo(function RepoCard({ repo }) {
  const langColor = LANG_COLORS[repo.language] || "#94A3B8";

  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open repository ${repo.name}`}
      className="block rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
    >
      <div className="mb-1 flex items-center gap-2">
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="#64748B"
          className="shrink-0"
          aria-hidden="true"
        >
          <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 010-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5zm10.5-1h-8a1 1 0 00-1 1v6.708A2.486 2.486 0 014.5 9h8z" />
        </svg>
        <span className="truncate text-[13px] font-semibold text-slate-800">
          {repo.name}
        </span>
      </div>

      <p
        className="mb-3 min-h-9 text-[12px] leading-5 text-slate-500"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {repo.description || "No description provided."}
      </p>

      <div className="flex items-center gap-3 text-[11px] text-slate-500">
        {repo.language && (
          <span className="flex items-center gap-1.5">
            <span
              className="h-[9px] w-[9px] rounded-full"
              style={{ background: langColor }}
              aria-hidden="true"
            />
            {repo.language}
          </span>
        )}
        <span className="flex items-center gap-1">
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.751.751 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
          </svg>
          {repo.stargazers_count}
        </span>
        <span className="flex items-center gap-1">
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75v-.878a2.25 2.25 0 111.5 0v.878a2.25 2.25 0 01-2.25 2.25h-1.5v2.128a2.251 2.251 0 11-1.5 0V8.5h-1.5A2.25 2.25 0 013.5 6.25v-.878a2.25 2.25 0 111.5 0z" />
          </svg>
          {repo.forks_count}
        </span>
      </div>
    </a>
  );
});
