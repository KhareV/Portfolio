// next/image settings shared by the components that render these images and by the
// idle-time preloader, so the preloader warms exactly the optimised URLs the page
// requests (same srcset/sizes/quality) instead of the multi-megabyte source PNGs.

// Projects card background (rendered at 2 % opacity behind the card).
// quality 75: the only configured quality; the previous `52` was coerced to 75 anyway.
export const PROJECT_SPOTLIGHT_IMAGE = {
  fill: true,
  sizes: "(min-width: 1024px) 40vw, 100vw",
  quality: 75,
};

// Work-experience timeline logos.
export const WORK_ICON_IMAGE = {
  width: 40,
  height: 40,
  sizes: "40px",
};
