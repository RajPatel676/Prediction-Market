'use client';

import Link from 'next/link';
import TransactionHandler from './TransactionHandler';
import { voteCall } from '../calls';
import { Gift, Bookmark, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';

interface PredictionCardProps {
    id: number;
    question: string;
    options: string[];
    votes: bigint[];
    deadline: number;
    resolved: boolean;
    winningOption: number;
    onVoteComplete?: () => void;
}

export default function PredictionCard({
    id,
    question,
    options,
    votes,
    deadline,
    resolved,
    winningOption,
    onVoteComplete
}: PredictionCardProps) {
    // Calculate total votes
    const totalVotes = votes.reduce((acc, curr) => acc + Number(curr), 0);

    // Calculate percentage for each option
    const getPercentage = (votes: bigint) => {
        if (totalVotes === 0) return 0;
        return Math.round((Number(votes) / totalVotes) * 100);
    };

    const isExpired = Date.now() / 1000 > deadline;
    const yesPercentage = getPercentage(votes[0]);
    const noPercentage = getPercentage(votes[1]);

    // Format deadline date
    const deadlineDate = new Date(deadline * 1000);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let timeLeft;
    if (diffDays > 0) {
        timeLeft = `${diffDays} day${diffDays > 1 ? 's' : ''} left`;
    } else if (diffTime > 0) {
        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
        timeLeft = `${diffHours} hour${diffHours > 1 ? 's' : ''} left`;
    } else if (resolved) {
        timeLeft = 'Resolved';
    } else {
        timeLeft = 'Expired';
    }

    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100 flex flex-col h-full">
            <div className="p-6 flex-1">
                <div className="flex items-start justify-between gap-6 mb-5">
                    <Link href={`/prediction/${id}`} className="group flex-1">
                        {/* add a tooltip to the question */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3rem]">
                                        {question}
                                    </h3>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{question}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </Link>
                    <div className="flex flex-shrink-0 items-center justify-center w-20 h-20 relative">
                        {/* Background circle */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="transparent"
                                stroke="#374151"
                                strokeWidth="8"
                                strokeOpacity="0.2"
                            />
                            {/* Progress arc - strokeDasharray makes it fill exactly based on percentage */}
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="transparent"
                                stroke={yesPercentage >= 50 ? '#10B981' : '#EF4444'}
                                strokeWidth="8"
                                strokeDasharray={`${(yesPercentage / 100) * 283} 283`}
                                strokeDashoffset="0"
                                strokeLinecap="round"
                                transform="rotate(-90 50 50)"
                            />
                        </svg>
                        <div className="text-center z-10">
                            <div className={`text-xl font-bold ${yesPercentage >= 50 ? 'text-emerald-600' : 'text-rose-600'}`}>{yesPercentage}%</div>
                            <div className="text-xs text-gray-400">chance</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={16} className="text-emerald-500" />
                            <span className="text-sm font-medium">Yes</span>
                        </div>
                        <span className="text-sm font-semibold">{yesPercentage}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-emerald-500"
                            style={{ width: `${yesPercentage || 0}%` }}
                        />
                    </div>

                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <TrendingDown size={16} className="text-rose-500" />
                            <span className="text-sm font-medium">No</span>
                        </div>
                        <span className="text-sm font-semibold">{noPercentage}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-rose-500"
                            style={{ width: `${noPercentage || 0}%` }}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between text-gray-500 text-sm pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span className={`
                            ${isExpired ? 'text-rose-500 font-medium' : 'text-gray-500'}
                            ${resolved ? 'text-emerald-500 font-medium' : ''}
                        `}>
                            {timeLeft}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="font-medium">${totalVotes}m</span>
                        <div className="flex items-center gap-2">
                            <button className="hover:text-blue-600 transition-colors p-1.5 rounded-full hover:bg-blue-50">
                                <Gift size={16} />
                            </button>
                            <button className="hover:text-blue-600 transition-colors p-1.5 rounded-full hover:bg-blue-50">
                                <Bookmark size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {!resolved && !isExpired && (
                <div className="px-4 pb-4 grid grid-cols-2 mt-auto gap-4">
                    <TransactionHandler
                        calls={[voteCall(BigInt(id), 0)]}
                        buttonText="Buy Yes ↑"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white py-4 font-medium transition-all text-base"
                        onComplete={onVoteComplete}
                    />
                    <TransactionHandler
                        calls={[voteCall(BigInt(id), 1)]}
                        buttonText="Buy No ↓"
                        className="bg-rose-500 hover:bg-rose-600 text-white py-4 font-medium transition-all text-base"
                        onComplete={onVoteComplete}
                    />
                </div>
            )}

            {(resolved || isExpired) && (
                <div className={`py-4 text-center font-medium ${resolved ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'} text-base`}>
                    {resolved ? `Resolved: ${options[winningOption]} won` : 'Waiting for resolution'}
                </div>
            )}
        </div>
    );
} 