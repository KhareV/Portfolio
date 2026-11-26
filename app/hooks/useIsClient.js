"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * false on the server and during hydration, true afterwards and for any
 * component that mounts client-side later. Lets time-of-day markup (computed
 * from the visitor's clock) render without baking the build time into the
 * static HTML and without hydration mismatches.
 */
export default function useIsClient() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
