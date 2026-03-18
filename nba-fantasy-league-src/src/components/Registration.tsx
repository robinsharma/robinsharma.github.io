import { useState, useRef, useCallback } from 'react';
import type { Player } from '../types';
import { PlayerAvatar } from './PlayerAvatar';

interface Props {
  players: Player[];
  onAddPlayer: (player: Player) => void;
  onRemovePlayer: (id: string) => void;
  onStart: () => void;
}

export function Registration({ players, onAddPlayer, onRemovePlayer, onStart }: Props) {
  const [name, setName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [photo, setPhoto] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 320 } },
      });
      streamRef.current = stream;
      setCameraActive(true);
    } catch {
      setCameraError('Camera access denied. You can upload a photo instead.');
    }
  }, []);

  const videoRefCallback = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d')!;
    const v = videoRef.current;
    const size = Math.min(v.videoWidth, v.videoHeight);
    const sx = (v.videoWidth - size) / 2;
    const sy = (v.videoHeight - size) / 2;
    ctx.drawImage(v, sx, sy, size, size, 0, 0, 200, 200);
    setPhoto(canvas.toDataURL('image/jpeg', 0.7));
    stopCamera();
  }, [stopCamera]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d')!;
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 200, 200);
        setPhoto(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = () => {
    if (!name.trim() || !teamName.trim()) return;
    if (players.length >= 16) return;
    onAddPlayer({
      id: crypto.randomUUID(),
      name: name.trim(),
      teamName: teamName.trim(),
      photo,
    });
    setName('');
    setTeamName('');
    setPhoto('');
    stopCamera();
  };

  const canStart = players.length >= 4 && players.length <= 16;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="text-center animate-slide-up">
        <h2 className="text-3xl font-black uppercase tracking-tight">
          Player <span className="text-nba-gold">Registration</span>
        </h2>
        <p className="text-gray-400 text-sm mt-1">Register 4–16 players to begin</p>
      </div>

      {/* Registration Form */}
      <div className="bg-nba-card border border-nba-card-light rounded-2xl p-5 space-y-4 animate-slide-up">
        {/* Photo section */}
        <div className="flex flex-col items-center gap-3">
          {photo ? (
            <div className="relative">
              <img src={photo} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-nba-gold" />
              <button
                onClick={() => setPhoto('')}
                className="absolute -top-1 -right-1 w-6 h-6 bg-nba-red rounded-full text-xs flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ) : cameraActive ? (
            <div className="relative">
              <video
                ref={videoRefCallback}
                autoPlay
                playsInline
                muted
                className="w-32 h-32 rounded-full object-cover border-2 border-nba-accent"
              />
              <div className="flex gap-2 mt-2 justify-center">
                <button
                  onClick={capturePhoto}
                  className="px-4 py-2 bg-nba-green rounded-lg text-sm font-semibold min-h-[44px]"
                >
                  Capture
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 bg-gray-700 rounded-lg text-sm font-semibold min-h-[44px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={startCamera}
                className="px-4 py-2.5 bg-nba-blue rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors min-h-[44px]"
              >
                📷 Take Photo
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 bg-nba-card-light rounded-lg text-sm font-semibold hover:bg-white/10 transition-colors min-h-[44px]"
              >
                📁 Upload
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}
          {cameraError && (
            <p className="text-nba-red text-xs">{cameraError}</p>
          )}
        </div>

        {/* Name inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Player Name"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className="w-full px-4 py-3 bg-nba-dark border border-nba-card-light rounded-xl text-white placeholder-gray-500 focus:border-nba-gold focus:outline-none min-h-[44px]"
            maxLength={30}
          />
          <input
            type="text"
            placeholder="Fantasy Team Name"
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className="w-full px-4 py-3 bg-nba-dark border border-nba-card-light rounded-xl text-white placeholder-gray-500 focus:border-nba-gold focus:outline-none min-h-[44px]"
            maxLength={30}
          />
        </div>

        <button
          onClick={handleAdd}
          disabled={!name.trim() || !teamName.trim() || players.length >= 16}
          className="w-full py-3 bg-nba-accent rounded-xl font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors min-h-[44px]"
        >
          Add Player ({players.length}/16)
        </button>
      </div>

      {/* Player List */}
      {players.length > 0 && (
        <div className="space-y-2 animate-slide-up">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Registered Players ({players.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {players.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center gap-3 bg-nba-card border border-nba-card-light rounded-xl px-4 py-3 animate-slide-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <PlayerAvatar photo={p.photo} name={p.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{p.name}</p>
                  <p className="text-xs text-gray-500 truncate">{p.teamName}</p>
                </div>
                <button
                  onClick={() => onRemovePlayer(p.id)}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-nba-red hover:bg-nba-red/10 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Start Button */}
      <button
        onClick={onStart}
        disabled={!canStart}
        className={`w-full py-4 rounded-2xl font-black text-lg uppercase tracking-wider transition-all min-h-[44px] ${
          canStart
            ? 'bg-gradient-to-r from-nba-red to-nba-blue text-white hover:shadow-lg hover:shadow-nba-red/20 hover:scale-[1.01]'
            : 'bg-gray-800 text-gray-600 cursor-not-allowed'
        }`}
      >
        {players.length < 4
          ? `Need ${4 - players.length} more player${4 - players.length > 1 ? 's' : ''}`
          : 'Start Challenges 🏀'}
      </button>
    </div>
  );
}
