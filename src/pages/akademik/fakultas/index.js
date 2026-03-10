import { useState, useEffect } from 'react';
import Layout from '@/components/layouts/Layout';
import api from '@/utils/api';
import { useRole } from '@/utils/useRole';
import toast, { Toaster } from 'react-hot-toast';
import { Building2, Plus, Pencil, Trash2, X, Save, Hash, BookOpen } from 'lucide-react';

export default function FakultasPage() {
    const { isReadOnly } = useRole();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [form, setForm] = useState({ nama: '', kode: '' });
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        try {
            const res = await api.get('/fakultas');
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
        setForm(item ? { nama: item.nama, kode: item.kode } : { nama: '', kode: '' });
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!form.kode || !form.nama) { toast.error('Semua field wajib diisi!'); return; }
        setSaving(true);
        try {
            if (editData) {
                await api.put(`/fakultas/${editData.id}`, form);
                toast.success('Fakultas berhasil diupdate!');
            } else {
                await api.post('/fakultas', form);
                toast.success('Fakultas berhasil ditambahkan!');
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
        if (!confirm(`Yakin hapus fakultas ${nama}?`)) return;
        try {
            await api.delete(`/fakultas/${id}`);
            toast.success('Fakultas berhasil dihapus!');
            fetchData();
        } catch {
            toast.error('Gagal hapus! Pastikan tidak ada prodi terkait.');
        }
    };

    const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition";
    const labelClass = "block text-sm font-medium text-slate-600 mb-1.5";

    return (
        <Layout title="Fakultas">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-slate-400">{data.length} fakultas terdaftar</p>
                <button onClick={() => handleOpen()}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition">
                    <Plus size={16} />
                    Tambah Fakultas
                </button>
            </div>

            {/* Grid Kartu */}
            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
            ) : data.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Building2 size={28} className="text-slate-400" />
                    </div>
                    <div className="text-slate-500 font-medium">Belum ada fakultas</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.map(item => (
                        <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-slate-300 transition-all duration-200">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Building2 size={20} className="text-indigo-600" />
                                </div>
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${item.isAktif ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                    {item.isAktif ? 'Aktif' : 'Nonaktif'}
                                </span>
                            </div>

                            <div className="mb-4">
                                <div className="font-mono text-xs text-indigo-500 font-bold mb-1">{item.kode}</div>
                                <div className="font-semibold text-slate-800 leading-snug">{item.nama}</div>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                                <BookOpen size={12} />
                                <span>{item._count?.prodi || 0} Program Studi</span>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-slate-100">
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
                                    <Building2 size={17} className="text-indigo-600" />
                                </div>
                                <h2 className="font-bold text-slate-800">
                                    {editData ? 'Edit Fakultas' : 'Tambah Fakultas'}
                                </h2>
                            </div>
                            <button onClick={() => setShowModal(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div>
                                <label className={labelClass}>Kode Fakultas</label>
                                <div className="relative">
                                    <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="text" value={form.kode}
                                        onChange={e => setForm({ ...form, kode: e.target.value.toUpperCase() })}
                                        className={`${inputClass} pl-9`}
                                        placeholder="Contoh: FTI" />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Nama Fakultas</label>
                                <div className="relative">
                                    <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="text" value={form.nama}
                                        onChange={e => setForm({ ...form, nama: e.target.value })}
                                        className={`${inputClass} pl-9`}
                                        placeholder="Contoh: Fakultas Teknologi Informasi" />
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