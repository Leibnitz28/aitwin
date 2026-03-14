'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import GlassCard from '../components/GlassCard';
import Link from 'next/link';
import {
    Brain, Mic, MessageSquare, Shield, Activity, Zap, ExternalLink,
    ArrowRight, TrendingUp, Clock, Cpu, ChevronRight
} from 'lucide-react';
import { useState, useEffect } from 'react';

const DashboardOrb3D = dynamic(() => import('../components/DashboardOrb3D'), { ssr: false });

function AnimatedCounter({ target, suffix = '' }: { target: number, suffix?: string }) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        let start: number | null = null;
        const animate = (ts: number) => {
            if (!start) start = ts;
            const prog = Math.min((ts - start) / 1200, 1);
            const ease = 1 - Math.pow(1 - prog, 3);
            setVal(Math.round(target * ease));
            if (prog < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        return () => {};
    }, [target]);
    return <>{val}{suffix}</>;
}

const stats = [
    { label: 'Personality Score', value: 94, suffix: '%', icon: Brain, color: 'from-cyan-400 to-blue-500', glow: '#22d3ee', trend: '+2.1%' },
    { label: 'Voice Fidelity', value: 97, suffix: '%', icon: Mic, color: 'from-indigo-400 to-blue-500', glow: '#818cf8', trend: '+0.8%' },
    { label: 'Conversations', value: 142, suffix: '', icon: MessageSquare, color: 'from-emerald-400 to-cyan-500', glow: '#10b981', trend: '+12' },
    { label: 'Blockchain ID', value: 100, suffix: '%', icon: Shield, color: 'from-amber-400 to-orange-500', glow: '#f59e0b', trend: 'Verified' },
];

const agentActivity = [
    { agent: 'Personality Analyzer', action: 'Processed 23 new writing samples', time: '2m ago', color: '#22d3ee', icon: Brain },
    { agent: 'Memory Agent', action: 'Updated long-term conversation memory', time: '5m ago', color: '#10b981', icon: Cpu },
    { agent: 'Voice Agent', action: 'Voice model fine-tuned successfully', time: '12m ago', color: '#f59e0b', icon: Mic },
    { agent: 'Response Generator', action: 'Calibrated response patterns (v3.2)', time: '1h ago', color: '#ec4899', icon: Zap },
    { agent: 'Writing Style Agent', action: 'Style profile updated with new data', time: '2h ago', color: '#8b5cf6', icon: Activity },
];

const quickActions = [
    { href: '/chat', icon: MessageSquare, label: 'Chat with Twin', desc: 'Text conversation', color: '#22d3ee', gradient: 'from-cyan-500/20 to-blue-600/20', border: 'rgba(34,211,238,0.2)' },
    { href: '/voice', icon: Mic, label: 'Talk with Twin', desc: 'Voice conversation', color: '#818cf8', gradient: 'from-indigo-500/20 to-blue-600/20', border: 'rgba(129,140,248,0.2)' },
    { href: '/blockchain', icon: Shield, label: 'Deploy Identity', desc: 'Mint NFT on-chain', color: '#34d399', gradient: 'from-emerald-500/20 to-cyan-600/20', border: 'rgba(52,211,153,0.2)' },
];

export default function DashboardPage() {
    return (
        <div className="min-h-screen px-4 py-12">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-10"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <p className="text-sm text-gray-600 font-medium mb-1">Welcome back,</p>
                            <h1 className="text-4xl sm:text-5xl font-black">
                                <span className="gradient-text">Piyush</span>
                            </h1>
                            <p className="text-gray-500 mt-1.5">Your EchoSoul is online and performing at peak accuracy.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-400/8 border border-emerald-400/15">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-sm text-emerald-400 font-semibold">All Systems Online</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 3D Orb */}
                <DashboardOrb3D />

                {/* Twin Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="glass-elevated mb-6 p-6 sm:p-8"
                >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-2xl font-black text-white shadow-[0_0_30px_rgba(34,211,238,0.25)]">
                                PT
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#020209]" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-bold text-white mb-1">Piyush's EchoSoul</h2>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                <Clock className="w-3.5 h-3.5" />
                                Created March 13, 2026 · Last active 2 minutes ago
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="tag-pill badge-online">● Online</span>
                                <span className="tag-pill badge-active">Voice Model Active</span>
                                <span className="tag-pill badge-verified">Blockchain Verified</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                            <Link href="/analytics">
                                <button className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
                                    <TrendingUp className="w-4 h-4" />
                                    Analytics
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {stats.map((stat, i) => (
                        <GlassCard key={i} delay={i * 0.08} accentColor={stat.glow}>
                            <div className="flex items-center justify-between mb-4">
                                <div
                                    className={`icon-box bg-gradient-to-br ${stat.color}`}
                                    style={{ boxShadow: `0 0 16px ${stat.glow}30` }}
                                >
                                    <stat.icon className="w-5 h-5 text-white" />
                                </div>
                                <span
                                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                    style={{ color: stat.glow, background: `${stat.glow}12` }}
                                >
                                    {stat.trend}
                                </span>
                            </div>
                            <div className="text-2xl font-black text-white">
                                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                            </div>
                            <div className="text-xs text-gray-600 mt-1 font-medium">{stat.label}</div>
                        </GlassCard>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {quickActions.map((action, i) => (
                        <Link key={i} href={action.href}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + i * 0.08 }}
                                whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
                                className="glass p-6 text-center cursor-pointer group transition-all relative overflow-hidden"
                                style={{ border: `1px solid ${action.border}` }}
                            >
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{ background: `radial-gradient(circle at 50% 0%, ${action.color}08, transparent)` }}
                                />
                                <div
                                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                                    style={{ border: `1px solid ${action.border}` }}
                                >
                                    <action.icon className="w-7 h-7" style={{ color: action.color }} />
                                </div>
                                <h3 className="text-white font-bold text-base mb-1">{action.label}</h3>
                                <p className="text-gray-600 text-xs mb-3">{action.desc}</p>
                                <div className="flex items-center justify-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: action.color }}>
                                    Open <ChevronRight className="w-3.5 h-3.5" />
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>

                {/* Agent Activity Feed */}
                <GlassCard hover={false}>
                    <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-400" />
                        Agent Activity
                        <span className="ml-auto text-xs text-gray-600 font-normal">Live feed</span>
                    </h3>
                    <div className="space-y-1">
                        {agentActivity.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + i * 0.07 }}
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    {/* Timeline dot */}
                                    <div className="relative flex-shrink-0">
                                        <div
                                            className="w-2.5 h-2.5 rounded-full"
                                            style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}` }}
                                        />
                                    </div>
                                    <div>
                                        <span className="text-sm text-white font-semibold">{item.agent}</span>
                                        <p className="text-xs text-gray-600">{item.action}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-[10px] text-gray-700 tabular-nums">{item.time}</span>
                                    <ArrowRight className="w-3.5 h-3.5 text-gray-800 group-hover:text-gray-500 transition-colors" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
