'use client';

import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import {
    BarChart3, TrendingUp, Users, MessageSquare, Activity, Brain,
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

const conversationData = [
    { name: 'Mon', conversations: 12 },
    { name: 'Tue', conversations: 19 },
    { name: 'Wed', conversations: 15 },
    { name: 'Thu', conversations: 28 },
    { name: 'Fri', conversations: 22 },
    { name: 'Sat', conversations: 35 },
    { name: 'Sun', conversations: 30 },
];

const accuracyData = [
    { name: 'Week 1', accuracy: 78 },
    { name: 'Week 2', accuracy: 82 },
    { name: 'Week 3', accuracy: 87 },
    { name: 'Week 4', accuracy: 91 },
    { name: 'Week 5', accuracy: 93 },
    { name: 'Week 6', accuracy: 94 },
];

const personalityRadar = [
    { trait: 'Openness', score: 87 },
    { trait: 'Conscientiousness', score: 72 },
    { trait: 'Extraversion', score: 65 },
    { trait: 'Agreeableness', score: 81 },
    { trait: 'Neuroticism', score: 38 },
];

const customTooltipStyle = {
    backgroundColor: 'rgba(15, 15, 35, 0.9)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '8px 12px',
    color: '#e2e8f0',
    fontSize: '12px',
};

export default function AnalyticsPage() {
    return (
        <div className="min-h-screen px-4 py-12">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-3">
                        <span className="gradient-text">Analytics</span>
                    </h1>
                    <p className="text-gray-400 text-lg">Insights into your AI twin&apos;s performance and usage</p>
                </motion.div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Conversations', value: '1,247', change: '+12%', icon: MessageSquare, color: 'from-cyan-400 to-blue-500' },
                        { label: 'Active Users', value: '89', change: '+8%', icon: Users, color: 'from-purple-400 to-pink-500' },
                        { label: 'Accuracy Score', value: '94.2%', change: '+2.1%', icon: Brain, color: 'from-emerald-400 to-cyan-500' },
                        { label: 'Avg Response Time', value: '1.3s', change: '-0.2s', icon: Activity, color: 'from-amber-400 to-orange-500' },
                    ].map((stat, i) => (
                        <GlassCard key={i} delay={i * 0.1}>
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                    <stat.icon className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                                    {stat.change}
                                </span>
                            </div>
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                        </GlassCard>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Conversations Chart */}
                    <GlassCard hover={false}>
                        <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-cyan-400" />
                            Conversation Analytics
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={conversationData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="name" stroke="#4b5563" fontSize={12} />
                                    <YAxis stroke="#4b5563" fontSize={12} />
                                    <Tooltip contentStyle={customTooltipStyle} cursor={{ fill: 'rgba(0,245,255,0.05)' }} />
                                    <Bar dataKey="conversations" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#00f5ff" />
                                            <stop offset="100%" stopColor="#8b5cf6" />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>

                    {/* Accuracy Chart */}
                    <GlassCard hover={false} delay={0.1}>
                        <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                            Personality Accuracy Over Time
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={accuracyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="name" stroke="#4b5563" fontSize={12} />
                                    <YAxis stroke="#4b5563" fontSize={12} domain={[70, 100]} />
                                    <Tooltip contentStyle={customTooltipStyle} />
                                    <defs>
                                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="accuracy" stroke="#10b981" fill="url(#areaGradient)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>
                </div>

                {/* Personality Radar + Usage Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Radar Chart */}
                    <GlassCard hover={false}>
                        <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-400" />
                            Personality Profile
                        </h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={personalityRadar}>
                                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                                    <PolarAngleAxis dataKey="trait" stroke="#6b7280" fontSize={11} />
                                    <PolarRadiusAxis stroke="rgba(255,255,255,0.05)" fontSize={10} domain={[0, 100]} />
                                    <Radar
                                        dataKey="score"
                                        stroke="#8b5cf6"
                                        fill="#8b5cf6"
                                        fillOpacity={0.2}
                                        strokeWidth={2}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>

                    {/* Usage Stats */}
                    <GlassCard hover={false} delay={0.1}>
                        <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-amber-400" />
                            Usage Statistics
                        </h3>
                        <div className="space-y-5">
                            {[
                                { label: 'Text Conversations', value: 892, max: 1000, color: '#00f5ff' },
                                { label: 'Voice Conversations', value: 355, max: 1000, color: '#8b5cf6' },
                                { label: 'Writing Samples Processed', value: 47, max: 50, color: '#10b981' },
                                { label: 'Voice Samples Used', value: 12, max: 20, color: '#ec4899' },
                                { label: 'Blockchain Transactions', value: 3, max: 10, color: '#f59e0b' },
                                { label: 'Agent Invocations', value: 4280, max: 5000, color: '#3b82f6' },
                            ].map((item, i) => (
                                <div key={i}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-sm text-gray-300">{item.label}</span>
                                        <span className="text-sm font-bold text-white">{item.value.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${(item.value / item.max) * 100}%` }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1, delay: i * 0.1 }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: item.color }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
