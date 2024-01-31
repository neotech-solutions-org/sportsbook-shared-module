export const BETTING_TYPES = ['Single', 'Double', 'Treble'];
export const MAX_PAYOUT = 15000.0;
export const MAX_STAKE_AMOUNT = 1499.0;

export type Bet = {
  outcomeId: string;
  eventId: string;
  odds: string;
  singlesStakeAmount?: number;
  banker?: boolean;
};

export type BetType = {
  requiredHitCount: number;
  stakeAmountPerCombination: number;
};

export type BetSlipRequest = {
  bets: Bet[];
  betTypes?: BetType[];
};

export type BetSlipMaxPayoutResult = {
  maxPayout: number;
  totalStakeAmount: number;
  maxTotalStakeAmount: number;
};
