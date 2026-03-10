import { useState, useEffect } from 'react';
import Layout from '@/components/layouts/Layout';
import api from '@/utils/api';
import { useRole } from '@/utils/useRole';
import toast, { Toaster } from 'react-hot-toast';
import { School, Plus, Pencil, Trash2, X, Save, Hash, GraduationCap, Users, UserCheck } from 'lucide-react';

const JENJANG_COLOR = {
    S1: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    S2: 'bg-purple-50 text-purple-700 border-purple-200',
    S3: 'bg-pink-50 text-pink-700 border-pink-200',
    D3: 'bg-blue-50 text-blue-700 border-blue-200',
    D4: 'bg-cyan-50 text-cyan-700 border-cyan-200',
};

export default function ProdiPage() {
    const { isReadOnly } = useRole();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ kode: '', kodeNim: '', nama: '', jenjang: 'S1' });

    const fetchData = async () => {
        try {
            const res = await api.get('/prodi');
            setData(res.data.data);
        } catch {
            toast.error('Gagal ambil data!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleOpen = (item = null) => {
        setEditData(item);
        setForm(item
            ? { kode: item.kode, kodeNim: item.kodeNim || '', nama: item.nama, jenjang: item.jenjang }
            : { kode: '', kodeNim: '', nama: '', jenjang: 'S1' }
        );
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!form.kode || !form.nama || !form.kodeNim) { toast.error('Semua field wajib diisi!'); return; }
        setSaving(true);
        try {
            if (editData) {
                await api.put(`/prodi/${editData.id}`, form);
                toast.success('Prodi berhasil diupdate!');
            } else {
                await api.post('/prodi', form);
                toast.success('Prodi berhasil ditambahkan!');
            }
            setShowModal(false);
            fetchData();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Gagal simpan!');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, nama) => {
        if (!confirm(`Yakin hapus prodi ${nama}?`)) return;
        try {
            await api.delete(`/prodi/${id}`);
            toast.success('Prodi berhasil dihapus!');
            fetchData();
        } catch {
            toast.error('Gagal hapus! Pastikan tidak ada data terkait.');
        }
    };

    const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition";
    const labelClass = "block text-sm font-medium text-slate-600 mb-1.5";

    // Group by jenjang
    const grouped = ['S1', 'S2', 'S3', 'D3', 'D4'].map(j => ({
        jenjang: j,
        items: data.filter(d => d.jenjang === j)
    })).filter(g => g.items.length > 0);

    return (
        <Layout title="Program Studi">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-slate-400">{data.length} program studi terdaftar</p>
                {!isReadOnly && (<button onClick={() => handleOpen()}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition">
                    <Plus size={16} />
                    Tambah Prodi
                </button>)}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
            ) : data.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <School size={28} className="text-slate-400" />
                    </div>
                    <div className="text-slate-500 font-medium">Belum ada program studi</div>
                </div>
            ) : (
                <div className="space-y-6">
                    {grouped.map(({ jenjang, items }) => (
                        <div key={jenjang}>
                            {/* Group Header */}
                            <div className="flex items-center gap-2 mb-3">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${JENJANG_COLOR[jenjang]}`}>
                                    {jenjang}
                                </span>
                                <span className="text-xs text-slate-400">{items.length} prodi</span>
                            </div>

                            {/* Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {items.map(item => (
                                    <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-slate-300 transition-all duration-200">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <School size={20} className="text-indigo-600" />
                                            </div>
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${JENJANG_COLOR[item.jenjang]}`}>
                                                {item.jenjang}
                                            </span>
                                        </div>

                                        <div className="mb-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-mono text-xs text-indigo-500 font-bold">{item.kode}</span>
                                                <span className="text-slate-300">·</span>
                                                <span className="font-mono text-xs text-slate-400">NIM: {item.kodeNim}</span>
                                            </div>
                                            <div className="font-semibold text-slate-800 leading-snug">{item.nama}</div>
                                            {item.fakultas && (
                                                <div className="text-xs text-slate-400 mt-1">{item.fakultas.nama}</div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                                            <div className="flex items-center gap-1.5">
                                                <Users size={12} />
                                                <span>{item._count?.mahasiswa || 0} Mahasiswa</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <UserCheck size={12} />
                                                <span>{item._count?.dosen || 0} Dosen</span>
                                            </div>
                                        </div>

                                        {!isReadOnly &&(<div className="flex gap-2 pt-4 border-t border-slate-100">
                                            <button onClick={() => handleOpen(item)}
                                                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 py-2 rounded-xl hover:bg-indigo-50 transition">
                                                <Pencil size={12} />
                                                Edit
                                            </button>
                                            <button onClick={() => handleDelete(item.id, item.nama)}
                                                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-red-500 border border-red-200 py-2 rounded-xl hover:bg-red-50 transition">
                                                <Trash2 size={12} />
                                                Hapus
                                            </button>
                                        </div>)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-5 border-b">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
                                    <School size={17} className="text-indigo-600" />
                                </div>
                                <h2 className="font-bold text-slate-800">
                                    {editData ? 'Edit Program Studi' : 'Tambah Program Studi'}
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
                                    <label className={labelClass}>Kode Prodi</label>
                                    <div className="relative">
                                        <Hash size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input type="text" value={form.kode}
                                            onChange={e => setForm({ ...form, kode: e.target.value.toUpperCase() })}
                                            disabled={!!editData}
                                            className={`${inputClass} pl-9 ${editData ? 'opacity-60 cursor-not-allowed' : ''}`}
                                            placeholder="TI" />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Kode NIM</label>
                                    <div className="relative">
                                        <Hash size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input type="text" value={form.kodeNim}
                                            onChange={e => setForm({ ...form, kodeNim: e.target.value })}
                                            className={`${inputClass} pl-9`}
                                            placeholder="11" maxLength={2} />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">2 digit untuk NIM</p>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Nama Program Studi</label>
                                <div className="relative">
                                    <School size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="text" value={form.nama}
                                        onChange={e => setForm({ ...form, nama: e.target.value })}
                                        className={`${inputClass} pl-9`}
                                        placeholder="Teknik Informatika" />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Jenjang</label>
                                <div className="relative">
                                    <GraduationCap size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <select value={form.jenjang}
                                        onChange={e => setForm({ ...form, jenjang: e.target.value })}
                                        className={`${inputClass} pl-9`}>
                                        {['S1', 'S2', 'S3', 'D3', 'D4'].map(j => (
                                            <option key={j} value={j}>{j}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 border-t flex gap-3">
                            <button onClick={() => setShowModal(false)}
                                className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition">
                                Batal
                            </button>
                            <button onClick={handleSubmit} disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition">
                                {saving ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</>
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