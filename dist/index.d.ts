type BetType = {
    outcomeId: string;
    eventId: string;
    odds: number;
    singlesStakeAmount?: number;
    banker?: boolean;
};
type SystemBetType = {
    requiredHitCount: number;
    stakeAmountPerCombination: number;
};
type BetSlipRequest = {
    bets: BetType[];
    stakeAmount?: number;
    systemBetTypes?: SystemBetType[];
};
type BetSlipMaxPayoutResult = {
    maxPayout: number;
    totalStakeAmount: number;
};

/**
 * Calculates total odds from the given bet types.
 * @param bets - Bet types
 * @returns total odds
 */
declare const calculateTotalOddsForNormalBettingSlip: (bets: BetType[]) => number;
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
declare const getCombinations: (bets: BetType[]) => Record<string, number>;
/**
 * Calculate total max payout and total stake amount.
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
