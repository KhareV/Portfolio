"use client";

import React, { Suspense, memo, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useInView } from "framer-motion";
import StarsCanvas from "./Stars";
import CanvasLoader from "./CanvasLoader";
import useDeviceDetection from "../hooks/useDeviceDetection";

const EARTH_MODEL_URL = "/planet/scene.opt.glb";

const runWhenIdle = (task, timeout = 1600) => {
  if (typeof window === "undefined") {
    return null;
  }

  if ("requestIdleCallback" in window) {
    return window.requestIdleCallback(task, { timeout });
  }

  return window.setTimeout(task, 220);
};

const cancelIdleTask = (id) => {
  if (typeof window === "undefined" || id == null) {
    return;
  }

  if ("cancelIdleCallback" in window) {
    window.cancelIdleCallback(id);
    return;
  }

  clearTimeout(id);
};

const prewarmEarthModel = async (signal) => {
  try {
    await fetch(EARTH_MODEL_URL, {
      cache: "force-cache",
      signal,
    });
  } catch {
    // Ignore prewarm errors and let Suspense handle actual load.
  }
};

const Earth = memo(() => {
  const earth = useGLTF(EARTH_MODEL_URL);

  return (
    <primitive
      object={earth.scene}
      scale={8.5}
      position={[0, 0, 0]}
      rotation-y={0}
    />
  );
});

const EarthCanvas = () => {
  const { isMobile } = useDeviceDetection();
  const containerRef = useRef(null);
  const [isModelPrewarmed, setIsModelPrewarmed] = useState(false);
  const isNearView = useInView(containerRef, {
    amount: 0,
    margin: "1200px 0px",
  });
  const isInView = useInView(containerRef, {
    amount: 0.05,
    margin: "560px 0px",
  });

  useEffect(() => {
    if (!isNearView || isModelPrewarmed) {
      return;
    }

    let mounted = true;
    const controller = new AbortController();

    const idleTaskId = runWhenIdle(async () => {
      useGLTF.preload(EARTH_MODEL_URL);
      await prewarmEarthModel(controller.signal);

      if (mounted) {
        setIsModelPrewarmed(true);
      }
    }, 1200);

    return () => {
      mounted = false;
      controller.abort();
      cancelIdleTask(idleTaskId);
    };
  }, [isNearView, isModelPrewarmed]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        isolation: "isolate",
      }}
    >
      {isInView ? (
        <>
          <StarsCanvas isActive={isInView} />
          <Canvas
            shadows={false}
            frameloop={isInView ? "always" : "never"}
            dpr={isMobile ? [1, 1] : [1, 1.2]}
            gl={{
              preserveDrawingBuffer: false,
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
              zIndex: 1,
            }}
          >
            <Suspense fallback={<CanvasLoader />}>
              <OrbitControls
                autoRotate={isInView}
                autoRotateSpeed={isMobile ? 2.2 : 3.2}
                enableZoom={false}
                maxPolarAngle={Math.PI}
                minPolarAngle={0}
              />
              <ambientLight intensity={0.8} />
              <directionalLight position={[1, 1, 1]} intensity={1} />
              <hemisphereLight intensity={0.3} groundColor="black" />
              <spotLight
                position={[-20, 50, 10]}
                angle={0.12}
                penumbra={1}
                intensity={1}
              />
              <Earth />
            </Suspense>
          </Canvas>
        </>
      ) : (
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(circle at 30% 35%, rgba(125, 211, 252, 0.15), transparent 52%), radial-gradient(circle at 72% 64%, rgba(167, 139, 250, 0.15), transparent 48%), linear-gradient(180deg, #020617 0%, #000 100%)",
          }}
          aria-hidden="true"
        >
          {isNearView && !isModelPrewarmed && (
            <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center">
              <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1 text-xs tracking-[0.12em] text-slate-100/85">
                Preparing globe...
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

useGLTF.preload(EARTH_MODEL_URL);

export default memo(EarthCanvas);
