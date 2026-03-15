'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Cpu, Globe, Settings, User, Bot, Sparkles, Zap, MessageSquare, Menu, X, Fingerprint, Activity, Plus, FileText, Search, CreditCard, Home, Brain, Wallet, BarChart3, Mic, Shield, Database
} from 'lucide-react';
import EchoRobotLogo from './EchoRobotLogo';
import { useState, useEffect } from 'react';

const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/explore', label: 'Explore', icon: Sparkles },
    { href: '/create-twin', label: 'Create', icon: Plus },
    { href: '/dashboard', label: 'Dashboard', icon: Brain },
    { href: '/chat', label: 'Chat', icon: MessageSquare },
    { href: '/voice', label: 'Voice', icon: Mic },
    { href: '/ingest', label: 'Ingest', icon: Database },
    { href: '/blockchain', label: 'Mint', icon: Shield },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];


export default function Navbar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    return (
        <motion.nav
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
            style={{
                background: scrolled
                    ? 'rgba(2, 2, 9, 0.85)'
                    : 'rgba(2, 2, 9, 0.6)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderBottom: scrolled
                    ? '1px solid rgba(255,255,255,0.07)'
                    : '1px solid rgba(255,255,255,0.03)',
                boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.3)' : 'none',
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
                        {/* Robot Logo Icon */}
                        <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center text-gray-300 group-hover:text-cyan-400 transition-colors duration-300">
                            <EchoRobotLogo className="w-10 h-10 drop-shadow-[0_0_8px_currentColor]" />
                        </div>
                        {/* Logo Text */}
                        <div className="hidden sm:flex flex-col justify-center">
                            <span className="text-xl font-black tracking-[0.15em] uppercase text-gray-200 group-hover:text-white transition-colors">
                                ECHO SOUL
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-1 bg-white/[0.03] border border-white/[0.05] rounded-2xl px-2 py-1.5">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`relative px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                                        isActive
                                            ? 'text-white'
                                            : 'text-gray-500 hover:text-gray-300'
                                    }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-pill"
                                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/20"
                                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <link.icon className={`w-3.5 h-3.5 relative z-10 ${isActive ? 'text-cyan-400' : ''}`} />
                                    <span className="relative z-10">{link.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-3">


                        {/* Connect Wallet button */}
                        <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/90 to-blue-600/90 text-white text-sm font-semibold hover:from-cyan-400 hover:to-blue-500 hover:shadow-[0_0_24px_rgba(34,211,238,0.3)] transition-all duration-300 hover:scale-105 active:scale-95">
                            <Wallet className="w-4 h-4" />
                            Connect
                        </button>

                        {/* Mobile Toggle */}
                        <button
                            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl glass text-gray-400 hover:text-white transition-colors"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Toggle menu"
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                {mobileOpen ? (
                                    <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                                        <X className="w-5 h-5" />
                                    </motion.div>
                                ) : (
                                    <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                                        <Menu className="w-5 h-5" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="lg:hidden overflow-hidden border-t border-white/5"
                    >
                        <div className="px-4 pt-3 pb-4 space-y-1">
                            {navLinks.map((link, i) => {
                                const isActive = pathname === link.href;
                                return (
                                    <motion.div
                                        key={link.href}
                                        initial={{ opacity: 0, x: -12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                    >
                                        <Link
                                            href={link.href}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                                                isActive
                                                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/15'
                                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }`}
                                        >
                                            <link.icon className="w-4 h-4 flex-shrink-0" />
                                            {link.label}
                                            {isActive && <Sparkles className="w-3.5 h-3.5 ml-auto opacity-60" />}
                                        </Link>
                                    </motion.div>
                                );
                            })}
                            <div className="pt-2">
                                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold">
                                    <Wallet className="w-4 h-4" />
                                    Connect
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
