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
const AUTO_ROTATE_SPEED = 0.8;
// drei's OrbitControls calls controls.update() once per rendered frame without
// a delta, so auto-rotation advances 2π/3600·speed radians per frame.
const AUTO_ROTATE_RAD_PER_FRAME = ((2 * Math.PI) / 3600) * AUTO_ROTATE_SPEED;
const FRAME_MS = 1000 / 60;

const ProjectScene = ({ texture, isMobile, isActive = true }) => {
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const resumeTimerRef = useRef(null);
  const controlsRef = useRef(null);
  const inactiveSinceRef = useRef(null);

  // Offscreen the scene is not rendered (it used to rotate unseen at 60 fps).
  // On re-entry, advance the auto-rotation by the time spent offscreen so the
  // computer appears at the same angle it would have reached before.
  useEffect(() => {
    if (!isActive) {
      inactiveSinceRef.current = performance.now();
      return;
    }
    const since = inactiveSinceRef.current;
    inactiveSinceRef.current = null;
    const controls = controlsRef.current;
    if (since == null || !controls || isUserInteracting || typeof controls._rotateLeft !== "function") {
      return;
    }
    const frames = (performance.now() - since) / FRAME_MS;
    const damping = controls.enableDamping;
    controls.enableDamping = false;
    controls._rotateLeft((frames * AUTO_ROTATE_RAD_PER_FRAME) % (2 * Math.PI));
    controls.update();
    controls.enableDamping = damping;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

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
      // offscreen: render only on demand (first frame / invalidations) instead
      // of 60 fps at all times
      frameloop={isActive ? "always" : "demand"}
      gl={glConfig}
      camera={cameraConfig}
    >
      {/* Same HDR bytes drei's "studio" preset fetched from a CDN, self-hosted (public/hdri/PROVENANCE.md). */}
      <Environment files="/hdri/studio_small_03_1k.hdr" environmentIntensity={0.8} />
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
            <DemoComputer texture={texture} isActive={isActive} />
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
        ref={controlsRef}
        maxPolarAngle={Math.PI / 2 + 0.1}
        minPolarAngle={Math.PI / 3}
        enableZoom={false}
        enablePan={false}
        autoRotate={isActive && !isUserInteracting}
        autoRotateSpeed={AUTO_ROTATE_SPEED}
        rotateSpeed={0.5}
        onStart={handleControlsStart}
        onEnd={handleControlsEnd}
      />
    </Canvas>
  );
};

export default memo(ProjectScene);
