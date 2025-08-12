export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "exploration" | "social" | "distance" | "frequency";
  requirement: number;
  currentProgress: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  points: number;
}

export interface UserStats {
  cafesVisited: number;
  routesCompleted: number;
  totalDistance: number;
  favoriteNeighborhood: string;
  streakDays: number;
  totalPoints: number;
  level: number;
}
