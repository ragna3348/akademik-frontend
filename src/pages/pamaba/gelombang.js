import { useState, useEffect } from 'react';
import Layout from '@/components/layouts/Layout';
import api from '@/utils/api';
import toast, { Toaster } from 'react-hot-toast';
import {
    Plus, Calendar, DollarSign, Users, Edit2,
    ToggleLeft, ToggleRight, X, Save, RefreshCw, Waves
} from 'lucide-react';

export default function GelombangPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        nama: '', tahun: new Date().getFullYear(),
        tanggalBuka: '', tanggalTutup: '', biayaDaftar: ''
    });

    const fetchData = async () => {
        try {
            const res = await api.get('/pamaba/gelombang');
            setData(res.data.data);
        } catch {
            toast.error('Gagal ambil data!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async () => {
        setSaving(true);
        try {
            if (editData) {
                await api.put(`/pamaba/gelombang/${editData.id}`, form);
                toast.success('Gelombang berhasil diupdate!');
            } else {
                await api.post('/pamaba/gelombang', form);
                toast.success('Gelombang berhasil dibuat!');
            }
            setShowModal(false);
            setEditData(null);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal simpan!');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (id) => {
        try {
            const res = await api.patch(`/pamaba/gelombang/${id}/toggle`);
            toast.success(res.data.message);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal update status!');
        }
    };

    const handleEdit = (item) => {
        setEditData(item);
        setForm({
            nama: item.nama,
            tahun: item.tahun,
            tanggalBuka: item.tanggalBuka?.split('T')[0],
            tanggalTutup: item.tanggalTutup?.split('T')[0],
            biayaDaftar: item.biayaDaftar
        });
        setShowModal(true);
    };

    const handleOpenAdd = () => {
        setEditData(null);
        setForm({ nama: '', tahun: new Date().getFullYear(), tanggalBuka: '', tanggalTutup: '', biayaDaftar: '' });
        setShowModal(true);
    };

    const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400";
    const labelClass = "block text-sm font-medium text-slate-500 mb-1.5";

    return (
        <Layout title="Gelombang Pendaftaran">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-slate-400">{data.length} gelombang terdaftar</p>
                <button onClick={handleOpenAdd}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition">
                    <Plus size={15} /> Tambah Gelombang
                </button>
            </div>

            {/* Grid Cards */}
            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
            ) : data.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Waves size={28} className="text-slate-300" />
                    </div>
                    <div className="text-slate-500 font-medium">Belum ada gelombang</div>
                    <p className="text-slate-400 text-sm mt-1">Tambahkan gelombang pendaftaran pertama</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.map(item => (
                        <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-5">
                            {/* Card Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                        <Waves size={18} className="text-indigo-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-700">{item.nama}</h3>
                                        <p className="text-xs text-slate-400">Tahun {item.tahun}</p>
                                    </div>
                                </div>
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                                    item.isAktif
                                        ? 'bg-green-50 text-green-600 border-green-200'
                                        : 'bg-slate-50 text-slate-400 border-slate-200'
                                }`}>
                                    {item.isAktif ? 'Aktif' : 'Nonaktif'}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <div className="bg-slate-50 rounded-xl p-3">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                                        <Calendar size={11} /> Tanggal Buka
                                    </div>
                                    <div className="text-sm font-medium text-slate-600">
                                        {new Date(item.tanggalBuka).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-3">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                                        <Calendar size={11} /> Tanggal Tutup
                                    </div>
                                    <div className="text-sm font-medium text-slate-600">
                                        {new Date(item.tanggalTutup).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-3">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                                        <DollarSign size={11} /> Biaya Daftar
                                    </div>
                                    <div className="text-sm font-medium text-slate-600">
                                        Rp {Number(item.biayaDaftar).toLocaleString('id-ID')}
                                    </div>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-3">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                                        <Users size={11} /> Pendaftar
                                    </div>
                                    <div className="text-sm font-medium text-slate-600">
                                        {item._count?.pendaftar || 0} orang
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button onClick={() => handleToggle(item.id)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition ${
                                        item.isAktif
                                            ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100'
                                            : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                                    }`}>
                                    {item.isAktif
                                        ? <><ToggleLeft size={14} /> Nonaktifkan</>
                                        : <><ToggleRight size={14} /> Aktifkan</>
                                    }
                                </button>
                                <button onClick={() => handleEdit(item)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 transition">
                                    <Edit2 size={13} /> Edit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
                                    <Waves size={17} className="text-indigo-600" />
                                </div>
                                <h2 className="font-bold text-slate-700">
                                    {editData ? 'Edit Gelombang' : 'Tambah Gelombang'}
                                </h2>
                            </div>
                            <button onClick={() => setShowModal(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div>
                                <label className={labelClass}>Nama Gelombang</label>
                                <input type="text" value={form.nama}
                                    onChange={e => setForm({ ...form, nama: e.target.value })}
                                    className={inputClass} placeholder="Gelombang 1" />
                            </div>
                            <div>
                                <label className={labelClass}>Tahun</label>
                                <input type="number" value={form.tahun}
                                    onChange={e => setForm({ ...form, tahun: e.target.value })}
                                    className={inputClass} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>Tanggal Buka</label>
                                    <input type="date" value={form.tanggalBuka}
                                        onChange={e => setForm({ ...form, tanggalBuka: e.target.value })}
                                        className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Tanggal Tutup</label>
                                    <input type="date" value={form.tanggalTutup}
                                        onChange={e => setForm({ ...form, tanggalTutup: e.target.value })}
                                        className={inputClass} />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Biaya Pendaftaran (Rp)</label>
                                <input type="number" value={form.biayaDaftar}
                                    onChange={e => setForm({ ...form, biayaDaftar: e.target.value })}
                                    className={inputClass} placeholder="300000" />
                            </div>
                        </div>

                        <div className="p-5 border-t flex gap-3">
                            <button onClick={() => setShowModal(false)}
                                className="flex-1 border border-slate-200 text-slate-500 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition">
                                Batal
                            </button>
                            <button onClick={handleSubmit} disabled={saving}
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