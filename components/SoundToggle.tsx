import React from 'react';

interface SoundToggleProps {
  isMuted: boolean;
  onToggle: () => void;
  onIcon: React.ReactNode;
  offIcon: React.ReactNode;
  ariaLabel: string;
}

const SoundToggle: React.FC<SoundToggleProps> = ({ isMuted, onToggle, onIcon, offIcon, ariaLabel }) => {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition"
      aria-label={ariaLabel}
    >
      {isMuted ? offIcon : onIcon}
    </button>
  );
};

export default SoundToggle;