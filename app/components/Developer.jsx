"use client";

import React, { useEffect, useRef } from "react";
import { useFrame, useGraph, useThree } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import { Vector3 } from "three";
import { DRACO_DECODER_PATH } from "../lib/assetPaths.js";

const DEVELOPER_MODEL_PATH = "/models/human/developer.glb";
// Animation-only GLBs (one node per bone, LINEAR keyframes, rotations stored as
// normalized int16). idle/salute/clapping/victory come from the original Mixamo FBX
// files (same keyframe times; rotations within 0.02 deg; no FBXLoader in the bundle);
// dance (M_Dances_004), kick (M_Dances_005) and swing (M_Dances_006) are from the
// Ready Player Me animation library (see public/models/animations/PROVENANCE.md).
const ANIMATION_PATHS = {
  idle: "/models/animations/idle.glb",
  salute: "/models/animations/salute.glb",
  clapping: "/models/animations/clapping.glb",
  victory: "/models/animations/victory.glb",
  dance: "/models/animations/dance.glb",
  kick: "/models/animations/kick.glb",
  swing: "/models/animations/swing.glb",
};

const FALLBACK_ANIMATION = "idle";

// Per-clip framing. The work canvas is tall and narrow (e.g. 530x1164 px at 1440 px),
// and auto-rotate swings limbs that reach towards the viewer out to the sides, so wide
// clips (kicks, raised arms) left the canvas. Measured on the real skinned vertices
// (harness/anim-radius-blend.mjs, every vertex at 60 samples/s, plus cross-fade blends
// with idle at weights 0.1-0.9, which can be wider than either clip: clapping +13 %,
// victory +17 %), in avatar units (x scale):
//   radius   - farthest vertex from the vertical axis over the clip and its cross-fades
//   top      - highest vertex above the feet (used when the orbit is tilted downwards)
//   vertical - camera-distance factor that keeps raised hands/feet inside top/bottom
// The camera only pulls back as far as the clips on screen need for the current canvas
// aspect and tilt, and eases back in once a wide clip has faded out. Idle keeps the
// original framing on canvases at least as wide as at 1180 px viewports; narrower
// desktop canvases (1024-1180 px viewports), which clipped idle before, pull back.
const CLIP_FRAMING = {
  idle: { radius: 0.3871, top: 1.871, vertical: 1 },
  salute: { radius: 0.6282, top: 1.859, vertical: 1 },
  clapping: { radius: 0.5442, top: 1.843, vertical: 1 },
  victory: { radius: 0.8256, top: 2.189, vertical: 1.031 },
  dance: { radius: 0.8606, top: 2.113, vertical: 1 },
  kick: { radius: 1.039, top: 1.862, vertical: 1 },
  swing: { radius: 0.8938, top: 1.858, vertical: 1.001 },
};
const FRAMING_MARGIN = 0.94; // widest point stays within 94 % of the half-width
const FRAMING_OUT_SECONDS = 0.08; // pull back quickly (clapping is widest 0.17 s in)
const FRAMING_IN_SECONDS = 0.35; // return gently
const SUPPORTED_ANIMATIONS = new Set(Object.keys(ANIMATION_PATHS));

const normalizeAnimationName = (animationName) => {
  const normalized = String(animationName || FALLBACK_ANIMATION).toLowerCase();
  return SUPPORTED_ANIMATIONS.has(normalized) ? normalized : FALLBACK_ANIMATION;
};

// `animationName` is only the clip to start with. Later changes go through the
// imperative `playAnimation` handle; the parent re-sends its current choice when
// the handle attaches, so a selection made while the assets load is not lost
// (previously a mount-time effect forced the prop's "idle" over it).
const Developer = React.forwardRef(
  ({ animationName = FALLBACK_ANIMATION, ...props }, ref) => {
    const group = useRef();
    const activeAnimationRef = useRef(FALLBACK_ANIMATION);
    const pendingAnimationRef = useRef(normalizeAnimationName(animationName));

    // Draco-compressed geometry: decode with the self-hosted decoder (never the gstatic CDN).
    const { scene } = useGLTF(DEVELOPER_MODEL_PATH, DRACO_DECODER_PATH);
    const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const { nodes, materials } = useGraph(clone);

    const { animations: idleAnimation } = useGLTF(ANIMATION_PATHS.idle, DRACO_DECODER_PATH);
    const { animations: saluteAnimation } = useGLTF(ANIMATION_PATHS.salute, DRACO_DECODER_PATH);
    const { animations: clappingAnimation } = useGLTF(ANIMATION_PATHS.clapping, DRACO_DECODER_PATH);
    const { animations: victoryAnimation } = useGLTF(ANIMATION_PATHS.victory, DRACO_DECODER_PATH);
    const { animations: danceAnimation } = useGLTF(ANIMATION_PATHS.dance, DRACO_DECODER_PATH);
    const { animations: kickAnimation } = useGLTF(ANIMATION_PATHS.kick, DRACO_DECODER_PATH);
    const { animations: swingAnimation } = useGLTF(ANIMATION_PATHS.swing, DRACO_DECODER_PATH);

    const animationClips = React.useMemo(() => {
      const toNamedClip = (clips, name) => {
        const firstClip = clips?.[0];
        if (!firstClip) {
          return null;
        }

        const clonedClip = firstClip.clone();
        clonedClip.name = name;
        return clonedClip;
      };

      return [
        toNamedClip(idleAnimation, "idle"),
        toNamedClip(saluteAnimation, "salute"),
        toNamedClip(clappingAnimation, "clapping"),
        toNamedClip(victoryAnimation, "victory"),
        toNamedClip(danceAnimation, "dance"),
        toNamedClip(kickAnimation, "kick"),
        toNamedClip(swingAnimation, "swing"),
      ].filter(Boolean);
    }, [
      idleAnimation,
      saluteAnimation,
      clappingAnimation,
      victoryAnimation,
      danceAnimation,
      kickAnimation,
      swingAnimation,
    ]);

    const { actions } = useAnimations(animationClips, group);

    const getThree = useThree((state) => state.get);
    const avatarScale = typeof props.scale === "number" ? props.scale : 1;
    const framingRef = useRef({ base: 0, target: 0, current: 0 });
    const framingOffset = React.useMemo(() => new Vector3(), []);
    useFrame((state, delta) => {
      if (!actions) {
        return;
      }
      const { camera, size, controls } = state;
      const pivot = controls?.target;
      const offset = framingOffset.copy(camera.position);
      if (pivot) {
        offset.sub(pivot);
      }
      const distance = offset.length();
      const framing = framingRef.current;
      if (!framing.base) {
        framing.base = distance; // the Canvas camera's own distance = today's framing
        framing.current = distance;
      }

      // a downward-tilted orbit brings the upper body closer to the camera
      const sinTilt = Math.max(0, offset.y / Math.max(distance, 1e-6));
      const feetY = group.current ? group.current.position.y : 0;
      const pivotY = pivot ? pivot.y : 0;
      const halfFov = (camera.fov * Math.PI) / 360;
      const horizontalTan = Math.tan(halfFov) * (size.width / Math.max(1, size.height));
      const fitAngle = Math.sin(Math.atan(FRAMING_MARGIN * horizontalTan));
      let needed = framing.base;
      // the selected clip (from its first frame, before its weight rises) and every
      // clip still visible (including one fading out) must fit
      for (const name of Object.keys(CLIP_FRAMING)) {
        const action = actions[name];
        const isOnScreen =
          action && action.isRunning() && action.getEffectiveWeight() > 0.001;
        if (name !== activeAnimationRef.current && !isOnScreen) {
          continue;
        }
        const clipFraming = CLIP_FRAMING[name];
        needed = Math.max(
          needed,
          framing.base * clipFraming.vertical,
          (clipFraming.radius * avatarScale) / fitAngle +
            Math.max(0, feetY + clipFraming.top * avatarScale - pivotY) * sinTilt,
        );
      }
      framing.target = needed;

      const tau = needed > framing.current ? FRAMING_OUT_SECONDS : FRAMING_IN_SECONDS;
      const next =
        framing.current + (needed - framing.current) * (1 - Math.exp(-delta / tau));
      framing.current = Math.abs(next - needed) < 1e-4 ? needed : next;
      if (Math.abs(framing.current - distance) > 1e-4) {
        offset.setLength(framing.current);
        camera.position.copy(pivot ? offset.add(pivot) : offset);
      }
    });

    const applyAnimation = React.useCallback(
      (animationToPlay, { force = false } = {}) => {
        if (!actions) {
          return false;
        }

        const safeAnimationName = normalizeAnimationName(animationToPlay);
        const nextAction = actions[safeAnimationName];

        if (!nextAction) {
          return false;
        }

        if (!force && activeAnimationRef.current === safeAnimationName) {
          return true;
        }

        actions[activeAnimationRef.current]?.fadeOut(0.32);
        nextAction.reset().fadeIn(0.32).play();
        if (typeof window !== "undefined" && window.__PORTFOLIO_ANIMATION_PROBE__ === true) {
          (window.__workAnimationLog ||= []).push({
            at: Math.round(performance.now()),
            from: activeAnimationRef.current,
            to: safeAnimationName,
          });
        }
        activeAnimationRef.current = safeAnimationName;
        return true;
      },
      [actions],
    );

    const playAnimation = React.useCallback(
      (nextAnimationName) => {
        const safeAnimationName = normalizeAnimationName(nextAnimationName);
        pendingAnimationRef.current = safeAnimationName;
        applyAnimation(safeAnimationName);
      },
      [applyAnimation],
    );

    React.useImperativeHandle(
      ref,
      () => ({
        playAnimation,
      }),
      [playAnimation],
    );

    useEffect(() => {
      if (!actions) {
        return;
      }

      Object.values(actions).forEach((action) => {
        if (action) {
          action.enabled = true;
          action.clampWhenFinished = false;
        }
      });

      applyAnimation(pendingAnimationRef.current, { force: true });

      return () => {
        Object.values(actions).forEach((action) => {
          action?.fadeOut(0.2);
        });
      };
    }, [actions, applyAnimation]);

    // Test/diagnostic probe, off unless a test sets window.__PORTFOLIO_ANIMATION_PROBE__
    // before load. It only reads mixer state; nothing visible or timed depends on it.
    useEffect(() => {
      if (typeof window === "undefined" || window.__PORTFOLIO_ANIMATION_PROBE__ !== true || !actions) {
        return undefined;
      }

      const fingerprint = (clip) =>
        clip.tracks.reduce(
          (sum, track) => sum + track.values.reduce((acc, value) => acc + value, 0),
          0,
        );
      const probe = {
        sources: ANIMATION_PATHS,
        // Test hook: put the auto-rotating orbit at a given azimuth (radians), keeping
        // distance and tilt, so framing tests can cover every viewing angle on purpose.
        orbitTo: (azimuth) => {
          const { camera, controls } = getThree();
          const pivot = controls?.target ?? new Vector3();
          const offset = camera.position.clone().sub(pivot);
          const horizontal = Math.hypot(offset.x, offset.z);
          camera.position.set(
            pivot.x + horizontal * Math.sin(azimuth),
            camera.position.y,
            pivot.z + horizontal * Math.cos(azimuth),
          );
          camera.lookAt(pivot);
        },
        // Projected extents (NDC, -1..1 = canvas edges) of every skinned vertex in the
        // pose last rendered, through the live camera.
        bounds: () => {
          const { camera } = getThree();
          const point = new Vector3();
          let maxAbsX = 0;
          let minY = Infinity;
          let maxY = -Infinity;
          group.current?.updateMatrixWorld(true);
          group.current?.traverse((object) => {
            if (!object.isSkinnedMesh) return;
            const count = object.geometry.attributes.position.count;
            for (let i = 0; i < count; i += 1) {
              object.getVertexPosition(i, point);
              point.applyMatrix4(object.matrixWorld).project(camera);
              maxAbsX = Math.max(maxAbsX, Math.abs(point.x));
              minY = Math.min(minY, point.y);
              maxY = Math.max(maxY, point.y);
            }
          });
          return { maxAbsX, minY, maxY };
        },
        snapshot: () => ({
          requested: pendingAnimationRef.current,
          active: activeAnimationRef.current,
          framing: { ...framingRef.current },
          actions: Object.keys(ANIMATION_PATHS).map((name) => {
            const action = actions[name];
            const clip = action?.getClip();
            return {
              name,
              source: ANIMATION_PATHS[name],
              running: Boolean(action?.isRunning()),
              enabled: Boolean(action?.enabled),
              weight: action ? action.getEffectiveWeight() : 0,
              time: action ? action.time : 0,
              duration: clip ? clip.duration : 0,
              tracks: clip ? clip.tracks.length : 0,
              fingerprint: clip ? fingerprint(clip) : null,
            };
          }),
        }),
      };
      window.__workAnimation = probe;
      return () => {
        if (window.__workAnimation === probe) {
          delete window.__workAnimation;
        }
      };
    }, [actions, getThree]);

    return (
      <group {...props} dispose={null} ref={group}>
        <primitive object={nodes.Hips} />
        <skinnedMesh
          name="EyeLeft"
          geometry={nodes.EyeLeft.geometry}
          material={materials.Wolf3D_Eye}
          skeleton={nodes.EyeLeft.skeleton}
          morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
          morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
        />
        <skinnedMesh
          name="EyeRight"
          geometry={nodes.EyeRight.geometry}
          material={materials.Wolf3D_Eye}
          skeleton={nodes.EyeRight.skeleton}
          morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
          morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
        />
        <skinnedMesh
          name="Wolf3D_Head"
          geometry={nodes.Wolf3D_Head.geometry}
          material={materials.Wolf3D_Skin}
          skeleton={nodes.Wolf3D_Head.skeleton}
          morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
          morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
        />
        <skinnedMesh
          name="Wolf3D_Teeth"
          geometry={nodes.Wolf3D_Teeth.geometry}
          material={materials.Wolf3D_Teeth}
          skeleton={nodes.Wolf3D_Teeth.skeleton}
          morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
          morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
        />
        <skinnedMesh
          geometry={nodes.Wolf3D_Hair.geometry}
          material={materials.Wolf3D_Hair}
          skeleton={nodes.Wolf3D_Hair.skeleton}
        />
        <skinnedMesh
          geometry={nodes.Wolf3D_Glasses.geometry}
          material={materials.Wolf3D_Glasses}
          skeleton={nodes.Wolf3D_Glasses.skeleton}
        />
        <skinnedMesh
          geometry={nodes.Wolf3D_Outfit_Top.geometry}
          material={materials.Wolf3D_Outfit_Top}
          skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
        />
        <skinnedMesh
          geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
          material={materials.Wolf3D_Outfit_Bottom}
          skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
        />
        <skinnedMesh
          geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
          material={materials.Wolf3D_Outfit_Footwear}
          skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
        />
        <skinnedMesh
          geometry={nodes.Wolf3D_Body.geometry}
          material={materials.Wolf3D_Body}
          skeleton={nodes.Wolf3D_Body.skeleton}
        />
      </group>
    );
  },
);

Developer.displayName = "Developer";

useGLTF.preload(DEVELOPER_MODEL_PATH, DRACO_DECODER_PATH);
Object.values(ANIMATION_PATHS).forEach((path) =>
  useGLTF.preload(path, DRACO_DECODER_PATH),
);
export default Developer;
