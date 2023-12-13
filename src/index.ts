/**
 * Calculates total odds for the given array of odds.
 * @param listOfOdds odds array
 * @returns
 */
export const calculateTotalOddsForNormalBettingSlip = (
  listOfOdds: number[]
): number => {
  return listOfOdds.reduce((accumulator, odds) => accumulator * odds, 1)
}
