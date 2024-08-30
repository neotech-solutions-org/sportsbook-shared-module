var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  calculateMaxPayout: () => calculateMaxPayout,
  calculateMaxStakeAmountForNormalBettingSlip: () => calculateMaxStakeAmountForNormalBettingSlip,
  calculateTotalOddsForNormalBettingSlip: () => calculateTotalOddsForNormalBettingSlip,
  getBettingType: () => getBettingType,
  getCombinations: () => getCombinations
});
module.exports = __toCommonJS(src_exports);

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
        const canCombine = currentComboFromSameEvent.every((outcome) => {
          const existingMarketTypeId = outcome.marketTypeId;
          return marketTypeCombiningIds.includes(existingMarketTypeId);
        });
        if (canCombine) {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  calculateMaxPayout,
  calculateMaxStakeAmountForNormalBettingSlip,
  calculateTotalOddsForNormalBettingSlip,
  getBettingType,
  getCombinations
});
//# sourceMappingURL=index.js.map