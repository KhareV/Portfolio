"use client";

import { memo, useEffect, useMemo, useRef } from "react";
import { CELL, CELLS, ORIGIN_X, ORIGIN_Y, PALETTE, VIEWBOX } from "./sunflower/data";

// Pixel sunflower. The resting illustration is static SVG markup (server
// rendered, zero animation frames). A fine pointer hovering over it starts a
// rAF loop that eases cells toward the pointer and stops itself once the
// pointer has left and every cell has settled, so idle cost returns to zero.
const parsed = CELLS.split(";").map((t) => {
  const [c, r, p] = t.split(",").map((v) => parseInt(v, 16));
  return { x: ORIGIN_X + c * CELL, y: ORIGIN_Y + r * CELL, fill: PALETTE[p] };
});

function Sunflower({ className = "", label = "Pixel-art sunflower" }) {
  const svgRef = useRef(null);
  const cells = useMemo(() => parsed, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const rects = Array.from(svg.querySelectorAll("rect"));
    const centers = cells.map((c) => [c.x + CELL / 2, c.y + CELL / 2]);
    const [, , vbW, vbH] = VIEWBOX.split(" ").map(Number);
    let raf = 0;
    let box = null; // cached on enter; invalidated on scroll/resize
    const target = { x: 0, y: 0, on: false };
    const eased = { x: 0, y: 0, blend: 0 };
    const last = new Float32Array(rects.length).fill(1);

    const measure = () => (box = svg.getBoundingClientRect());
    const step = () => {
      raf = 0;
      if (!box) measure();
      const dx = (target.x - eased.x) / 8;
      const dy = (target.y - eased.y) / 8;
      eased.x += dx;
      eased.y += dy;
      eased.blend += ((target.on ? 1 : 0) - eased.blend) / 8;
      const scale = box.width / vbW;
      const maxDist = Math.max(box.width, (vbH * scale)) * 0.6;
      let moving = Math.abs(eased.blend - (target.on ? 1 : 0)) > 0.002 || Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05;
      for (let i = 0; i < rects.length; i++) {
        const cx = box.left + centers[i][0] * scale;
        const cy = box.top + centers[i][1] * scale;
        const d = Math.hypot(eased.x - cx, eased.y - cy);
        const k = Math.max(0, 1 - d / maxDist); // 1 near pointer → 0 far
        const s = 1 + 1.5 * k * eased.blend;
        if (Math.abs(s - last[i]) > 0.004) {
          last[i] = s;
          rects[i].style.transform = s === 1 ? "" : `scale(${s.toFixed(3)})`;
          rects[i].style.opacity = s === 1 ? "" : (1 - 0.6 * (1 - k) * eased.blend).toFixed(3);
          moving = true;
        }
      }
      if (eased.blend < 0.002 && !target.on) {
        for (let i = 0; i < rects.length; i++) {
          if (last[i] !== 1) {
            last[i] = 1;
            rects[i].style.transform = "";
            rects[i].style.opacity = "";
          }
        }
        return; // settled: no further frames
      }
      // Settled (pointer resting or gone): stop; the next pointermove restarts.
      if (moving) raf = requestAnimationFrame(step);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(step);
    };
    const onMove = (e) => {
      if (!fine.matches || reduce.matches) return;
      target.x = e.clientX;
      target.y = e.clientY;
      if (!target.on) {
        measure();
        eased.x = e.clientX;
        eased.y = e.clientY;
      }
      target.on = true;
      kick();
    };
    const onLeave = () => {
      target.on = false;
      kick();
    };
    const invalidate = () => (box = null);
    svg.addEventListener("pointermove", onMove);
    svg.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate);
    return () => {
      cancelAnimationFrame(raf);
      svg.removeEventListener("pointermove", onMove);
      svg.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
    };
  }, [cells]);

  return (
    <svg ref={svgRef} viewBox={VIEWBOX} role="img" aria-label={label} className={`sunflower ${className}`} xmlns="http://www.w3.org/2000/svg">
      {cells.map((c, i) => (
        <rect key={i} x={c.x.toFixed(2)} y={c.y.toFixed(2)} width={CELL} height={CELL} fill={c.fill} />
      ))}
    </svg>
  );
}

export default memo(Sunflower);
