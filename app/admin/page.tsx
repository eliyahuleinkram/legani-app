"use client";

import { useState, useEffect } from 'react';
import { Trash2, Plus, LogOut, Home, Key, MapPin, Sparkles, Play } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
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

    useEffect(() => {
        fetchApartments();
    }, []);

    const fetchApartments = async () => {
        try {
            const res = await fetch(`/api/apartments?t=${Date.now()}`, { cache: 'no-store' });
            const data = await res.json();
            setApartments(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Optimistic UI Add
        const optimisticApt = { ...formData, id: `temp-${Date.now()}` };
        setApartments(prev => [...prev, optimisticApt]);
        const submittedData = formData;
        setFormData({ name: '', capacity: '', roomsAndBeds: '', amenities: '', extraInfo: '' });

        try {
            const res = await fetch('/api/apartments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submittedData)
            });
            if (res.ok) {
                setTimeout(fetchApartments, 800);
            } else {
                fetchApartments(); // Revert
            }
        } catch (error) {
            console.error(error);
            fetchApartments(); // Revert
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this apartment?')) return;

        // Optimistically remove from state for instant UI feedback
        setApartments(prev => prev.filter(apt => apt.id !== id));

        try {
            await fetch(`/api/apartments?id=${encodeURIComponent(id)}`, {
                method: 'DELETE',
            });
            // Delay the background fetch slightly to allow DynamoDB to become consistent
            setTimeout(fetchApartments, 800);
        } catch (e) {
            console.error(e);
            // Revert state if the delete failed
            fetchApartments();
        }
    };

    const runAdminDemo = async () => {
        if (isDemoRunning) return;
        setIsDemoRunning(true);

        const typeField = async (field: string, text: string, speed = 10) => {
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
        };

        const submitForm = async (data: any) => {
            await fetch('/api/apartments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            setFormData({ name: '', capacity: '', roomsAndBeds: '', amenities: '', extraInfo: '' });
            await fetchApartments();
        };

        // Apartment 1
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

        // Apartment 2
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
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans flex">
            {/* Sidebar */}
            <div className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-8 flex flex-col">
                <h1 className="text-sm font-bold tracking-widest uppercase mb-10 text-zinc-900 dark:text-zinc-100">Legani Admin</h1>
                <nav className="space-y-4 flex-1 text-sm font-medium">
                    <a href="#" className="flex items-center gap-3 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-full transition-colors">
                        <Home className="w-4 h-4" /> Inventory
                    </a>
                    <a href="/" className="flex items-center gap-3 px-4 py-2.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                        <MapPin className="w-4 h-4" /> Front Desk
                    </a>
                </nav>
                <button className="flex items-center gap-3 px-4 py-2.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mt-auto text-sm font-medium">
                    <LogOut className="w-4 h-4" /> Sign Out
                </button>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-10 overflow-y-auto">
                <div className="max-w-5xl mx-auto space-y-12">
                    <header>
                        <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Manage Properties</h2>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 font-medium">Train the Legani Concierge with real-time portfolio updates.</p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Form */}
                        <div className="lg:col-span-1 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 rounded-[2rem] shadow-sm h-fit">
                            <h3 className="font-semibold text-sm tracking-widest uppercase mb-6 flex items-center justify-between text-zinc-900 dark:text-zinc-100">
                                <span className="flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Add Property
                                </span>
                                <button
                                    type="button"
                                    onClick={runAdminDemo}
                                    disabled={isDemoRunning}
                                    className="text-[10px] font-bold tracking-widest uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Play className="w-3 h-3 fill-current" />
                                    {isDemoRunning ? "Running..." : "Demo"}
                                </button>
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-zinc-700 dark:text-zinc-300">Unit Name</label>
                                    <input id="admin-input-name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 px-4 py-3 rounded-xl text-sm font-medium outline-none focus:border-zinc-500 transition-colors placeholder-zinc-400" placeholder="e.g. Royal Sapphire Suite" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-zinc-700 dark:text-zinc-300">Capacity</label>
                                    <input id="admin-input-capacity" required value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 px-4 py-3 rounded-xl text-sm font-medium outline-none focus:border-zinc-500 transition-colors placeholder-zinc-400" placeholder="e.g. 2 adults, 3 kids" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-zinc-700 dark:text-zinc-300">Room & Bed Details</label>
                                    <textarea id="admin-input-roomsAndBeds" required value={formData.roomsAndBeds} onChange={e => setFormData({ ...formData, roomsAndBeds: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 px-4 py-3 rounded-xl text-sm font-medium outline-none focus:border-zinc-500 h-24 resize-none transition-colors placeholder-zinc-400" placeholder="e.g. Master bedroom with King bed..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-zinc-700 dark:text-zinc-300">Amenities</label>
                                    <textarea id="admin-input-amenities" required value={formData.amenities} onChange={e => setFormData({ ...formData, amenities: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 px-4 py-3 rounded-xl text-sm font-medium outline-none focus:border-zinc-500 h-24 resize-none transition-colors placeholder-zinc-400" placeholder="e.g. Private Pool, Terrace..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-zinc-700 dark:text-zinc-300">Extra Details for AI</label>
                                    <textarea id="admin-input-extraInfo" value={formData.extraInfo} onChange={e => setFormData({ ...formData, extraInfo: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 px-4 py-3 rounded-xl text-sm font-medium outline-none focus:border-zinc-500 h-24 resize-none transition-colors placeholder-zinc-400" placeholder="Internal instructions..." />
                                </div>
                                <div className="pt-4">
                                    <button type="submit" className="w-full py-3.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md hover:bg-black dark:hover:bg-white">
                                        Update Knowledge Base
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* List */}
                        <div className="lg:col-span-2 space-y-4">
                            {loading ? (
                                <div className="animate-pulse flex flex-col gap-4">
                                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full"></div>)}
                                </div>
                            ) : apartments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl text-zinc-600 dark:text-zinc-400">
                                    <Key className="w-8 h-8 mb-4 opacity-70" />
                                    <p className="text-center text-sm font-medium">Portfolio empty.<br />Add a property to train the AI.</p>
                                </div>
                            ) : (
                                apartments.map((apt) => (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={apt.id} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row gap-6 relative group">
                                        <button onClick={() => handleDelete(apt.id)} className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div className="flex-1 space-y-4 text-zinc-800 dark:text-zinc-200">
                                            <h4 className="text-xl font-semibold">{apt.name}</h4>
                                            <div className="grid grid-cols-2 gap-x-8 gap-y-6 text-sm">
                                                <div><span className="block mb-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Capacity</span> {apt.capacity}</div>
                                                <div><span className="block mb-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Amenities</span> {apt.amenities}</div>
                                                <div className="col-span-2"><span className="block mb-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Rooms & Beds</span> {apt.roomsAndBeds}</div>
                                                {apt.extraInfo && <div className="col-span-2"><span className="block mb-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Internal AI Note</span> {apt.extraInfo}</div>}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
