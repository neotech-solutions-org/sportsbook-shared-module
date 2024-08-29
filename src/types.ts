export const BETTING_TYPES = ['Single', 'Double', 'Treble'];

export type Bet = {
  outcomeId: string;
  eventId: string;
  odds: string;
  singlesStakeAmount?: number;
  banker?: boolean;
  marketTypeId: string;
  marketTypeCombiningIds: string[]
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
