import React, { Suspense, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";
import CanvasLoader from "../components/CanvasLoader.jsx";

const Computers = ({ isMobile }) => {
  const computer = useGLTF("./desktop_pc/scene.gltf");

  // State to store rotation based on cursor
  const [rotation, setRotation] = useState([0, -0.2, -0.1]);
  const [targetRotation, setTargetRotation] = useState([0, -0.2, -0.1]);

  // Smoothly update rotation
  useFrame(() => {
    setRotation((prev) => [
      prev[0] + (targetRotation[0] - prev[0]) * 0.08, // Adjust for smoother motion
      prev[1] + (targetRotation[1] - prev[1]) * 0.08,
      prev[2],
    ]);
  });

  const handlePointerMove = (e) => {
    // Calculate x and y rotations, with controlled vertical range to avoid drastic downwards movement
    const { clientX, clientY } = e;
    const xRotation = (clientY / window.innerHeight - 0.5) * 0.4; // Reduced for smoother vertical movement
    const yRotation = (clientX / window.innerWidth - 0.5) * 0.6; // Moderate horizontal movement

    // Set target rotation based on calculated x and y values
    setTargetRotation([xRotation, -0.2 + yRotation, -0.1]);
  };

  const handlePointerLeave = () => {
    // Reset rotation when cursor leaves the canvas
    setTargetRotation([0, -0.2, -0.1]);
  };

  return (
    <mesh onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}>
      <hemisphereLight intensity={0.4} groundColor="black" />{" "}
      {/* Increased intensity */}
      <spotLight
        position={[-20, 50, 10]}
        angle={0.12}
        penumbra={1}
        intensity={1.5} // Increased intensity
        castShadow
        shadow-mapSize={1024}
      />
      <pointLight intensity={2} /> {/* Increased intensity */}
      <ambientLight intensity={0.8} /> {/* Added ambient light */}
      <primitive
        object={computer.scene}
        scale={isMobile ? 0.7 : 0.5}
        position={isMobile ? [0, -3, -2.2] : [0, -3.25, -1.5]}
        rotation={rotation}
      />
    </mesh>
  );
};

const ComputersCanvas = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 500px)");
    setIsMobile(mediaQuery.matches);
    const handleMediaQueryChange = (event) => setIsMobile(event.matches);
    mediaQuery.addEventListener("change", handleMediaQueryChange);
    return () =>
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
  }, []);

  return (
    <Canvas
      frameloop="demand"
      shadows
      dpr={[1, 2]}
      camera={{ position: [20, 3, 5], fov: 25 }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <Suspense fallback={<CanvasLoader />}>
        <OrbitControls
          enableZoom={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
        <Computers isMobile={isMobile} />
      </Suspense>
      <Preload all />
    </Canvas>
  );
};

export default ComputersCanvas;
