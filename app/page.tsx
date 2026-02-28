"use client";

import { Chat } from './components/Chat';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambient background glowing effects */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-zinc-800/30 blur-[120px] rounded-full pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-zinc-700/30 blur-[120px] rounded-full pointer-events-none"
      />

      <div className="z-10 flex flex-col items-center w-full max-w-4xl space-y-12 py-10">
        <div className="text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-normal tracking-[0.2em] text-white uppercase drop-shadow-sm">
            Legani
          </h1>
          <p className="text-sm md:text-base text-zinc-300 max-w-sm mx-auto font-medium tracking-widest uppercase">
            Intelligent Hospitality
          </p>
        </div>

        <Chat />
      </div>
    </div>
  );
}
