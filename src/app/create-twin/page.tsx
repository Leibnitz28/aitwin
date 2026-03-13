'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import GlassCard from '../components/GlassCard';
import { Mic, FileText, Brain, Rocket, Upload, CheckCircle2, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

const DNAHelix3D = dynamic(() => import('../components/DNAHelix3D'), { ssr: false });

const steps = [
    { id: 1, title: 'Upload Voice', icon: Mic, desc: 'Record or upload a voice sample for cloning' },
    { id: 2, title: 'Writing Samples', icon: FileText, desc: 'Upload text samples of your writing style' },
    { id: 3, title: 'AI Analysis', icon: Brain, desc: 'Our agents analyze your personality traits' },
    { id: 4, title: 'Generate Twin', icon: Rocket, desc: 'Your AI twin is ready to deploy' },
];

export default function CreateTwinPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [voiceUploaded, setVoiceUploaded] = useState(false);
    const [writingUploaded, setWritingUploaded] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisComplete, setAnalysisComplete] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [twinGenerated, setTwinGenerated] = useState(false);

    const handleVoiceUpload = () => {
        setVoiceUploaded(true);
    };

    const handleWritingUpload = () => {
        setWritingUploaded(true);
    };

    const handleAnalysis = () => {
        setAnalyzing(true);
        setTimeout(() => {
            setAnalyzing(false);
            setAnalysisComplete(true);
        }, 3000);
    };

    const handleGenerate = () => {
        setGenerating(true);
        setTimeout(() => {
            setGenerating(false);
            setTwinGenerated(true);
        }, 3000);
    };

    return (
        <div className="min-h-screen px-4 py-12">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl sm:text-5xl font-bold mb-3">
                        <span className="gradient-text">Create Your Twin</span>
                    </h1>
                    <p className="text-gray-400 text-lg">Follow the steps to build your AI personality twin</p>
                </motion.div>

                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-2 mb-12">
                    {steps.map((step, i) => (
                        <div key={step.id} className="flex items-center">
                            <motion.div
                                animate={{
                                    scale: currentStep === step.id ? 1.1 : 1,
                                }}
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${currentStep > step.id
                                    ? 'bg-emerald-500 text-white'
                                    : currentStep === step.id
                                        ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_20px_rgba(0,245,255,0.3)]'
                                        : 'glass text-gray-500'
                                    }`}
                            >
                                {currentStep > step.id ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                            </motion.div>
                            {i < steps.length - 1 && (
                                <div
                                    className={`w-12 sm:w-20 h-0.5 mx-1 transition-colors ${currentStep > step.id ? 'bg-emerald-500' : 'bg-white/10'
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    {/* Step 1: Voice Upload */}
                    {currentStep === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                        >
                            <GlassCard hover={false} className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mx-auto mb-6">
                                    <Mic className="w-10 h-10 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Upload Voice Sample</h2>
                                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                                    Record a 30-second voice sample or upload an audio file. ElevenLabs will create a perfect voice clone.
                                </p>

                                {!voiceUploaded ? (
                                    <div className="space-y-4">
                                        <div
                                            onClick={handleVoiceUpload}
                                            className="border-2 border-dashed border-white/10 rounded-2xl p-12 cursor-pointer hover:border-cyan-400/30 hover:bg-cyan-400/5 transition-all group"
                                        >
                                            <Upload className="w-12 h-12 text-gray-600 mx-auto mb-3 group-hover:text-cyan-400 transition-colors" />
                                            <p className="text-gray-500 group-hover:text-gray-300 transition-colors">
                                                Click to upload audio file (.mp3, .wav, .m4a)
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleVoiceUpload}
                                            className="px-6 py-3 rounded-xl glass text-cyan-400 font-semibold hover:bg-cyan-400/10 transition-all flex items-center gap-2 mx-auto"
                                        >
                                            <Mic className="w-5 h-5" />
                                            Record Now
                                        </button>
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="flex flex-col items-center gap-3"
                                    >
                                        <CheckCircle2 className="w-16 h-16 text-emerald-400" />
                                        <p className="text-emerald-400 font-semibold text-lg">Voice sample uploaded!</p>
                                        <p className="text-gray-500 text-sm">voice_sample_prince.wav — 32 seconds</p>
                                    </motion.div>
                                )}
                            </GlassCard>
                        </motion.div>
                    )}

                    {/* Step 2: Writing Samples */}
                    {currentStep === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                        >
                            <GlassCard hover={false} className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mx-auto mb-6">
                                    <FileText className="w-10 h-10 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Upload Writing Samples</h2>
                                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                                    Provide examples of your writing style — emails, messages, essays, or social posts.
                                </p>

                                {!writingUploaded ? (
                                    <div className="space-y-4">
                                        <div
                                            onClick={handleWritingUpload}
                                            className="border-2 border-dashed border-white/10 rounded-2xl p-12 cursor-pointer hover:border-purple-400/30 hover:bg-purple-400/5 transition-all group"
                                        >
                                            <Upload className="w-12 h-12 text-gray-600 mx-auto mb-3 group-hover:text-purple-400 transition-colors" />
                                            <p className="text-gray-500 group-hover:text-gray-300 transition-colors">
                                                Upload text files (.txt, .pdf, .docx) or paste text
                                            </p>
                                        </div>
                                        <textarea
                                            placeholder="Or paste your writing samples here..."
                                            className="w-full h-32 rounded-xl glass p-4 text-gray-300 placeholder:text-gray-600 resize-none focus:outline-none focus:border-purple-400/30"
                                            style={{ background: 'rgba(15, 15, 35, 0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
                                            onInput={() => setWritingUploaded(true)}
                                        />
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="flex flex-col items-center gap-3"
                                    >
                                        <CheckCircle2 className="w-16 h-16 text-emerald-400" />
                                        <p className="text-emerald-400 font-semibold text-lg">Writing samples received!</p>
                                        <p className="text-gray-500 text-sm">3 documents processed — 4,280 words analyzed</p>
                                    </motion.div>
                                )}
                            </GlassCard>
                        </motion.div>
                    )}

                    {/* Step 3: AI Analysis */}
                    {currentStep === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                        >
                            <GlassCard hover={false} className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center mx-auto mb-6">
                                    <Brain className="w-10 h-10 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">AI Personality Analysis</h2>
                                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                                    Our 5 AI agents are analyzing your samples to build your personality profile.
                                </p>

                                {!analysisComplete ? (
                                    <div>
                                        {!analyzing ? (
                                            <button
                                                onClick={handleAnalysis}
                                                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all hover:scale-105"
                                            >
                                                Start Analysis
                                            </button>
                                        ) : (
                                            <div className="space-y-6">
                                                <DNAHelix3D />
                                                {['Personality Analyzer', 'Writing Style Agent', 'Memory Agent', 'Response Generator', 'Voice Agent'].map((agent, i) => (
                                                    <motion.div
                                                        key={agent}
                                                        initial={{ opacity: 0, width: '0%' }}
                                                        animate={{ opacity: 1, width: '100%' }}
                                                        transition={{ delay: i * 0.4, duration: 0.5 }}
                                                        className="text-left"
                                                    >
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-sm text-gray-300">{agent}</span>
                                                            <span className="text-xs text-cyan-400">Processing...</span>
                                                        </div>
                                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: '0%' }}
                                                                animate={{ width: '100%' }}
                                                                transition={{ delay: i * 0.4, duration: 2 }}
                                                                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500"
                                                            />
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="space-y-6"
                                    >
                                        <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
                                        <p className="text-emerald-400 font-semibold text-lg">Analysis Complete!</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { trait: 'Openness', score: 87 },
                                                { trait: 'Conscientiousness', score: 72 },
                                                { trait: 'Extraversion', score: 65 },
                                                { trait: 'Agreeableness', score: 81 },
                                                { trait: 'Neuroticism', score: 38 },
                                                { trait: 'Overall Match', score: 94 },
                                            ].map(t => (
                                                <div key={t.trait} className="glass p-3 rounded-xl">
                                                    <div className="text-xs text-gray-500 mb-1">{t.trait}</div>
                                                    <div className="text-xl font-bold gradient-text">{t.score}%</div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </GlassCard>
                        </motion.div>
                    )}

                    {/* Step 4: Generate Twin */}
                    {currentStep === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                        >
                            <GlassCard hover={false} className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-400 to-orange-500 flex items-center justify-center mx-auto mb-6">
                                    <Rocket className="w-10 h-10 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Generate Your AI Twin</h2>
                                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                                    Your twin is ready to be created and deployed on the blockchain.
                                </p>

                                {!twinGenerated ? (
                                    !generating ? (
                                        <button
                                            onClick={handleGenerate}
                                            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] transition-all hover:scale-105"
                                        >
                                            🚀 Generate Twin
                                        </button>
                                    ) : (
                                        <div className="space-y-4">
                                            <Loader2 className="w-16 h-16 text-pink-400 mx-auto animate-spin" />
                                            <p className="text-gray-400">Deploying your AI twin to the network...</p>
                                        </div>
                                    )
                                ) : (
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="space-y-4"
                                    >
                                        <div className="text-6xl mb-4">🎉</div>
                                        <p className="text-2xl font-bold text-white">Twin Generated!</p>
                                        <p className="text-gray-400">Your AI Personality Twin is live and ready.</p>
                                        <div className="glass p-4 rounded-xl inline-block">
                                            <p className="text-xs text-gray-500">Twin ID</p>
                                            <p className="text-cyan-400 font-mono text-sm">0x7a3b...f92e</p>
                                        </div>
                                    </motion.div>
                                )}
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8">
                    <button
                        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                        disabled={currentStep === 1}
                        className="px-6 py-3 rounded-xl glass text-gray-400 font-semibold disabled:opacity-30 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Previous
                    </button>
                    <button
                        onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                        disabled={currentStep === 4}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold disabled:opacity-30 hover:shadow-[0_0_20px_rgba(0,245,255,0.2)] transition-all flex items-center gap-2"
                    >
                        Next
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
