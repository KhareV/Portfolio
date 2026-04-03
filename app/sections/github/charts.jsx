"use client";

import { memo, useId, useMemo } from "react";

const getPointX = (index, total, width) => {
  if (total <= 1) {
    return width / 2;
  }

  return (index / (total - 1)) * width;
};

export const DonutChart = memo(function DonutChart({ data, size = 190 }) {
  const r = size * 0.36;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const strokeWidth = size * 0.12;
  const gap = 3;

  const slices = useMemo(() => {
    let accumulated = 0;

    return (data || []).map((entry) => {
      const len = (circumference * entry.pct) / 100;
      const next = {
        ...entry,
        dasharray: `${Math.max(0, len - gap)} ${circumference}`,
        dashoffset: -accumulated,
      };
      accumulated += len;
      return next;
    });
  }, [data, circumference]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="overflow-visible"
      role="img"
      aria-label="Top languages donut chart by repository count"
    >
      <g transform={`rotate(-90 ${cx} ${cy})`}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#F1F5F9"
          strokeWidth={strokeWidth}
        />
        {slices.map((slice) => (
          <circle
            key={slice.name}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={slice.color}
            strokeWidth={strokeWidth}
            strokeDasharray={slice.dasharray}
            strokeDashoffset={slice.dashoffset}
            strokeLinecap="butt"
            style={{ transition: "stroke-dashoffset 0.9s ease" }}
          />
        ))}
      </g>
      <text
        x={cx}
        y={cy - 5}
        textAnchor="middle"
        fill="#0F172A"
        fontSize={size * 0.13}
        fontWeight="700"
        fontFamily="monospace"
      >
        {data?.length || 0}
      </text>
      <text
        x={cx}
        y={cy + size * 0.085}
        textAnchor="middle"
        fill="#64748B"
        fontSize={size * 0.065}
        fontWeight="500"
      >
        languages
      </text>
    </svg>
  );
});

export const RepoBarChart = memo(function RepoBarChart({ repos }) {
  const topRepos = useMemo(() => (repos || []).slice(0, 5), [repos]);
  const maxStars = useMemo(
    () => Math.max(...topRepos.map((repo) => repo.stargazers_count || 0), 1),
    [topRepos],
  );

  return (
    <div
      className="flex flex-col gap-3"
      role="img"
      aria-label="Bar chart of top repository stars"
    >
      {topRepos.map((repo) => {
        const percentage = ((repo.stargazers_count || 0) / maxStars) * 100;
        return (
          <div key={repo.id} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">{repo.name}</span>
              <span className="font-mono text-slate-500">
                ⭐ {repo.stargazers_count}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded bg-slate-100">
              <div
                className="h-full rounded bg-gradient-to-r from-emerald-500 to-emerald-600 transition-[width] duration-700"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
});

export const ImpactAreaChart = memo(function ImpactAreaChart({ repos }) {
  const gradientId = useId().replace(/:/g, "");
  const values = useMemo(() => {
    const computed = (repos || [])
      .slice(0, 10)
      .map(
        (repo) =>
          (repo.stargazers_count || 0) +
          (repo.forks_count || 0) * 2 +
          (repo.open_issues_count || 0),
      )
      .reverse();

    return computed.length ? computed : [0];
  }, [repos]);

  const maxValue = useMemo(() => Math.max(...values, 1), [values]);
  const width = 300;
  const height = 80;

  const points = useMemo(() => {
    return values
      .map((value, index) => {
        const x = getPointX(index, values.length, width);
        const y = height - (value / maxValue) * height;
        return `${x},${y}`;
      })
      .join(" ");
  }, [values, width, height, maxValue]);

  const fillPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div
      className="relative"
      role="img"
      aria-label="Repository activity area chart"
    >
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[90px] w-full">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0284C7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={fillPoints} fill={`url(#${gradientId})`} />
        <polyline
          points={points}
          fill="none"
          stroke="#0284C7"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {values.map((value, index) => {
          const x = getPointX(index, values.length, width);
          const y = height - (value / maxValue) * height;
          return (
            <circle
              key={`${index}-${value}`}
              cx={x}
              cy={y}
              r="3"
              fill="#FFFFFF"
              stroke="#0284C7"
              strokeWidth="2"
            />
          );
        })}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] font-semibold text-slate-400">
        <span>OLDEST REPOS</span>
        <span>MOST RECENT</span>
      </div>
    </div>
  );
});

export const ContribBar = memo(function ContribBar({ repos }) {
  const gradientId = useId().replace(/:/g, "");
  const values = useMemo(() => {
    const computed = (repos || [])
      .slice(0, 20)
      .map(
        (repo) =>
          (repo.stargazers_count || 0) +
          (repo.forks_count || 0) * 2 +
          (repo.open_issues_count || 0),
      )
      .reverse();

    return computed.length ? computed : [0];
  }, [repos]);

  const maxValue = useMemo(() => Math.max(...values, 1), [values]);
  const width = 100;
  const height = 32;

  const points = useMemo(() => {
    return values
      .map((value, index) => {
        const x = getPointX(index, values.length, width);
        const y = height - (value / maxValue) * height;
        return `${x},${y}`;
      })
      .join(" ");
  }, [values, width, height, maxValue]);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="h-10 w-full"
      role="img"
      aria-label="Repository contribution sparkline"
    >
      <polyline
        points={points}
        fill="none"
        stroke="#10B981"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.8"
      />
      <polyline
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#${gradientId})`}
        opacity="0.1"
      />
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
});
