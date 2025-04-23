'use client';

import { useState, useRef, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { cbWalletConnector } from '../wagmi';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { address, isConnected } = useAccount();
    const { connect } = useConnect();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Handle wallet connection events
    useEffect(() => {
        if (isConnected && address) {
            setMessages(prev => [...prev, {
                role: 'system',
                content: `WALLET_CREATED:${address}`
            }]);
        }
    }, [isConnected, address]);

    const handleWalletConnection = async () => {
        try {
            console.log('Connecting wallet');
            connect({ connector: cbWalletConnector });

        } catch (error) {
            console.error('Error connecting wallet:', error);
            setMessages(prev => [...prev, {
                role: 'system',
                content: 'Failed to connect wallet. Please try again.'
            }]);
        }
    };

    const handleFunctionCall = async (functionName: string) => {
        switch (functionName) {
        case 'connect_wallet':
            await handleWalletConnection();
            break;
        default:
            console.warn('Unknown function:', functionName);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    walletAddress: address,
                    isConnected: isConnected
                }),
            });

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }

            // Check for function call in the response
            const functionMatch = data.response.match(/<function>(.*?)<\/function>/);
            if (functionMatch) {
                const functionName = functionMatch[1];
                // Remove the function call from the message
                const cleanMessage = data.response.replace(/<function>.*?<\/function>/, '').trim();
                if (cleanMessage) {
                    setMessages(prev => [...prev, { role: 'assistant', content: cleanMessage }]);
                }
                // Execute the function after adding the message
                await handleFunctionCall(functionName);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
            }
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, there was an error processing your request.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg p-4 ${message.role === 'user'
                                ? 'bg-blue-500 text-white'
                                : message.role === 'system'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-200 text-gray-800'
                                }`}
                        >
                            {message.content.startsWith('WALLET_CREATED:')
                                ? `Your Base Smart Wallet has been created! Address: ${message.content.split(':')[1]}`
                                : message.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-200 text-gray-800 rounded-lg p-4">
                            Thinking...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isConnected ? "Ask me anything or type 'open wallet' to view your wallet" : "Type your message..."}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    Send
                </button>
            </form>
        </div>
    );
} 