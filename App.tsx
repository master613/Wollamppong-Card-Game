import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GamePhase, Card as CardType, Player } from './types';
import { INITIAL_CHIPS, ANTE_AMOUNT, DECK_NUMBERS, CARDS_PER_NUMBER, RESHUFFLE_THRESHOLD, CPU_PLAYER_COUNT } from './constants';
import Card from './components/Card';
import { ChipIcon, MusicOffIcon, MusicOnIcon, QuestionMarkIcon, SpeakerOffIcon, SpeakerOnIcon } from './components/Icons';
import { useSounds } from './hooks/useSounds';
import SoundToggle from './components/SoundToggle';
import RulesModal from './components/RulesModal';

// Helper to create and shuffle the deck
const createAndShuffleDeck = (): number[] => {
  const deck: number[] = [];
  DECK_NUMBERS.forEach(number => {
    for (let i = 0; i < CARDS_PER_NUMBER; i++) {
      deck.push(number);
    }
  });
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

const AnimatedChipCount: React.FC<{ count: number }> = ({ count }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const prevCountRef = useRef(count);

  useEffect(() => {
    if (prevCountRef.current !== count) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500); // Animation duration
      prevCountRef.current = count;
      return () => clearTimeout(timer);
    }
  }, [count]);

  return (
    <span className={`ml-2 font-semibold ${isAnimating ? 'animate-pulse-quick' : ''}`}>
      {count}
    </span>
  );
};


const App: React.FC = () => {
  const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.START);
  const [players, setPlayers] = useState<Player[]>([]);
  const [pot, setPot] = useState<number>(0);
  const [deck, setDeck] = useState<number[]>(createAndShuffleDeck());
  const [message, setMessage] = useState<string>('Welcome to Wollamppong!');
  const [betAmount, setBetAmount] = useState<number>(ANTE_AMOUNT);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number | null>(null);
  const [showdownPlayerIndex, setShowdownPlayerIndex] = useState<number | null>(null);
  const [lastWinnerId, setLastWinnerId] = useState<string | null>(null);
  const [isSfxMuted, setIsSfxMuted] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const { playSound, playBackgroundMusic, stopBackgroundMusic } = useSounds(isSfxMuted, isMusicMuted);


  const humanPlayer = players.find(p => !p.isCPU);

  // Stop music only when the component unmounts
  useEffect(() => {
    return () => stopBackgroundMusic();
  }, [stopBackgroundMusic]);

  const handleStartGame = useCallback(() => {
    playSound('shuffle');
    playBackgroundMusic();
    const initialPlayers: Player[] = [
      { id: 'player', name: 'You', isCPU: false, chips: INITIAL_CHIPS, hand: [], action: 'waiting' as 'waiting', status: '', betAmount: 0, hasActed: false, revealCard: null },
      ...Array.from({ length: CPU_PLAYER_COUNT }, (_, i) => ({
        id: `cpu${i + 1}`, name: `CPU ${i + 1}`, isCPU: true, chips: INITIAL_CHIPS, hand: [], action: 'waiting' as 'waiting', status: '', betAmount: 0, hasActed: false, revealCard: null
      }))
    ];
    setPlayers(initialPlayers);
    setPot(0);
    setDeck(createAndShuffleDeck());
    setGamePhase(GamePhase.ROUND_OVER);
    setMessage('Click "Next Round" to begin.');
    setLastWinnerId(null);
  }, [playSound, playBackgroundMusic]);

  const handleNewRound = useCallback(() => {
    playSound('shuffle');
    const survivingPlayers = players.filter(p => p.chips > 0);
    if (survivingPlayers.length <= 1) {
        const winner = survivingPlayers[0];
        setMessage(winner ? `${winner.name} won the game!` : 'Game Over!');
        setGamePhase(GamePhase.GAME_OVER);
        return;
    }
    
    let nextDeck = [...deck];
    if (nextDeck.length < RESHUFFLE_THRESHOLD) {
      nextDeck = createAndShuffleDeck();
      setMessage('Deck reshuffled...');
    }
    setDeck(nextDeck);

    // "Seon" logic: Reorder players based on last winner
    let orderedPlayers = [...survivingPlayers];
    if (lastWinnerId) {
        const winnerIndex = orderedPlayers.findIndex(p => p.id === lastWinnerId);
        if (winnerIndex > 0) {
            orderedPlayers = [
                ...orderedPlayers.slice(winnerIndex),
                ...orderedPlayers.slice(0, winnerIndex)
            ];
        }
    }
    
    const activePlayers = orderedPlayers.map(p => ({
        ...p,
        hand: [],
        action: 'waiting' as 'waiting',
        status: '',
        betAmount: 0,
        hasActed: false,
        revealCard: null,
    }));


    setPlayers(activePlayers);
    setGamePhase(GamePhase.DEALING);
  }, [deck, players, lastWinnerId, playSound]);

  // Phase: DEALING
  useEffect(() => {
    if (gamePhase !== GamePhase.DEALING) return;

    let tempDeck = [...deck];
    let tempPot = pot;

    // 1. Ante up
    const playersAfterAnte = players.map(p => {
        const ante = Math.min(ANTE_AMOUNT, p.chips);
        tempPot += ante;
        return { ...p, chips: p.chips - ante, status: `Anted ${ante}` };
    });

    // 2. Deal cards
    const playersAfterDealing = playersAfterAnte.map(p => {
        return { ...p, hand: [{ number: tempDeck.pop()! }, { number: tempDeck.pop()! }] };
    });

    setPot(tempPot);
    setDeck(tempDeck);
    setPlayers(playersAfterDealing);
    setCurrentPlayerIndex(0); // The "Seon" is now at index 0
    setGamePhase(GamePhase.BETTING);
    setMessage(`${playersAfterDealing[0]?.name || ''} is 'Seon' (선) and bets first.`);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePhase]);

  // Phase: BETTING (CPU Turn)
  useEffect(() => {
    if (gamePhase !== GamePhase.BETTING || currentPlayerIndex === null) return;

    const currentPlayer = players[currentPlayerIndex];
    if (currentPlayer?.isCPU && !currentPlayer.hasActed) {
        const cpuTurnTimeout = setTimeout(() => {
            handleCpuAction(currentPlayer);
        }, 1500 + Math.random() * 1000);
        return () => clearTimeout(cpuTurnTimeout);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePhase, currentPlayerIndex, players]);
  
  // Phase: SHOWDOWN (Sequential 1-on-1 Reveals)
  useEffect(() => {
    if (gamePhase !== GamePhase.SHOWDOWN) {
      if(showdownPlayerIndex !== null) setShowdownPlayerIndex(null);
      return;
    }

    if (showdownPlayerIndex === null) {
      // Find the first player who bet to start the showdown
      const firstBettorIndex = players.findIndex(p => p.action === 'bet');
      if (firstBettorIndex !== -1) {
        setShowdownPlayerIndex(firstBettorIndex);
      } else {
        // No one bet, round over
        setMessage('No bets were made. Pot carries over.');
        setLastWinnerId(null);
        setGamePhase(GamePhase.ROUND_OVER);
      }
      return;
    }
    
    const player = players[showdownPlayerIndex];
    
    // If current player didn't bet, or doesn't exist, find the next one
    if(!player || player.action !== 'bet') {
      const nextBettorIndex = players.findIndex((p, idx) => idx > showdownPlayerIndex && p.action === 'bet');
      if (nextBettorIndex !== -1) {
         setShowdownPlayerIndex(nextBettorIndex);
      } else {
         // All bettors have been processed
         // Check if there was any winner to assign Seon
         const anyWinner = players.some(p => p.action === 'win');
         if (!anyWinner) {
             setLastWinnerId(null);
             setMessage('No winners. Pot carries over.');
         }
         setGamePhase(GamePhase.ROUND_OVER);
      }
      return;
    }

    // Process the current player's showdown
    const showdownTimeout = setTimeout(() => {
      let tempDeck = [...deck];
      if (tempDeck.length === 0) {
        setMessage("Deck is empty!");
        setGamePhase(GamePhase.ROUND_OVER);
        return;
      }
      const revealCard: CardType = { number: tempDeck.pop()! };
      playSound('flip');
      playSound('hit');
      setDeck(tempDeck);
      
      const low = Math.min(player.hand[0].number, player.hand[1].number);
      const high = Math.max(player.hand[0].number, player.hand[1].number);
      const isWinner = revealCard.number > low && revealCard.number < high;

      if (isWinner) {
        playSound('win');
        const potentialWinnings = player.betAmount;
        const potentialTotalReturn = player.betAmount * 2;
        
        // Winnings are capped by what's left in the pot
        const actualTotalReturn = Math.min(potentialTotalReturn, pot);
        const actualWinnings = actualTotalReturn - player.betAmount;

        setPot(prevPot => Math.max(0, prevPot - actualTotalReturn));
        
        setPlayers(prevPlayers => prevPlayers.map(p => 
          p.id === player.id 
          ? { 
              ...p, 
              chips: p.chips + actualTotalReturn, 
              action: 'win' as 'win', 
              status: `Won ${actualWinnings}`,
              revealCard: revealCard 
            } 
          : p
        ));
        
        setLastWinnerId(player.id);
        setMessage(`${player.name} wins with a ${revealCard.number}!`);

      } else { // Loser
        playSound('lose');
        setPlayers(prevPlayers => prevPlayers.map(p => 
          p.id === player.id 
          ? { ...p, action: 'loss' as 'loss', status: 'Lost bet', revealCard: revealCard } 
          : p
        ));
        setMessage(`${player.name} loses with a ${revealCard.number}.`);
      }

      // Move to the next player after a delay
      const nextPlayerTimeout = setTimeout(() => {
        const nextBettorIndex = players.findIndex((p, idx) => idx > showdownPlayerIndex && p.action === 'bet');
        if (nextBettorIndex !== -1) {
            setShowdownPlayerIndex(nextBettorIndex);
        } else {
            const anyWinner = players.some(p => p.action === 'win') || isWinner;
            if (!anyWinner) {
                setLastWinnerId(null);
                setMessage('No winners. Pot carries over.');
            }
            setGamePhase(GamePhase.ROUND_OVER);
        }
      }, 2500);

      return () => clearTimeout(nextPlayerTimeout);
    }, 1500);

    return () => clearTimeout(showdownTimeout);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePhase, showdownPlayerIndex, playSound]);

   // Phase: ADO_REVEAL
   useEffect(() => {
    if (gamePhase !== GamePhase.ADO_REVEAL || currentPlayerIndex === null) return;

    const adoPlayer = players[currentPlayerIndex];
    if (!adoPlayer) return;

    setMessage(`${adoPlayer.name} has declared '아도'! Revealing card...`);

    const adoTimeout = setTimeout(() => {
        let tempDeck = [...deck];
        const revealCard: CardType = { number: tempDeck.pop()! };
        playSound('flip');
        playSound('hit');
        setDeck(tempDeck);

        const low = Math.min(adoPlayer.hand[0].number, adoPlayer.hand[1].number);
        const high = Math.max(adoPlayer.hand[0].number, adoPlayer.hand[1].number);
        const isWinner = revealCard.number > low && revealCard.number < high;

        if (isWinner) {
            playSound('adoWin');
            // WINNER - takes the whole pot, round ends
            const winnings = pot; 
            setPlayers(prev => prev.map(p =>
                p.id === adoPlayer.id
                ? { ...p, chips: p.chips + winnings, action: 'win' as 'win', status: `아도 성공! Won ${winnings - p.betAmount}`, revealCard }
                : p
            ));
            setPot(0);
            setLastWinnerId(adoPlayer.id);
            setMessage(`${adoPlayer.name} won the Ado with a ${revealCard.number}! Round over.`);
            setGamePhase(GamePhase.ROUND_OVER);
        } else {
            playSound('adoLose');
            // LOSER - bet is lost, betting continues
            setPlayers(prev => prev.map(p =>
                p.id === adoPlayer.id
                ? { ...p, action: 'loss' as 'loss', status: '아도 실패!', revealCard }
                : p
            ));
            setMessage(`${adoPlayer.name} lost the Ado with a ${revealCard.number}. Betting continues...`);
            // Set phase back to betting and advance turn
            setGamePhase(GamePhase.BETTING);
            advanceTurn();
        }
    }, 2500);

    return () => clearTimeout(adoTimeout);
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [gamePhase, currentPlayerIndex, players, deck, playSound]);

  const advanceTurn = useCallback(() => {
    setCurrentPlayerIndex(prevIndex => {
        if (prevIndex === null) return 0;
        let nextIndex = prevIndex + 1;
        // Find the next player who hasn't acted
        while(nextIndex < players.length && players[nextIndex].hasActed) {
            nextIndex++;
        }
        if (nextIndex >= players.length) {
            // All players have acted, start the showdown
            setGamePhase(GamePhase.SHOWDOWN);
            setMessage('All bets are in. Let\'s see the results!');
            return null;
        }
        return nextIndex;
    });
  }, [players]);

  const handleCpuAction = (cpu: Player) => {
    const low = Math.min(cpu.hand[0].number, cpu.hand[1].number);
    const high = Math.max(cpu.hand[0].number, cpu.hand[1].number);
    const spread = high - low;
    
    const maxBet = Math.min(cpu.chips, pot);

    let decision: 'fold' | 'bet' | 'ado' = 'fold';
    let cpuBetAmount = 0;
    const canAdo = cpu.chips >= pot && pot > ANTE_AMOUNT;

    // AI Logic
    if (spread <= 1 || maxBet <= 0) { // Impossible to win or can't bet
        decision = 'fold';
    } else if (spread >= 8 && canAdo && Math.random() < 0.4) { // High chance, consider Ado
        decision = 'ado';
    } else {
        const winChance = (spread - 1) / 10;
        const potOdds = pot > 0 ? (pot / (pot + (cpu.betAmount || 1))) : 0;
        if (winChance > 0.6 || (winChance > 0.4 && potOdds > 0.5)) {
            decision = 'bet';
            cpuBetAmount = Math.min(maxBet, Math.max(ANTE_AMOUNT, Math.floor(pot / (CPU_PLAYER_COUNT + 1))));
        } else if (winChance > 0.25) {
             decision = 'bet';
             cpuBetAmount = Math.min(maxBet, ANTE_AMOUNT);
        } else {
            decision = 'fold';
        }
    }
    
    if (decision === 'bet' && (cpuBetAmount > maxBet || cpuBetAmount <= 0)) {
        decision = 'fold';
    }

    if (decision === 'bet') {
        playSound('chip');
        setPlayers(prev => prev.map(p => p.id === cpu.id ? { ...p, chips: p.chips - cpuBetAmount, betAmount: cpuBetAmount, action: 'bet' as 'bet', status: `Bet ${cpuBetAmount}`, hasActed: true } : p));
        setPot(prev => prev + cpuBetAmount);
        advanceTurn();
    } else if (decision === 'ado') {
        playSound('ado');
        cpuBetAmount = pot;
        setPlayers(prev => prev.map(p => p.id === cpu.id ? { ...p, chips: p.chips - cpuBetAmount, betAmount: cpuBetAmount, action: 'bet' as 'bet', status: `아도! (Bet ${cpuBetAmount})`, hasActed: true } : p));
        setPot(prev => prev + cpuBetAmount);
        setGamePhase(GamePhase.ADO_REVEAL);
    } else {
        playSound('fold');
        setPlayers(prev => prev.map(p => p.id === cpu.id ? { ...p, action: 'folded' as 'folded', status: 'Folded', hasActed: true } : p));
        advanceTurn();
    }
  };
  
  const handlePlayerAction = (action: 'fold' | 'bet' | 'ado') => {
      if (currentPlayerIndex === null) return;
      const player = players[currentPlayerIndex];
      if (player.isCPU) return;
      
      if (action === 'fold') {
          playSound('fold');
          setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, action: 'folded' as 'folded', status: 'Folded', hasActed: true } : p));
          advanceTurn();
          return;
      }
      
      const maxBet = Math.min(player.chips, pot);
      const isAdo = action === 'ado';
      let finalBetAmount = isAdo ? pot : betAmount;

      if (finalBetAmount > maxBet || finalBetAmount < 1) {
        setMessage(`Invalid bet. Bet between 1 and ${maxBet}.`);
        return;
      }
      
      if(isAdo) playSound('ado');
      else playSound('chip');

      let statusMessage = isAdo ? `아도! (Bet ${finalBetAmount})` : `Bet ${finalBetAmount}`;
      setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, chips: p.chips - finalBetAmount, betAmount: finalBetAmount, action: 'bet' as 'bet', status: statusMessage, hasActed: true } : p));
      setPot(prev => prev + finalBetAmount);
      
      if (action === 'ado') {
        setGamePhase(GamePhase.ADO_REVEAL);
      } else {
        setBetAmount(ANTE_AMOUNT);
        advanceTurn();
      }
  };
  
  const handleToggleSfxMute = () => {
    setIsSfxMuted(prev => !prev);
  }

  const handleToggleMusicMute = () => {
    setIsMusicMuted(prev => !prev);
  }

  const PlayerDisplay = ({ player, isCurrent }: { player: Player, isCurrent: boolean }) => {
    const cardsAreRevealed = !player.isCPU || (gamePhase >= GamePhase.SHOWDOWN && player.action !== 'folded') || (gamePhase === GamePhase.ADO_REVEAL && !!player.revealCard);
    const isSeon = player.id === lastWinnerId && gamePhase !== GamePhase.START;
    
    return (
        <div className={`relative flex flex-col items-center space-y-2 p-3 rounded-xl transition-all duration-300 ${isCurrent ? 'bg-yellow-400/20 ring-2 ring-yellow-400' : 'bg-black/30'}`}>
            {isSeon && (
                <div className="absolute top-1 right-1 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full z-10">선</div>
            )}
            <h2 className="text-lg font-bold text-white">{player.name}</h2>
            <div className="flex items-center text-yellow-300 bg-black/50 px-3 py-1 rounded-full text-lg">
                <ChipIcon />
                <AnimatedChipCount count={player.chips} />
            </div>
            <div className="flex space-x-2 h-44 items-center justify-center">
                {player.hand.length > 0 ? (
                    player.hand.map((card, index) => <Card key={index} number={card.number} revealed={cardsAreRevealed} />)
                ) : (
                    <>
                        <Card isPlaceholder={true} number={null} revealed={false} />
                        <Card isPlaceholder={true} number={null} revealed={false} />
                    </>
                )}
                {player.revealCard && (
                    <div className="ml-4">
                        <p className="text-center text-sm font-bold mb-1">Hit!</p>
                        <Card number={player.revealCard.number} revealed={true} />
                    </div>
                )}
            </div>
            <div className={`text-center h-10 flex items-center justify-center px-3 py-1 rounded-full font-semibold text-sm ${
                player.action === 'win' ? 'bg-green-500 text-white' : 
                player.action === 'loss' ? 'bg-red-700 text-white' : 
                player.action === 'folded' ? 'bg-gray-500 text-white' :
                player.action === 'bet' ? 'bg-blue-600 text-white' : 'bg-transparent'
            }`}>
               {isCurrent && gamePhase === GamePhase.BETTING && 'Thinking...'}
               {player.status}
            </div>
        </div>
    );
  };
  
  const TableArea = () => (
    <div className="flex flex-col items-center space-y-4 flex-grow justify-center my-4">
        <div className="flex items-center space-x-16">
            <div className="flex flex-col items-center">
                <p className="text-white font-semibold">DECK</p>
                <div className="relative w-24 h-36 md:w-28 md:h-44">
                    {deck.length > 0 ? deck.slice(0, 5).map((_, i) => (
                         <div key={i} className="absolute" style={{top: `${i*2}px`, left: `${i*2}px`}}>
                           <Card number={null} revealed={false}/>
                         </div>
                    )) :  <Card isPlaceholder={true} number={null} revealed={false}/>}
                </div>
                <p className="text-white font-bold mt-2">{deck.length} left</p>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
                <p className="text-white font-semibold text-2xl">POT</p>
                <div className="flex items-center text-yellow-300 bg-black/50 px-6 py-3 rounded-full text-3xl font-bold">
                    <ChipIcon /> <span className="ml-3">{pot}</span>
                </div>
            </div>
        </div>
    </div>
  );

  const Controls = () => {
    const player = humanPlayer;
    if (!player || gamePhase !== GamePhase.BETTING || currentPlayerIndex === null || players[currentPlayerIndex]?.id !== player.id) {
        return <div className="h-36"></div>;
    }
    const maxBet = Math.min(player.chips, pot);
    const lowCard = player.hand.length === 2 ? Math.min(player.hand[0].number, player.hand[1].number) : 0;
    const highCard = player.hand.length === 2 ? Math.max(player.hand[0].number, player.hand[1].number) : 0;
    const winChance = (deck.length > 0 ? (((highCard - lowCard - 1) * CARDS_PER_NUMBER) / deck.length * 100) : 0).toFixed(1);

    return (
        <div className="bg-black/50 p-4 rounded-lg flex flex-col items-center space-y-3 w-full max-w-2xl mx-auto">
            <div className="text-center text-white">
                <p className="text-lg">Your cards: {lowCard} & {highCard}.</p>
                <p className="font-bold text-yellow-300">Chance to win: {parseFloat(winChance) > 0 ? winChance : 0}%</p>
            </div>
            <div className="flex items-stretch space-x-4 w-full">
                <button onClick={() => handlePlayerAction('fold')} className="w-1/4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition">FOLD</button>
                <div className="w-1/2 flex flex-col items-center space-y-2">
                     <div className="flex items-center space-x-2 w-full text-white">
                        <span>1</span>
                        <input 
                            type="range" 
                            min="1" 
                            max={Math.max(1, maxBet)} 
                            value={betAmount} 
                            onChange={(e) => setBetAmount(parseInt(e.target.value))}
                            className="w-full"
                            disabled={maxBet <= 0}
                        />
                        <span>{Math.max(1, maxBet)}</span>
                    </div>
                    <button onClick={() => handlePlayerAction('bet')} disabled={maxBet <= 0} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition">BET {betAmount}</button>
                </div>
                 <button 
                    onClick={() => handlePlayerAction('ado')} 
                    disabled={player.chips < pot || pot <= ANTE_AMOUNT || pot === 0} 
                    className="w-1/4 bg-red-700 hover:bg-red-800 disabled:bg-red-900/50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition"
                 >
                    아도<br/><span className="text-xs">(Bet {pot})</span>
                 </button>
            </div>
        </div>
    );
  };
  
  const GameStateButton = () => {
    const createClickHandler = (handler: () => void) => () => {
        playSound('click');
        handler();
    };

    switch (gamePhase) {
        case GamePhase.ROUND_OVER:
             return <button onClick={createClickHandler(handleNewRound)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition">Next Round</button>
        case GamePhase.GAME_OVER:
             return <button onClick={createClickHandler(handleStartGame)} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-lg transition">Play Again</button>
        case GamePhase.START:
             return <button onClick={createClickHandler(handleStartGame)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition text-2xl">Start Game</button>
        default:
            return null;
    }
  }


  return (
    <main className="bg-gradient-to-br from-green-800 to-green-900 min-h-screen text-white flex flex-col p-4 font-sans selection:bg-yellow-400 selection:text-black">
        <style>{`
          .perspective-1000 { perspective: 1000px; }
          .transform-style-preserve-3d { transform-style: preserve-3d; }
          .rotate-y-180 { transform: rotateY(180deg); }
          .backface-hidden { backface-visibility: hidden; }
          input[type=range] { -webkit-appearance: none; background: transparent; }
          input[type=range]::-webkit-slider-runnable-track { height: 8px; background: #4a5568; border-radius: 5px; }
          input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; background: #fBBF24; border-radius: 50%; cursor: pointer; margin-top: -6px; }
          @keyframes pulse-quick {
            0%, 100% {
              transform: scale(1);
              color: #fde047; /* yellow-300 */
            }
            50% {
              transform: scale(1.2);
              color: #ffffff;
            }
          }
          .animate-pulse-quick {
            animation: pulse-quick 0.5s ease-out;
          }
        `}</style>

        <div className="absolute top-4 right-4 z-20 flex space-x-2">
          <button
            onClick={() => setIsRulesModalOpen(true)}
            className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition"
            aria-label="How to play"
          >
            <QuestionMarkIcon />
          </button>
          <SoundToggle
            isMuted={isMusicMuted}
            onToggle={handleToggleMusicMute}
            onIcon={<MusicOnIcon />}
            offIcon={<MusicOffIcon />}
            ariaLabel={isMusicMuted ? "Unmute music" : "Mute music"}
          />
          <SoundToggle
            isMuted={isSfxMuted}
            onToggle={handleToggleSfxMute}
            onIcon={<SpeakerOnIcon />}
            offIcon={<SpeakerOffIcon />}
            ariaLabel={isSfxMuted ? "Unmute sound effects" : "Mute sound effects"}
          />
        </div>
        
        {gamePhase !== GamePhase.START && (
            <>
                {/* CPU Players */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                    {players.filter(p => p.isCPU).map((p, i) => (
                        <PlayerDisplay key={p.id} player={p} isCurrent={(gamePhase === GamePhase.BETTING && currentPlayerIndex === players.findIndex(pl => pl.id === p.id)) || ((gamePhase === GamePhase.SHOWDOWN || gamePhase === GamePhase.ADO_REVEAL) && showdownPlayerIndex === players.findIndex(pl => pl.id === p.id))} />
                    ))}
                </div>

                <TableArea />

                {/* Human Player */}
                <div className="flex flex-col items-center space-y-4 mt-4">
                     {humanPlayer && (
                        <PlayerDisplay player={humanPlayer} isCurrent={(gamePhase === GamePhase.BETTING && currentPlayerIndex === players.findIndex(pl => pl.id === humanPlayer.id)) || ((gamePhase === GamePhase.SHOWDOWN || gamePhase === GamePhase.ADO_REVEAL) && showdownPlayerIndex === players.findIndex(pl => pl.id === humanPlayer.id))} />
                    )}
                    <div className="h-44 flex items-center justify-center">
                         <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-300 h-8">{message}</p>
                            <div className="mt-4">
                               {gamePhase === GamePhase.BETTING ? <Controls /> : <GameStateButton/>}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )}
        
        {gamePhase === GamePhase.START && (
            <div className="flex-grow flex items-center justify-center">
                <div className="text-center">
                     <h1 className="text-5xl font-bold mb-4">Wollamppong</h1>
                     <p className="text-xl mb-8">Four Player Edition</p>
                     <GameStateButton />
                     <div className="mt-12 text-gray-400 text-sm">
                         <p>Developed by <a href="https://www.instagram.com/kimjjub" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">kimjjub</a></p>
                     </div>
                </div>
            </div>
        )}

      <RulesModal isOpen={isRulesModalOpen} onClose={() => setIsRulesModalOpen(false)} />
    </main>
  );
};

export default App;
