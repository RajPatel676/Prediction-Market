'use client';

import { useCallback } from 'react';
import {
    Transaction,
    TransactionButton,
    TransactionSponsor,
    TransactionStatus,
    TransactionStatusAction,
    TransactionStatusLabel,
    type LifecycleStatus,
} from '@coinbase/onchainkit/transaction';
import { type Abi, type Address } from 'viem';

const BASE_SEPOLIA_CHAIN_ID = 84532;

interface TransactionHandlerProps {
    calls: {
        address: Address;
        abi: Abi;
        functionName: string;
        args?: readonly unknown[];
    }[];
    onComplete?: () => void;
    buttonText?: string;
    className?: string;
}

export default function TransactionHandler({ calls, onComplete, buttonText, className }: TransactionHandlerProps) {
    const handleOnStatus = useCallback((status: LifecycleStatus) => {
        console.log('Transaction status:', status);
        if (status.statusName === 'success' && onComplete) {
            onComplete();
        }
    }, [onComplete]);

    return (
        <Transaction
            chainId={BASE_SEPOLIA_CHAIN_ID}
            calls={calls}
            onStatus={handleOnStatus}
        >
            <div className="flex flex-col gap-2">
                <TransactionButton text={buttonText} className={className} />
                <TransactionStatus>
                    <TransactionStatusLabel />
                    <TransactionStatusAction />
                </TransactionStatus>
                <TransactionSponsor />
            </div>
        </Transaction>
    );
} 