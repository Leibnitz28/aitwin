'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import GlassCard from './components/GlassCard';
import { Brain, Mic, Shield, Cloud, BarChart3, Sparkles, ArrowRight, Zap, Globe, Lock } from 'lucide-react';

const HeroBrain3D = dynamic(() => import('./components/HeroBrain3D'), { ssr: false });
const FloatingGeometry3D = dynamic(() => import('./components/FloatingGeometry3D'), { ssr: false });

const features = [
  {
    icon: Brain,
    title: 'Multi-Agent AI System',
    desc: 'Powered by IQ AI with 5 specialized agents working together to replicate your personality.',
    color: 'from-cyan-400 to-blue-500',
    glow: 'rgba(0, 245, 255, 0.2)',
  },
  {
    icon: Mic,
    title: 'Voice Cloning',
    desc: 'ElevenLabs voice synthesis creates a perfect digital replica of your voice patterns.',
    color: 'from-purple-400 to-pink-500',
    glow: 'rgba(139, 92, 246, 0.2)',
  },
  {
    icon: Shield,
    title: 'Blockchain Identity',
    desc: 'Ethereum-secured digital identity with verifiable ownership and provenance.',
    color: 'from-emerald-400 to-cyan-500',
    glow: 'rgba(16, 185, 129, 0.2)',
  },
  {
    icon: Cloud,
    title: 'Cloud Infrastructure',
    desc: 'Google Cloud provides scalable, low-latency infrastructure for real-time AI processing.',
    color: 'from-blue-400 to-indigo-500',
    glow: 'rgba(59, 130, 246, 0.2)',
  },
  {
    icon: BarChart3,
    title: 'Data Intelligence',
    desc: 'Snowflake analytics engine provides deep insights into personality patterns and behavior.',
    color: 'from-amber-400 to-orange-500',
    glow: 'rgba(245, 158, 11, 0.2)',
  },
];

const agents = [
  { name: 'Personality Analyzer', status: 'Active', color: '#00f5ff' },
  { name: 'Writing Style Agent', status: 'Active', color: '#8b5cf6' },
  { name: 'Memory Agent', status: 'Active', color: '#10b981' },
  { name: 'Response Generator', status: 'Active', color: '#ec4899' },
  { name: 'Voice Agent', status: 'Active', color: '#f59e0b' },
];

export default function LandingPage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-gray-300">Powered by EchoSoul Multi-Agent System</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-8xl font-black mb-4 leading-tight tracking-tight"
          >
            <span className="text-white">Create Your</span>
            <br />
            <span className="gradient-text">EchoSoul Replica</span>
          </motion.h1>

          {/* 3D Brain */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <HeroBrain3D />
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10"
          >
            Upload your voice and writing samples. Our agents analyze, replicate, and deploy
            your personality as a blockchain-verified EchoSoul replica.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/create-twin">
              <button className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-lg hover:shadow-[0_0_40px_rgba(0,245,255,0.3)] transition-all hover:scale-105 flex items-center gap-2">
                Create Your Twin
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="px-8 py-4 rounded-2xl glass text-gray-300 font-semibold text-lg hover:text-white hover:bg-white/10 transition-all">
                View Dashboard
              </button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex items-center justify-center gap-8 sm:gap-16 mt-16"
          >
            {[
              { value: '5', label: 'AI Agents' },
              { value: '99.2%', label: 'Accuracy' },
              { value: '< 2s', label: 'Response' },
              { value: 'Web3', label: 'Verified' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-black gradient-text">{stat.value}</div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Feature Cards with Floating 3D */}
      <section className="py-20 px-4 relative">
        <FloatingGeometry3D />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">
              <span className="gradient-text">Technology Stack</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Enterprise-grade technologies working in harmony
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <GlassCard key={i} delay={i * 0.1} className="group cursor-pointer">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow`}
                  style={{ boxShadow: `0 0 20px ${f.glow}` }}
                >
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Agent System */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">
              <span className="gradient-text">Multi-Agent Architecture</span>
            </h2>
            <p className="text-gray-400 text-lg">
              5 specialized AI agents work together to replicate you
            </p>
          </motion.div>

          <div className="space-y-4">
            {agents.map((agent, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass flex items-center justify-between p-4 hover:bg-white/5 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ backgroundColor: agent.color, boxShadow: `0 0 10px ${agent.color}` }}
                  />
                  <span className="text-white font-semibold">{agent.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-emerald-400 font-medium px-3 py-1 rounded-full bg-emerald-400/10">
                    {agent.status}
                  </span>
                  <Zap className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">
              <span className="gradient-text">How It Works</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Upload Voice', desc: 'Record or upload voice samples', icon: Mic },
              { step: '02', title: 'Writing Samples', desc: 'Provide text and writing examples', icon: Globe },
              { step: '03', title: 'AI Analysis', desc: 'Agents analyze your personality', icon: Brain },
              { step: '04', title: 'Deploy Twin', desc: 'Mint blockchain-verified identity', icon: Lock },
            ].map((s, i) => (
              <GlassCard key={i} delay={i * 0.15}>
                <div className="text-4xl font-black gradient-text mb-3">{s.step}</div>
                <s.icon className="w-8 h-8 text-cyan-400 mb-3" />
                <h3 className="text-white font-bold text-lg mb-1">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center glass-strong p-12 neon-glow"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Create Your EchoSoul?
          </h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Join the future of digital identity. Your EchoSoul is waiting to be born.
          </p>
          <Link href="/create-twin">
            <button className="px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-lg hover:shadow-[0_0_40px_rgba(0,245,255,0.3)] transition-all hover:scale-105">
              Get Started Now
            </button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto text-center text-gray-600 text-sm">
          © 2026 EchoSoul. Built with EchoSoul agents, ElevenLabs, Ethereum, Google Cloud & Snowflake.
        </div>
      </footer>
    </div>
  );
}
