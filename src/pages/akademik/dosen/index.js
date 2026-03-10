import { useState, useEffect } from 'react';
import Layout from '@/components/layouts/Layout';
import api from '@/utils/api';
import { useRole } from '@/utils/useRole';
import toast, { Toaster } from 'react-hot-toast';
import {
    Search, Plus, Pencil, Trash2, X, Save,
    RefreshCw, UserCheck, UserX, GraduationCap,
    Phone, Mail, Hash, BookOpen
} from 'lucide-react';

const FORM_INIT = {
    nidn: '', nama: '', email: '', telepon: '',
    jabatan: '', pendidikanTerakhir: '', prodiId: '', password: ''
};

const PENDIDIKAN_COLOR = {
    S1: 'bg-blue-50 text-blue-700 border-blue-200',
    S2: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    S3: 'bg-purple-50 text-purple-700 border-purple-200',
};

export default function DosenPage() {
    const { isReadOnly } = useRole();
    const [data, setData] = useState([]);
    const [prodi, setProdi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(FORM_INIT);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        try {
            const [dosenRes, prodiRes] = await Promise.all([
                api.get('/akademik/dosen'),
                api.get('/prodi')
            ]);
            setData(dosenRes.data.data);
            setProdi(prodiRes.data.data);
        } catch { toast.error('Gagal ambil data!'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const filtered = data.filter(d =>
        d.nama?.toLowerCase().includes(search.toLowerCase()) ||
        d.nidn?.toLowerCase().includes(search.toLowerCase()) ||
        d.email?.toLowerCase().includes(search.toLowerCase())
    );

    const handleOpen = (item = null) => {
        if (item) {
            setForm({
                nidn: item.nidn, nama: item.nama, email: item.email,
                telepon: item.telepon || '', jabatan: item.jabatan || '',
                pendidikanTerakhir: item.pendidikanTerakhir || '',
                prodiId: item.prodiId || '', password: ''
            });
            setEditId(item.id);
        } else {
            setForm(FORM_INIT);
            setEditId(null);
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.nidn || !form.nama || !form.email) {
            toast.error('NIDN, nama, dan email wajib diisi!'); return;
        }
        setSaving(true);
        try {
            if (editId) {
                await api.put(`/akademik/dosen/${editId}`, form);
                toast.success('Dosen berhasil diupdate!');
            } else {
                await api.post('/akademik/dosen', form);
                toast.success('Dosen berhasil ditambahkan!');
            }
            setShowModal(false);
            fetchData();
        } catch (e) { toast.error(e.response?.data?.message || 'Gagal!'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id, nama) => {
        if (!confirm(`Hapus dosen ${nama}?`)) return;
        try {
            await api.delete(`/akademik/dosen/${id}`);
            toast.success('Dosen berhasil dihapus!');
            fetchData();
        } catch { toast.error('Gagal hapus!'); }
    };

    const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition";
    const labelClass = "block text-sm font-medium text-slate-600 mb-1.5";

    const stats = {
        total: data.length,
        aktif: data.filter(d => d.isAktif).length,
        nonaktif: data.filter(d => !d.isAktif).length,
    };

    return (
        <Layout title="Manajemen Dosen">
            <Toaster position="top-right" />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                    { icon: GraduationCap, label: 'Total Dosen',  value: stats.total,    iconBg: 'bg-indigo-50',  iconColor: 'text-indigo-600' },
                    { icon: UserCheck,     label: 'Aktif',        value: stats.aktif,    iconBg: 'bg-green-50',   iconColor: 'text-green-600' },
                    { icon: UserX,         label: 'Nonaktif',     value: stats.nonaktif, iconBg: 'bg-red-50',     iconColor: 'text-red-500' },
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

            {/* Filter & Aksi */}
            <div className="flex flex-col sm:flex-row gap-2 mb-5">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Cari nama, NIDN, atau email..."
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
                </div>
                {!isReadOnly && (<button onClick={() => handleOpen()}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition whitespace-nowrap">
                    <Plus size={16} />
                    Tambah Dosen
                </button>)}
            </div>

            {/* Tabel Desktop */}
            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    {['NIDN', 'Nama', 'Jabatan', 'Pendidikan', 'Prodi', 'Status', ...(!isReadOnly ? ['Aksi'] : [])].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12">
                                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                                <GraduationCap size={24} className="text-slate-400" />
                                            </div>
                                            <div className="text-slate-400 text-sm">Tidak ada data dosen</div>
                                        </td>
                                    </tr>
                                ) : filtered.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-mono text-xs text-indigo-600 font-bold">{item.nidn}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-700 text-sm">{item.nama}</div>
                                            <div className="text-xs text-slate-400">{item.email}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-500">{item.jabatan || '-'}</td>
                                        <td className="px-4 py-3">
                                            {item.pendidikanTerakhir ? (
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${PENDIDIKAN_COLOR[item.pendidikanTerakhir] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                    {item.pendidikanTerakhir}
                                                </span>
                                            ) : <span className="text-slate-400 text-sm">-</span>}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-500">{item.prodi?.nama || '-'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${item.isAktif ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${item.isAktif ? 'bg-green-500' : 'bg-red-400'}`} />
                                                {item.isAktif ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {!isReadOnly &&(<div className="flex gap-1.5">
                                                <button onClick={() => handleOpen(item)}
                                                    className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition" title="Edit">
                                                    <Pencil size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(item.id, item.nama)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="Hapus">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {filtered.length === 0 ? (
                            <div className="p-12 text-center text-slate-400 text-sm">Tidak ada data dosen</div>
                        ) : filtered.map(item => (
                            <div key={item.id} className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-slate-700 text-sm">{item.nama}</div>
                                        <div className="font-mono text-xs text-indigo-600 mt-0.5">{item.nidn}</div>
                                        <div className="text-xs text-slate-400 mt-0.5">{item.email}</div>
                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                            {item.jabatan && (
                                                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">{item.jabatan}</span>
                                            )}
                                            {item.pendidikanTerakhir && (
                                                <span className={`text-xs px-2 py-0.5 rounded-full border ${PENDIDIKAN_COLOR[item.pendidikanTerakhir] || ''}`}>
                                                    {item.pendidikanTerakhir}
                                                </span>
                                            )}
                                            <span className={`text-xs px-2 py-0.5 rounded-full border ${item.isAktif ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                                {item.isAktif ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5 flex-shrink-0">
                                        <button onClick={() => handleOpen(item)}
                                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition">
                                            <Pencil size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(item.id, item.nama)}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
                                    <GraduationCap size={17} className="text-indigo-600" />
                                </div>
                                <h2 className="font-bold text-slate-800">{editId ? 'Edit Dosen' : 'Tambah Dosen'}</h2>
                            </div>
                            <button onClick={() => setShowModal(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>NIDN *</label>
                                    <div className="relative">
                                        <Hash size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input type="text" value={form.nidn}
                                            onChange={e => setForm({ ...form, nidn: e.target.value })}
                                            className={`${inputClass} pl-9`} placeholder="Nomor Induk Dosen" />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Jabatan</label>
                                    <select value={form.jabatan}
                                        onChange={e => setForm({ ...form, jabatan: e.target.value })}
                                        className={inputClass}>
                                        <option value="">-- Pilih --</option>
                                        {['Asisten Ahli', 'Lektor', 'Lektor Kepala', 'Guru Besar', 'Dosen Tetap', 'Dosen Tidak Tetap'].map(j => (
                                            <option key={j} value={j}>{j}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Nama Lengkap *</label>
                                <div className="relative">
                                    <GraduationCap size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="text" value={form.nama}
                                        onChange={e => setForm({ ...form, nama: e.target.value })}
                                        className={`${inputClass} pl-9`} placeholder="Nama lengkap dengan gelar" />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Email *</label>
                                <div className="relative">
                                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="email" value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        className={`${inputClass} pl-9`} placeholder="email@kampus.ac.id" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Telepon</label>
                                    <div className="relative">
                                        <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input type="text" value={form.telepon}
                                            onChange={e => setForm({ ...form, telepon: e.target.value })}
                                            className={`${inputClass} pl-9`} placeholder="08xxxxxxxxxx" />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Pendidikan Terakhir</label>
                                    <select value={form.pendidikanTerakhir}
                                        onChange={e => setForm({ ...form, pendidikanTerakhir: e.target.value })}
                                        className={inputClass}>
                                        <option value="">-- Pilih --</option>
                                        {['S1', 'S2', 'S3'].map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Program Studi</label>
                                <div className="relative">
                                    <BookOpen size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <select value={form.prodiId}
                                        onChange={e => setForm({ ...form, prodiId: e.target.value })}
                                        className={`${inputClass} pl-9`}>
                                        <option value="">-- Semua Prodi --</option>
                                        {prodi.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                                    </select>
                                </div>
                            </div>

                            {!editId && (
                                <div>
                                    <label className={labelClass}>Password Akun</label>
                                    <input type="password" value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        className={inputClass} placeholder="Kosongkan untuk password default" />
                                    <p className="text-xs text-slate-400 mt-1">Default: dosen123</p>
                                </div>
                            )}
                        </div>

                        <div className="p-5 border-t flex gap-3">
                            <button onClick={() => setShowModal(false)}
                                className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition">
                                Batal
                            </button>
                            <button onClick={handleSave} disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition">
                                {saving ? (
                                    <><RefreshCw size={14} className="animate-spin" /> Menyimpan...</>
                                ) : (
                                    <><Save size={14} /> Simpan</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}