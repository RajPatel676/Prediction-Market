'use client';

import { useState, useEffect } from 'react';
import { usePredictionMarket } from '../utils/contract';
import PredictionCard from './PredictionCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

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

export default function PredictionsDashboard() {
    const [activeTab, setActiveTab] = useState('active');
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { predictionCount, getPredictionDetails, isConfirmed } = usePredictionMarket();

    useEffect(() => {
        const fetchPredictions = async () => {
            if (!predictionCount) return;

            setIsLoading(true);
            try {
                const count = Number(predictionCount);
                const predictionPromises = Array.from({ length: count }, (_, i) =>
                    getPredictionDetails(i)
                );
                const predictionResults = await Promise.all(predictionPromises);
                setPredictions(predictionResults as Prediction[]);
            } catch (error) {
                console.error('Error fetching predictions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPredictions();
    }, [predictionCount, getPredictionDetails, isConfirmed]);

    const refreshPredictions = async () => {
        if (predictionCount) {
            const count = Number(predictionCount);
            const results = await Promise.all(
                Array.from({ length: count }, (_, i) =>
                    getPredictionDetails(i)
                )
            );
            setPredictions(results as Prediction[]);
        }
    };

    // Filter predictions based on tab
    const activePredictions = predictions.filter(p => !p.resolved);
    const closedPredictions = predictions.filter(p => p.resolved);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Predictions</h1>
            </div>

            <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-white rounded-lg mb-8 p-1 shadow-sm border border-gray-100">
                    <TabsTrigger
                        value="active"
                        className="rounded-md py-2 px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                        Active
                    </TabsTrigger>
                    <TabsTrigger
                        value="closed"
                        className="rounded-md py-2 px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                        Closed
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="mt-0">
                    {isLoading ? (
                        <div className="text-center py-8 text-gray-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            Loading predictions...
                        </div>
                    ) : activePredictions.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-100">
                            <h3 className="text-xl font-medium text-gray-800 mb-2">No active predictions</h3>
                            <p className="text-gray-500">Use the + button to create a new prediction.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {activePredictions.map((prediction) => (
                                <PredictionCard
                                    key={prediction.id}
                                    {...prediction}
                                    onVoteComplete={refreshPredictions}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="closed" className="mt-0">
                    {isLoading ? (
                        <div className="text-center py-8 text-gray-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            Loading predictions...
                        </div>
                    ) : closedPredictions.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-100">
                            <h3 className="text-xl font-medium text-gray-800 mb-2">No closed predictions</h3>
                            <p className="text-gray-500">Predictions will appear here once they&apos;re resolved.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {closedPredictions.map((prediction) => (
                                <PredictionCard
                                    key={prediction.id}
                                    {...prediction}
                                    onVoteComplete={refreshPredictions}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
} 