import { useState, useEffect } from 'react';
import Layout from '@/components/layouts/Layout';
import api from '@/utils/api';
import toast, { Toaster } from 'react-hot-toast';
import { Search, CheckCircle, Clock, CreditCard, User, Hash } from 'lucide-react';

export default function PembayaranMabaPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    const fetchData = async () => {
        try {
            const res = await api.get('/pamaba/pendaftar');
            setData(res.data.data);
        } catch {
            toast.error('Gagal ambil data!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleKonfirmasi = async (pembayaranId, nama) => {
        if (!confirm(`Konfirmasi pembayaran untuk ${nama}?`)) return;
        try {
            await api.patch(`/pamaba/pembayaran/${pembayaranId}/konfirmasi`);
            toast.success('Pembayaran berhasil dikonfirmasi!');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal konfirmasi!');
        }
    };

    const filtered = data.filter(d =>
        d.nama.toLowerCase().includes(filter.toLowerCase()) ||
        d.noPendaftaran.toLowerCase().includes(filter.toLowerCase())
    );

    const statusBadge = (status) => {
        const map = {
            LULUS: 'bg-green-50 text-green-600 border-green-200',
            BAYAR: 'bg-amber-50 text-amber-600 border-amber-200',
            GUGUR: 'bg-red-50 text-red-500 border-red-200',
        };
        return map[status] || 'bg-blue-50 text-blue-600 border-blue-200';
    };

    return (
        <Layout title="Pembayaran Pendaftar">
            <Toaster position="top-right" />

            {/* Filter */}
            <div className="flex items-center justify-between mb-5 gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Cari nama / no. pendaftaran..."
                        value={filter} onChange={e => setFilter(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
                </div>
                <p className="text-sm text-slate-400 whitespace-nowrap">{data.length} pendaftar</p>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <CreditCard size={24} className="text-slate-300" />
                    </div>
                    <div className="text-slate-500 font-medium">Belum ada data</div>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(item => (
                        <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-5">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <User size={17} className="text-indigo-500" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-700">{item.nama}</div>
                                        <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-mono mt-0.5">
                                            <Hash size={10} />{item.noPendaftaran}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-0.5">
                                            {item.prodi?.nama} · {item.gelombang?.nama}
                                        </div>
                                    </div>
                                </div>
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${statusBadge(item.status)}`}>
                                    {item.status}
                                </span>
                            </div>

                            {/* Tabel Tagihan */}
                            {item.pembayaran?.length > 0 && (
                                <div className="border border-slate-100 rounded-xl overflow-hidden">
                                    {/* Desktop */}
                                    <div className="hidden sm:block">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-100">
                                                    {['Jenis', 'Nominal', 'Status', 'Aksi'].map(h => (
                                                        <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {item.pembayaran.map(bayar => (
                                                    <tr key={bayar.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-4 py-3 text-slate-600">{bayar.jenis}</td>
                                                        <td className="px-4 py-3 font-medium text-slate-700">
                                                            Rp {Number(bayar.nominal).toLocaleString('id-ID')}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {bayar.status === 'SUDAH_BAYAR' ? (
                                                                <span className="inline-flex items-center gap-1.5 text-xs bg-green-50 text-green-600 border border-green-200 px-2.5 py-1 rounded-full font-medium">
                                                                    <CheckCircle size={10} /> Lunas
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1.5 text-xs bg-red-50 text-red-500 border border-red-200 px-2.5 py-1 rounded-full font-medium">
                                                                    <Clock size={10} /> Belum Bayar
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {bayar.status !== 'SUDAH_BAYAR' && (
                                                                <button onClick={() => handleKonfirmasi(bayar.id, item.nama)}
                                                                    className="flex items-center gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition">
                                                                    <CheckCircle size={11} /> Konfirmasi Lunas
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile */}
                                    <div className="sm:hidden divide-y divide-slate-100">
                                        {item.pembayaran.map(bayar => (
                                            <div key={bayar.id} className="p-3 flex items-center justify-between gap-3">
                                                <div>
                                                    <div className="text-sm text-slate-600">{bayar.jenis}</div>
                                                    <div className="font-medium text-slate-700 text-sm">
                                                        Rp {Number(bayar.nominal).toLocaleString('id-ID')}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {bayar.status === 'SUDAH_BAYAR' ? (
                                                        <span className="text-xs bg-green-50 text-green-600 border border-green-200 px-2 py-1 rounded-full">
                                                            Lunas
                                                        </span>
                                                    ) : (
                                                        <button onClick={() => handleKonfirmasi(bayar.id, item.nama)}
                                                            className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg">
                                                            Konfirmasi
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
}