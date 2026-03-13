'use client';

import dynamic from 'next/dynamic';
import Navbar from './Navbar';

const Scene3DBackground = dynamic(() => import('./Scene3DBackground'), { ssr: false });

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Scene3DBackground />
            <Navbar />
            <main className="relative z-10 pt-16 min-h-screen">
                {children}
            </main>
        </>
    );
}
