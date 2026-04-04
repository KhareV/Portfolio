"use client";

import { memo, useMemo, useRef, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as random from "maath/random/dist/maath-random.esm";
import useDeviceDetection from "../hooks/useDeviceDetection";

const Stars = ({ isActive = true, ...props }) => {
  const { isMobile } = useDeviceDetection();
  const ref = useRef();
  const sphere = useMemo(
    () =>
      random.inSphere(new Float32Array(isMobile ? 540 : 2200), {
        radius: 1.1,
      }),
    [isMobile],
  );

  const targetRotation = useRef({ x: 0, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });
  const drift = useRef(0);

  useEffect(() => {
    // Disable mouse tracking on mobile devices
    if (isMobile) return;

    const handleMouseMove = (event) => {
      const { innerWidth, innerHeight } = window;
      targetRotation.current = {
        x: (event.clientY / innerHeight) * 0.5 - 0.25,
        y: (event.clientX / innerWidth) * 0.5 - 0.25,
      };
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isMobile]);

  useFrame((_, delta) => {
    if (!ref.current || !isActive) return;

    const smoothing = Math.min(1, delta * 4);

    // Keep rotation updates outside React state to avoid re-rendering every frame.
    currentRotation.current.x +=
      (targetRotation.current.x - currentRotation.current.x) * 0.02 * smoothing;
    currentRotation.current.y +=
      (targetRotation.current.y - currentRotation.current.y) * 0.02 * smoothing;

    drift.current += delta * 0.18;

    // Slightly offset the rotation each frame for continuous movement
    ref.current.rotation.x =
      currentRotation.current.x + Math.sin(drift.current) * 0.005;
    ref.current.rotation.y =
      currentRotation.current.y + Math.cos(drift.current * 0.75) * 0.005;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled {...props}>
        <PointMaterial
          transparent
          color="#f272c8"
          size={0.002}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

const StarsCanvas = ({ isActive = true }) => {
  return (
    <div className="w-full h-auto absolute inset-0 z-[-1]">
      <Canvas
        frameloop={isActive ? "always" : "never"}
        dpr={[1, 1.1]}
        camera={{ position: [0, 0, 1] }}
      >
        <Suspense fallback={null}>
          <Stars isActive={isActive} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default memo(StarsCanvas);
