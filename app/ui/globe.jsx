"use client";

import { memo, useMemo } from "react";

const DEFAULT_GLOBE_CONFIG = {
  globeColor: "#062056",
  polygonColor: "rgba(255,255,255,0.7)",
  atmosphereColor: "#ffffff",
  initialPosition: { lat: 22.3193, lng: 114.1694 },
  autoRotate: true,
  autoRotateSpeed: 0.5,
  arcTime: 1000,
};

const toRadians = (degrees) => (degrees * Math.PI) / 180;

const projectPoint = (lat, lng, center) => {
  const latRad = toRadians(lat);
  const lngRad = toRadians(lng);
  const centerLat = toRadians(center.lat || 0);
  const centerLng = toRadians(center.lng || 0);
  const lngDelta = lngRad - centerLng;

  const x = Math.cos(latRad) * Math.sin(lngDelta);
  const y =
    Math.sin(latRad) * Math.cos(centerLat) -
    Math.cos(latRad) * Math.cos(lngDelta) * Math.sin(centerLat);
  const z =
    Math.sin(latRad) * Math.sin(centerLat) +
    Math.cos(latRad) * Math.cos(lngDelta) * Math.cos(centerLat);

  return {
    x: 500 + x * 330,
    y: 500 - y * 330,
    z,
  };
};

const buildArcPath = (start, end, arcAltitude = 0.25) => {
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const normalX = -dy / length;
  const normalY = dx / length;
  const lift = 130 * arcAltitude;

  const controlX = midX + normalX * lift;
  const controlY = midY + normalY * lift;

  return `M ${start.x} ${start.y} Q ${controlX} ${controlY} ${end.x} ${end.y}`;
};

export const World = memo(function World({ data = [], globeConfig = {} }) {
  const config = { ...DEFAULT_GLOBE_CONFIG, ...globeConfig };
  const center = config.initialPosition || DEFAULT_GLOBE_CONFIG.initialPosition;
  const orbitDuration = Math.max(
    16,
    80 / Math.max(0.2, Number(config.autoRotateSpeed || 0.5)),
  );

  const arcs = useMemo(() => {
    return data
      .map((arc, index) => {
        const start = projectPoint(arc.startLat, arc.startLng, center);
        const end = projectPoint(arc.endLat, arc.endLng, center);
        const arcAlt = Number(arc.arcAlt ?? 0.2);

        return {
          id: `${arc.order || 0}-${index}`,
          path: buildArcPath(start, end, arcAlt),
          color: arc.color || "#38bdf8",
          delay: ((arc.order || index) % 12) * 120,
          duration: Math.max(1600, Number(config.arcTime || 1000) + arcAlt * 2200),
          start,
          end,
          visible: start.z > -0.3 && end.z > -0.3,
          opacity: Math.max(0.28, Math.min(1, (start.z + end.z + 2) / 2.6)),
        };
      })
      .filter((arc) => arc.visible);
  }, [center, config.arcTime, data]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-[#020617]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_24%,rgba(59,130,246,0.32)_0%,rgba(30,64,175,0.24)_34%,rgba(2,6,23,0.92)_72%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_70%,rgba(6,182,212,0.2),transparent_46%)]" />

      <svg viewBox="0 0 1000 1000" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="lw-globe-fill" cx="35%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.65" />
            <stop offset="36%" stopColor={config.globeColor || "#062056"} stopOpacity="0.9" />
            <stop offset="100%" stopColor="#020617" stopOpacity="1" />
          </radialGradient>
        </defs>

        <g
          style={{
            transformOrigin: "500px 500px",
            animation: config.autoRotate
              ? `lw-globe-spin ${orbitDuration}s linear infinite`
              : "none",
          }}
        >
          <circle cx="500" cy="500" r="334" fill="url(#lw-globe-fill)" />
          <circle cx="500" cy="500" r="334" fill="none" stroke="rgba(186,230,253,0.34)" strokeWidth="2" />
          <ellipse cx="500" cy="500" rx="334" ry="122" fill="none" stroke="rgba(191,219,254,0.18)" strokeWidth="1.5" />
          <ellipse cx="500" cy="500" rx="334" ry="218" fill="none" stroke="rgba(191,219,254,0.15)" strokeWidth="1.2" />
          <line x1="166" y1="500" x2="834" y2="500" stroke="rgba(191,219,254,0.18)" strokeWidth="1" />
          <line x1="500" y1="166" x2="500" y2="834" stroke="rgba(191,219,254,0.16)" strokeWidth="1" />

          {arcs.map((arc) => (
            <path
              key={arc.id}
              d={arc.path}
              fill="none"
              stroke={arc.color}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeDasharray="18 12"
              style={{
                opacity: arc.opacity,
                filter: "drop-shadow(0 0 4px rgba(125,211,252,0.65))",
                animation: `lw-arc-dash ${arc.duration}ms linear ${arc.delay}ms infinite`,
              }}
            />
          ))}

          {arcs.map((arc) => (
            <g key={`${arc.id}-points`}>
              <circle
                cx={arc.start.x}
                cy={arc.start.y}
                r="3.1"
                fill="rgba(186,230,253,0.92)"
                opacity={arc.opacity}
              />
              <circle
                cx={arc.end.x}
                cy={arc.end.y}
                r="3.1"
                fill="rgba(165,243,252,0.95)"
                opacity={arc.opacity}
              />
            </g>
          ))}
        </g>
      </svg>

      <div className="absolute inset-0 rounded-3xl border border-cyan-100/12" />

      <style jsx>{`
        @keyframes lw-globe-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes lw-arc-dash {
          from {
            stroke-dashoffset: 0;
          }

          to {
            stroke-dashoffset: -120;
          }
        }
      `}</style>
    </div>
  );
});
