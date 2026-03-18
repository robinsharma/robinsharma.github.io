import type { AppState } from '../types';
import { CHALLENGES } from '../types';
import { getChallengeLeaderboard } from '../scoring';
import { PlayerAvatar } from './PlayerAvatar';

interface Props {
  state: AppState;
  challengeIndex: number;
  onNext: () => void;
  isLastChallenge: boolean;
}

export function ChallengeLeaderboardView({ state, challengeIndex, onNext, isLastChallenge }: Props) {
  const challenge = CHALLENGES[challengeIndex];
  const leaderboard = getChallengeLeaderboard(state, challengeIndex);
  const playersMap = new Map(state.players.map(p => [p.id, p]));

  return (
    <div className="space-y-6 animate-slide-up max-w-lg mx-auto">
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest text-nba-gold mb-1">Challenge Complete</p>
        <h2 className="text-2xl font-black uppercase">{challenge.name}</h2>
        <p className="text-sm text-gray-400">{challenge.subtitle}</p>
      </div>

      <div className="space-y-2">
        {leaderboard.map((entry) => {
          const player = playersMap.get(entry.playerId)!;
          return (
            <div
              key={entry.playerId}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 animate-rank-change ${
                entry.rank === 1
                  ? 'bg-nba-gold/10 border border-nba-gold/30'
                  : entry.rank === 2
                    ? 'bg-gray-400/5 border border-gray-400/20'
                    : entry.rank === 3
                      ? 'bg-orange-700/10 border border-orange-700/30'
                      : 'bg-nba-card border border-nba-card-light'
              }`}
            >
              <div className="w-8 text-center font-black text-lg shrink-0">
                {entry.rank === 1 ? '👑' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
              </div>
              <PlayerAvatar photo={player.photo} name={player.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{player.name}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-black text-lg">{entry.displayValue}</p>
                <p className="text-[10px] text-gray-500">
                  +{entry.rankPoints.toFixed(1).replace(/\.0$/, '')} rank pts
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onNext}
        className="w-full py-4 bg-gradient-to-r from-nba-blue to-nba-accent text-white rounded-2xl font-black text-lg uppercase hover:shadow-lg transition-all min-h-[44px]"
      >
        {isLastChallenge ? 'View Final Results 🏆' : 'Next Challenge →'}
      </button>
    </div>
  );
}
