'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import GlassCard from '../components/GlassCard';
import Link from 'next/link';
import { Brain, Mic, MessageSquare, Shield, Activity, Zap, ExternalLink, Users } from 'lucide-react';

const DashboardOrb3D = dynamic(() => import('../components/DashboardOrb3D'), { ssr: false });

export default function DashboardPage() {
    return (
        <div className="min-h-screen px-4 py-12">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-4xl sm:text-5xl font-bold mb-3">
                        <span className="gradient-text">Twin Dashboard</span>
                    </h1>
                    <p className="text-gray-400 text-lg">Manage and interact with your AI personality twin</p>
                </motion.div>

                {/* 3D Orb */}
                <DashboardOrb3D />

                {/* Twin Profile Card */}
                <GlassCard hover={false} className="mb-8 p-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-3xl font-black text-white shadow-[0_0_30px_rgba(0,245,255,0.2)]">
                            PT
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-white mb-1">Prince&apos;s AI Twin</h2>
                            <p className="text-gray-400 mb-3">Created March 13, 2026 • Last active 2 minutes ago</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-400/10 text-emerald-400">
                                    ● Online
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-cyan-400/10 text-cyan-400">
                                    Voice Model Active
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-400/10 text-purple-400">
                                    Blockchain Verified
                                </span>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Personality Score', value: '94%', icon: Brain, color: 'from-cyan-400 to-blue-500', glow: 'rgba(0,245,255,0.15)' },
                        { label: 'Voice Fidelity', value: '97%', icon: Mic, color: 'from-purple-400 to-pink-500', glow: 'rgba(139,92,246,0.15)' },
                        { label: 'Conversations', value: '142', icon: MessageSquare, color: 'from-emerald-400 to-cyan-500', glow: 'rgba(16,185,129,0.15)' },
                        { label: 'Blockchain ID', value: 'Verified', icon: Shield, color: 'from-amber-400 to-orange-500', glow: 'rgba(245,158,11,0.15)' },
                    ].map((stat, i) => (
                        <GlassCard key={i} delay={i * 0.1}>
                            <div className="flex items-center gap-3 mb-3">
                                <div
                                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                                    style={{ boxShadow: `0 0 15px ${stat.glow}` }}
                                >
                                    <stat.icon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                        </GlassCard>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <Link href="/chat">
                        <GlassCard className="cursor-pointer group text-center">
                            <MessageSquare className="w-10 h-10 text-cyan-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                            <h3 className="text-white font-bold text-lg mb-1">Chat with Twin</h3>
                            <p className="text-gray-500 text-sm">Text conversation with your AI twin</p>
                        </GlassCard>
                    </Link>
                    <Link href="/voice">
                        <GlassCard className="cursor-pointer group text-center" delay={0.1}>
                            <Mic className="w-10 h-10 text-purple-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                            <h3 className="text-white font-bold text-lg mb-1">Talk with Twin</h3>
                            <p className="text-gray-500 text-sm">Voice conversation with cloned voice</p>
                        </GlassCard>
                    </Link>
                    <Link href="/blockchain">
                        <GlassCard className="cursor-pointer group text-center" delay={0.2}>
                            <Shield className="w-10 h-10 text-emerald-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                            <h3 className="text-white font-bold text-lg mb-1">Deploy Identity</h3>
                            <p className="text-gray-500 text-sm">Mint blockchain-verified identity</p>
                        </GlassCard>
                    </Link>
                </div>

                {/* Agent Activity */}
                <GlassCard hover={false}>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-cyan-400" />
                        Agent Activity
                    </h3>
                    <div className="space-y-3">
                        {[
                            { agent: 'Personality Analyzer', action: 'Processed 23 new writing samples', time: '2 min ago', color: '#00f5ff' },
                            { agent: 'Memory Agent', action: 'Updated conversation memory bank', time: '5 min ago', color: '#10b981' },
                            { agent: 'Voice Agent', action: 'Voice model fine-tuned successfully', time: '12 min ago', color: '#f59e0b' },
                            { agent: 'Response Generator', action: 'Calibrated response patterns', time: '1 hour ago', color: '#ec4899' },
                            { agent: 'Writing Style Agent', action: 'Style profile updated with new data', time: '2 hours ago', color: '#8b5cf6' },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/3 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                                    <div>
                                        <span className="text-sm text-white font-medium">{item.agent}</span>
                                        <p className="text-xs text-gray-500">{item.action}</p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-600">{item.time}</span>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
