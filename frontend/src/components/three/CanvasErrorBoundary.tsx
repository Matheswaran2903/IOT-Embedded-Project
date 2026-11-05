import { Component, type ReactNode } from 'react';

let cached: boolean | null = null;

/** Checks WebGL support once. The probe context is released right away so repeated renders never leak contexts. */
export const webglSupported = () => {
  if (cached !== null) return cached;
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | WebGL2RenderingContext | null;
    cached = !!(window.WebGLRenderingContext && gl);
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    cached = false;
  }
  return cached;
};

interface Props { children: ReactNode; onError?: () => void }

export default class CanvasErrorBoundary extends Component<Props, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(e: Error) { return { error: e.message }; }
  componentDidCatch() { this.props.onError?.(); }
  componentDidMount() { if (!webglSupported()) this.props.onError?.(); }
  render() {
    if (this.state.error || !webglSupported()) {
      return (
        <div className="flex h-full items-center justify-center p-6 text-center">
          <div className="glass max-w-md p-6">
            <h3 className="mb-2 text-lg font-bold">3D view could not start</h3>
            <p className="text-sm text-slate-300">Your browser or device could not start WebGL. Try Chrome or Edge, turn on hardware acceleration, and reload the page.</p>
            {this.state.error && <p className="mt-2 text-xs text-slate-500">{this.state.error}</p>}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
