"use client";

// Small replacement for react-globe.gl (whose three-globe layers kept
// requestAnimationFrame loops alive after pause/unmount). Same content: an
// untextured globe with graticules, a soft atmosphere, ten capital pins and a
// labelled Chennai pin. It renders only while visible (frameloop control) and
// renders on demand: zero frames unless the visitor drags it.
import { useMemo } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { watchContextLoss } from "./SceneBoundary";

const R = 1;
const toVec = (lat, lng, r = R) => {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
};

function Graticules() {
  const geometry = useMemo(() => {
    const pts = [];
    for (let lat = -75; lat <= 75; lat += 15)
      for (let lng = -180; lng < 180; lng += 4) pts.push(toVec(lat, lng, R * 1.001), toVec(lat, lng + 4, R * 1.001));
    for (let lng = -180; lng < 180; lng += 15)
      for (let lat = -88; lat < 88; lat += 4) pts.push(toVec(lat, lng, R * 1.001), toVec(lat + 4, lng, R * 1.001));
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#94a3b8" transparent opacity={0.22} />
    </lineSegments>
  );
}

function Pin({ lat, lng, color, label }) {
  const pos = useMemo(() => toVec(lat, lng, R * 1.02), [lat, lng]);
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[label ? 0.03 : 0.022, 12, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {label ? (
        <Html center distanceFactor={4} occlude={false} style={{ pointerEvents: "none" }}>
          <span style={{ color: "#fde68a", fontSize: 12, whiteSpace: "nowrap", textShadow: "0 1px 3px #000", transform: "translateY(-14px)", display: "block" }}>{label}</span>
        </Html>
      ) : null}
    </group>
  );
}

export default function GlobeScene({ locations, active, onFail }) {
  // Face India on load.
  const camera = useMemo(() => ({ position: toVec(20, 78, 3.1).toArray(), fov: 40 }), []);
  return (
    <Canvas
      frameloop={active ? "demand" : "never"}
      dpr={[1, 1.5]}
      camera={camera}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      onCreated={({ gl }) => watchContextLoss(gl.domElement, () => onFail?.(new Error("WebGL context lost")))}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 2, 4]} intensity={1.1} />
      <mesh>
        <sphereGeometry args={[R, 64, 64]} />
        <meshPhongMaterial color="#0b1a33" shininess={8} />
      </mesh>
      <mesh scale={1.12}>
        <sphereGeometry args={[R, 48, 48]} />
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
      <Graticules />
      {locations.map((l, i) => (
        <Pin key={i} {...l} />
      ))}
      <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.5} autoRotate={false} />
    </Canvas>
  );
}
