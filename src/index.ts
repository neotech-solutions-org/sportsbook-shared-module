export const calculateTotalOddsForNormalBettingSlip = (
  listOfOdds: number[]
): number => {
  return listOfOdds.reduce((accumulator, odds) => accumulator * odds, 1)
}
