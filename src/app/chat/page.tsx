'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Volume2, Bot, User, Sparkles } from 'lucide-react';

interface Message {
    id: number;
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
}

const BACKEND_URL = 'http://localhost:8000';

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            sender: 'ai',
            text: 'Hello! I\'m EchoSoul, your digital persona replica. I\'ve been trained on your voice and writing samples to replicate your unique communication style. How can I help you today?',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
    ]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const playAudio = (url: string) => {
        if (!url) return;
        if (audioRef.current) {
            audioRef.current.pause();
        }
        audioRef.current = new Audio(url);
        audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
    };

    const sendMessage = async () => {
        if (!input.trim() || typing) return;

        const currentInput = input;
        const userMsg: Message = {
            id: Date.now(),
            sender: 'user',
            text: currentInput,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setTyping(true);

        try {
            const response = await fetch(`${BACKEND_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: currentInput,
                    twin_id: 'default_twin', // Hardcoded for initial version
                }),
            });

            if (!response.ok) throw new Error('Failed to fetch response');

            const data = await response.json();

            const aiMsg: Message = {
                id: Date.now() + 1,
                sender: 'ai',
                text: data.reply,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

            setMessages(prev => [...prev, aiMsg]);

            if (data.audio_url) {
                // Wait a bit before playing audio for natural feel
                setTimeout(() => {
                    playAudio(data.audio_url);
                }, 500);
            }
        } catch (error) {
            console.error('Chat error:', error);
            const errorMsg: Message = {
                id: Date.now() + 1,
                sender: 'ai',
                text: "Sorry, I'm having trouble connecting to my brain right now. Please check if the backend is running.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setTyping(false);
        }
    };

    return (
        <div className="h-[calc(100dvh-64px)] flex flex-col px-4 py-4">
            <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-strong p-4 rounded-2xl mb-4 flex items-center gap-3"
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-white font-bold">Prince&apos;s EchoSoul</h2>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs text-gray-400">Online • Persona Sync Active</span>
                        </div>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs text-cyan-400 font-medium">94% personality match</span>
                    </div>
                </motion.div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto rounded-2xl glass-strong p-4 mb-4 space-y-4">
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.sender === 'user'
                                        ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                                        : 'bg-gradient-to-br from-cyan-400 to-emerald-500'
                                        }`}
                                >
                                    {msg.sender === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                                </div>
                                <div>
                                    <div
                                        className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user'
                                            ? 'bg-gradient-to-r from-blue-600/40 to-purple-600/40 text-white rounded-tr-md'
                                            : 'glass text-gray-200 rounded-tl-md'
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                    <div className={`flex items-center gap-2 mt-1 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                                        <span className="text-[10px] text-gray-600">{msg.timestamp}</span>
                                        {msg.sender === 'ai' && (
                                            <button className="text-gray-600 hover:text-cyan-400 transition-colors">
                                                <Volume2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {typing && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div className="glass px-4 py-3 rounded-2xl rounded-tl-md">
                                    <div className="flex gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-strong p-3 rounded-2xl flex items-center gap-3"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent text-white placeholder:text-gray-600 focus:outline-none px-3 py-2 text-sm"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim()}
                        className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-white hover:shadow-[0_0_20px_rgba(0,245,255,0.3)] transition-all hover:scale-105 disabled:opacity-30"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
