'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import GlassCard from '../components/GlassCard';
import { Mic, MicOff, Volume2, Phone, PhoneOff, Waves, Brain } from 'lucide-react';

const VoiceOrb3D = dynamic(() => import('../components/VoiceOrb3D'), { ssr: false });

export default function VoicePage() {
    const [isListening, setIsListening] = useState(false);
    const [isInCall, setIsInCall] = useState(false);
    const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);

    const toggleListening = () => {
        if (!isInCall) {
            setIsInCall(true);
            setMessages([{ sender: 'ai', text: 'Hello! I\'m your AI Twin. What would you like to talk about today?' }]);
        }
        setIsListening(!isListening);

        if (!isListening) {
            // Simulate speech recognition
            setTimeout(() => {
                setIsListening(false);
                setMessages(prev => [
                    ...prev,
                    { sender: 'user', text: 'Hey, how are you doing today?' },
                ]);
                // Simulate AI response
                setTimeout(() => {
                    setMessages(prev => [
                        ...prev,
                        { sender: 'ai', text: 'I\'m doing great! As your digital twin, I\'ve been processing some interesting patterns from our recent conversations. Your communication style analysis shows you\'re in a particularly creative headspace today.' },
                    ]);
                }, 2000);
            }, 3000);
        }
    };

    const endCall = () => {
        setIsInCall(false);
        setIsListening(false);
        setMessages([]);
    };

    return (
        <div className="min-h-screen px-4 py-12">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-3">
                        <span className="gradient-text">Voice Conversation</span>
                    </h1>
                    <p className="text-gray-400 text-lg">Talk with your AI twin using your cloned voice</p>
                </motion.div>

                {/* Voice Visualizer */}
                <GlassCard hover={false} className="text-center mb-8">
                    {/* Waveform Display */}
                    <div className="h-32 flex items-center justify-center mb-8">
                        {isListening ? (
                            <div className="flex items-end gap-1">
                                {Array.from({ length: 30 }).map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{
                                            height: [10, Math.random() * 80 + 20, 10],
                                        }}
                                        transition={{
                                            duration: 0.5 + Math.random() * 0.5,
                                            repeat: Infinity,
                                            repeatType: 'reverse',
                                        }}
                                        className="w-1.5 rounded-full bg-gradient-to-t from-cyan-400 to-blue-500"
                                        style={{ minHeight: 10 }}
                                    />
                                ))}
                            </div>
                        ) : isInCall ? (
                            <div className="flex items-end gap-1">
                                {Array.from({ length: 30 }).map((_, i) => (
                                    <div key={i} className="w-1.5 h-2 rounded-full bg-gray-700" />
                                ))}
                            </div>
                        ) : (
                            <div className="text-gray-600">
                                <VoiceOrb3D />
                                <p className="text-sm">Press the microphone to start talking</p>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-6">
                        {isInCall && (
                            <motion.button
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                onClick={endCall}
                                className="w-14 h-14 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/30 transition-all"
                            >
                                <PhoneOff className="w-6 h-6" />
                            </motion.button>
                        )}

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleListening}
                            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isListening
                                ? 'bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.4)] animate-pulse'
                                : 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_30px_rgba(0,245,255,0.3)] hover:shadow-[0_0_50px_rgba(0,245,255,0.4)]'
                                }`}
                        >
                            {isListening ? <MicOff className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
                        </motion.button>

                        {isInCall && (
                            <motion.button
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-14 h-14 rounded-full bg-cyan-400/10 text-cyan-400 flex items-center justify-center hover:bg-cyan-400/20 transition-all"
                            >
                                <Volume2 className="w-6 h-6" />
                            </motion.button>
                        )}
                    </div>

                    <p className="text-gray-500 text-sm mt-4">
                        {isListening ? 'Listening... speak now' : isInCall ? 'Tap microphone to speak' : 'Tap to start voice conversation'}
                    </p>
                </GlassCard>

                {/* Conversation Log */}
                {messages.length > 0 && (
                    <GlassCard hover={false}>
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Brain className="w-5 h-5 text-cyan-400" />
                            Conversation Transcript
                        </h3>
                        <div className="space-y-4">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div
                                        className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${msg.sender === 'user'
                                            ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                                            : 'bg-gradient-to-br from-cyan-400 to-emerald-500'
                                            }`}
                                    >
                                        {msg.sender === 'user' ? '👤' : '🤖'}
                                    </div>
                                    <div
                                        className={`px-4 py-3 rounded-2xl text-sm max-w-[80%] ${msg.sender === 'user'
                                            ? 'bg-blue-600/20 text-gray-200 rounded-tr-md'
                                            : 'glass text-gray-300 rounded-tl-md'
                                            }`}
                                    >
                                        {msg.text}
                                        {msg.sender === 'ai' && (
                                            <button className="ml-2 text-gray-600 hover:text-cyan-400 transition-colors inline-flex">
                                                <Volume2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </GlassCard>
                )}
            </div>
        </div>
    );
}
