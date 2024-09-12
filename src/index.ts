// Types
import {
  BETTING_TYPES,
  Bet,
  BetSlipMaxPayoutResult,
  BetSlipRequest,
  CalculateCashoutAmountParams,
} from './types';

/**
 * Calculates total odds from the given bets.
 * @param bets - Bets
 * @returns total odds
 */
export const calculateTotalOddsForNormalBettingSlip = (bets: Bet[]): number => {
  const listOfOdds = bets.map((bet) => Number(bet.odds));
  return listOfOdds.reduce((accumulator, odds) => accumulator * odds, 1);
};

/**
 * Calculate max stake amount.
 * @param totalOdds - Total odds.
 * @param maxWinning - Max winning.
 * @returns max stake amount
 */
export const calculateMaxStakeAmountForNormalBettingSlip = (
  totalOdds: number,
  maxWinning: number,
): number => {
  let rawStakeAmount = maxWinning / totalOdds;
  let roundedStakeAmount = +rawStakeAmount.toFixed(2);

  let maxPayout = totalOdds * roundedStakeAmount;
  while (maxPayout > maxWinning) {
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
export const getCombinations = (bets: Bet[]): Record<string, number> => {
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
 * @param betSlipRequest - Bet Slip Request
 * @param maxWinning - Max winning
 * @param maxStakeAmount - Max Stake Amount
 * @returns max payout and total stake amount
 */
export const calculateMaxPayout = (
  betSlipRequest: BetSlipRequest,
  maxWinning: number,
  maxStakeAmount: number,
): BetSlipMaxPayoutResult => {
  let maxPayout = 0;
  let totalStakeAmount = 0;
  let maxTotalStakeAmount = 0;
  const { bets, betTypes } = betSlipRequest;

  for (const bet of bets) {
    if (!bet.singlesStakeAmount) continue;
    const payout = Number(bet.odds) * bet.singlesStakeAmount;

    maxPayout += payout < maxWinning ? payout : maxWinning;
    totalStakeAmount += bet.singlesStakeAmount;
    maxTotalStakeAmount += maxStakeAmount;
  }

  if (betTypes?.length > 0) {
    const bankerOutcomes = bets.filter((bet) => bet.banker);
    const combinationOutcomes = bets.filter((bet) => !bet.banker);
    for (const betType of betTypes) {
      const { requiredHitCount, stakeAmountPerCombination } = betType;

      const combinations = generateCombinations(
        combinationOutcomes,
        requiredHitCount,
      );

      const payout = calculateSystemMaxPayout(
        combinations,
        stakeAmountPerCombination,
        bankerOutcomes,
      );

      maxPayout += payout < maxWinning ? payout : maxWinning;
      totalStakeAmount += stakeAmountPerCombination * combinations.length;
      maxTotalStakeAmount += maxStakeAmount;
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
  combinations: Bet[][],
  stakeAmountPerCombination: number,
  bankerOutcomes: Bet[],
): number => {
  let maxPayout = 0;

  for (const combination of combinations) {
    const listOfOdds: number[] = [
      ...bankerOutcomes.map((outcome) => Number(outcome.odds)),
      ...combination.map((comb) => Number(comb.odds)),
    ];
    const payoutPerCombination =
      listOfOdds.reduce((accumulator, odds) => accumulator * odds, 1) *
      stakeAmountPerCombination;
    maxPayout += payoutPerCombination;
  }

  return maxPayout;
};

/**
 * Create map where we will store market type id as key and modelIds from SV as value
 * @param combo - Current combo
 * @returns map
 */
const createMarketTypeSVModelIdsMap = (combo: Bet[]): Map<string, string[]> => {
  const marketTypeModelIdMap = new Map<string, string[]>();

  for (const bet of combo) {
    const { marketTypeId, specialValues } = bet;

    // Initialize map entry if it doesn't exist
    if (!marketTypeModelIdMap.has(marketTypeId)) {
      marketTypeModelIdMap.set(marketTypeId, []);
    }

    if (specialValues?.length) {
      // Extract modelIds from specialValues and append to the corresponding marketTypeId
      const modelIds = specialValues
        .map((specialValue) => specialValue?.modelId)
        .filter(Boolean);
      marketTypeModelIdMap.get(marketTypeId)?.push(...modelIds);
    }
  }
  return marketTypeModelIdMap;
};

/**
 * Return boolean if one of the market type id keys has duplicated values of model ids.
 * It means that we have same market type for same participant on one event.
 * @param map - Map
 * @returns
 */
const hasDuplicateModelIds = (map: Map<string, string[]>): boolean => {
  return [...map.values()].some((modelIds) => {
    const uniqueModelIds = new Set(modelIds);
    return uniqueModelIds.size !== modelIds.length;
  });
};

/**
 * Generate combinations of outcomes by the given size (required hit count).
 * Outcomes from the same event cannot be in the combinations for system ways bets.
 * @param outcomes - Outcomes with details
 * @param size - Size of the combinations
 * @returns combinations
 */
const generateCombinations = (outcomes: Bet[], size: number): Bet[][] => {
  const result: Bet[][] = [];

  function generate(
    currentCombo: Bet[],
    start: number,
    usedEventIds: Set<string>,
  ): void {
    if (currentCombo.length === size) {
      result.push([...currentCombo]);
      return;
    }

    for (let i = start; i < outcomes.length; i++) {
      const currentOutcome = outcomes[i];
      const { eventId, marketTypeCombiningIds } = currentOutcome;

      if (!usedEventIds.has(eventId)) {
        currentCombo.push(currentOutcome);

        usedEventIds.add(eventId);

        generate(currentCombo, i + 1, usedEventIds);

        currentCombo.pop();
        usedEventIds.delete(eventId);
      } else {
        // Case when the outcome is from an already used event
        // Check if all of the market types in the current combination can combine with the new outcome
        const currentComboFromSameEvent = currentCombo.filter(
          (outcome) => outcome.eventId === eventId,
        );
        const canCombineMarketTypes = currentComboFromSameEvent.every(
          (outcome) => {
            const existingMarketTypeId = outcome.marketTypeId;
            return marketTypeCombiningIds.includes(existingMarketTypeId);
          },
        );

        // Add current outcome to current combo from same event to create map of [marketTypeId:string] : modelIds string[]
        const marketTypeSpecialValuesMap = createMarketTypeSVModelIdsMap([
          ...currentComboFromSameEvent,
          currentOutcome,
        ]);
        const canCombineMarketTypesWithSVModelIds = !hasDuplicateModelIds(
          marketTypeSpecialValuesMap,
        );

        if (canCombineMarketTypes && canCombineMarketTypesWithSVModelIds) {
          currentCombo.push(currentOutcome);

          generate(currentCombo, i + 1, usedEventIds);

          currentCombo.pop();
        }
      }
    }
  }

  generate([], 0, new Set<string>());
  return result;
};

/**
 *
 * @param stake
 * @param initialOdds
 * @param currOddWinProb
 * @param uniqueMarketMargin - Integer from 0 to 100 representing factor values from 0.00 to 1
 */
export const calculateCashoutAmount = ({
  stake,
  initialOdds,
  currOddWinProb,
  uniqueMarketMargin,
}: CalculateCashoutAmountParams): number =>
  stake * initialOdds * currOddWinProb * (uniqueMarketMargin / 100);
