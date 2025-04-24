'use client';

import { useState } from 'react';
import { usePredictionMarket } from '../utils/contract';
import { createPredictionCall } from '../calls';
import TransactionHandler from './TransactionHandler';
import { CalendarClock, BrainCircuit, CheckCircle2 } from 'lucide-react';

interface PredictionFormProps {
    onSuccess?: () => void;
}

export default function PredictionForm({ onSuccess }: PredictionFormProps) {
    const { isConfirming, isConfirmed, hash } = usePredictionMarket();
    const [newPrediction, setNewPrediction] = useState({
        question: '',
        options: ['Yes', 'No'],
        deadline: Math.floor(Date.now() / 1000) + 86400 // 24 hours from now
    });

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700 mb-1">
                    <BrainCircuit size={18} className="text-blue-600" />
                    <label className="text-sm font-medium">
                        Prediction Question
                    </label>
                </div>
                <textarea
                    value={newPrediction.question}
                    onChange={(e) =>
                        setNewPrediction({ ...newPrediction, question: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-3 text-gray-800 min-h-[100px] resize-none"
                    placeholder="Will ETH reach $5000 by the end of 2024?"
                    disabled={isConfirming}
                />
                <p className="text-xs text-gray-500">
                    Make your question clear and specific for better predictions
                </p>
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700 mb-1">
                    <CalendarClock size={18} className="text-blue-600" />
                    <label className="text-sm font-medium">
                        Prediction Deadline
                    </label>
                </div>
                <input
                    type="datetime-local"
                    value={new Date(newPrediction.deadline * 1000).toISOString().slice(0, 16)}
                    onChange={(e) => {
                        const date = new Date(e.target.value);
                        setNewPrediction({
                            ...newPrediction,
                            deadline: Math.floor(date.getTime() / 1000)
                        });
                    }}
                    className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-3 text-gray-800"
                    min={new Date().toISOString().slice(0, 16)}
                    disabled={isConfirming}
                />
                <p className="text-xs text-gray-500">
                    Choose a specific date and time when this prediction should be resolved
                </p>
            </div>

            <div className="pt-2">
                <TransactionHandler
                    calls={[createPredictionCall(
                        newPrediction.question,
                        newPrediction.options,
                        newPrediction.deadline
                    )]}
                    buttonText="Create Prediction"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 text-base"
                    onComplete={() => {
                        setNewPrediction({
                            question: '',
                            options: ['Yes', 'No'],
                            deadline: Math.floor(Date.now() / 1000) + 86400
                        });
                        if (onSuccess) onSuccess();
                    }}
                />
            </div>

            {isConfirming && (
                <div className="flex items-center justify-center gap-2 text-blue-600 py-2 animate-pulse">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    <p className="text-sm">Processing transaction...</p>
                </div>
            )}

            {isConfirmed && hash && (
                <div className="bg-emerald-50 p-4 rounded-lg flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-emerald-600 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-emerald-800">Transaction confirmed!</p>
                        <p className="text-xs text-emerald-600">
                            Hash: <span className="font-mono">{hash.slice(0, 10)}...</span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
} 