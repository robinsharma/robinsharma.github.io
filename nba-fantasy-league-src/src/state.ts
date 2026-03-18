import type { AppState } from './types';
import { STORAGE_KEY } from './types';

export const defaultState: AppState = {
  screen: 'registration',
  players: [],
  playerOrder: [],
  currentChallengeIndex: 0,
  currentPlayerIndex: 0,
  skillsScores: [],
  threePointScores: [],
  freeThrowScores: [],
  challengeComplete: false,
};

export function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppState;
  } catch {
    return null;
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable
  }
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
