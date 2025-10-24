import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";
import StarsCanvas from "./Stars";
import CanvasLoader from "./CanvasLoader";
import useDeviceDetection from "../hooks/useDeviceDetection";

const Earth = () => {
  const earth = useGLTF("planet/scene.gltf");

  return (
    <primitive
      object={earth.scene}
      scale={8.5}
      position={[0, 0, 0]}
      rotation-y={0}
    />
  );
};

const EarthCanvas = () => {
  const { isMobile } = useDeviceDetection();

  return (
    <>
      <div style={{ width: "100%", height: "100vh", position: "relative" }}>
        <StarsCanvas />
        <Canvas
          shadows
          frameloop="demand"
          dpr={isMobile ? [1, 1] : [1, 2]}
          gl={{
            preserveDrawingBuffer: true,
            antialias: !isMobile,
            powerPreference: isMobile ? "low-power" : "high-performance",
          }}
          camera={{
            fov: 30,
            near: 0.1,
            far: 200,
            position: [0, 0, 35],
          }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "transparent",
          }}
        >
          <Suspense fallback={<CanvasLoader />}>
            <OrbitControls
              autoRotate
              autoRotateSpeed={isMobile ? 3 : 5}
              enableZoom={false}
              maxPolarAngle={Math.PI}
              minPolarAngle={0}
            />
            <ambientLight intensity={0.8} />
            <directionalLight
              position={[1, 1, 1]}
              intensity={1}
              castShadow={!isMobile}
            />
            <hemisphereLight intensity={0.3} groundColor="black" />
            <spotLight
              position={[-20, 50, 10]}
              angle={0.12}
              penumbra={1}
              intensity={1}
              castShadow={!isMobile}
            />
            <Earth />
            {!isMobile && <Preload all />}
          </Suspense>
        </Canvas>
      </div>
    </>
  );
};

export default EarthCanvas;
