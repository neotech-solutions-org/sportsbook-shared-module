// Types
import { BetSlipRequest, Bet } from './types';

export const bets: Bet[] = [
  { eventId: '1', outcomeId: '1', odds: "1.5", singlesStakeAmount: 10, marketTypeId: '1', marketTypeCombiningIds: [] },
  { eventId: '2', outcomeId: '2', odds: "1.25", singlesStakeAmount: 10, marketTypeId: '2', marketTypeCombiningIds: [] },
  { eventId: '3', outcomeId: '3', odds: "1.5", marketTypeId: '3', marketTypeCombiningIds: [] },
  { eventId: '4', outcomeId: '4', odds: "2", banker: true, marketTypeId: '3', marketTypeCombiningIds: [] },
];

export const bettingSlipRequest: BetSlipRequest = {
  bets,
  betTypes: [
    { requiredHitCount: 1, stakeAmountPerCombination: 1 },
    { requiredHitCount: 2, stakeAmountPerCombination: 1 },
  ],
};
