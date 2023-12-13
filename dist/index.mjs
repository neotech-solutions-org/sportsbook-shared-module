// src/index.ts
var calculateTotalOddsForNormalBettingSlip = (listOfOdds) => {
  return listOfOdds.reduce((accumulator, odds) => accumulator * odds, 1);
};
export {
  calculateTotalOddsForNormalBettingSlip
};
//# sourceMappingURL=index.mjs.map