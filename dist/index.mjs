// src/types.ts
var BETTING_TYPES = ["Single", "Double", "Treble"];

// src/index.ts
var calculateTotalOddsForNormalBettingSlip = (bets) => {
  const listOfOdds = bets.map((bet) => Number(bet.odds));
  return listOfOdds.reduce((accumulator, odds) => accumulator * odds, 1);
};
var calculateMaxStakeAmountForNormalBettingSlip = (totalOdds, maxWinning) => {
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
var getCombinations = (bets, lastCombination = false) => {
  const betsWithoutBankers = bets.filter((bet) => !bet.banker);
  const combinations = {};
  const numberOfBankers = bets.length - betsWithoutBankers.length;
  if (lastCombination) {
    let numberOfCombinations;
    let lastSize = betsWithoutBankers.length;
    while ((!numberOfCombinations || numberOfCombinations === 0) && lastSize > 0) {
      numberOfCombinations = generateCombinations(
        betsWithoutBankers,
        lastSize
      ).length;
      if (numberOfCombinations > 0) {
        combinations[getBettingType(numberOfBankers + lastSize)] = numberOfCombinations;
        break;
      }
      lastSize -= 1;
    }
    return combinations;
  }
  for (let i = 1; i <= betsWithoutBankers.length; i++) {
    const numberOfCombinations = generateCombinations(
      betsWithoutBankers,
      i
    ).length;
    if (numberOfCombinations > 0) {
      combinations[getBettingType(numberOfBankers + i)] = numberOfCombinations;
    }
  }
  return combinations;
};
var calculateMaxPayout = (betSlipRequest, maxWinning, maxStakeAmount) => {
  let maxPayout = 0;
  let totalStakeAmount = 0;
  let maxTotalStakeAmount = 0;
  const { bets, betTypes } = betSlipRequest;
  for (const bet of bets) {
    if (!bet.singlesStakeAmount)
      continue;
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
        requiredHitCount
      );
      const payout = calculateSystemMaxPayout(
        combinations,
        stakeAmountPerCombination,
        bankerOutcomes
      );
      maxPayout += payout < maxWinning ? payout : maxWinning;
      totalStakeAmount += stakeAmountPerCombination * combinations.length;
      maxTotalStakeAmount += maxStakeAmount;
    }
  }
  return { maxPayout, totalStakeAmount, maxTotalStakeAmount };
};
var getBettingType = (numberOfBets) => {
  return BETTING_TYPES[numberOfBets - 1] ?? `${numberOfBets} Fold`;
};
var calculateSystemMaxPayout = (combinations, stakeAmountPerCombination, bankerOutcomes) => {
  let maxPayout = 0;
  for (const combination of combinations) {
    const listOfOdds = [
      ...bankerOutcomes.map((outcome) => Number(outcome.odds)),
      ...combination.map((comb) => Number(comb.odds))
    ];
    const payoutPerCombination = listOfOdds.reduce((accumulator, odds) => accumulator * odds, 1) * stakeAmountPerCombination;
    maxPayout += payoutPerCombination;
  }
  return maxPayout;
};
var createMarketTypeSVModelIdsMap = (combo) => {
  const marketTypeModelIdMap = /* @__PURE__ */ new Map();
  for (const bet of combo) {
    const { marketTypeId, specialValues } = bet;
    if (!marketTypeModelIdMap.has(marketTypeId)) {
      marketTypeModelIdMap.set(marketTypeId, []);
    }
    if (specialValues?.length) {
      const modelIds = specialValues.map((specialValue) => specialValue?.modelId).filter(Boolean);
      marketTypeModelIdMap.get(marketTypeId)?.push(...modelIds);
    }
  }
  return marketTypeModelIdMap;
};
var hasDuplicateModelIds = (map) => {
  return [...map.values()].some((modelIds) => {
    const uniqueModelIds = new Set(modelIds);
    return uniqueModelIds.size !== modelIds.length;
  });
};
var generateCombinations = (outcomes, size) => {
  const result = [];
  function generate(currentCombo, start, usedEventIds) {
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
        const currentComboFromSameEvent = currentCombo.filter(
          (outcome) => outcome.eventId === eventId
        );
        const canCombineMarketTypes = currentComboFromSameEvent.every(
          (outcome) => {
            const existingMarketTypeId = outcome.marketTypeId;
            return marketTypeCombiningIds.includes(existingMarketTypeId);
          }
        );
        const marketTypeSpecialValuesMap = createMarketTypeSVModelIdsMap([
          ...currentComboFromSameEvent,
          currentOutcome
        ]);
        const canCombineMarketTypesWithSVModelIds = !hasDuplicateModelIds(
          marketTypeSpecialValuesMap
        );
        if (canCombineMarketTypes && canCombineMarketTypesWithSVModelIds) {
          currentCombo.push(currentOutcome);
          generate(currentCombo, i + 1, usedEventIds);
          currentCombo.pop();
        }
      }
    }
  }
  generate([], 0, /* @__PURE__ */ new Set());
  return result;
};
var calculateCashoutAmount = ({
  stake,
  initialOdds,
  currOddWinProb,
  uniqueMarketMargin
}) => stake * initialOdds * currOddWinProb * (uniqueMarketMargin / 100);
export {
  calculateCashoutAmount,
  calculateMaxPayout,
  calculateMaxStakeAmountForNormalBettingSlip,
  calculateTotalOddsForNormalBettingSlip,
  getBettingType,
  getCombinations
};
//# sourceMappingURL=index.mjs.map