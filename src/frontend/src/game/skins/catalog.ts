export interface SnakeSkin {
  id: number;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
  };
}

export const SNAKE_SKINS: SnakeSkin[] = [
  {
    id: 0,
    name: 'Reticulated Python',
    description: 'The longest snake in the world',
    colors: { primary: '#8B7355', secondary: '#D4A574' }
  },
  {
    id: 1,
    name: 'King Cobra',
    description: 'The world\'s longest venomous snake',
    colors: { primary: '#2C2416', secondary: '#F4E4C1' }
  },
  {
    id: 2,
    name: 'Black Mamba',
    description: 'Africa\'s deadliest snake',
    colors: { primary: '#1A1A1A', secondary: '#4A4A4A' }
  },
  {
    id: 3,
    name: 'Anaconda',
    description: 'The heaviest snake species',
    colors: { primary: '#3D5C3B', secondary: '#7A9D54' }
  },
  {
    id: 4,
    name: 'Rattlesnake',
    description: 'Iconic desert predator',
    colors: { primary: '#C4A57B', secondary: '#8B6F47' }
  },
  {
    id: 5,
    name: 'Krait',
    description: 'Highly venomous Asian snake',
    colors: { primary: '#000000', secondary: '#FFFFFF' }
  },
  {
    id: 6,
    name: 'Taipan',
    description: 'Most venomous land snake',
    colors: { primary: '#8B7D6B', secondary: '#D4C5B9' }
  },
  {
    id: 7,
    name: 'Boa Constrictor',
    description: 'Powerful constrictor',
    colors: { primary: '#8B4513', secondary: '#D2691E' }
  },
  {
    id: 8,
    name: 'Gaboon Viper',
    description: 'Longest fangs of any snake',
    colors: { primary: '#6B4423', secondary: '#D4AF37' }
  },
  {
    id: 9,
    name: 'Feathered Quetzalcoatl',
    description: 'Mythical feathered serpent',
    colors: { primary: '#00CED1', secondary: '#FFD700' }
  },
];
