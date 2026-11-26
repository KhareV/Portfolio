"use client";

// Monitor model (public/models/computer.glb, Draco-compressed). The original
// gltfjsx output carried 148 empty transform groups; only the meshes that
// render are kept. The Draco decoder is self-hosted under /draco/.
import { useGLTF } from "@react-three/drei";

export const COMPUTER_URL = "/models/computer.glb";
export const DRACO_PATH = "/draco/";

export default function DemoComputer({ screenTexture, ...props }) {
  const { nodes, materials } = useGLTF(COMPUTER_URL, DRACO_PATH);
  return (
    <group {...props} dispose={null}>
      <mesh name="monitor-screen" geometry={nodes["monitor-screen"].geometry} position={[0.127, 1.831, 0.511]} rotation={[1.571, -0.005, 0.031]} scale={[0.661, 0.608, 0.401]}>
        <meshBasicMaterial map={screenTexture} toneMapped={false} color={screenTexture ? "white" : "#0f172a"} />
      </mesh>
      <group position={[0.266, 1.132, 0.051]} rotation={[0, -0.033, 0]} scale={[0.042, 0.045, 0.045]}>
        {[
          ["Monitor-B-_computer_0_1", "computer"],
          ["Monitor-B-_computer_0_2", "base__0"],
          ["Monitor-B-_computer_0_3", "Material_36"],
          ["Monitor-B-_computer_0_4", "Material_35"],
          ["Monitor-B-_computer_0_5", "Material_34"],
          ["Monitor-B-_computer_0_6", "keys"],
          ["Monitor-B-_computer_0_7", "keys2"],
          ["Monitor-B-_computer_0_8", "Material_37"],
        ].map(([node, mat]) => (
          <mesh key={node} geometry={nodes[node].geometry} material={materials[mat]} />
        ))}
      </group>
    </group>
  );
}
