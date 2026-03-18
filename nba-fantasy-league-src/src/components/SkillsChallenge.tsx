import { useState, useRef, useCallback, useEffect } from 'react';
import type { Player } from '../types';
import { formatTime } from '../scoring';
import { PlayerAvatar } from './PlayerAvatar';

interface Props {
  player: Player;
  onRecord: (timeMs: number) => void;
}

export function SkillsChallenge({ player, onRecord }: Props) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [penaltyMs, setPenaltyMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const startTimeRef = useRef(0);
  const rafRef = useRef(0);
  const accumulatedRef = useRef(0);

  const tick = useCallback(() => {
    if (!running) return;
    const now = performance.now();
    setElapsedMs(accumulatedRef.current + (now - startTimeRef.current));
    rafRef.current = requestAnimationFrame(tick);
  }, [running]);

  useEffect(() => {
    if (running) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, tick]);

  const handleStart = () => {
    if (finished) return;
    startTimeRef.current = performance.now();
    setRunning(true);
  };

  const handleStop = () => {
    if (!running) return;
    accumulatedRef.current += performance.now() - startTimeRef.current;
    setElapsedMs(accumulatedRef.current);
    setRunning(false);
    setFinished(true);
  };

  const handleReset = () => {
    cancelAnimationFrame(rafRef.current);
    setRunning(false);
    setFinished(false);
    setElapsedMs(0);
    setPenaltyMs(0);
    accumulatedRef.current = 0;
    startTimeRef.current = 0;
  };

  const hasPenalty = penaltyMs > 0;

  const togglePenalty = () => {
    setPenaltyMs(prev => (prev > 0 ? 0 : 3000));
  };

  const totalMs = elapsedMs + penaltyMs;

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

      {/* Timer display */}
      <div className="text-center">
        <div
          className={`timer-display text-6xl sm:text-7xl font-black ${
            running ? 'text-nba-green animate-timer-pulse' : finished ? 'text-nba-gold' : 'text-white'
          }`}
        >
          {formatTime(totalMs)}
        </div>
        {penaltyMs > 0 && (
          <p className="text-nba-red text-sm mt-2 font-semibold">
            +{penaltyMs / 1000}s penalty applied
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 justify-center">
        {!running && !finished && (
          <button
            onClick={handleStart}
            className="px-8 py-4 bg-nba-green text-black rounded-xl font-black text-lg uppercase hover:bg-green-400 transition-colors min-h-[44px]"
          >
            Start
          </button>
        )}
        {running && (
          <button
            onClick={handleStop}
            className="px-8 py-4 bg-nba-red rounded-xl font-black text-lg uppercase hover:bg-red-700 transition-colors min-h-[44px]"
          >
            Stop
          </button>
        )}
        <button
          onClick={handleReset}
          className="px-6 py-4 bg-nba-card-light rounded-xl font-semibold hover:bg-white/10 transition-colors min-h-[44px]"
        >
          Reset
        </button>
        <button
          onClick={togglePenalty}
          className={`px-6 py-4 rounded-xl font-semibold transition-colors min-h-[44px] ${
            hasPenalty
              ? 'bg-nba-green/20 border border-nba-green/40 text-nba-green hover:bg-nba-green/30'
              : 'bg-nba-red/20 border border-nba-red/40 text-nba-red hover:bg-nba-red/30'
          }`}
        >
          {hasPenalty ? 'Remove 3s Penalty' : '+3s Penalty'}
        </button>
      </div>

      {/* Info */}
      <div className="bg-nba-dark/50 rounded-xl p-3 text-center">
        <p className="text-xs text-gray-400">
          Time stops immediately when a free-throw is made. +3s penalty if all 3 are missed.
        </p>
      </div>

      {/* Record */}
      {finished && (
        <button
          onClick={() => onRecord(totalMs)}
          className="w-full py-4 bg-gradient-to-r from-nba-gold to-yellow-500 text-black rounded-2xl font-black text-lg uppercase hover:shadow-lg hover:shadow-nba-gold/30 transition-all min-h-[44px]"
        >
          Record Time: {formatTime(totalMs)}
        </button>
      )}
    </div>
  );
}
