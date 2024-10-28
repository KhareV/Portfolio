import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";
import StarsCanvas from "./Stars";
import CanvasLoader from "./CanvasLoader";

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
  return (
    <>
      <div style={{ width: "100%", height: "100vh", position: "relative" }}>
        <StarsCanvas />
        <Canvas
          shadows
          frameloop="demand"
          dpr={[1, 2]}
          gl={{ preserveDrawingBuffer: true }}
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
              autoRotateSpeed={5}
              enableZoom={false}
              maxPolarAngle={Math.PI}
              minPolarAngle={0}
            />
            <ambientLight intensity={0.8} />
            <directionalLight position={[1, 1, 1]} intensity={1} castShadow />
            <hemisphereLight intensity={0.3} groundColor="black" />
            <spotLight
              position={[-20, 50, 10]}
              angle={0.12}
              penumbra={1}
              intensity={1}
              castShadow
            />
            <Earth />
            <Preload all />
          </Suspense>
        </Canvas>
      </div>
    </>
  );
};

export default EarthCanvas;
