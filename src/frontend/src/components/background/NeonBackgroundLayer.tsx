import React, { Suspense, lazy } from 'react';

const NeonSpaceBackground3D = lazy(() => import('./NeonSpaceBackground3D').then(module => ({ default: module.NeonSpaceBackground3D })));

function WebGLFallback() {
  return (
    <div className="fixed inset-0 -z-10 static-fallback-bg" />
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('3D Background Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function NeonBackgroundLayer({ children }: { children: React.ReactNode }) {
  // Check WebGL support
  const hasWebGL = (() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (e) {
      return false;
    }
  })();

  return (
    <>
      {hasWebGL ? (
        <ErrorBoundary fallback={<WebGLFallback />}>
          <Suspense fallback={<WebGLFallback />}>
            <div className="fixed inset-0 -z-10">
              <NeonSpaceBackground3D />
            </div>
          </Suspense>
        </ErrorBoundary>
      ) : (
        <WebGLFallback />
      )}
      
      {/* Readability overlay */}
      <div className="fixed inset-0 -z-10 bg-black/40 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-0">
        {children}
      </div>
    </>
  );
}
