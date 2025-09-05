export enum GamePhase {
  START,
  DEALING,
  BETTING,
  ROUND_OVER,
  GAME_OVER,
  SHOWDOWN,
  ADO_REVEAL,
}

export interface Card {
  number: number;
}

export type PlayerAction = 'waiting' | 'folded' | 'bet' | 'win' | 'loss' | 'tie';

export interface Player {
  id: string;
  name: string;
  isCPU: boolean;
  chips: number;
  hand: Card[];
  action: PlayerAction;
  status: string; // e.g. "Bet 10", "Folded"
  betAmount: number;
  hasActed: boolean;
  revealCard?: Card | null;
}