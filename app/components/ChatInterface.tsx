'use client';

import { useState, useRef, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { getConfig } from '../wagmi';
import { Send, Mic, StopCircle } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export default function ChatInterface() {
    const [mounted, setMounted] = useState(false);
    const [messages, setMessages] = useState<Message[]>([{
        role: 'assistant',
        content: 'Hello! I can help you with predictions and your wallet. What would you like to know?'
    }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPopupWarning, setShowPopupWarning] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const { address, isConnected } = useAccount();
    const { connect } = useConnect();

    useEffect(() => {
        setMounted(true);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Handle wallet connection events
    useEffect(() => {
        if (isConnected && address && mounted) {
            setMessages(prev => [...prev, {
                role: 'system',
                content: `WALLET_CREATED:${address}`
            }]);
        }
    }, [isConnected, address, mounted]);

    const handleWalletConnection = async () => {
        try {
            setShowPopupWarning(true);
            // Wait for 2 seconds to show the popup warning
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log('Connecting wallet');
            connect({ connector: getConfig().connectors[0] });
            setShowPopupWarning(false);
        } catch (error) {
            console.error('Error connecting wallet:', error);
            setMessages(prev => [...prev, {
                role: 'system',
                content: 'Failed to connect wallet. Please try again.'
            }]);
            setShowPopupWarning(false);
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

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioChunksRef.current = [];
            const mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mpeg' });
                processAudioInput(audioBlob);

                // Stop all tracks of the stream
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error starting recording:', error);
            setMessages(prev => [...prev, {
                role: 'system',
                content: 'Failed to access microphone. Please check your browser permissions.'
            }]);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const processAudioInput = async (blob: Blob) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', blob, 'audio.mp3');
            formData.append('walletAddress', address || '');
            formData.append('isConnected', isConnected.toString());

            const response = await fetch('/api/audio', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }

            // Add the transcribed text as a user message
            if (data.text) {
                setMessages(prev => [...prev, {
                    role: 'user',
                    content: data.text
                }]);

                // Now process the transcribed text with the chat API
                await processMessage(data.text);
            }
        } catch (error) {
            console.error('Error processing audio:', error);
            setMessages(prev => [...prev, {
                role: 'system',
                content: 'Failed to process audio. Please try again or type your message.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const processMessage = async (message: string) => {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
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
            await processMessage(userMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!mounted) {
        return null;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2 ${message.role === 'user'
                                ? 'bg-indigo-600 text-white'
                                : message.role === 'system'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                        >
                            {message.content.startsWith('WALLET_CREATED:')
                                ? `Your Base Smart Wallet has been Connected!`
                                : message.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-500 rounded-2xl px-4 py-2 flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                )}
                {showPopupWarning && (
                    <div className="flex justify-start">
                        <div className="bg-amber-100 text-amber-800 rounded-2xl px-4 py-2">
                            <p className="font-semibold">⚠️ Popup Window</p>
                            <p className="text-sm">Please allow the popup window to open.</p>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isConnected ? "Ask me anything..." : "Type your message..."}
                        className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isLoading || isRecording}
                    />
                    <button
                        type="button"
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isLoading}
                        className={`p-3 ${isRecording ? 'bg-red-600' : 'bg-blue-600'} text-white rounded-full hover:${isRecording ? 'bg-red-700' : 'bg-blue-700'} disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center`}
                        aria-label={isRecording ? "Stop recording" : "Start recording"}
                    >
                        {isRecording ? <StopCircle size={18} /> : <Mic size={18} />}
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim() || isRecording}
                        className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                        aria-label="Send"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
} 