# Character animation clips

Animation-only glTF binaries (one node per bone, LINEAR keyframes) for the
Ready Player Me avatar in `public/models/human/developer.glb`.

| File | Source | Notes |
|---|---|---|
| idle.glb, salute.glb, clapping.glb, victory.glb | The site's previous Mixamo FBX clips (`idle.fbx`, `salute.fbx`, `clapping.fbx`, `victory.fbx`) | Converted 1:1 (keyframe times bit-identical to three.js `FBXLoader` output; rotations then quantised, see below). The `Armature` root track was dropped because it had no target in the avatar and only logged a warning. |
| dance.glb | Ready Player Me Animation Library, `masculine/glb/dance/M_Dances_004.glb` (https://github.com/readyplayerme/animation-library) | Re-packed with identical keyframe times (rotations quantised, see below). |
| kick.glb | Ready Player Me Animation Library, `masculine/glb/dance/M_Dances_005.glb` | Re-packed with identical keyframe times (rotations quantised, see below). |
| swing.glb | Ready Player Me Animation Library, `masculine/glb/dance/M_Dances_006.glb` | Re-packed with identical keyframe times (rotations quantised, see below). |

## Rotation quantisation

All seven files store bone rotations as normalized signed 16-bit integers
(core glTF 2.0 animation output type, no extension or decoder). Keyframe
times and the Hips translation are unchanged float32. Against the float32
clips the largest bone rotation error is 0.0033° (local) / 0.0185° (world,
through the avatar skeleton); about 0.3 MB less over the wire (gzip).

## Licence of dance.glb

The clip comes from the Ready Player Me Animation Library (© 2023 Ready Player Me OÜ). That licence allows personal and commercial use with Ready Player Me avatars, and the avatar here is one. It does not allow redistributing the animation files to third parties.

The site uses the clip only to animate its own avatar. Whether the clip should also be published in a public repository is the site owner's decision.

## Regenerating

The conversion script is `harness/anim2glb.mjs` in the Phase 1 audit workspace. It reloads each output with `GLTFLoader` and checks every track against the source clip.
