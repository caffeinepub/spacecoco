import { Outlet } from '@tanstack/react-router';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';
import { NeonBackgroundLayer } from '../background/NeonBackgroundLayer';

export function AppLayout() {
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
