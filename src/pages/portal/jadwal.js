import { useState, useEffect } from 'react';
import PortalLayout from '@/components/layouts/PortalLayout';
import api from '@/utils/api';
import { CalendarDays, Clock, User, MapPin, BookOpen } from 'lucide-react';

const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const HARI_COLOR = [
    'bg-indigo-500',
    'bg-blue-500',
    'bg-cyan-500',
    'bg-violet-500',
    'bg-emerald-500',
    'bg-orange-500',
];

const CARD_COLOR = [
    'border-l-indigo-400',
    'border-l-blue-400',
    'border-l-cyan-400',
    'border-l-violet-400',
    'border-l-emerald-400',
    'border-l-orange-400',
];

export default function PortalJadwal() {
    const [jadwal, setJadwal] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeHari, setActiveHari] = useState(null);

    useEffect(() => {
        api.get('/portal/jadwal')
            .then(r => {
                const data = r.data.data;
                setJadwal(data);
                // Set tab aktif ke hari ini otomatis
                const hariIni = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][new Date().getDay()];
                const adaHariIni = data.some(j => j.hari === hariIni);
                setActiveHari(adaHariIni ? hariIni : null);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const jadwalPerHari = HARI.map((hari, i) => ({
        hari,
        colorHeader: HARI_COLOR[i],
        colorCard: CARD_COLOR[i],
        jadwal: jadwal.filter(j => j.hari === hari)
    })).filter(h => h.jadwal.length > 0);

    const hariList = jadwalPerHari.map(h => h.hari);
    const selectedHari = activeHari && hariList.includes(activeHari) ? activeHari : hariList[0];
    const selectedData = jadwalPerHari.find(h => h.hari === selectedHari);

    if (loading) return (
        <PortalLayout title="Jadwal Kuliah">
            <div className="flex items-center justify-center py-32">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                    <div className="text-slate-400 text-sm">Memuat jadwal...</div>
                </div>
            </div>
        </PortalLayout>
    );

    return (
        <PortalLayout title="Jadwal Kuliah">

            {jadwal.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <CalendarDays size={28} className="text-slate-400" />
                    </div>
                    <div className="text-slate-500 font-medium">Belum ada jadwal kuliah</div>
                    <div className="text-slate-400 text-sm mt-1">Jadwal akan muncul setelah KRS disetujui</div>
                </div>
            ) : (
                <div>
                    {/* Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                        {[
                            { label: 'Total Jadwal', value: jadwal.length, icon: CalendarDays, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                            { label: 'Hari Kuliah', value: jadwalPerHari.length, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
                            { label: 'Total SKS', value: jadwal.reduce((s, j) => s + (j.mataKuliah?.sks || 0), 0), icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
                            { label: 'Mata Kuliah', value: [...new Set(jadwal.map(j => j.mataKuliahId))].length, icon: BookOpen, color: 'text-cyan-600', bg: 'bg-cyan-50' },
                        ].map(c => {
                            const Icon = c.icon;
                            return (
                                <div key={c.label} className="bg-white border border-slate-200 rounded-xl p-4">
                                    <div className={`w-8 h-8 ${c.bg} rounded-lg flex items-center justify-center mb-3`}>
                                        <Icon size={15} className={c.color} />
                                    </div>
                                    <div className="text-xl font-bold text-slate-800">{c.value}</div>
                                    <div className="text-slate-400 text-xs mt-0.5">{c.label}</div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Tab Hari */}
                    <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
                        {jadwalPerHari.map((h, i) => (
                            <button
                                key={h.hari}
                                onClick={() => setActiveHari(h.hari)}
                                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150
                                    ${selectedHari === h.hari
                                        ? `${h.colorHeader} text-white shadow-sm`
                                        : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'
                                    }`}
                            >
                                {h.hari}
                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold
                                    ${selectedHari === h.hari ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    {h.jadwal.length}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Jadwal List */}
                    {selectedData && (
                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                            {/* Header Hari */}
                            <div className={`${selectedData.colorHeader} px-5 py-3 flex items-center gap-2`}>
                                <CalendarDays size={16} className="text-white" />
                                <span className="text-white font-semibold text-sm">{selectedData.hari}</span>
                                <span className="text-white/70 text-xs ml-auto">{selectedData.jadwal.length} jadwal</span>
                            </div>

                            {/* Items */}
                            <div className="divide-y divide-slate-100">
                                {selectedData.jadwal
                                    .sort((a, b) => a.jamMulai?.localeCompare(b.jamMulai))
                                    .map((j, i) => (
                                        <div key={j.id} className={`flex gap-4 p-5 border-l-4 ${selectedData.colorCard} hover:bg-slate-50 transition-colors`}>
                                            {/* Waktu */}
                                            <div className="flex-shrink-0 text-center min-w-[70px]">
                                                <div className="flex items-center gap-1 justify-center text-slate-500">
                                                    <Clock size={12} />
                                                    <span className="text-xs">Waktu</span>
                                                </div>
                                                <div className="font-bold text-slate-800 text-sm mt-1">{j.jamMulai}</div>
                                                <div className="text-xs text-slate-400 my-0.5">—</div>
                                                <div className="font-bold text-slate-800 text-sm">{j.jamSelesai}</div>
                                            </div>

                                            {/* Divider */}
                                            <div className="w-px bg-slate-100 flex-shrink-0" />

                                            {/* Info MK */}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-slate-800 truncate">{j.mataKuliah?.nama}</div>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                                                    {j.dosen?.nama && (
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                            <User size={12} className="flex-shrink-0" />
                                                            <span className="truncate">{j.dosen.nama}</span>
                                                        </div>
                                                    )}
                                                    {j.ruangan && (
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                            <MapPin size={12} className="flex-shrink-0" />
                                                            <span>{j.ruangan}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* SKS Badge */}
                                            <div className="flex-shrink-0 self-center">
                                                <div className="bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold px-3 py-1.5 rounded-xl text-center">
                                                    {j.mataKuliah?.sks}<br />
                                                    <span className="font-normal text-indigo-400">SKS</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </PortalLayout>
    );
}