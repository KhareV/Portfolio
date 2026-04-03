"use client";

import {
  memo,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas } from "@react-three/fiber";
import {
  Center,
  OrbitControls,
  Environment,
  ContactShadows,
} from "@react-three/drei";

import CanvasLoader from "./CanvasLoader.jsx";
import DemoComputer from "./DemoComputer.jsx";

const AUTO_ROTATE_RESUME_DELAY_MS = 1800;

const ProjectScene = ({ texture, isMobile }) => {
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const resumeTimerRef = useRef(null);

  const glConfig = useMemo(
    () => ({
      antialias: !isMobile,
      alpha: true,
      powerPreference: isMobile ? "low-power" : "high-performance",
    }),
    [isMobile],
  );

  const cameraConfig = useMemo(() => ({ position: [0, 0, 12], fov: 45 }), []);

  const modelTransform = useMemo(
    () => ({
      scale: isMobile ? 1.4 : 1.7,
      position: [0, -1.8, 0],
      rotation: [0, -0.2, 0],
    }),
    [isMobile],
  );

  const clearResumeTimer = useCallback(() => {
    if (resumeTimerRef.current == null) {
      return;
    }

    window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = null;
  }, []);

  const handleControlsStart = useCallback(() => {
    clearResumeTimer();
    setIsUserInteracting(true);
  }, [clearResumeTimer]);

  const handleControlsEnd = useCallback(() => {
    clearResumeTimer();
    resumeTimerRef.current = window.setTimeout(() => {
      setIsUserInteracting(false);
      resumeTimerRef.current = null;
    }, AUTO_ROTATE_RESUME_DELAY_MS);
  }, [clearResumeTimer]);

  useEffect(() => {
    setIsUserInteracting(false);
  }, [texture]);

  useEffect(() => {
    return () => {
      clearResumeTimer();
    };
  }, [clearResumeTimer]);

  return (
    <Canvas
      className="relative z-10 w-full h-full cursor-grab active:cursor-grabbing"
      dpr={isMobile ? [1, 1.25] : [1, 1.5]}
      gl={glConfig}
      camera={cameraConfig}
    >
      <Environment preset="studio" environmentIntensity={0.8} />
      <ambientLight intensity={0.6} color="#ffffff" />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.5}
        color="#ffffff"
        castShadow
      />
      <directionalLight
        position={[-5, 5, -5]}
        intensity={0.5}
        color="#e2e8f0"
      />

      <Center>
        <Suspense fallback={<CanvasLoader />}>
          <group
            scale={modelTransform.scale}
            position={modelTransform.position}
            rotation={modelTransform.rotation}
          >
            <DemoComputer texture={texture} />
          </group>

          <ContactShadows
            position={[0, -2.5, 0]}
            opacity={0.3}
            scale={15}
            blur={2.5}
            far={4}
            color="#0f172a"
          />
        </Suspense>
      </Center>

      <OrbitControls
        maxPolarAngle={Math.PI / 2 + 0.1}
        minPolarAngle={Math.PI / 3}
        enableZoom={false}
        enablePan={false}
        autoRotate={!isUserInteracting}
        autoRotateSpeed={0.8}
        rotateSpeed={0.5}
        onStart={handleControlsStart}
        onEnd={handleControlsEnd}
      />
    </Canvas>
  );
};

export default memo(ProjectScene);
