"use client";

import React from "react";

/**
 * Error boundary for one scene/widget. A failed asset (HDR, GLB, FBX, shader,
 * network) inside a <Canvas> is re-thrown by React Three Fiber into the React
 * tree; without a boundary it unmounts the whole page. The fallback is only
 * rendered on a real failure; the healthy path renders children untouched.
 */
class SceneBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, attempt: 0 };
    this.retry = this.retry.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error(`[${this.props.name || "scene"}] failed to render:`, error);
  }

  retry() {
    this.setState((s) => ({ error: null, attempt: s.attempt + 1 }));
  }

  render() {
    if (this.state.error) {
      const { fallback } = this.props;
      if (typeof fallback === "function") return fallback({ retry: this.retry });
      return fallback ?? null;
    }
    return (
      <React.Fragment key={this.state.attempt}>{this.props.children}</React.Fragment>
    );
  }
}

export default SceneBoundary;
