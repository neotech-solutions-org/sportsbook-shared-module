export const BETTING_TYPES = ['Single', 'Double', 'Treble'];

export type Bet = {
  outcomeId: string;
  eventId: string;
  odds: string;
  singlesStakeAmount?: number;
  banker?: boolean;
  marketTypeId: string;
  marketTypeCombiningIds: string[];
  specialValues: { modelId: string }[];
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

export type CalculateCashoutAmountParams = {
  stake: number;
  initialOdds: number;
  currOddWinProb: number;
  uniqueMarketMargin: number;
};
