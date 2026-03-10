import { useState, useEffect } from 'react';
import Layout from '@/components/layouts/Layout';
import api from '@/utils/api';
import toast, { Toaster } from 'react-hot-toast';
import {
    Plus, Search, Filter, CheckCircle, Clock, DollarSign,
    Edit2, Trash2, X, Save, RefreshCw, TrendingUp,
    Zap, AlertTriangle, CreditCard, Users, FileText
} from 'lucide-react';

const JENIS_TAGIHAN = [
    'UKT Semester', 'SPP', 'Biaya Wisuda', 'Biaya Praktikum',
    'Biaya Ujian', 'Denda', 'Lain-lain'
];

const FORM_INIT = {
    mahasiswaId: '', jenis: '', nominal: '',
    status: 'belum_bayar', keterangan: '', tanggal: ''
};

const MASSAL_INIT = {
    prodiId: '', jenisKelasId: '', tahunAngkatan: '',
    jenis: '', nominal: '', keterangan: ''
};

const formatRp = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;

export default function KeuanganPage() {
    const [data, setData] = useState([]);
    const [summary, setSummary] = useState({});
    const [mahasiswa, setMahasiswa] = useState([]);
    const [prodi, setProdi] = useState([]);
    const [jenisKelas, setJenisKelas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterProdi, setFilterProdi] = useState('');
    const [selected, setSelected] = useState([]);
    const [activeTab, setActiveTab] = useState('tagihan');

    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(FORM_INIT);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);

    const [massalForm, setMassalForm] = useState(MASSAL_INIT);
    const [savingMassal, setSavingMassal] = useState(false);

    const fetchData = async () => {
        try {
            const params = {};
            if (filterStatus) params.status = filterStatus;
            if (filterProdi) params.prodiId = filterProdi;
            if (search) params.search = search;
            const [keuRes, prodiRes, kelasRes] = await Promise.all([
                api.get('/keuangan', { params }),
                api.get('/prodi'),
                api.get('/jenis-kelas/aktif')
            ]);
            setData(keuRes.data.data);
            setSummary(keuRes.data.summary);
            setProdi(prodiRes.data.data);
            setJenisKelas(kelasRes.data.data);
        } catch { toast.error('Gagal ambil data!'); }
        finally { setLoading(false); }
    };

    const fetchMahasiswa = async () => {
        try {
            const res = await api.get('/akademik/mahasiswa');
            setMahasiswa(res.data.data);
        } catch { }
    };

    useEffect(() => { fetchData(); fetchMahasiswa(); }, [filterStatus, filterProdi]);

    const handleSearch = (e) => { if (e.key === 'Enter') fetchData(); };
    const toggleSelect = (id) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    const toggleAll = () => {
        const ids = data.filter(d => d.status === 'belum_bayar').map(d => d.id);
        setSelected(p => p.length === ids.length ? [] : ids);
    };

    const handleOpen = (item = null) => {
        if (item) {
            setForm({
                mahasiswaId: item.mahasiswaId,
                jenis: item.jenis,
                nominal: item.nominal,
                status: item.status,
                keterangan: item.keterangan || '',
                tanggal: item.tanggal ? item.tanggal.split('T')[0] : ''
            });
            setEditId(item.id);
        } else {
            setForm(FORM_INIT);
            setEditId(null);
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.mahasiswaId || !form.jenis || !form.nominal) {
            toast.error('Mahasiswa, jenis, dan nominal wajib diisi!'); return;
        }
        setSaving(true);
        try {
            if (editId) {
                await api.put(`/keuangan/${editId}`, form);
                toast.success('Tagihan berhasil diupdate!');
            } else {
                await api.post('/keuangan', form);
                toast.success('Tagihan berhasil dibuat!');
            }
            setShowModal(false);
            fetchData();
        } catch (e) { toast.error(e.response?.data?.message || 'Gagal!'); }
        finally { setSaving(false); }
    };

    const handleBayar = async (id) => {
        try {
            await api.patch(`/keuangan/${id}/bayar`);
            toast.success('Pembayaran dikonfirmasi!');
            fetchData();
        } catch { toast.error('Gagal!'); }
    };

    const handleBayarMassal = async () => {
        if (selected.length === 0) { toast.error('Pilih minimal 1 tagihan!'); return; }
        if (!confirm(`Konfirmasi pembayaran ${selected.length} tagihan?`)) return;
        try {
            await api.post('/keuangan/bayar-massal', { ids: selected });
            toast.success(`${selected.length} tagihan dikonfirmasi!`);
            setSelected([]);
            fetchData();
        } catch { toast.error('Gagal!'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus tagihan ini?')) return;
        try {
            await api.delete(`/keuangan/${id}`);
            toast.success('Tagihan dihapus!');
            fetchData();
        } catch { toast.error('Gagal hapus!'); }
    };

    const handleSaveMassal = async () => {
        if (!massalForm.jenis || !massalForm.nominal) {
            toast.error('Jenis dan nominal wajib diisi!'); return;
        }
        if (!confirm('Buat tagihan massal untuk semua mahasiswa aktif yang sesuai filter?')) return;
        setSavingMassal(true);
        try {
            const res = await api.post('/keuangan/massal', massalForm);
            toast.success(res.data.message);
            setMassalForm(MASSAL_INIT);
            fetchData();
        } catch (e) { toast.error(e.response?.data?.message || 'Gagal!'); }
        finally { setSavingMassal(false); }
    };

    const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400";
    const labelClass = "block text-sm font-semibold text-slate-600 mb-1.5";
    const belumBayarIds = data.filter(d => d.status === 'belum_bayar').map(d => d.id);

    return (
        <Layout title="Keuangan">
            <Toaster position="top-right" />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                {[
                    { icon: TrendingUp, label: `Total Tagihan (${data.length})`, value: formatRp(summary.totalTagihan), iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
                    { icon: CheckCircle, label: 'Sudah Dibayar', value: formatRp(summary.totalLunas), iconBg: 'bg-green-50', iconColor: 'text-green-600' },
                    { icon: Clock, label: `Belum Dibayar (${data.filter(d => d.status === 'belum_bayar').length})`, value: formatRp(summary.totalBelum), iconBg: 'bg-red-50', iconColor: 'text-red-500' },
                ].map(s => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-5">
                            <div className={`w-9 h-9 ${s.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                                <Icon size={17} className={s.iconColor} />
                            </div>
                            <div className="text-xl font-bold text-slate-800">{s.value}</div>
                            <div className="text-slate-400 text-sm mt-0.5">{s.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl w-fit mb-5">
                {[
                    { key: 'tagihan', icon: FileText, label: 'Daftar Tagihan' },
                    { key: 'massal', icon: Zap, label: 'Tagihan Massal' },
                ].map(t => {
                    const Icon = t.icon;
                    return (
                        <button key={t.key} onClick={() => setActiveTab(t.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === t.key ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            <Icon size={14} /> {t.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Tagihan */}
            {activeTab === 'tagihan' && (
                <>
                    <div className="flex flex-col sm:flex-row gap-2 mb-4 flex-wrap">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={handleSearch}
                                placeholder="Cari nama atau NIM... (Enter)"
                                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
                        </div>
                        <div className="relative">
                            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                                className="pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 bg-white appearance-none">
                                <option value="">Semua Status</option>
                                <option value="belum_bayar">Belum Bayar</option>
                                <option value="sudah_bayar">Sudah Bayar</option>
                            </select>
                        </div>
                        <div className="relative">
                            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select value={filterProdi} onChange={e => setFilterProdi(e.target.value)}
                                className="pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 bg-white appearance-none">
                                <option value="">Semua Prodi</option>
                                {prodi.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            {selected.length > 0 && (
                                <button onClick={handleBayarMassal}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition whitespace-nowrap">
                                    <CheckCircle size={14} /> Bayar ({selected.length})
                                </button>
                            )}
                            <button onClick={() => handleOpen()}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition whitespace-nowrap">
                                <Plus size={15} /> Tambah
                            </button>
                        </div>
                    </div>

                    {/* Desktop Table */}
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="px-4 py-3 w-10">
                                            <input type="checkbox"
                                                checked={selected.length === belumBayarIds.length && belumBayarIds.length > 0}
                                                onChange={toggleAll} className="rounded border-slate-300" />
                                        </th>
                                        {['Mahasiswa', 'Prodi', 'Jenis', 'Nominal', 'Status', 'Tanggal', 'Aksi'].map(h => (
                                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr><td colSpan={8} className="text-center py-12 text-slate-400 text-sm">
                                            <div className="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2" />
                                            Memuat data...
                                        </td></tr>
                                    ) : data.length === 0 ? (
                                        <tr><td colSpan={8} className="text-center py-12 text-slate-400 text-sm">Tidak ada data</td></tr>
                                    ) : data.map(item => (
                                        <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${selected.includes(item.id) ? 'bg-green-50/60' : ''}`}>
                                            <td className="px-4 py-3">
                                                {item.status === 'belum_bayar' && (
                                                    <input type="checkbox"
                                                        checked={selected.includes(item.id)}
                                                        onChange={() => toggleSelect(item.id)}
                                                        className="rounded border-slate-300" />
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-700 text-sm">{item.mahasiswa?.nama}</div>
                                                <div className="text-xs text-indigo-600 font-mono">{item.mahasiswa?.nim}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-500">{item.mahasiswa?.prodi?.nama}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{item.jenis}</td>
                                            <td className="px-4 py-3 font-semibold text-slate-700 text-sm">{formatRp(item.nominal)}</td>
                                            <td className="px-4 py-3">
                                                {item.status === 'sudah_bayar' ? (
                                                    <span className="inline-flex items-center gap-1.5 text-xs bg-green-100 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-medium">
                                                        <CheckCircle size={10} /> Lunas
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-xs bg-red-100 text-red-600 border border-red-200 px-2.5 py-1 rounded-full font-medium">
                                                        <Clock size={10} /> Belum Bayar
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-400">
                                                {new Date(item.tanggal).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1">
                                                    {item.status === 'belum_bayar' && (
                                                        <button onClick={() => handleBayar(item.id)}
                                                            className="flex items-center gap-1 text-xs text-green-600 hover:bg-green-50 border border-green-200 px-2.5 py-1.5 rounded-lg transition">
                                                            <CreditCard size={11} /> Bayar
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleOpen(item)}
                                                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                                                        <Edit2 size={13} />
                                                    </button>
                                                    <button onClick={() => handleDelete(item.id)}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition">
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y divide-slate-100">
                            {loading ? (
                                <div className="py-12 text-center">
                                    <div className="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                                </div>
                            ) : data.length === 0 ? (
                                <div className="py-12 text-center text-slate-400 text-sm">Tidak ada data</div>
                            ) : data.map(item => (
                                <div key={item.id} className={`p-4 ${selected.includes(item.id) ? 'bg-green-50/60' : ''}`}>
                                    <div className="flex items-start gap-3">
                                        {item.status === 'belum_bayar' && (
                                            <input type="checkbox" checked={selected.includes(item.id)}
                                                onChange={() => toggleSelect(item.id)}
                                                className="rounded border-slate-300 mt-1" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <div>
                                                    <div className="font-medium text-slate-700 text-sm">{item.mahasiswa?.nama}</div>
                                                    <div className="text-xs text-indigo-600 font-mono">{item.mahasiswa?.nim}</div>
                                                </div>
                                                {item.status === 'sudah_bayar' ? (
                                                    <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full flex-shrink-0">Lunas</span>
                                                ) : (
                                                    <span className="text-xs bg-red-100 text-red-600 border border-red-200 px-2 py-0.5 rounded-full flex-shrink-0">Belum Bayar</span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1">{item.jenis}</div>
                                            <div className="font-semibold text-slate-700 text-sm mt-0.5">{formatRp(item.nominal)}</div>
                                            <div className="flex gap-2 mt-3">
                                                {item.status === 'belum_bayar' && (
                                                    <button onClick={() => handleBayar(item.id)}
                                                        className="flex items-center gap-1 text-xs text-green-600 border border-green-200 px-2.5 py-1.5 rounded-lg">
                                                        <CreditCard size={11} /> Bayar
                                                    </button>
                                                )}
                                                <button onClick={() => handleOpen(item)}
                                                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                                                    <Edit2 size={13} />
                                                </button>
                                                <button onClick={() => handleDelete(item.id)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition">
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Tab Tagihan Massal */}
            {activeTab === 'massal' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-xl">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
                            <Zap size={17} className="text-indigo-600" />
                        </div>
                        <h2 className="font-bold text-slate-800">Buat Tagihan Massal</h2>
                    </div>
                    <p className="text-sm text-slate-400 mb-5 ml-12">Buat tagihan sekaligus untuk semua mahasiswa aktif sesuai filter.</p>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Filter Prodi</label>
                                <select value={massalForm.prodiId}
                                    onChange={e => setMassalForm({ ...massalForm, prodiId: e.target.value })}
                                    className={inputClass}>
                                    <option value="">Semua Prodi</option>
                                    {prodi.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Filter Jenis Kelas</label>
                                <select value={massalForm.jenisKelasId}
                                    onChange={e => setMassalForm({ ...massalForm, jenisKelasId: e.target.value })}
                                    className={inputClass}>
                                    <option value="">Semua Kelas</option>
                                    {jenisKelas.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Filter Tahun Angkatan</label>
                            <input type="number" value={massalForm.tahunAngkatan}
                                onChange={e => setMassalForm({ ...massalForm, tahunAngkatan: e.target.value })}
                                className={inputClass} placeholder="Kosongkan untuk semua angkatan" />
                        </div>
                        <hr className="border-slate-100" />
                        <div>
                            <label className={labelClass}>Jenis Tagihan *</label>
                            <select value={massalForm.jenis}
                                onChange={e => setMassalForm({ ...massalForm, jenis: e.target.value })}
                                className={inputClass}>
                                <option value="">-- Pilih Jenis --</option>
                                {JENIS_TAGIHAN.map(j => <option key={j} value={j}>{j}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Nominal *</label>
                            <input type="number" value={massalForm.nominal}
                                onChange={e => setMassalForm({ ...massalForm, nominal: e.target.value })}
                                className={inputClass} placeholder="Contoh: 2500000" />
                        </div>
                        <div>
                            <label className={labelClass}>Keterangan</label>
                            <textarea rows={2} value={massalForm.keterangan}
                                onChange={e => setMassalForm({ ...massalForm, keterangan: e.target.value })}
                                className={inputClass} placeholder="Opsional" />
                        </div>
                        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                            <AlertTriangle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-700">
                                Tagihan akan dibuat untuk <strong>semua mahasiswa AKTIF</strong> yang sesuai filter di atas.
                            </p>
                        </div>
                        <button onClick={handleSaveMassal} disabled={savingMassal}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-50 transition">
                            {savingMassal
                                ? <><RefreshCw size={14} className="animate-spin" /> Memproses...</>
                                : <><Zap size={14} /> Buat Tagihan Massal</>
                            }
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Form */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
                                    <DollarSign size={17} className="text-indigo-600" />
                                </div>
                                <h2 className="font-bold text-slate-800">{editId ? 'Edit Tagihan' : 'Tambah Tagihan'}</h2>
                            </div>
                            <button onClick={() => setShowModal(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            {!editId && (
                                <div>
                                    <label className={labelClass}>Mahasiswa *</label>
                                    <select value={form.mahasiswaId}
                                        onChange={e => setForm({ ...form, mahasiswaId: e.target.value })}
                                        className={inputClass}>
                                        <option value="">-- Pilih Mahasiswa --</option>
                                        {mahasiswa.map(m => (
                                            <option key={m.id} value={m.id}>[{m.nim}] {m.nama}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className={labelClass}>Jenis Tagihan *</label>
                                <select value={form.jenis}
                                    onChange={e => setForm({ ...form, jenis: e.target.value })}
                                    className={inputClass}>
                                    <option value="">-- Pilih Jenis --</option>
                                    {JENIS_TAGIHAN.map(j => <option key={j} value={j}>{j}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>Nominal *</label>
                                    <input type="number" value={form.nominal}
                                        onChange={e => setForm({ ...form, nominal: e.target.value })}
                                        className={inputClass} placeholder="2500000" />
                                </div>
                                <div>
                                    <label className={labelClass}>Status</label>
                                    <select value={form.status}
                                        onChange={e => setForm({ ...form, status: e.target.value })}
                                        className={inputClass}>
                                        <option value="belum_bayar">Belum Bayar</option>
                                        <option value="sudah_bayar">Sudah Bayar</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Tanggal</label>
                                <input type="date" value={form.tanggal}
                                    onChange={e => setForm({ ...form, tanggal: e.target.value })}
                                    className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Keterangan</label>
                                <textarea rows={2} value={form.keterangan}
                                    onChange={e => setForm({ ...form, keterangan: e.target.value })}
                                    className={inputClass} placeholder="Opsional" />
                            </div>
                        </div>
                        <div className="p-5 border-t flex gap-3">
                            <button onClick={() => setShowModal(false)}
                                className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition">
                                Batal
                            </button>
                            <button onClick={handleSave} disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition">
                                {saving
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