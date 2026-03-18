import { useState, useEffect, useCallback } from 'react';
import type { AppState, Player, SkillsChallengeScore, ThreePointScore, FreeThrowScore } from './types';
import { defaultState, loadState, saveState, clearState, shuffleArray } from './state';
import { Header } from './components/Header';
import { Registration } from './components/Registration';
import { ChallengeHub } from './components/ChallengeHub';
import { FinalResults } from './components/FinalResults';

function App() {
  const [state, setState] = useState<AppState>(() => loadState() ?? { ...defaultState });

  // Persist on every state change
  useEffect(() => {
    saveState(state);
  }, [state]);

  const handleReset = useCallback(() => {
    clearState();
    setState({ ...defaultState });
  }, []);

  const handleAddPlayer = useCallback((player: Player) => {
    setState(prev => ({
      ...prev,
      players: [...prev.players, player],
    }));
  }, []);

  const handleRemovePlayer = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      players: prev.players.filter(p => p.id !== id),
    }));
  }, []);

  const handleStart = useCallback(() => {
    setState(prev => ({
      ...prev,
      screen: 'challenges',
      playerOrder: shuffleArray(prev.players.map(p => p.id)),
      currentChallengeIndex: 0,
      currentPlayerIndex: 0,
      challengeComplete: false,
    }));
  }, []);

  const advancePlayer = useCallback((updater: (prev: AppState) => AppState) => {
    setState(prev => {
      let next = updater(prev);
      if (next.currentPlayerIndex + 1 >= next.playerOrder.length) {
        // Challenge complete
        next = { ...next, challengeComplete: true };
      } else {
        next = { ...next, currentPlayerIndex: next.currentPlayerIndex + 1 };
      }
      return next;
    });
  }, []);

  const handleRecordSkills = useCallback((timeMs: number) => {
    advancePlayer(prev => ({
      ...prev,
      skillsScores: [
        ...prev.skillsScores,
        { playerId: prev.playerOrder[prev.currentPlayerIndex], timeMs } as SkillsChallengeScore,
      ],
    }));
  }, [advancePlayer]);

  const handleRecordThreePoint = useCallback((racks: boolean[][], totalPoints: number) => {
    advancePlayer(prev => ({
      ...prev,
      threePointScores: [
        ...prev.threePointScores,
        {
          playerId: prev.playerOrder[prev.currentPlayerIndex],
          racks,
          totalPoints,
        } as ThreePointScore,
      ],
    }));
  }, [advancePlayer]);

  const handleRecordFreeThrow = useCallback((shots: boolean[], totalMade: number) => {
    advancePlayer(prev => ({
      ...prev,
      freeThrowScores: [
        ...prev.freeThrowScores,
        {
          playerId: prev.playerOrder[prev.currentPlayerIndex],
          shots,
          totalMade,
        } as FreeThrowScore,
      ],
    }));
  }, [advancePlayer]);

  const handleNextChallenge = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentChallengeIndex: prev.currentChallengeIndex + 1,
      currentPlayerIndex: 0,
      challengeComplete: false,
    }));
  }, []);

  const handleFinish = useCallback(() => {
    setState(prev => ({
      ...prev,
      screen: 'results',
    }));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onReset={handleReset} showReset={true} />
      <main className="flex-1">
        {state.screen === 'registration' && (
          <Registration
            players={state.players}
            onAddPlayer={handleAddPlayer}
            onRemovePlayer={handleRemovePlayer}
            onStart={handleStart}
          />
        )}
        {state.screen === 'challenges' && (
          <ChallengeHub
            state={state}
            onRecordSkills={handleRecordSkills}
            onRecordThreePoint={handleRecordThreePoint}
            onRecordFreeThrow={handleRecordFreeThrow}
            onNextChallenge={handleNextChallenge}
            onFinish={handleFinish}
          />
        )}
        {state.screen === 'results' && <FinalResults state={state} />}
      </main>
    </div>
  );
}

export default App;
