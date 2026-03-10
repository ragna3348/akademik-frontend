import { useState, useEffect } from 'react';
import Layout from '@/components/layouts/Layout';
import api from '@/utils/api';
import toast, { Toaster } from 'react-hot-toast';
import {
    Plus, Search, Users, CheckCircle, GraduationCap,
    Copy, Check, Edit2, RefreshCw, ToggleLeft, ToggleRight,
    X, Save, Handshake, Phone, Mail, Info
} from 'lucide-react';

const STATUS_COLOR = {
    DAFTAR: 'bg-blue-50 text-blue-600 border-blue-200',
    BAYAR: 'bg-amber-50 text-amber-600 border-amber-200',
    LULUS: 'bg-green-50 text-green-600 border-green-200',
    GUGUR: 'bg-red-50 text-red-500 border-red-200',
};

const FORM_INIT = { nama: '', email: '', telepon: '' };

export default function AfiliasiPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [detailItem, setDetailItem] = useState(null);
    const [form, setForm] = useState(FORM_INIT);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(null);

    const fetchData = async () => {
        try {
            const res = await api.get('/pamaba/afiliasi');
            setData(res.data.data);
        } catch { toast.error('Gagal ambil data!'); }
        finally { setLoading(false); }
    };

    const fetchDetail = async (id) => {
        try {
            const res = await api.get(`/pamaba/afiliasi/${id}`);
            setDetailItem(res.data.data);
            setShowDetail(true);
        } catch { toast.error('Gagal ambil detail!'); }
    };

    useEffect(() => { fetchData(); }, []);

    const filtered = data.filter(d =>
        d.nama?.toLowerCase().includes(search.toLowerCase()) ||
        d.kodeAfiliasi?.toLowerCase().includes(search.toLowerCase()) ||
        d.email?.toLowerCase().includes(search.toLowerCase())
    );

    const handleOpen = (item = null) => {
        if (item) {
            setForm({ nama: item.nama, email: item.email || '', telepon: item.telepon || '' });
            setEditId(item.id);
        } else {
            setForm(FORM_INIT);
            setEditId(null);
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.nama) { toast.error('Nama wajib diisi!'); return; }
        setSaving(true);
        try {
            if (editId) {
                await api.put(`/pamaba/afiliasi/${editId}`, form);
                toast.success('Afiliasi berhasil diupdate!');
            } else {
                await api.post('/pamaba/afiliasi', form);
                toast.success('Afiliasi berhasil dibuat!');
            }
            setShowModal(false);
            fetchData();
        } catch (e) { toast.error(e.response?.data?.message || 'Gagal!'); }
        finally { setSaving(false); }
    };

    const handleToggle = async (id, nama, isAktif) => {
        if (!confirm(`${isAktif ? 'Nonaktifkan' : 'Aktifkan'} afiliasi ${nama}?`)) return;
        try {
            await api.patch(`/pamaba/afiliasi/${id}/toggle-status`);
            toast.success(`Afiliasi ${isAktif ? 'dinonaktifkan' : 'diaktifkan'}!`);
            fetchData();
        } catch { toast.error('Gagal!'); }
    };

    const handleRegenerateKode = async (id, nama) => {
        if (!confirm(`Generate ulang kode afiliasi ${nama}? Kode lama tidak akan berlaku!`)) return;
        try {
            await api.patch(`/pamaba/afiliasi/${id}/regenerate-kode`);
            toast.success('Kode berhasil digenerate ulang!');
            fetchData();
            if (detailItem?.id === id) fetchDetail(id);
        } catch { toast.error('Gagal!'); }
    };

    const handleCopy = (kode) => {
        navigator.clipboard.writeText(kode);
        setCopied(kode);
        toast.success('Kode disalin!');
        setTimeout(() => setCopied(null), 2000);
    };

    const stats = [
        { icon: Handshake, label: 'Total Afiliasi', value: data.length, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
        { icon: CheckCircle, label: 'Aktif', value: data.filter(d => d.isAktif).length, iconBg: 'bg-green-50', iconColor: 'text-green-600' },
        { icon: Users, label: 'Total Pendaftar', value: data.reduce((s, d) => s + d.totalPendaftar, 0), iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
        { icon: GraduationCap, label: 'Total Lulus', value: data.reduce((s, d) => s + d.pendaftarLulus, 0), iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
    ];

    const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400";
    const labelClass = "block text-sm font-medium text-slate-500 mb-1.5";

    return (
        <Layout title="Manajemen Afiliasi">
            <Toaster position="top-right" />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {stats.map(s => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
                            <div className={`w-9 h-9 ${s.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                                <Icon size={16} className={s.iconColor} />
                            </div>
                            <div className="text-2xl font-bold text-slate-700">{s.value}</div>
                            <div className="text-slate-400 text-sm mt-0.5">{s.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Filter & Aksi */}
            <div className="flex gap-2 mb-5">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Cari nama, kode, atau email..."
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
                </div>
                <button onClick={() => handleOpen()}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap">
                    <Plus size={15} /> Tambah Afiliasi
                </button>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Handshake size={28} className="text-slate-300" />
                    </div>
                    <div className="text-slate-500 font-medium">Belum ada afiliasi</div>
                    <p className="text-slate-400 text-sm mt-1">Tambahkan agen afiliasi pertama</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(item => (
                        <div key={item.id} className={`bg-white border rounded-2xl p-5 transition ${item.isAktif ? 'border-slate-200' : 'border-slate-200 opacity-60'}`}>
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                                        {item.nama?.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-700">{item.nama}</div>
                                        <div className="text-xs text-slate-400">{item.email || '-'}</div>
                                    </div>
                                </div>
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${item.isAktif ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                    {item.isAktif ? 'Aktif' : 'Nonaktif'}
                                </span>
                            </div>

                            {/* Kode */}
                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 mb-3 flex items-center justify-between">
                                <div>
                                    <div className="text-xs text-indigo-400 mb-0.5">Kode Afiliasi</div>
                                    <div className="font-mono font-bold text-indigo-700 text-lg tracking-widest">
                                        {item.kodeAfiliasi}
                                    </div>
                                </div>
                                <button onClick={() => handleCopy(item.kodeAfiliasi)}
                                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition ${copied === item.kodeAfiliasi ? 'bg-green-500 text-white' : 'bg-indigo-200 text-indigo-700 hover:bg-indigo-300'}`}>
                                    {copied === item.kodeAfiliasi ? <><Check size={11} /> Disalin</> : <><Copy size={11} /> Salin</>}
                                </button>
                            </div>

                            {/* Mini Stats */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {[
                                    { label: 'Pendaftar', value: item.totalPendaftar, color: 'text-blue-600' },
                                    { label: 'Lulus', value: item.pendaftarLulus, color: 'text-green-600' },
                                    { label: 'Gugur', value: item.pendaftarGugur, color: 'text-red-500' },
                                ].map(s => (
                                    <div key={s.label} className="bg-slate-50 rounded-xl py-2 text-center">
                                        <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                                        <div className="text-xs text-slate-400">{s.label}</div>
                                    </div>
                                ))}
                            </div>

                            {item.telepon && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                                    <Phone size={11} /> {item.telepon}
                                </div>
                            )}

                            {/* Aksi */}
                            <div className="grid grid-cols-2 gap-1.5">
                                <button onClick={() => fetchDetail(item.id)}
                                    className="flex items-center justify-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-xl font-medium transition">
                                    <Info size={12} /> Detail
                                </button>
                                <button onClick={() => handleOpen(item)}
                                    className="flex items-center justify-center gap-1.5 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-2 rounded-xl font-medium transition">
                                    <Edit2 size={12} /> Edit
                                </button>
                                <button onClick={() => handleRegenerateKode(item.id, item.nama)}
                                    className="flex items-center justify-center gap-1.5 text-xs bg-amber-50 hover:bg-amber-100 text-amber-600 py-2 rounded-xl font-medium transition">
                                    <RefreshCw size={12} /> Regen Kode
                                </button>
                                <button onClick={() => handleToggle(item.id, item.nama, item.isAktif)}
                                    className={`flex items-center justify-center gap-1.5 text-xs py-2 rounded-xl font-medium transition ${item.isAktif ? 'bg-red-50 hover:bg-red-100 text-red-500' : 'bg-green-50 hover:bg-green-100 text-green-600'}`}>
                                    {item.isAktif ? <><ToggleLeft size={12} /> Nonaktifkan</> : <><ToggleRight size={12} /> Aktifkan</>}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Form */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-5 border-b">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
                                    <Handshake size={16} className="text-indigo-600" />
                                </div>
                                <h2 className="font-bold text-slate-700">{editId ? 'Edit Afiliasi' : 'Tambah Afiliasi'}</h2>
                            </div>
                            <button onClick={() => setShowModal(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className={labelClass}>Nama *</label>
                                <input type="text" value={form.nama}
                                    onChange={e => setForm({ ...form, nama: e.target.value })}
                                    className={inputClass} placeholder="Nama agen/referral" />
                            </div>
                            <div>
                                <label className={labelClass}>Email</label>
                                <input type="email" value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    className={inputClass} placeholder="email@gmail.com" />
                            </div>
                            <div>
                                <label className={labelClass}>Telepon</label>
                                <input type="text" value={form.telepon}
                                    onChange={e => setForm({ ...form, telepon: e.target.value })}
                                    className={inputClass} placeholder="08xxxxxxxxxx" />
                            </div>
                            {!editId && (
                                <div className="flex items-start gap-2.5 bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                                    <Info size={14} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-indigo-600">Kode afiliasi akan digenerate otomatis berdasarkan nama.</p>
                                </div>
                            )}
                        </div>
                        <div className="p-5 border-t flex gap-3">
                            <button onClick={() => setShowModal(false)}
                                className="flex-1 border border-slate-200 text-slate-500 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition">
                                Batal
                            </button>
                            <button onClick={handleSave} disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition">
                                {saving ? <><RefreshCw size={14} className="animate-spin" /> Menyimpan...</> : <><Save size={14} /> Simpan</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Detail */}
            {showDetail && detailItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
                            <h2 className="font-bold text-slate-700">Detail Afiliasi</h2>
                            <button onClick={() => setShowDetail(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-5">
                            {/* Info */}
                            <div className="flex items-center gap-4 mb-5 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-2xl flex-shrink-0">
                                    {detailItem.nama?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-slate-700 text-lg">{detailItem.nama}</div>
                                    <div className="flex flex-wrap gap-3 mt-1">
                                        {detailItem.email && (
                                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                                <Mail size={11} /> {detailItem.email}
                                            </span>
                                        )}
                                        {detailItem.telepon && (
                                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                                <Phone size={11} /> {detailItem.telepon}
                                            </span>
                                        )}
                                    </div>
                                    <div className="font-mono font-bold text-indigo-600 text-lg tracking-widest mt-1">
                                        {detailItem.kodeAfiliasi}
                                    </div>
                                </div>
                            </div>

                            {/* Daftar Pendaftar */}
                            <div className="font-semibold text-slate-600 mb-3 text-sm">
                                Daftar Pendaftar ({detailItem.pendaftar?.length || 0})
                            </div>
                            {detailItem.pendaftar?.length === 0 ? (
                                <div className="text-center py-10 bg-slate-50 rounded-2xl">
                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                                        <Users size={20} className="text-slate-300" />
                                    </div>
                                    <div className="text-slate-400 text-sm">Belum ada pendaftar dengan kode ini</div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {detailItem.pendaftar?.map((p, i) => (
                                        <div key={p.id} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-slate-400 w-5">{i + 1}.</span>
                                                <div>
                                                    <div className="font-medium text-slate-700 text-sm">{p.nama}</div>
                                                    <div className="text-xs text-slate-400">{p.prodi?.nama} · {p.gelombang?.nama || '-'}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${STATUS_COLOR[p.status]}`}>
                                                    {p.status}
                                                </span>
                                                <div className="text-xs text-slate-300 mt-1">
                                                    {new Date(p.createdAt).toLocaleDateString('id-ID')}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-5 border-t flex justify-between">
                            <button onClick={() => setShowDetail(false)}
                                className="border border-slate-200 text-slate-500 px-5 py-2 rounded-xl text-sm hover:bg-slate-50 transition">
                                Tutup
                            </button>
                            <button onClick={() => handleCopy(detailItem.kodeAfiliasi)}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition">
                                {copied === detailItem.kodeAfiliasi ? <><Check size={14} /> Disalin</> : <><Copy size={14} /> Salin Kode</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}