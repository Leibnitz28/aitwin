'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import {
    Shield, CheckCircle2, ExternalLink, Copy, Link2, Fingerprint,
    Lock, Hash, Loader2, Sparkles, Clock, ArrowUpRight, GitCommit
} from 'lucide-react';
import dynamic from 'next/dynamic';

const BlockchainCube3D = dynamic(() => import('../components/BlockchainCube3D'), { ssr: false });

const BACKEND_URL = 'http://localhost:8000';

const HISTORY = [
    { action: 'Identity Minted', date: 'Mar 13, 2026', hash: '0xa1b2...789a', status: 'confirmed' },
    { action: 'Metadata Updated', date: 'Mar 13, 2026', hash: '0xc3d4...ef01', status: 'confirmed' },
    { action: 'Ownership Verified', date: 'Mar 14, 2026', hash: '0xe5f6...2345', status: 'confirmed' },
];

export default function BlockchainPage() {
    const [copied, setCopied] = useState('');
    const [minting, setMinting] = useState(false);
    const [mintSuccess, setMintSuccess] = useState(false);
    const [blockchainData, setBlockchainData] = useState({
        wallet: '0x7a3B8c2D9e1F4A5b6C7D8E9f0A1B2C3D4f92e8dC1',
        txHash: '0xa1b2c3d4e5f6789a',
        tokenId: '#4821',
        isVerified: true,
    });

    const copy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopied(label);
        setTimeout(() => setCopied(''), 2000);
    };

    const maskString = (str: string) => {
        if (!str || str.length < 10) return str;
        return `${str.substring(0, 4)}••••••••••••••••••••${str.substring(str.length - 4)}`;
    };

    const handleMint = async () => {
        setMinting(true);
        try {
            const res = await fetch(`${BACKEND_URL}/mint-identity`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ twin_id: 'default_twin', user_id: 'Piyush' }),
            });
            if (res.ok) {
                const data = await res.json();
                setBlockchainData(prev => ({ ...prev, txHash: data.transaction_hash, tokenId: `#${Math.floor(Math.random() * 9000) + 1000}`, isVerified: true }));
                setMintSuccess(true);
                setTimeout(() => setMintSuccess(false), 4000);
            }
        } catch { console.error('Mint error'); } finally { setMinting(false); }
    };

    return (
        <div className="min-h-screen px-4 py-12">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/4 border border-white/8 text-xs text-gray-400 mb-4">
                        <Shield className="w-3.5 h-3.5 text-emerald-400" />
                        Ethereum · Sepolia Testnet
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black mb-3">
                        <span className="gradient-text">Blockchain Identity</span>
                    </h1>
                    <p className="text-gray-500 text-base">Your twin's on-chain identity and verification record</p>
                </motion.div>

                {/* 3D Cube */}
                <BlockchainCube3D />

                {/* NFT-style Identity Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6 relative glass-elevated p-8 overflow-hidden"
                >
                    {/* Holographic shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/4 via-transparent to-purple-500/4 pointer-events-none" />
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

                    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                        {/* Avatar */}
                        <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-2xl font-black text-white shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                            PT
                        </div>

                        <div className="flex-1 text-center sm:text-left">
                            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start mb-2">
                                <h2 className="text-xl font-bold text-white">Piyush's EchoSoul</h2>
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/20">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    <span className="text-[10px] text-emerald-400 font-bold">VERIFIED</span>
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm mb-3">
                                Immutable proof of ownership on the Ethereum blockchain. Your AI twin's identity is permanent and verifiable.
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                <span className="tag-pill badge-verified">ERC-721 NFT</span>
                                <span className="tag-pill" style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>Token {blockchainData.tokenId}</span>
                            </div>
                        </div>

                        <div className="hidden sm:flex items-center gap-1 text-gray-700">
                            <Sparkles className="w-5 h-5 text-cyan-400/40" />
                        </div>
                    </div>
                </motion.div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                    {/* Wallet Address */}
                    <GlassCard accentColor="#22d3ee">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="icon-box bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_0_16px_rgba(99,102,241,0.3)]">
                                <Fingerprint className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm">Wallet Address</h3>
                                <p className="text-[10px] text-gray-600">Ethereum Mainnet</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 glass p-3 rounded-xl">
                            <p className="text-cyan-400 font-mono text-xs flex-1 truncate">{maskString(blockchainData.wallet)}</p>
                            <button onClick={() => copy(blockchainData.wallet, 'wallet')} className="text-gray-600 hover:text-white transition-colors flex-shrink-0">
                                {copied === 'wallet' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </GlassCard>

                    {/* Token ID */}
                    <GlassCard delay={0.08} accentColor="#818cf8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="icon-box bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_16px_rgba(129,140,248,0.3)]">
                                <Hash className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm">Twin Token ID</h3>
                                <p className="text-[10px] text-gray-600">ERC-721 Non-Fungible Token</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 glass p-3 rounded-xl">
                            <p className="text-indigo-400 font-mono text-xs flex-1">AI-TWIN {blockchainData.tokenId}</p>
                            <button onClick={() => copy(blockchainData.tokenId, 'token')} className="text-gray-600 hover:text-white transition-colors flex-shrink-0">
                                {copied === 'token' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </GlassCard>

                    {/* Transaction Hash */}
                    <GlassCard delay={0.12} accentColor="#34d399">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="icon-box bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-[0_0_16px_rgba(52,211,153,0.3)]">
                                <Link2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm">Transaction Hash</h3>
                                <p className="text-[10px] text-gray-600">View on Etherscan</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 glass p-3 rounded-xl">
                            <p className="text-emerald-400 font-mono text-xs flex-1 truncate">{maskString(blockchainData.txHash)}</p>
                            <a href={`https://sepolia.etherscan.io/tx/${blockchainData.txHash}`} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white transition-colors flex-shrink-0">
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </GlassCard>

                    {/* Ownership */}
                    <GlassCard delay={0.16} accentColor="#f59e0b">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="icon-box bg-gradient-to-br from-amber-500 to-orange-600 shadow-[0_0_16px_rgba(245,158,11,0.3)]">
                                <Lock className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm">Ownership Record</h3>
                                <p className="text-[10px] text-gray-600">Immutable on-chain</p>
                            </div>
                        </div>
                        <div className="space-y-2.5">
                            {[
                                { label: 'Owner', value: 'Piyush (piyush23)' },
                                { label: 'Minted', value: 'March 13, 2026' },
                                { label: 'Contract', value: maskString('0x1234567890abcdef1234567890abcdef1234abcd') },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">{item.label}</span>
                                    <span className="text-xs text-white font-medium flex items-center gap-1">
                                        {item.value}
                                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    </span>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>

                {/* History */}
                <GlassCard hover={false} className="mb-6">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <GitCommit className="w-4 h-4 text-cyan-400" />
                        Transaction History
                    </h3>
                    <div className="space-y-3">
                        {HISTORY.map((h, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/3 transition-all">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-white font-medium">{h.action}</span>
                                        <span className="tag-pill badge-online text-[9px] px-1.5 py-0.5">confirmed</span>
                                    </div>
                                    <p className="text-[10px] text-gray-600 font-mono mt-0.5">{h.hash}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-[10px] text-gray-700 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {h.date}
                                    </span>
                                    <a href={`https://sepolia.etherscan.io/tx/${h.hash}`} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-white transition-colors">
                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* Mint Button Card */}
                <GlassCard hover={false} className="text-center p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/4 via-transparent to-cyan-500/4 pointer-events-none" />
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold text-white mb-2">Deploy New Identity</h3>
                        <p className="text-gray-500 mb-6 text-sm max-w-md mx-auto">
                            Mint a new on-chain identity for your AI twin with updated personality data.
                        </p>
                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={handleMint}
                            disabled={minting}
                            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold hover:shadow-[0_0_30px_rgba(52,211,153,0.4)] transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-3 mx-auto"
                        >
                            {minting && <Loader2 className="w-5 h-5 animate-spin" />}
                            {minting ? 'Minting On-Chain...' : 'Mint Identity NFT'}
                        </motion.button>

                        {mintSuccess && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 flex items-center justify-center gap-2 text-emerald-400 text-sm font-medium"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Identity minted successfully!
                            </motion.div>
                        )}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
