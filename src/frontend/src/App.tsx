import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { AppLayout } from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import LobbyPage from './pages/LobbyPage';
import PlayPage from './pages/PlayPage';
import SkinsPage from './pages/SkinsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import { ProfileSetupDialog } from './components/profile/ProfileSetupDialog';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

const rootRoute = createRootRoute({
  component: AppLayout
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage
});

const lobbyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lobby',
  component: LobbyPage
});

const playRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/play',
  component: PlayPage
});

const skinsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/skins',
  component: SkinsPage
});

const leaderboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/leaderboard',
  component: LeaderboardPage
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  lobbyRoute,
  playRoute,
  skinsRoute,
  leaderboardRoute
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <RouterProvider router={router} />
      <ProfileSetupDialog />
      <Toaster />
    </ThemeProvider>
  );
}
