'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    delay?: number;
    variant?: 'default' | 'elevated' | 'highlight';
    accentColor?: string;
}

export default function GlassCard({
    children,
    className = '',
    hover = true,
    delay = 0,
    variant = 'default',
    accentColor,
}: GlassCardProps) {
    const baseClass =
        variant === 'elevated' ? 'glass-elevated'
        : variant === 'highlight' ? 'glass-strong gradient-border'
        : 'glass';

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
            whileHover={hover ? { y: -4, scale: 1.01, transition: { duration: 0.2 } } : undefined}
            className={`${baseClass} p-6 relative overflow-hidden ${className}`}
            style={accentColor ? {
                boxShadow: `0 0 0 1px ${accentColor}18, 0 4px 24px ${accentColor}10`
            } : undefined}
        >
            {/* Top accent line */}
            {accentColor && (
                <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)` }}
                />
            )}
            {children}
        </motion.div>
    );
}
