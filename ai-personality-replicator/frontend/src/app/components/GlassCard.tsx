'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    delay?: number;
}

export default function GlassCard({ children, className = '', hover = true, delay = 0 }: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            whileHover={hover ? { y: -5, scale: 1.01 } : undefined}
            className={`glass neon-glow p-6 ${className}`}
        >
            {children}
        </motion.div>
    );
}
