import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Gamepad2, Users, Zap, Trophy, Sparkles } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[500px]">
        <div className="container-custom py-16 md:py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 backdrop-blur-sm bg-black/30 p-8 rounded-2xl border border-accent/30">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-black tracking-tight">
                <span className="block text-accent animate-pulse-glow neon-text-glow">MOTOR SNAKE 3D</span>
                <span className="block text-foreground text-3xl md:text-4xl mt-2">Quantum Physics Chaos</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Navigate a hollow sphere with fluctuating gravity, wind portals, acid rain, and anomalies. Survive the ghost that hunts you!
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold neon-button" onClick={() => navigate({ to: '/lobby' })}>
                  <Gamepad2 className="mr-2 h-5 w-5" />
                  Start Playing
                </Button>
                <Button size="lg" variant="outline" className="neon-button-outline" onClick={() => navigate({ to: '/leaderboard' })}>
                  <Trophy className="mr-2 h-5 w-5" />
                  Leaderboard
                </Button>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <img
                src="/assets/generated/spacecoco-hero-neon-cartoon.dim_1600x600.png"
                alt="Motor Snake 3D"
                className="w-full h-auto rounded-2xl shadow-neon-strong border-2 border-accent/50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container-custom">
        <h2 className="text-3xl font-display font-bold text-center mb-12 neon-text-glow">Extreme Mechanics</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-primary/30 bg-card/50 backdrop-blur neon-card">
            <CardContent className="pt-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center neon-icon-glow">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Quantum Physics</h3>
              <p className="text-muted-foreground">
                Gravity fluctuates every 5 seconds. Wind portals blast you. Acid rain melts your tail. Fog distorts reality.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-card/50 backdrop-blur neon-card">
            <CardContent className="pt-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center neon-icon-glow">
                <Sparkles className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Anomaly Power-Ups</h3>
              <p className="text-muted-foreground">
                Black holes suction enemies but risk self-destruction. Shooting stars phase through walls but melt fast. Mirrors make you intangible but reverse controls.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-card/50 backdrop-blur neon-card">
            <CardContent className="pt-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center neon-icon-glow">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Multiplayer Chaos</h3>
              <p className="text-muted-foreground">
                Up to 10 players. Collide with enemies for wild effects. The ghost follows you forever, growing stronger until it replaces you.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How to Play */}
      <section className="container-custom">
        <Card className="border-accent/30 bg-gradient-to-br from-primary/10 to-accent/10 neon-card">
          <CardContent className="pt-8 pb-8">
            <h2 className="text-3xl font-display font-bold text-center mb-8 neon-text-glow">How to Survive</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-accent">Controls</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>Desktop:</strong> Arrow keys or WASD (analog)</li>
                  <li>• <strong>Mobile:</strong> Virtual joystick</li>
                  <li>• <strong>Brake:</strong> Spacebar (tail whip)</li>
                  <li>• <strong>Shake:</strong> Shift+S (remove baby penguins)</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-accent">Mechanics</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Navigate inside/outside a hollow sphere</li>
                  <li>• Survive gravity cycles and environmental hazards</li>
                  <li>• Collect anomalies for risky power-ups</li>
                  <li>• Escape the ghost or be replaced forever</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <section className="container-custom text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-4xl font-display font-bold neon-text-glow">Ready for Chaos?</h2>
          <p className="text-lg text-muted-foreground">
            Enter the hollow sphere. Survive the apocalypse. Become the ghost.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold neon-button" onClick={() => navigate({ to: '/lobby' })}>
              Enter Lobby
            </Button>
            <Button size="lg" variant="outline" className="neon-button-outline" onClick={() => navigate({ to: '/skins' })}>
              View Skins
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
