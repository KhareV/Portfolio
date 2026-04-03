"use client";

import { memo, Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import Developer from "./Developer.jsx";
import CanvasLoader from "./CanvasLoader.jsx";

const WorkExperienceScene = ({ developerRef, isActive }) => {
  const glConfig = useMemo(
    () => ({
      antialias: true,
      powerPreference: "low-power",
    }),
    [],
  );

  return (
    <div className="work-canvas">
      <Canvas
        frameloop={isActive ? "always" : "never"}
        dpr={[1, 1.35]}
        gl={glConfig}
        camera={{ position: [0, 0.2, 8], fov: 34 }}
      >
        <ambientLight intensity={1.5} />
        <spotLight
          position={[8, 9, 7]}
          angle={0.2}
          penumbra={0.8}
          intensity={1.1}
        />
        <directionalLight
          position={[5, 8, 6]}
          intensity={0.9}
          color="#f8fafc"
        />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate
          autoRotate={isActive}
          autoRotateSpeed={0.5}
          rotateSpeed={0.45}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3.5}
        />

        <Suspense fallback={<CanvasLoader />}>
          <Developer ref={developerRef} position-y={-2.2} scale={2.45} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default memo(WorkExperienceScene);
