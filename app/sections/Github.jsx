"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const OUTER_WRAP_STYLE = {
  width: "100%",
  fontFamily: "system-ui, -apple-system, sans-serif",
  background: "#FEFFFC",
  padding: "20px 0",
};

const CONTENT_FRAME_STYLE = {
  width: "100%",
  margin: "0 auto",
  padding: "20px",
  border: "1px solid #E2E8F0",
  borderRadius: "20px",
  background: "#FDFEFB",
};

const GITHUB_CACHE_KEY = "github-stats-cache-v1";
const GITHUB_CACHE_TTL_MS = 1000 * 60 * 30;

/* ─── Language color map ────────────────────────────────────────── */
const LANG_COLORS = {
  JavaScript: "#F7DF1E",
  TypeScript: "#3178C6",
  Python: "#3776AB",
  HTML: "#E34F26",
  CSS: "#264DE4",
  "C++": "#00599C",
  Rust: "#DEA584",
  Go: "#00ADD8",
  Solidity: "#8A92B2",
  Shell: "#89E051",
  Vue: "#42B883",
  PHP: "#777BB4",
  Ruby: "#CC342D",
  Swift: "#F05138",
  Kotlin: "#7F52FF",
  "Jupyter Notebook": "#DA5B0B",
  Java: "#ED8B00",
  Dart: "#0175C2",
};

const SKILL_GROUPS = {
  Frontend: [
    { name: "React", color: "#0ea5e9" },
    { name: "Next.js", color: "#0F172A" },
    { name: "TypeScript", color: "#3178C6" },
    { name: "Tailwind", color: "#06B6D4" },
    { name: "Three.js", color: "#1F2937" },
    { name: "Redux", color: "#764ABC" },
    { name: "D3.js", color: "#F9A03C" },
    { name: "Sass", color: "#CC6699" },
  ],
  Backend: [
    { name: "Node.js", color: "#16A34A" },
    { name: "GraphQL", color: "#E10098" },
    { name: "PostgreSQL", color: "#336791" },
    { name: "MongoDB", color: "#10B981" },
    { name: "Supabase", color: "#059669" },
    { name: "Firebase", color: "#EA580C" },
    { name: "Appwrite", color: "#FD366E" },
  ],
  Cloud: [
    { name: "AWS", color: "#EA580C" },
    { name: "Docker", color: "#0284C7" },
    { name: "Kubernetes", color: "#2563EB" },
    { name: "Cloudflare", color: "#D97706" },
    { name: "Vercel", color: "#0F172A" },
    { name: "Netlify", color: "#0D9488" },
    { name: "IPFS", color: "#0284C7" },
  ],
  Tools: [
    { name: "Git", color: "#DC2626" },
    { name: "Figma", color: "#EA580C" },
    { name: "Linux", color: "#D97706" },
    { name: "Vite", color: "#7C3AED" },
    { name: "GitHub", color: "#0F172A" },
    { name: "VS Code", color: "#0284C7" },
    { name: "npm", color: "#DC2626" },
  ],
};

/* ─── Donut Chart (pure SVG) ────────────────────────────────────────── */
function DonutChart({ data, size = 190 }) {
  const r = size * 0.36;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const strokeWidth = size * 0.12;
  const gap = 3;

  let accumulated = 0;
  const slices = data.map((d) => {
    const len = (circumference * d.pct) / 100;
    const slice = {
      ...d,
      dasharray: `${Math.max(0, len - gap)} ${circumference}`,
      dashoffset: -accumulated,
    };
    accumulated += len;
    return slice;
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ overflow: "visible" }}
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
        {slices.map((s, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={strokeWidth}
            strokeDasharray={s.dasharray}
            strokeDashoffset={s.dashoffset}
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
        {data.length}
      </text>
      <text
        x={cx}
        y={cy + size * 0.085}
        textAnchor="middle"
        fill="#64748B"
        fontSize={size * 0.065}
        fontWeight="500"
        fontFamily="system-ui"
      >
        languages
      </text>
    </svg>
  );
}

/* ─── NEW: Horizontal Bar Chart for Repository Popularity ────────────── */
function RepoBarChart({ repos }) {
  const top5 = repos.slice(0, 5);
  const maxStars = Math.max(...top5.map((r) => r.stargazers_count), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {top5.map((repo) => {
        const percentage = (repo.stargazers_count / maxStars) * 100;
        return (
          <div
            key={repo.id}
            style={{ display: "flex", flexDirection: "column", gap: "4px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "12px",
              }}
            >
              <span style={{ fontWeight: "600", color: "#1E293B" }}>
                {repo.name}
              </span>
              <span style={{ fontFamily: "monospace", color: "#64748B" }}>
                ⭐ {repo.stargazers_count}
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: "8px",
                background: "#F1F5F9",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${percentage}%`,
                  height: "100%",
                  background: "linear-gradient(to right, #10B981, #059669)",
                  borderRadius: "4px",
                  transition: "width 1s ease-in-out",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── NEW: Area Chart for Commit "Impact" Simulation ────────────────── */
function ImpactAreaChart({ repos }) {
  const values = repos
    .slice(0, 10)
    .map(
      (r) =>
        r.stargazers_count + r.forks_count * 2 + (r.open_issues_count || 0),
    )
    .reverse();
  const max = Math.max(...values, 1);
  const W = 300;
  const H = 80;

  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * W;
      const y = H - (v / max) * H;
      return `${x},${y}`;
    })
    .join(" ");

  const fillPts = `0,${H} ${pts} ${W},${H}`;

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "90px" }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0284C7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={fillPts} fill="url(#areaGrad)" />
        <polyline
          points={pts}
          fill="none"
          stroke="#0284C7"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {values.map((v, i) => {
          const x = (i / (values.length - 1)) * W;
          const y = H - (v / max) * H;
          return (
            <circle
              key={i}
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "4px",
          fontSize: "10px",
          color: "#94A3B8",
          fontWeight: "600",
        }}
      >
        <span>OLDEST REPOS</span>
        <span>MOST RECENT</span>
      </div>
    </div>
  );
}

/* ─── Stat card (Now with hover effects and hard links!) ──────────────── */
function StatCard({ label, value, accent = "#10B981", link = "#" }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block",
        textDecoration: "none",
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: "14px",
        padding: "22px 16px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        boxShadow: hovered
          ? "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
          : "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        transform: hovered ? "translate3d(0, -2px, 0)" : "translate3d(0, 0, 0)",
        willChange: "transform",
        transition: "all 0.2s ease",
      }}
    >
      <div
        style={{
          fontSize: "28px",
          fontWeight: "800",
          color: accent,
          fontFamily: "monospace",
          lineHeight: 1,
          marginBottom: "6px",
        }}
      >
        {value ?? "—"}
      </div>
      <div
        style={{
          fontSize: "10px",
          color: "#64748B",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: "600",
        }}
      >
        {label}
      </div>
    </a>
  );
}

/* ─── Repo card ──────────────────────────────────────────────────────── */
function RepoCard({ repo }) {
  const langColor = LANG_COLORS[repo.language] || "#94A3B8";
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block",
        textDecoration: "none",
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: "12px",
        padding: "16px 18px",
        transition: "all 0.2s ease",
        transform: hovered ? "translate3d(0, -2px, 0)" : "translate3d(0, 0, 0)",
        willChange: "transform",
        boxShadow: hovered
          ? "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)"
          : "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "6px",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="#64748B"
          style={{ flexShrink: 0 }}
        >
          <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 010-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5zm10.5-1h-8a1 1 0 00-1 1v6.708A2.486 2.486 0 014.5 9h8z" />
        </svg>
        <span
          style={{
            fontSize: "13px",
            fontWeight: "600",
            color: hovered ? "#0F172A" : "#1E293B",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {repo.name}
        </span>
      </div>
      <p
        style={{
          fontSize: "12px",
          color: "#64748B",
          margin: "0 0 12px",
          lineHeight: 1.5,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          minHeight: "36px",
        }}
      >
        {repo.description || "No description provided."}
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          fontSize: "11px",
          color: "#64748B",
        }}
      >
        {repo.language && (
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span
              style={{
                width: "9px",
                height: "9px",
                borderRadius: "50%",
                background: langColor,
              }}
            />
            {repo.language}
          </span>
        )}
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.751.751 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
          </svg>
          {repo.stargazers_count}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75v-.878a2.25 2.25 0 111.5 0v.878a2.25 2.25 0 01-2.25 2.25h-1.5v2.128a2.251 2.251 0 11-1.5 0V8.5h-1.5A2.25 2.25 0 013.5 6.25v-.878a2.25 2.25 0 111.5 0z" />
          </svg>
          {repo.forks_count}
        </span>
      </div>
    </a>
  );
}

/* ─── Contribution bar ───────────────────────────────────────────────── */
function ContribBar({ repos }) {
  const values = repos
    .slice(0, 20)
    .map(
      (r) =>
        r.stargazers_count + r.forks_count * 2 + (r.open_issues_count || 0),
    )
    .reverse();
  const max = Math.max(...values, 1);
  const W = 100,
    H = 32;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * W;
      const y = H - (v / max) * H;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height: "40px" }}
    >
      <polyline
        points={pts}
        fill="none"
        stroke="#10B981"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.8"
      />
      <polyline
        points={`0,${H} ${pts} ${W},${H}`}
        fill="url(#sparkGrad)"
        opacity="0.1"
      />
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const buildGithubViewModel = (userData, reposData) => {
  const byStars = [...reposData].sort(
    (a, b) => b.stargazers_count - a.stargazers_count,
  );

  const stars = reposData.reduce((sum, repo) => sum + repo.stargazers_count, 0);

  const counts = {};
  reposData.forEach((repo) => {
    if (repo.language) {
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
    user: userData,
    repos: byStars,
    totalStars: stars,
    langData: langs,
    cachedAt: Date.now(),
  };
};

const readGithubCache = () => {
  if (typeof window === "undefined") return null;

  try {
    const cached = localStorage.getItem(GITHUB_CACHE_KEY);
    if (!cached) return null;
    return JSON.parse(cached);
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

/* ─── Main component ─────────────────────────────────────────────────── */
const Github = () => {
  const USERNAME = "KhareV";
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [langData, setLangData] = useState([]);
  const [totalStars, setTotalStars] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const applyViewModel = (payload) => {
      setUser(payload?.user ?? null);
      setRepos(payload?.repos ?? []);
      setTotalStars(payload?.totalStars ?? 0);
      setLangData(payload?.langData ?? []);
    };

    const cached = readGithubCache();

    if (cached) {
      applyViewModel(cached);
      setLoading(false);
    }

    const isCacheFresh =
      cached?.cachedAt && Date.now() - cached.cachedAt < GITHUB_CACHE_TTL_MS;

    if (isCacheFresh) {
      return () => {
        cancelled = true;
      };
    }

    async function fetchAll() {
      try {
        const [uRes, rRes] = await Promise.all([
          fetch(`https://api.github.com/users/${USERNAME}`),
          fetch(
            `https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=pushed`,
          ),
        ]);

        if (!uRes.ok || !rRes.ok) throw new Error("API error");

        const userData = await uRes.json();
        const reposData = await rRes.json();

        const payload = buildGithubViewModel(userData, reposData);

        if (cancelled) return;

        applyViewModel(payload);
        setError(false);
        writeGithubCache(payload);
      } catch {
        if (!cached && !cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchAll();

    return () => {
      cancelled = true;
    };
  }, []);

  const topRepos = repos.slice(0, 6);

  if (loading) {
    return (
      <div style={OUTER_WRAP_STYLE}>
        <div style={CONTENT_FRAME_STYLE}>
          <div
            style={{
              width: "100%",
              padding: "48px 0",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  border: "3px solid #E2E8F0",
                  borderTopColor: "#10B981",
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto 16px",
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p style={{ color: "#64748B", fontSize: "13px", margin: 0 }}>
                Fetching GitHub data…
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={OUTER_WRAP_STYLE}>
        <div style={CONTENT_FRAME_STYLE}>
          <div
            style={{ padding: "48px", textAlign: "center", color: "#64748B" }}
          >
            <p>Could not load GitHub data. Check API limits.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={OUTER_WRAP_STYLE}>
      <div className="m-10 space-y-1">
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-600">
          Overview
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          GitHub Stats
        </h1>
      </div>

      <div style={CONTENT_FRAME_STYLE}>
        {/* ── Profile header ─────────────────────────────────────────────── */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "16px",
            padding: "24px 28px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "24px",
            flexWrap: "wrap",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
          }}
        >
          {user?.avatar_url && (
            <a
              href={`https://github.com/${USERNAME}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ position: "relative", flexShrink: 0 }}
            >
              <Image
                src={user.avatar_url}
                alt={USERNAME}
                width={64}
                height={64}
                sizes="64px"
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  display: "block",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: "-3px",
                  borderRadius: "50%",
                  border: "2px solid #10B981",
                  pointerEvents: "none",
                }}
              />
            </a>
          )}
          <div style={{ flex: 1, minWidth: "180px" }}>
            <h2
              style={{
                margin: "0 0 2px",
                fontSize: "20px",
                fontWeight: "700",
                color: "#0F172A",
                letterSpacing: "-0.01em",
              }}
            >
              {user?.name || USERNAME}
            </h2>
            <a
              href={`https://github.com/${USERNAME}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "13px",
                color: "#059669",
                textDecoration: "none",
                fontFamily: "monospace",
                fontWeight: "600",
              }}
            >
              @{USERNAME}
            </a>
            {user?.bio && (
              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: "13px",
                  color: "#64748B",
                  lineHeight: 1.5,
                }}
              >
                {user.bio}
              </p>
            )}
          </div>
          {repos.length > 1 && (
            <div style={{ width: "160px", flexShrink: 0 }}>
              <p
                style={{
                  margin: "0 0 6px",
                  fontSize: "10px",
                  color: "#94A3B8",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: "700",
                }}
              >
                Activity Trend
              </p>
              <ContribBar repos={repos} />
            </div>
          )}
        </div>

        {/* ── Stats row ──────────────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "14px",
            marginBottom: "20px",
          }}
        >
          <StatCard
            label="Repositories"
            value={user?.public_repos}
            accent="#10B981"
            link={`https://github.com/${USERNAME}?tab=repositories`}
          />
          <StatCard
            label="Total Stars"
            value={totalStars}
            accent="#0284C7"
            link={`https://github.com/${USERNAME}?tab=repositories&sort=stargazers`}
          />
          <StatCard
            label="Followers"
            value={user?.followers}
            accent="#EA580C"
            link={`https://github.com/${USERNAME}?tab=followers`}
          />
          <StatCard
            label="Following"
            value={user?.following}
            accent="#8B5CF6"
            link={`https://github.com/${USERNAME}?tab=following`}
          />
        </div>

        {/* ── NEW SECTION: Visual Analytics Graphs ──────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
            }}
          >
            <p
              style={{
                margin: "0 0 16px",
                fontSize: "11px",
                fontWeight: "700",
                color: "#94A3B8",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Star Distribution (Top Repos)
            </p>
            <RepoBarChart repos={repos} />
          </div>

          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
            }}
          >
            <p
              style={{
                margin: "0 0 12px",
                fontSize: "11px",
                fontWeight: "700",
                color: "#94A3B8",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Repo Activity Spectrum
            </p>
            <ImpactAreaChart repos={repos} />
          </div>
        </div>

        {/* ── Languages + Repos ──────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          {/* Language donut */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "16px",
              padding: "24px 20px",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
            }}
          >
            <p
              style={{
                margin: "0 0 20px",
                fontSize: "11px",
                fontWeight: "700",
                color: "#94A3B8",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Top Languages
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <DonutChart data={langData} size={150} />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "9px" }}
            >
              {langData.map((l) => (
                <div
                  key={l.name}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: l.color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      flex: 1,
                      fontSize: "12px",
                      color: "#1E293B",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {l.name}
                  </span>
                  <div
                    style={{
                      width: "40px",
                      height: "3px",
                      background: "#F1F5F9",
                      borderRadius: "2px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${l.pct}%`,
                        height: "100%",
                        background: l.color,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#64748B",
                      width: "28px",
                      textAlign: "right",
                      fontFamily: "monospace",
                    }}
                  >
                    {l.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top repos grid */}
          <div>
            <p
              style={{
                margin: "0 0 14px",
                fontSize: "11px",
                fontWeight: "700",
                color: "#94A3B8",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Top Repositories
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              {topRepos.map((repo) => (
                <RepoCard key={repo.id} repo={repo} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Skills ─────────────────────────────────────────────────────── */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "16px",
            padding: "24px 24px",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
          }}
        >
          <p
            style={{
              margin: "0 0 20px",
              fontSize: "11px",
              fontWeight: "700",
              color: "#94A3B8",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Technologies &amp; Tools
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "20px",
            }}
          >
            {Object.entries(SKILL_GROUPS).map(([group, items]) => (
              <div key={group}>
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: "700",
                    color: "#059669",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "10px",
                  }}
                >
                  {group}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {items.map((skill) => (
                    <span
                      key={skill.name}
                      style={{
                        fontSize: "11px",
                        fontWeight: "500",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        color: "#334155",
                      }}
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Github;
