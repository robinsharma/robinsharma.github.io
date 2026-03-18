import type { AppState } from '../types';
import { getOverallLeaderboard } from '../scoring';
import type { LeaderboardEntry } from '../scoring';
import { PlayerAvatar } from './PlayerAvatar';

interface Props {
  state: AppState;
  compact?: boolean;
}

function getRankIcon(rank: number): string {
  if (rank === 1) return '👑';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

export function Leaderboard({ state, compact = false }: Props) {
  const entries = getOverallLeaderboard(state);

  if (entries.length === 0) return null;

  // Assign ranks (handle ties)
  let currentRank = 1;
  const ranked: (LeaderboardEntry & { rank: number })[] = entries.map((e, i) => {
    if (i > 0 && e.totalRankPoints !== entries[i - 1].totalRankPoints) {
      currentRank = i + 1;
    }
    return { ...e, rank: currentRank };
  });

  return (
    <div className={compact ? '' : 'bg-nba-card border border-nba-card-light rounded-2xl p-4'}>
      {!compact && (
        <h3 className="text-sm font-bold uppercase tracking-wider text-nba-gold mb-3 flex items-center gap-2">
          <span>🏆</span> Overall Standings
        </h3>
      )}
      <div className="space-y-1.5">
        {ranked.map((entry) => (
          <div
            key={entry.playerId}
            className="leaderboard-row flex items-center gap-2 bg-nba-dark/50 rounded-xl px-3 py-2"
          >
            <div className="w-8 text-center text-sm font-bold shrink-0">
              {entry.rank <= 3 ? (
                <span className={entry.rank === 1 ? 'text-lg' : 'text-sm'}>
                  {getRankIcon(entry.rank)}
                </span>
              ) : (
                <span className="text-gray-500">{entry.rank}</span>
              )}
            </div>
            <PlayerAvatar photo={entry.photo} name={entry.playerName} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{entry.playerName}</p>
              {!compact && (
                <p className="text-[10px] text-gray-500 truncate">{entry.teamName}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-black text-nba-gold">
                {entry.totalRankPoints.toFixed(1).replace(/\.0$/, '')}
              </p>
              {!compact && (
                <p className="text-[10px] text-gray-500">pts</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
