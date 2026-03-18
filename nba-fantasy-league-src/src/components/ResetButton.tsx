import { useState } from 'react';

interface Props {
  onReset: () => void;
}

export function ResetButton({ onReset }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="px-3 py-1.5 text-sm bg-nba-red/20 text-nba-red border border-nba-red/30 rounded-lg hover:bg-nba-red/30 transition-colors min-h-[44px] min-w-[44px]"
      >
        Reset
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-nba-card border border-nba-card-light rounded-2xl p-6 max-w-sm w-full animate-slide-up">
            <h3 className="text-xl font-bold mb-2">Reset Everything?</h3>
            <p className="text-gray-400 mb-6 text-sm">
              This will delete all players and scores. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 bg-nba-card-light rounded-xl font-semibold hover:bg-white/10 transition-colors min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  onReset();
                }}
                className="flex-1 py-3 bg-nba-red rounded-xl font-semibold hover:bg-red-700 transition-colors min-h-[44px]"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
