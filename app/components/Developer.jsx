"use client";

import React, { useEffect, useRef } from "react";
import { useGraph } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import { DRACO_DECODER_PATH } from "../lib/assetPaths.js";

const DEVELOPER_MODEL_PATH = "/models/human/developer.glb";
// Animation-only GLBs (one node per bone, LINEAR keyframes). idle/salute/clapping/
// victory are converted 1:1 from the original Mixamo FBX files (bit-identical
// keyframes, ~90 % smaller, no FBXLoader in the bundle); dance (M_Dances_004) and
// kick (M_Dances_005) are from the Ready Player Me animation library (see public/models/animations/PROVENANCE.md).
const ANIMATION_PATHS = {
  idle: "/models/animations/idle.glb",
  salute: "/models/animations/salute.glb",
  clapping: "/models/animations/clapping.glb",
  victory: "/models/animations/victory.glb",
  dance: "/models/animations/dance.glb",
  kick: "/models/animations/kick.glb",
};

const FALLBACK_ANIMATION = "idle";
const SUPPORTED_ANIMATIONS = new Set(Object.keys(ANIMATION_PATHS));

const normalizeAnimationName = (animationName) => {
  const normalized = String(animationName || FALLBACK_ANIMATION).toLowerCase();
  return SUPPORTED_ANIMATIONS.has(normalized) ? normalized : FALLBACK_ANIMATION;
};

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
      ].filter(Boolean);
    }, [
      idleAnimation,
      saluteAnimation,
      clappingAnimation,
      victoryAnimation,
      danceAnimation,
      kickAnimation,
    ]);

    const { actions } = useAnimations(animationClips, group);

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

    useEffect(() => {
      playAnimation(animationName);
    }, [animationName, playAnimation]);

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
