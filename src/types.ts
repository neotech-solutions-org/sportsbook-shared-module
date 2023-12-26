export const BETTING_TYPES = ['Single', 'Double', 'Treble'];
export const MAX_PAYOUT = 10000.0;
export const MAX_STAKE_AMOUNT = 1499.0;

export type BetType = {
  outcomeId: string;
  eventId: string;
  odds: number;
  singlesStakeAmount?: number;
  banker?: boolean;
};

export type SystemBetType = {
  requiredHitCount: number;
  stakeAmountPerCombination: number;
};

export type BetSlipRequest = {
  bets: BetType[];
  stakeAmount?: number;
  systemBetTypes?: SystemBetType[];
};

export type BetSlipMaxPayoutResult = {
  maxPayout: number;
  totalStakeAmount: number;
  maxTotalStakeAmount: number;
};
