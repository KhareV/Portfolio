import { useState, useRef, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Preload } from "@react-three/drei";
import * as random from "maath/random/dist/maath-random.esm";
import useDeviceDetection from "../hooks/useDeviceDetection";

const Stars = (props) => {
  const { isMobile } = useDeviceDetection();
  const ref = useRef();
  const [sphere] = useState(() =>
    random.inSphere(new Float32Array(isMobile ? 1000 : 5000), { radius: 1.2 })
  );

  const [targetRotation, setTargetRotation] = useState({ x: 0, y: 0 });
  const [currentRotation, setCurrentRotation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Disable mouse tracking on mobile devices
    if (isMobile) return;

    const handleMouseMove = (event) => {
      const { innerWidth, innerHeight } = window;
      setTargetRotation({
        x: (event.clientY / innerHeight) * 0.5 - 0.25,
        y: (event.clientX / innerWidth) * 0.5 - 0.25,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isMobile]);

  useFrame(() => {
    // Apply a slow interpolation factor for a larger delay effect
    setCurrentRotation((prevRotation) => ({
      x: prevRotation.x + (targetRotation.x - prevRotation.x) * 0.02,
      y: prevRotation.y + (targetRotation.y - prevRotation.y) * 0.02,
    }));

    // Slightly offset the rotation each frame for continuous movement
    ref.current.rotation.x =
      currentRotation.x + Math.sin(currentRotation.y) * 0.005;
    ref.current.rotation.y =
      currentRotation.y + Math.sin(currentRotation.x) * 0.005;
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

const StarsCanvas = () => {
  return (
    <div className="w-full h-auto absolute inset-0 z-[-1]">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Suspense fallback={null}>
          <Stars />
        </Suspense>
        <Preload all />
      </Canvas>
    </div>
  );
};

export default StarsCanvas;
