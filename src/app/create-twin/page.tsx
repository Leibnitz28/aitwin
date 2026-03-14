'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import GlassCard from '../components/GlassCard';
import {
    Mic, FileText, Brain, Rocket, Upload, CheckCircle2,
    Loader2, ArrowRight, ArrowLeft, Sparkles, AlertCircle, MicOff
} from 'lucide-react';
import { useRef } from 'react';

const DNAHelix3D = dynamic(() => import('../components/DNAHelix3D'), { ssr: false });

const STEPS = [
    { id: 1, title: 'Upload Voice', icon: Mic, desc: 'Voice sample for cloning', color: '#22d3ee' },
    { id: 2, title: 'Upload Image', icon: Upload, desc: 'Generate 3D Avatar', color: '#f472b6' },
    { id: 3, title: 'Writing', icon: FileText, desc: 'Writing style analysis', color: '#818cf8' },
    { id: 4, title: 'AI Analysis', icon: Brain, desc: 'Personality modeling', color: '#34d399' },
    { id: 5, title: 'Deploy', icon: Rocket, desc: 'Blockchain deployment', color: '#f59e0b' },
];

const AGENTS = ['Personality Analyzer', 'Writing Style Agent', 'Memory Agent', 'Response Generator', 'Voice Agent'];
const AGENT_COLORS = ['#22d3ee', '#8b5cf6', '#10b981', '#ec4899', '#f59e0b'];

const BACKEND_URL = 'http://localhost:8000';

export default function CreateTwinPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [voiceFile, setVoiceFile] = useState<File | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [writingText, setWritingText] = useState('');
    const [voiceUploaded, setVoiceUploaded] = useState(false);
    const [imageUploaded, setImageUploaded] = useState(false);
    const [avatarTaskId, setAvatarTaskId] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarProgress, setAvatarProgress] = useState(0);
    const [writingUploaded, setWritingUploaded] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisComplete, setAnalysisComplete] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [twinGenerated, setTwinGenerated] = useState(false);
    const [twinId, setTwinId] = useState('');
    const [twinName, setTwinName] = useState('');
    const [clonedVoiceId, setClonedVoiceId] = useState<string | null>(null);
    const [personalityScores, setPersonalityScores] = useState<Record<string, number> | null>(null);
    const [loading, setLoading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const handleVoiceUpload = async (file: File) => {
        setVoiceFile(file);
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('user_id', 'Piyush');
        try {
            const res = await fetch(`${BACKEND_URL}/upload-voice`, { method: 'POST', body: formData });
            if (res.ok) {
                const data = await res.json();
                if (data.voice_id) setClonedVoiceId(data.voice_id);
                setVoiceUploaded(true);
            } else alert(`Upload failed: ${await res.text()}`);
        } catch (e: unknown) {
            if (e instanceof Error) alert(`Network error: ${e.message}`);
        } finally { setLoading(false); }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('audio/')) handleVoiceUpload(file);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const file = new File([audioBlob], `recording_${Date.now()}.wav`, { type: 'audio/wav' });
                handleVoiceUpload(file);
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Failed to start recording', err);
            alert('Microphone access denied or not available.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleImageUpload = async (file: File) => {
        setImageFile(file);
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('user_id', 'Piyush');
        try {
            const res = await fetch(`${BACKEND_URL}/upload-avatar`, { method: 'POST', body: formData });
            if (res.ok) {
                const data = await res.json();
                setAvatarTaskId(data.task_id);
                // Start polling
                pollAvatarStatus(data.task_id);
            } else {
                alert(`Upload failed: ${await res.text()}`);
                setLoading(false);
            }
        } catch (e: unknown) {
            if (e instanceof Error) alert(`Network error: ${e.message}`);
            setLoading(false);
        }
    };

    const pollAvatarStatus = async (taskId: string) => {
        try {
            const res = await fetch(`${BACKEND_URL}/avatar-status/${taskId}`);
            if (res.ok) {
                const data = await res.json();
                if (data.status === 'succeeded' && data.model_url) {
                    setAvatarUrl(data.model_url);
                    setImageUploaded(true);
                    setLoading(false);
                } else if (data.status === 'failed') {
                    alert('Avatar generation failed.');
                    setLoading(false);
                } else {
                    setAvatarProgress(data.progress || 0);
                    setTimeout(() => pollAvatarStatus(taskId), 5000);
                }
            } else {
                setTimeout(() => pollAvatarStatus(taskId), 5000);
            }
        } catch {
            setTimeout(() => pollAvatarStatus(taskId), 5000);
        }
    };

    const handleWritingUpload = async () => {
        if (!writingText.trim()) return;
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/upload-writing`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: writingText, user_id: 'Piyush' }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.analysis) setPersonalityScores(data.analysis.traits);
                setWritingUploaded(true);
            }
        } catch { console.error('Writing upload error'); } finally { setLoading(false); }
    };

    const handleAnalysis = async () => {
        setAnalyzing(true);
        const start = Date.now();
        try {
            const res = await fetch(`${BACKEND_URL}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: writingText, user_id: 'Piyush' }),
            });
            if (res.ok) {
                const data = await res.json();
                setPersonalityScores(data.traits);
                setAnalysisComplete(true);
            }
        } catch { console.error('Analysis error'); } finally { setAnalyzing(false); }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const res = await fetch(`${BACKEND_URL}/create-twin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: 'Piyush',
                    name: twinName.trim() || 'My AI Twin',
                    analysis: {
                        traits: personalityScores || { openness: 80, conscientiousness: 70, extraversion: 60, agreeableness: 75, neuroticism: 40 },
                        overall_match: 94,
                        summary: 'AI Digital Twin Profile for Piyush',
                    },
                    voice_id: clonedVoiceId,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setTwinId(data.twin_id);
                setTwinGenerated(true);
            }
        } catch { console.error('Generation error'); } finally { setGenerating(false); }
    };

    const canGoNext = () => {
        if (currentStep === 1) return voiceUploaded;
        if (currentStep === 2) return imageUploaded || imageFile !== null; // allow proceeding while it bg-generates
        if (currentStep === 3) return writingUploaded;
        if (currentStep === 4) return analysisComplete;
        return false;
    };

    const traitMap = [
        { key: 'openness', label: 'Openness', color: '#22d3ee' },
        { key: 'conscientiousness', label: 'Conscientiousness', color: '#8b5cf6' },
        { key: 'extraversion', label: 'Extraversion', color: '#10b981' },
        { key: 'agreeableness', label: 'Agreeableness', color: '#f59e0b' },
        { key: 'neuroticism', label: 'Neuroticism', color: '#ec4899' },
    ];

    return (
        <div className="min-h-screen px-4 py-12">
            <div className="max-w-2xl mx-auto">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/4 border border-white/8 text-xs text-gray-400 mb-4">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        AI Twin Creation
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black mb-3">
                        <span className="gradient-text">Create Your Twin</span>
                    </h1>
                    <p className="text-gray-500 text-base">Follow the steps to build your AI personality twin</p>
                </motion.div>

                {/* Step Indicator */}
                <div className="mb-10">
                    {/* Progress bar */}
                    <div className="progress-bar mb-6">
                        <motion.div
                            animate={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="progress-fill"
                        />
                    </div>

                    {/* Step dots */}
                    <div className="flex items-start justify-between">
                        {STEPS.map((step, i) => {
                            const done = currentStep > step.id;
                            const active = currentStep === step.id;
                            return (
                                <div key={step.id} className="flex flex-col items-center gap-2 flex-1">
                                    <motion.div
                                        animate={{ scale: active ? 1.1 : 1 }}
                                        className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold transition-all ${
                                            done ? 'bg-emerald-500 text-white shadow-[0_0_16px_rgba(52,211,153,0.4)]'
                                            : active ? 'text-white shadow-[0_0_20px_rgba(34,211,238,0.4)]'
                                            : 'glass text-gray-600'
                                        }`}
                                        style={active ? {
                                            background: `linear-gradient(135deg, ${step.color}, ${step.color}bb)`
                                        } : undefined}
                                    >
                                        {done ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-4.5 h-4.5" />}
                                    </motion.div>
                                    <div className="text-center hidden sm:block">
                                        <div className={`text-xs font-semibold ${active ? 'text-white' : done ? 'text-emerald-400' : 'text-gray-600'}`}>
                                            {step.title}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    {/* ── Step 1: Voice Upload ───────────────────── */}
                    {currentStep === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
                            <GlassCard hover={false} className="text-center p-8">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-[0_0_24px_rgba(34,211,238,0.3)]">
                                    <Mic className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Upload Voice Sample</h2>
                                <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                                    Record a 30-second voice sample or upload an audio file. ElevenLabs will create a perfect voice clone.
                                </p>

                                {!voiceUploaded ? (
                                    <div className="space-y-4">
                                        {/* Drop zone */}
                                        <div
                                            onClick={() => document.getElementById('voice-upload')?.click()}
                                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                            onDragLeave={() => setDragOver(false)}
                                            onDrop={handleDrop}
                                            className={`border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all ${
                                                dragOver
                                                    ? 'border-cyan-400/60 bg-cyan-400/8'
                                                    : 'border-white/10 hover:border-cyan-400/30 hover:bg-cyan-400/4'
                                            }`}
                                        >
                                            <input id="voice-upload" type="file" accept="audio/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleVoiceUpload(f); }} className="hidden" />
                                            {loading
                                                ? <Loader2 className="w-10 h-10 text-cyan-400 mx-auto animate-spin" />
                                                : (
                                                    <>
                                                        <Upload className={`w-10 h-10 mx-auto mb-3 transition-colors ${dragOver ? 'text-cyan-400' : 'text-gray-600'}`} />
                                                        <p className="text-gray-500 text-sm">
                                                            Drop audio file here, or <span className="text-cyan-400">click to upload</span>
                                                        </p>
                                                        <p className="text-gray-700 text-xs mt-1">Supports .mp3, .wav, .m4a, .ogg — max 25MB</p>
                                                    </>
                                                )
                                            }
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="divider flex-1" />
                                            <span className="text-xs text-gray-700">or</span>
                                            <div className="divider flex-1" />
                                        </div>

                                        <button 
                                            onClick={isRecording ? stopRecording : startRecording}
                                            className={`w-full px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                                                isRecording 
                                                    ? 'bg-red-500/20 text-red-500 border border-red-500/30 animate-pulse' 
                                                    : 'glass text-cyan-400 hover:bg-cyan-400/8 border border-cyan-400/20'
                                            }`}
                                        >
                                            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                            {isRecording ? 'Stop Recording' : 'Record Now'}
                                        </button>

                                        <button
                                            onClick={() => { setVoiceUploaded(true); setVoiceFile(new File([], 'mock_voice.mp3')); }}
                                            className="text-xs text-gray-700 hover:text-gray-500 transition-colors"
                                        >
                                            Skip · Use demo voice
                                        </button>
                                    </div>
                                ) : (
                                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 rounded-full bg-emerald-400/10 flex items-center justify-center border-2 border-emerald-400/30">
                                            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                        </div>
                                        <p className="text-emerald-400 font-bold text-lg">Voice Sample Ready!</p>
                                        <p className="text-gray-600 text-sm">{voiceFile?.name || 'demo_voice.mp3'} · Ready for ElevenLabs cloning</p>
                                    </motion.div>
                                )}
                            </GlassCard>
                        </motion.div>
                    )}

                    {/* ── Step 2: Image Upload (3D Avatar) ───────────── */}
                    {currentStep === 2 && (
                        <motion.div key="step2-image" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
                            <GlassCard hover={false} className="text-center p-8">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center mx-auto mb-6 shadow-[0_0_24px_rgba(244,114,182,0.3)]">
                                    <Upload className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Upload a Photo</h2>
                                <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                                    Upload a clear front-facing photo to generate your 3D digital avatar.
                                </p>

                                {!imageUploaded && avatarTaskId === null ? (
                                    <div className="space-y-4">
                                        <div
                                            onClick={() => document.getElementById('image-upload')?.click()}
                                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                            onDragLeave={() => setDragOver(false)}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                setDragOver(false);
                                                const file = e.dataTransfer.files?.[0];
                                                if (file && file.type.startsWith('image/')) handleImageUpload(file);
                                            }}
                                            className={`border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all ${
                                                dragOver
                                                    ? 'border-pink-400/60 bg-pink-400/8'
                                                    : 'border-white/10 hover:border-pink-400/30 hover:bg-pink-400/4'
                                            }`}
                                        >
                                            <input id="image-upload" type="file" accept="image/jpeg, image/png, image/webp" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} className="hidden" />
                                            {loading
                                                ? <Loader2 className="w-10 h-10 text-pink-400 mx-auto animate-spin" />
                                                : (
                                                    <>
                                                        <Upload className={`w-10 h-10 mx-auto mb-3 transition-colors ${dragOver ? 'text-pink-400' : 'text-gray-600'}`} />
                                                        <p className="text-gray-500 text-sm">
                                                            Drop photo here, or <span className="text-pink-400">click to upload</span>
                                                        </p>
                                                        <p className="text-gray-700 text-xs mt-1">Supports .jpg, .png</p>
                                                    </>
                                                )
                                            }
                                        </div>

                                        <button
                                            onClick={() => { setImageUploaded(true); }}
                                            className="text-xs text-gray-700 hover:text-gray-500 transition-colors"
                                        >
                                            Skip · No Avatar
                                        </button>
                                    </div>
                                ) : !imageUploaded && avatarTaskId !== null ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 py-8">
                                        <div className="relative w-24 h-24">
                                            <div className="absolute inset-0 rounded-full border-4 border-white/10" />
                                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                                                <circle
                                                    cx="48" cy="48" r="46"
                                                    fill="none"
                                                    stroke="#f472b6"
                                                    strokeWidth="4"
                                                    strokeDasharray="289"
                                                    strokeDashoffset={289 - (289 * avatarProgress) / 100}
                                                    strokeLinecap="round"
                                                    className="transition-all duration-1000 ease-out"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-xl font-bold text-pink-400">{avatarProgress}%</span>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-white font-semibold">Generating 3D Avatar...</p>
                                            <p className="text-xs text-gray-500 mt-1">This takes about a minute. You can continue to the next step while we create it in the background.</p>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 rounded-full bg-emerald-400/10 flex items-center justify-center border-2 border-emerald-400/30">
                                            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                        </div>
                                        <p className="text-emerald-400 font-bold text-lg">Avatar Ready!</p>
                                        <p className="text-gray-600 text-sm">Valid 3D model generated.</p>
                                    </motion.div>
                                )}
                            </GlassCard>
                        </motion.div>
                    )}

                    {/* ── Step 3: Writing Samples ────────────────── */}
                    {currentStep === 3 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
                            <GlassCard hover={false} className="text-center p-8">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-[0_0_24px_rgba(129,140,248,0.3)]">
                                    <FileText className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Add Writing Samples</h2>
                                <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                                    Paste examples of your writing — emails, messages, essays, or social posts. The more, the better.
                                </p>

                                {!writingUploaded ? (
                                    <div className="space-y-4 text-left">
                                        <textarea
                                            placeholder="Paste your writing here — emails, notes, social posts, anything you've written..."
                                            value={writingText}
                                            onChange={e => setWritingText(e.target.value)}
                                            className="w-full h-48 rounded-xl glass p-4 text-gray-200 placeholder:text-gray-700 resize-none focus:outline-none text-sm leading-relaxed"
                                        />
                                        <div className="flex items-center justify-between text-xs text-gray-700">
                                            <span>{writingText.length} characters · {writingText.split(/\s+/).filter(Boolean).length} words</span>
                                            <span className={writingText.length < 100 ? 'text-amber-500' : 'text-emerald-400'}>
                                                {writingText.length < 100 ? `${100 - writingText.length} more to go` : 'Good sample length ✓'}
                                            </span>
                                        </div>
                                        {writingText.length > 0 && writingText.length < 50 && (
                                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-400/8 border border-amber-400/15 text-xs text-amber-400">
                                                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                                Add at least 100 characters for better personality analysis
                                            </div>
                                        )}
                                        <button
                                            onClick={handleWritingUpload}
                                            disabled={loading || writingText.trim().length < 10}
                                            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold hover:shadow-[0_0_24px_rgba(129,140,248,0.3)] disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                                            Analyze Writing Style
                                        </button>
                                    </div>
                                ) : (
                                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 rounded-full bg-emerald-400/10 flex items-center justify-center border-2 border-emerald-400/30">
                                            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                        </div>
                                        <p className="text-emerald-400 font-bold text-lg">Writing Analyzed!</p>
                                        <p className="text-gray-600 text-sm">{writingText.split(/\s+/).filter(Boolean).length} words processed and modeled</p>
                                    </motion.div>
                                )}
                            </GlassCard>
                        </motion.div>
                    )}

                    {/* ── Step 4: AI Personality Analysis ────────────── */}
                    {currentStep === 4 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
                            <GlassCard hover={false} className="text-center p-8">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center mx-auto mb-6 shadow-[0_0_24px_rgba(52,211,153,0.3)]">
                                    <Brain className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">AI Personality Analysis</h2>
                                <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm">
                                    5 specialized agents will analyze your samples to build a personality model.
                                </p>

                                {!analysisComplete ? (
                                    !analyzing ? (
                                        <button
                                            onClick={handleAnalysis}
                                            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-base hover:shadow-[0_0_30px_rgba(52,211,153,0.35)] transition-all hover:scale-105 flex items-center gap-2.5 mx-auto"
                                        >
                                            <Brain className="w-5 h-5" />
                                            Start Analysis
                                        </button>
                                    ) : (
                                        <div className="space-y-5">
                                            <DNAHelix3D />
                                            <div className="space-y-3 text-left">
                                                {AGENTS.map((agent, i) => (
                                                    <motion.div
                                                        key={agent}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: i * 0.4 }}
                                                    >
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: AGENT_COLORS[i] }} />
                                                                <span className="text-xs text-gray-300 font-medium">{agent}</span>
                                                            </div>
                                                            <span className="text-[10px] font-semibold" style={{ color: AGENT_COLORS[i] }}>Processing...</span>
                                                        </div>
                                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: '0%' }}
                                                                animate={{ width: '100%' }}
                                                                transition={{ delay: i * 0.4, duration: 2, ease: 'easeOut' }}
                                                                className="h-full rounded-full"
                                                                style={{ backgroundColor: AGENT_COLORS[i] }}
                                                            />
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-16 h-16 rounded-full bg-emerald-400/10 flex items-center justify-center border-2 border-emerald-400/30">
                                                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                            </div>
                                            <p className="text-emerald-400 font-bold text-lg">Analysis Complete!</p>
                                        </div>

                                        {/* Trait scores */}
                                        <div className="space-y-3 text-left">
                                            {traitMap.map(t => {
                                                const score = Math.round(personalityScores?.[t.key] || (Math.random() * 30 + 60));
                                                return (
                                                    <div key={t.key}>
                                                        <div className="flex justify-between mb-1.5">
                                                            <span className="text-xs text-gray-400 font-medium">{t.label}</span>
                                                            <span className="text-xs font-bold" style={{ color: t.color }}>{score}%</span>
                                                        </div>
                                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${score}%` }}
                                                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                                                className="h-full rounded-full"
                                                                style={{ backgroundColor: t.color }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="glass p-3 rounded-xl text-center">
                                            <div className="text-xs text-gray-500 mb-1">Overall Match Confidence</div>
                                            <div className="text-2xl font-black gradient-text">94%</div>
                                        </div>
                                    </motion.div>
                                )}
                            </GlassCard>
                        </motion.div>
                    )}

                    {/* ── Step 5: Generate Your AI Twin ──────────── */}
                    {currentStep === 5 && (
                        <motion.div key="step4" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
                            <GlassCard hover={false} className="text-center p-8">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-[0_0_24px_rgba(251,191,36,0.3)]">
                                    <Rocket className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Generate Your AI Twin</h2>
                                <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                                    Your personality model is ready. Deploy it as a blockchain-verified digital identity.
                                </p>

                                {!twinGenerated ? (
                                    !generating ? (
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2">Name Your Twin</label>
                                                <input 
                                                    type="text" 
                                                    value={twinName} 
                                                    onChange={e => setTwinName(e.target.value)}
                                                    className="w-full max-w-sm mx-auto bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all text-center text-lg font-semibold placeholder:text-gray-600 block"
                                                    placeholder="e.g. Creative Assistant"
                                                />
                                            </div>
                                            <button
                                                onClick={handleGenerate}
                                                className="px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-base hover:shadow-[0_0_30px_rgba(251,191,36,0.35)] transition-all hover:scale-105 flex items-center gap-2.5 mx-auto"
                                            >
                                                <Rocket className="w-5 h-5" />
                                                Deploy Twin
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <Loader2 className="w-14 h-14 text-amber-400 mx-auto animate-spin" />
                                            <p className="text-gray-500 text-sm">Deploying your AI twin to the network...</p>
                                            <div className="flex justify-center gap-1">
                                                {['Packaging', 'Uploading', 'Minting', 'Verifying'].map((s, i) => (
                                                    <motion.span
                                                        key={s}
                                                        initial={{ opacity: 0.3 }}
                                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                                        transition={{ delay: i * 0.4, duration: 1.6, repeat: Infinity }}
                                                        className="text-[10px] text-gray-600 font-medium"
                                                    >
                                                        {s}{i < 3 ? ' · ' : ''}
                                                    </motion.span>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6">
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mx-auto text-3xl font-black text-white shadow-[0_0_40px_rgba(34,211,238,0.4)]">
                                            PT
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-white mb-1">Twin Deployed! 🎉</p>
                                            <p className="text-gray-500 text-sm">Your AI Personality Twin is live on the blockchain.</p>
                                        </div>
                                        <div className="glass p-4 rounded-xl inline-block">
                                            <p className="text-[10px] text-gray-600 mb-1 uppercase tracking-wider">Twin ID</p>
                                            <p className="text-cyan-400 font-mono text-sm">{twinId || '0x7a3b...f92e'}</p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                            <button
                                                onClick={() => window.location.href = `/chat-3d?twinId=${twinId}`}
                                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all flex items-center gap-2 justify-center"
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                Start Chatting
                                            </button>
                                            <button
                                                onClick={() => window.location.href = '/dashboard'}
                                                className="px-6 py-3 rounded-xl glass text-gray-400 font-semibold hover:text-white transition-all"
                                            >
                                                View Dashboard
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-6">
                    <button
                        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                        disabled={currentStep === 1}
                        className="px-5 py-2.5 rounded-xl glass text-gray-500 font-semibold disabled:opacity-30 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2 text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Previous
                    </button>

                    <div className="text-xs text-gray-700">Step {currentStep} of {STEPS.length}</div>

                    {currentStep < STEPS.length && (
                        <button
                            onClick={() => setCurrentStep(Math.min(STEPS.length, currentStep + 1))}
                            disabled={!canGoNext()}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold disabled:opacity-30 hover:shadow-[0_0_20px_rgba(34,211,238,0.25)] transition-all flex items-center gap-2 text-sm"
                        >
                            Next
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                    {currentStep === STEPS.length && <div className="w-[89px]" />}
                </div>
            </div>
        </div>
    );
}
