'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { usePredictionMarket } from '@/app/utils/contract';
import { voteCall } from '@/app/calls';
import TransactionHandler from '@/app/components/TransactionHandler';

interface Prediction {
    id: number;
    question: string;
    creator: string;
    options: string[];
    votes: bigint[];
    deadline: number;
    resolved: boolean;
    winningOption: number;
}

export default function PredictionPage() {
    const params = useParams();
    const predictionId = params.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : '0';
    const { getPredictionDetails } = usePredictionMarket();
    const [prediction, setPrediction] = useState<Prediction | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    useEffect(() => {
        const fetchPrediction = async () => {
            try {
                const details = await getPredictionDetails(Number(predictionId));
                setPrediction(details as unknown as Prediction);
            } catch (error) {
                console.error('Error fetching prediction:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPrediction();
    }, [predictionId, getPredictionDetails]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading prediction...</p>
                </div>
            </div>
        );
    }

    if (!prediction) {
        return (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-100">
                <h3 className="text-xl font-medium text-gray-800 mb-2">Prediction not found</h3>
                <p className="text-gray-500">The prediction you&apos;re looking for doesn&apos;t exist.</p>
            </div>
        );
    }

    const isExpired = Date.now() / 1000 > prediction.deadline;
    const totalVotes = prediction.votes.reduce((acc, curr) => acc + Number(curr), 0);

    const getPercentage = (votes: bigint) => {
        if (totalVotes === 0) return 0;
        return Math.round((Number(votes) / totalVotes) * 100);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Prediction Details */}
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">{prediction.question}</h1>
                <div className="space-y-6">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <span>Created by:</span>
                            <span className="font-medium text-gray-800">{prediction.creator.slice(0, 6)}...{prediction.creator.slice(-4)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>Deadline:</span>
                            <span className="font-medium text-gray-800">
                                {new Date(prediction.deadline * 1000).toLocaleString()}
                                {isExpired && <span className="ml-2 text-rose-500">(Expired)</span>}
                            </span>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Results</h2>
                        <div className="space-y-4">
                            {prediction.options.map((option, index) => {
                                const percentage = getPercentage(prediction.votes[index]);
                                return (
                                    <div key={index} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-gray-800">{option}</span>
                                            <div className="flex items-center gap-4">
                                                <span className="text-gray-500">{Number(prediction.votes[index])} votes</span>
                                                <span className="font-semibold text-gray-800">{percentage}%</span>
                                            </div>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${index === 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Voting Section */}
            {prediction.resolved ? (
                <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                    <div className="bg-emerald-50 p-6 rounded-xl">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            This prediction has been resolved
                        </h2>
                        <p className="text-emerald-600 font-medium">
                            Winner: {prediction.options[prediction.winningOption]}
                        </p>
                    </div>
                </div>
            ) : isExpired ? (
                <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                    <div className="bg-amber-50 p-6 rounded-xl">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            Voting period has ended
                        </h2>
                        <p className="text-amber-600">
                            Waiting for resolution...
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Cast Your Vote</h2>
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            {prediction.options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedOption(index)}
                                    className={`py-4 px-6 rounded-xl border-2 transition-all duration-200 ${selectedOption === index
                                        ? index === 0
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                            : 'border-rose-500 bg-rose-50 text-rose-700'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-800 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="text-lg font-medium">{option}</span>
                                </button>
                            ))}
                        </div>

                        {selectedOption !== null && (
                            <div>
                                <TransactionHandler
                                    calls={[voteCall(BigInt(prediction.id), selectedOption)]}
                                    buttonText={`Vote for ${prediction.options[selectedOption]}`}
                                    className={`w-full py-4 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200 ${selectedOption === 0
                                        ? 'bg-emerald-500 hover:bg-emerald-600'
                                        : 'bg-rose-500 hover:bg-rose-600'
                                        } text-white`}
                                    onComplete={() => {
                                        setSelectedOption(null);
                                        // Refresh prediction details
                                        getPredictionDetails(Number(predictionId))
                                            .then(details => setPrediction(details as unknown as Prediction));
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 