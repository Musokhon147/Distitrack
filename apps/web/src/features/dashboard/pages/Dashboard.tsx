import React, { useState, useEffect } from 'react';
import { useEntries } from '../../../hooks/useEntries';
import { Moon, Sun } from 'lucide-react';

export const SimplifiedDashboard: React.FC = () => {
    const { addEntry } = useEntries();
    const [isDark, setIsDark] = useState(false);
    const [formData, setFormData] = useState({
        marketNomi: '',
        marketRaqami: '+998',
        mahsulotTuri: '',
        miqdori: '',
        tolovHolati: 'to\'lanmagan' as const
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    const handleSubmit = () => {
        if (!formData.marketNomi || !formData.mahsulotTuri || !formData.miqdori) {
            alert('Iltimos, barcha maydonlarni to\'ldiring');
            return;
        }
        addEntry(formData);
        setFormData({
            marketNomi: '',
            marketRaqami: '+998',
            mahsulotTuri: '',
            miqdori: '',
            tolovHolati: 'to\'lanmagan'
        });
        alert('Muvaffaqiyatli saqlandi!');
    };

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-8 bg-white dark:bg-slate-900 shadow-xl rounded-2xl mt-0 sm:mt-6 transition-colors duration-200">
            <div className="flex justify-between items-center mb-10 gap-4">
                <div className="flex-1">
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Bo'zor Daftari</h1>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">B2B savdo va hisob-kitob tizimi</p>
                </div>
                <button
                    onClick={() => setIsDark(!isDark)}
                    className="p-3 sm:p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-yellow-400 hover:scale-110 transition-transform shadow-sm"
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>

            <div className="flex justify-center">
                {/* Form Section */}
                <div className="w-full max-w-xl space-y-4 sm:space-y-6 bg-slate-50/50 dark:bg-slate-800/50 p-4 sm:p-10 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-slate-200 mb-4 sm:mb-6 border-b dark:border-slate-700 pb-3">Yangi yozuv qo'shish</h2>
                    {/* Form fields... */}
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700 dark:text-slate-400">Market nomi</label>
                        <input
                            type="text"
                            placeholder="Market nomi"
                            className="w-full p-3 sm:p-4 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 dark:text-white transition-all shadow-sm"
                            value={formData.marketNomi}
                            onChange={(e) => setFormData({ ...formData, marketNomi: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700 dark:text-slate-400">Market raqami</label>
                        <input
                            type="text"
                            placeholder="+998"
                            className="w-full p-3 sm:p-4 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 dark:text-white transition-all shadow-sm"
                            value={formData.marketRaqami}
                            onChange={(e) => setFormData({ ...formData, marketRaqami: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700 dark:text-slate-400">Mahsulot turi</label>
                        <input
                            type="text"
                            placeholder="Mahsulot turi"
                            className="w-full p-3 sm:p-4 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 dark:text-white transition-all shadow-sm"
                            value={formData.mahsulotTuri}
                            onChange={(e) => setFormData({ ...formData, mahsulotTuri: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700 dark:text-slate-400">Miqdori</label>
                        <input
                            type="text"
                            placeholder="Miqdori (masalan: 50 kg)"
                            className="w-full p-3 sm:p-4 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 dark:text-white transition-all shadow-sm"
                            value={formData.miqdori}
                            onChange={(e) => setFormData({ ...formData, miqdori: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700 dark:text-slate-400">To'lov holati</label>
                        <select
                            className="w-full p-3 sm:p-4 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 dark:text-white transition-all shadow-sm appearance-none"
                            value={formData.tolovHolati}
                            onChange={(e) => setFormData({ ...formData, tolovHolati: e.target.value as any })}
                        >
                            <option value="to'lanmagan">To'lanmagan</option>
                            <option value="to'langan">To'langan</option>
                            <option value="kutilmoqda">Kutilmoqda</option>
                        </select>
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="w-full py-4 sm:py-5 bg-blue-600 text-white text-lg font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-[0.98] mt-4"
                    >
                        Saqlash
                    </button>
                </div>
            </div>
        </div>
    );
};
