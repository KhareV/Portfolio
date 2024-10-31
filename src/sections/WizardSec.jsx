import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import CanvasLoader from "../components/CanvasLoader";
import Wizard from "../components/Wizard";
import Navigation from "../components/navigation/index";

const WizardSec = () => {
  return (
    <div className="left-96 top-4 relative w-full h-full flex items-center justify-center">
      {/* Ensure Navigation has a high z-index to be clickable */}
      <div className="absolute z-10 top-5 left-1180">
        <Navigation />
      </div>
      {/* Canvas behind Navigation */}
      <Canvas className="absolute top-0 left-0 w-full h-full z-0">
        <ambientLight intensity={0.7} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2} />
        <Suspense fallback={<CanvasLoader />}>
          <Wizard position={[0, 0, 0]} />
          <Environment preset="dawn" />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default WizardSec;
