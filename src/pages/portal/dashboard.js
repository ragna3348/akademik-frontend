import { useState, useEffect } from 'react';
import PortalLayout from '@/components/layouts/PortalLayout';
import api from '@/utils/api';
import {
    BookOpen, GraduationCap, Wallet, BadgeCheck,
    UserCircle, ClipboardList, AlertTriangle, ArrowRight,
    CalendarDays, Hash
} from 'lucide-react';

const STATUS_COLOR = {
    DISETUJUI: 'bg-green-100 text-green-700 border-green-200',
    DIAJUKAN: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    DITOLAK: 'bg-red-100 text-red-700 border-red-200',
    DRAFT: 'bg-slate-100 text-slate-600 border-slate-200',
};

const STATUS_MHS_COLOR = {
    AKTIF: 'bg-green-100 text-green-700',
    CUTI: 'bg-yellow-100 text-yellow-700',
    LULUS: 'bg-indigo-100 text-indigo-700',
    DROPOUT: 'bg-red-100 text-red-700',
};

export default function PortalDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/portal/dashboard')
            .then(r => setData(r.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <PortalLayout title="Dashboard">
            <div className="flex items-center justify-center py-32">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                    <div className="text-slate-400 text-sm">Memuat dashboard...</div>
                </div>
            </div>
        </PortalLayout>
    );

    const mhs = data?.mahasiswa;

    return (
        <PortalLayout title="Dashboard">

            {/* Alert Tagihan */}
            {data?.tagihanBelumBayar > 0 && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
                    <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-red-700">Tagihan Belum Dibayar</p>
                        <p className="text-sm text-red-600 mt-0.5">
                            Anda memiliki <strong>{data.tagihanBelumBayar} tagihan</strong> dengan total{' '}
                            <strong>Rp {data.totalTagihan?.toLocaleString('id-ID')}</strong> yang belum dibayar.
                        </p>
                    </div>
                    <a href="/portal/keuangan"
                        className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 whitespace-nowrap">
                        Bayar <ArrowRight size={12} />
                    </a>
                </div>
            )}

            {/* Kartu Mahasiswa */}
            <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-2xl p-6 text-white mb-5 relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-5">
                    <GraduationCap size={180} />
                </div>
                <div className="relative z-10 flex items-center gap-5">
                    {/* Avatar */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-white/30 overflow-hidden bg-indigo-600 flex items-center justify-center flex-shrink-0">
                        {mhs?.foto
                            ? <img src={`http://localhost:3000${mhs.foto}`} alt="Foto" className="w-full h-full object-cover" />
                            : <UserCircle size={36} className="text-white/60" />
                        }
                    </div>
                    <div className="min-w-0">
                        <div className="text-xl sm:text-2xl font-bold text-white truncate">{mhs?.nama}</div>
                        <div className="text-indigo-300 text-sm mt-1 flex items-center gap-1.5">
                            <Hash size={12} />
                            {mhs?.nim}
                        </div>
                        <div className="text-indigo-300 text-sm truncate">{mhs?.prodi?.nama} — {mhs?.prodi?.jenjang}</div>
                        {mhs?.prodi?.fakultas && (
                            <div className="text-indigo-400 text-xs mt-0.5 truncate">{mhs.prodi.fakultas.nama}</div>
                        )}
                        <span className={`inline-block mt-2 text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_MHS_COLOR[mhs?.status] || 'bg-white/20 text-white'}`}>
                            {mhs?.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                    { label: 'Semester', value: `Semester ${mhs?.semester}`, icon: BookOpen, iconColor: 'text-indigo-600', iconBg: 'bg-indigo-50' },
                    { label: 'Tahun Angkatan', value: mhs?.tahunAngkatan, icon: CalendarDays, iconColor: 'text-blue-600', iconBg: 'bg-blue-50' },
                    { label: 'Tagihan Aktif', value: data?.tagihanBelumBayar ?? 0, icon: Wallet, iconColor: data?.tagihanBelumBayar > 0 ? 'text-red-500' : 'text-green-600', iconBg: data?.tagihanBelumBayar > 0 ? 'bg-red-50' : 'bg-green-50' },
                    { label: 'Status', value: mhs?.status, icon: BadgeCheck, iconColor: 'text-green-600', iconBg: 'bg-green-50' },
                ].map(c => {
                    const Icon = c.icon;
                    return (
                        <div key={c.label} className="bg-white border border-slate-200 rounded-xl p-4">
                            <div className={`w-8 h-8 ${c.iconBg} rounded-lg flex items-center justify-center mb-3`}>
                                <Icon size={16} className={c.iconColor} />
                            </div>
                            <div className="text-lg font-bold text-slate-800 leading-tight">{c.value}</div>
                            <div className="text-slate-400 text-xs mt-0.5">{c.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Info Akademik + KRS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Info Akademik */}
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center">
                            <GraduationCap size={15} className="text-indigo-600" />
                        </div>
                        <h2 className="font-semibold text-slate-700 text-sm">Informasi Akademik</h2>
                    </div>
                    <div className="space-y-2.5">
                        {[
                            { label: 'NIM', value: mhs?.nim },
                            { label: 'Program Studi', value: mhs?.prodi?.nama },
                            { label: 'Jenjang', value: mhs?.prodi?.jenjang },
                            { label: 'Jenis Mahasiswa', value: mhs?.jenisMhs?.nama || '-' },
                            { label: 'Dosen Wali', value: mhs?.dosenWali?.nama || 'Belum ditentukan' },
                            { label: 'Email', value: mhs?.email },
                            { label: 'Telepon', value: mhs?.telepon || '-' },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex justify-between items-start text-sm py-1.5 border-b border-slate-50 last:border-0">
                                <span className="text-slate-400 flex-shrink-0 w-32">{label}</span>
                                <span className="font-medium text-slate-700 text-right break-all">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* KRS Terakhir */}
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center">
                                <ClipboardList size={15} className="text-indigo-600" />
                            </div>
                            <h2 className="font-semibold text-slate-700 text-sm">KRS Terakhir</h2>
                        </div>
                        <a href="/portal/krs"
                            className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1">
                            Lihat KRS <ArrowRight size={12} />
                        </a>
                    </div>

                    {data?.krsAktif ? (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="text-xs text-slate-400">Periode</div>
                                    <div className="text-sm font-semibold text-slate-700 mt-0.5">
                                        {data.krsAktif.periode?.nama}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${STATUS_COLOR[data.krsAktif.status] || 'bg-slate-100 text-slate-600'}`}>
                                        {data.krsAktif.status}
                                    </span>
                                    <div className="text-xs text-slate-400 mt-1.5">
                                        <span className="font-bold text-indigo-600">{data.krsAktif.totalSks}</span> SKS
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                {data.krsAktif.detailKRS?.slice(0, 5).map(d => (
                                    <div key={d.id} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                                        <span className="text-xs text-slate-600 truncate pr-2">{d.mataKuliah?.nama}</span>
                                        <span className="text-xs font-semibold text-indigo-600 flex-shrink-0">{d.mataKuliah?.sks} SKS</span>
                                    </div>
                                ))}
                                {data.krsAktif.detailKRS?.length > 5 && (
                                    <a href="/portal/krs"
                                        className="flex items-center justify-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 py-2">
                                        +{data.krsAktif.detailKRS.length - 5} mata kuliah lainnya <ArrowRight size={11} />
                                    </a>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-300">
                            <ClipboardList size={36} className="mb-2" />
                            <div className="text-sm">Belum ada KRS</div>
                            <a href="/portal/krs"
                                className="mt-3 text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1">
                                Isi KRS Sekarang <ArrowRight size={11} />
                            </a>
                        </div>
                    )}
                </div>
            </div>

        </PortalLayout>
    );
}