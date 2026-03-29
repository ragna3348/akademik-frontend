import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layouts/Layout';
import api from '@/utils/api';
import toast, { Toaster } from 'react-hot-toast';
import {
    ArrowLeft, UserCircle, GraduationCap, Wallet,
    BookOpen, Calendar, Users, MapPin, Phone, Mail,
    CheckCircle, XCircle, Clock, FileText
} from 'lucide-react';

const STATUS_STYLE = {
    AKTIF:   'bg-green-50 text-green-700 border-green-200',
    CUTI:    'bg-yellow-50 text-yellow-700 border-yellow-200',
    LULUS:   'bg-blue-50 text-blue-700 border-blue-200',
    DROPOUT: 'bg-red-50 text-red-700 border-red-200',
};

const STATUS_KRS_STYLE = {
    DRAFT:     'bg-slate-100 text-slate-600 border-slate-200',
    DIAJUKAN:  'bg-yellow-50 text-yellow-700 border-yellow-200',
    DISETUJUI: 'bg-green-50 text-green-700 border-green-200',
    DITOLAK:   'bg-red-50 text-red-700 border-red-200',
};

const TABS = [
    { key: 'profil',   label: 'Profil',    icon: UserCircle },
    { key: 'krs',      label: 'KRS',       icon: FileText },
    { key: 'keuangan', label: 'Keuangan',  icon: Wallet },
];

export default function DetailMahasiswaPage() {
    const router = useRouter();
    const { id } = router.query;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profil');

    useEffect(() => {
        if (!id) return;
        api.get(`/akademik/mahasiswa/${id}`)
            .then(r => setData(r.data.data))
            .catch(() => toast.error('Gagal ambil data!'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <Layout title="Detail Mahasiswa">
            <div className="flex items-center justify-center py-32">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        </Layout>
    );

    if (!data) return (
        <Layout title="Detail Mahasiswa">
            <div className="text-center py-20 text-slate-400">Data tidak ditemukan</div>
        </Layout>
    );

    const totalTagihan = data.keuangan?.reduce((s, k) => s + k.nominal, 0) || 0;
    const belumBayar = data.keuangan?.filter(k => k.status === 'belum_bayar') || [];
    const totalBelumBayar = belumBayar.reduce((s, k) => s + k.nominal, 0);

    return (
        <Layout title="Detail Mahasiswa">
            <Toaster position="top-right" />

            {/* Back */}
            <button onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4 text-sm transition">
                <ArrowLeft size={16} />
                Kembali
            </button>

            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-2xl p-6 text-white mb-5 relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-5">
                    <GraduationCap size={200} />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-5 mb-5">
                        <div className="w-18 h-18 w-16 h-16 rounded-2xl border-2 border-white/30 overflow-hidden bg-indigo-600 flex items-center justify-center flex-shrink-0">
                            {data.foto
                                ? <img src={`http://localhost:3000${data.foto}`} alt="Foto" className="w-full h-full object-cover" />
                                : <span className="text-3xl font-black text-white/80">{data.nama?.charAt(0)}</span>
                            }
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold text-white truncate">{data.nama}</h1>
                            <p className="text-indigo-300 font-mono text-sm mt-0.5">{data.nim}</p>
                            <p className="text-indigo-300 text-sm">{data.prodi?.nama} — {data.prodi?.jenjang}</p>
                            {data.prodi?.fakultas && <p className="text-indigo-400 text-xs mt-0.5">{data.prodi.fakultas.nama}</p>}
                        </div>
                        <span className={`text-xs px-3 py-1.5 rounded-full font-semibold flex-shrink-0 border ${STATUS_STYLE[data.status]}`}>
                            {data.status}
                        </span>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-4 gap-3 pt-4 border-t border-white/20">
                        {[
                            { label: 'Semester',      value: data.semester },
                            { label: 'Total KRS',     value: data.krs?.length || 0 },
                            { label: 'Total Tagihan', value: `Rp ${(totalTagihan/1000000).toFixed(1)}Jt` },
                            { label: 'Belum Bayar',   value: `Rp ${(totalBelumBayar/1000000).toFixed(1)}Jt` },
                        ].map(s => (
                            <div key={s.label} className="text-center">
                                <div className="text-lg font-bold text-white">{s.value}</div>
                                <div className="text-indigo-300 text-xs">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-5">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                                ${activeTab === tab.key
                                    ? 'bg-white text-indigo-700 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}>
                            <Icon size={15} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Profil */}
            {activeTab === 'profil' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-200 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <UserCircle size={16} className="text-indigo-600" />
                            <h2 className="font-semibold text-slate-700">Data Pribadi</h2>
                        </div>
                        <div className="space-y-3">
                            {[
                                { icon: BookOpen, label: 'NIM',       value: data.nim },
                                { icon: UserCircle, label: 'Nama',    value: data.nama },
                                { icon: Mail,      label: 'Email',    value: data.email || '-' },
                                { icon: Phone,     label: 'Telepon',  value: data.telepon || '-' },
                                { icon: MapPin,    label: 'Alamat',   value: data.alamat || '-' },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="flex items-start gap-3 text-sm">
                                    <Icon size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-slate-500 w-20 flex-shrink-0">{label}</span>
                                    <span className="font-medium text-slate-700 flex-1">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <GraduationCap size={16} className="text-indigo-600" />
                            <h2 className="font-semibold text-slate-700">Data Akademik</h2>
                        </div>
                        <div className="space-y-3">
                            {[
                                { icon: GraduationCap, label: 'Program Studi', value: data.prodi?.nama },
                                { icon: BookOpen,      label: 'Jenjang',       value: data.prodi?.jenjang },
                                { icon: Users,         label: 'Jenis Mahasiswa',   value: data.jenisMhs?.nama || '-' },
                                { icon: Calendar,      label: 'Semester',      value: `Semester ${data.semester}` },
                                { icon: Calendar,      label: 'Angkatan',      value: data.tahunAngkatan },
                                { icon: CheckCircle,   label: 'Status',        value: data.status },
                                { icon: UserCircle,    label: 'Dosen Wali',    value: data.dosenWali?.nama || 'Belum ditentukan' },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="flex items-start gap-3 text-sm">
                                    <Icon size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-slate-500 w-24 flex-shrink-0">{label}</span>
                                    <span className="font-medium text-slate-700 flex-1">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Tab KRS */}
            {activeTab === 'krs' && (
                <div className="space-y-4">
                    {!data.krs?.length ? (
                        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
                            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <FileText size={28} className="text-slate-400" />
                            </div>
                            <div className="text-slate-500 font-medium">Belum ada KRS</div>
                        </div>
                    ) : data.krs.map(k => (
                        <div key={k.id} className="bg-white border border-slate-200 rounded-2xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="font-semibold text-slate-800">{k.periode?.nama}</div>
                                    <div className="text-xs text-slate-400 mt-0.5">TA {k.periode?.tahunAjaran}</div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${STATUS_KRS_STYLE[k.status]}`}>
                                        {k.status}
                                    </span>
                                    <div className="text-sm font-bold text-indigo-600 mt-1">{k.totalSks} SKS</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {k.detailKRS?.map(d => (
                                    <div key={d.id} className="flex justify-between text-xs bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                                        <span className="text-slate-600">{d.mataKuliah?.nama}</span>
                                        <span className="font-semibold text-indigo-600">{d.mataKuliah?.sks} SKS</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tab Keuangan */}
            {activeTab === 'keuangan' && (
                <div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                            <div className="text-xl font-bold text-slate-800">
                                Rp {totalTagihan.toLocaleString('id-ID')}
                            </div>
                            <div className="text-slate-400 text-sm mt-0.5">Total Tagihan</div>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                            <div className="text-xl font-bold text-red-600">
                                Rp {totalBelumBayar.toLocaleString('id-ID')}
                            </div>
                            <div className="text-red-400 text-sm mt-0.5">Belum Dibayar ({belumBayar.length})</div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        {['Jenis', 'Nominal', 'Status', 'Tanggal'].map(h => (
                                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {!data.keuangan?.length ? (
                                        <tr><td colSpan={4} className="text-center py-8 text-slate-400">Belum ada tagihan</td></tr>
                                    ) : data.keuangan.map(k => (
                                        <tr key={k.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-slate-700 text-sm">{k.jenis}</td>
                                            <td className="px-4 py-3 font-semibold text-slate-700 text-sm">
                                                Rp {k.nominal.toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${k.status === 'sudah_bayar' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                    {k.status === 'sudah_bayar'
                                                        ? <><CheckCircle size={11} /> Lunas</>
                                                        : <><Clock size={11} /> Belum Bayar</>
                                                    }
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-500">
                                                {new Date(k.tanggal).toLocaleDateString('id-ID')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile */}
                        <div className="md:hidden divide-y divide-slate-100">
                            {data.keuangan?.map(k => (
                                <div key={k.id} className="p-4 flex items-center justify-between gap-3">
                                    <div>
                                        <div className="font-medium text-slate-700 text-sm">{k.jenis}</div>
                                        <div className="text-xs text-slate-400 mt-0.5">{new Date(k.tanggal).toLocaleDateString('id-ID')}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-slate-700 text-sm">Rp {k.nominal.toLocaleString('id-ID')}</div>
                                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-1 border ${k.status === 'sudah_bayar' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                            {k.status === 'sudah_bayar' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                            {k.status === 'sudah_bayar' ? 'Lunas' : 'Belum'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}