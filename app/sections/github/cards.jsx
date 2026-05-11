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
      className="group relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-slate-200/60 bg-white px-4 py-8 text-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
    >
      {/* Subtle background glow effect on hover */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-[0.03]"
        style={{ backgroundColor: accent }}
      />

      <div
        className="mb-2 font-mono text-4xl font-extrabold tracking-tight transition-transform duration-500 group-hover:scale-105"
        style={{ color: accent }}
      >
        {readableValue}
      </div>
      <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 transition-colors duration-300 group-hover:text-slate-600">
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
      className="group relative flex h-full flex-col justify-between rounded-2xl border border-slate-200/60 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-300/80 hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
    >
      <div>
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748B"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
            <span className="truncate text-sm font-bold tracking-tight text-slate-800 transition-colors group-hover:text-emerald-600">
              {repo.name}
            </span>
          </div>
          {/* External link arrow - appears on hover */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-400 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 group-hover:text-emerald-500"
          >
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
          </svg>
        </div>

        <p className="mb-4 line-clamp-2 min-h-10 text-[13px] leading-relaxed text-slate-500">
          {repo.description || "No description provided."}
        </p>
      </div>

      <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
        {repo.language && (
          <span className="flex items-center gap-1.5 rounded-full bg-slate-50 px-2 py-1">
            <span
              className="h-2 w-2 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]"
              style={{ background: langColor }}
              aria-hidden="true"
            />
            {repo.language}
          </span>
        )}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 transition-colors group-hover:text-amber-500">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            {repo.stargazers_count}
          </span>
          <span className="flex items-center gap-1 transition-colors group-hover:text-blue-500">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="18" r="3"></circle>
              <circle cx="6" cy="6" r="3"></circle>
              <circle cx="18" cy="6" r="3"></circle>
              <path d="M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9"></path>
              <path d="M12 12v3"></path>
            </svg>
            {repo.forks_count}
          </span>
        </div>
      </div>
    </a>
  );
});
