import { useState, useEffect } from 'react';
import PortalLayout from '@/components/layouts/PortalLayout';
import api from '@/utils/api';
import toast, { Toaster } from 'react-hot-toast';
import {
    CalendarDays, ClipboardList, BookOpen, CheckCircle,
    XCircle, Clock, AlertTriangle, Plus, X, Check, Info
} from 'lucide-react';

const STATUS_CONFIG = {
    DRAFT:        { label: 'Draft',                color: 'bg-slate-100 text-slate-600 border-slate-200' },
    DIAJUKAN:     { label: 'Menunggu Persetujuan', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    DISETUJUI:    { label: 'Disetujui',            color: 'bg-green-100 text-green-700 border-green-200' },
    DITOLAK:      { label: 'Ditolak',              color: 'bg-red-100 text-red-700 border-red-200' },
    TERLAMBAT:    { label: 'Terlambat',            color: 'bg-orange-100 text-orange-700 border-orange-200' },
    PENGECUALIAN: { label: 'Pengecualian',         color: 'bg-purple-100 text-purple-700 border-purple-200' },
};

const STATUS_ICON = {
    DIAJUKAN:     <Clock size={13} />,
    DISETUJUI:    <CheckCircle size={13} />,
    DITOLAK:      <XCircle size={13} />,
    DRAFT:        <ClipboardList size={13} />,
    TERLAMBAT:    <AlertTriangle size={13} />,
    PENGECUALIAN: <Info size={13} />,
};

export default function PortalKRS() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedMK, setSelectedMK] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState('');

    const fetchData = () => {
        setLoading(true);
        api.get('/portal/krs')
            .then(r => setData(r.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, []);

    const toggleMK = (id) => {
        setSelectedMK(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const filteredMK = (data?.mataKuliah || []).filter(m =>
        m.nama?.toLowerCase().includes(search.toLowerCase()) ||
        m.kode?.toLowerCase().includes(search.toLowerCase())
    );

    const totalSks = (data?.mataKuliah || [])
        .filter(m => selectedMK.includes(m.id))
        .reduce((s, m) => s + m.sks, 0);

    const handleAjukan = async () => {
        if (selectedMK.length === 0) { toast.error('Pilih minimal 1 mata kuliah!'); return; }
        if (!data?.periodeAktif) { toast.error('Tidak ada periode KRS aktif!'); return; }
        setSubmitting(true);
        try {
            await api.post('/portal/krs', {
                periodeId: data.periodeAktif.id,
                mataKuliahIds: selectedMK
            });
            toast.success('KRS berhasil diajukan!');
            setShowForm(false);
            setSelectedMK([]);
            setSearch('');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal ajukan KRS!');
        } finally {
            setSubmitting(false);
        }
    };

    const sudahAjukan = data?.periodeAktif &&
        data?.krs?.some(k => k.periodeId === data.periodeAktif.id);

    if (loading) return (
        <PortalLayout title="KRS">
            <div className="flex items-center justify-center py-32">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                    <div className="text-slate-400 text-sm">Memuat data KRS...</div>
                </div>
            </div>
        </PortalLayout>
    );

    return (
        <PortalLayout title="Kartu Rencana Studi">
            <Toaster position="top-right" />

            {/* Periode Aktif / Tidak Ada Periode */}
            {data?.periodeAktif ? (
                <div className="flex items-center justify-between gap-4 bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-5">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <CalendarDays size={16} className="text-indigo-600" />
                        </div>
                        <div>
                            <div className="font-semibold text-indigo-800 text-sm">Periode KRS Aktif</div>
                            <div className="text-sm text-indigo-600 mt-0.5">{data.periodeAktif.nama} — TA {data.periodeAktif.tahunAjaran}</div>
                            <div className="text-xs text-indigo-400 mt-0.5">
                                {new Date(data.periodeAktif.tanggalBuka).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                {' '} s/d {' '}
                                {new Date(data.periodeAktif.tanggalTutup).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                        </div>
                    </div>
                    {!sudahAjukan && !showForm && (
                        <button onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex-shrink-0 transition">
                            <Plus size={15} />
                            Isi KRS
                        </button>
                    )}
                    {sudahAjukan && (
                        <span className="flex items-center gap-1.5 text-xs font-semibold bg-green-100 text-green-700 border border-green-200 px-3 py-1.5 rounded-xl flex-shrink-0">
                            <CheckCircle size={13} />
                            Sudah Diajukan
                        </span>
                    )}
                </div>
            ) : (
                <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-5">
                    <AlertTriangle size={16} className="text-yellow-500 flex-shrink-0" />
                    <p className="text-yellow-700 text-sm">Belum ada periode KRS yang aktif saat ini.</p>
                </div>
            )}

            {/* Form Isi KRS */}
            {showForm && data?.periodeAktif && (
                <div className="bg-white border border-slate-200 rounded-2xl mb-5 overflow-hidden">
                    {/* Header Form */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
                        <div>
                            <h3 className="font-semibold text-slate-700 text-sm">Pilih Mata Kuliah</h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Semester {data?.mahasiswa?.semester} — {data?.mataKuliah?.length} mata kuliah tersedia
                            </p>
                        </div>
                        <button onClick={() => { setShowForm(false); setSelectedMK([]); setSearch(''); }}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="p-5">
                        {/* Search */}
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Cari mata kuliah..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 mb-4 transition"
                        />

                        {filteredMK.length === 0 ? (
                            <div className="text-center py-10 text-slate-300">
                                <BookOpen size={32} className="mx-auto mb-2" />
                                <div className="text-sm">Tidak ada mata kuliah tersedia</div>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                                {filteredMK.map(mk => {
                                    const isSelected = selectedMK.includes(mk.id);
                                    return (
                                        <div key={mk.id}
                                            onClick={() => toggleMK(mk.id)}
                                            className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition-all duration-150
                                                ${isSelected
                                                    ? 'border-indigo-400 bg-indigo-50'
                                                    : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                                                }`}>
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors
                                                    ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                                                    {isSelected && <Check size={11} className="text-white" strokeWidth={3} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-slate-700 text-sm truncate">{mk.nama}</div>
                                                    <div className="text-xs text-slate-400">{mk.kode}</div>
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0 ml-3">
                                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
                                                    {mk.sks} SKS
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Footer Form */}
                        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                            <div className="text-sm text-slate-500">
                                <span className="font-semibold text-slate-700">{selectedMK.length}</span> MK dipilih
                                <span className="mx-2 text-slate-300">|</span>
                                Total <span className="font-bold text-indigo-600">{totalSks} SKS</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setShowForm(false); setSelectedMK([]); setSearch(''); }}
                                    className="border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm hover:bg-slate-50 transition">
                                    Batal
                                </button>
                                <button
                                    onClick={handleAjukan}
                                    disabled={submitting || selectedMK.length === 0}
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 transition">
                                    {submitting ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Mengajukan...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={14} />
                                            Ajukan KRS
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Riwayat KRS */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                    <ClipboardList size={16} className="text-slate-500" />
                    <h2 className="font-semibold text-slate-700 text-sm">Riwayat KRS</h2>
                </div>

                {data?.krs?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                        <ClipboardList size={40} className="mb-3" />
                        <div className="text-sm font-medium">Belum ada KRS</div>
                        <div className="text-xs mt-1">Ajukan KRS pada periode yang aktif</div>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {data?.krs?.map(k => {
                            const sc = STATUS_CONFIG[k.status] || STATUS_CONFIG.DRAFT;
                            const si = STATUS_ICON[k.status];
                            return (
                                <div key={k.id} className="p-5">
                                    {/* KRS Header */}
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div>
                                            <div className="font-semibold text-slate-800">{k.periode?.nama}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">
                                                TA {k.periode?.tahunAjaran}
                                                <span className="mx-1.5">•</span>
                                                <span className="font-semibold text-indigo-600">{k.totalSks} SKS</span>
                                                <span className="mx-1.5">•</span>
                                                {k.detailKRS?.length} Mata Kuliah
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold border flex-shrink-0 ${sc.color}`}>
                                            {si}
                                            {sc.label}
                                        </span>
                                    </div>

                                    {/* Catatan Tolak */}
                                    {k.catatanTolak && (
                                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
                                            <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                                            <p className="text-xs text-red-700">
                                                <span className="font-semibold">Catatan: </span>
                                                {k.catatanTolak}
                                            </p>
                                        </div>
                                    )}

                                    {/* Detail MK */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                        {k.detailKRS?.map(d => (
                                            <div key={d.id} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                                                <span className="text-xs text-slate-600 truncate pr-2">{d.mataKuliah?.nama}</span>
                                                <span className="text-xs font-bold text-indigo-600 flex-shrink-0">{d.mataKuliah?.sks} SKS</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

        </PortalLayout>
    );
}