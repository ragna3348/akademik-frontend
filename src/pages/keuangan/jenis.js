import { useState, useEffect } from 'react';
import Layout from '@/components/layouts/Layout';
import api from '@/utils/api';
import toast, { Toaster } from 'react-hot-toast';
import { Database, Plus, Pencil, Trash2, X, Save, Hash, FileText, Info, ToggleLeft, ToggleRight } from 'lucide-react';

export default function MasterKeuanganPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ kode: '', nama: '', keterangan: '' });

    const fetchData = async () => {
        try {
            const res = await api.get('/keuangan/jenis');
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
        setForm(item ? { kode: item.kode, nama: item.nama, keterangan: item.keterangan || '' } : { kode: '', nama: '', keterangan: '' });
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!form.kode || !form.nama) { toast.error('Kode dan nama wajib diisi!'); return; }
        setSaving(true);
        try {
            if (editData) {
                await api.put(`/keuangan/jenis/${editData.id}`, form);
                toast.success('Jenis keuangan berhasil diupdate!');
            } else {
                await api.post('/keuangan/jenis', form);
                toast.success('Jenis keuangan berhasil ditambahkan!');
            }
            setShowModal(false);
            fetchData();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Gagal simpan!');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (id) => {
        try {
            const res = await api.patch(`/keuangan/jenis/${id}/toggle`);
            toast.success(res.data.message);
            fetchData();
        } catch {
            toast.error('Gagal update status!');
        }
    };

    const handleDelete = async (id, nama) => {
        if (!confirm(`Yakin hapus jenis keuangan "${nama}"?`)) return;
        try {
            await api.delete(`/keuangan/jenis/${id}`);
            toast.success('Jenis keuangan berhasil dihapus!');
            fetchData();
        } catch {
            toast.error('Gagal hapus!');
        }
    };

    const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition";
    const labelClass = "block text-sm font-medium text-slate-600 mb-1.5";

    return (
        <Layout title="Master Keuangan">
            <Toaster position="top-right" />

            {/* Info Banner */}
            <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-5">
                <Info size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <p className="text-emerald-700 text-sm">
                    Master Keuangan berisi jenis-jenis tagihan yang tersedia di sistem. Hanya <strong>Super Admin</strong> yang dapat menambah atau mengedit jenis keuangan ini.
                    Contoh: UPP, UKP, BPP, Biaya Wisuda, dll.
                </p>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-slate-400">{data.length} jenis keuangan terdaftar</p>
                <button onClick={() => handleOpen()}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm">
                    <Plus size={16} /> Tambah Jenis
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                </div>
            ) : data.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Database size={28} className="text-slate-400" />
                    </div>
                    <div className="text-slate-500 font-medium">Belum ada jenis keuangan</div>
                    <p className="text-sm text-slate-400 mt-1">Tambahkan jenis keuangan pertama</p>
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-5 py-3 font-semibold text-slate-600 w-10">#</th>
                                <th className="text-left px-5 py-3 font-semibold text-slate-600 w-28">Kode</th>
                                <th className="text-left px-5 py-3 font-semibold text-slate-600">Nama</th>
                                <th className="text-left px-5 py-3 font-semibold text-slate-600">Keterangan</th>
                                <th className="text-center px-5 py-3 font-semibold text-slate-600 w-24">Status</th>
                                <th className="text-center px-5 py-3 font-semibold text-slate-600 w-32">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.map((item, i) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition">
                                    <td className="px-5 py-3 text-slate-400">{i + 1}</td>
                                    <td className="px-5 py-3">
                                        <code className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-mono font-bold">{item.kode}</code>
                                    </td>
                                    <td className="px-5 py-3 font-medium text-slate-700">{item.nama}</td>
                                    <td className="px-5 py-3 text-slate-500">{item.keterangan || '-'}</td>
                                    <td className="px-5 py-3 text-center">
                                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${
                                            item.isAktif ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${item.isAktif ? 'bg-green-500' : 'bg-slate-400'}`} />
                                            {item.isAktif ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center justify-center gap-1">
                                            <button onClick={() => handleToggle(item.id)}
                                                className={`p-1.5 rounded-lg transition ${item.isAktif ? 'text-orange-500 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'}`}
                                                title={item.isAktif ? 'Nonaktifkan' : 'Aktifkan'}>
                                                {item.isAktif ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                            </button>
                                            <button onClick={() => handleOpen(item)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition" title="Edit">
                                                <Pencil size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(item.id, item.nama)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition" title="Hapus">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-5 border-b">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                                    <Database size={17} className="text-emerald-600" />
                                </div>
                                <h2 className="font-bold text-slate-800">
                                    {editData ? 'Edit Jenis Keuangan' : 'Tambah Jenis Keuangan'}
                                </h2>
                            </div>
                            <button onClick={() => setShowModal(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition"><X size={18} /></button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div>
                                <label className={labelClass}>Kode Jenis *</label>
                                <div className="relative">
                                    <Hash size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="text" value={form.kode}
                                        onChange={e => setForm({ ...form, kode: e.target.value.toUpperCase() })}
                                        className={`${inputClass} pl-9 uppercase`}
                                        placeholder="Contoh: UPP, UKP, BPP" />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Nama Keuangan Jenis *</label>
                                <div className="relative">
                                    <FileText size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="text" value={form.nama}
                                        onChange={e => setForm({ ...form, nama: e.target.value })}
                                        className={`${inputClass} pl-9`}
                                        placeholder="Contoh: Uang Pangkal Perkuliahan" />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Keterangan</label>
                                <textarea value={form.keterangan}
                                    onChange={e => setForm({ ...form, keterangan: e.target.value })}
                                    className={`${inputClass} min-h-[80px]`}
                                    placeholder="Deskripsi jenis keuangan (opsional)" rows={3} />
                            </div>
                        </div>

                        <div className="p-5 border-t flex gap-3">
                            <button onClick={() => setShowModal(false)}
                                className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition">
                                Batal
                            </button>
                            <button onClick={handleSubmit} disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition">
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
