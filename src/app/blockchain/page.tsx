'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import GlassCard from '../components/GlassCard';
import { Shield, CheckCircle2, ExternalLink, Copy, Link2, Fingerprint, Lock, Hash, Loader2 } from 'lucide-react';
import { useState } from 'react';

const BlockchainCube3D = dynamic(() => import('../components/BlockchainCube3D'), { ssr: false });

const BACKEND_URL = 'http://localhost:8000';

export default function BlockchainPage() {
    const [copied, setCopied] = useState('');
    const [minting, setMinting] = useState(false);
    const [blockchainData, setBlockchainData] = useState({
        wallet: '0x7a3B8c2D9e1F4A5b6C7D8E9f0A1B2C3D4f92e8dC1',
        txHash: '0xa1b2c3d4...e5f6789a',
        tokenId: '#4821',
        isVerified: true
    });

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopied(label);
        setTimeout(() => setCopied(''), 2000);
    };

    const handleMint = async () => {
        setMinting(true);
        try {
            const response = await fetch(`${BACKEND_URL}/mint-identity`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    twin_id: 'default_twin',
                    wallet_address: blockchainData.wallet,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setBlockchainData(prev => ({
                    ...prev,
                    txHash: data.transaction_hash,
                    tokenId: `#${Math.floor(Math.random() * 9000) + 1000}`,
                    isVerified: true
                }));
            }
        } catch (error) {
            console.error('Minting error:', error);
        } finally {
            setMinting(false);
        }
    };

    return (
        <div className="min-h-screen px-4 py-12">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-3">
                        <span className="gradient-text">Blockchain Identity</span>
                    </h1>
                    <p className="text-gray-400 text-lg">Your twin&apos;s on-chain identity and verification</p>
                </motion.div>

                {/* 3D Blockchain Visualization */}
                <BlockchainCube3D />

                {/* Verification Badge */}
                <GlassCard hover={false} className="text-center mb-8 p-10">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        <h2 className="text-2xl font-bold text-white">Verified Digital Twin</h2>
                    </div>
                    <p className="text-gray-400 max-w-lg mx-auto">
                        Your AI personality twin is verified on the Ethereum blockchain with immutable proof of ownership.
                    </p>
                </GlassCard>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Wallet Address */}
                    <GlassCard>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <Fingerprint className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-white font-bold">Wallet Address</h3>
                        </div>
                        <div className="flex items-center gap-2 glass p-3 rounded-xl">
                            <p className="text-cyan-400 font-mono text-sm flex-1 truncate">{blockchainData.wallet}</p>
                            <button
                                onClick={() => copyToClipboard(blockchainData.wallet, 'wallet')}
                                className="text-gray-500 hover:text-white transition-colors flex-shrink-0"
                            >
                                {copied === 'wallet' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">Ethereum Mainnet</p>
                    </GlassCard>

                    {/* Twin Token */}
                    <GlassCard delay={0.1}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                <Hash className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-white font-bold">Twin Token ID</h3>
                        </div>
                        <div className="flex items-center gap-2 glass p-3 rounded-xl">
                            <p className="text-purple-400 font-mono text-sm flex-1">AI-TWIN {blockchainData.tokenId}</p>
                            <button
                                onClick={() => copyToClipboard(blockchainData.tokenId, 'token')}
                                className="text-gray-500 hover:text-white transition-colors flex-shrink-0"
                            >
                                {copied === 'token' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">ERC-721 Non-Fungible Token</p>
                    </GlassCard>

                    {/* Transaction Hash */}
                    <GlassCard delay={0.2}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                <Link2 className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-white font-bold">Transaction Hash</h3>
                        </div>
                        <div className="flex items-center gap-2 glass p-3 rounded-xl">
                            <p className="text-emerald-400 font-mono text-sm flex-1 truncate">{blockchainData.txHash}</p>
                            <a 
                                href={`https://sepolia.etherscan.io/tx/${blockchainData.txHash}`} 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-500 hover:text-white transition-colors flex-shrink-0"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">View on Etherscan</p>
                    </GlassCard>

                    {/* Ownership */}
                    <GlassCard delay={0.3}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                <Lock className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-white font-bold">Ownership Status</h3>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: 'Owner', value: 'Piyush (piyush23)', verified: true },
                                { label: 'Minted', value: 'March 13, 2026', verified: true },
                                { label: 'Contract', value: '0x1234...abcd', verified: true },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <span className="text-gray-500 text-sm">{item.label}</span>
                                    <span className="text-white text-sm font-medium flex items-center gap-1">
                                        {item.value}
                                        {item.verified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>

                {/* Mint Button */}
                <GlassCard hover={false} className="text-center p-8">
                    <h3 className="text-xl font-bold text-white mb-2">Deploy New Identity</h3>
                    <p className="text-gray-400 mb-6 text-sm max-w-md mx-auto">
                        Mint a new on-chain identity for your AI twin with updated personality data.
                    </p>
                    <button 
                        onClick={handleMint}
                        disabled={minting}
                        className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-3 mx-auto"
                    >
                        {minting && <Loader2 className="w-5 h-5 animate-spin" />}
                        {minting ? 'Minting Identity...' : 'Mint Identity NFT'}
                    </button>
                </GlassCard>
            </div>
        </div>
    );
}
