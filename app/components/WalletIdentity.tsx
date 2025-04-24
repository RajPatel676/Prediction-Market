'use client';

import { useState } from 'react';
import { Avatar, Address } from '@coinbase/onchainkit/identity';
import { ConnectWallet, Wallet } from '@coinbase/onchainkit/wallet';
import { useAccount, useDisconnect, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { ChevronDown, LogOut } from 'lucide-react';


function generateGradientColors(address: string) {
    // Use parts of the address to generate unique colors
    const color1 = '#' + address.slice(2, 8);
    const color2 = '#' + address.slice(-6);
    return { color1, color2 };
}

export default function WalletIdentity() {
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const { data: balance } = useBalance({
        address: address as `0x${string}`,
    });
    const [showPopup, setShowPopup] = useState(false);

    if (!isConnected || !address) {
        return (
            <Wallet>
                <ConnectWallet text="Connect Wallet" />
            </Wallet>
        );
    }

    const { color1, color2 } = generateGradientColors(address);
    const formattedBalance = balance ? parseFloat(formatEther(balance.value)).toFixed(4) : '0.0000';

    return (
        <div className="relative">
            <div
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors shadow-sm border border-gray-200"
                onClick={() => setShowPopup(!showPopup)}
            >
                <Avatar
                    address={address as `0x${string}`}
                    defaultComponent={
                        <div className="h-8 w-8 rounded-full flex-shrink-0" style={{
                            background: `linear-gradient(135deg, ${color1}, ${color2})`,
                            border: '2px solid white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }} />
                    }
                />
                <div className="flex flex-col">
                    <div className="text-xs text-gray-500">Balance</div>
                    <div className="text-sm font-medium">{formattedBalance} ETH</div>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${showPopup ? 'rotate-180' : ''}`} />
            </div>

            {/* Popup Menu */}
            {showPopup && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowPopup(false)}
                    />

                    {/* Popup Content */}
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                        <div className="p-4 border-b border-gray-100">
                            <div className="flex items-start gap-3">
                                <Avatar
                                    address={address as `0x${string}`}
                                    defaultComponent={
                                        <div className="h-12 w-12 rounded-full" style={{
                                            background: `linear-gradient(135deg, ${color1}, ${color2})`,
                                            border: '2px solid white',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }} />
                                    }
                                />
                                <div>
                                    <div className="text-sm font-medium text-gray-800 mb-1">Your Wallet</div>
                                    <Address
                                        address={address as `0x${string}`}
                                        className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-800"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Network Info */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Network</span>
                                <span className="text-sm font-medium flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    Base Sepolia
                                </span>
                            </div>

                            {/* Balance */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Balance</span>
                                <span className="text-sm font-medium">
                                    {formattedBalance} ETH
                                </span>
                            </div>

                            {/* Actions */}
                            <button
                                onClick={() => {
                                    disconnect();
                                    setShowPopup(false);
                                }}
                                className="w-full flex items-center gap-2 justify-center px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors mt-2"
                            >
                                <LogOut size={14} />
                                Disconnect Wallet
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
} 