import { useState, useEffect } from 'react';
import Layout from '@/components/layouts/Layout';
import api from '@/utils/api';
import toast, { Toaster } from 'react-hot-toast';
import {
    Search, Filter, Users, CheckCircle, XCircle,
    Eye, Edit2, KeyRound, ToggleLeft, ToggleRight,
    Trash2, X, Save, RefreshCw, Plus, ShieldCheck
} from 'lucide-react';

const ALL_ROLES = [
    { value: 'SUPER_ADMIN', label: 'Super Admin', className: 'bg-red-50 text-red-600 border-red-200' },
    { value: 'ADMIN', label: 'Admin', className: 'bg-orange-50 text-orange-600 border-orange-200' },
    { value: 'AKADEMIK', label: 'Akademik', className: 'bg-blue-50 text-blue-600 border-blue-200' },
    { value: 'KEUANGAN', label: 'Keuangan', className: 'bg-green-50 text-green-600 border-green-200' },
    { value: 'KAPRODI', label: 'Kaprodi', className: 'bg-purple-50 text-purple-600 border-purple-200' },
    { value: 'DOSEN', label: 'Dosen', className: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
    { value: 'MAHASISWA', label: 'Mahasiswa', className: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
    { value: 'PAMABA', label: 'PAMABA', className: 'bg-amber-50 text-amber-600 border-amber-200' },
];

const FORM_INIT = { nama: '', email: '', password: '', roles: [], status: true };

const getRoleConfig = (role) => ALL_ROLES.find(r => r.value === role) || { label: role, className: 'bg-slate-100 text-slate-600 border-slate-200' };

export default function UsersPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(FORM_INIT);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetTarget, setResetTarget] = useState(null);
    const [passwordBaru, setPasswordBaru] = useState('');
    const [resetting, setResetting] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailItem, setDetailItem] = useState(null);

    const fetchData = async () => {
        try {
            const res = await api.get('/pengaturan/users');
            setData(res.data.data);
        } catch { toast.error('Gagal ambil data!'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const filtered = data.filter(d => {
        const matchSearch =
            d.nama?.toLowerCase().includes(search.toLowerCase()) ||
            d.email?.toLowerCase().includes(search.toLowerCase());
        const matchRole = filterRole ? d.roles?.some(r => r.role === filterRole) : true;
        const matchStatus = filterStatus !== '' ? String(d.status) === filterStatus : true;
        return matchSearch && matchRole && matchStatus;
    });

    const handleOpen = (item = null) => {
        if (item) {
            setForm({ nama: item.nama, email: item.email, password: '', roles: item.roles?.map(r => r.role) || [], status: item.status });
            setEditId(item.id);
        } else {
            setForm(FORM_INIT);
            setEditId(null);
        }
        setShowModal(true);
    };

    const toggleFormRole = (role) => {
        setForm(f => ({
            ...f,
            roles: f.roles.includes(role) ? f.roles.filter(r => r !== role) : [...f.roles, role]
        }));
    };

    const handleSave = async () => {
        if (!form.nama || !form.email) { toast.error('Nama dan email wajib diisi!'); return; }
        if (!editId && !form.password) { toast.error('Password wajib diisi!'); return; }
        if (form.roles.length === 0) { toast.error('Pilih minimal 1 role!'); return; }
        setSaving(true);
        try {
            if (editId) {
                await api.put(`/pengaturan/users/${editId}`, form);
                toast.success('User berhasil diupdate!');
            } else {
                await api.post('/pengaturan/users', form);
                toast.success('User berhasil dibuat!');
            }
            setShowModal(false);
            fetchData();
        } catch (e) { toast.error(e.response?.data?.message || 'Gagal!'); }
        finally { setSaving(false); }
    };

    const handleToggleStatus = async (id, nama, status) => {
        if (!confirm(`${status ? 'Nonaktifkan' : 'Aktifkan'} user ${nama}?`)) return;
        try {
            await api.patch(`/pengaturan/users/${id}/toggle-status`);
            toast.success(`User ${status ? 'dinonaktifkan' : 'diaktifkan'}!`);
            fetchData();
        } catch { toast.error('Gagal!'); }
    };

    const handleDelete = async (id, nama) => {
        if (!confirm(`Hapus user ${nama}? Tindakan ini tidak dapat dibatalkan!`)) return;
        try {
            await api.delete(`/pengaturan/users/${id}`);
            toast.success('User berhasil dihapus!');
            fetchData();
        } catch (e) { toast.error(e.response?.data?.message || 'Gagal hapus!'); }
    };

    const handleResetPassword = async () => {
        if (!passwordBaru || passwordBaru.length < 8) { toast.error('Password minimal 8 karakter!'); return; }
        setResetting(true);
        try {
            await api.patch(`/pengaturan/users/${resetTarget.id}/reset-password`, { passwordBaru });
            toast.success('Password berhasil direset!');
            setShowResetModal(false);
            setPasswordBaru('');
        } catch (e) { toast.error(e.response?.data?.message || 'Gagal!'); }
        finally { setResetting(false); }
    };

    const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400";
    const labelClass = "block text-sm font-medium text-slate-500 mb-1.5";

    const stats = [
        { icon: Users, label: 'Total User', value: data.length, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
        { icon: CheckCircle, label: 'Aktif', value: data.filter(d => d.status).length, iconBg: 'bg-green-50', iconColor: 'text-green-600' },
        { icon: XCircle, label: 'Nonaktif', value: data.filter(d => !d.status).length, iconBg: 'bg-red-50', iconColor: 'text-red-500' },
    ];

    return (
        <Layout title="Manajemen User">
            <Toaster position="top-right" />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
                {stats.map(s => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
                            <div className={`w-9 h-9 ${s.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                                <Icon size={17} className={s.iconColor} />
                            </div>
                            <div className="text-2xl font-bold text-slate-700">{s.value}</div>
                            <div className="text-slate-400 text-sm mt-0.5">{s.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Filter & Aksi */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Cari nama atau email..."
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
                </div>
                <div className="relative">
                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                        className="pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 bg-white appearance-none">
                        <option value="">Semua Role</option>
                        {ALL_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                </div>
                <div className="relative">
                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                        className="pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 bg-white appearance-none">
                        <option value="">Semua Status</option>
                        <option value="true">Aktif</option>
                        <option value="false">Nonaktif</option>
                    </select>
                </div>
                <button onClick={() => handleOpen()}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap">
                    <Plus size={15} /> Tambah User
                </button>
            </div>

            {/* Tabel */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                {/* Desktop */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                {['Nama', 'Email', 'Role', 'Status', 'Dibuat', 'Aksi'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                                    <div className="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2" />
                                    Memuat data...
                                </td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm">Tidak ada data</td></tr>
                            ) : filtered.map(item => (
                                <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${!item.status ? 'opacity-50' : ''}`}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                                                {item.nama?.charAt(0)}
                                            </div>
                                            <div className="font-medium text-slate-700 text-sm">{item.nama}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-500">{item.email}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {item.roles?.map(r => {
                                                const cfg = getRoleConfig(r.role);
                                                return (
                                                    <span key={r.id} className={`text-xs px-2 py-0.5 rounded-full font-medium border ${cfg.className}`}>
                                                        {cfg.label}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${item.status ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-500 border-red-200'}`}>
                                            {item.status ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                            {item.status ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-400">
                                        {new Date(item.createdAt).toLocaleDateString('id-ID')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            <button onClick={() => { setDetailItem(item); setShowDetailModal(true); }}
                                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Detail">
                                                <Eye size={13} />
                                            </button>
                                            <button onClick={() => handleOpen(item)}
                                                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition" title="Edit">
                                                <Edit2 size={13} />
                                            </button>
                                            <button onClick={() => { setResetTarget(item); setShowResetModal(true); }}
                                                className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition" title="Reset Password">
                                                <KeyRound size={13} />
                                            </button>
                                            <button onClick={() => handleToggleStatus(item.id, item.nama, item.status)}
                                                className={`p-1.5 rounded-lg transition ${item.status ? 'text-yellow-500 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'}`} title={item.status ? 'Nonaktifkan' : 'Aktifkan'}>
                                                {item.status ? <ToggleLeft size={13} /> : <ToggleRight size={13} />}
                                            </button>
                                            <button onClick={() => handleDelete(item.id, item.nama)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="Hapus">
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile */}
                <div className="md:hidden divide-y divide-slate-100">
                    {loading ? (
                        <div className="py-12 text-center">
                            <div className="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 text-sm">Tidak ada data</div>
                    ) : filtered.map(item => (
                        <div key={item.id} className={`p-4 ${!item.status ? 'opacity-50' : ''}`}>
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                                        {item.nama?.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-700 text-sm">{item.nama}</div>
                                        <div className="text-xs text-slate-400">{item.email}</div>
                                    </div>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium border flex-shrink-0 ${item.status ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-500 border-red-200'}`}>
                                    {item.status ? 'Aktif' : 'Nonaktif'}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-3">
                                {item.roles?.map(r => {
                                    const cfg = getRoleConfig(r.role);
                                    return (
                                        <span key={r.id} className={`text-xs px-2 py-0.5 rounded-full font-medium border ${cfg.className}`}>
                                            {cfg.label}
                                        </span>
                                    );
                                })}
                            </div>
                            <div className="flex gap-1.5">
                                <button onClick={() => { setDetailItem(item); setShowDetailModal(true); }}
                                    className="p-1.5 text-indigo-600 border border-indigo-200 rounded-lg">
                                    <Eye size={13} />
                                </button>
                                <button onClick={() => handleOpen(item)}
                                    className="p-1.5 text-slate-600 border border-slate-200 rounded-lg">
                                    <Edit2 size={13} />
                                </button>
                                <button onClick={() => { setResetTarget(item); setShowResetModal(true); }}
                                    className="p-1.5 text-amber-500 border border-amber-200 rounded-lg">
                                    <KeyRound size={13} />
                                </button>
                                <button onClick={() => handleToggleStatus(item.id, item.nama, item.status)}
                                    className="p-1.5 text-yellow-500 border border-yellow-200 rounded-lg">
                                    {item.status ? <ToggleLeft size={13} /> : <ToggleRight size={13} />}
                                </button>
                                <button onClick={() => handleDelete(item.id, item.nama)}
                                    className="p-1.5 text-red-500 border border-red-200 rounded-lg">
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal Form User */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
                                    <Users size={16} className="text-indigo-600" />
                                </div>
                                <h2 className="font-bold text-slate-700">{editId ? 'Edit User' : 'Tambah User'}</h2>
                            </div>
                            <button onClick={() => setShowModal(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className={labelClass}>Nama Lengkap *</label>
                                <input type="text" value={form.nama}
                                    onChange={e => setForm({ ...form, nama: e.target.value })}
                                    className={inputClass} placeholder="Nama lengkap" />
                            </div>
                            <div>
                                <label className={labelClass}>Email *</label>
                                <input type="email" value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    className={inputClass} placeholder="email@kampus.ac.id" />
                            </div>
                            {!editId && (
                                <div>
                                    <label className={labelClass}>Password *</label>
                                    <input type="password" value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        className={inputClass} placeholder="Minimal 8 karakter" />
                                </div>
                            )}
                            <div>
                                <label className={labelClass}>Role *</label>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    {ALL_ROLES.map(r => (
                                        <div key={r.value} onClick={() => toggleFormRole(r.value)}
                                            className={`flex items-center gap-2 border-2 rounded-xl px-3 py-2 cursor-pointer transition ${
                                                form.roles.includes(r.value)
                                                    ? 'border-indigo-400 bg-indigo-50'
                                                    : 'border-slate-200 hover:border-indigo-200'
                                            }`}>
                                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                                form.roles.includes(r.value) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300'
                                            }`}>
                                                {form.roles.includes(r.value) && <CheckCircle size={10} className="text-white" />}
                                            </div>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${r.className}`}>{r.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {editId && (
                                <div className="flex items-center gap-3">
                                    <span className={labelClass + ' mb-0'}>Status</span>
                                    <button type="button" onClick={() => setForm({ ...form, status: !form.status })}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${form.status ? 'bg-green-500' : 'bg-slate-300'}`}>
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${form.status ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                    <span className="text-sm text-slate-500">{form.status ? 'Aktif' : 'Nonaktif'}</span>
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

            {/* Modal Reset Password */}
            {showResetModal && resetTarget && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-5 border-b">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                                    <KeyRound size={16} className="text-amber-500" />
                                </div>
                                <h2 className="font-bold text-slate-700">Reset Password</h2>
                            </div>
                            <button onClick={() => setShowResetModal(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                <div className="font-semibold text-slate-700">{resetTarget.nama}</div>
                                <div className="text-sm text-slate-400">{resetTarget.email}</div>
                            </div>
                            <div>
                                <label className={labelClass}>Password Baru *</label>
                                <input type="password" value={passwordBaru}
                                    onChange={e => setPasswordBaru(e.target.value)}
                                    className={inputClass} placeholder="Minimal 8 karakter" />
                            </div>
                        </div>
                        <div className="p-5 border-t flex gap-3">
                            <button onClick={() => { setShowResetModal(false); setPasswordBaru(''); }}
                                className="flex-1 border border-slate-200 text-slate-500 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition">
                                Batal
                            </button>
                            <button onClick={handleResetPassword} disabled={resetting}
                                className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition">
                                {resetting ? <><RefreshCw size={14} className="animate-spin" /> Memproses...</> : <><KeyRound size={14} /> Reset Password</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Detail */}
            {showDetailModal && detailItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-5 border-b">
                            <h2 className="font-bold text-slate-700">Detail User</h2>
                            <button onClick={() => setShowDetailModal(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-5">
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-2xl flex-shrink-0">
                                    {detailItem.nama?.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-700">{detailItem.nama}</div>
                                    <div className="text-sm text-slate-400">{detailItem.email}</div>
                                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border mt-1 inline-flex items-center gap-1 ${detailItem.status ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-500 border-red-200'}`}>
                                        {detailItem.status ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                        {detailItem.status ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                                        <ShieldCheck size={11} /> Role
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {detailItem.roles?.map(r => {
                                            const cfg = getRoleConfig(r.role);
                                            return (
                                                <span key={r.id} className={`text-xs px-2.5 py-1 rounded-full font-medium border ${cfg.className}`}>
                                                    {cfg.label}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                        <div className="text-xs text-slate-400 mb-1">Dibuat</div>
                                        <div className="font-medium text-slate-600 text-sm">{new Date(detailItem.createdAt).toLocaleDateString('id-ID')}</div>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                        <div className="text-xs text-slate-400 mb-1">Terakhir Update</div>
                                        <div className="font-medium text-slate-600 text-sm">{new Date(detailItem.updatedAt).toLocaleDateString('id-ID')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-5 border-t flex justify-between">
                            <button onClick={() => { setShowDetailModal(false); handleOpen(detailItem); }}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition">
                                <Edit2 size={14} /> Edit User
                            </button>
                            <button onClick={() => setShowDetailModal(false)}
                                className="border border-slate-200 text-slate-500 px-5 py-2 rounded-xl text-sm hover:bg-slate-50 transition">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}