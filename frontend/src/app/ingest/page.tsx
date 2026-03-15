'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Globe, Github, Twitter, FileText, Mic, Upload, CheckCircle2,
    Loader2, AlertCircle, Database, Zap, X, ChevronRight, BarChart3,
    Plus, Trash2, Play, Square
} from 'lucide-react';

const BACKEND_URL = 'http://localhost:8000';

interface IngestResult {
    status: string;
    message: string;
    chunks_stored?: number;
    posts_ingested?: number;
    word_count?: number;
    warning?: string;
    error?: string;
}

interface DocCounts {
    writing: number;
    web: number;
    social: number;
    conversations: number;
}

type Tab = 'web' | 'social' | 'text' | 'audio';

const TABS: { id: Tab; label: string; icon: React.ElementType; color: string; desc: string }[] = [
    { id: 'web', label: 'Web Scraper', icon: Globe, color: '#22d3ee', desc: 'Scrape any public web page' },
    { id: 'social', label: 'Social Media', icon: Twitter, color: '#8b5cf6', desc: 'Import from GitHub, Reddit, Twitter' },
    { id: 'text', label: 'Text / Article', icon: FileText, color: '#10b981', desc: 'Paste text or articles' },
    { id: 'audio', label: 'Voice Sample', icon: Mic, color: '#f59e0b', desc: 'Upload audio for cloning' },
];

const PLATFORMS = [
    { id: 'github', label: 'GitHub', icon: Github, color: '#e2e8f0', placeholder: 'torvalds' },
    { id: 'reddit', label: 'Reddit', icon: FileText, color: '#ff6314', placeholder: 'spez' },
    { id: 'twitter', label: 'Twitter / X', icon: Twitter, color: '#1DA1F2', placeholder: 'elonmusk' },
];

function StatusBadge({ result }: { result: IngestResult | null }) {
    if (!result) return null;
    const isError = result.status !== 'success' || result.error;
    const isWarning = result.warning;
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-3 rounded-xl p-4 border ${
                isError
                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                    : isWarning
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}
        >
            {isError ? <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />}
            <div>
                <p className="font-semibold text-sm">{result.message || result.error}</p>
                {result.warning && <p className="text-xs mt-1 opacity-70">{result.warning}</p>}
                <div className="flex gap-4 mt-2 text-xs opacity-70">
                    {result.chunks_stored !== undefined && <span>📦 {result.chunks_stored} chunks stored</span>}
                    {result.posts_ingested !== undefined && <span>📝 {result.posts_ingested} posts ingested</span>}
                    {result.word_count !== undefined && <span>📄 {result.word_count.toLocaleString()} words</span>}
                </div>
            </div>
        </motion.div>
    );
}

export default function IngestPage() {
    const [activeTab, setActiveTab] = useState<Tab>('web');
    const [userId, setUserId] = useState('default_user');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<IngestResult | null>(null);
    const [docCounts, setDocCounts] = useState<DocCounts | null>(null);
    const [urls, setUrls] = useState(['']);
    const [platform, setPlatform] = useState('github');
    const [handle, setHandle] = useState('');
    const [textSample, setTextSample] = useState('');
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchCounts = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/ingest/status/${userId}`);
            if (res.ok) {
                const data = await res.json();
                setDocCounts(data.counts);
            }
        } catch { /* ignore */ }
    };

    const handleIngestWeb = async () => {
        const validUrls = urls.filter(u => u.trim().startsWith('http'));
        if (!validUrls.length) {
            setResult({ status: 'error', message: 'Please enter at least one valid URL starting with http/https', error: 'Invalid URL' });
            return;
        }
        setLoading(true);
        setResult(null);
        let lastResult: IngestResult | null = null;
        for (const url of validUrls) {
            try {
                const res = await fetch(`${BACKEND_URL}/ingest/web`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: url.trim(), user_id: userId }),
                });
                lastResult = await res.json();
                if (!res.ok) lastResult = { status: 'error', message: lastResult?.detail || 'Failed', error: 'HTTP Error' } as any;
            } catch (e) {
                lastResult = { status: 'error', message: `Failed to reach backend: ${e}`, error: 'Network error' };
            }
        }
        setResult(lastResult);
        setLoading(false);
        fetchCounts();
    };

    const handleIngestSocial = async () => {
        if (!handle.trim()) {
            setResult({ status: 'error', message: 'Please enter a handle', error: 'Missing handle' });
            return;
        }
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch(`${BACKEND_URL}/ingest/social`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ platform, handle: handle.trim(), user_id: userId }),
            });
            const data = await res.json();
            if (!res.ok) setResult({ status: 'error', message: data.detail || 'Failed', error: 'HTTP Error' });
            else setResult(data);
        } catch (e) {
            setResult({ status: 'error', message: `Network error: ${e}`, error: 'Network error' });
        }
        setLoading(false);
        fetchCounts();
    };

    const handleIngestText = async () => {
        if (textSample.trim().split(' ').length < 10) {
            setResult({ status: 'error', message: 'Please enter at least 10 words of text.', error: 'Too short' });
            return;
        }
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch(`${BACKEND_URL}/upload-writing`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textSample, user_id: userId }),
            });
            const data = await res.json();
            if (!res.ok) setResult({ status: 'error', message: data.detail || 'Failed', error: 'HTTP Error' });
            else setResult({
                status: 'success',
                message: `Text ingested: ${data.word_count} words analyzed`,
                chunks_stored: 1,
                word_count: data.word_count,
            });
        } catch (e) {
            setResult({ status: 'error', message: `Network error: ${e}`, error: 'Network error' });
        }
        setLoading(false);
        fetchCounts();
    };

    const handleAudioUpload = async (file: File) => {
        setLoading(true);
        setResult(null);
        try {
            const form = new FormData();
            form.append('file', file);
            form.append('user_id', userId);
            const res = await fetch(`${BACKEND_URL}/upload-voice`, { method: 'POST', body: form });
            const data = await res.json();
            if (!res.ok) setResult({ status: 'error', message: data.detail || 'Failed', error: 'HTTP Error' });
            else setResult({
                status: 'success',
                message: data.voice_cloned
                    ? `Voice sample ingested and cloning initiated!`
                    : `Audio uploaded (${data.size_kb} KB). Voice cloning pending.`,
                chunks_stored: data.voice_cloned ? 1 : 0,
            });
        } catch (e) {
            setResult({ status: 'error', message: `Upload failed: ${e}`, error: 'Network error' });
        }
        setLoading(false);
    };

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mr;
            audioChunksRef.current = [];
            mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
            mr.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
                setAudioFile(file);
                stream.getTracks().forEach(t => t.stop());
            };
            mr.start();
            setIsRecording(true);
        } catch (e) {
            setResult({ status: 'error', message: 'Microphone access denied. Please allow microphone access.', error: 'Mic error' });
        }
    }, []);

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
    };

    return (
        <div className="min-h-screen px-4 py-12 relative">
            {/* Background orbs */}
            <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/4 blur-[120px] pointer-events-none" />
            <div className="fixed bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-purple-600/4 blur-[100px] pointer-events-none" />

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-xs text-cyan-400 font-semibold mb-5">
                        <Database className="w-3.5 h-3.5" />
                        Knowledge Ingestion Hub
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
                        Feed Your <span className="gradient-text">AI Twin</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
                        The more data you provide, the more authentic your twin becomes.
                        Scrape websites, import social media, or paste any text.
                    </p>
                </motion.div>

                {/* User ID + Document Counts */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-strong rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                >
                    <div className="flex-1">
                        <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1 block">Twin User ID</label>
                        <input
                            value={userId}
                            onChange={e => setUserId(e.target.value)}
                            placeholder="Enter your user_id (e.g. my_user_123)"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400/40 transition-colors"
                        />
                    </div>
                    <button
                        onClick={fetchCounts}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10 hover:text-white transition-all"
                    >
                        <BarChart3 className="w-4 h-4 text-cyan-400" />
                        View Counts
                    </button>
                </motion.div>

                {/* Document Counts */}
                <AnimatePresence>
                    {docCounts && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
                        >
                            {[
                                { label: 'Writing Samples', value: docCounts.writing, color: '#22d3ee' },
                                { label: 'Web Pages', value: docCounts.web, color: '#8b5cf6' },
                                { label: 'Social Posts', value: docCounts.social, color: '#10b981' },
                                { label: 'Conversations', value: docCounts.conversations, color: '#f59e0b' },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="glass rounded-xl p-4 text-center"
                                >
                                    <div className="text-2xl font-black" style={{ color: item.color }}>{item.value}</div>
                                    <div className="text-xs text-gray-600 mt-1">{item.label}</div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
                >
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setResult(null); }}
                            className={`p-4 rounded-2xl border text-left transition-all ${
                                activeTab === tab.id
                                    ? 'glass-strong border-white/15 shadow-lg'
                                    : 'glass border-white/5 hover:border-white/10'
                            }`}
                            style={activeTab === tab.id ? { boxShadow: `0 0 20px ${tab.color}15` } : undefined}
                        >
                            <tab.icon className="w-5 h-5 mb-2" style={{ color: tab.color }} />
                            <div className="text-white font-semibold text-sm">{tab.label}</div>
                            <div className="text-gray-600 text-xs mt-0.5">{tab.desc}</div>
                        </button>
                    ))}
                </motion.div>

                {/* Main Panel */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-strong rounded-3xl p-6 sm:p-8 space-y-5"
                >
                    {/* ─ Web Scraper ─ */}
                    {activeTab === 'web' && (
                        <>
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-semibold text-gray-300">URLs to Scrape</label>
                                    <button
                                        onClick={() => setUrls([...urls, ''])}
                                        className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Add URL
                                    </button>
                                </div>
                                <div className="space-y-2.5">
                                    {urls.map((url, i) => (
                                        <div key={i} className="flex gap-2">
                                            <input
                                                value={url}
                                                onChange={e => {
                                                    const next = [...urls];
                                                    next[i] = e.target.value;
                                                    setUrls(next);
                                                }}
                                                placeholder="https://en.wikipedia.org/wiki/Elon_Musk"
                                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-400/40 transition-colors placeholder:text-gray-700"
                                            />
                                            {urls.length > 1 && (
                                                <button
                                                    onClick={() => setUrls(urls.filter((_, idx) => idx !== i))}
                                                    className="px-3 py-3 rounded-xl glass text-gray-600 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-600 mt-2">
                                    Works with Wikipedia, blogs, news articles, personal websites, LinkedIn public profiles (no login required)
                                </p>
                            </div>
                            <button
                                onClick={handleIngestWeb}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-base hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Globe className="w-5 h-5" />}
                                {loading ? 'Scraping...' : 'Scrape & Ingest'}
                            </button>
                        </>
                    )}

                    {/* ─ Social Media ─ */}
                    {activeTab === 'social' && (
                        <>
                            <div>
                                <label className="text-sm font-semibold text-gray-300 mb-3 block">Platform</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {PLATFORMS.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => setPlatform(p.id)}
                                            className={`flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all ${
                                                platform === p.id
                                                    ? 'glass-strong border-white/20'
                                                    : 'glass border-white/5 hover:border-white/10'
                                            }`}
                                        >
                                            <p.icon className="w-5 h-5" style={{ color: p.color }} />
                                            <span className="text-xs font-medium text-gray-300">{p.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-300 mb-2 block">
                                    {platform === 'reddit' ? 'u/' : '@'} Handle / Username
                                </label>
                                <input
                                    value={handle}
                                    onChange={e => setHandle(e.target.value)}
                                    placeholder={PLATFORMS.find(p => p.id === platform)?.placeholder || 'username'}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-400/40 transition-colors placeholder:text-gray-700"
                                />
                                <p className="text-xs text-gray-600 mt-1.5">
                                    Only public profiles are accessible — no API key or login required
                                </p>
                            </div>
                            <button
                                onClick={handleIngestSocial}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-base hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                                {loading ? 'Fetching...' : `Import from ${PLATFORMS.find(p => p.id === platform)?.label}`}
                            </button>
                        </>
                    )}

                    {/* ─ Text / Article ─ */}
                    {activeTab === 'text' && (
                        <>
                            <div>
                                <label className="text-sm font-semibold text-gray-300 mb-2 block">
                                    Paste Text, Articles, Interviews, or Writing Samples
                                </label>
                                <textarea
                                    value={textSample}
                                    onChange={e => setTextSample(e.target.value)}
                                    rows={10}
                                    placeholder="Paste any text here — the person's blog posts, interviews, essays, emails, social posts, book excerpts, or anything they've written. The more you provide, the better the twin!"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-400/40 transition-colors placeholder:text-gray-700 resize-none leading-relaxed"
                                />
                                <p className="text-xs text-gray-600 mt-1.5">
                                    {textSample.split(' ').filter(Boolean).length} words · Minimum 10 words required
                                </p>
                            </div>
                            <button
                                onClick={handleIngestText}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-base hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                                {loading ? 'Analyzing...' : 'Analyze & Ingest Text'}
                            </button>
                        </>
                    )}

                    {/* ─ Audio ─ */}
                    {activeTab === 'audio' && (
                        <>
                            <div>
                                <label className="text-sm font-semibold text-gray-300 mb-3 block">
                                    Voice Sample for Cloning
                                </label>
                                <div
                                    className="relative border-2 border-dashed border-white/10 rounded-2xl p-10 text-center hover:border-amber-400/30 transition-colors cursor-pointer group"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="audio/*"
                                        className="hidden"
                                        onChange={e => { const f = e.target.files?.[0]; if (f) setAudioFile(f); }}
                                    />
                                    {audioFile ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-14 h-14 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center">
                                                <Mic className="w-6 h-6 text-amber-400" />
                                            </div>
                                            <p className="text-white font-semibold">{audioFile.name}</p>
                                            <p className="text-gray-500 text-xs">{(audioFile.size / 1024).toFixed(1)} KB</p>
                                            <button
                                                onClick={e => { e.stopPropagation(); setAudioFile(null); }}
                                                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                                            >
                                                <X className="w-3 h-3" /> Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white/8 transition-colors">
                                                <Upload className="w-6 h-6 text-gray-500 group-hover:text-amber-400 transition-colors" />
                                            </div>
                                            <div>
                                                <p className="text-gray-300 font-medium">Drop audio file here or click to browse</p>
                                                <p className="text-gray-600 text-xs mt-1">MP3, WAV, M4A, WebM · Min 30 seconds recommended</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Record from mic */}
                            <div className="flex items-center gap-3">
                                <div className="h-px flex-1 bg-white/5" />
                                <span className="text-xs text-gray-600">or record directly</span>
                                <div className="h-px flex-1 bg-white/5" />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={isRecording ? stopRecording : startRecording}
                                    className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                                        isRecording
                                            ? 'bg-red-500/20 border border-red-500/40 text-red-400 animate-pulse'
                                            : 'glass border border-white/10 text-gray-300 hover:text-white hover:border-white/20'
                                    }`}
                                >
                                    {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                                </button>

                                <button
                                    onClick={() => audioFile && handleAudioUpload(audioFile)}
                                    disabled={!audioFile || loading}
                                    className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-sm hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all disabled:opacity-40"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                    {loading ? 'Uploading...' : 'Upload Voice'}
                                </button>
                            </div>
                        </>
                    )}

                    {/* Status */}
                    <AnimatePresence>
                        {result && <StatusBadge result={result} />}
                    </AnimatePresence>
                </motion.div>

                {/* Tips section */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
                >
                    {[
                        {
                            emoji: '🌐',
                            title: 'Best Web Sources',
                            desc: 'Wikipedia, personal blogs, interviews, Medium articles, company About pages',
                            color: '#22d3ee',
                        },
                        {
                            emoji: '📱',
                            title: 'Social Tips',
                            desc: 'GitHub profiles are most reliable. Reddit profiles return extensive personal writing.',
                            color: '#8b5cf6',
                        },
                        {
                            emoji: '🎙️',
                            title: 'Voice Tips',
                            desc: 'A 1–2 minute clear recording in quiet environment gives the most realistic clone.',
                            color: '#f59e0b',
                        },
                    ].map((tip, i) => (
                        <div key={i} className="glass rounded-2xl p-5">
                            <div className="text-2xl mb-2">{tip.emoji}</div>
                            <h3 className="text-white font-semibold text-sm mb-1">{tip.title}</h3>
                            <p className="text-gray-500 text-xs leading-relaxed">{tip.desc}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
