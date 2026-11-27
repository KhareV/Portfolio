# Character animation clips

Animation-only glTF binaries (one node per bone, LINEAR keyframes) for the
Ready Player Me avatar in `public/models/human/developer.glb`.

| File | Source | Notes |
|---|---|---|
| idle.glb, salute.glb, clapping.glb, victory.glb | The site's previous Mixamo FBX clips (`idle.fbx`, `salute.fbx`, `clapping.fbx`, `victory.fbx`) | Converted 1:1. The keyframe times and values are bit-identical to what three.js `FBXLoader` produced from the FBX. The `Armature` root track was dropped because it had no target in the avatar and only logged a warning. |
| dance.glb | Ready Player Me Animation Library, `masculine/glb/dance/M_Dances_004.glb` (https://github.com/readyplayerme/animation-library) | Re-packed with identical keyframes. |
| kick.glb | Ready Player Me Animation Library, `masculine/glb/dance/M_Dances_005.glb` | Re-packed with identical keyframes. |

## Licence of dance.glb

The clip comes from the Ready Player Me Animation Library (© 2023 Ready Player Me OÜ). That licence allows personal and commercial use with Ready Player Me avatars, and the avatar here is one. It does not allow redistributing the animation files to third parties.

The site uses the clip only to animate its own avatar. Whether the clip should also be published in a public repository is the site owner's decision.

## Regenerating

The conversion script is `harness/anim2glb.mjs` in the Phase 1 audit workspace. It reloads each output with `GLTFLoader` and checks every track against the source clip.
