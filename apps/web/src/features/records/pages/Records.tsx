import React, { useState } from 'react';
import { Entry } from '@distitrack/common';
import { History, Search, Filter, Calendar, Trash2, Edit3, Download, X, Check } from 'lucide-react';
import { useEntries } from '../../../hooks/useEntries';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const Records: React.FC = () => {
    const { entries, updateEntry, deleteEntry } = useEntries();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('Barchasi');
    const [showFilters, setShowFilters] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Entry>>({});

    const filteredEntries = entries.filter(entry => {
        const matchesSearch = entry.marketNomi.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.mahsulotTuri.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'Barchasi' || entry.tolovHolati === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Calculate overall sum of product prices
    const totalSum = filteredEntries.reduce((sum, entry) => {
        const price = parseFloat(unformatNumber(entry.narx || '0')) || 0;
        return sum + price;
    }, 0);

    const handleEditStart = (entry: Entry) => {
        setEditingId(entry.id);
        setEditForm(entry);
    };

    const handleEditSave = () => {
        if (editingId) {
            updateEntry(editingId, editForm);
            setEditingId(null);
        }
    };

    const formatNumber = (val: string | number) => {
        if (!val) return '';
        const num = typeof val === 'string' ? val.replace(/\D/g, '') : val.toString();
        return new Intl.NumberFormat('en-US').format(parseFloat(num) || 0);
    };

    const unformatNumber = (val: string) => {
        return val.replace(/,/g, '');
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("Bo'zor Daftari - Yozuvlar Tarixi", 14, 15);
        autoTable(doc, {
            startY: 20,
            head: [['Sana', 'Market Nomi', 'Raqam', 'Mahsulot', 'Miqdor', 'Narx', 'Holat']],
            body: filteredEntries.map(e => [e.sana, e.marketNomi, e.marketRaqami, e.mahsulotTuri, e.miqdori, e.narx, e.tolovHolati]),
            styles: { font: 'helvetica', fontSize: 10 },
        });
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        doc.save(`bozor_daftari_${dateStr}.pdf`);
    };

    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(filteredEntries.map(e => ({
            'Sana': e.sana,
            'Market Nomi': e.marketNomi,
            'Telefon': e.marketRaqami,
            'Mahsulot': e.mahsulotTuri,
            'Miqdori': e.miqdori,
            'Narx': e.narx,
            'Holati': e.tolovHolati
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Yozuvlar");
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        XLSX.writeFile(wb, `bozor_daftari_${dateStr}.xlsx`);
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 bg-white dark:bg-slate-900 shadow-xl rounded-2xl mt-6 transition-colors duration-200 min-h-[80vh]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        <History className="text-blue-600" size={32} />
                        Tarix
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Qaysi do'konga nima yuborilgani haqida to'liq ma'lumot</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button
                        onClick={exportToPDF}
                        className="flex-1 md:flex-none p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-all"
                    >
                        <Download size={18} />
                        PDF
                    </button>
                    <button
                        onClick={exportToExcel}
                        className="flex-1 md:flex-none p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-all"
                    >
                        <Download size={18} />
                        Excel
                    </button>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="space-y-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative col-span-2">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Do'kon nomi yoki mahsulot turi..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`w-full p-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm border ${showFilters
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            <Filter size={18} />
                            {statusFilter === 'Barchasi' ? 'Filtrlar' : statusFilter}
                        </button>

                        {showFilters && (
                            <div className="absolute top-full right-0 mt-2 w-full md:w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-2">To'lov holati</p>
                                {['Barchasi', 'to\'langan', 'to\'lanmagan', 'kutilmoqda'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => {
                                            setStatusFilter(status);
                                            setShowFilters(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${statusFilter === status
                                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                            }`}
                                    >
                                        <span className="capitalize">{status}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Records List */}
            <div className="space-y-4">
                {filteredEntries.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 font-medium bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                        Topilmadi
                    </div>
                ) : (
                    <>
                        {filteredEntries.map(entry => (
                            <div key={entry.id} className="p-4 sm:p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                {editingId === entry.id ? (
                                    <div className="w-full space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                            <input
                                                className="p-3 border rounded-xl dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                                value={editForm.marketNomi}
                                                onChange={(e) => setEditForm({ ...editForm, marketNomi: e.target.value })}
                                                placeholder="Market"
                                            />
                                            <input
                                                className="p-3 border rounded-xl dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                                value={editForm.mahsulotTuri}
                                                onChange={(e) => setEditForm({ ...editForm, mahsulotTuri: e.target.value })}
                                                placeholder="Mahsulot"
                                            />
                                            <input
                                                className="p-3 border rounded-xl dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                                value={editForm.miqdori}
                                                onChange={(e) => setEditForm({ ...editForm, miqdori: e.target.value })}
                                                placeholder="Miqdor"
                                            />
                                            <input
                                                className="p-3 border rounded-xl dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                                value={formatNumber(editForm.narx || '')}
                                                onChange={(e) => setEditForm({ ...editForm, narx: unformatNumber(e.target.value) })}
                                                placeholder="Narx"
                                            />
                                            <select
                                                className="p-3 border rounded-xl dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                                value={editForm.tolovHolati}
                                                onChange={(e) => setEditForm({ ...editForm, tolovHolati: e.target.value as any })}
                                            >
                                                <option value="to'langan">To'langan</option>
                                                <option value="to'lanmagan">To'lanmagan</option>
                                                <option value="kutilmoqda">Kutilmoqda</option>
                                            </select>
                                        </div>
                                        <div className="flex justify-end gap-3 pt-2">
                                            <button onClick={() => setEditingId(null)} className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors"><X size={20} /></button>
                                            <button onClick={handleEditSave} className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors shadow-lg"><Check size={20} /></button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                                        <div className="flex items-center gap-4 w-full lg:w-auto">
                                            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform hidden sm:block">
                                                <Calendar size={24} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">{entry.marketNomi}</h3>
                                                <p className="text-sm text-slate-400 font-mono">{entry.marketRaqami}</p>
                                            </div>
                                            <div className="flex gap-1 lg:hidden">
                                                <button
                                                    onClick={() => handleEditStart(entry)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => deleteEntry(entry.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
                                            <div className="bg-slate-50 dark:bg-slate-700/50 px-3 sm:px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                                <span className="text-[10px] text-slate-400 block uppercase font-black tracking-wider mb-1">Mahsulot</span>
                                                <span className="font-bold text-sm sm:text-base text-slate-700 dark:text-slate-200 truncate block">{entry.mahsulotTuri}</span>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-700/50 px-3 sm:px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                                <span className="text-[10px] text-slate-400 block uppercase font-black tracking-wider mb-1">Miqdori</span>
                                                <span className="font-bold text-sm sm:text-base text-blue-600 dark:text-blue-400 truncate block">{entry.miqdori}</span>
                                            </div>
                                            <div className="bg-emerald-50 dark:bg-emerald-900/20 px-3 sm:px-4 py-2 rounded-xl border border-emerald-200 dark:border-emerald-700/50">
                                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block uppercase font-black tracking-wider mb-1">Narx</span>
                                                <span className="font-bold text-sm sm:text-base text-emerald-600 dark:text-emerald-400 truncate block">{formatNumber(entry.narx)} so'm</span>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-700/50 px-3 sm:px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700/50 col-span-2 sm:col-span-1 flex flex-col justify-center">
                                                <span className="text-[10px] text-slate-400 block uppercase font-black tracking-wider mb-1">Holati</span>
                                                <span className={`text-[10px] sm:text-xs font-black uppercase tracking-tight py-1 px-2 rounded-lg text-center ${entry.tolovHolati === 'to\'langan'
                                                    ? 'bg-emerald-500/10 text-emerald-500'
                                                    : entry.tolovHolati === 'kutilmoqda'
                                                        ? 'bg-amber-500/10 text-amber-500'
                                                        : 'bg-red-500/10 text-red-500'
                                                    }`}>
                                                    {entry.tolovHolati}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="hidden lg:flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEditStart(entry)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button
                                                onClick={() => deleteEntry(entry.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Overall Sum Summary */}
                        <div className="mt-6 p-6 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-2 border-emerald-200 dark:border-emerald-700/50 rounded-2xl shadow-lg">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-emerald-500 text-white rounded-xl">
                                        <Calendar size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Umumiy Natija</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Jami {filteredEntries.length} ta yozuv</p>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-800 px-6 py-4 rounded-xl border border-emerald-200 dark:border-emerald-700/50 shadow-sm">
                                    <span className="text-xs text-slate-400 block uppercase font-black tracking-wider mb-1">Jami narx</span>
                                    <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{totalSum.toLocaleString()} so'm</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
