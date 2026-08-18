/**
 * Canonical Quantitative Strategy and Observation Data Contracts
 * Shared between Research/UI workstation (Goldrush) and Strategy Execution (Goldrush2)
 */

export interface DigitTick {
  tickId?: string | number;
  timestamp: number;
  quote: number;
  digit: number;
  pipSize?: number;
}

export type StrategyValidationState =
  | 'UNVALIDATED'
  | 'SHADOW'
  | 'PROVISIONAL'
  | 'VALIDATED'
  | 'BLOCKED'
  | 'RETIRED';

export interface ExpectedValueMetrics {
  requiredProbability: number;
  observedProbability: number;
  edgePercentagePoint: number;
  expectedValue: number;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  sampleSize: number;
  wilsonCI?: {
    lower: number;
    upper: number;
  };
}

export interface StrategyObservation {
  timestamp: number;
  asset: string;
  tickId?: string | number;
  quote: number;
  digit?: number;

  state: {
    gap?: number;
    averageGap?: number;
    gapZScore?: number;
    gapPercentile?: number;

    velocity?: number;
    acceleration?: number;

    digitCounts?: number[];
    digitFrequencies?: number[];
    parityState?: 'even' | 'odd';
    parityStreak?: number;

    runLengthUp?: number;
    runLengthDown?: number;
  };

  strategy: {
    id: string;
    family: string;
    direction?: string;
    targets?: number[];
    duration?: number;
  };

  prediction: {
    probability?: number;
    requiredProbability?: number;
    expectedValue?: number;
    confidence?: number;
    sampleSize?: number;
    validationState?: StrategyValidationState;
  };

  execution?: {
    stake: number;
    exposure: number;
    status?: 'OPEN' | 'WON' | 'LOST' | 'CANCELLED';
    net?: number;
  };
}

export interface PayoffVector {
  comboId: string;
  comboLabel: string;
  legs: {
    contractType: string;
    barrier?: number;
    stake: number;
    multiplier: number;
    winDigits: number[];
  }[];
  digitPayouts: number[];
  digitNetPnL: number[];
  uniformEV: number;
  empiricalEV?: number;
  conditionalEV?: number;
  worstCaseReturn: number;
  bestCaseReturn: number;
  winDigitCount: number;
  breakevenThreshold?: number;
}

export interface CapitalRunwayState {
  startingCapital: number;
  currentBalance: number;
  availableCapital: number;
  openExposure: number;
  reservedCapital: number;
  realizedPnL: number;
  protectedCapital: number;
  houseMoneyCapital: number;
  currentLossStreak: number;
  currentWinStreak: number;
  nextStake: number;
  nextMaxLoss: number;
}

export interface ExecutionGateDecision {
  allowed: boolean;
  reason: string;
  riskCategory: 'LOW' | 'MEDIUM' | 'HIGH' | 'PROHIBITED';
  validationState: StrategyValidationState;
}

export interface BotStrategyDefinition {
  id: string;
  name: string;
  family:
    | 'MATCHES'
    | 'OVER_UNDER'
    | 'RISE_FALL'
    | 'PARITY'
    | 'GAP'
    | 'MULTILEG'
    | 'LADDER';
  contractType: string;
  lookback?: number;
  duration?: number;
  legs?: number;
  triggerDefinition?: string;
  theoreticalProbability?: number;
  requiredProbability?: number;
  theoreticalEV?: number;
  claimedEdge?: number | null;
  validationState: StrategyValidationState;
  sampleSize?: number;
  walkForwardStatus?: 'UNTESTED' | 'PASSED' | 'FAILED' | 'INCONCLUSIVE';
  maxExposure?: number;
  sizingPolicy?: string;
  xml: string;
}

export function calculateRequiredProbability(multiplier: number): number {
  if (multiplier <= 0) return 1.0;
  return 1 / multiplier;
}

export function calculateExpectedValue(observedProbability: number, multiplier: number): number {
  return observedProbability * multiplier - 1;
}
