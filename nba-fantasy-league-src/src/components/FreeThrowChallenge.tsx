import { useState } from 'react';
import type { Player } from '../types';
import { PlayerAvatar } from './PlayerAvatar';

interface Props {
  player: Player;
  onRecord: (shots: boolean[], totalMade: number) => void;
}

export function FreeThrowChallenge({ player, onRecord }: Props) {
  const [shots, setShots] = useState<boolean[]>(new Array(10).fill(false));

  const totalMade = shots.filter(Boolean).length;

  const toggleShot = (idx: number) => {
    setShots(prev => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Player info */}
      <div className="flex flex-col items-center gap-3">
        <PlayerAvatar photo={player.photo} name={player.name} size="xl" />
        <div className="text-center">
          <h3 className="text-2xl font-black">{player.name}</h3>
          <p className="text-sm text-gray-400">{player.teamName}</p>
        </div>
      </div>

      {/* Score */}
      <div className="text-center">
        <p className="text-6xl sm:text-7xl font-black text-nba-gold timer-display">
          {totalMade}<span className="text-3xl text-gray-500">/10</span>
        </p>
      </div>

      {/* Shot grid */}
      <div className="flex flex-wrap gap-3 justify-center">
        {shots.map((made, i) => (
          <button
            key={i}
            onClick={() => toggleShot(i)}
            className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-lg font-bold transition-all active:scale-90 min-h-[44px] min-w-[44px] ${
              made
                ? 'bg-nba-green border-nba-green text-black'
                : 'bg-transparent border-gray-600 text-gray-500'
            }`}
          >
            {made ? '🏀' : i + 1}
          </button>
        ))}
      </div>

      {/* Record */}
      <button
        onClick={() => onRecord(shots, totalMade)}
        className="w-full py-4 bg-gradient-to-r from-nba-gold to-yellow-500 text-black rounded-2xl font-black text-lg uppercase hover:shadow-lg hover:shadow-nba-gold/30 transition-all min-h-[44px]"
      >
        Record Score: {totalMade}/10
      </button>
    </div>
  );
}
