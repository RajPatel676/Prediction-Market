import {
  PREDICTION_MARKET_ADDRESS,
  PREDICTION_MARKET_ABI,
} from "./utils/contract";
import { type Address } from "viem";

export const createPredictionCall = (
  question: string,
  options: string[],
  deadline: number
) => ({
  address: PREDICTION_MARKET_ADDRESS as Address,
  abi: PREDICTION_MARKET_ABI,
  functionName: "createPrediction",
  args: [question, options, BigInt(deadline)],
});

export const voteCall = (predictionId: bigint, optionIndex: number) => ({
  address: PREDICTION_MARKET_ADDRESS as Address,
  abi: PREDICTION_MARKET_ABI,
  functionName: "vote",
  args: [predictionId, BigInt(optionIndex)],
});

export const resolvePredictionCall = (
  predictionId: bigint,
  winningOption: number
) => ({
  address: PREDICTION_MARKET_ADDRESS as Address,
  abi: PREDICTION_MARKET_ABI,
  functionName: "resolvePrediction",
  args: [predictionId, BigInt(winningOption)],
});
