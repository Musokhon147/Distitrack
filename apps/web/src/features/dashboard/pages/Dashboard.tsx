import React, { useState } from 'react';
import { useEntries } from '../../../hooks/useEntries';
import { Check } from 'lucide-react';

export const SimplifiedDashboard: React.FC = () => {
    const { addEntry } = useEntries();
    const [formData, setFormData] = useState<{
        marketNomi: string;
        marketRaqami: string;
        mahsulotTuri: string;
        miqdori: string;
        narx: string;
        tolovHolati: "to'langan" | "to'lanmagan" | "kutilmoqda";
    }>({
        marketNomi: '',
        marketRaqami: '+998',
        mahsulotTuri: '',
        miqdori: '',
        narx: '',
        tolovHolati: "to'lanmagan"
    });

    const formatNumber = (val: string | number) => {
        if (!val) return '';
        const num = typeof val === 'string' ? val.replace(/\D/g, '') : val.toString();
        return new Intl.NumberFormat('en-US').format(parseFloat(num) || 0);
    };

    const unformatNumber = (val: string) => {
        if (typeof val !== 'string') return '';
        return val.replace(/,/g, '');
    };



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
            narx: '',
            tolovHolati: "to'lanmagan"
        });
        alert('Muvaffaqiyatli saqlandi!');
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 bg-white dark:bg-slate-900 shadow-xl rounded-2xl mt-0 sm:mt-6 transition-colors duration-200">
            <div className="flex justify-between items-center mb-10 gap-4">
                <div className="flex-1">
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Bo'zor Daftari</h1>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">B2B savdo va hisob-kitob tizimi</p>
                </div>
            </div>

            <div className="flex justify-center">
                {/* Form Section */}
                <div className="w-full space-y-4 sm:space-y-6 bg-slate-50/50 dark:bg-slate-800/50 p-4 sm:p-10 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <h2 className="text-xl sm:text-3xl font-black text-gray-800 dark:text-slate-200 mb-4 sm:mb-8 border-b dark:border-slate-700 pb-4 flex items-center gap-3">
                        <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                        Yangi yozuv qo'shish
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Market nomi</label>
                            <input
                                type="text"
                                placeholder="Market nomi"
                                className="w-full p-4 border border-gray-200 dark:border-slate-600 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none bg-white dark:bg-slate-800 dark:text-white transition-all shadow-sm text-lg"
                                value={formData.marketNomi}
                                onChange={(e) => setFormData({ ...formData, marketNomi: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Market raqami</label>
                            <input
                                type="text"
                                placeholder="+998"
                                className="w-full p-4 border border-gray-200 dark:border-slate-600 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none bg-white dark:bg-slate-800 dark:text-white transition-all shadow-sm text-lg"
                                value={formData.marketRaqami}
                                onChange={(e) => setFormData({ ...formData, marketRaqami: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Mahsulot turi</label>
                            <input
                                type="text"
                                placeholder="Mahsulot turi"
                                className="w-full p-4 border border-gray-200 dark:border-slate-600 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none bg-white dark:bg-slate-800 dark:text-white transition-all shadow-sm text-lg"
                                value={formData.mahsulotTuri}
                                onChange={(e) => setFormData({ ...formData, mahsulotTuri: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Miqdori</label>
                            <input
                                type="text"
                                placeholder="Masalan: 50 kg"
                                className="w-full p-4 border border-gray-200 dark:border-slate-600 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none bg-white dark:bg-slate-800 dark:text-white transition-all shadow-sm text-lg"
                                value={formData.miqdori}
                                onChange={(e) => setFormData({ ...formData, miqdori: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Narxi (so'm)</label>
                            <input
                                type="text"
                                placeholder="0"
                                className="w-full p-4 border border-gray-200 dark:border-slate-600 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none bg-white dark:bg-slate-800 dark:text-white transition-all shadow-sm text-lg"
                                value={formatNumber(formData.narx)}
                                onChange={(e) => setFormData({ ...formData, narx: unformatNumber(e.target.value) })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">To'lov holati</label>
                            <div className="relative">
                                <select
                                    className="w-full p-4 border border-gray-200 dark:border-slate-600 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none bg-white dark:bg-slate-800 dark:text-white transition-all shadow-sm text-lg appearance-none cursor-pointer"
                                    value={formData.tolovHolati}
                                    onChange={(e) => setFormData({ ...formData, tolovHolati: e.target.value as any })}
                                >
                                    <option value="to'lanmagan">To'lanmagan</option>
                                    <option value="to'langan">To'langan</option>
                                    <option value="kutilmoqda">Kutilmoqda</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t dark:border-slate-700 mt-4">
                        <button
                            onClick={handleSubmit}
                            className="w-full py-5 bg-blue-600 text-white text-xl font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest"
                        >
                            <Check size={28} />
                            Saqlash
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
