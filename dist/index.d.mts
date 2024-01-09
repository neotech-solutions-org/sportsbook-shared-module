type Bet = {
    outcomeId: string;
    eventId: string;
    odds: string;
    singlesStakeAmount?: number;
    banker?: boolean;
};
type BetType = {
    requiredHitCount: number;
    stakeAmountPerCombination: number;
};
type BetSlipRequest = {
    bets: Bet[];
    betTypes?: BetType[];
};
type BetSlipMaxPayoutResult = {
    maxPayout: number;
    totalStakeAmount: number;
    maxTotalStakeAmount: number;
};

/**
 * Calculates total odds from the given bets.
 * @param bets - Bets
 * @returns total odds
 */
declare const calculateTotalOddsForNormalBettingSlip: (bets: Bet[]) => number;
/**
 * Calculate max stake amount.
 * @param totalOdds - Total odds.
 * @param limit - Max payout limit.
 * @returns max stake amount
 */
declare const calculateMaxStakeAmountForNormalBettingSlip: (totalOdds: number, limit?: number) => number;
/**
 * Generate combination type and number of combinations for system and system ways betting slips.
 * @param bets - Bets
 * @returns record with combination type and number of combinations
 */
declare const getCombinations: (bets: Bet[]) => Record<string, number>;
/**
 * Calculate total max payout, total stake amount and max total stake amount.
 * If the calculated max payout is higher then max possible payout, then max payout is set to max possible payout.
 * @returns max payout and total stake amount
 */
declare const calculateMaxPayout: (betSlipRequest: BetSlipRequest, limit?: number) => BetSlipMaxPayoutResult;
/**
 * Get betting type by the given number of bets.
 * @param numberOfBets - Number of bets
 * @returns betting type value
 */
declare const getBettingType: (numberOfBets: number) => string;

export { calculateMaxPayout, calculateMaxStakeAmountForNormalBettingSlip, calculateTotalOddsForNormalBettingSlip, getBettingType, getCombinations };
