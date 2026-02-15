import { Outlet, useRouterState } from '@tanstack/react-router';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';
import { NeonBackgroundLayer } from '../background/NeonBackgroundLayer';

export function AppLayout() {
  const routerState = useRouterState();
  const isCanvasRoute = routerState.location.pathname === '/canvas';

  if (isCanvasRoute) {
    return (
      <div className="min-h-screen w-full">
        <Outlet />
      </div>
    );
  }

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
