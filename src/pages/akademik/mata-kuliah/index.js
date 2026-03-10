import { useState, useEffect } from 'react';
import Layout from '@/components/layouts/Layout';
import api from '@/utils/api';
import { useRole } from '@/utils/useRole';
import toast, { Toaster } from 'react-hot-toast';
import {
    Search, Filter, Plus, Pencil, Trash2, X, Save,
    RefreshCw, BookOpen, Hash, GraduationCap, BookMarked
} from 'lucide-react';

const FORM_INIT = {
    kode: '', nama: '', sks: '', semester: '', prodiId: '', jenis: 'WAJIB', deskripsi: ''
};

const JENIS_STYLE = {
    WAJIB:   'bg-indigo-50 text-indigo-700 border-indigo-200',
    PILIHAN: 'bg-purple-50 text-purple-700 border-purple-200',
};

export default function MataKuliahPage() {
    const { isReadOnly } = useRole();
    const [data, setData] = useState([]);
    const [prodi, setProdi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterProdi, setFilterProdi] = useState('');
    const [filterSemester, setFilterSemester] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(FORM_INIT);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        try {
            const params = {};
            if (filterProdi) params.prodiId = filterProdi;
            if (filterSemester) params.semester = filterSemester;
            const [mkRes, prodiRes] = await Promise.all([
                api.get('/akademik/mata-kuliah', { params }),
                api.get('/prodi')
            ]);
            setData(mkRes.data.data);
            setProdi(prodiRes.data.data);
        } catch { toast.error('Gagal ambil data!'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [filterProdi, filterSemester]);

    const filtered = data.filter(d =>
        d.nama?.toLowerCase().includes(search.toLowerCase()) ||
        d.kode?.toLowerCase().includes(search.toLowerCase())
    );

    const handleOpen = (item = null) => {
        if (item) {
            setForm({
                kode: item.kode, nama: item.nama, sks: item.sks,
                semester: item.semester, prodiId: item.prodiId,
                jenis: item.jenis, deskripsi: item.deskripsi || ''
            });
            setEditId(item.id);
        } else {
            setForm(FORM_INIT);
            setEditId(null);
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        console.log('Form yang dikirim:', form);
        if (!form.kode || !form.nama || !form.sks || !form.semester || !form.prodiId) {
            toast.error('Semua field wajib diisi!'); return;
        }
        setSaving(true);
        try {
            if (editId) {
                await api.put(`/akademik/mata-kuliah/${editId}`, form);
                toast.success('Mata kuliah berhasil diupdate!');
            } else {
                await api.post('/akademik/mata-kuliah', form);
                toast.success('Mata kuliah berhasil ditambahkan!');
            }
            setShowModal(false);
            fetchData();
        } catch (e) {
            console.log('Error response:', e.response?.data); 
            toast.error(e.response?.data?.message || 'Gagal!'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id, nama) => {
        if (!confirm(`Hapus mata kuliah ${nama}?`)) return;
        try {
            await api.delete(`/akademik/mata-kuliah/${id}`);
            toast.success('Mata kuliah berhasil dihapus!');
            fetchData();
        } catch { toast.error('Gagal hapus!'); }
    };

    const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition";
    const labelClass = "block text-sm font-medium text-slate-600 mb-1.5";

    const totalSks = filtered.reduce((s, d) => s + (d.sks || 0), 0);
    const stats = {
        total: filtered.length,
        wajib: filtered.filter(d => d.jenis === 'WAJIB').length,
        pilihan: filtered.filter(d => d.jenis === 'PILIHAN').length,
        totalSks,
    };

    return (
        <Layout title="Mata Kuliah">
            <Toaster position="top-right" />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {[
                    { icon: BookOpen,   label: 'Total MK',    value: stats.total,   iconBg: 'bg-indigo-50',  iconColor: 'text-indigo-600' },
                    { icon: BookMarked, label: 'MK Wajib',    value: stats.wajib,   iconBg: 'bg-blue-50',    iconColor: 'text-blue-600' },
                    { icon: BookMarked, label: 'MK Pilihan',  value: stats.pilihan, iconBg: 'bg-purple-50',  iconColor: 'text-purple-600' },
                    { icon: Hash,       label: 'Total SKS',   value: stats.totalSks,iconBg: 'bg-green-50',   iconColor: 'text-green-600' },
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
            <div className="flex flex-col sm:flex-row gap-2 mb-5">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Cari kode atau nama mata kuliah..."
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
                </div>
                <div className="relative">
                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select value={filterProdi} onChange={e => setFilterProdi(e.target.value)}
                        className="pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none bg-white appearance-none">
                        <option value="">Semua Prodi</option>
                        {prodi.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                    </select>
                </div>
                <div className="relative">
                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select value={filterSemester} onChange={e => setFilterSemester(e.target.value)}
                        className="pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none bg-white appearance-none">
                        <option value="">Semua Semester</option>
                        {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                </div>
                {!isReadOnly && (<button onClick={() => handleOpen()}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition whitespace-nowrap">
                    <Plus size={16} />
                    Tambah MK
                </button>)}
            </div>

            {/* Tabel */}
            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    {/* Desktop */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    {['Kode', 'Nama Mata Kuliah', 'SKS', 'Semester', 'Jenis', 'Prodi', 'Status', ...(!isReadOnly ? ['Aksi'] : [])].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-12">
                                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                                <BookOpen size={24} className="text-slate-400" />
                                            </div>
                                            <div className="text-slate-400 text-sm">Tidak ada mata kuliah</div>
                                        </td>
                                    </tr>
                                ) : filtered.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-mono text-xs text-indigo-600 font-bold">{item.kode}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-700 text-sm">{item.nama}</div>
                                            {item.deskripsi && (
                                                <div className="text-xs text-slate-400 truncate max-w-xs">{item.deskripsi}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="font-bold text-indigo-600 text-sm">{item.sks}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center text-slate-600 text-sm">{item.semester}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${JENIS_STYLE[item.jenis]}`}>
                                                {item.jenis}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-500">{item.prodi?.nama}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${item.isAktif ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${item.isAktif ? 'bg-green-500' : 'bg-red-400'}`} />
                                                {item.isAktif ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        {!isReadOnly &&(<td className="px-4 py-3">
                                            <div className="flex gap-1.5">
                                                <button onClick={() => handleOpen(item)}
                                                    className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition" title="Edit">
                                                    <Pencil size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(item.id, item.nama)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="Hapus">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {filtered.length === 0 ? (
                            <div className="p-12 text-center text-slate-400 text-sm">Tidak ada mata kuliah</div>
                        ) : filtered.map(item => (
                            <div key={item.id} className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono text-xs text-indigo-600 font-bold">{item.kode}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full border ${JENIS_STYLE[item.jenis]}`}>
                                                {item.jenis}
                                            </span>
                                        </div>
                                        <div className="font-medium text-slate-700 text-sm">{item.nama}</div>
                                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                                            <span className="font-bold text-indigo-600">{item.sks} SKS</span>
                                            <span>Semester {item.semester}</span>
                                            <span>{item.prodi?.nama}</span>
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
                                    <BookOpen size={17} className="text-indigo-600" />
                                </div>
                                <h2 className="font-bold text-slate-800">
                                    {editId ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah'}
                                </h2>
                            </div>
                            <button onClick={() => setShowModal(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Kode MK *</label>
                                    <div className="relative">
                                        <Hash size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input type="text" value={form.kode}
                                            onChange={e => setForm({ ...form, kode: e.target.value.toUpperCase() })}
                                            className={`${inputClass} pl-9`} placeholder="MIF101" />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Jenis *</label>
                                    <select value={form.jenis}
                                        onChange={e => setForm({ ...form, jenis: e.target.value })}
                                        className={inputClass}>
                                        <option value="WAJIB">Wajib</option>
                                        <option value="PILIHAN">Pilihan</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Nama Mata Kuliah *</label>
                                <div className="relative">
                                    <BookOpen size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="text" value={form.nama}
                                        onChange={e => setForm({ ...form, nama: e.target.value })}
                                        className={`${inputClass} pl-9`} placeholder="Nama mata kuliah" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>SKS *</label>
                                    <select value={form.sks}
                                        onChange={e => setForm({ ...form, sks: e.target.value })}
                                        className={inputClass}>
                                        <option value="">-- Pilih --</option>
                                        {[1,2,3,4,5,6].map(s => <option key={s} value={s}>{s} SKS</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Semester *</label>
                                    <select value={form.semester}
                                        onChange={e => setForm({ ...form, semester: e.target.value })}
                                        className={inputClass}>
                                        <option value="">-- Pilih --</option>
                                        {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Program Studi *</label>
                                <div className="relative">
                                    <GraduationCap size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <select value={form.prodiId}
                                        onChange={e => setForm({ ...form, prodiId: e.target.value })}
                                        className={`${inputClass} pl-9`}>
                                        <option value="">-- Pilih Prodi --</option>
                                        {prodi.map(p => <option key={p.id} value={p.id}>{p.nama} ({p.jenjang})</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Deskripsi</label>
                                <textarea rows={2} value={form.deskripsi}
                                    onChange={e => setForm({ ...form, deskripsi: e.target.value })}
                                    className={`${inputClass} resize-none`}
                                    placeholder="Deskripsi singkat (opsional)" />
                            </div>
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