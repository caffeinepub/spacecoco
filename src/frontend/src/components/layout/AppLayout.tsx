import { Outlet, useRouterState } from '@tanstack/react-router';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';
import { NeonBackgroundLayer } from '../background/NeonBackgroundLayer';

export function AppLayout() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  
  const isCanvasRoute = pathname === '/canvas';
  const isHomePage = pathname === '/';

  // Full-screen canvas route without header/footer
  if (isCanvasRoute) {
    return (
      <div className="min-h-screen w-full">
        <Outlet />
      </div>
    );
  }

  // Homepage without global 3D background (uses its own static background + hero overlay)
  if (isHomePage) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <AppFooter />
      </div>
    );
  }

  // All other routes with global 3D background
  return (
    <NeonBackgroundLayer>
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <AppFooter />
      </div>
    </NeonBackgroundLayer>
  );
}
