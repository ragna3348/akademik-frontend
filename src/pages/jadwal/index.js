import { useState, useEffect } from 'react';
import Layout from '@/components/layouts/Layout';
import api from '@/utils/api';
import { useRole } from '@/utils/useRole';
import toast, { Toaster } from 'react-hot-toast';
import {
    Plus, Filter, Calendar, Clock, BookOpen,
    GraduationCap, MapPin, Edit2, Trash2, X,
    Save, RefreshCw, List, LayoutGrid, User
} from 'lucide-react';

const HARI_LIST = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const FORM_INIT = {
    mataKuliahId: '', dosenId: '', hari: '',
    jamMulai: '', jamSelesai: '', ruangan: '',
    tahunAjaran: '', semester: ''
};

const HARI_COLORS = [
    'border-l-indigo-400 bg-indigo-50/60',
    'border-l-blue-400 bg-blue-50/60',
    'border-l-violet-400 bg-violet-50/60',
    'border-l-emerald-400 bg-emerald-50/60',
    'border-l-amber-400 bg-amber-50/60',
    'border-l-rose-400 bg-rose-50/60',
];

const HARI_HEADER = [
    'bg-indigo-600', 'bg-blue-600', 'bg-violet-600',
    'bg-emerald-600', 'bg-amber-500', 'bg-rose-500'
];

export default function JadwalPage() {
    const { isReadOnly } = useRole();
    const [data, setData] = useState([]);
    const [mataKuliah, setMataKuliah] = useState([]);
    const [dosen, setDosen] = useState([]);
    const [prodi, setProdi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterHari, setFilterHari] = useState('');
    const [filterProdi, setFilterProdi] = useState('');
    const [viewMode, setViewMode] = useState('tabel');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(FORM_INIT);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        try {
            const params = {};
            if (filterHari) params.hari = filterHari;
            if (filterProdi) params.prodiId = filterProdi;
            const [jadwalRes, mkRes, dosenRes, prodiRes] = await Promise.all([
                api.get('/jadwal', { params }),
                api.get('/akademik/mata-kuliah'),
                api.get('/akademik/dosen'),
                api.get('/prodi')
            ]);
            setData(jadwalRes.data.data);
            setMataKuliah(mkRes.data.data);
            setDosen(dosenRes.data.data);
            setProdi(prodiRes.data.data);
        } catch { toast.error('Gagal ambil data!'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [filterHari, filterProdi]);

    const handleOpen = (item = null) => {
        if (item) {
            setForm({
                mataKuliahId: item.mataKuliahId,
                dosenId: item.dosenId || '',
                hari: item.hari,
                jamMulai: item.jamMulai,
                jamSelesai: item.jamSelesai,
                ruangan: item.ruangan || '',
                tahunAjaran: item.tahunAjaran || '',
                semester: item.semester || ''
            });
            setEditId(item.id);
        } else {
            setForm(FORM_INIT);
            setEditId(null);
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.mataKuliahId || !form.hari || !form.jamMulai || !form.jamSelesai) {
            toast.error('Mata kuliah, hari, dan jam wajib diisi!'); return;
        }
        setSaving(true);
        try {
            if (editId) {
                await api.put(`/jadwal/${editId}`, form);
                toast.success('Jadwal berhasil diupdate!');
            } else {
                await api.post('/jadwal', form);
                toast.success('Jadwal berhasil ditambahkan!');
            }
            setShowModal(false);
            fetchData();
        } catch (e) { toast.error(e.response?.data?.message || 'Gagal!'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus jadwal ini?')) return;
        try {
            await api.delete(`/jadwal/${id}`);
            toast.success('Jadwal berhasil dihapus!');
            fetchData();
        } catch { toast.error('Gagal hapus!'); }
    };

    const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400";
    const labelClass = "block text-sm font-semibold text-slate-600 mb-1.5";

    const jadwalPerHari = HARI_LIST.map((hari, i) => ({
        hari, idx: i,
        jadwal: data.filter(j => j.hari === hari)
    }));

    return (
        <Layout title="Jadwal Kuliah">
            <Toaster position="top-right" />

            {/* Filter & Aksi */}
            <div className="flex flex-col sm:flex-row gap-2 mb-5 justify-between">
                <div className="flex gap-2 flex-wrap items-center">
                    <div className="relative">
                        <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select value={filterHari} onChange={e => setFilterHari(e.target.value)}
                            className="pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 bg-white appearance-none">
                            <option value="">Semua Hari</option>
                            {HARI_LIST.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                    </div>
                    <div className="relative">
                        <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select value={filterProdi} onChange={e => setFilterProdi(e.target.value)}
                            className="pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 bg-white appearance-none">
                            <option value="">Semua Prodi</option>
                            {prodi.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                        </select>
                    </div>

                    {/* Toggle View */}
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button onClick={() => setViewMode('tabel')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${viewMode === 'tabel' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            <List size={13} /> Tabel
                        </button>
                        <button onClick={() => setViewMode('grid')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${viewMode === 'grid' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            <LayoutGrid size={13} /> Per Hari
                        </button>
                    </div>
                </div>

                {!isReadOnly && (<button onClick={() => handleOpen()}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition whitespace-nowrap">
                    <Plus size={15} /> Tambah Jadwal
                </button>)}
            </div>

            {/* View: Tabel */}
            {viewMode === 'tabel' && (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    {/* Desktop */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    {['Hari', 'Jam', 'Mata Kuliah', 'Dosen', 'Ruangan', 'Prodi', ...(!isReadOnly ? ['Aksi'] : [])].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                                        <div className="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2" />
                                        Memuat data...
                                    </td></tr>
                                ) : data.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-12 text-slate-400 text-sm">Tidak ada jadwal</td></tr>
                                ) : data.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
                                                {item.hari}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap font-mono">
                                            {item.jamMulai} – {item.jamSelesai}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-700 text-sm">{item.mataKuliah?.nama}</div>
                                            <div className="text-xs text-slate-400">{item.mataKuliah?.kode} · {item.mataKuliah?.sks} SKS</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{item.dosen?.nama || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-500">{item.ruangan || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-500">{item.mataKuliah?.prodi?.nama}</td>
                                        {!isReadOnly && (<td className="px-4 py-3">
                                            <div className="flex gap-1.5">
                                                <button onClick={() => handleOpen(item)}
                                                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                                                    <Edit2 size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(item.id)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition">
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
                        {loading ? (
                            <div className="py-12 text-center">
                                <div className="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                            </div>
                        ) : data.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 text-sm">Tidak ada jadwal</div>
                        ) : data.map(item => (
                            <div key={item.id} className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                                                {item.hari}
                                            </span>
                                            <span className="text-xs font-mono text-slate-500">
                                                {item.jamMulai} – {item.jamSelesai}
                                            </span>
                                        </div>
                                        <div className="font-medium text-slate-700 text-sm">{item.mataKuliah?.nama}</div>
                                        <div className="text-xs text-slate-400 mt-0.5">
                                            {item.mataKuliah?.kode} · {item.mataKuliah?.sks} SKS
                                        </div>
                                        {item.dosen && <div className="text-xs text-slate-500 mt-1">{item.dosen.nama}</div>}
                                        {item.ruangan && <div className="text-xs text-slate-400">{item.ruangan}</div>}
                                    </div>
                                    {!isReadOnly && (<div className="flex gap-1">
                                        <button onClick={() => handleOpen(item)}
                                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* View: Grid per Hari */}
            {viewMode === 'grid' && (
                <div className="space-y-3">
                    {jadwalPerHari.filter(h => h.jadwal.length > 0).map(({ hari, idx, jadwal: jList }) => (
                        <div key={hari} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                            <div className={`${HARI_HEADER[idx % HARI_HEADER.length]} text-white px-5 py-3 flex items-center justify-between`}>
                                <div className="flex items-center gap-2">
                                    <Calendar size={15} />
                                    <span className="font-semibold text-sm">{hari}</span>
                                </div>
                                <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-medium">
                                    {jList.length} jadwal
                                </span>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {jList.map((j, i) => (
                                    <div key={j.id} className={`flex items-center gap-4 px-5 py-4 border-l-4 ${HARI_COLORS[i % HARI_COLORS.length]}`}>
                                        <div className="text-center min-w-[80px]">
                                            <div className="font-bold text-slate-700 text-sm">{j.jamMulai}</div>
                                            <div className="text-xs text-slate-300 my-0.5">—</div>
                                            <div className="font-bold text-slate-700 text-sm">{j.jamSelesai}</div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-slate-700 text-sm">{j.mataKuliah?.nama}</div>
                                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                                                <span className="flex items-center gap-1 text-xs text-slate-400">
                                                    <BookOpen size={11} /> {j.mataKuliah?.kode} · {j.mataKuliah?.sks} SKS
                                                </span>
                                                {j.dosen && (
                                                    <span className="flex items-center gap-1 text-xs text-slate-400">
                                                        <User size={11} /> {j.dosen.nama}
                                                    </span>
                                                )}
                                                {j.ruangan && (
                                                    <span className="flex items-center gap-1 text-xs text-slate-400">
                                                        <MapPin size={11} /> {j.ruangan}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                                                <GraduationCap size={11} /> {j.mataKuliah?.prodi?.nama}
                                            </div>
                                        </div>
                                       {!isReadOnly && ( <div className="flex gap-1 flex-shrink-0">
                                            <button onClick={() => handleOpen(j)}
                                                className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-lg transition">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(j.id)}
                                                className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {data.length === 0 && !loading && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
                            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Calendar size={28} className="text-slate-400" />
                            </div>
                            <div className="text-slate-500 font-medium">Belum ada jadwal kuliah</div>
                            <p className="text-slate-400 text-sm mt-1">Tambahkan jadwal kuliah terlebih dahulu</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal Form */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
                                    <Calendar size={17} className="text-indigo-600" />
                                </div>
                                <h2 className="font-bold text-slate-800">{editId ? 'Edit Jadwal' : 'Tambah Jadwal'}</h2>
                            </div>
                            <button onClick={() => setShowModal(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div>
                                <label className={labelClass}>Mata Kuliah *</label>
                                <select value={form.mataKuliahId}
                                    onChange={e => setForm({ ...form, mataKuliahId: e.target.value })}
                                    className={inputClass}>
                                    <option value="">-- Pilih Mata Kuliah --</option>
                                    {mataKuliah.map(m => (
                                        <option key={m.id} value={m.id}>
                                            [{m.kode}] {m.nama} — Sem {m.semester} ({m.sks} SKS)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Dosen Pengampu</label>
                                <select value={form.dosenId}
                                    onChange={e => setForm({ ...form, dosenId: e.target.value })}
                                    className={inputClass}>
                                    <option value="">-- Pilih Dosen --</option>
                                    {dosen.filter(d => d.isAktif).map(d => (
                                        <option key={d.id} value={d.id}>{d.nama}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className={labelClass}>Hari *</label>
                                    <select value={form.hari}
                                        onChange={e => setForm({ ...form, hari: e.target.value })}
                                        className={inputClass}>
                                        <option value="">-- Pilih --</option>
                                        {HARI_LIST.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Jam Mulai *</label>
                                    <input type="time" value={form.jamMulai}
                                        onChange={e => setForm({ ...form, jamMulai: e.target.value })}
                                        className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Jam Selesai *</label>
                                    <input type="time" value={form.jamSelesai}
                                        onChange={e => setForm({ ...form, jamSelesai: e.target.value })}
                                        className={inputClass} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>Ruangan</label>
                                    <input type="text" value={form.ruangan}
                                        onChange={e => setForm({ ...form, ruangan: e.target.value })}
                                        className={inputClass} placeholder="Contoh: Ruang A101" />
                                </div>
                                <div>
                                    <label className={labelClass}>Tahun Ajaran</label>
                                    <input type="text" value={form.tahunAjaran}
                                        onChange={e => setForm({ ...form, tahunAjaran: e.target.value })}
                                        className={inputClass} placeholder="2025/2026" />
                                </div>
                            </div>
                        </div>

                        <div className="p-5 border-t flex gap-3">
                            <button onClick={() => setShowModal(false)}
                                className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition">
                                Batal
                            </button>
                            <button onClick={handleSave} disabled={saving}
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