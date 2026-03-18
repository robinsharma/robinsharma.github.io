import type { AppState, Player } from '../types';
import { CHALLENGES } from '../types';
import { Leaderboard } from './Leaderboard';
import { SkillsChallenge } from './SkillsChallenge';
import { ThreePointContest } from './ThreePointContest';
import { FreeThrowChallenge } from './FreeThrowChallenge';
import { ChallengeLeaderboardView } from './ChallengeLeaderboardView';

interface Props {
  state: AppState;
  onRecordSkills: (timeMs: number) => void;
  onRecordThreePoint: (racks: boolean[][], totalPoints: number) => void;
  onRecordFreeThrow: (shots: boolean[], totalMade: number) => void;
  onNextChallenge: () => void;
  onFinish: () => void;
}

export function ChallengeHub({
  state,
  onRecordSkills,
  onRecordThreePoint,
  onRecordFreeThrow,
  onNextChallenge,
  onFinish,
}: Props) {
  const challenge = CHALLENGES[state.currentChallengeIndex];
  const currentPlayerId = state.playerOrder[state.currentPlayerIndex];
  const currentPlayer = state.players.find(p => p.id === currentPlayerId)!;
  const isLastChallenge = state.currentChallengeIndex === 2;

  // Show challenge leaderboard if all players completed
  if (state.challengeComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <ChallengeLeaderboardView
          state={state}
          challengeIndex={state.currentChallengeIndex}
          onNext={isLastChallenge ? onFinish : onNextChallenge}
          isLastChallenge={isLastChallenge}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main challenge area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Challenge header */}
          <div className="bg-nba-card border border-nba-card-light rounded-2xl px-5 py-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-nba-accent">
                  Challenge {state.currentChallengeIndex + 1} of 3
                </p>
                <h2 className="text-xl font-black uppercase">{challenge.name}</h2>
                <p className="text-sm text-gray-400">{challenge.description}</p>
              </div>
              <div className="bg-nba-accent/20 rounded-xl px-4 py-2 text-center">
                <p className="text-[10px] text-nba-accent uppercase">Progress</p>
                <p className="text-lg font-black">
                  {state.currentPlayerIndex + 1}
                  <span className="text-gray-500 text-sm">/{state.playerOrder.length}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Challenge interface */}
          <div className="bg-nba-card border border-nba-card-light rounded-2xl p-5">
            <ChallengeInterface
              challengeIndex={state.currentChallengeIndex}
              player={currentPlayer}
              onRecordSkills={onRecordSkills}
              onRecordThreePoint={onRecordThreePoint}
              onRecordFreeThrow={onRecordFreeThrow}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Up next */}
          <div className="bg-nba-card border border-nba-card-light rounded-2xl p-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">
              Batting Order
            </h3>
            <div className="space-y-1.5">
              {state.playerOrder.map((pid, i) => {
                const p = state.players.find(pl => pl.id === pid)!;
                const isDone = i < state.currentPlayerIndex;
                const isCurrent = i === state.currentPlayerIndex;
                return (
                  <div
                    key={pid}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                      isCurrent
                        ? 'bg-nba-accent/20 border border-nba-accent/30'
                        : isDone
                          ? 'opacity-40'
                          : 'bg-nba-dark/30'
                    }`}
                  >
                    <span className="w-5 text-center text-xs text-gray-500">{i + 1}</span>
                    <span className={`flex-1 truncate ${isCurrent ? 'font-bold text-nba-accent' : ''}`}>
                      {p.name}
                    </span>
                    {isDone && <span className="text-nba-green text-xs">✓</span>}
                    {isCurrent && <span className="text-nba-accent text-xs">◄</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Overall leaderboard */}
          <Leaderboard state={state} />
        </div>
      </div>
    </div>
  );
}

function ChallengeInterface({
  challengeIndex,
  player,
  onRecordSkills,
  onRecordThreePoint,
  onRecordFreeThrow,
}: {
  challengeIndex: number;
  player: Player;
  onRecordSkills: (timeMs: number) => void;
  onRecordThreePoint: (racks: boolean[][], totalPoints: number) => void;
  onRecordFreeThrow: (shots: boolean[], totalMade: number) => void;
}) {
  // Use key to force remount when player changes
  if (challengeIndex === 0) {
    return <SkillsChallenge key={player.id} player={player} onRecord={onRecordSkills} />;
  }
  if (challengeIndex === 1) {
    return <ThreePointContest key={player.id} player={player} onRecord={onRecordThreePoint} />;
  }
  return <FreeThrowChallenge key={player.id} player={player} onRecord={onRecordFreeThrow} />;
}
