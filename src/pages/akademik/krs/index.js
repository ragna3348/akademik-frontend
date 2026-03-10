import { useState, useEffect } from 'react';
import Layout from '@/components/layouts/Layout';
import api from '@/utils/api';
import { useRole } from '@/utils/useRole';
import toast, { Toaster } from 'react-hot-toast';
import {
    Search, Filter, CheckCircle, XCircle, Clock, FileText,
    Calendar, Plus, Trash2, X, Save, RefreshCw, ChevronRight
} from 'lucide-react';

const STATUS_CONFIG = {
    DRAFT:       { label: 'Draft',        style: 'bg-slate-100 text-slate-600 border-slate-200' },
    DIAJUKAN:    { label: 'Menunggu',     style: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    DISETUJUI:   { label: 'Disetujui',   style: 'bg-green-50 text-green-700 border-green-200' },
    DITOLAK:     { label: 'Ditolak',      style: 'bg-red-50 text-red-700 border-red-200' },
    TERLAMBAT:   { label: 'Terlambat',   style: 'bg-orange-50 text-orange-700 border-orange-200' },
    PENGECUALIAN:{ label: 'Pengecualian',style: 'bg-purple-50 text-purple-700 border-purple-200' },
};

export default function KRSPage() {
    const [activeTab, setActiveTab] = useState('krs');
    const { isReadOnly } = useRole();
    const [krs, setKrs] = useState([]);
    const [periode, setPeriode] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('DIAJUKAN');
    const [filterPeriode, setFilterPeriode] = useState('');
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState([]);

    const [showDetail, setShowDetail] = useState(false);
    const [detailItem, setDetailItem] = useState(null);
    const [showTolak, setShowTolak] = useState(false);
    const [tolakItem, setTolakItem] = useState(null);
    const [catatan, setCatatan] = useState('');
    const [processing, setProcessing] = useState(false);

    const [showPeriodeForm, setShowPeriodeForm] = useState(false);
    const [periodeForm, setPeriodeForm] = useState({
        nama: '', tahunAjaran: '', semester: '1',
        tanggalBuka: '', tanggalTutup: ''
    });
    const [savingPeriode, setSavingPeriode] = useState(false);

    const fetchKRS = async () => {
        try {
            const params = {};
            if (filterStatus) params.status = filterStatus;
            if (filterPeriode) params.periodeId = filterPeriode;
            const res = await api.get('/akademik/krs', { params });
            setKrs(res.data.data);
        } catch { toast.error('Gagal ambil data KRS!'); }
        finally { setLoading(false); }
    };

    const fetchPeriode = async () => {
        try {
            const res = await api.get('/akademik/krs/periode');
            setPeriode(res.data.data);
        } catch { toast.error('Gagal ambil periode!'); }
    };

    useEffect(() => { fetchKRS(); fetchPeriode(); }, [filterStatus, filterPeriode]);

    const filtered = krs.filter(k =>
        k.mahasiswa?.nama?.toLowerCase().includes(search.toLowerCase()) ||
        k.mahasiswa?.nim?.toLowerCase().includes(search.toLowerCase())
    );

    const diajukanList = filtered.filter(k => k.status === 'DIAJUKAN');
    const toggleSelect = (id) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    const toggleSelectAll = () => {
        const ids = diajukanList.map(k => k.id);
        setSelected(p => p.length === ids.length ? [] : ids);
    };

    const handleSetujui = async (id) => {
        setProcessing(id);
        try {
            await api.put(`/akademik/krs/${id}/setujui`);
            toast.success('KRS disetujui!');
            fetchKRS();
            setShowDetail(false);
        } catch (e) { toast.error(e.response?.data?.message || 'Gagal!'); }
        finally { setProcessing(null); }
    };

    const handleTolak = async () => {
        setProcessing(tolakItem.id);
        try {
            await api.put(`/akademik/krs/${tolakItem.id}/tolak`, { catatan });
            toast.success('KRS ditolak!');
            setShowTolak(false);
            setCatatan('');
            setShowDetail(false);
            fetchKRS();
        } catch (e) { toast.error(e.response?.data?.message || 'Gagal!'); }
        finally { setProcessing(null); }
    };

    const handleSetujuiMassal = async () => {
        if (selected.length === 0) { toast.error('Pilih minimal 1 KRS!'); return; }
        if (!confirm(`Setujui ${selected.length} KRS sekaligus?`)) return;
        try {
            await api.post('/akademik/krs/setujui-massal', { krsIds: selected });
            toast.success(`${selected.length} KRS disetujui!`);
            setSelected([]);
            fetchKRS();
        } catch { toast.error('Gagal setujui massal!'); }
    };

    const handleSavePeriode = async () => {
        if (!periodeForm.nama || !periodeForm.tahunAjaran || !periodeForm.tanggalBuka || !periodeForm.tanggalTutup) {
            toast.error('Semua field harus diisi!'); return;
        }
        setSavingPeriode(true);
        try {
            await api.post('/akademik/krs/periode', periodeForm);
            toast.success('Periode berhasil dibuat!');
            setShowPeriodeForm(false);
            setPeriodeForm({ nama: '', tahunAjaran: '', semester: '1', tanggalBuka: '', tanggalTutup: '' });
            fetchPeriode();
        } catch (e) { toast.error(e.response?.data?.message || 'Gagal!'); }
        finally { setSavingPeriode(false); }
    };

    const handleAktifkanPeriode = async (id) => {
        try {
            await api.put(`/akademik/krs/periode/${id}/aktifkan`);
            toast.success('Periode diaktifkan!');
            fetchPeriode();
        } catch { toast.error('Gagal!'); }
    };

    const handleDeletePeriode = async (id) => {
        if (!confirm('Hapus periode ini?')) return;
        try {
            await api.delete(`/akademik/krs/periode/${id}`);
            toast.success('Periode dihapus!');
            fetchPeriode();
        } catch { toast.error('Gagal hapus!'); }
    };

    const stats = {
        diajukan: krs.filter(k => k.status === 'DIAJUKAN').length,
        disetujui: krs.filter(k => k.status === 'DISETUJUI').length,
        ditolak: krs.filter(k => k.status === 'DITOLAK').length,
    };

    const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition";
    const labelClass = "block text-sm font-medium text-slate-600 mb-1.5";

    const TABS = [
        { key: 'krs',    label: 'Persetujuan KRS', icon: FileText },
        { key: 'periode',label: 'Periode KRS',      icon: Calendar },
    ];

    return (
        <Layout title="Manajemen KRS">
            <Toaster position="top-right" />

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-5">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all
                                ${activeTab === tab.key ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            <Icon size={15} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ===== TAB KRS ===== */}
            {activeTab === 'krs' && (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                        {[
                            { icon: Clock,       label: 'Menunggu',  value: stats.diajukan,  iconBg: 'bg-yellow-50', iconColor: 'text-yellow-600' },
                            { icon: CheckCircle, label: 'Disetujui', value: stats.disetujui, iconBg: 'bg-green-50',  iconColor: 'text-green-600' },
                            { icon: XCircle,     label: 'Ditolak',   value: stats.ditolak,   iconBg: 'bg-red-50',    iconColor: 'text-red-500' },
                        ].map(s => {
                            const Icon = s.icon;
                            return (
                                <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
                                    <div className={`w-8 h-8 ${s.iconBg} rounded-lg flex items-center justify-center mb-2`}>
                                        <Icon size={15} className={s.iconColor} />
                                    </div>
                                    <div className="text-2xl font-bold text-slate-800">{s.value}</div>
                                    <div className="text-slate-400 text-sm">{s.label}</div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Filter */}
                    <div className="flex flex-col sm:flex-row gap-2 mb-4">
                        <div className="relative flex-1">
                            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Cari nama atau NIM mahasiswa..."
                                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
                        </div>
                        <div className="relative">
                            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                                className="pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none bg-white appearance-none">
                                <option value="">Semua Status</option>
                                <option value="DIAJUKAN">Menunggu</option>
                                <option value="DISETUJUI">Disetujui</option>
                                <option value="DITOLAK">Ditolak</option>
                            </select>
                        </div>
                        <div className="relative">
                            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select value={filterPeriode} onChange={e => setFilterPeriode(e.target.value)}
                                className="pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none bg-white appearance-none">
                                <option value="">Semua Periode</option>
                                {periode.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                            </select>
                        </div>
                        {selected.length > 0 && (
                            <button onClick={handleSetujuiMassal}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition whitespace-nowrap">
                                <CheckCircle size={14} />
                                Setujui {selected.length} Terpilih
                            </button>
                        )}
                    </div>

                    {/* Tabel */}
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                        {/* Desktop */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="px-4 py-3 w-10">
                                            <input type="checkbox"
                                                checked={selected.length === diajukanList.length && diajukanList.length > 0}
                                                onChange={toggleSelectAll} className="rounded border-slate-300" />
                                        </th>
                                        {['Mahasiswa', 'Prodi', 'Periode', 'SKS', 'Status', 'Tanggal', ...(!isReadOnly ? ['Aksi'] : [])].map(h => (
                                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr><td colSpan={8} className="text-center py-12">
                                            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                                        </td></tr>
                                    ) : filtered.length === 0 ? (
                                        <tr><td colSpan={8} className="text-center py-12 text-slate-400">Tidak ada data KRS</td></tr>
                                    ) : filtered.map(item => (
                                        <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${selected.includes(item.id) ? 'bg-yellow-50/60' : ''}`}>
                                            <td className="px-4 py-3">
                                                {item.status === 'DIAJUKAN' && (
                                                    <input type="checkbox"
                                                        checked={selected.includes(item.id)}
                                                        onChange={() => toggleSelect(item.id)}
                                                        className="rounded border-slate-300" />
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-700 text-sm">{item.mahasiswa?.nama}</div>
                                                <div className="font-mono text-xs text-indigo-600">{item.mahasiswa?.nim}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-500">{item.mahasiswa?.prodi?.nama}</td>
                                            <td className="px-4 py-3 text-sm text-slate-500">{item.periode?.nama}</td>
                                            <td className="px-4 py-3 text-center font-bold text-indigo-600 text-sm">{item.totalSks}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${STATUS_CONFIG[item.status]?.style}`}>
                                                    {STATUS_CONFIG[item.status]?.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-400">
                                                {new Date(item.createdAt).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1.5">
                                                    <button onClick={() => { setDetailItem(item); setShowDetail(true); }}
                                                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Detail">
                                                        <ChevronRight size={14} />
                                                    </button>
                                                    {item.status === 'DIAJUKAN' && (
                                                        <>
                                                            <button onClick={() => handleSetujui(item.id)}
                                                                disabled={processing === item.id}
                                                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50" title="Setujui">
                                                                <CheckCircle size={14} />
                                                            </button>
                                                            <button onClick={() => { setTolakItem(item); setShowTolak(true); }}
                                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="Tolak">
                                                                <XCircle size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y divide-slate-100">
                            {filtered.map(item => (
                                <div key={item.id} className={`p-4 ${selected.includes(item.id) ? 'bg-yellow-50/60' : ''}`}>
                                    <div className="flex items-start gap-3">
                                        {item.status === 'DIAJUKAN' && (
                                            <input type="checkbox" checked={selected.includes(item.id)}
                                                onChange={() => toggleSelect(item.id)}
                                                className="rounded border-slate-300 mt-1" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="font-medium text-slate-700 text-sm truncate">{item.mahasiswa?.nama}</div>
                                                <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${STATUS_CONFIG[item.status]?.style}`}>
                                                    {STATUS_CONFIG[item.status]?.label}
                                                </span>
                                            </div>
                                            <div className="font-mono text-xs text-indigo-600 mt-0.5">{item.mahasiswa?.nim}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">{item.periode?.nama} — <span className="font-semibold text-indigo-600">{item.totalSks} SKS</span></div>
                                            <div className="flex gap-2 mt-3">
                                                <button onClick={() => { setDetailItem(item); setShowDetail(true); }}
                                                    className="flex items-center gap-1 text-xs text-indigo-600 border border-indigo-200 px-2.5 py-1.5 rounded-lg">
                                                    <ChevronRight size={11} /> Detail
                                                </button>
                                                {item.status === 'DIAJUKAN' && (
                                                    <>
                                                        <button onClick={() => handleSetujui(item.id)}
                                                            className="flex items-center gap-1 text-xs text-green-600 border border-green-200 px-2.5 py-1.5 rounded-lg">
                                                            <CheckCircle size={11} /> Setujui
                                                        </button>
                                                        <button onClick={() => { setTolakItem(item); setShowTolak(true); }}
                                                            className="flex items-center gap-1 text-xs text-red-500 border border-red-200 px-2.5 py-1.5 rounded-lg">
                                                            <XCircle size={11} /> Tolak
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* ===== TAB PERIODE ===== */}
            {activeTab === 'periode' && (
                <>
                    <div className="flex justify-end mb-4">
                        {!isReadOnly && (<button onClick={() => setShowPeriodeForm(true)}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition">
                            <Plus size={16} />
                            Tambah Periode
                        </button>)}
                    </div>

                    {periode.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
                            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Calendar size={28} className="text-slate-400" />
                            </div>
                            <div className="text-slate-500 font-medium">Belum ada periode KRS</div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {periode.map(p => (
                                <div key={p.id} className={`bg-white border-2 rounded-2xl p-5 transition-all ${p.isAktif ? 'border-green-400 shadow-md shadow-green-50' : 'border-slate-200'}`}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="font-semibold text-slate-800">{p.nama}</div>
                                            <div className="text-sm text-slate-500 mt-0.5">TA {p.tahunAjaran} — Semester {p.semester}</div>
                                        </div>
                                        {p.isAktif && (
                                            <span className="inline-flex items-center gap-1.5 text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-medium">
                                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                                Aktif
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 bg-slate-50 rounded-xl px-3 py-2">
                                        <Calendar size={12} />
                                        <span>{new Date(p.tanggalBuka).toLocaleDateString('id-ID')} s/d {new Date(p.tanggalTutup).toLocaleDateString('id-ID')}</span>
                                    </div>
                                    <div className="flex gap-2 pt-3 border-t border-slate-100">
                                        {!p.isAktif && (
                                            <button onClick={() => handleAktifkanPeriode(p.id)}
                                                className="flex items-center gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-xl transition">
                                                <CheckCircle size={12} />
                                                Aktifkan
                                            </button>
                                        )}
                                        <button onClick={() => handleDeletePeriode(p.id)}
                                            className="flex items-center gap-1.5 text-xs text-red-500 border border-red-200 hover:bg-red-50 px-3 py-2 rounded-xl transition">
                                            <Trash2 size={12} />
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Modal Detail KRS */}
            {showDetail && detailItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
                            <h2 className="font-bold text-slate-800">Detail KRS</h2>
                            <button onClick={() => setShowDetail(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-5">
                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-4">
                                <div className="font-semibold text-indigo-800">{detailItem.mahasiswa?.nama}</div>
                                <div className="text-sm text-indigo-600 mt-0.5">{detailItem.mahasiswa?.nim} — {detailItem.mahasiswa?.prodi?.nama}</div>
                                <div className="text-xs text-slate-500 mt-1">{detailItem.periode?.nama}</div>
                            </div>

                            <div className="flex items-center justify-between mb-4">
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${STATUS_CONFIG[detailItem.status]?.style}`}>
                                    {STATUS_CONFIG[detailItem.status]?.label}
                                </span>
                                <span className="font-bold text-indigo-600 text-sm">Total: {detailItem.totalSks} SKS</span>
                            </div>

                            {detailItem.catatanTolak && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-700 flex items-start gap-2">
                                    <XCircle size={14} className="flex-shrink-0 mt-0.5" />
                                    <span>Catatan: {detailItem.catatanTolak}</span>
                                </div>
                            )}

                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Daftar Mata Kuliah</div>
                            <div className="space-y-2">
                                {detailItem.detailKRS?.map((d, i) => (
                                    <div key={d.id} className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-400 w-5">{i + 1}.</span>
                                            <div>
                                                <div className="text-sm font-medium text-slate-700">{d.mataKuliah?.nama}</div>
                                                <div className="text-xs text-slate-400 font-mono">{d.mataKuliah?.kode}</div>
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold text-indigo-600">{d.mataKuliah?.sks} SKS</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {detailItem.status === 'DIAJUKAN' && (
                            <div className="p-5 border-t flex gap-3">
                                <button onClick={() => { setShowDetail(false); setTolakItem(detailItem); setShowTolak(true); }}
                                    className="flex-1 flex items-center justify-center gap-2 border-2 border-red-300 text-red-600 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-50 transition">
                                    <XCircle size={15} /> Tolak
                                </button>
                                <button onClick={() => handleSetujui(detailItem.id)}
                                    disabled={processing === detailItem.id}
                                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50 transition">
                                    {processing === detailItem.id
                                        ? <><RefreshCw size={14} className="animate-spin" /> Memproses...</>
                                        : <><CheckCircle size={15} /> Setujui</>
                                    }
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal Tolak */}
            {showTolak && tolakItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-5 border-b">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                                    <XCircle size={17} className="text-red-500" />
                                </div>
                                <h2 className="font-bold text-slate-800">Tolak KRS</h2>
                            </div>
                            <button onClick={() => setShowTolak(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                <div className="font-semibold text-slate-700 text-sm">{tolakItem.mahasiswa?.nama}</div>
                                <div className="text-xs text-slate-400 mt-0.5">{tolakItem.mahasiswa?.nim}</div>
                            </div>
                            <div>
                                <label className={labelClass}>Alasan Penolakan (opsional)</label>
                                <textarea rows={3} value={catatan}
                                    onChange={e => setCatatan(e.target.value)}
                                    className={`${inputClass} resize-none`}
                                    placeholder="Contoh: Terdapat mata kuliah yang tidak sesuai prasyarat" />
                                <p className="text-xs text-slate-400 mt-1">Alasan akan dikirim ke email mahasiswa.</p>
                            </div>
                        </div>
                        <div className="p-5 border-t flex gap-3">
                            <button onClick={() => setShowTolak(false)}
                                className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition">
                                Batal
                            </button>
                            <button onClick={handleTolak} disabled={!!processing}
                                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50 transition">
                                {processing
                                    ? <><RefreshCw size={14} className="animate-spin" /> Memproses...</>
                                    : <><XCircle size={14} /> Tolak KRS</>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Tambah Periode */}
            {showPeriodeForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-5 border-b">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
                                    <Calendar size={17} className="text-indigo-600" />
                                </div>
                                <h2 className="font-bold text-slate-800">Tambah Periode KRS</h2>
                            </div>
                            <button onClick={() => setShowPeriodeForm(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className={labelClass}>Nama Periode *</label>
                                <input type="text" value={periodeForm.nama}
                                    onChange={e => setPeriodeForm({ ...periodeForm, nama: e.target.value })}
                                    className={inputClass} placeholder="Semester Ganjil 2025/2026" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Tahun Ajaran *</label>
                                    <input type="text" value={periodeForm.tahunAjaran}
                                        onChange={e => setPeriodeForm({ ...periodeForm, tahunAjaran: e.target.value })}
                                        className={inputClass} placeholder="2025/2026" />
                                </div>
                                <div>
                                    <label className={labelClass}>Semester *</label>
                                    <select value={periodeForm.semester}
                                        onChange={e => setPeriodeForm({ ...periodeForm, semester: e.target.value })}
                                        className={inputClass}>
                                        {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Tanggal Buka *</label>
                                <input type="datetime-local" value={periodeForm.tanggalBuka}
                                    onChange={e => setPeriodeForm({ ...periodeForm, tanggalBuka: e.target.value })}
                                    className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Tanggal Tutup *</label>
                                <input type="datetime-local" value={periodeForm.tanggalTutup}
                                    onChange={e => setPeriodeForm({ ...periodeForm, tanggalTutup: e.target.value })}
                                    className={inputClass} />
                            </div>
                        </div>
                        <div className="p-5 border-t flex gap-3">
                            <button onClick={() => setShowPeriodeForm(false)}
                                className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition">
                                Batal
                            </button>
                            <button onClick={handleSavePeriode} disabled={savingPeriode}
                                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition">
                                {savingPeriode
                                    ? <><RefreshCw size={14} className="animate-spin" /> Menyimpan...</>
                                    : <><Save size={14} /> Simpan</>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}