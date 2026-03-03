"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import { Trash2, Plus, LogOut, Home, MapPin, Play, Sparkles, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

function AdminDashboardContent() {
    const searchParams = useSearchParams();
    const urlMobilePreset = searchParams.get('mobile') === 'true';
    const isDemo = searchParams.get('demo') === 'true';

    const [isMobileDevice, setIsMobileDevice] = useState(false);
    const [apartments, setApartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        capacity: '',
        roomsAndBeds: '',
        amenities: '',
        extraInfo: ''
    });
    const [isDemoRunning, setIsDemoRunning] = useState(false);
    const demoRunRef = useRef(false);
    const basePath = typeof window !== 'undefined' && window.location.pathname.startsWith('/demo/legani') ? '/demo/legani' : '';

    useEffect(() => {
        const checkMobile = () => {
            setIsMobileDevice(window.innerWidth <= 860);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const isMobileView = urlMobilePreset || isMobileDevice;

    useEffect(() => {
        fetchApartments();
    }, []);

    const fetchApartments = async () => {
        try {
            const res = await fetch(`${basePath}/api/apartments?t=${Date.now()}`, { cache: 'no-store' });
            const data = await res.json();
            setApartments(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const checkDuplicate = (data: any) => {
        const normalize = (str?: string) => str ? str.trim().replace(/\s+/g, ' ').toLowerCase() : '';
        return apartments.some(apt =>
            normalize(apt.name) === normalize(data.name) &&
            normalize(apt.capacity) === normalize(data.capacity) &&
            normalize(apt.roomsAndBeds) === normalize(data.roomsAndBeds) &&
            normalize(apt.amenities) === normalize(data.amenities) &&
            normalize(apt.extraInfo) === normalize(data.extraInfo)
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (checkDuplicate(formData)) {
            alert('This property already exists in the knowledge base.');
            return;
        }

        const optimisticApt = { ...formData, id: `temp-${Date.now()}` };
        setApartments(prev => [...prev, optimisticApt]);
        const submittedData = formData;
        setFormData({ name: '', capacity: '', roomsAndBeds: '', amenities: '', extraInfo: '' });

        try {
            const res = await fetch(`${basePath}/api/apartments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submittedData)
            });
            if (res.ok) {
                setTimeout(fetchApartments, 800);
            } else {
                fetchApartments();
            }
        } catch (error) {
            console.error(error);
            fetchApartments();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this apartment?')) return;

        setApartments(prev => prev.filter(apt => apt.id !== id));

        try {
            await fetch(`${basePath}/api/apartments?id=${encodeURIComponent(id)}`, {
                method: 'DELETE',
            });
            setTimeout(fetchApartments, 800);
        } catch (e) {
            console.error(e);
            fetchApartments();
        }
    };

    const runAdminDemo = async () => {
        if (isDemoRunning || demoRunRef.current) return;
        setIsDemoRunning(true);
        demoRunRef.current = true;

        await new Promise(r => setTimeout(r, 1200));

        const typeField = async (field: string, text: string, speed = 10) => {
            const el = document.getElementById(`admin-input-${field}`) as HTMLInputElement | HTMLTextAreaElement;
            if (el) {
                el.setAttribute('inputmode', 'none');
                el.focus({ preventScroll: true });
                el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                await new Promise(r => setTimeout(r, 600));
            }

            for (let i = 0; i <= text.length; i++) {
                setFormData(prev => ({ ...prev, [field]: text.slice(0, i) }));
                setTimeout(() => {
                    const el = document.getElementById(`admin-input-${field}`) as HTMLElement;
                    if (el && 'scrollTop' in el) {
                        el.scrollTop = el.scrollHeight;
                    }
                    if (el && 'scrollLeft' in el) {
                        el.scrollLeft = el.scrollWidth;
                    }
                }, 0);
                await new Promise(r => setTimeout(r, speed));
            }
            await new Promise(r => setTimeout(r, 400));

            if (el) {
                el.blur();
                el.removeAttribute('inputmode');
            }
        };

        const submitForm = async (data: any) => {
            await fetch(`${basePath}/api/apartments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            setFormData({ name: '', capacity: '', roomsAndBeds: '', amenities: '', extraInfo: '' });
            await fetchApartments();
        };

        await typeField("name", "The Mystic View Suite");
        await typeField("capacity", "2 Adults, 2 Kids");
        await typeField("roomsAndBeds", "Master bedroom features a King-size bed (Jewish beds that can separate). The main living area includes a premium pull-out sofa bed suitable for two children.");
        await typeField("amenities", "Private panoramic balcony overlooking Mt. Meron, indoor Jacuzzi, Kosher kitchenette, Shabbat hotplate (Plata), hot water urn, Nespresso machine, fast Wi-Fi.");
        await typeField("extraInfo", "Emphasize the romantic atmosphere and amazing sunset views. If guests ask about accessibility, let them know there are two flights of stairs to reach the unit, so it is not wheelchair accessible. Only a 5-minute walk to the Artist Quarter.");

        await new Promise(r => setTimeout(r, 400));
        await submitForm({
            name: "The Mystic View Suite",
            capacity: "2 Adults, 2 Kids",
            roomsAndBeds: "Master bedroom features a King-size bed (Jewish beds that can separate). The main living area includes a premium pull-out sofa bed suitable for two children.",
            amenities: "Private panoramic balcony overlooking Mt. Meron, indoor Jacuzzi, Kosher kitchenette, Shabbat hotplate (Plata), hot water urn, Nespresso machine, fast Wi-Fi.",
            extraInfo: "Emphasize the romantic atmosphere and amazing sunset views. If guests ask about accessibility, let them know there are two flights of stairs to reach the unit, so it is not wheelchair accessible. Only a 5-minute walk to the Artist Quarter."
        });

        await new Promise(r => setTimeout(r, 1000));

        await typeField("name", "The Old City Family Arches");
        await typeField("capacity", "4 Adults, 6 Kids");
        await typeField("roomsAndBeds", "3 bedrooms total. The master and second bedrooms each have two twin beds. The children's room has two sets of bunk beds and a pull-out trundle. A baby crib is available in the master closet.");
        await typeField("amenities", "Private historic stone courtyard, large dining table (seats 12), strict Kosher kitchen (separate meat and dairy sinks), washer and dryer, high chair, selection of Jewish board games.");
        await typeField("extraInfo", "Ideal for large religious families wanting an authentic Old City Safed experience. If guests ask about parking, inform them that cars cannot enter the narrow alleyways; they must park at the public lot near the Ari Ashkenazi Synagogue (a 3-minute walk away).");

        await new Promise(r => setTimeout(r, 400));
        await submitForm({
            name: "The Old City Family Arches",
            capacity: "4 Adults, 6 Kids",
            roomsAndBeds: "3 bedrooms total. The master and second bedrooms each have two twin beds. The children's room has two sets of bunk beds and a pull-out trundle. A baby crib is available in the master closet.",
            amenities: "Private historic stone courtyard, large dining table (seats 12), strict Kosher kitchen (separate meat and dairy sinks), washer and dryer, high chair, selection of Jewish board games.",
            extraInfo: "Ideal for large religious families wanting an authentic Old City Safed experience. If guests ask about parking, inform them that cars cannot enter the narrow alleyways; they must park at the public lot near the Ari Ashkenazi Synagogue (a 3-minute walk away)."
        });

        setIsDemoRunning(false);
        demoRunRef.current = false;
    };

    useEffect(() => {
        if (isDemo) {
            runAdminDemo();
        }
    }, [isDemo]);

    return (
        <div className={`min-h-[100dvh] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans flex relative overflow-hidden transition-colors duration-500 ${isMobileView ? 'max-w-[430px] mx-auto shadow-2xl bg-white dark:bg-zinc-950' : ''}`}>

            {/* Sidebar */}
            {!isMobileView && (
                <div className="w-64 bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-6 flex flex-col z-10 relative transition-colors duration-500">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="flex items-center justify-center w-8 h-8 bg-zinc-900 dark:bg-white overflow-hidden shadow-sm rounded-xl">
                            <Image src="/icon.png" alt="Legani Logo" width={20} height={20} className="object-contain invert dark:invert-0" />
                        </div>
                        <h1 className="text-sm font-bold tracking-wide text-zinc-900 dark:text-white">Partner Portal</h1>
                    </div>

                    <div className="space-y-1 mb-8">
                        <p className="text-[11px] font-bold tracking-wider uppercase text-zinc-400 dark:text-zinc-500 mb-4 px-2">Knowledge Base</p>
                        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
                            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Active Properties</span>
                            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{apartments.length}</span>
                        </div>
                    </div>

                    <div className="mt-auto">
                        <div className="p-4 bg-zinc-100 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                            The AI concierge automatically expands its knowledge when you add or update properties here.
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className={`flex-1 overflow-y-auto z-10 relative scroll-smooth bg-white dark:bg-zinc-950 ${isMobileView ? 'p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]' : 'p-12 lg:p-16'}`}>
                <div className="max-w-[1400px] mx-auto space-y-10">

                    <header className={isMobileView ? 'text-center mb-8' : 'flex items-end justify-between mb-12'}>
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mb-3">
                                Property Portfolio
                            </h2>
                            <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 font-medium">
                                Manage the real-time knowledge base for the Legani Concierge AI.
                            </p>
                        </div>
                        {!isMobileView && (
                            <button
                                type="button"
                                onClick={runAdminDemo}
                                disabled={isDemoRunning}
                                className="text-xs font-bold tracking-wide bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 px-6 py-2.5 rounded-full shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                {isDemoRunning ? "Running Demo..." : "Run Demo"}
                            </button>
                        )}
                    </header>

                    {isMobileView && (
                        <button
                            type="button"
                            onClick={runAdminDemo}
                            disabled={isDemoRunning}
                            className="w-full mb-8 text-xs font-bold tracking-widest uppercase bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-5 py-3 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            {isDemoRunning ? "Running Demo..." : "Run AI Training Demo"}
                        </button>
                    )}

                    <div className={`grid grid-cols-1 gap-10 xl:gap-14 ${isMobileView ? '' : 'lg:grid-cols-12'}`}>

                        {/* Form Section */}
                        <div className={`${isMobileView ? '' : 'lg:col-span-5 xl:col-span-4'}`}>
                            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 rounded-2xl sticky top-12">
                                <h3 className="font-bold text-sm tracking-wide mb-8 flex items-center text-zinc-900 dark:text-white pb-4 border-b border-zinc-200 dark:border-zinc-800">
                                    <div className="w-6 h-6 bg-zinc-900 dark:bg-white flex items-center justify-center mr-3 rounded-xl shadow-sm">
                                        <Plus className="w-3.5 h-3.5 text-white dark:text-zinc-900" />
                                    </div>
                                    Add New Property
                                </h3>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Property Name</label>
                                        <input id="admin-input-name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-sm font-medium outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors placeholder-zinc-400 dark:placeholder-zinc-600 rounded-xl" placeholder="e.g. Royal Sapphire Suite" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Capacity</label>
                                        <input id="admin-input-capacity" required value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value })} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-sm font-medium outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors placeholder-zinc-400 dark:placeholder-zinc-600 rounded-xl" placeholder="e.g. 2 adults, 3 kids" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Room Configurations</label>
                                        <textarea id="admin-input-roomsAndBeds" required value={formData.roomsAndBeds} onChange={e => setFormData({ ...formData, roomsAndBeds: e.target.value })} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-sm font-medium outline-none focus:border-zinc-400 dark:focus:border-zinc-600 h-28 resize-none transition-colors placeholder-zinc-400 dark:placeholder-zinc-600 rounded-xl" placeholder="e.g. Master bedroom with King bed, living room pull-out..." />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Key Amenities</label>
                                        <textarea id="admin-input-amenities" required value={formData.amenities} onChange={e => setFormData({ ...formData, amenities: e.target.value })} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-sm font-medium outline-none focus:border-zinc-400 dark:focus:border-zinc-600 h-28 resize-none transition-colors placeholder-zinc-400 dark:placeholder-zinc-600 rounded-xl" placeholder="e.g. Private Pool, Terrace, Kosher Kitchen..." />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Internal AI Instructions</label>
                                        <textarea id="admin-input-extraInfo" value={formData.extraInfo} onChange={e => setFormData({ ...formData, extraInfo: e.target.value })} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-sm font-medium outline-none focus:border-zinc-400 dark:focus:border-zinc-600 h-24 resize-none transition-colors placeholder-zinc-400 dark:placeholder-zinc-600 rounded-xl" placeholder="Context or rules solely for the AI's awareness..." />
                                    </div>

                                    <div className="pt-6">
                                        <button type="submit" className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-sm tracking-wide transition-colors rounded-xl shadow-sm">
                                            Update Knowledge Base
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* List Section */}
                        <div className={`${isMobileView ? '' : 'lg:col-span-7 xl:col-span-8'}`}>
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                                <h3 className="font-bold text-lg tracking-wide text-zinc-900 dark:text-white">Active Properties</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <AnimatePresence mode="popLayout">
                                    {loading ? (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="col-span-1 md:col-span-2 flex gap-5">
                                            {[1, 2].map(i => (
                                                <div key={i} className="h-40 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full animate-pulse"></div>
                                            ))}
                                        </motion.div>
                                    ) : apartments.length === 0 ? (
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="col-span-1 md:col-span-2 flex flex-col items-center justify-center h-64 border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl text-zinc-500 dark:text-zinc-400 p-8 text-center">
                                            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 tracking-wide">Portfolio is empty</p>
                                            <p className="text-xs max-w-sm">No property records existing within the core knowledge base.</p>
                                        </motion.div>
                                    ) : (
                                        apartments.map((apt) => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
                                                key={apt.id}
                                                className={`bg-zinc-50 dark:bg-zinc-900 p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors flex flex-col gap-6 relative group`}
                                            >
                                                <button
                                                    onClick={() => handleDelete(apt.id)}
                                                    className={`absolute top-6 right-6 p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 dark:hover:bg-zinc-800 rounded-xl transition-all ${isMobileView ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                                    title="Remove record"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>

                                                <div className="flex-1 space-y-6 text-zinc-800 dark:text-zinc-200 pt-1">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-1.5 h-1.5 bg-zinc-900 dark:bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)] rounded-full"></div>
                                                        <h4 className="text-xl font-bold tracking-normal text-zinc-900 dark:text-white pr-8">{apt.name}</h4>
                                                    </div>

                                                    <div className="space-y-6 text-[13px] leading-relaxed">
                                                        <div className="space-y-1">
                                                            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                                                Capacity
                                                            </span>
                                                            <p className="font-medium text-zinc-700 dark:text-zinc-300">{apt.capacity}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                                                Key Amenities
                                                            </span>
                                                            <p className="font-medium text-zinc-700 dark:text-zinc-300">{apt.amenities}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                                                Room Configurations
                                                            </span>
                                                            <p className="font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-950 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">{apt.roomsAndBeds}</p>
                                                        </div>
                                                        {apt.extraInfo && (
                                                            <div className="space-y-1 pt-2">
                                                                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                                                    System Rules (AI Config)
                                                                </span>
                                                                <p className="font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/50 px-4 py-3 rounded-xl border-l-2 border-zinc-400 dark:border-zinc-600">{apt.extraInfo}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function AdminDashboard() {
    return (
        <Suspense fallback={<div className="min-h-[100dvh] bg-[#f8f9fa] dark:bg-[#0a0a0b]"></div>}>
            <AdminDashboardContent />
        </Suspense>
    );
}
