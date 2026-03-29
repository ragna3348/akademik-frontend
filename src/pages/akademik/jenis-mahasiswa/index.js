import { useState, useEffect } from 'react';
import Layout from '@/components/layouts/Layout';
import api from '@/utils/api';
import { useRole } from '@/utils/useRole';
import toast, { Toaster } from 'react-hot-toast';
import { LayoutGrid, Plus, Pencil, Trash2, X, Save, Hash, Info, ToggleLeft, ToggleRight } from 'lucide-react';

export default function JenisMahasiswaPage() {
    const { isReadOnly } = useRole();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ nama: '', kodeAngka: '' });

    const fetchData = async () => {
        try {
            const res = await api.get('/jenis-mahasiswa');
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
        setForm(item ? { nama: item.nama, kodeAngka: item.kodeAngka } : { nama: '', kodeAngka: '' });
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!form.nama || form.kodeAngka === '') { toast.error('Semua field wajib diisi!'); return; }
        setSaving(true);
        try {
            if (editData) {
                await api.put(`/jenis-mahasiswa/${editData.id}`, form);
                toast.success('Jenis mahasiswa berhasil diupdate!');
            } else {
                await api.post('/jenis-mahasiswa', form);
                toast.success('Jenis mahasiswa berhasil ditambahkan!');
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
            const res = await api.patch(`/jenis-mahasiswa/${id}/toggle`);
            toast.success(res.data.message);
            fetchData();
        } catch {
            toast.error('Gagal update status!');
        }
    };

    const handleDelete = async (id, nama) => {
        if (!confirm(`Yakin hapus jenis mahasiswa ${nama}?`)) return;
        try {
            await api.delete(`/jenis-mahasiswa/${id}`);
            toast.success('Jenis mahasiswa berhasil dihapus!');
            fetchData();
        } catch {
            toast.error('Gagal hapus! Pastikan tidak ada data terkait.');
        }
    };

    const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition";
    const labelClass = "block text-sm font-medium text-slate-600 mb-1.5";

    return (
        <Layout title="Jenis Mahasiswa">
            <Toaster position="top-right" />

            {/* Info Banner */}
            <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-5">
                <Info size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                <p className="text-indigo-700 text-sm">
                    Kode angka jenis mahasiswa digunakan dalam format NIM. Contoh: Reguler=0, RPL=1, Hybrid=2.
                    Hanya jenis mahasiswa <strong>Aktif</strong> yang muncul di form pendaftaran.
                </p>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-slate-400">{data.length} jenis mahasiswa terdaftar</p>
                <button onClick={() => handleOpen()}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition">
                    <Plus size={16} />
                    Tambah Jenis Mahasiswa
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
            ) : data.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <LayoutGrid size={28} className="text-slate-400" />
                    </div>
                    <div className="text-slate-500 font-medium">Belum ada jenis mahasiswa</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.map(item => (
                        <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-slate-300 transition-all duration-200">
                            {/* Top */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <span className="font-mono font-black text-indigo-600 text-xl">{item.kodeAngka}</span>
                                </div>
                                <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${item.isAktif ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${item.isAktif ? 'bg-green-500' : 'bg-slate-400'}`} />
                                    {item.isAktif ? 'Aktif' : 'Nonaktif'}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="mb-4">
                                <div className="font-semibold text-slate-800 mb-2">{item.nama}</div>
                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                                    <span className="text-xs text-slate-400">Format NIM:</span>
                                    <code className="text-xs font-mono text-slate-600 tracking-widest">
                                        XX XXXX <span className="text-indigo-600 font-bold">{item.kodeAngka}</span> XXX
                                    </code>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-4 border-t border-slate-100">
                                <button onClick={() => handleToggle(item.id)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-xl border transition
                                        ${item.isAktif
                                            ? 'text-orange-600 border-orange-200 hover:bg-orange-50'
                                            : 'text-green-600 border-green-200 hover:bg-green-50'
                                        }`}>
                                    {item.isAktif ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                                    {item.isAktif ? 'Nonaktifkan' : 'Aktifkan'}
                                </button>
                                <button onClick={() => handleOpen(item)}
                                    className="flex items-center justify-center gap-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 px-3 py-2 rounded-xl hover:bg-indigo-50 transition">
                                    <Pencil size={12} />
                                </button>
                                <button onClick={() => handleDelete(item.id, item.nama)}
                                    className="flex items-center justify-center gap-1.5 text-xs font-medium text-red-500 border border-red-200 px-3 py-2 rounded-xl hover:bg-red-50 transition">
                                    <Trash2 size={12} />
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
                                    <LayoutGrid size={17} className="text-indigo-600" />
                                </div>
                                <h2 className="font-bold text-slate-800">
                                    {editData ? 'Edit Jenis Mahasiswa' : 'Tambah Jenis Mahasiswa'}
                                </h2>
                            </div>
                            <button onClick={() => setShowModal(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div>
                                <label className={labelClass}>Nama Jenis Mahasiswa</label>
                                <div className="relative">
                                    <LayoutGrid size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="text" value={form.nama}
                                        onChange={e => setForm({ ...form, nama: e.target.value })}
                                        className={`${inputClass} pl-9`}
                                        placeholder="Contoh: Reguler" />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Kode Angka</label>
                                <div className="relative">
                                    <Hash size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="number" value={form.kodeAngka}
                                        onChange={e => setForm({ ...form, kodeAngka: e.target.value })}
                                        className={`${inputClass} pl-9`}
                                        placeholder="0" min="0" max="9" />
                                </div>
                                <p className="text-xs text-slate-400 mt-1.5">1 digit angka (0–9) untuk format NIM</p>
                            </div>

                            {/* Preview NIM */}
                            {form.kodeAngka !== '' && (
                                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                                    <p className="text-xs text-indigo-500 mb-1">Preview posisi di NIM:</p>
                                    <code className="text-sm font-mono text-indigo-700 tracking-widest">
                                        XX XXXX <span className="font-black text-indigo-900 underline">{form.kodeAngka}</span> XXX
                                    </code>
                                </div>
                            )}
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