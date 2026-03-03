"use client";

import { Chat } from './components/Chat';
import { motion } from 'framer-motion';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { WhatsAppSteps } from './components/WhatsAppSteps';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
function HomeContent() {
  const searchParams = useSearchParams();
  const isMobileView = searchParams.get('mobile') === 'true';

  return (
    <div className="min-h-[100dvh] bg-black text-white font-sans selection:bg-white/20">
      {/* Premium Ambient Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{ opacity: [0.15, 0.25, 0.15], scale: [1, 1.05, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] bg-gradient-to-br from-indigo-900/20 to-transparent blur-[120px] rounded-full mix-blend-screen"
        />
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-gradient-to-tl from-zinc-700/30 to-transparent blur-[120px] rounded-full mix-blend-screen"
        />
      </div>

      {/* Glassmorphic Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 border border-white/20 overflow-hidden">
              <Image src="/icon.png" alt="Legani Logo" width={20} height={20} className="object-contain" />
            </div>
            <span className="text-xl tracking-[0.2em] font-medium uppercase text-white shadow-sm">
              Legani
            </span>
          </div>

          <Link
            href="/admin"
            className="flex items-center gap-1.5 md:gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-white/10 bg-white/5 text-[10px] md:text-xs text-white uppercase tracking-widest font-medium hover:bg-white/10 hover:border-white/20 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] group"
          >
            <span>Portal</span>
            <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <ArrowRight className="w-2.5 h-2.5 md:w-3 md:h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Split-Pane Hero Section */}
        <section className={`min-h-[100dvh] pt-28 pb-12 flex ${isMobileView ? 'p-4' : 'max-w-7xl mx-auto px-6 lg:max-h-[1100px]'}`}>
          <div className={`w-full my-auto grid ${isMobileView ? 'grid-cols-1 gap-12' : 'grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8'} items-center`}>

            {/* Left Pane: Copy & CTA */}
            {!isMobileView && (
              <div className="space-y-8 max-w-xl">
                <div className="inline-block">
                  <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] uppercase tracking-widest text-zinc-400 font-medium">
                    Intelligent Hospitality
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-light tracking-tight text-white leading-[1.1]">
                  Automate Luxury. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-zinc-600">
                    Elevate Experience.
                  </span>
                </h1>

                <p className="text-lg text-zinc-400 font-light leading-relaxed max-w-md">
                  Deploy an intelligent, hyper-personalized AI concierge that seamlessly manages guest inquiries, bookings, and property nuances 24/7.
                </p>

                <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <button
                    onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                    className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black text-sm tracking-wide uppercase font-semibold hover:bg-zinc-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                  >
                    Explore Integration
                  </button>
                  <p className="text-zinc-500 text-sm font-light w-full text-center sm:text-left">
                    Try the live demo  →
                  </p>
                </div>
              </div>
            )}

            {/* Right Pane/Mobile View: Interactive Chat Demo Wrapper */}
            <div className={`relative w-full ${isMobileView ? 'max-w-[430px] mx-auto h-[100dvh] pt-16 flex flex-col justify-center' : 'flex justify-end'}`}>
              {/* Aesthetic glow behind the chat component */}
              {!isMobileView && (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent blur-3xl opacity-50 rounded-full" />
              )}
              <div className="relative w-full z-10">
                <Chat isMobileView={isMobileView} />
              </div>
            </div>

          </div>
        </section>

        {/* Integration Steps Section */}
        {!isMobileView && (
          <WhatsAppSteps />
        )}

        {/* Demo Call to Action Section */}
        {!isMobileView && (
          <section className="w-full py-32 bg-black relative z-10 border-t border-white/5 overflow-hidden flex flex-col items-center justify-center text-center">
            {/* Grand backdrop glows */}
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/20 via-zinc-900/10 to-black pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-6 md:space-y-8 flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-[10px] md:text-xs uppercase tracking-[0.2em] text-indigo-300 font-medium mb-2 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                Live Demonstration
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-light tracking-tight text-white mb-4 leading-tight">
                See How It <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-white">Learns.</span>
              </h2>
              <p className="text-zinc-400 text-base md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
                Legani's AI concierge dynamically trains on your property's specific knowledge base in real-time. Experience the seamless knowledge management architecture directly.
              </p>
              <div className="pt-6 md:pt-10 w-full flex justify-center">
                <Link
                  href="/admin"
                  className="inline-flex items-center justify-center gap-3 md:gap-4 px-6 sm:px-8 md:px-10 py-3.5 md:py-5 rounded-[2rem] bg-white text-black text-xs sm:text-sm md:text-base tracking-widest uppercase font-bold hover:bg-zinc-100 hover:scale-[1.02] active:scale-100 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] group"
                >
                  Enter The Portal
                  <div className="w-6 h-6 md:w-8 md:h-8 shrink-0 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                    <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-10 md:py-12 bg-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center justify-center gap-2 text-zinc-500">
            <Image src="/icon.png" alt="Legani Logo" width={16} height={16} className="w-4 h-4 opacity-70 grayscale" />
            <span className="text-xs tracking-widest uppercase font-medium text-center">Legani AI by Veiter</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-xs font-light text-zinc-500 uppercase tracking-widest text-center">
            <Link href="/admin" className="hover:text-white transition-colors">Partner Portal</Link>
            <span>© {new Date().getFullYear()} All Rights Reserved</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-black"></div>}>
      <HomeContent />
    </Suspense>
  );
}
