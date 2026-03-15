'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import {
    BarChart3, TrendingUp, Users, MessageSquare, Activity, Brain, Zap, TrendingDown,
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

const convoData = [
    { name: 'Mon', conversations: 12 },
    { name: 'Tue', conversations: 19 },
    { name: 'Wed', conversations: 15 },
    { name: 'Thu', conversations: 28 },
    { name: 'Fri', conversations: 22 },
    { name: 'Sat', conversations: 35 },
    { name: 'Sun', conversations: 30 },
];

const accuracyData = [
    { name: 'W1', accuracy: 78 },
    { name: 'W2', accuracy: 82 },
    { name: 'W3', accuracy: 87 },
    { name: 'W4', accuracy: 91 },
    { name: 'W5', accuracy: 93 },
    { name: 'W6', accuracy: 94 },
];

const radarData = [
    { trait: 'Openness', score: 87 },
    { trait: 'Conscientiousness', score: 72 },
    { trait: 'Extraversion', score: 65 },
    { trait: 'Agreeableness', score: 81 },
    { trait: 'Neuroticism', score: 38 },
];

const tooltipStyle = {
    backgroundColor: 'rgba(8, 8, 28, 0.92)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    padding: '8px 12px',
    color: '#e2e8f0',
    fontSize: 11,
};

const BACKEND_URL = 'http://localhost:8000';

const insights = [
    { text: 'Openness score grew 4% this week', color: '#22d3ee', icon: TrendingUp },
    { text: 'Voice conversations peaked on Saturday', color: '#8b5cf6', icon: Zap },
    { text: 'Response accuracy improving weekly', color: '#34d399', icon: Activity },
];

function SkeletonCard() {
    return <div className="glass p-6 rounded-2xl skeleton h-32" />;
}

function AnimatedBar({ value, max, color }: { value: number, max: number, color: string }) {
    return (
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (value / max) * 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
            />
        </div>
    );
}

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);

    useEffect(() => {
        const fetch_data = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/analytics`);
                if (res.ok) setAnalytics(await res.json());
            } catch { /* use defaults */ } finally { setLoading(false); }
        };
        fetch_data();
    }, []);

    const get = (path: string, fallback: unknown) => {
        try {
            const keys = path.split('.');
            let val: unknown = analytics;
            for (const k of keys) {
                if (val == null || typeof val !== 'object') return fallback;
                val = (val as Record<string, unknown>)[k];
            }
            return val ?? fallback;
        } catch { return fallback; }
    };

    if (loading) {
        return (
            <div className="min-h-screen px-4 py-12">
                <div className="max-w-6xl mx-auto">
                    <div className="skeleton h-14 w-64 rounded-2xl mb-12" />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-72 rounded-2xl" />)}
                    </div>
                </div>
            </div>
        );
    }

    const stats = [
        {
            label: 'Total Conversations',
            value: String(get('total_conversations', 0)),
            change: '+12%',
            up: true,
            icon: MessageSquare,
            color: 'from-cyan-400 to-blue-500',
            glow: '#22d3ee',
        },
        {
            label: 'Active Users',
            value: String(get('active_users', 1)),
            change: '+8%',
            up: true,
            icon: Users,
            color: 'from-indigo-400 to-blue-500',
            glow: '#818cf8',
        },
        {
            label: 'Accuracy Score',
            value: `${get('avg_accuracy', 94.2)}%`,
            change: '+2.1%',
            up: true,
            icon: Brain,
            color: 'from-emerald-400 to-cyan-500',
            glow: '#34d399',
        },
        {
            label: 'Avg Response Time',
            value: `${get('avg_response_time', 1.3)}s`,
            change: '-0.2s',
            up: false,
            icon: Activity,
            color: 'from-amber-400 to-orange-500',
            glow: '#f59e0b',
        },
    ];

    const usageStats = [
        { label: 'Text Conversations', value: Number(get('usage_stats.text_convs', 0)), max: 1000, color: '#22d3ee' },
        { label: 'Voice Conversations', value: Number(get('usage_stats.voice_convs', 0)), max: 500, color: '#8b5cf6' },
        { label: 'Writing Samples', value: Number(get('usage_stats.samples_processed', 0)), max: 50, color: '#10b981' },
        { label: 'Blockchain Transactions', value: Number(get('usage_stats.blockchain_txs', 0)), max: 10, color: '#f59e0b' },
        { label: 'Agent Invocations', value: Number(get('usage_stats.text_convs', 0)) * 5, max: 5000, color: '#3b82f6' },
    ];

    return (
        <div className="min-h-screen px-4 py-12">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/4 border border-white/8 text-xs text-gray-400 mb-4">
                        <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                        Intelligence Dashboard
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black mb-2">
                        <span className="gradient-text">Analytics</span>
                    </h1>
                    <p className="text-gray-500">Insights into your AI twin's performance and evolution</p>
                </motion.div>

                {/* AI Insights strip */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    {insights.map((ins, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-2.5 glass px-4 py-2.5 flex-1"
                        >
                            <ins.icon className="w-4 h-4 flex-shrink-0" style={{ color: ins.color }} />
                            <span className="text-xs text-gray-300">{ins.text}</span>
                        </motion.div>
                    ))}
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((s, i) => (
                        <GlassCard key={i} delay={i * 0.08} accentColor={s.glow}>
                            <div className="flex items-center justify-between mb-4">
                                <div className={`icon-box bg-gradient-to-br ${s.color}`} style={{ boxShadow: `0 0 14px ${s.glow}25` }}>
                                    <s.icon className="w-5 h-5 text-white" />
                                </div>
                                <span
                                    className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5"
                                    style={{
                                        color: s.up ? '#34d399' : '#f59e0b',
                                        background: s.up ? 'rgba(52,211,153,0.1)' : 'rgba(245,158,11,0.1)',
                                    }}
                                >
                                    {s.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    {s.change}
                                </span>
                            </div>
                            <div className="text-2xl font-black text-white">{s.value}</div>
                            <div className="text-xs text-gray-600 mt-1">{s.label}</div>
                        </GlassCard>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <GlassCard hover={false}>
                        <h3 className="text-white font-bold mb-5 flex items-center gap-2 text-sm">
                            <BarChart3 className="w-4 h-4 text-cyan-400" />
                            Conversation Volume
                        </h3>
                        <div className="h-60">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={convoData} barSize={18}>
                                    <defs>
                                        <linearGradient id="barG" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#22d3ee" />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                    <XAxis dataKey="name" stroke="#374151" fontSize={11} />
                                    <YAxis stroke="#374151" fontSize={11} />
                                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(34,211,238,0.04)' }} />
                                    <Bar dataKey="conversations" fill="url(#barG)" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>

                    <GlassCard hover={false} delay={0.08}>
                        <h3 className="text-white font-bold mb-5 flex items-center gap-2 text-sm">
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                            Personality Accuracy Over Time
                        </h3>
                        <div className="h-60">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={accuracyData}>
                                    <defs>
                                        <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                    <XAxis dataKey="name" stroke="#374151" fontSize={11} />
                                    <YAxis stroke="#374151" fontSize={11} domain={[70, 100]} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Area type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2.5} fill="url(#areaG)" dot={{ fill: '#10b981', r: 3 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>
                </div>

                {/* Bottom Row: Radar + Usage */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <GlassCard hover={false}>
                        <h3 className="text-white font-bold mb-5 flex items-center gap-2 text-sm">
                            <Brain className="w-4 h-4 text-indigo-400" />
                            Personality Profile
                        </h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                                    <PolarAngleAxis dataKey="trait" stroke="#4b5563" fontSize={11} />
                                    <PolarRadiusAxis stroke="rgba(255,255,255,0.04)" fontSize={10} domain={[0, 100]} />
                                    <Radar dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} dot />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>

                    <GlassCard hover={false} delay={0.08}>
                        <h3 className="text-white font-bold mb-5 flex items-center gap-2 text-sm">
                            <Activity className="w-4 h-4 text-amber-400" />
                            Usage Statistics
                        </h3>
                        <div className="space-y-5">
                            {usageStats.map((item, i) => (
                                <div key={i}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs text-gray-400 font-medium">{item.label}</span>
                                        <span className="text-xs font-bold text-white tabular-nums">{item.value.toLocaleString()}</span>
                                    </div>
                                    <AnimatedBar value={item.value} max={item.max} color={item.color} />
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
