import React from 'react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-green-800 to-green-900 border border-yellow-400/30 rounded-lg shadow-2xl p-6 w-full max-w-2xl text-white font-sans max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-yellow-300">How to Play Wollamppong</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-yellow-300 transition-colors text-3xl font-bold"
            aria-label="Close rules"
          >
            &times;
          </button>
        </div>

        <div className="space-y-4 text-gray-200">
          <section>
            <h3 className="text-xl font-semibold mb-2 text-yellow-200">Objective</h3>
            <p>
              The goal is to bet on whether a third card, drawn from the deck, will have a number that falls between the numbers of the two cards in your hand.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2 text-yellow-200">Game Flow</h3>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li><strong>Ante:</strong> All players place a small, mandatory bet (the 'ante') into the pot.</li>
              <li><strong>Deal:</strong> Each player receives two cards face down. In this version, the CPU cards are shown for clarity.</li>
              <li><strong>Betting:</strong> Starting with the 'Seon' (선), the winner of the previous round, players take turns to bet or fold.</li>
              <li><strong>Showdown:</strong> For each player who bet, a third card is drawn. If it's a win, they take their winnings from the pot.</li>
            </ol>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2 text-yellow-200">Player Actions</h3>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong>Bet:</strong> Place a wager. The amount can be adjusted with the slider, up to the value of the pot or your chip total, whichever is lower.</li>
              <li><strong>Fold:</strong> Forfeit the round. You lose your ante but don't risk any more chips.</li>
              <li><strong>아도 (Ado):</strong> A special, high-risk bet. You bet an amount equal to the entire pot. If you win, you take the entire pot immediately and the round ends. If you lose, you lose your bet, but the round continues for the other players.</li>
            </ul>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold mb-2 text-yellow-200">Winning & Losing</h3>
            <ul className="list-disc list-inside space-y-1 pl-2">
               <li><strong>You WIN if:</strong> The third card's number is strictly between your two cards. (e.g., you have a 3 and an 8; a 4, 5, 6, or 7 is a win). You win double your bet from the pot.</li>
               <li><strong>You LOSE if:</strong> The third card's number is outside the range or is the same as either of your cards. (e.g., you have a 3 and an 8; a 2, 3, 8, or 9 is a loss). You lose your bet, and it stays in the pot.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;
