"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Developer from "./Developer";
import { watchContextLoss } from "./SceneBoundary";

export default function WorkExperienceScene({ developerRef, isActive, onFail }) {
  return (
    <Canvas
      frameloop={isActive ? "always" : "never"}
      dpr={[1, 1.35]}
      gl={{ antialias: true, powerPreference: "low-power" }}
      camera={{ position: [0, 0.2, 8], fov: 34 }}
      onCreated={({ gl }) => watchContextLoss(gl.domElement, () => onFail?.(new Error("WebGL context lost")))}
    >
      <ambientLight intensity={1.5} />
      <spotLight position={[8, 9, 7]} angle={0.2} penumbra={0.8} intensity={1.1} />
      <directionalLight position={[5, 8, 6]} intensity={0.9} color="#f8fafc" />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate={isActive} autoRotateSpeed={0.5} rotateSpeed={0.45} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 3.5} />
      <Suspense fallback={null}>
        <Developer ref={developerRef} position-y={-2.2} scale={2.45} />
      </Suspense>
    </Canvas>
  );
}
