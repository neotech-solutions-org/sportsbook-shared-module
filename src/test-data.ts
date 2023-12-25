import { BetSlipRequest, BetType } from './types';

export const bets: BetType[] = [
  { eventId: '1', outcomeId: '1', odds: 1.5, singlesStakeAmount: 10000 },
  { eventId: '2', outcomeId: '2', odds: 1.25 },
  { eventId: '3', outcomeId: '3', odds: 1.5 },
  { eventId: '4', outcomeId: '4', odds: 2 },
  { eventId: '5', outcomeId: '5', odds: 2.5 },
];

export const bettingSlipRequest: BetSlipRequest = {
  bets,
  stakeAmount: 10000,
  systemBetTypes: [
    { requiredHitCount: 2, stakeAmountPerCombination: 1 },
    { requiredHitCount: 3, stakeAmountPerCombination: 1 },
  ],
};
