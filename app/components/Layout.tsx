'use client';

import { ReactNode, useState } from 'react';
import WalletIdentity from './WalletIdentity';
import ChatInterface from './ChatInterface';
import { PlusCircle, MessageCircle, X } from 'lucide-react';
import PredictionForm from './PredictionForm';
import GroqBadge from './GroqBadge';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const [showChat, setShowChat] = useState(false);
    const [showCreatePrediction, setShowCreatePrediction] = useState(false);

    const toggleChat = () => {
        setShowChat(!showChat);
        if (!showChat) setShowCreatePrediction(false); // Close other popup
    };

    const toggleCreatePrediction = () => {
        setShowCreatePrediction(!showCreatePrediction);
        if (!showCreatePrediction) setShowChat(false); // Close other popup
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-md sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900">PredictBase</h1>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleCreatePrediction}
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium shadow-sm"
                            >
                                <PlusCircle size={18} />
                                <span>Create Prediction</span>
                            </button>
                            <WalletIdentity />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            {/* Floating Chat Button */}
            <div className="fixed bottom-6 right-6">
                <button
                    onClick={toggleChat}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105"
                    aria-label="Open chat"
                >
                    {showChat ? <X size={24} /> : <MessageCircle size={24} />}
                </button>
            </div>

            {/* Chat Popup */}
            {showChat && (
                <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-20 flex flex-col">
                    <div className="bg-indigo-600 text-white p-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold">Groq AI Assistant</h3>
                            <button onClick={toggleChat} className="text-white hover:text-indigo-200">
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <ChatInterface />
                    </div>
                </div>
            )}

            {/* Create Prediction Popup */}
            {showCreatePrediction && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[480px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-20">
                    <div className="bg-blue-600 text-white p-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold">Create New Prediction</h3>
                            <button onClick={toggleCreatePrediction} className="text-white hover:text-blue-200">
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="p-6">
                        <PredictionForm onSuccess={toggleCreatePrediction} />
                    </div>
                </div>
            )}

            {/* Groq Badge */}
            <GroqBadge />
        </div>
    );
} 