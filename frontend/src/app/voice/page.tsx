'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import GlassCard from '../components/GlassCard';
import { Mic, MicOff, Volume2, VolumeX, PhoneOff, Brain, Sparkles, Loader2 } from 'lucide-react';

import { useSearchParams } from 'next/navigation';

const VoiceOrb3D = dynamic(() => import('../components/VoiceOrb3D'), { ssr: false });

interface Transcript { sender: string; text: string; }

const BACKEND_URL = 'http://localhost:8000';

function VoiceContent() {
    const searchParams = useSearchParams();
    const activeTwinId = searchParams.get('twinId') || 'default_twin';

    const [displayTwinName, setDisplayTwinName] = useState(activeTwinId === 'default_twin' ? "General Assistant" : activeTwinId.slice(0, 6));

    useEffect(() => {
        const fetchTwinData = async () => {
            if (activeTwinId === 'default_twin') return;
            try {
                const res = await fetch(`${BACKEND_URL}/${activeTwinId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.name) setDisplayTwinName(data.name);
                }
            } catch (e) { console.error("Failed to load twin data", e); }
        };
        fetchTwinData();
    }, [activeTwinId]);

    const [isListening, setIsListening] = useState(false);
    const [isInCall, setIsInCall] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [messages, setMessages] = useState<Transcript[]>([]);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [recognition, setRecognition] = useState<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRec) {
                const rec = new SpeechRec();
                rec.continuous = false;
                rec.interimResults = false;
                rec.lang = 'en-US';
                
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                rec.onresult = (event: any) => {
                    const text = event.results[0][0].transcript;
                    handleSpeechResult(text);
                };
                
                rec.onend = () => setIsListening(false);
                rec.onerror = () => setIsListening(false);
                
                setRecognition(rec);
            }
        }
        return () => {
            if (audioRef.current) audioRef.current.pause();
        };
    }, [isMuted]);

    const speakWithBrowserTTS = (text: string) => {
        if ('speechSynthesis' in window && !isMuted) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleSpeechResult = async (text: string) => {
        if (!text.trim()) return;
        setMessages(prev => [...prev, { sender: 'user', text }]);
        setIsThinking(true);
        
        try {
            const response = await fetch(`${BACKEND_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, twin_id: activeTwinId }),
            });
            
            if (response.ok) {
                const data = await response.json();
                setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
                
                if (!isMuted) {
                    if (data.audio_url) {
                        // Use ElevenLabs cloned voice audio
                        if (audioRef.current) audioRef.current.pause();
                        audioRef.current = new Audio(data.audio_url);
                        audioRef.current.play().catch(e => {
                            console.error("Audio play error, falling back to browser TTS:", e);
                            speakWithBrowserTTS(data.reply);
                        });
                    } else {
                        // Fallback: use browser built-in SpeechSynthesis
                        speakWithBrowserTTS(data.reply);
                    }
                }
            } else {
                setMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I couldn't reach my brain." }]);
            }
        } catch {
            setMessages(prev => [...prev, { sender: 'ai', text: "Network error occurred." }]);
        } finally {
            setIsThinking(false);
        }
    };

    const toggleListening = () => {
        if (!isInCall) {
            setIsInCall(true);
            setMessages([{ sender: 'ai', text: `Hello! I'm ${displayTwinName}. What would you like to talk about today?` }]);
        }
        
        if (isListening) {
            recognition?.stop();
        } else {
            try {
                if (audioRef.current) audioRef.current.pause();
                recognition?.start();
                setIsListening(true);
            } catch (e) {
                console.error("Speech recognition error:", e);
                setIsListening(false);
            }
        }
    };

    const endCall = () => {
        if (audioRef.current) audioRef.current.pause();
        recognition?.stop();
        setIsInCall(false);
        setIsListening(false);
        setIsThinking(false);
        setMessages([]);
    };

    return (
        <div className="min-h-screen px-4 py-12">
            <div className="max-w-2xl mx-auto">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/4 border border-white/8 text-xs text-gray-400 mb-4">
                        <Mic className="w-3.5 h-3.5 text-cyan-400" />
                        Voice Interface
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black mb-3">
                        <span className="gradient-text">Voice Conversation</span>
                    </h1>
                    <p className="text-gray-500 text-base">Talk with {displayTwinName} using voice</p>
                </motion.div>

                {/* Main Voice Card */}
                <GlassCard hover={false} className="mb-6 text-center p-8">
                    {/* Orb / Visualizer */}
                    <div className="relative flex items-center justify-center mb-8 h-52">
                        {/* Ambient rings */}
                        {isListening && (
                            <>
                                {[1, 2, 3].map((ring) => (
                                    <motion.div
                                        key={ring}
                                        className="absolute rounded-full border border-cyan-400/20"
                                        animate={{
                                            scale: [1, 1.6 + ring * 0.3, 1],
                                            opacity: [0.5, 0, 0.5],
                                        }}
                                        transition={{ duration: 2, delay: ring * 0.4, repeat: Infinity }}
                                        style={{ width: 80 + ring * 30, height: 80 + ring * 30 }}
                                    />
                                ))}
                            </>
                        )}

                        {isThinking ? (
                            /* Thinking spinner */
                            <Loader2 className="w-16 h-16 text-cyan-400 animate-spin" />
                        ) : isListening ? (
                            /* Waveform */
                            <div className="flex items-end gap-1">
                                {Array.from({ length: 28 }).map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ height: [4, Math.random() * 60 + 16, 4] }}
                                        transition={{ duration: 0.4 + Math.random() * 0.4, repeat: Infinity, repeatType: 'reverse' }}
                                        className="w-1.5 rounded-full bg-gradient-to-t from-cyan-500 to-blue-400"
                                        style={{ minHeight: 4 }}
                                    />
                                ))}
                            </div>
                        ) : isInCall ? (
                            /* Idle waveform */
                            <div className="flex items-end gap-1">
                                {Array.from({ length: 28 }).map((_, i) => (
                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/10" />
                                ))}
                            </div>
                        ) : (
                            /* Pre-call orb */
                            <VoiceOrb3D />
                        )}
                    </div>

                    {/* Status label */}
                    <motion.p
                        key={`${isListening}-${isInCall}-${isThinking}`}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-gray-500 text-sm mb-8"
                    >
                        {isThinking
                            ? "Processing response..."
                            : isListening
                                ? 'Listening… speak now'
                                : isInCall
                                    ? 'Tap microphone to speak'
                                    : 'Press the microphone to start a voice call'
                        }
                    </motion.p>

                    {/* Call Controls */}
                    <div className="flex items-center justify-center gap-5">
                        {/* End call */}
                        <AnimatePresence>
                            {isInCall && (
                                <motion.button
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    onClick={endCall}
                                    className="w-14 h-14 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center hover:bg-red-500/25 transition-all border border-red-500/20"
                                >
                                    <PhoneOff className="w-6 h-6" />
                                </motion.button>
                            )}
                        </AnimatePresence>

                        {/* Main mic button */}
                        <motion.button
                            whileTap={{ scale: 0.93 }}
                            onClick={toggleListening}
                            disabled={isThinking || !recognition}
                            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                                isListening
                                    ? 'bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.45)]'
                                    : 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_30px_rgba(34,211,238,0.35)] hover:shadow-[0_0_50px_rgba(34,211,238,0.5)]'
                            }`}
                        >
                            {isListening ? <MicOff className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
                        </motion.button>

                        {/* Mute / Speaker */}
                        <AnimatePresence>
                            {isInCall && (
                                <motion.button
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    onClick={() => {
                                        setIsMuted(!isMuted);
                                        if (!isMuted && audioRef.current) audioRef.current.pause();
                                    }}
                                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border ${
                                        isMuted
                                            ? 'bg-amber-400/15 text-amber-400 border-amber-400/20'
                                            : 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20 hover:bg-cyan-400/20'
                                    }`}
                                >
                                    {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                    
                    {!recognition && (
                        <p className="text-xs text-red-400 mt-4 leading-tight">
                            Speech recognition is not supported in this browser. Please use Chrome.
                        </p>
                    )}
                </GlassCard>

                {/* Info cards */}
                {!isInCall && (
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {[
                            { icon: Sparkles, label: 'Voice Cloned', sub: 'ElevenLabs', color: '#22d3ee' },
                            { icon: Brain, label: 'Persona Sync', sub: '94% match', color: '#8b5cf6' },
                            { icon: Mic, label: 'HD Audio', sub: '48kHz', color: '#34d399' },
                        ].map((item, i) => (
                            <div key={i} className="glass p-4 rounded-xl text-center">
                                <item.icon className="w-5 h-5 mx-auto mb-2" style={{ color: item.color }} />
                                <div className="text-xs text-white font-semibold">{item.label}</div>
                                <div className="text-[10px] text-gray-600 mt-0.5">{item.sub}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Conversation Transcript */}
                <AnimatePresence>
                    {messages.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <GlassCard hover={false}>
                                <h3 className="text-white font-bold mb-5 flex items-center gap-2 text-sm">
                                    <Brain className="w-4 h-4 text-cyan-400" />
                                    Live Transcript
                                    <span className="ml-auto">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block mr-1" />
                                        <span className="text-[10px] text-red-400 font-medium">LIVE</span>
                                    </span>
                                </h3>
                                <div className="space-y-4">
                                    {messages.map((msg, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                                        >
                                            <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-sm ${
                                                msg.sender === 'user' ? 'bg-blue-600' : 'bg-gradient-to-br from-cyan-400 to-emerald-500'
                                            }`}>
                                                {msg.sender === 'user' ? '👤' : '🤖'}
                                            </div>
                                            <div className={`px-4 py-3 rounded-2xl text-sm max-w-[80%] leading-relaxed ${
                                                msg.sender === 'user'
                                                    ? 'bg-blue-600/20 text-gray-200 rounded-tr-md'
                                                    : 'glass text-gray-300 rounded-tl-md'
                                            }`}>
                                                {msg.text}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function VoicePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
        }>
            <VoiceContent />
        </Suspense>
    );
}
