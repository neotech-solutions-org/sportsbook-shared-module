// src/types.ts
var BETTING_TYPES = ["Single", "Double", "Treble"];
var MAX_PAYOUT = 1e4;
var MAX_STAKE_AMOUNT = 1499;

// src/index.ts
var calculateTotalOddsForNormalBettingSlip = (bets) => {
  const listOfOdds = bets.map((bet) => bet.odds);
  return listOfOdds.reduce((accumulator, odds) => accumulator * odds, 1);
};
var calculateMaxStakeAmountForNormalBettingSlip = (totalOdds, limit = MAX_PAYOUT) => {
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
var getCombinations = (bets) => {
  const betsWithoutBankers = bets.filter((bet) => !bet.banker);
  const combinations = {};
  const numberOfBankers = bets.length - betsWithoutBankers.length;
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
var calculateMaxPayout = (betSlipRequest, limit = MAX_PAYOUT) => {
  let maxPayout = 0;
  let totalStakeAmount = 0;
  let maxTotalStakeAmount = 0;
  const { bets, systemBetTypes, stakeAmount } = betSlipRequest;
  const bankerOutcomes = bets.filter((bet) => bet.banker);
  const combinationOutcomes = bets.filter((bet) => !bet.banker);
  for (const bet of bets) {
    if (!bet.singlesStakeAmount)
      continue;
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
        requiredHitCount
      );
      const payout = calculateSystemMaxPayout(
        combinations,
        stakeAmountPerCombination,
        bankerOutcomes
      );
      maxPayout += payout < limit ? payout : limit;
      totalStakeAmount += stakeAmountPerCombination * combinations.length;
      maxTotalStakeAmount += MAX_STAKE_AMOUNT;
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
      ...bankerOutcomes.map((outcome) => outcome.odds),
      ...combination.map((comb) => comb.odds)
    ];
    const payoutPerCombination = listOfOdds.reduce((accumulator, odds) => accumulator * odds, 1) * stakeAmountPerCombination;
    maxPayout += payoutPerCombination;
  }
  return maxPayout;
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
      if (!usedEventIds.has(currentOutcome.eventId)) {
        currentCombo.push(currentOutcome);
        usedEventIds.add(currentOutcome.eventId);
        generate(currentCombo, i + 1, usedEventIds);
        currentCombo.pop();
        usedEventIds.delete(currentOutcome.eventId);
      }
    }
  }
  generate([], 0, /* @__PURE__ */ new Set());
  return result;
};
export {
  calculateMaxPayout,
  calculateMaxStakeAmountForNormalBettingSlip,
  calculateTotalOddsForNormalBettingSlip,
  getBettingType,
  getCombinations
};
//# sourceMappingURL=index.mjs.map