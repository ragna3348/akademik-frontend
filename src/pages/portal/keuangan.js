import { useState, useEffect } from 'react';
import PortalLayout from '@/components/layouts/PortalLayout';
import api from '@/utils/api';
import { Wallet, CheckCircle, Clock, AlertTriangle, Receipt, Info } from 'lucide-react';

export default function PortalKeuangan() {
    const [tagihan, setTagihan] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/portal/keuangan')
            .then(r => setTagihan(r.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const belumBayar = tagihan.filter(t => t.status === 'belum_bayar');
    const sudahBayar = tagihan.filter(t => t.status === 'sudah_bayar');
    const totalBelumBayar = belumBayar.reduce((s, t) => s + t.nominal, 0);
    const totalSudahBayar = sudahBayar.reduce((s, t) => s + t.nominal, 0);

    if (loading) return (
        <PortalLayout title="Keuangan">
            <div className="flex items-center justify-center py-32">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                    <div className="text-slate-400 text-sm">Memuat data keuangan...</div>
                </div>
            </div>
        </PortalLayout>
    );

    return (
        <PortalLayout title="Keuangan">

            {/* Alert Tagihan Belum Bayar */}
            {belumBayar.length > 0 && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
                    <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-red-700">Terdapat Tagihan Belum Dibayar</p>
                        <p className="text-sm text-red-600 mt-0.5">
                            Segera lakukan pembayaran ke bagian keuangan kampus dan konfirmasi dengan menunjukkan NIM Anda.
                        </p>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center mb-3">
                        <Receipt size={17} className="text-indigo-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800">{tagihan.length}</div>
                    <div className="text-slate-400 text-sm mt-0.5">Total Tagihan</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center mb-3">
                        <CheckCircle size={17} className="text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">{sudahBayar.length}</div>
                    <div className="text-slate-400 text-sm mt-0.5">Lunas</div>
                    {sudahBayar.length > 0 && (
                        <div className="text-xs text-green-500 mt-1 font-medium">
                            Rp {totalSudahBayar.toLocaleString('id-ID')}
                        </div>
                    )}
                </div>

                <div className={`border rounded-xl p-5 ${belumBayar.length > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${belumBayar.length > 0 ? 'bg-red-100' : 'bg-slate-50'}`}>
                        <Clock size={17} className={belumBayar.length > 0 ? 'text-red-500' : 'text-slate-400'} />
                    </div>
                    <div className={`text-2xl font-bold ${belumBayar.length > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                        {belumBayar.length}
                    </div>
                    <div className="text-slate-400 text-sm mt-0.5">Belum Dibayar</div>
                    {belumBayar.length > 0 && (
                        <div className="text-xs text-red-500 mt-1 font-semibold">
                            Rp {totalBelumBayar.toLocaleString('id-ID')}
                        </div>
                    )}
                </div>
            </div>

            {/* Info Cara Pembayaran */}
            {belumBayar.length > 0 && (
                <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
                    <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-700">
                        Silakan lakukan pembayaran langsung ke bagian keuangan kampus dan konfirmasi dengan menunjukkan <strong>NIM</strong> Anda.
                    </p>
                </div>
            )}

            {/* Tabel Tagihan */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                    <Wallet size={16} className="text-slate-500" />
                    <h2 className="font-semibold text-slate-700 text-sm">Riwayat Tagihan</h2>
                </div>

                {tagihan.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                        <Receipt size={40} className="mb-3" />
                        <div className="text-sm font-medium">Belum ada tagihan</div>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        {['Jenis Tagihan', 'Nominal', 'Status', 'Tanggal'].map(h => (
                                            <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {tagihan.map(t => (
                                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-5 py-4 font-medium text-slate-700">{t.jenis}</td>
                                            <td className="px-5 py-4 font-semibold text-slate-800">
                                                Rp {t.nominal.toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-5 py-4">
                                                {t.status === 'sudah_bayar' ? (
                                                    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold bg-green-100 text-green-700 border border-green-200">
                                                        <CheckCircle size={11} />
                                                        Lunas
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold bg-red-100 text-red-700 border border-red-200">
                                                        <Clock size={11} />
                                                        Belum Bayar
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-400">
                                                {new Date(t.tanggal).toLocaleDateString('id-ID', {
                                                    day: 'numeric', month: 'long', year: 'numeric'
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="sm:hidden divide-y divide-slate-100">
                            {tagihan.map(t => (
                                <div key={t.id} className="p-4 flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="font-medium text-slate-700 text-sm truncate">{t.jenis}</div>
                                        <div className="text-xs text-slate-400 mt-0.5">
                                            {new Date(t.tanggal).toLocaleDateString('id-ID', {
                                                day: 'numeric', month: 'short', year: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <div className="font-bold text-slate-800 text-sm">
                                            Rp {t.nominal.toLocaleString('id-ID')}
                                        </div>
                                        <div className="mt-1">
                                            {t.status === 'sudah_bayar' ? (
                                                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                                                    <CheckCircle size={10} /> Lunas
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                                                    <Clock size={10} /> Belum Bayar
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

        </PortalLayout>
    );
}