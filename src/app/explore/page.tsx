'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Sparkles, MessageSquare, Mic, User, Brain } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import Link from 'next/link';

// Use same backend URL constant
const BACKEND_URL = 'http://localhost:8000';

// Type for the twin data from backend
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Twin = any;

export default function ExplorePage() {
    const [twins, setTwins] = useState<Twin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchTwins = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/twins`);
                if (response.ok) {
                    const data = await response.json();
                    setTwins(data);
                }
            } catch (error) {
                console.error("Failed to fetch twins:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTwins();
    }, []);

    const filteredTwins = twins.filter(twin => 
        (twin.analysis?.communication_style || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        twin.twin_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        twin.user_id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen px-4 py-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-400 mb-4 font-medium">
                            <Sparkles className="w-3.5 h-3.5" />
                            Discover Personas
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black mb-3 text-white">
                            Explore <span className="gradient-text">AI Twins</span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-xl">
                            Browse, interact, and collaborate with specialized AI twins created by the community.
                        </p>
                    </motion.div>

                    {/* Search & Filter */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-3 w-full md:w-auto"
                    >
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search personas, skills..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600"
                            />
                        </div>
                        <button className="w-10 h-10 rounded-xl glass border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all flex-shrink-0">
                            <Filter className="w-4 h-4" />
                        </button>
                    </motion.div>
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <GlassCard key={i} hover={false} className="h-[320px] animate-pulse bg-white/[0.02]">
                                <div />
                            </GlassCard>
                        ))}
                    </div>
                ) : filteredTwins.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mx-auto mb-4 text-gray-500">
                            <Search className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No twins found</h3>
                        <p className="text-gray-500">Try adjusting your search query.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredTwins.map((twin, idx) => {
                            // Derive display text from twin data (with fallbacks since we use schema dumps)
                            const matchScore = twin.analysis?.overall_match || 80 + Math.floor(Math.random() * 19);
                            // Try to get name from the model, fallback to heuristic or user id
                            let title = twin.name || "Echo Twin";
                            let icon = <Brain className="w-5 h-5 text-white" />;
                            let gradient = "from-cyan-400 to-emerald-500";
                            let badgeLabel = "Balanced";
                            let badgeColor = "text-cyan-400 bg-cyan-400/10 border-cyan-400/20";

                            // Heuristic to match dummy styles
                            if (twin.user_id === "creative_writer") { 
                                gradient = "from-purple-500 to-pink-500";
                                badgeLabel = "Creative";
                                badgeColor = "text-purple-400 bg-purple-400/10 border-purple-400/20";
                            } else if (twin.user_id === "logic_coder") { 
                                gradient = "from-blue-500 to-indigo-600";
                                badgeLabel = "Analytical";
                                badgeColor = "text-blue-400 bg-blue-400/10 border-blue-400/20";
                            } else if (twin.user_id === "empath_coach") { 
                                gradient = "from-emerald-400 to-teal-500";
                                badgeLabel = "Empathetic";
                                badgeColor = "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
                            } else if (twin.user_id === "default_user") {
                                badgeLabel = "Flexible";
                            }

                            // Extract tags from top traits
                            const traits = twin.analysis?.traits || {};
                            const sortedTraits = Object.entries(traits).sort((a, b) => (b[1] as number) - (a[1] as number));
                            const topTags = sortedTraits.slice(0, 2).map(t => t[0]);

                            return (
                                <motion.div
                                    key={twin.twin_id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <GlassCard className="h-full flex flex-col group overflow-hidden relative">
                                        {/* Colored gradient accent top */}
                                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-50 group-hover:opacity-100 transition-opacity`} />
                                        
                                        <div className="p-5 flex-1 flex flex-col">
                                            {/* Header row */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="relative">
                                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                                                        {icon}
                                                    </div>
                                                    <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#020209] border border-white/10">
                                                        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                                    </div>
                                                </div>
                                                <div className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${badgeColor}`}>
                                                    {badgeLabel}
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="mb-1 flex items-center gap-2">
                                                <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">{title}</h3>
                                            </div>
                                            <p className="text-gray-500 text-xs mb-4">Creator: <span className="text-gray-400">@{twin.user_id.slice(0,10)}</span></p>

                                            <div className="text-sm text-gray-400 line-clamp-2 mb-4 flex-1">
                                                {twin.analysis?.communication_style || "A digital twin mirroring human personality."}
                                            </div>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
                                                {topTags.map((tag, tIdx) => (
                                                    <span key={tIdx} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] text-gray-300 capitalize">
                                                        {tag}
                                                    </span>
                                                ))}
                                                <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-400 font-medium ml-auto">
                                                    {matchScore}% Match
                                                </span>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="grid grid-cols-2 gap-2 mt-auto">
                                                <Link 
                                                    href={`/chat?twinId=${twin.twin_id}`}
                                                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-all border border-transparent hover:border-white/10"
                                                >
                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                    Chat
                                                </Link>
                                                <Link 
                                                    href={`/voice?twinId=${twin.twin_id}`}
                                                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-semibold text-white transition-all shadow-[0_0_15px_rgba(34,211,238,0.15)] hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                                                >
                                                    <Mic className="w-3.5 h-3.5" />
                                                    Voice
                                                </Link>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
