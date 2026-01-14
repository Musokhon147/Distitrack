import React, { useState } from 'react';
import { Entry } from '@distitrack/common';
import { History, Search, Filter, Calendar, Trash2, Edit3, Download, X, Check, ShoppingBag, Package, Hash, CreditCard } from 'lucide-react';
import { useEntries } from '../../../hooks/useEntries';
import { CustomSelect } from '../../../components/ui/CustomSelect';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useConfetti } from '../../../hooks/useConfetti';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { PageTransition } from '../../../components/layout/PageTransition';

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24
        }
    }
} as const;

// --- Helper Component: SwipeableRecord ---
interface SwipeableRecordProps {
    children: React.ReactNode;
    entry: Entry;
    onEdit: () => void;
    onDelete: () => void;
}

const SwipeableRecord: React.FC<SwipeableRecordProps> = ({ children, entry, onEdit, onDelete }) => {
    const controls = useAnimation();

    // On mobile, drags reveal actions. limit drag to X axis.
    const handleDragEnd = async (event: any, info: PanInfo) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;

        if (entry.tolovHolati === "kutilmoqda") {
            if (offset < -100 || velocity < -500) {
                // Allow Swiped Left -> Delete Intent even for pending
                await controls.start({ x: -80 });
            } else {
                await controls.start({ x: 0 });
            }
            return;
        }

        if (entry.tolovHolati === "to\'langan") {
            if (offset < -100 || velocity < -500) {
                // Allow Swiped Left -> Delete Intent
                await controls.start({ x: -80 });
            } else {
                await controls.start({ x: 0 });
            }
            return;
        }

        if (offset < -100 || velocity < -500) {
            // Swiped Left -> Delete Intent
            await controls.start({ x: -80 }); // sticky open
        } else if (offset > 100 || velocity > 500) {
            // Swiped Right -> Edit
            await controls.start({ x: 0 });
            onEdit(); // Auto trigger edit
        } else {
            await controls.start({ x: 0 });
        }
    };

    return (
        <div className="relative group touch-pan-y">
            {/* Background Actions (Revealed on Swipe) */}
            <div className="absolute inset-0 flex rounded-2xl overflow-hidden pointer-events-none">
                {entry.tolovHolati === "to'lanmagan" && (
                    <div className="w-1/2 bg-primary-500/10 flex items-center justify-start pl-6">
                        <Edit3 className="text-primary-600" />
                    </div>
                )}
                <div className={`${entry.tolovHolati === "to'lanmagan" ? 'w-1/2' : 'w-full'} bg-red-500/10 flex items-center justify-end pr-6`}>
                    <Trash2 className="text-red-500" />
                </div>
            </div>

            {/* Foreground Content */}
            <motion.div
                drag="x"
                dragConstraints={entry.tolovHolati === "to'lanmagan" ? { left: -100, right: 0 } : { left: -80, right: 0 }}
                animate={controls}
                onDragEnd={handleDragEnd}
                className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm hover:shadow-md transition-all relative z-10"
                style={{ touchAction: 'pan-y' }}
            >
                {children}
            </motion.div>
        </div>
    );
};

// --- Main Component: Records ---
export const Records: React.FC = () => {
    const { entries, updateEntry, deleteEntry, loading } = useEntries();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('Barchasi');
    const [showFilters, setShowFilters] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Entry>>({});
    const { triggerConfetti } = useConfetti();

    const formatNumber = (val: string | number) => {
        if (!val) return '';
        const num = typeof val === 'string' ? val.replace(/\D/g, '') : val.toString();
        return new Intl.NumberFormat('en-US').format(parseFloat(num) || 0);
    };

    const unformatNumber = (val: string) => {
        if (typeof val !== 'string') return '';
        return val.replace(/,/g, '');
    };

    const filteredEntries = entries.filter(entry => {
        const matchesSearch = entry.marketNomi.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.mahsulotTuri.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'Barchasi' || entry.tolovHolati === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleEditStart = (entry: Entry) => {
        setEditingId(entry.id);
        setEditForm(entry);
    };

    const handleEditSave = () => {
        if (editingId) {
            updateEntry(editingId, editForm);

            // Trigger confetti if status changes to 'to\'langan'
            if (editForm.tolovHolati === "to'langan") {
                triggerConfetti();
            }

            setEditingId(null);
        }
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("Bo'zor Daftari - Yozuvlar Tarixi", 14, 15);
        autoTable(doc, {
            startY: 20,
            head: [['Market Nomi', 'Raqam', 'Mahsulot', 'Miqdor', 'Narx', 'Holat']],
            body: filteredEntries.map(e => [e.marketNomi, e.marketRaqami, e.mahsulotTuri, e.miqdori, e.narx, e.tolovHolati]),
            styles: { font: 'helvetica', fontSize: 10 },
        });
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        doc.save(`bozor_daftari_${dateStr}.pdf`);
    };

    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(filteredEntries.map(e => ({
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
        <PageTransition>
            <div className="max-w-7xl mx-auto p-4 md:p-8 bg-white dark:bg-slate-900 shadow-xl rounded-2xl mt-6 transition-colors duration-200 min-h-[80vh]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                            <History className="text-primary-600" size={32} />
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
                                placeholder="Do'kon nomi yoki mahsulot turi bo'yicha qidirish..."
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none dark:text-white shadow-sm transition-all placeholder:text-slate-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setShowFilters(true)}
                                className={`w-full p-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm border ${statusFilter !== 'Barchasi'
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-700 hover:bg-slate-50'
                                    }`}
                            >
                                <Filter size={18} />
                                {statusFilter === 'Barchasi' ? 'Filtrlar' : statusFilter}
                            </button>

                            {/* Desktop Dropdown */}
                            {showFilters && (
                                <div className="hidden md:block absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="flex justify-between items-center px-3 py-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">To'lov holati</p>
                                        <button onClick={() => setShowFilters(false)} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
                                    </div>
                                    {['Barchasi', 'to\'langan', 'to\'lanmagan'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => {
                                                setStatusFilter(status);
                                                setShowFilters(false);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${statusFilter === status
                                                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                                }`}
                                        >
                                            <span className="capitalize">{status}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Mobile Bottom Sheet */}
                            <BottomSheet
                                isOpen={showFilters}
                                onClose={() => setShowFilters(false)}
                                title="Filtrlar"
                            >
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 mb-2">To'lov holati bo'yicha</p>
                                    {['Barchasi', 'to\'langan', 'to\'lanmagan'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => {
                                                setStatusFilter(status);
                                                setShowFilters(false);
                                            }}
                                            className={`w-full text-left px-5 py-4 rounded-xl text-base font-bold transition-colors flex justify-between items-center ${statusFilter === status
                                                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                                                : 'text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50'
                                                }`}
                                        >
                                            <span className="capitalize">{status}</span>
                                            {statusFilter === status && <Check size={18} />}
                                        </button>
                                    ))}
                                </div>
                            </BottomSheet>
                        </div>
                    </div>
                </div>

                {/* Records List */}
                <motion.div
                    className="space-y-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {loading ? (
                        // Skeleton Loading State
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                <div className="flex flex-col lg:flex-row gap-6">
                                    <div className="flex items-center gap-4 w-full lg:w-auto">
                                        <Skeleton className="w-12 h-12 rounded-xl" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-5 w-32" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
                                        <Skeleton className="h-14 rounded-xl" />
                                        <Skeleton className="h-14 rounded-xl" />
                                        <Skeleton className="h-14 rounded-xl" />
                                        <Skeleton className="h-14 rounded-xl" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : filteredEntries.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-20 text-center bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center mb-6 mx-auto shadow-lg"
                            >
                                <Search size={32} className="text-slate-400 dark:text-slate-500" />
                            </motion.div>
                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Yozuvlar topilmadi
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                                {searchTerm || statusFilter !== 'Barchasi'
                                    ? 'Qidiruv yoki filtrlash natijalariga mos yozuvlar topilmadi'
                                    : 'Hozircha yozuvlar mavjud emas'}
                            </p>
                        </motion.div>
                    ) : (
                        <>
                            {filteredEntries.map(entry => (
                                <motion.div key={entry.id} variants={itemVariants}>
                                    <SwipeableRecord
                                        entry={entry}
                                        onEdit={() => handleEditStart(entry)}
                                        onDelete={() => deleteEntry(entry.id)}
                                    >
                                        {editingId === entry.id ? (
                                            <div className="w-full space-y-4 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-primary-100 dark:border-primary-900/30">
                                                <div className="flex items-center gap-3 mb-2 px-1">
                                                    <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                                                        <Edit3 size={16} />
                                                    </div>
                                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Tahrirlash</h3>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Market</label>
                                                        <div className="relative">
                                                            <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                            <input
                                                                disabled
                                                                className="w-full pl-11 pr-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-slate-500 dark:text-slate-400 opacity-70 cursor-not-allowed"
                                                                value={editForm.marketNomi}
                                                                placeholder="Market nomini kiriting"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mahsulot</label>
                                                        <div className="relative">
                                                            <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                            <input
                                                                disabled
                                                                className="w-full pl-11 pr-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-slate-500 dark:text-slate-400 opacity-70 cursor-not-allowed"
                                                                value={editForm.mahsulotTuri}
                                                                placeholder="Mahsulot turi"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Telefon</label>
                                                        <div className="relative">
                                                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                            <input
                                                                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-slate-700 dark:text-slate-200"
                                                                value={editForm.marketRaqami}
                                                                onChange={(e) => setEditForm({ ...editForm, marketRaqami: e.target.value })}
                                                                placeholder="Telefon raqami"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Miqdori</label>
                                                        <input
                                                            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-slate-700 dark:text-slate-200"
                                                            value={editForm.miqdori}
                                                            onChange={(e) => setEditForm({ ...editForm, miqdori: e.target.value })}
                                                            placeholder="Miqdori"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Narxi</label>
                                                        <div className="relative">
                                                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500" size={16} />
                                                            <input
                                                                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold text-primary-600 dark:text-primary-400"
                                                                value={formatNumber(editForm.narx || '')}
                                                                onChange={(e) => setEditForm({ ...editForm, narx: unformatNumber(e.target.value) })}
                                                                placeholder="Narxi"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <CustomSelect
                                                            label="Holat"
                                                            value={editForm.tolovHolati || ''}
                                                            placeholder="Holatni tanlang"
                                                            onChange={(val) => {
                                                                const originalEntry = entries.find(e => e.id === editingId);
                                                                if (originalEntry?.tolovHolati === "to'langan" && val === "to'lanmagan") {
                                                                    alert("To'langan statusini o'zgartirib bo'lmaydi");
                                                                    return;
                                                                }
                                                                setEditForm({ ...editForm, tolovHolati: val as any });
                                                            }}
                                                            options={[
                                                                { id: '1', value: "to'langan", label: "To'langan" },
                                                                { id: '2', value: "to'lanmagan", label: "To'lanmagan" }
                                                            ]}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-3 pt-4">
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-500 font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all flex items-center gap-2"
                                                    >
                                                        <X size={18} /> Bekor qilish
                                                    </button>
                                                    <button
                                                        onClick={handleEditSave}
                                                        className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 hover:from-primary-600 hover:to-primary-700 transition-all flex items-center gap-2"
                                                    >
                                                        <Check size={18} /> Saqlash
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                                                <div className="flex items-center gap-4 w-full lg:w-auto">
                                                    <div className="p-3 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl group-hover:scale-110 transition-transform hidden sm:block">
                                                        <Calendar size={24} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">{entry.marketNomi}</h3>
                                                        <p className="text-sm text-slate-400 font-mono">{entry.marketRaqami}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
                                                    <div className="bg-slate-50 dark:bg-slate-700/50 px-3 sm:px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                                        <span className="text-[10px] text-slate-400 block uppercase font-black tracking-wider mb-1">Mahsulot</span>
                                                        <span className="font-bold text-sm sm:text-base text-slate-700 dark:text-slate-200 truncate block">{entry.mahsulotTuri}</span>
                                                    </div>
                                                    <div className="bg-slate-50 dark:bg-slate-700/50 px-3 sm:px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                                        <span className="text-[10px] text-slate-400 block uppercase font-black tracking-wider mb-1">Miqdori</span>
                                                        <span className="font-bold text-sm sm:text-base text-primary-600 dark:text-primary-400 truncate block">{entry.miqdori}</span>
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
                                                    {entry.tolovHolati === "to'lanmagan" && (
                                                        <button
                                                            onClick={() => handleEditStart(entry)}
                                                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                                        >
                                                            <Edit3 size={18} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => deleteEntry(entry.id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </SwipeableRecord>
                                </motion.div>
                            ))}
                        </>
                    )}
                </motion.div>
            </div>
        </PageTransition>
    );
};
