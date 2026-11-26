"use client";

import { Component } from "react";

// Isolates an optional renderer (WebGL scene, globe, shader). Any error thrown
// while rendering it, while loading its assets (Suspense loaders reject into
// here), or reported by the scene via `onFail` replaces only that island with
// `fallback`. Headings, navigation, project controls and contact are outside
// every boundary, so they survive whatever happens inside.
export default class SceneBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false, reason: null };
  }

  static getDerivedStateFromError(error) {
    return { failed: true, reason: String(error?.message || error).slice(0, 200) };
  }

  componentDidCatch(error) {
    // Optional asset failures are expected in the field; keep them quiet but traceable.
    console.warn(`[scene:${this.props.name}] disabled:`, error?.message || error);
    this.props.onFail?.(error);
  }

  componentDidUpdate(prevProps) {
    // A new resetKey (e.g. a different project) gets one fresh attempt.
    if (this.state.failed && prevProps.resetKey !== this.props.resetKey && this.props.retryOnReset) {
      this.setState({ failed: false, reason: null });
    }
  }

  render() {
    if (this.state.failed) {
      return (
        <div data-scene-failed={this.props.name} data-reason={this.state.reason} className="contents">
          {this.props.fallback ?? null}
        </div>
      );
    }
    return this.props.children;
  }
}

// Wire WebGL context loss to a callback (R3F onCreated / raw canvases).
export function watchContextLoss(canvas, onLost) {
  if (!canvas) return () => {};
  const handler = (event) => {
    event.preventDefault?.();
    onLost?.(event);
  };
  canvas.addEventListener("webglcontextlost", handler, false);
  return () => canvas.removeEventListener("webglcontextlost", handler, false);
}
