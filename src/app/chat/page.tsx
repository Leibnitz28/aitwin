'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Volume2, Bot, User, Sparkles, Mic, Copy, ChevronDown, Zap, Loader2 } from 'lucide-react';

import { useSearchParams } from 'next/navigation';

interface Message {
    id: number;
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
}

const BACKEND_URL = 'http://localhost:8000';

const SUGGESTED_PROMPTS = [
    "What's your perspective on consciousness?",
    "Tell me about your most vivid memory.",
    "How do you approach problem-solving?",
    "What kind of music reflects your mood today?",
];

function ChatContent() {
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

    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            sender: 'ai',
            text: "Hello! I'm EchoSoul — your digital persona replica. I've been trained on your voice and writing patterns to mirror your unique communication style. How can I help you today?",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
    ]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => { scrollToBottom(); }, [messages]);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;
        const onScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 120);
        };
        container.addEventListener('scroll', onScroll);
        return () => container.removeEventListener('scroll', onScroll);
    }, []);

    const playAudio = (url: string) => {
        if (!url) return;
        if (audioRef.current) audioRef.current.pause();
        audioRef.current = new Audio(url);
        audioRef.current.play().catch(e => console.error('Audio playback failed:', e));
    };

    const copyMessage = (msg: Message) => {
        navigator.clipboard.writeText(msg.text);
        setCopiedId(msg.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
    };

    const sendMessage = async (text?: string) => {
        const messageText = text ?? input;
        if (!messageText.trim() || typing) return;

        const userMsg: Message = {
            id: Date.now(),
            sender: 'user',
            text: messageText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        if (inputRef.current) { inputRef.current.style.height = 'auto'; }
        setTyping(true);

        try {
            const response = await fetch(`${BACKEND_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: messageText, twin_id: activeTwinId }),
            });

            if (!response.ok) throw new Error('Failed');
            const data = await response.json();

            const aiMsg: Message = {
                id: Date.now() + 1,
                sender: 'ai',
                text: data.reply,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, aiMsg]);
            if (data.audio_url) playAudio(data.audio_url);
        } catch {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'ai',
                text: "Sorry, I'm having trouble connecting to my brain right now. Please check if the backend is running.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }]);
        } finally {
            setTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="h-[calc(100dvh-64px)] flex flex-col px-3 sm:px-4 py-3 relative z-10">
            <div className="max-w-3xl mx-auto w-full flex flex-col h-full">

                {/* Chat Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-strong px-5 py-3.5 rounded-2xl mb-3 flex items-center gap-3"
                >
                    {/* Twin avatar */}
                    <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#07071a]" />
                    </div>

                    {/* Name and status */}
                    <div className="flex-1 min-w-0">
                        <h2 className="text-white font-bold text-sm leading-tight capitalize">{displayTwinName}'s EchoSoul</h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs text-gray-500">Online · Persona Sync Active</span>
                        </div>
                    </div>

                    {/* Personality match badge */}
                    <div className="flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-xl bg-cyan-400/8 border border-cyan-400/15">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-xs text-cyan-400 font-semibold">94% match</span>
                    </div>
                </motion.div>

                {/* Messages Area */}
                <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto rounded-2xl glass-strong px-4 py-4 mb-3 space-y-4 relative"
                    style={{ scrollbarWidth: 'thin' }}
                >
                    {/* Suggested prompts (only when only welcome message) */}
                    {messages.length === 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2"
                        >
                            {SUGGESTED_PROMPTS.map((prompt, i) => (
                                <motion.button
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6 + i * 0.08 }}
                                    onClick={() => sendMessage(prompt)}
                                    className="px-4 py-3 rounded-xl glass text-left text-sm text-gray-400 hover:text-white hover:bg-white/5 hover:border-cyan-400/20 border border-transparent transition-all leading-snug"
                                >
                                    <Zap className="w-3.5 h-3.5 text-cyan-400 mb-1.5" />
                                    {prompt}
                                </motion.button>
                            ))}
                        </motion.div>
                    )}

                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`flex group ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[82%] flex gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                {/* Avatar */}
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 self-end ${
                                    msg.sender === 'user'
                                        ? 'bg-gradient-to-br from-blue-500 to-blue-700'
                                        : 'bg-gradient-to-br from-cyan-400 to-emerald-500'
                                }`}>
                                    {msg.sender === 'user'
                                        ? <User className="w-3.5 h-3.5 text-white" />
                                        : <Bot className="w-3.5 h-3.5 text-white" />
                                    }
                                </div>

                                <div className={msg.sender === 'user' ? 'items-end flex flex-col' : ''}>
                                    {/* Bubble */}
                                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                        msg.sender === 'user'
                                            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md shadow-[0_4px_16px_rgba(59,130,246,0.2)]'
                                            : 'glass text-gray-200 rounded-bl-md'
                                    }`}>
                                        {msg.text}
                                    </div>

                                    {/* Meta row */}
                                    <div className={`flex items-center gap-1.5 mt-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <span suppressHydrationWarning className="text-[10px] text-gray-700 tabular-nums">{msg.timestamp}</span>
                                        <button
                                            onClick={() => copyMessage(msg)}
                                            className="text-gray-700 hover:text-gray-400 transition-colors"
                                            title="Copy"
                                        >
                                            <Copy className="w-3 h-3" />
                                        </button>
                                        {msg.sender === 'ai' && (
                                            <button className="text-gray-700 hover:text-cyan-400 transition-colors" title="Play audio">
                                                <Volume2 className="w-3 h-3" />
                                            </button>
                                        )}
                                        {copiedId === msg.id && (
                                            <span className="text-[10px] text-emerald-400">Copied!</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Typing indicator */}
                    <AnimatePresence>
                        {typing && (
                            <motion.div
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 6 }}
                                className="flex justify-start"
                            >
                                <div className="flex gap-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center flex-shrink-0 self-end">
                                        <Bot className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <div className="glass px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-1.5">
                                        <div className="typing-dot" />
                                        <div className="typing-dot" />
                                        <div className="typing-dot" />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div ref={messagesEndRef} />
                </div>

                {/* Scroll to bottom button */}
                <AnimatePresence>
                    {showScrollBtn && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => scrollToBottom()}
                            className="absolute bottom-24 right-8 w-8 h-8 rounded-full glass-strong flex items-center justify-center text-gray-400 hover:text-white shadow-lg z-20"
                        >
                            <ChevronDown className="w-4 h-4" />
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Input Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-strong px-4 py-3 rounded-2xl flex items-end gap-3"
                >
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        placeholder="Message your EchoSoul..."
                        rows={1}
                        className="flex-1 bg-transparent text-white placeholder:text-gray-700 focus:outline-none text-sm resize-none py-1 leading-relaxed"
                        style={{ maxHeight: 120 }}
                    />

                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Voice button */}
                        <button className="w-9 h-9 rounded-xl glass flex items-center justify-center text-gray-600 hover:text-cyan-400 transition-colors">
                            <Mic className="w-4 h-4" />
                        </button>

                        {/* Send button */}
                        <motion.button
                            whileTap={{ scale: 0.93 }}
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || typing}
                            className="w-9 h-9 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white hover:shadow-[0_0_20px_rgba(34,211,238,0.35)] transition-all disabled:opacity-30"
                        >
                            <Send className="w-4 h-4" />
                        </motion.button>
                    </div>
                </motion.div>

                <p className="text-center text-[10px] text-gray-800 mt-2">
                    Press Enter to send · Shift+Enter for new line
                </p>
            </div>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={
            <div className="h-[calc(100dvh-64px)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
        }>
            <ChatContent />
        </Suspense>
    );
}
