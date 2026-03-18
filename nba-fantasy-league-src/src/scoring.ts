import type { AppState } from './types';

interface RankEntry {
  playerId: string;
  value: number;
}

function rankEntries(entries: RankEntry[], ascending: boolean): Map<string, number> {
  const sorted = [...entries].sort((a, b) =>
    ascending ? a.value - b.value : b.value - a.value
  );

  const n = entries.length;
  const rankPoints = generatePointScale(n);
  const result = new Map<string, number>();

  let i = 0;
  while (i < sorted.length) {
    let j = i;
    // Find tie group
    while (j < sorted.length && sorted[j].value === sorted[i].value) {
      j++;
    }
    // Average the rank points for tied positions
    let totalPoints = 0;
    for (let k = i; k < j; k++) {
      totalPoints += rankPoints[k];
    }
    const avgPoints = totalPoints / (j - i);
    for (let k = i; k < j; k++) {
      result.set(sorted[k].playerId, avgPoints);
    }
    i = j;
  }

  return result;
}

function generatePointScale(n: number): number[] {
  if (n === 1) return [10];
  if (n === 2) return [10, 1];
  const points: number[] = [];
  for (let i = 0; i < n; i++) {
    points.push(Math.round(10 - ((10 - 1) * i) / (n - 1)));
  }
  // Ensure first is 10 and last is 1
  points[0] = 10;
  points[n - 1] = 1;
  return points;
}

export function getSkillsRankPoints(state: AppState): Map<string, number> {
  const entries: RankEntry[] = state.skillsScores.map(s => ({
    playerId: s.playerId,
    value: s.timeMs,
  }));
  return entries.length > 0 ? rankEntries(entries, true) : new Map();
}

export function getThreePointRankPoints(state: AppState): Map<string, number> {
  const entries: RankEntry[] = state.threePointScores.map(s => ({
    playerId: s.playerId,
    value: s.totalPoints,
  }));
  return entries.length > 0 ? rankEntries(entries, false) : new Map();
}

export function getFreeThrowRankPoints(state: AppState): Map<string, number> {
  const entries: RankEntry[] = state.freeThrowScores.map(s => ({
    playerId: s.playerId,
    value: s.totalMade,
  }));
  return entries.length > 0 ? rankEntries(entries, false) : new Map();
}

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  teamName: string;
  photo: string;
  totalRankPoints: number;
  challengePoints: [number, number, number]; // rank points per challenge
  challengeScores: [string, string, string]; // display values per challenge
}

export function getOverallLeaderboard(state: AppState): LeaderboardEntry[] {
  const skillsRank = getSkillsRankPoints(state);
  const threeRank = getThreePointRankPoints(state);
  const freeRank = getFreeThrowRankPoints(state);

  const skillsScoreMap = new Map(state.skillsScores.map(s => [s.playerId, s.timeMs]));
  const threeScoreMap = new Map(state.threePointScores.map(s => [s.playerId, s.totalPoints]));
  const freeScoreMap = new Map(state.freeThrowScores.map(s => [s.playerId, s.totalMade]));

  const entries: LeaderboardEntry[] = state.players.map(p => {
    const s1 = skillsRank.get(p.id) ?? 0;
    const s2 = threeRank.get(p.id) ?? 0;
    const s3 = freeRank.get(p.id) ?? 0;

    const skillsTime = skillsScoreMap.get(p.id);
    const threePoints = threeScoreMap.get(p.id);
    const freeMade = freeScoreMap.get(p.id);

    return {
      playerId: p.id,
      playerName: p.name,
      teamName: p.teamName,
      photo: p.photo,
      totalRankPoints: s1 + s2 + s3,
      challengePoints: [s1, s2, s3],
      challengeScores: [
        skillsTime != null ? formatTime(skillsTime) : '-',
        threePoints != null ? `${threePoints} pts` : '-',
        freeMade != null ? `${freeMade}/10` : '-',
      ],
    };
  });

  entries.sort((a, b) => b.totalRankPoints - a.totalRankPoints);
  return entries;
}

export function formatTime(ms: number): string {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const centiseconds = Math.floor((ms % 1000) / 10);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
}

export function getChallengeLeaderboard(
  state: AppState,
  challengeIndex: number
): { playerId: string; rank: number; displayValue: string; rankPoints: number }[] {
  let entries: { playerId: string; value: number; displayValue: string }[] = [];

  if (challengeIndex === 0) {
    entries = state.skillsScores.map(s => ({
      playerId: s.playerId,
      value: s.timeMs,
      displayValue: formatTime(s.timeMs),
    }));
    entries.sort((a, b) => a.value - b.value);
  } else if (challengeIndex === 1) {
    entries = state.threePointScores.map(s => ({
      playerId: s.playerId,
      value: s.totalPoints,
      displayValue: `${s.totalPoints} pts`,
    }));
    entries.sort((a, b) => b.value - a.value);
  } else {
    entries = state.freeThrowScores.map(s => ({
      playerId: s.playerId,
      value: s.totalMade,
      displayValue: `${s.totalMade}/10`,
    }));
    entries.sort((a, b) => b.value - a.value);
  }

  const rankPointsMap =
    challengeIndex === 0
      ? getSkillsRankPoints(state)
      : challengeIndex === 1
        ? getThreePointRankPoints(state)
        : getFreeThrowRankPoints(state);

  let rank = 1;
  return entries.map((e, i) => {
    if (i > 0 && e.value !== entries[i - 1].value) {
      rank = i + 1;
    }
    return {
      playerId: e.playerId,
      rank,
      displayValue: e.displayValue,
      rankPoints: rankPointsMap.get(e.playerId) ?? 0,
    };
  });
}
