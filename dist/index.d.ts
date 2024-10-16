type Bet = {
    outcomeId: string;
    eventId: string;
    odds: string;
    singlesStakeAmount?: number;
    banker?: boolean;
    marketTypeId: string;
    marketTypeCombiningIds: string[];
    specialValues?: {
        modelId: string | null;
    }[];
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
type CalculateCashoutAmountParams = {
    stake: number;
    initialOdds: number;
    currOddWinProb: number;
    uniqueMarketMargin: number;
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
 * @param maxWinning - Max winning.
 * @returns max stake amount
 */
declare const calculateMaxStakeAmountForNormalBettingSlip: (totalOdds: number, maxWinning: number) => number;
/**
 * Generate combination type and number of combinations for system and system ways betting slips.
 * @param bets - Bets
 * @param lastCombination - Flag for getting last combination size
 * @returns record with combination type and number of combinations
 */
declare const getCombinations: (bets: Bet[], lastCombination?: boolean) => Record<string, number>;
/**
 * Calculate total max payout, total stake amount and max total stake amount.
 * If the calculated max payout is higher then max possible payout, then max payout is set to max possible payout.
 * @param betSlipRequest - Bet Slip Request
 * @param maxWinning - Max winning
 * @param maxStakeAmount - Max Stake Amount
 * @returns max payout and total stake amount
 */
declare const calculateMaxPayout: (betSlipRequest: BetSlipRequest, maxWinning: number, maxStakeAmount: number) => BetSlipMaxPayoutResult;
/**
 * Get betting type by the given number of bets.
 * @param numberOfBets - Number of bets
 * @returns betting type value
 */
declare const getBettingType: (numberOfBets: number) => string;
/**
 *
 * @param stake
 * @param initialOdds
 * @param currOddWinProb
 * @param uniqueMarketMargin - Integer from 0 to 100 representing factor values from 0.00 to 1
 */
declare const calculateCashoutAmount: ({ stake, initialOdds, currOddWinProb, uniqueMarketMargin, }: CalculateCashoutAmountParams) => number;

export { calculateCashoutAmount, calculateMaxPayout, calculateMaxStakeAmountForNormalBettingSlip, calculateTotalOddsForNormalBettingSlip, getBettingType, getCombinations };
