"use client";

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Chat() {
    // @ts-ignore: Next.js typing conflicts with bleeding-edge AI SDK types
    const { messages, append, sendMessage, isLoading } = useChat();
    const [input, setInput] = useState('');
    const [isDemoRunning, setIsDemoRunning] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isLoadingRef = useRef(isLoading);

    useEffect(() => {
        isLoadingRef.current = isLoading;
    }, [isLoading]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const runChatDemo = async () => {
        if (isDemoRunning || isLoading) return;
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

    return (
        <div className="flex flex-col h-[600px] w-full max-w-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-zinc-200 dark:border-zinc-700 rounded-[2rem] shadow-2xl overflow-hidden font-sans">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50">
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                        <Sparkles className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
                    </div>
                    <div>
                        <h2 className="text-[13px] font-semibold tracking-[0.2em] uppercase text-zinc-900 dark:text-zinc-100">Legani</h2>
                        <p className="text-[10px] tracking-widest uppercase text-zinc-600 dark:text-zinc-400 font-medium">Concierge</p>
                    </div>
                </div>
                <button
                    onClick={runChatDemo}
                    disabled={isDemoRunning || isLoading}
                    className="text-[10px] tracking-[0.1em] uppercase bg-white dark:bg-zinc-800 text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all flex items-center gap-2 font-semibold shadow-sm disabled:opacity-50"
                >
                    <Play className="w-3 h-3 fill-current" />
                    {isDemoRunning ? "Running..." : "Play Demo"}
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/50 dark:bg-black/20">
                <AnimatePresence>
                    {messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center h-full text-center text-zinc-500 space-y-4"
                        >
                            <div className="w-16 h-16 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mb-4 shadow-sm">
                                <Sparkles className="w-6 h-6 text-zinc-700 dark:text-zinc-300" />
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
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mt-1 shadow-sm">
                                    <Sparkles className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
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
                    {isLoading && messages[messages.length - 1]?.role === 'user' && (
                        <motion.div
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className="flex gap-3 justify-start"
                        >
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mt-1 shadow-sm relative overflow-hidden">
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(161,161,170,0.4)_360deg)] opacity-70" />
                                <div className="absolute inset-[1px] bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-zinc-700 dark:text-zinc-300 relative z-10" />
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-3xl rounded-tl-sm flex items-center gap-2 shadow-sm relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 dark:via-white/5 to-transparent opacity-50 pointer-events-none" />
                                <motion.div animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }} className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 relative z-10 shadow-[0_0_8px_rgba(161,161,170,0.5)]" />
                                <motion.div animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 relative z-10 shadow-[0_0_8px_rgba(161,161,170,0.5)]" />
                                <motion.div animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 relative z-10 shadow-[0_0_8px_rgba(161,161,170,0.5)]" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white/50 dark:bg-zinc-950/50 border-t border-zinc-200 dark:border-zinc-800">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!input.trim() || isLoading) return;
                    sendMessage({ text: input });
                    setInput('');
                }} className="relative flex items-center">
                    <input
                        id="chat-input"
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:border-zinc-500 dark:focus:border-zinc-400 text-zinc-900 dark:text-zinc-100 text-[15px] font-medium rounded-full pl-6 pr-14 py-4 outline-none transition-all duration-300 shadow-sm"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 p-2.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 disabled:opacity-50 transition-all disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:bg-black dark:hover:bg-white"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}
