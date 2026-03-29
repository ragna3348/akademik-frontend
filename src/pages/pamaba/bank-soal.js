import { useState, useEffect } from 'react';
import Layout from '@/components/layouts/Layout';
import api from '@/utils/api';
import toast, { Toaster } from 'react-hot-toast';
import {
    FileQuestion, Plus, Pencil, Trash2, X, Save, Search,
    Filter, ChevronLeft, ChevronRight, Eye, CheckCircle2, Tag
} from 'lucide-react';

const TIPE_SOAL = [
    { value: 'PG', label: 'Pilihan Ganda' },
    { value: 'ESSAY', label: 'Essay' },
    { value: 'BENAR_SALAH', label: 'Benar/Salah' },
];

export default function BankSoalPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [previewSoal, setPreviewSoal] = useState(null);
    const [editData, setEditData] = useState(null);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [filterKategori, setFilterKategori] = useState('');
    const [kategoriList, setKategoriList] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 20;

    const [form, setForm] = useState({
        pertanyaan: '', tipeSoal: 'PG',
        opsiA: '', opsiB: '', opsiC: '', opsiD: '',
        jawaban: '', kategori: ''
    });

    const fetchData = async () => {
        try {
            const params = { page, limit };
            if (search) params.search = search;
            if (filterKategori) params.kategori = filterKategori;
            const res = await api.get('/pamaba/bank-soal', { params });
            setData(res.data.data);
            setTotal(res.data.total);
        } catch {
            toast.error('Gagal ambil data soal!');
        } finally {
            setLoading(false);
        }
    };

    const fetchKategori = async () => {
        try {
            const res = await api.get('/pamaba/bank-soal/kategori');
            setKategoriList(res.data.data || []);
        } catch {}
    };

    useEffect(() => { fetchData(); }, [page, search, filterKategori]);
    useEffect(() => { fetchKategori(); }, []);

    const handleOpen = (item = null) => {
        setEditData(item);
        setForm(item ? {
            pertanyaan: item.pertanyaan, tipeSoal: item.tipeSoal || 'PG',
            opsiA: item.opsiA || '', opsiB: item.opsiB || '',
            opsiC: item.opsiC || '', opsiD: item.opsiD || '',
            jawaban: item.jawaban, kategori: item.kategori || ''
        } : {
            pertanyaan: '', tipeSoal: 'PG',
            opsiA: '', opsiB: '', opsiC: '', opsiD: '',
            jawaban: '', kategori: ''
        });
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!form.pertanyaan || !form.jawaban) {
            toast.error('Pertanyaan dan jawaban wajib diisi!');
            return;
        }
        setSaving(true);
        try {
            if (editData) {
                await api.put(`/pamaba/bank-soal/${editData.id}`, form);
                toast.success('Soal berhasil diupdate!');
            } else {
                await api.post('/pamaba/bank-soal', form);
                toast.success('Soal berhasil ditambahkan!');
            }
            setShowModal(false);
            fetchData();
            fetchKategori();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Gagal simpan!');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin hapus soal ini?')) return;
        try {
            await api.delete(`/pamaba/bank-soal/${id}`);
            toast.success('Soal berhasil dihapus!');
            fetchData();
        } catch {
            toast.error('Gagal hapus soal!');
        }
    };

    const totalPages = Math.ceil(total / limit);
    const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition";
    const labelClass = "block text-sm font-medium text-slate-600 mb-1.5";

    const OPSI_LABELS = ['A', 'B', 'C', 'D'];

    return (
        <Layout title="Bank Soal">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                <div>
                    <p className="text-sm text-slate-400">{total} soal tersedia</p>
                </div>
                <button onClick={() => handleOpen()}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm">
                    <Plus size={16} /> Tambah Soal
                </button>
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className={`${inputClass} pl-9`}
                        placeholder="Cari pertanyaan..." />
                </div>
                <div className="relative">
                    <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select value={filterKategori}
                        onChange={e => { setFilterKategori(e.target.value); setPage(1); }}
                        className={`${inputClass} pl-9 pr-8 min-w-[180px]`}>
                        <option value="">Semua Kategori</option>
                        {kategoriList.map(k => (
                            <option key={k} value={k}>{k}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                </div>
            ) : data.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FileQuestion size={28} className="text-slate-400" />
                    </div>
                    <div className="text-slate-500 font-medium">Belum ada soal</div>
                    <p className="text-sm text-slate-400 mt-1">Klik "Tambah Soal" untuk membuat soal baru</p>
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600 w-10">#</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Pertanyaan</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600 w-24">Tipe</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600 w-32">Kategori</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600 w-20">Jawaban</th>
                                    <th className="text-center px-4 py-3 font-semibold text-slate-600 w-28">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.map((item, i) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                                        <td className="px-4 py-3 text-slate-400">{(page - 1) * limit + i + 1}</td>
                                        <td className="px-4 py-3 text-slate-700 max-w-sm">
                                            <div className="line-clamp-2">{item.pertanyaan}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                                                item.tipeSoal === 'PG' ? 'bg-blue-50 text-blue-600' :
                                                item.tipeSoal === 'ESSAY' ? 'bg-purple-50 text-purple-600' :
                                                'bg-amber-50 text-amber-600'
                                            }`}>
                                                {TIPE_SOAL.find(t => t.value === item.tipeSoal)?.label || item.tipeSoal}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {item.kategori && (
                                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                                    <Tag size={10} /> {item.kategori}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-mono font-bold text-green-600">{item.jawaban}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1">
                                                <button onClick={() => setPreviewSoal(item)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition" title="Preview">
                                                    <Eye size={14} />
                                                </button>
                                                <button onClick={() => handleOpen(item)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition" title="Edit">
                                                    <Pencil size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(item.id)}
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
                            <p className="text-xs text-slate-400">Halaman {page} dari {totalPages}</p>
                            <div className="flex gap-1">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-30 transition">
                                    <ChevronLeft size={14} />
                                </button>
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-30 transition">
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Preview Modal */}
            {previewSoal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setPreviewSoal(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                                    <Eye size={17} className="text-blue-600" />
                                </div>
                                <h2 className="font-bold text-slate-800">Preview Soal</h2>
                            </div>
                            <button onClick={() => setPreviewSoal(null)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition"><X size={18} /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <div className="text-xs text-slate-400 mb-1">Pertanyaan</div>
                                <div className="text-slate-800 font-medium">{previewSoal.pertanyaan}</div>
                            </div>
                            {previewSoal.tipeSoal === 'PG' && (
                                <div className="space-y-2">
                                    {['A', 'B', 'C', 'D'].map(opt => (
                                        <div key={opt} className={`flex items-center gap-3 p-3 rounded-xl border ${
                                            previewSoal.jawaban === opt ? 'bg-green-50 border-green-300' : 'bg-slate-50 border-slate-200'
                                        }`}>
                                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                                previewSoal.jawaban === opt ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'
                                            }`}>{opt}</span>
                                            <span className="text-sm text-slate-700">{previewSoal[`opsi${opt}`] || '-'}</span>
                                            {previewSoal.jawaban === opt && <CheckCircle2 size={14} className="ml-auto text-green-500" />}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {previewSoal.tipeSoal !== 'PG' && (
                                <div>
                                    <div className="text-xs text-slate-400 mb-1">Jawaban Benar</div>
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 font-medium">{previewSoal.jawaban}</div>
                                </div>
                            )}
                            <div className="flex gap-4">
                                {previewSoal.kategori && (
                                    <div><span className="text-xs text-slate-400">Kategori:</span> <span className="text-xs font-medium text-slate-600">{previewSoal.kategori}</span></div>
                                )}
                                <div><span className="text-xs text-slate-400">Tipe:</span> <span className="text-xs font-medium text-slate-600">{TIPE_SOAL.find(t => t.value === previewSoal.tipeSoal)?.label}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                                    <FileQuestion size={17} className="text-blue-600" />
                                </div>
                                <h2 className="font-bold text-slate-800">
                                    {editData ? 'Edit Soal' : 'Tambah Soal Baru'}
                                </h2>
                            </div>
                            <button onClick={() => setShowModal(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition"><X size={18} /></button>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Pertanyaan */}
                            <div>
                                <label className={labelClass}>Pertanyaan *</label>
                                <textarea value={form.pertanyaan}
                                    onChange={e => setForm({ ...form, pertanyaan: e.target.value })}
                                    className={`${inputClass} min-h-[100px]`}
                                    placeholder="Tulis pertanyaan..." rows={3} />
                            </div>

                            {/* Tipe + Kategori in row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>Tipe Soal</label>
                                    <select value={form.tipeSoal}
                                        onChange={e => setForm({ ...form, tipeSoal: e.target.value })}
                                        className={inputClass}>
                                        {TIPE_SOAL.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Kategori</label>
                                    <input type="text" value={form.kategori}
                                        onChange={e => setForm({ ...form, kategori: e.target.value })}
                                        className={inputClass}
                                        placeholder="Contoh: TPA, Bahasa Inggris"
                                        list="kategori-list" />
                                    <datalist id="kategori-list">
                                        {kategoriList.map(k => <option key={k} value={k} />)}
                                    </datalist>
                                </div>
                            </div>

                            {/* Opsi A-D (only for PG) */}
                            {form.tipeSoal === 'PG' && (
                                <div className="space-y-3">
                                    <label className={labelClass}>Pilihan Jawaban</label>
                                    {OPSI_LABELS.map(opt => (
                                        <div key={opt} className="flex items-center gap-2">
                                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                                form.jawaban === opt ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'
                                            }`}>{opt}</span>
                                            <input type="text"
                                                value={form[`opsi${opt}`]}
                                                onChange={e => setForm({ ...form, [`opsi${opt}`]: e.target.value })}
                                                className={`${inputClass} flex-1`}
                                                placeholder={`Opsi ${opt}`} />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Jawaban */}
                            <div>
                                <label className={labelClass}>Jawaban Benar *</label>
                                {form.tipeSoal === 'PG' ? (
                                    <div className="flex gap-2">
                                        {OPSI_LABELS.map(opt => (
                                            <button key={opt}
                                                onClick={() => setForm({ ...form, jawaban: opt })}
                                                className={`w-10 h-10 rounded-xl font-bold text-sm transition border ${
                                                    form.jawaban === opt
                                                        ? 'bg-green-500 text-white border-green-500 shadow-sm'
                                                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-green-300'
                                                }`}>
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                ) : form.tipeSoal === 'BENAR_SALAH' ? (
                                    <div className="flex gap-2">
                                        {['Benar', 'Salah'].map(opt => (
                                            <button key={opt}
                                                onClick={() => setForm({ ...form, jawaban: opt })}
                                                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition border ${
                                                    form.jawaban === opt
                                                        ? 'bg-green-500 text-white border-green-500'
                                                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-green-300'
                                                }`}>
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <textarea value={form.jawaban}
                                        onChange={e => setForm({ ...form, jawaban: e.target.value })}
                                        className={`${inputClass} min-h-[60px]`}
                                        placeholder="Tulis jawaban benar..." rows={2} />
                                )}
                            </div>
                        </div>

                        <div className="p-5 border-t flex gap-3 sticky bottom-0 bg-white">
                            <button onClick={() => setShowModal(false)}
                                className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition">
                                Batal
                            </button>
                            <button onClick={handleSubmit} disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition">
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
