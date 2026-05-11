"use client";

import { memo, useId, useMemo } from "react";

const getPointX = (index, total, width) => {
  if (total <= 1) return width / 2;
  return (index / (total - 1)) * width;
};

export const DonutChart = memo(function DonutChart({ data, size = 190 }) {
  const r = size * 0.36;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const strokeWidth = size * 0.12;
  const gap = 8; // Increased gap for sleeker look

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
  }, [data, circumference, gap]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="overflow-visible"
      role="img"
    >
      <g transform={`rotate(-90 ${cx} ${cy})`}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#F8FAFC"
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
            strokeLinecap="round" // Sleek rounded ends
            className="transition-all duration-1000 ease-out hover:stroke-[28px]"
          />
        ))}
      </g>
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fill="#0F172A"
        fontSize={size * 0.16}
        fontWeight="800"
        fontFamily="monospace"
      >
        {data?.length || 0}
      </text>
      <text
        x={cx}
        y={cy + size * 0.1}
        textAnchor="middle"
        fill="#94A3B8"
        fontSize={size * 0.07}
        fontWeight="600"
        letterSpacing="0.05em"
        textTransform="uppercase"
      >
        Languages
      </text>
    </svg>
  );
});

export const RepoBarChart = memo(function RepoBarChart({ repos }) {
  const topRepos = useMemo(() => (repos || []).slice(0, 5), [repos]);
  const maxStars = useMemo(
    () => Math.max(...topRepos.map((r) => r.stargazers_count || 0), 1),
    [topRepos],
  );

  return (
    <div className="flex flex-col gap-3.5">
      {topRepos.map((repo) => {
        const percentage = ((repo.stargazers_count || 0) / maxStars) * 100;
        return (
          <div key={repo.id} className="group flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-semibold text-slate-700 transition-colors group-hover:text-slate-950">
                {repo.name}
              </span>
              <span className="font-mono text-xs font-medium text-slate-400 group-hover:text-emerald-600 transition-colors">
                ★ {repo.stargazers_count}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100/80 shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-1000 ease-out group-hover:from-emerald-500 group-hover:to-teal-500"
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
        (r) =>
          (r.stargazers_count || 0) +
          (r.forks_count || 0) * 2 +
          (r.open_issues_count || 0),
      )
      .reverse();
    return computed.length ? computed : [0];
  }, [repos]);

  const maxValue = useMemo(() => Math.max(...values, 1), [values]);
  const width = 300;
  const height = 80;

  const points = useMemo(
    () =>
      values
        .map(
          (v, i) =>
            `${getPointX(i, values.length, width)},${height - (v / maxValue) * height}`,
        )
        .join(" "),
    [values, width, height, maxValue],
  );
  const fillPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div className="relative group">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[100px] w-full overflow-visible"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points={fillPoints}
          fill={`url(#${gradientId})`}
          className="transition-opacity duration-300 group-hover:opacity-80"
        />
        <polyline
          points={points}
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {values.map((v, i) => (
          <circle
            key={`${i}-${v}`}
            cx={getPointX(i, values.length, width)}
            cy={height - (v / maxValue) * height}
            r="3.5"
            fill="#FFFFFF"
            stroke="#0ea5e9"
            strokeWidth="2.5"
            className="transition-all duration-300 group-hover:r-[5px] group-hover:stroke-emerald-500"
          />
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
        <span>Oldest</span>
        <span>Recent</span>
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
        (r) =>
          (r.stargazers_count || 0) +
          (r.forks_count || 0) * 2 +
          (r.open_issues_count || 0),
      )
      .reverse();
    return computed.length ? computed : [0];
  }, [repos]);

  const maxValue = useMemo(() => Math.max(...values, 1), [values]);
  const width = 100;
  const height = 32;

  const points = useMemo(
    () =>
      values
        .map(
          (v, i) =>
            `${getPointX(i, values.length, width)},${height - (v / maxValue) * height}`,
        )
        .join(" "),
    [values, width, height, maxValue],
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="h-10 w-full overflow-visible"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#${gradientId})`}
        opacity="0.15"
      />
      <polyline
        points={points}
        fill="none"
        stroke="#10B981"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
});
