export interface Player {
  id: string;
  name: string;
  teamName: string;
  photo: string; // base64
}

export interface SkillsChallengeScore {
  playerId: string;
  timeMs: number; // final time in milliseconds including penalties
}

export interface ThreePointScore {
  playerId: string;
  racks: boolean[][]; // 6 racks, varying balls per rack
  totalPoints: number;
}

export interface FreeThrowScore {
  playerId: string;
  shots: boolean[]; // 10 shots
  totalMade: number;
}

export type ChallengeType = 'skills' | 'threePoint' | 'freeThrow';

export interface AppState {
  screen: 'registration' | 'challenges' | 'results';
  players: Player[];
  playerOrder: string[]; // randomized player IDs
  currentChallengeIndex: number; // 0, 1, 2
  currentPlayerIndex: number; // index within playerOrder
  skillsScores: SkillsChallengeScore[];
  threePointScores: ThreePointScore[];
  freeThrowScores: FreeThrowScore[];
  challengeComplete: boolean; // true when all players finished current challenge
}

export const CHALLENGES = [
  {
    id: 'skills' as ChallengeType,
    name: 'Skills Challenge',
    subtitle: 'Timed Obstacle Course',
    description: 'Complete the obstacle course: Flip 5 cups, Bounce 5 balls into a cup, Take up to 3 free-throw shots',
  },
  {
    id: 'threePoint' as ChallengeType,
    name: 'Three-Point Contest',
    subtitle: 'Shooting from Downtown',
    description: 'Shoot from 5 racks around the three-point line. Make as many as you can in 2 minutes!',
  },
  {
    id: 'freeThrow' as ChallengeType,
    name: '10-Shot Free-Throw',
    subtitle: 'Free-Throw Challenge',
    description: 'Take 10 shots from the free-throw line. Each make is worth 1 point.',
  },
] as const;

export const STORAGE_KEY = 'nba-skills-challenge-state';
