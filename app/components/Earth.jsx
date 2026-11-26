"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PointMaterial, Points, useGLTF } from "@react-three/drei";
import { starPositions } from "./starField";
import { watchContextLoss } from "./SceneBoundary";

const EARTH_URL = "/planet/scene.opt.glb";

function Planet() {
  const { scene } = useGLTF(EARTH_URL, "/draco/");
  return <primitive object={scene} scale={8.5} />;
}

// Stars live in the same scene as the planet (one WebGL context instead of two).
function StarShell() {
  const ref = useRef();
  const positions = useMemo(() => starPositions(1500, 60), []);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.01;
  });
  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#f9a8d4" size={0.12} sizeAttenuation depthWrite={false} />
    </Points>
  );
}

export default function EarthScene({ active, onFail }) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.25]}
      gl={{ antialias: true, powerPreference: "low-power" }}
      camera={{ fov: 30, near: 0.1, far: 200, position: [0, 0, 35] }}
      onCreated={({ gl }) => watchContextLoss(gl.domElement, () => onFail?.(new Error("WebGL context lost")))}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[1, 1, 1]} intensity={1} />
      <hemisphereLight intensity={0.3} groundColor="black" />
      <StarShell />
      <Suspense fallback={null}>
        <Planet />
      </Suspense>
      <OrbitControls autoRotate={active} autoRotateSpeed={2.4} enableZoom={false} enablePan={false} />
    </Canvas>
  );
}
