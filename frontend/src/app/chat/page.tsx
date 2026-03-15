'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Mic, Square, Volume2, VolumeX, Bot, User, Loader2, Sparkles,
    Brain, Zap, MessageSquare, ChevronDown
} from 'lucide-react';

const BACKEND_URL = 'http://localhost:8000';

interface Agent { name: string; status: string; processing_time_ms?: number }
interface Message {
    id: string;
    role: 'user' | 'ai';
    text: string;
    agents?: Agent[];
    audio_url?: string;
    timestamp: Date;
}

function ChatContent() {
    const params = useSearchParams();
    const twinId = params.get('twin_id') || 'default_twin';

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isPlayingId, setIsPlayingId] = useState<string | null>(null);
    const [showAgents, setShowAgents] = useState<Record<string, boolean>>({});
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (text: string) => {
        if (!text.trim() || loading) return;
        const userMsg: Message = { id: Date.now().toString(), role: 'user', text, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch(`${BACKEND_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, twin_id: twinId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Chat failed');

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                text: data.reply,
                agents: data.agents_used || [],
                audio_url: data.audio_url,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMsg]);

            // Auto-play AI audio if available
            if (data.audio_url) {
                playAudio(aiMsg.id, `${BACKEND_URL}${data.audio_url}`);
            }
        } catch (e) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'ai',
                text: `⚠️ Error: ${e instanceof Error ? e.message : 'Something went wrong'}`,
                timestamp: new Date(),
            }]);
        } finally {
            setLoading(false);
        }
    };

    const sendVoice = async (blob: Blob) => {
        setLoading(true);
        const placeholder: Message = { id: Date.now().toString(), role: 'user', text: '🎙️ Voice message (transcribing...)', timestamp: new Date() };
        setMessages(prev => [...prev, placeholder]);

        try {
            const form = new FormData();
            form.append('audio', blob, 'voice.webm');
            form.append('twin_id', twinId);

            const res = await fetch(`${BACKEND_URL}/voice-chat`, { method: 'POST', body: form });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Voice chat failed');

            // Replace placeholder with actual transcript
            setMessages(prev => prev.map(m =>
                m.id === placeholder.id
                    ? { ...m, text: `🎙️ "${data.transcript}"` }
                    : m
            ));

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                text: data.reply,
                agents: data.agents_used || [],
                audio_url: data.audio_url,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMsg]);

            if (data.audio_url) {
                playAudio(aiMsg.id, `${BACKEND_URL}${data.audio_url}`);
            }
        } catch (e) {
            setMessages(prev => prev.map(m =>
                m.id === placeholder.id
                    ? { ...m, text: `⚠️ Voice error: ${e instanceof Error ? e.message : 'Failed'}` }
                    : m
            ));
        } finally {
            setLoading(false);
        }
    };

    const playAudio = (msgId: string, url: string) => {
        audioRef.current?.pause();
        const audio = new Audio(url);
        audioRef.current = audio;
        setIsPlayingId(msgId);
        audio.play().catch(() => {});
        audio.onended = () => setIsPlayingId(null);
        audio.onerror = () => setIsPlayingId(null);
    };

    const toggleAudio = (msgId: string, audioUrl: string) => {
        if (isPlayingId === msgId) {
            audioRef.current?.pause();
            setIsPlayingId(null);
        } else {
            playAudio(msgId, `${BACKEND_URL}${audioUrl}`);
        }
    };

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mr;
            audioChunksRef.current = [];
            mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
            mr.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                stream.getTracks().forEach(t => t.stop());
                sendVoice(blob);
            };
            mr.start();
            setIsRecording(true);
        } catch {
            alert('Microphone access denied.');
        }
    }, [twinId]);

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    const toggleAgents = (id: string) => setShowAgents(prev => ({ ...prev, [id]: !prev[id] }));

    return (
        <div className="flex flex-col h-screen pt-16">
            {/* Header */}
            <div className="glass-strong border-b border-white/5 px-4 sm:px-6 py-4">
                <div className="max-w-3xl mx-auto flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-base leading-none">AI Twin Chat</h1>
                        <p className="text-gray-500 text-xs mt-0.5">Twin ID: <span className="text-cyan-400 font-mono">{twinId}</span></p>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-400/5 border border-emerald-400/15">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs text-emerald-400 font-medium">5 Agents</span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    {messages.length === 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500/15 to-blue-600/15 border border-cyan-500/15 flex items-center justify-center mx-auto mb-5">
                                <Sparkles className="w-9 h-9 text-cyan-400" />
                            </div>
                            <h2 className="text-white font-bold text-xl mb-2">Start a Conversation</h2>
                            <p className="text-gray-500 text-sm max-w-sm mx-auto">
                                Type a message or hold the mic button to talk. Your AI twin will respond in their personality.
                            </p>
                            <div className="flex flex-wrap justify-center gap-2 mt-6">
                                {["What do you think about AI?", "Tell me about yourself", "What's your biggest passion?"].map(s => (
                                    <button key={s} onClick={() => sendMessage(s)}
                                        className="px-4 py-2 rounded-xl glass border border-white/10 text-gray-400 text-xs hover:text-white hover:border-white/20 transition-all">
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    <AnimatePresence initial={false}>
                        {messages.map(msg => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                {/* Avatar */}
                                <div className={`w-9 h-9 flex-shrink-0 rounded-2xl flex items-center justify-center ${
                                    msg.role === 'ai'
                                        ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/15'
                                        : 'bg-white/5 border border-white/10'
                                }`}>
                                    {msg.role === 'ai' ? <Bot className="w-4 h-4 text-cyan-400" /> : <User className="w-4 h-4 text-gray-400" />}
                                </div>

                                <div className={`flex-1 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                                    {/* Bubble */}
                                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                        msg.role === 'user'
                                            ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/15 text-white rounded-tr-sm'
                                            : 'glass-strong border border-white/8 text-gray-200 rounded-tl-sm'
                                    }`}>
                                        {msg.text}
                                    </div>

                                    {/* Audio + Agents row */}
                                    {msg.role === 'ai' && (
                                        <div className="flex items-center gap-2">
                                            {/* Audio playback */}
                                            {msg.audio_url && (
                                                <button
                                                    onClick={() => toggleAudio(msg.id, msg.audio_url!)}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                                                        isPlayingId === msg.id
                                                            ? 'bg-cyan-400/20 border border-cyan-400/30 text-cyan-400'
                                                            : 'glass border border-white/10 text-gray-400 hover:text-white'
                                                    }`}
                                                >
                                                    {isPlayingId === msg.id
                                                        ? <><VolumeX className="w-3.5 h-3.5" /> Stop</>
                                                        : <><Volume2 className="w-3.5 h-3.5" /> Play</>
                                                    }
                                                </button>
                                            )}

                                            {/* Agent steps */}
                                            {msg.agents && msg.agents.length > 0 && (
                                                <button
                                                    onClick={() => toggleAgents(msg.id)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass border border-white/10 text-gray-500 text-xs hover:text-gray-300 transition-all"
                                                >
                                                    <Brain className="w-3.5 h-3.5 text-purple-400" />
                                                    {msg.agents.length} agents
                                                    <ChevronDown className={`w-3 h-3 transition-transform ${showAgents[msg.id] ? 'rotate-180' : ''}`} />
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Agent details */}
                                    <AnimatePresence>
                                        {msg.agents && showAgents[msg.id] && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="w-full overflow-hidden"
                                            >
                                                <div className="glass rounded-xl p-3 space-y-1.5">
                                                    {msg.agents.map((agent, i) => (
                                                        <div key={i} className="flex items-center justify-between text-xs">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-2 h-2 rounded-full ${
                                                                    agent.status === 'completed' ? 'bg-emerald-400' :
                                                                    agent.status === 'error' ? 'bg-red-400' : 'bg-amber-400 animate-pulse'
                                                                }`} />
                                                                <span className="text-gray-400 font-medium">{agent.name}</span>
                                                            </div>
                                                            {agent.processing_time_ms !== undefined && (
                                                                <span className="text-gray-600">{agent.processing_time_ms}ms</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        ))}

                        {/* Typing indicator */}
                        {loading && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                                <div className="w-9 h-9 flex-shrink-0 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/15 flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-cyan-400" />
                                </div>
                                <div className="glass-strong border border-white/8 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                                    <span className="text-gray-500 text-sm">Thinking...</span>
                                    <div className="flex gap-1 ml-1">
                                        {[0, 1, 2].map(i => (
                                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-500/60 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Bar */}
            <div className="glass-strong border-t border-white/5 px-4 py-4">
                <div className="max-w-3xl mx-auto flex items-end gap-3">
                    {/* Voice button */}
                    <button
                        onMouseDown={startRecording}
                        onMouseUp={stopRecording}
                        onTouchStart={startRecording}
                        onTouchEnd={stopRecording}
                        disabled={loading}
                        className={`flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                            isRecording
                                ? 'bg-red-500/20 border-2 border-red-500 text-red-400 animate-pulse scale-110'
                                : 'glass border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                        } disabled:opacity-40`}
                        title="Hold to record voice"
                    >
                        {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>

                    {/* Text input */}
                    <div className="flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message or hold mic to talk..."
                            rows={1}
                            disabled={loading || isRecording}
                            className="w-full glass-strong border border-white/10 rounded-2xl px-4 py-3 text-white text-sm resize-none focus:outline-none focus:border-cyan-400/30 transition-colors placeholder:text-gray-600 leading-relaxed disabled:opacity-50 max-h-36 overflow-y-auto"
                            style={{ scrollbarWidth: 'none' }}
                        />
                    </div>

                    {/* Send */}
                    <button
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim() || loading || isRecording}
                        className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </div>

                <p className="text-center text-gray-700 text-xs mt-2">
                    Hold <kbd className="px-1 py-0.5 rounded bg-white/5 font-mono text-[10px]">mic</kbd> to talk · <kbd className="px-1 py-0.5 rounded bg-white/5 font-mono text-[10px]">Enter</kbd> to send · <kbd className="px-1 py-0.5 rounded bg-white/5 font-mono text-[10px]">Shift+Enter</kbd> for newline
                </p>
            </div>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-cyan-400" /></div>}>
            <ChatContent />
        </Suspense>
    );
}
