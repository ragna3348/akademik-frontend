import { useState, useEffect } from 'react';
import Layout from '@/components/layouts/Layout';
import api from '@/utils/api';
import toast, { Toaster } from 'react-hot-toast';
import {
    Calendar, BookOpen, Users, Clock,
    GraduationCap, MapPin, User, ChevronRight
} from 'lucide-react';

export default function DosenDashboard() {
    const [user, setUser] = useState(null);
    const [jadwal, setJadwal] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const u = JSON.parse(localStorage.getItem('user') || '{}');
            setUser(u);
        } catch {}
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('/jadwal');
            setJadwal(res.data.data || []);
        } catch { toast.error('Gagal ambil data!'); }
        finally { setLoading(false); }
    };

    const HARI_LIST = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const HARI_COLORS = [
        'bg-indigo-50 border-indigo-200 text-indigo-700',
        'bg-blue-50 border-blue-200 text-blue-700',
        'bg-violet-50 border-violet-200 text-violet-700',
        'bg-emerald-50 border-emerald-200 text-emerald-700',
        'bg-amber-50 border-amber-200 text-amber-700',
        'bg-rose-50 border-rose-200 text-rose-700',
    ];

    const jadwalHariIni = jadwal.filter(j => {
        const hari = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
        return j.hari === hari[new Date().getDay()];
    });

    const totalMK = [...new Set(jadwal.map(j => j.mataKuliahId))].length;
    const totalJadwal = jadwal.length;

    const stats = [
        { icon: BookOpen, label: 'Mata Kuliah', value: totalMK, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
        { icon: Calendar, label: 'Total Jadwal', value: totalJadwal, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
        { icon: Clock, label: 'Hari Ini', value: jadwalHariIni.length, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    ];

    return (
        <Layout title="Dashboard Dosen">
            <Toaster position="top-right" />

            {/* Greeting */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-6 mb-5 text-white">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0">
                        {user?.nama?.charAt(0) || 'D'}
                    </div>
                    <div>
                        <p className="text-white/70 text-sm">Selamat datang,</p>
                        <h2 className="text-xl font-bold">{user?.nama || 'Dosen'}</h2>
                        <p className="text-white/60 text-xs mt-0.5 flex items-center gap-1">
                            <User size={11} /> {user?.email}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
                {stats.map(s => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
                            <div className={`w-9 h-9 ${s.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                                <Icon size={16} className={s.iconColor} />
                            </div>
                            <div className="text-2xl font-bold text-slate-700">{loading ? '-' : s.value}</div>
                            <div className="text-slate-400 text-sm mt-0.5">{s.label}</div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Jadwal Hari Ini */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                                <Clock size={15} className="text-emerald-600" />
                            </div>
                            <h3 className="font-bold text-slate-700 text-sm">Jadwal Hari Ini</h3>
                        </div>
                        <span className="text-xs text-slate-400">
                            {['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'][new Date().getDay()]}
                        </span>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {loading ? (
                            <div className="py-10 flex justify-center">
                                <div className="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                            </div>
                        ) : jadwalHariIni.length === 0 ? (
                            <div className="py-10 text-center text-slate-400 text-sm">
                                Tidak ada jadwal hari ini
                            </div>
                        ) : jadwalHariIni.map(j => (
                            <div key={j.id} className="px-5 py-3.5 flex items-center gap-3">
                                <div className="text-center min-w-[60px]">
                                    <div className="text-xs font-bold text-slate-700">{j.jamMulai}</div>
                                    <div className="text-xs text-slate-300">—</div>
                                    <div className="text-xs font-bold text-slate-700">{j.jamSelesai}</div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-slate-700 text-sm truncate">{j.mataKuliah?.nama}</div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-slate-400">{j.mataKuliah?.kode}</span>
                                        {j.ruangan && (
                                            <span className="flex items-center gap-0.5 text-xs text-slate-400">
                                                <MapPin size={10} /> {j.ruangan}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                                    {j.mataKuliah?.sks} SKS
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Semua Jadwal per Hari */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                            <Calendar size={15} className="text-indigo-600" />
                        </div>
                        <h3 className="font-bold text-slate-700 text-sm">Jadwal Mengajar</h3>
                    </div>
                    <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                        {loading ? (
                            <div className="py-10 flex justify-center">
                                <div className="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                            </div>
                        ) : jadwal.length === 0 ? (
                            <div className="py-10 text-center text-slate-400 text-sm">
                                Belum ada jadwal
                            </div>
                        ) : HARI_LIST.filter(h => jadwal.some(j => j.hari === h)).map((hari, i) => (
                            <div key={hari}>
                                <div className={`px-5 py-2 flex items-center gap-2`}>
                                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${HARI_COLORS[i % HARI_COLORS.length]}`}>
                                        {hari}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        {jadwal.filter(j => j.hari === hari).length} jadwal
                                    </span>
                                </div>
                                {jadwal.filter(j => j.hari === hari).map(j => (
                                    <div key={j.id} className="px-5 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                                        <div className="text-xs font-mono text-slate-500 min-w-[90px]">
                                            {j.jamMulai} – {j.jamSelesai}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm text-slate-700 font-medium truncate">{j.mataKuliah?.nama}</div>
                                            {j.ruangan && (
                                                <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                                                    <MapPin size={10} /> {j.ruangan}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-slate-400">
                                            <GraduationCap size={11} />
                                            <span className="hidden sm:inline">{j.mataKuliah?.prodi?.nama}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
}