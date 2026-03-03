"use client";

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Send, Bot, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Chat({ fullScreen = false }: { fullScreen?: boolean }) {
    // @ts-ignore: Next.js typing conflicts with bleeding-edge AI SDK types
    const { messages, append, sendMessage, isLoading, status } = useChat();
    const [input, setInput] = useState('');
    const [isDemoRunning, setIsDemoRunning] = useState(false);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Support both older and newer AI SDK versions
    const isGenerating = status === 'submitted' || status === 'streaming' || isLoading;
    const isWaitingForFirstToken = status === 'submitted' || (isLoading && (messages.length === 0 || messages[messages.length - 1]?.role === 'user'));

    const isLoadingRef = useRef(isGenerating);

    useEffect(() => {
        isLoadingRef.current = isGenerating;
    }, [isGenerating]);

    useEffect(() => {
        if (messagesContainerRef.current) {
            // Use requestAnimationFrame to guarantee React has committed the new message nodes to the DOM
            // and the browser has calculated their real heights BEFORE we calculate scrollHeight.
            requestAnimationFrame(() => {
                setTimeout(() => {
                    if (messagesContainerRef.current) {
                        messagesContainerRef.current.scrollTo({
                            top: messagesContainerRef.current.scrollHeight,
                            behavior: 'smooth'
                        });
                    }
                }, 50); // Tiny offset allows mobile Safari enough time for layout reflow on new flex items
            });
        }
    }, [messages, isWaitingForFirstToken]);

    const runChatDemo = async () => {
        if (isDemoRunning || isGenerating) return;
        setIsDemoRunning(true);

        const typeAndSend = async (text: string, delayBefore = 1000, typingSpeed = 30) => {
            await new Promise(r => setTimeout(r, delayBefore));
            for (let i = 0; i <= text.length; i++) {
                setInput(text.slice(0, i));
                setTimeout(() => {
                    const inputEl = document.getElementById('chat-input') as HTMLInputElement;
                    if (inputEl) inputEl.scrollLeft = inputEl.scrollWidth;
                }, 0);
                await new Promise(r => setTimeout(r, typingSpeed));
            }
            await new Promise(r => setTimeout(r, 600));

            if (sendMessage) {
                sendMessage({ text });
            } else {
                append({ role: 'user', content: text });
            }
            setInput('');

            // Wait for isLoading to become true (max 3 seconds) since state dispatch is asynchronous
            let startWait = 0;
            while (!isLoadingRef.current && startWait < 3000) {
                await new Promise(r => setTimeout(r, 100));
                startWait += 100;
            }

            // Wait for generation to finish
            while (isLoadingRef.current) {
                await new Promise(r => setTimeout(r, 200));
            }
            await new Promise(r => setTimeout(r, 2500)); // Time to read the AI's response before next prompt
        };

        await typeAndSend("Hi! I'm planning a trip to Tzfat for 2 adults and 2 kids. My husband injured his knee, so we need to avoid stairs. What do you recommend?");
        await typeAndSend("That sounds good. Since he can't walk far, how does parking work right at the apartment?");
        await typeAndSend("Okay, 3 minutes is doable. We are strictly kosher. How is the kitchen setup?");
        await typeAndSend("Actually, change of plans! My parents are watching the kids. It'll just be the two of us for a romantic anniversary trip. We can manage the stairs now if it's worth it. What should we book instead?");

        setIsDemoRunning(false);
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('demo') === 'true') {
                runChatDemo();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={`flex flex-col w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl font-sans overflow-hidden text-[15px] sm:text-base ${fullScreen ? 'h-[100dvh] max-w-none rounded-none border-none shadow-none' : 'h-[100dvh] max-w-[430px] mx-auto rounded-none border-none shadow-none md:h-[500px] lg:h-[600px] md:max-w-2xl md:border md:border-zinc-200 md:dark:border-zinc-700 md:rounded-[2rem] md:shadow-2xl'}`}>
            {/* Header */}
            <div className={`flex items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 px-5 py-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-8 sm:py-6 sm:pt-6`}>
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="flex items-center justify-center shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden">
                        <Image src="/icon.png" alt="Legani" width={24} height={24} className="object-cover w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-xs sm:text-[13px] font-semibold tracking-[0.2em] uppercase text-zinc-900 dark:text-zinc-100 truncate">Legani</h2>
                        <p className="text-[9px] sm:text-[10px] tracking-widest uppercase text-zinc-600 dark:text-zinc-400 font-medium truncate">Concierge</p>
                    </div>
                </div>
                <button
                    onClick={runChatDemo}
                    disabled={isDemoRunning || isGenerating}
                    className="text-[9px] sm:text-[10px] shrink-0 tracking-[0.1em] uppercase bg-white dark:bg-zinc-800 text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 px-3 sm:px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all flex items-center gap-1.5 sm:gap-2 font-semibold shadow-sm disabled:opacity-50"
                >
                    <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                    <span className="hidden sm:inline">{isDemoRunning ? "Running..." : "Play Demo"}</span>
                    <span className="sm:hidden">{isDemoRunning ? "..." : "Demo"}</span>
                </button>
            </div>

            {/* Messages Area */}
            <div ref={messagesContainerRef} className={`flex-1 overflow-y-auto space-y-6 bg-zinc-50/50 dark:bg-black/20 p-4 sm:p-6`}>
                <AnimatePresence>
                    {messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center h-full text-center text-zinc-500 space-y-4"
                        >
                            <div className="w-16 h-16 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mb-4 shadow-sm overflow-hidden">
                                <Image src="/icon.png" alt="Legani" width={40} height={40} className="object-cover" />
                            </div>
                            <p className="max-w-[280px] font-medium tracking-wide text-zinc-700 dark:text-zinc-300">Welcome to Legani. Please inquire about your stay.</p>
                        </motion.div>
                    )}
                    {messages.map((m: any) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {m.role !== 'user' && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mt-1 shadow-sm overflow-hidden">
                                    <Image src="/icon.png" alt="Legani" width={20} height={20} className="object-cover" />
                                </div>
                            )}
                            <div className={`px-6 py-4 max-w-[80%] text-[15px] leading-relaxed whitespace-pre-wrap font-medium shadow-sm border relative overflow-hidden ${m.role === 'user'
                                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-transparent rounded-3xl rounded-tr-sm'
                                : 'bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-800/90 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 rounded-3xl rounded-tl-sm'
                                }`}>
                                {m.role !== 'user' && (
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 dark:via-white/5 to-transparent opacity-50 pointer-events-none" />
                                )}
                                <span className="relative z-10">{m.content || (m.parts ? m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('\n') : '')}</span>
                            </div>
                        </motion.div>
                    ))}
                    {isWaitingForFirstToken && (
                        <motion.div
                            key="loading-bubble"
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className="flex gap-3 justify-start"
                        >
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mt-1 shadow-md relative overflow-hidden group">
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(161,161,170,0.6)_360deg)] opacity-80" />
                                <div className="absolute inset-[1px] bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden z-10">
                                    <Image src="/icon.png" alt="Legani" width={20} height={20} className="object-cover" />
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-3xl rounded-tl-sm flex items-center gap-3 shadow-lg relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/60 dark:via-white/5 to-transparent opacity-60 pointer-events-none" />
                                <motion.div animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0 }} className="w-2 h-2 rounded-full bg-zinc-500 dark:bg-zinc-400 relative z-10 shadow-[0_0_8px_rgba(161,161,170,0.6)]" />
                                <motion.div animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 rounded-full bg-zinc-500 dark:bg-zinc-400 relative z-10 shadow-[0_0_8px_rgba(161,161,170,0.6)]" />
                                <motion.div animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 rounded-full bg-zinc-500 dark:bg-zinc-400 relative z-10 shadow-[0_0_8px_rgba(161,161,170,0.6)]" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className={`bg-white/50 dark:bg-zinc-950/50 border-t border-zinc-200 dark:border-zinc-800 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6 sm:pb-6`}>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!input.trim() || isGenerating) return;
                    if (sendMessage) {
                        sendMessage({ text: input });
                    } else if (append) {
                        append({ role: 'user', content: input });
                    }
                    setInput('');
                }} className="relative flex items-center">
                    <input
                        id="chat-input"
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:border-zinc-500 dark:focus:border-zinc-400 text-zinc-900 dark:text-zinc-100 text-base font-medium rounded-full pl-6 pr-14 py-4 outline-none transition-all duration-300 shadow-sm"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                    />
                    <button
                        type="submit"
                        disabled={isGenerating || !input.trim()}
                        className="absolute right-2 p-2.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 disabled:opacity-50 transition-all disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:bg-black dark:hover:bg-white"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div >
    );
}
