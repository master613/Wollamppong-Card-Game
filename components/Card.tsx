import React from 'react';

interface CardProps {
  number: number | null;
  revealed: boolean;
  isPlaceholder?: boolean;
}

const HwatuIcon: React.FC<{ number: number | null }> = ({ number }) => {
    const iconSize = "w-20 h-20 md:w-24 md:h-24";
    switch (number) {
        case 1: // January: Pine (송학)
            return (
                <svg viewBox="0 0 100 100" className={iconSize}>
                    <path d="M50 95V20 M20 40L50 20l30 20" stroke="#386641" strokeWidth="5" fill="none" />
                    <path d="M30 60L50 50l20 10 M40 80L50 70l10 10" stroke="#386641" strokeWidth="5" fill="none" />
                    <circle cx="75" cy="15" r="8" fill="#BC4749" />
                </svg>
            );
        case 2: // February: Plum Blossom (매조)
            return (
                <svg viewBox="0 0 100 100" className={iconSize}>
                    <path d="M50 90 V10" stroke="#8B4513" strokeWidth="4" fill="none" />
                    <path d="M50 60 L75 40 M50 40 L25 25" stroke="#8B4513" strokeWidth="3" fill="none" />
                    <circle cx="80" cy="35" r="6" fill="#D8BFD8" stroke="#4B0082" strokeWidth="1" />
                    <circle cx="20" cy="20" r="6" fill="#D8BFD8" stroke="#4B0082" strokeWidth="1" />
                    <circle cx="60" cy="70" r="6" fill="#D8BFD8" stroke="#4B0082" strokeWidth="1" />
                    <circle cx="45" cy="50" r="6" fill="#D8BFD8" stroke="#4B0082" strokeWidth="1" />
                </svg>
            );
        case 3: // March: Cherry Blossom (벚꽃)
            return (
                <svg viewBox="0 0 100 100" className={iconSize}>
                    <path d="M50,90 C70,70 80,40 70,20" stroke="#8B4513" strokeWidth="4" fill="none" />
                    <circle cx="70" cy="20" r="8" fill="#FFC0CB" /><circle cx="75" cy="30" r="8" fill="#FFB6C1" />
                    <circle cx="65" cy="35" r="8" fill="#FFC0CB" /><circle cx="80" cy="15" r="8" fill="#FFB6C1" />
                    <circle cx="60" cy="25" r="8" fill="#FFC0CB" />
                </svg>
            );
        case 4: // April: Wisteria (흑싸리)
            return (
                <svg viewBox="0 0 100 100" className={iconSize}>
                    <path d="M50 10 V90" stroke="#2F4F4F" strokeWidth="4" fill="none"/>
                    <path d="M50 30 L70 50 M50 50 L30 70" stroke="#2F4F4F" strokeWidth="3" fill="none"/>
                    <circle cx="75" cy="55" r="5" fill="#483D8B" /><circle cx="25" cy="75" r="5" fill="#483D8B" />
                    <circle cx="60" cy="40" r="5" fill="#483D8B" /><circle cx="40" cy="60" r="5" fill="#483D8B" />
                </svg>
            );
        case 5: // May: Iris (난초)
            return (
                <svg viewBox="0 0 100 100" className={iconSize}>
                    <path d="M50 90 C 40 70, 40 50, 50 30" stroke="#228B22" strokeWidth="4" fill="none" />
                    <path d="M50 90 C 60 70, 60 50, 50 30" stroke="#228B22" strokeWidth="4" fill="none" />
                    <path d="M50 30 C 40 20, 60 20, 50 30" fill="#9932CC" />
                    <path d="M40 40 C 30 30, 50 30, 40 40" fill="#8A2BE2" />
                    <path d="M60 40 C 70 30, 50 30, 60 40" fill="#8A2BE2" />
                </svg>
            );
        case 6: // June: Peony (모란)
            return (
                <svg viewBox="0 0 100 100" className={iconSize}>
                    <circle cx="50" cy="40" r="20" fill="#DC143C"/>
                    <circle cx="40" cy="55" r="15" fill="#C71585"/>
                    <circle cx="60" cy="55" r="15" fill="#C71585"/>
                    <path d="M50 70 V95" stroke="#006400" strokeWidth="4"/>
                </svg>
            );
        case 7: // July: Bush Clover (홍싸리)
            return (
                <svg viewBox="0 0 100 100" className={iconSize}>
                    <path d="M50 10 V90" stroke="#CD5C5C" strokeWidth="4" fill="none"/>
                    <path d="M50 30 L70 50 M50 50 L30 70" stroke="#CD5C5C" strokeWidth="3" fill="none"/>
                    <circle cx="75" cy="55" r="5" fill="#F08080" /><circle cx="25" cy="75" r="5" fill="#F08080" />
                    <circle cx="60" cy="40" r="5" fill="#F08080" /><circle cx="40" cy="60" r="5" fill="#F08080" />
                </svg>
            );
        case 8: // August: Pampas Grass (공산)
            return (
                <svg viewBox="0 0 100 100" className={iconSize}>
                    <circle cx="50" cy="35" r="25" fill="#FFD700"/>
                    <path d="M20 90 Q 40 60 50 90" stroke="#A9A9A9" strokeWidth="4" fill="none"/>
                    <path d="M50 90 Q 70 60 80 90" stroke="#A9A9A9" strokeWidth="4" fill="none"/>
                    <path d="M35 90 Q 50 70 65 90" stroke="#A9A9A9" strokeWidth="4" fill="none"/>
                </svg>
            );
        case 9: // September: Chrysanthemum (국진)
            return (
                <svg viewBox="0 0 100 100" className={iconSize}>
                    <circle cx="50" cy="50" r="25" fill="#FF8C00"/>
                    <circle cx="50" cy="50" r="15" fill="#FFA500"/>
                    <line x1="50" y1="25" x2="50" y2="75" stroke="#FFD700" strokeWidth="4"/>
                    <line x1="25" y1="50" x2="75" y2="50" stroke="#FFD700" strokeWidth="4"/>
                    <line x1="32" y1="32" x2="68" y2="68" stroke="#FFD700" strokeWidth="4"/>
                    <line x1="32" y1="68" x2="68" y2="32" stroke="#FFD700" strokeWidth="4"/>
                </svg>
            );
        case 10: // October: Maple (단풍)
            return (
                <svg viewBox="0 0 100 100" className={iconSize}>
                    <path d="M50 90 L50 60 M50 60 L20 40 M50 60 L80 40 M50 60 L30 70 M50 60 L70 70" stroke="#8B0000" strokeWidth="5" fill="none"/>
                    <path d="M20 40 L10 30 L30 30 Z" fill="#DC143C"/>
                    <path d="M80 40 L70 30 L90 30 Z" fill="#DC143C"/>
                    <path d="M30 70 L20 80 L40 80 Z" fill="#DC143C"/>
                    <path d="M70 70 L60 80 L80 80 Z" fill="#DC143C"/>
                    <path d="M50 60 L40 50 L60 50 Z" fill="#DC143C"/>
                </svg>
            );
        case 11: // November: Paulownia (오동)
            return (
                <svg viewBox="0 0 100 100" className={iconSize}>
                   <path d="M50 95 V 50 C 20 50, 20 20, 50 20 C 80 20, 80 50, 50 50" fill="#228B22" />
                </svg>
            );
        case 12: // December: Willow/Rain (비)
            return (
                <svg viewBox="0 0 100 100" className={iconSize}>
                    <path d="M20 10 C 30 50, 10 80, 20 95" stroke="#556B2F" strokeWidth="4" fill="none"/>
                    <line x1="40" y1="10" x2="35" y2="90" stroke="#4682B4" strokeWidth="3" strokeDasharray="5,5"/>
                    <line x1="60" y1="10" x2="55" y2="90" stroke="#4682B4" strokeWidth="3" strokeDasharray="5,5"/>
                    <line x1="80" y1="10" x2="75" y2="90" stroke="#4682B4" strokeWidth="3" strokeDasharray="5,5"/>
                </svg>
            );
        default:
            return <div className="text-6xl">?</div>;
    }
};


const Card: React.FC<CardProps> = ({ number, revealed, isPlaceholder }) => {
  const containerClasses = "w-24 h-36 md:w-28 md:h-44 font-bold text-4xl perspective-1000 cursor-pointer";
  const flipperClasses = "relative w-full h-full transition-transform duration-500 transform-style-preserve-3d";
  const faceClasses = "absolute w-full h-full backface-hidden rounded-lg flex items-center justify-center shadow-lg";

  if (isPlaceholder) {
    return (
      <div className="w-24 h-36 md:w-28 md:h-44 rounded-lg bg-black/20 border-2 border-dashed border-gray-400"></div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className={`${flipperClasses} ${revealed ? 'rotate-y-180' : ''}`}>
        {/* Card Back */}
        <div className={`${faceClasses} bg-gradient-to-br from-red-600 to-red-800`}>
           <div className="w-full h-full border-4 border-red-900/50 rounded-lg flex items-center justify-center">
                <div className="w-16 h-24 md:w-20 md:h-28 rounded-full bg-red-700/50 transform rotate-45"></div>
           </div>
        </div>
        {/* Card Front */}
        <div className={`${faceClasses} relative bg-white text-gray-800 rotate-y-180`}>
           <span className="absolute top-2 right-3 text-2xl font-semibold text-black">{number}</span>
           <span className="absolute bottom-2 left-3 text-2xl font-semibold text-black transform rotate-180">{number}</span>
           <HwatuIcon number={number} />
        </div>
      </div>
    </div>
  );
};

export default Card;