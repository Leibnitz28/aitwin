'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Brain, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/create-twin', label: 'Create Twin' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/chat', label: 'Chat' },
    { href: '/voice', label: 'Voice' },
    { href: '/blockchain', label: 'Blockchain' },
    { href: '/analytics', label: 'Analytics' },
];

export default function Navbar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <motion.nav
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="fixed top-0 left-0 right-0 z-50 glass-strong"
            style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(0,245,255,0.4)] transition-shadow">
                            <Brain className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold gradient-text hidden sm:block">EchoSoul</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${pathname === link.href
                                    ? 'text-cyan-400 bg-cyan-400/10'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Connect Wallet */}
                    <div className="hidden md:block">
                        <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-sm font-semibold hover:shadow-[0_0_25px_rgba(0,245,255,0.3)] transition-all hover:scale-105">
                            Connect Wallet
                        </button>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden text-gray-400 hover:text-white"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="md:hidden glass-strong mx-4 mb-4 rounded-2xl overflow-hidden"
                >
                    <div className="p-4 flex flex-col gap-1">
                        {navLinks.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${pathname === link.href
                                    ? 'text-cyan-400 bg-cyan-400/10'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <button className="mt-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-sm font-semibold">
                            Connect Wallet
                        </button>
                    </div>
                </motion.div>
            )}
        </motion.nav>
    );
}
