// Types
import { bettingSlipRequest } from './test-data';
import {
  BETTING_TYPES,
  BetSlipMaxPayoutResult,
  BetSlipRequest,
  BetType,
  MAX_PAYOUT,
  MAX_STAKE_AMOUNT,
} from './types';

/**
 * Calculates total odds from the given bet types.
 * @param bets - Bet types
 * @returns total odds
 */
export const calculateTotalOddsForNormalBettingSlip = (
  bets: BetType[],
): number => {
  const listOfOdds = bets.map((bet) => bet.odds);
  return listOfOdds.reduce((accumulator, odds) => accumulator * odds, 1);
};

/**
 * Calculate max stake amount.
 * @param totalOdds - Total odds.
 * @param limit - Max payout limit.
 * @returns max stake amount
 */
export const calculateMaxStakeAmountForNormalBettingSlip = (
  totalOdds: number,
  limit = MAX_PAYOUT,
): number => {
  let rawStakeAmount = limit / totalOdds;
  let roundedStakeAmount = +rawStakeAmount.toFixed(2);

  let maxPayout = totalOdds * roundedStakeAmount;
  while (maxPayout > limit) {
    rawStakeAmount -= 0.01;
    roundedStakeAmount = +rawStakeAmount.toFixed(2);
    maxPayout = totalOdds * roundedStakeAmount;
  }

  return roundedStakeAmount;
};

/**
 * Generate combination type and number of combinations for system and system ways betting slips.
 * @param bets - Bets
 * @returns record with combination type and number of combinations
 */
export const getCombinations = (bets: BetType[]): Record<string, number> => {
  const betsWithoutBankers = bets.filter((bet) => !bet.banker);
  const combinations: Record<string, number> = {};
  const numberOfBankers = bets.length - betsWithoutBankers.length;

  for (let i = 1; i <= betsWithoutBankers.length; i++) {
    const numberOfCombinations = generateCombinations(
      betsWithoutBankers,
      i,
    ).length;
    if (numberOfCombinations > 0) {
      combinations[getBettingType(numberOfBankers + i)] = numberOfCombinations;
    }
  }

  return combinations;
};

/**
 * Calculate total max payout, total stake amount and max total stake amount.
 * If the calculated max payout is higher then max possible payout, then max payout is set to max possible payout.
 * @returns max payout and total stake amount
 */
export const calculateMaxPayout = (
  betSlipRequest: BetSlipRequest,
  limit = MAX_PAYOUT,
): BetSlipMaxPayoutResult => {
  let maxPayout = 0;
  let totalStakeAmount = 0;
  let maxTotalStakeAmount = 0;
  const { bets, systemBetTypes, stakeAmount } = betSlipRequest;
  const bankerOutcomes = bets.filter((bet) => bet.banker);
  const combinationOutcomes = bets.filter((bet) => !bet.banker);

  for (const bet of bets) {
    if (!bet.singlesStakeAmount) continue;
    const payout = bet.odds * bet.singlesStakeAmount;

    maxPayout += payout < limit ? payout : limit;
    totalStakeAmount += bet.singlesStakeAmount;
    maxTotalStakeAmount += MAX_STAKE_AMOUNT;
  }

  if (stakeAmount) {
    const payout = calculateTotalOddsForNormalBettingSlip(bets) * stakeAmount;

    maxPayout += payout < limit ? payout : limit;
    totalStakeAmount += stakeAmount;
    maxTotalStakeAmount += MAX_STAKE_AMOUNT;
  }

  if (systemBetTypes.length > 0) {
    for (const systemBetType of systemBetTypes) {
      const { requiredHitCount, stakeAmountPerCombination } = systemBetType;

      const combinations = generateCombinations(
        combinationOutcomes,
        requiredHitCount,
      );

      const payout = calculateSystemMaxPayout(
        combinations,
        stakeAmountPerCombination,
        bankerOutcomes,
      );

      maxPayout += payout < limit ? payout : limit;
      totalStakeAmount += stakeAmountPerCombination * combinations.length;
      maxTotalStakeAmount += MAX_STAKE_AMOUNT;
    }
  }

  return { maxPayout, totalStakeAmount, maxTotalStakeAmount };
};

/**
 * Get betting type by the given number of bets.
 * @param numberOfBets - Number of bets
 * @returns betting type value
 */
export const getBettingType = (numberOfBets: number) => {
  return BETTING_TYPES[numberOfBets - 1] ?? `${numberOfBets} Fold`;
};

/**
 * Calculate system betting slip max payout.
 * If the calculated max payout is higher then max possible payout, then max payout is set to max possible payout.
 * @param combinations - System combinations of outcomes.
 * @param stakeAmountPerCombination - Stake amount per combination.
 * @param bankerOutcomes - Banker outcomes.
 * @returns max payout
 */
const calculateSystemMaxPayout = (
  combinations: BetType[][],
  stakeAmountPerCombination: number,
  bankerOutcomes: BetType[],
): number => {
  let maxPayout = 0;

  for (const combination of combinations) {
    const listOfOdds: number[] = [
      ...bankerOutcomes.map((outcome) => outcome.odds),
      ...combination.map((comb) => comb.odds),
    ];
    const payoutPerCombination =
      listOfOdds.reduce((accumulator, odds) => accumulator * odds, 1) *
      stakeAmountPerCombination;
    maxPayout += payoutPerCombination;
  }

  return maxPayout;
};

/**
 * Generate combinations of outcomes by the given size (required hit count).
 * Outcomes from the same event cannot be in the combinations for system ways bets.
 * @param outcomes - Outcomes with details
 * @param size - Size of the combinations
 * @returns combinations
 */
const generateCombinations = (
  outcomes: BetType[],
  size: number,
): BetType[][] => {
  const result: BetType[][] = [];

  function generate(
    currentCombo: BetType[],
    start: number,
    usedEventIds: Set<string>,
  ): void {
    if (currentCombo.length === size) {
      result.push([...currentCombo]);
      return;
    }

    for (let i = start; i < outcomes.length; i++) {
      const currentOutcome = outcomes[i];

      if (!usedEventIds.has(currentOutcome.eventId)) {
        currentCombo.push(currentOutcome);

        usedEventIds.add(currentOutcome.eventId);

        generate(currentCombo, i + 1, usedEventIds);

        currentCombo.pop();
        usedEventIds.delete(currentOutcome.eventId);
      }
    }
  }

  generate([], 0, new Set<string>());
  return result;
};
