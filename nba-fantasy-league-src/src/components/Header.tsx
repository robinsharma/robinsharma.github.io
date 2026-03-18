import { ResetButton } from './ResetButton';

interface Props {
  onReset: () => void;
  showReset: boolean;
}

export function Header({ onReset, showReset }: Props) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-nba-dark/80 backdrop-blur-sm border-b border-nba-card-light sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="text-2xl">🏀</div>
        <div>
          <h1 className="text-sm font-bold tracking-wider uppercase text-nba-gold">
            NBA Fantasy League
          </h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">
            Skills Challenge
          </p>
        </div>
      </div>
      {showReset && <ResetButton onReset={onReset} />}
    </header>
  );
}
