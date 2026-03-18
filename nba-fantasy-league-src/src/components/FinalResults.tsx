import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { AppState } from '../types';
import { CHALLENGES } from '../types';
import { getOverallLeaderboard } from '../scoring';
import { PlayerAvatar } from './PlayerAvatar';

interface Props {
  state: AppState;
}

export function FinalResults({ state }: Props) {
  const confettiFired = useRef(false);

  useEffect(() => {
    if (confettiFired.current) return;
    confettiFired.current = true;

    const duration = 4000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#fdb927', '#c8102e', '#1d428a', '#22c55e'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#fdb927', '#c8102e', '#1d428a', '#22c55e'],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  const entries = getOverallLeaderboard(state);

  let currentRank = 1;
  const ranked = entries.map((e, i) => {
    if (i > 0 && e.totalRankPoints !== entries[i - 1].totalRankPoints) {
      currentRank = i + 1;
    }
    return { ...e, rank: currentRank };
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-16 space-y-6">
      {/* Title */}
      <div className="text-center animate-slide-up">
        <div className="text-5xl mb-2 animate-trophy">🏆</div>
        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
          Final <span className="text-nba-gold">Results</span>
        </h2>
        <p className="text-gray-400 text-sm mt-1">NBA Fantasy League Skills Challenge</p>
      </div>

      {/* Top 3 podium */}
      {ranked.length >= 3 && (
        <div className="flex items-end justify-center gap-3 pt-4 animate-slide-up">
          {/* 2nd place */}
          <PodiumCard entry={ranked.find(r => r.rank === 2)!} height="h-32" medal="🥈" />
          {/* 1st place */}
          <PodiumCard entry={ranked.find(r => r.rank === 1)!} height="h-44" medal="👑" isWinner />
          {/* 3rd place */}
          <PodiumCard entry={ranked.find(r => r.rank === 3)!} height="h-24" medal="🥉" />
        </div>
      )}

      {/* Full leaderboard table */}
      <div className="bg-nba-card border border-nba-card-light rounded-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="grid grid-cols-[3rem_1fr_repeat(3,4rem)_4rem] gap-2 px-4 py-3 bg-nba-dark/60 text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
          <div>#</div>
          <div>Player</div>
          {CHALLENGES.map(c => (
            <div key={c.id} className="text-center">{c.id === 'skills' ? 'SKL' : c.id === 'threePoint' ? '3PT' : 'FT'}</div>
          ))}
          <div className="text-right">Total</div>
        </div>

        {/* Rows */}
        {ranked.map((entry, i) => (
          <div
            key={entry.playerId}
            className={`grid grid-cols-[3rem_1fr_repeat(3,4rem)_4rem] gap-2 items-center px-4 py-3 border-t border-nba-card-light animate-slide-in ${
              entry.rank <= 3 ? 'bg-nba-gold/5' : ''
            }`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="font-black">
              {entry.rank === 1 ? '👑' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <PlayerAvatar photo={entry.photo} name={entry.playerName} size="sm" />
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{entry.playerName}</p>
                <p className="text-[10px] text-gray-500 truncate">{entry.teamName}</p>
              </div>
            </div>
            {entry.challengeScores.map((score, ci) => (
              <div key={ci} className="text-center text-xs text-gray-400">
                <div>{score}</div>
                <div className="text-[9px] text-nba-gold">
                  +{entry.challengePoints[ci].toFixed(1).replace(/\.0$/, '')}
                </div>
              </div>
            ))}
            <div className="text-right font-black text-nba-gold text-lg">
              {entry.totalRankPoints.toFixed(1).replace(/\.0$/, '')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PodiumCard({
  entry,
  height,
  medal,
  isWinner,
}: {
  entry: { playerName: string; teamName: string; photo: string; totalRankPoints: number; rank: number };
  height: string;
  medal: string;
  isWinner?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-2">
        <PlayerAvatar
          photo={entry.photo}
          name={entry.playerName}
          size={isWinner ? 'lg' : 'md'}
        />
        {isWinner && (
          <div className="absolute -top-3 -right-1 text-2xl animate-trophy">👑</div>
        )}
      </div>
      <p className={`font-bold text-sm text-center ${isWinner ? 'text-nba-gold' : ''}`}>
        {entry.playerName}
      </p>
      <div
        className={`${height} w-24 sm:w-28 rounded-t-xl flex flex-col items-center justify-start pt-3 mt-2 ${
          isWinner
            ? 'bg-gradient-to-t from-nba-gold/30 to-nba-gold/10 border border-nba-gold/30 animate-pulse-glow'
            : 'bg-gradient-to-t from-nba-card-light to-nba-card border border-nba-card-light'
        }`}
      >
        <span className="text-2xl">{medal}</span>
        <span className="font-black text-lg text-nba-gold mt-1">
          {entry.totalRankPoints.toFixed(1).replace(/\.0$/, '')}
        </span>
        <span className="text-[10px] text-gray-500">pts</span>
      </div>
    </div>
  );
}
