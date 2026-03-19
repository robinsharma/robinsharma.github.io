import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { Player } from '../types';
import { PlayerAvatar } from './PlayerAvatar';

interface Props {
  player: Player;
  onRecord: (racks: boolean[][], totalPoints: number) => void;
}

const RACK_CONFIG = [
  { name: 'Left Corner', balls: 5, pointsPer: 1, color: 'bg-white', label: '' },
  { name: 'Left Wing', balls: 5, pointsPer: 1, color: 'bg-white', label: '' },
  { name: 'Deep Three', balls: 1, pointsPer: 3, color: 'bg-starry', label: '★ 3 PTS', isStar: true },
  { name: 'Top of Key', balls: 5, pointsPer: 2, color: 'bg-money', label: '2 PTS', isMoney: true },
  { name: 'Right Wing', balls: 5, pointsPer: 1, color: 'bg-white', label: '' },
  { name: 'Right Corner', balls: 5, pointsPer: 1, color: 'bg-white', label: '' },
];

const TOTAL_TIME = 120_000; // 2 minutes

export function ThreePointContest({ player, onRecord }: Props) {
  const [racks, setRacks] = useState<boolean[][]>(
    RACK_CONFIG.map(r => new Array(r.balls).fill(false))
  );
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const startRef = useRef(0);
  const rafRef = useRef(0);

  const totalPoints = racks.reduce((sum, rack, i) => {
    return sum + rack.filter(Boolean).length * RACK_CONFIG[i].pointsPer;
  }, 0);

  const tick = useCallback(() => {
    const elapsed = performance.now() - startRef.current;
    const remaining = Math.max(0, TOTAL_TIME - elapsed);
    setTimeLeft(remaining);
    if (remaining <= 0) {
      setTimerRunning(false);
      setTimerDone(true);
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (timerRunning) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [timerRunning, tick]);

  const handleStart = () => {
    startRef.current = performance.now();
    setTimerRunning(true);
  };

  const toggleShot = (rackIdx: number, ballIdx: number) => {
    if (!timerRunning && !timerDone) return;
    setRacks(prev => {
      const next = prev.map(r => [...r]);
      next[rackIdx][ballIdx] = !next[rackIdx][ballIdx];
      return next;
    });
  };

  const handleRecord = () => {
    onRecord(racks, totalPoints);
  };

  const formatCountdown = (ms: number) => {
    const totalSec = Math.ceil(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-5 animate-slide-up pb-20">
      {/* Fixed timer bar at bottom of screen — rendered via portal to escape overflow:hidden parents */}
      {(timerRunning || timerDone) && createPortal(
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-nba-dark/95 backdrop-blur-sm border-t border-nba-card-light shadow-[0_-4px_20px_rgba(0,0,0,0.5)] px-5 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase text-gray-500 tracking-wider">Time</p>
              <p
                className={`timer-display text-3xl font-black ${
                  timeLeft <= 10000 && timerRunning ? 'text-nba-red animate-timer-pulse' : 'text-white'
                }`}
              >
                {formatCountdown(timeLeft)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase text-gray-500 tracking-wider">Points</p>
              <p className="text-3xl font-black text-nba-gold">{totalPoints}</p>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Player info */}
      <div className="flex items-center gap-4">
        <PlayerAvatar photo={player.photo} name={player.name} size="lg" />
        <div>
          <h3 className="text-xl font-black">{player.name}</h3>
          <p className="text-sm text-gray-400">{player.teamName}</p>
        </div>
      </div>

      {/* Timer + Score row (inline, before timer starts) */}
      <div className="flex items-center justify-between bg-nba-dark/60 rounded-xl px-4 py-3 border border-nba-card-light">
        <div>
          <p className="text-[10px] uppercase text-gray-500 tracking-wider">Time</p>
          <p
            className={`timer-display text-3xl font-black ${
              timeLeft <= 10000 && timerRunning ? 'text-nba-red animate-timer-pulse' : 'text-white'
            }`}
          >
            {formatCountdown(timeLeft)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase text-gray-500 tracking-wider">Points</p>
          <p className="text-3xl font-black text-nba-gold">{totalPoints}</p>
        </div>
      </div>

      {/* Start button or Time's up */}
      {!timerRunning && !timerDone && (
        <button
          onClick={handleStart}
          className="w-full py-4 bg-nba-green text-black rounded-xl font-black text-lg uppercase min-h-[44px]"
        >
          Start Timer
        </button>
      )}
      {timerDone && (
        <div className="bg-nba-red/20 border border-nba-red/40 rounded-xl p-3 text-center">
          <p className="text-nba-red font-bold text-lg">Time's Up!</p>
        </div>
      )}

      {/* Court diagram with racks */}
      <div className="relative bg-nba-dark/40 rounded-2xl p-4 border border-nba-card-light">
        {/* Half-court visual */}
        <div className="relative mx-auto max-w-md">
          {/* Three-point arc (simplified) */}
          <svg viewBox="0 0 400 220" className="w-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            <path d="M 30 220 L 30 120 Q 30 20 200 20 Q 370 20 370 120 L 370 220" fill="none" stroke="white" strokeWidth="2" />
            <circle cx="200" cy="200" r="60" fill="none" stroke="white" strokeWidth="2" />
            <rect x="120" y="160" width="160" height="60" fill="none" stroke="white" strokeWidth="2" />
          </svg>

          {/* Racks positioned around the arc */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {RACK_CONFIG.map((rack, rackIdx) => (
              <div
                key={rackIdx}
                className={`rounded-xl p-3 border ${
                  rack.isStar
                    ? 'border-starry/40 bg-starry/10'
                    : rack.isMoney
                      ? 'border-money/40 bg-money/10'
                      : 'border-nba-card-light bg-nba-card/60'
                }`}
              >
                <p className="text-[10px] uppercase text-gray-400 font-semibold mb-2 text-center truncate">
                  {rack.name}
                </p>
                {rack.label && (
                  <p className={`text-[10px] font-bold mb-1 text-center ${
                    rack.isStar ? 'text-starry' : 'text-money'
                  }`}>
                    {rack.label}
                  </p>
                )}
                <div className="flex gap-1.5 justify-center flex-wrap">
                  {racks[rackIdx].map((made, ballIdx) => (
                    <button
                      key={ballIdx}
                      onClick={() => toggleShot(rackIdx, ballIdx)}
                      disabled={!timerRunning && !timerDone}
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all min-h-[44px] min-w-[44px] ${
                        made
                          ? rack.isStar
                            ? 'bg-starry border-starry text-white'
                            : rack.isMoney
                              ? 'bg-money border-money text-black'
                              : 'bg-nba-green border-nba-green text-black'
                          : 'bg-transparent border-gray-600 text-gray-600'
                      } ${(!timerRunning && !timerDone) ? 'opacity-40' : 'active:scale-90'}`}
                    >
                      {rack.isStar ? '★' : made ? '●' : '○'}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-gray-500 text-center mt-3">
          Max: 33 pts (5 + 5 + 3 + 10 + 5 + 5)
        </p>
      </div>

      {/* End & Record */}
      {(timerRunning || timerDone) && (
        <button
          onClick={handleRecord}
          className="w-full py-4 bg-gradient-to-r from-nba-gold to-yellow-500 text-black rounded-2xl font-black text-lg uppercase hover:shadow-lg hover:shadow-nba-gold/30 transition-all min-h-[44px]"
        >
          {timerRunning ? 'End Early & Record' : 'Record'}: {totalPoints} pts
        </button>
      )}
    </div>
  );
}
