import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Check } from 'lucide-react';
import { SNAKE_SKINS } from '@/game/skins/catalog';

export default function SkinsPage() {
  // TODO: Implement skin ownership and selection with backend
  const ownedSkins = [0]; // Default skin owned
  const activeSkin = 0;

  return (
    <div className="container-custom py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-accent">Snake Skins</h1>
          <p className="text-lg text-muted-foreground">
            Customize your snake with unique skins inspired by real serpents
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SNAKE_SKINS.map((skin, index) => {
            const isOwned = ownedSkins.includes(index);
            const isActive = activeSkin === index;

            return (
              <Card key={skin.id} className={`border-2 ${isActive ? 'border-accent' : 'border-primary/30'} relative overflow-hidden`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{skin.name}</CardTitle>
                      <CardDescription className="text-sm mt-1">{skin.description}</CardDescription>
                    </div>
                    {isActive && (
                      <Badge className="bg-accent text-accent-foreground">
                        <Check className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    <div 
                      className="w-full h-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url(/assets/generated/snake-skins-set.dim_1024x1024.png)`,
                        backgroundPosition: `${(index % 5) * 20}% ${Math.floor(index / 5) * 50}%`,
                        backgroundSize: '500% 200%'
                      }}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    {isOwned ? (
                      <Button 
                        className="flex-1"
                        variant={isActive ? 'outline' : 'default'}
                        disabled={isActive}
                      >
                        {isActive ? 'Equipped' : 'Equip'}
                      </Button>
                    ) : (
                      <Button className="flex-1" variant="outline" disabled>
                        <Lock className="h-4 w-4 mr-2" />
                        Unlock (Coming Soon)
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-accent/30 bg-gradient-to-br from-primary/10 to-accent/10">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Unlock More Skins</h3>
              <p className="text-muted-foreground">
                Skin purchasing with ICP wallet integration coming soon!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
