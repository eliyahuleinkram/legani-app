"use client";

import { useState, useEffect } from 'react';
import { Trash2, Plus, LogOut, Home, Key, MapPin } from 'lucide-react';
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

    useEffect(() => {
        fetchApartments();
    }, []);

    const fetchApartments = async () => {
        try {
            const res = await fetch('/api/apartments');
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
        try {
            const res = await fetch('/api/apartments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setFormData({ name: '', capacity: '', roomsAndBeds: '', amenities: '', extraInfo: '' });
                fetchApartments();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this apartment?')) return;
        try {
            await fetch('/api/apartments', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            fetchApartments();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans flex">
            {/* Sidebar */}
            <div className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-6 flex flex-col">
                <h1 className="text-xl font-bold tracking-tight mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Diamonds Admin</h1>
                <nav className="space-y-2 flex-1">
                    <a href="#" className="flex items-center gap-3 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                        <Home className="w-4 h-4" /> Apartments
                    </a>
                    <a href="/" className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                        <MapPin className="w-4 h-4" /> Go to Front Desk (AI)
                    </a>
                </nav>
                <button className="flex items-center gap-3 px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg mt-auto transition-colors align-center text-sm">
                    <LogOut className="w-4 h-4" /> Sign Out
                </button>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-5xl mx-auto space-y-8">
                    <header>
                        <h2 className="text-3xl font-semibold tracking-tight">Manage Inventory</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Add or update apartment details below. The AI Assistant will instantly learn these updates.</p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Form */}
                        <div className="lg:col-span-1 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm h-fit">
                            <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                                <Plus className="w-4 h-4 text-blue-500" /> Add New Unit
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-200">Unit Name</label>
                                    <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 placeholder-zinc-400" placeholder="e.g. Royal Sapphire Suite" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-200">Capacity</label>
                                    <input required value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value })} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 placeholder-zinc-400" placeholder="e.g. 2 adults, 3 kids" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-200">Room & Bed Details</label>
                                    <textarea required value={formData.roomsAndBeds} onChange={e => setFormData({ ...formData, roomsAndBeds: e.target.value })} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 h-28 resize-none placeholder-zinc-400" placeholder="e.g. Master bedroom has a King bed that splits into two Jewish beds." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-200">Amenities</label>
                                    <input required value={formData.amenities} onChange={e => setFormData({ ...formData, amenities: e.target.value })} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 placeholder-zinc-400" placeholder="e.g. Private Pool, Plata" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-200">Extra Details for AI</label>
                                    <input value={formData.extraInfo} onChange={e => setFormData({ ...formData, extraInfo: e.target.value })} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 placeholder-zinc-400" placeholder="Secret rules for AI?" />
                                </div>
                                <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                                    Save to Knowledge Base
                                </button>
                            </form>
                        </div>

                        {/* List */}
                        <div className="lg:col-span-2 space-y-4">
                            {loading ? (
                                <div className="animate-pulse flex flex-col gap-4">
                                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-zinc-200 dark:bg-zinc-800/50 rounded-2xl w-full"></div>)}
                                </div>
                            ) : apartments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-zinc-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 rounded-2xl text-zinc-500">
                                    <Key className="w-8 h-8 mb-4 opacity-50" />
                                    <p className="text-center">No inventory yet.<br />Add an apartment to start training the AI.</p>
                                </div>
                            ) : (
                                apartments.map((apt) => (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={apt.id} className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row gap-4 relative group">
                                        <button onClick={() => handleDelete(apt.id)} className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div className="flex-1 space-y-3">
                                            <h4 className="text-lg font-semibold text-blue-600 dark:text-blue-400">{apt.name}</h4>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                                                <div><span className="text-zinc-500 block mb-0.5">Capacity</span> {apt.capacity}</div>
                                                <div><span className="text-zinc-500 block mb-0.5">Amenities</span> {apt.amenities}</div>
                                                <div className="col-span-2"><span className="text-zinc-500 block mb-0.5">Rooms & Beds</span> {apt.roomsAndBeds}</div>
                                                {apt.extraInfo && <div className="col-span-2"><span className="text-zinc-500 block mb-0.5">AI Note</span> {apt.extraInfo}</div>}
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
