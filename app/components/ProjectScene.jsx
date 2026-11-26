"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Center, ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import DemoComputer from "./DemoComputer";
import { watchContextLoss } from "./SceneBoundary";

// One <video> element per scene, re-pointed when the project changes. (drei's
// useVideoTexture caches one playing element per URL, so fast switching left
// up to five videos decoding in the background.)
function useProjectVideo(src, active, onFail) {
  const onFailRef = useRef(onFail);
  useEffect(() => {
    onFailRef.current = onFail;
  }, [onFail]);
  const video = useMemo(() => {
    const v = document.createElement("video");
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.preload = "auto";
    v.crossOrigin = "anonymous";
    return v;
  }, []);
  const texture = useMemo(() => {
    const t = new THREE.VideoTexture(video);
    t.colorSpace = THREE.SRGBColorSpace;
    t.flipY = false;
    return t;
  }, [video]);
  const [readySrc, setReadySrc] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const onData = () => !cancelled && setReadySrc(src);
    const onError = () => !cancelled && onFailRef.current?.(new Error(`video failed: ${src}`));
    video.addEventListener("loadeddata", onData);
    video.addEventListener("error", onError);
    video.src = src;
    video.load();
    return () => {
      cancelled = true;
      video.removeEventListener("loadeddata", onData);
      video.removeEventListener("error", onError);
    };
  }, [src, video]);

  useEffect(() => {
    if (active && readySrc === src) video.play().catch(() => {});
    else video.pause();
  }, [active, readySrc, src, video]);

  useEffect(
    () => () => {
      video.pause();
      video.removeAttribute("src");
      video.load();
      texture.dispose();
    },
    [video, texture],
  );

  return { texture, ready: readySrc === src };
}

function Scene({ video, active, onReady, onFail }) {
  const { texture, ready } = useProjectVideo(video, active, onFail);
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);
  useEffect(() => {
    if (ready) onReadyRef.current?.();
  }, [ready]);
  return (
    <>
      <Center>
        <group scale={1.7} position={[0, -1.8, 0]} rotation={[0, -0.2, 0]}>
          <DemoComputer screenTexture={ready ? texture : null} />
        </group>
        <ContactShadows position={[0, -2.5, 0]} opacity={0.3} scale={15} blur={2.5} far={4} frames={1} color="#0f172a" />
      </Center>
    </>
  );
}

export default function ProjectScene({ video, active, onReady, onFail }) {
  return (
    <Canvas
      className="h-full w-full cursor-grab active:cursor-grabbing"
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 12], fov: 45 }}
      onCreated={({ gl }) => {
        watchContextLoss(gl.domElement, () => onFail?.(new Error("WebGL context lost")));
      }}
      aria-hidden="true"
    >
      {/* Local studio lighting: rendered once into an env map; no network. */}
      <Environment resolution={64} environmentIntensity={0.8}>
        <Lightformer intensity={2.2} position={[0, 5, -6]} scale={[10, 4, 1]} />
        <Lightformer intensity={1.2} position={[-6, 1, 0]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer intensity={1.2} position={[6, 1, 0]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer intensity={0.6} position={[0, -4, 4]} rotation-x={-Math.PI / 2} scale={[10, 10, 1]} color="#e2e8f0" />
      </Environment>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#e2e8f0" />
      <Suspense fallback={null}>
        <Scene video={video} active={active} onReady={onReady} onFail={onFail} />
      </Suspense>
      <OrbitControls
        maxPolarAngle={Math.PI / 2 + 0.1}
        minPolarAngle={Math.PI / 3}
        enableZoom={false}
        enablePan={false}
        autoRotate={active}
        autoRotateSpeed={0.8}
        rotateSpeed={0.5}
      />
    </Canvas>
  );
}
