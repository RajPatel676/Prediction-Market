import {
  useContractRead,
  useWriteContract,
  usePublicClient,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useCallback } from "react";
import { getConfig } from "../wagmi";

export const PREDICTION_MARKET_ADDRESS =
  "0x8449064a1bFD716a7046e3B9E05448aB19A7E5ae";

export const PREDICTION_MARKET_ABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_question",
        type: "string",
      },
      {
        internalType: "string[]",
        name: "_options",
        type: "string[]",
      },
      {
        internalType: "uint256",
        name: "_deadline",
        type: "uint256",
      },
    ],
    name: "createPrediction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "question",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string[]",
        name: "options",
        type: "string[]",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
    ],
    name: "PredictionCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "winningOption",
        type: "uint256",
      },
    ],
    name: "PredictionResolved",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_winningOption",
        type: "uint256",
      },
    ],
    name: "resolvePrediction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_option",
        type: "uint256",
      },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "voter",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "option",
        type: "uint256",
      },
    ],
    name: "Voted",
    type: "event",
  },
  {
    inputs: [],
    name: "getPredictions",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "creator",
            type: "address",
          },
          {
            internalType: "string",
            name: "question",
            type: "string",
          },
          {
            internalType: "string[]",
            name: "options",
            type: "string[]",
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "resolved",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "winningOption",
            type: "uint256",
          },
        ],
        internalType: "struct PredictionMarket.PredictionView[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
    ],
    name: "getVotes",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "predictionCounter",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "predictions",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "creator",
        type: "address",
      },
      {
        internalType: "string",
        name: "question",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "resolved",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "winningOption",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export function usePredictionMarket() {
  const config = getConfig();
  const publicClient = usePublicClient();
  const { writeContract, data: hash } = useWriteContract({ config });
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const { data: predictionCount } = useContractRead({
    address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
    abi: PREDICTION_MARKET_ABI,
    functionName: "predictionCounter",
  });

  // Create a prediction
  const createPrediction = async (
    question: string,
    options: string[],
    deadline: number
  ) => {
    return writeContract({
      address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
      abi: PREDICTION_MARKET_ABI,
      functionName: "createPrediction",
      args: [question, options, BigInt(deadline)],
    });
  };

  // Vote for a prediction
  const vote = async (predictionId: bigint, optionIndex: number) => {
    return writeContract({
      address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
      abi: PREDICTION_MARKET_ABI,
      functionName: "vote",
      args: [predictionId, BigInt(optionIndex)],
    });
  };

  // Resolve a prediction
  const resolvePrediction = async (
    predictionId: bigint,
    winningOption: number
  ) => {
    return writeContract({
      address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
      abi: PREDICTION_MARKET_ABI,
      functionName: "resolvePrediction",
      args: [predictionId, BigInt(winningOption)],
    });
  };

  // Get prediction details
  const getPredictionDetails = useCallback(
    async (id: number) => {
      const predictions = (await publicClient.readContract({
        address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
        abi: PREDICTION_MARKET_ABI,
        functionName: "getPredictions",
      })) as Array<{
        id: bigint;
        creator: `0x${string}`;
        question: string;
        options: string[];
        deadline: bigint;
        resolved: boolean;
        winningOption: bigint;
      }>;

      const prediction = predictions[id];
      if (!prediction) throw new Error("Prediction not found");

      const votes = (await publicClient.readContract({
        address: PREDICTION_MARKET_ADDRESS as `0x${string}`,
        abi: PREDICTION_MARKET_ABI,
        functionName: "getVotes",
        args: [BigInt(id)],
      })) as bigint[];

      return {
        id,
        creator: prediction.creator,
        question: prediction.question,
        options: prediction.options,
        votes,
        deadline: Number(prediction.deadline),
        resolved: prediction.resolved,
        winningOption: Number(prediction.winningOption),
      };
    },
    [publicClient]
  );

  return {
    predictionCount,
    createPrediction,
    vote,
    resolvePrediction,
    getPredictionDetails,
    isConfirming,
    isConfirmed,
    hash,
  };
}
