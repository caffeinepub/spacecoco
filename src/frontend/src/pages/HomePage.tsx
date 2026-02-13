import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Gamepad2, Users, Zap, Trophy, Sparkles } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20">
        <div className="absolute inset-0 bg-[url('/assets/generated/spacecoco-hero.dim_1600x600.png')] bg-cover bg-center opacity-30" />
        <div className="container-custom py-16 md:py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-black tracking-tight">
                <span className="block text-accent animate-pulse-glow">SPACECOCO</span>
                <span className="block text-foreground text-3xl md:text-4xl mt-2">Multiplayer Space Snake</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Battle up to 8 players across alien planets. Collect flying cows, shoot lasers, defeat penguin bosses, and face the legendary Supreme Cow!
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold" onClick={() => navigate({ to: '/lobby' })}>
                  <Gamepad2 className="mr-2 h-5 w-5" />
                  Start Playing
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate({ to: '/leaderboard' })}>
                  <Trophy className="mr-2 h-5 w-5" />
                  Leaderboard
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src="/assets/generated/spacecoco-hero.dim_1600x600.png"
                alt="Spacecoco Game"
                className="w-full h-auto rounded-2xl shadow-neon border-2 border-accent/50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container-custom">
        <h2 className="text-3xl font-display font-bold text-center mb-12">Game Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-primary/30 bg-card/50 backdrop-blur">
            <CardContent className="pt-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Multiplayer Mayhem</h3>
              <p className="text-muted-foreground">
                Battle up to 8 players in real-time. Create lobbies, share codes, and dominate the arena!
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-card/50 backdrop-blur">
            <CardContent className="pt-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Alien Planets</h3>
              <p className="text-muted-foreground">
                Mars craters slow you down, Titan fog hides enemies, Europa ice makes you slip. Adapt or perish!
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-card/50 backdrop-blur">
            <CardContent className="pt-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Epic Boss Fights</h3>
              <p className="text-muted-foreground">
                Face penguin bosses every 5 levels. Reach 1000 points to unlock the Supreme Cow encounter!
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How to Play */}
      <section className="container-custom">
        <Card className="border-accent/30 bg-gradient-to-br from-primary/10 to-accent/10">
          <CardContent className="pt-8 pb-8">
            <h2 className="text-3xl font-display font-bold text-center mb-8">How to Play</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-accent">Controls</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>Desktop:</strong> Arrow keys or WASD</li>
                  <li>• <strong>Mobile:</strong> Swipe to change direction</li>
                  <li>• <strong>Mouse:</strong> Follow cursor (optional)</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-accent">Gameplay</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Eat flying cows to shoot colored lasers</li>
                  <li>• Circle penguin bosses 3 times to win</li>
                  <li>• Survive planet hazards and gravity shifts</li>
                  <li>• Reach 1000 points for Supreme Cow!</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <section className="container-custom text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-4xl font-display font-bold">Ready to Dominate?</h2>
          <p className="text-lg text-muted-foreground">
            Choose your snake skin, master the planets, and climb the leaderboard!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold" onClick={() => navigate({ to: '/lobby' })}>
              Enter Lobby
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate({ to: '/skins' })}>
              View Skins
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
