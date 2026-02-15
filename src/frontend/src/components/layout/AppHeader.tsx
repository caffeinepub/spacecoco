import { Link, useNavigate } from '@tanstack/react-router';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { LoginButton } from '../auth/LoginButton';
import { Button } from '@/components/ui/button';
import { Menu, Gamepad2, Trophy, Palette, Zap } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function AppHeader() {
  const { isAuthenticated } = useCurrentUser();
  const navigate = useNavigate();

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <Link
        to="/lobby"
        className={`${mobile ? 'block py-2' : ''} text-foreground hover:text-accent transition-colors font-medium`}
      >
        <span className="flex items-center gap-2">
          <Gamepad2 className="h-4 w-4" />
          Play
        </span>
      </Link>
      <Link
        to="/canvas"
        className={`${mobile ? 'block py-2' : ''} text-foreground hover:text-accent transition-colors font-medium`}
      >
        <span className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Canvas
        </span>
      </Link>
      <Link
        to="/skins"
        className={`${mobile ? 'block py-2' : ''} text-foreground hover:text-accent transition-colors font-medium`}
      >
        <span className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Skins
        </span>
      </Link>
      <Link
        to="/leaderboard"
        className={`${mobile ? 'block py-2' : ''} text-foreground hover:text-accent transition-colors font-medium`}
      >
        <span className="flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          Leaderboard
        </span>
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="/assets/generated/spacecoco-logo.dim_512x512.png"
              alt="Spacecoco"
              className="h-10 w-10 object-contain"
            />
            <span className="font-display text-xl font-bold text-accent hidden sm:inline tracking-wider">
              SPACECOCO
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavLinks />
            <LoginButton />
          </nav>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center space-x-2">
            <LoginButton />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 mt-8">
                  <NavLinks mobile />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
