'use client';

import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import GlassCard from './components/GlassCard';
import { useRef, useEffect, useState } from 'react';
import {
    Brain, Mic, Shield, Cloud, BarChart3, ArrowRight, Zap,
    Globe, Lock, Sparkles, ChevronRight, Star, GitBranch, Activity
} from 'lucide-react';

const HeroBrain3D = dynamic(() => import('./components/HeroBrain3D'), { ssr: false });

/* ─── Data ────────────────────────────────────────────── */
const features = [
    {
        icon: Brain,
        title: 'Multi-Agent AI System',
        desc: 'Powered by IQ AI with 5 specialized agents working in harmony to replicate your personality with uncanny accuracy.',
        color: 'from-cyan-400 to-blue-500',
        glow: 'rgba(34, 211, 238, 0.25)',
        accent: '#22d3ee',
        tag: 'Core Engine',
    },
    {
        icon: Mic,
        title: 'Voice Cloning',
        desc: 'ElevenLabs voice synthesis creates a perfect digital replica of your voice patterns, tone, and cadence.',
        color: 'from-blue-400 to-indigo-500',
        glow: 'rgba(139, 92, 246, 0.25)',
        accent: '#818cf8',
        tag: 'ElevenLabs',
    },
    {
        icon: Shield,
        title: 'Blockchain Identity',
        desc: 'Ethereum-secured digital identity with verifiable ownership, provenance, and immutable proof of creation.',
        color: 'from-emerald-400 to-cyan-500',
        glow: 'rgba(52, 211, 153, 0.25)',
        accent: '#34d399',
        tag: 'Ethereum',
    },
    {
        icon: Cloud,
        title: 'Cloud Infrastructure',
        desc: 'Google Cloud provides scalable, low-latency infrastructure for real-time AI processing at global scale.',
        color: 'from-sky-400 to-blue-500',
        glow: 'rgba(56, 189, 248, 0.25)',
        accent: '#38bdf8',
        tag: 'Google Cloud',
    },
    {
        icon: BarChart3,
        title: 'Data Intelligence',
        desc: 'Snowflake analytics engine provides deep insights into personality patterns and behavioral evolution over time.',
        color: 'from-amber-400 to-orange-500',
        glow: 'rgba(245, 158, 11, 0.25)',
        accent: '#fbbf24',
        tag: 'Snowflake',
    },
];

const agents = [
    { name: 'Personality Analyzer', role: 'Analyzes Big-5 traits from writing & voice', color: '#22d3ee', pulse: true },
    { name: 'Writing Style Agent', role: 'Matches tone, vocabulary & syntax patterns', color: '#8b5cf6', pulse: true },
    { name: 'Memory Agent', role: 'Maintains long-term conversational context', color: '#10b981', pulse: true },
    { name: 'Response Generator', role: 'Generates persona-accurate replies', color: '#ec4899', pulse: true },
    { name: 'Voice Agent', role: 'Synthesizes cloned voice with ElevenLabs', color: '#f59e0b', pulse: true },
];

const steps = [
    { step: '01', title: 'Upload Voice', desc: 'Record or upload a 30-second voice sample', icon: Mic, color: '#22d3ee' },
    { step: '02', title: 'Writing Samples', desc: 'Provide text samples of your writing style', icon: Globe, color: '#8b5cf6' },
    { step: '03', title: 'AI Analysis', desc: '5 agents analyze your personality profile', icon: Brain, color: '#10b981' },
    { step: '04', title: 'Deploy Twin', desc: 'Mint your blockchain-verified AI identity', icon: Lock, color: '#f59e0b' },
];

/* ─── Animated Counter ───────────────────────────────── */
function AnimatedCounter({ target, suffix = '' }: { target: string | number, suffix?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });
    const [display, setDisplay] = useState('0');
    const numericTarget = parseFloat(String(target).replace(/[^0-9.]/g, ''));
    const prefix = String(target).replace(/[0-9.]/g, '').replace(suffix, '');

    useEffect(() => {
        if (!inView) return;
        const isFloat = String(target).includes('.');
        let startTime: number | null = null;
        const duration = 1500;

        const animate = (ts: number) => {
            if (!startTime) startTime = ts;
            const progress = Math.min((ts - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            const current = numericTarget * ease;
            setDisplay(isFloat ? current.toFixed(1) : Math.round(current).toString());
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [inView, numericTarget, target]);

    return <span ref={ref}>{prefix}{display}{suffix}</span>;
}

/* ─── Agent Node ─────────────────────────────────────── */
function AgentNode({ agent, index }: { agent: typeof agents[0], index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ x: 6, transition: { duration: 0.2 } }}
            className="glass flex items-center gap-4 p-4 hover:bg-white/[0.03] transition-all cursor-default group"
        >
            {/* Status dot */}
            <div className="relative flex-shrink-0">
                <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: agent.color, boxShadow: `0 0 8px ${agent.color}` }}
                />
                <div
                    className="absolute inset-0 rounded-full animate-ping"
                    style={{ backgroundColor: agent.color, opacity: 0.3 }}
                />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm">{agent.name}</span>
                </div>
                <p className="text-gray-500 text-xs mt-0.5 truncate">{agent.role}</p>
            </div>

            {/* Active badge */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                    style={{ color: agent.color, background: `${agent.color}15`, border: `1px solid ${agent.color}25` }}
                >
                    Active
                </span>
                <Zap className="w-4 h-4 text-gray-700 group-hover:text-yellow-400 transition-colors" />
            </div>
        </motion.div>
    );
}

/* ─── Main Component ─────────────────────────────────── */
export default function LandingPage() {
    const stats = [
        { value: 5, label: 'AI Agents', suffix: '' },
        { value: 99.2, label: 'Accuracy', suffix: '%' },
        { value: 2, label: 'Response', suffix: 's' },
        { value: 'Web3', label: 'Verified', suffix: '' },
    ];

    return (
        <div className="relative">

            {/* ── Hero ───────────────────────────────────────── */}
            <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 overflow-hidden">

                {/* Ambient orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none" />
                <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-blue-600/5 blur-[80px] pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-600/3 blur-[120px] pointer-events-none" />

                <div className="max-w-6xl mx-auto text-center relative z-10 w-full">

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass border border-white/10 mb-8"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-sm text-gray-300 font-medium">Powered by EchoSoul Multi-Agent System</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="text-5xl sm:text-7xl lg:text-8xl font-black mb-6 leading-[1.05] tracking-tight"
                    >
                        <span className="text-white">Create Your</span>
                        <br />
                        <span className="gradient-text tracking-[0.05em] uppercase">ECHO SOUL</span>
                    </motion.h1>

                    {/* 3D Brain */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="relative"
                    >
                        <HeroBrain3D />
                    </motion.div>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                    >
                        Upload your voice and writing samples. Our agents analyze, replicate, and deploy
                        your personality as a{' '}
                        <span className="text-cyan-400 font-medium">blockchain-verified</span> EchoSoul replica.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16"
                    >
                        <Link href="/create-twin">
                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-base hover:shadow-[0_0_40px_rgba(34,211,238,0.35)] transition-shadow flex items-center gap-2.5"
                            >
                                <Sparkles className="w-4 h-4" />
                                Create Your Twin
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                        </Link>
                        <Link href="/dashboard">
                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                className="px-8 py-4 rounded-2xl glass-strong text-gray-300 font-semibold text-base hover:text-white hover:bg-white/8 border border-white/8 hover:border-white/15 transition-all flex items-center gap-2"
                            >
                                <Activity className="w-4 h-4 text-cyan-400" />
                                View Dashboard
                            </motion.button>
                        </Link>
                    </motion.div>

                    {/* Stats Row */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.9 }}
                        className="flex items-center justify-center flex-wrap gap-x-10 gap-y-6"
                    >
                        {stats.map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-2xl sm:text-3xl font-black gradient-text">
                                    {typeof stat.value === 'number'
                                        ? <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                                        : stat.value
                                    }
                                </div>
                                <div className="text-xs text-gray-600 mt-1 font-medium tracking-wide uppercase">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                >
                    <span className="text-xs text-gray-700 uppercase tracking-widest">Scroll</span>
                    <motion.div
                        animate={{ y: [0, 6, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-0.5 h-8 bg-gradient-to-b from-cyan-400/40 to-transparent rounded-full"
                    />
                </motion.div>
            </section>

            {/* ── Divider ──────────────────────────────────────── */}
            <div className="divider mx-auto max-w-4xl" />

            {/* ── Tech Stack Features ──────────────────────────── */}
            <section className="py-24 px-4">
                <div className="max-w-6xl mx-auto">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/4 border border-white/8 text-xs text-gray-400 font-medium mb-4">
                            <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
                            Enterprise Stack
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-bold mb-4">
                            <span className="gradient-text">Technology Stack</span>
                        </h2>
                        <p className="text-gray-500 text-lg max-w-xl mx-auto">
                            World-class technologies orchestrated in perfect harmony
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((f, i) => (
                            <GlassCard
                                key={i}
                                delay={i * 0.08}
                                accentColor={f.accent}
                                className="group cursor-pointer hover:border-white/10 transition-colors"
                            >
                                {/* Icon + Tag */}
                                <div className="flex items-start justify-between mb-5">
                                    <div
                                        className={`icon-box bg-gradient-to-br ${f.color}`}
                                        style={{ boxShadow: `0 0 20px ${f.glow}` }}
                                    >
                                        <f.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <span
                                        className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                                        style={{ color: f.accent, background: `${f.accent}12`, border: `1px solid ${f.accent}20` }}
                                    >
                                        {f.tag}
                                    </span>
                                </div>
                                <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>

                                {/* Hover arrow */}
                                <div className="flex items-center gap-1 mt-4 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: f.accent }}>
                                    Learn more <ArrowRight className="w-3 h-3" />
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Agent Architecture ───────────────────────────── */}
            <section className="py-24 px-4 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/3 to-transparent pointer-events-none" />
                <div className="max-w-3xl mx-auto relative z-10">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/4 border border-white/8 text-xs text-gray-400 font-medium mb-4">
                            <Activity className="w-3.5 h-3.5 text-emerald-400" />
                            Live Network
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-bold mb-4">
                            <span className="gradient-text">Multi-Agent Architecture</span>
                        </h2>
                        <p className="text-gray-500 text-lg">
                            5 specialized AI agents working in parallel to replicate you
                        </p>
                    </motion.div>

                    <div className="space-y-3">
                        {agents.map((agent, i) => (
                            <AgentNode key={i} agent={agent} index={i} />
                        ))}
                    </div>

                    {/* Collective stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                        className="mt-8 grid grid-cols-3 gap-4"
                    >
                        {[
                            { label: 'Agent Uptime', value: '99.9%', color: '#34d399' },
                            { label: 'Avg Latency', value: '< 2s', color: '#22d3ee' },
                            { label: 'Accuracy', value: '94.2%', color: '#8b5cf6' },
                        ].map((s, i) => (
                            <div key={i} className="glass p-4 text-center">
                                <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
                                <div className="text-xs text-gray-600 mt-1">{s.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── How It Works ─────────────────────────────────── */}
            <section className="py-24 px-4">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/4 border border-white/8 text-xs text-gray-400 font-medium mb-4">
                            <Star className="w-3.5 h-3.5 text-amber-400" />
                            Simple Process
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-bold mb-4">
                            <span className="gradient-text">How It Works</span>
                        </h2>
                        <p className="text-gray-500 text-lg">From raw data to living digital twin in 4 steps</p>
                    </motion.div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {steps.map((s, i) => (
                            <GlassCard key={i} delay={i * 0.12} className="relative">
                                {/* Step number */}
                                <div
                                    className="text-5xl font-black mb-3 leading-none"
                                    style={{
                                        background: `linear-gradient(135deg, ${s.color}, ${s.color}50)`,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}
                                >
                                    {s.step}
                                </div>
                                <s.icon className="w-7 h-7 mb-3" style={{ color: s.color }} />
                                <h3 className="text-white font-bold text-base mb-1.5">{s.title}</h3>
                                <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>

                                {/* Connector arrow for non-last items */}
                                {i < steps.length - 1 && (
                                    <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                                        <ChevronRight className="w-4 h-4 text-gray-700" />
                                    </div>
                                )}
                            </GlassCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA Banner ───────────────────────────────────── */}
            <section className="py-24 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative glass-elevated p-12 sm:p-16 text-center overflow-hidden"
                    >
                        {/* Background glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-600/5 to-purple-600/5 pointer-events-none" />
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-xs text-cyan-400 font-semibold mb-6">
                                <Sparkles className="w-3.5 h-3.5" />
                                Limited Early Access
                            </div>
                            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">
                                Ready to Create Your<br />
                                <span className="gradient-text">EchoSoul?</span>
                            </h2>
                            <p className="text-gray-400 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
                                Join the frontier of digital identity. Your EchoSoul is waiting to be born — immortalized on the blockchain.
                            </p>
                            <Link href="/create-twin">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg hover:shadow-[0_0_50px_rgba(34,211,238,0.4)] transition-shadow inline-flex items-center gap-2.5"
                                >
                                    <Sparkles className="w-5 h-5" />
                                    Get Started Free
                                    <ArrowRight className="w-5 h-5" />
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Footer ───────────────────────────────────────── */}
            <footer className="py-12 px-4 border-t border-white/5">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                                <Brain className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-white text-sm">EchoSoul</span>
                        </div>
                        <p className="text-gray-700 text-xs text-center">
                            © 2026 EchoSoul. Built with ElevenLabs, Ethereum, Google Cloud & Snowflake.
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-700">
                            <span className="hover:text-gray-400 cursor-pointer transition-colors">Privacy</span>
                            <span className="hover:text-gray-400 cursor-pointer transition-colors">Terms</span>
                            <span className="hover:text-gray-400 cursor-pointer transition-colors">Docs</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
