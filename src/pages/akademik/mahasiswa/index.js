import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layouts/Layout';
import api from '@/utils/api';
import { useRole } from '@/utils/useRole';
import toast, { Toaster } from 'react-hot-toast';
import {
    Search, Filter, Plus, Users, UserCheck, UserX, TrendingUp,
    ChevronUp, Eye, Pencil, Trash2, X, Save, RefreshCw
} from 'lucide-react';

const STATUS_LIST = ['AKTIF', 'CUTI', 'LULUS', 'DROPOUT'];
const STATUS_STYLE = {
    AKTIF:   'bg-green-50 text-green-700 border-green-200',
    CUTI:    'bg-yellow-50 text-yellow-700 border-yellow-200',
    LULUS:   'bg-blue-50 text-blue-700 border-blue-200',
    DROPOUT: 'bg-red-50 text-red-700 border-red-200',
};

const FORM_INIT = {
    nim: '', nama: '', email: '', telepon: '', alamat: '',
    tahunAngkatan: new Date().getFullYear(),
    semester: 1, status: 'AKTIF',
    prodiId: '', jenisKelasId: '', dosenWaliId: '', password: ''
};

export default function MahasiswaPage() {
    const router = useRouter();
    const { isReadOnly } = useRole();
    const [data, setData] = useState([]);
    const [prodi, setProdi] = useState([]);
    const [jenisKelas, setJenisKelas] = useState([]);
    const [dosen, setDosen] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterProdi, setFilterProdi] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterAngkatan, setFilterAngkatan] = useState('');
    const [selected, setSelected] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(FORM_INIT);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        try {
            const params = {};
            if (filterProdi) params.prodiId = filterProdi;
            if (filterStatus) params.status = filterStatus;
            if (filterAngkatan) params.tahunAngkatan = filterAngkatan;
            if (search) params.search = search;
            const [mhsRes, prodiRes, kelasRes, dosenRes] = await Promise.all([
                api.get('/akademik/mahasiswa', { params }),
                api.get('/prodi'),
                api.get('/jenis-kelas/aktif'),
                api.get('/akademik/dosen')
            ]);
            setData(mhsRes.data.data);
            setProdi(prodiRes.data.data);
            setJenisKelas(kelasRes.data.data);
            setDosen(dosenRes.data.data);
        } catch { toast.error('Gagal ambil data!'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [filterProdi, filterStatus, filterAngkatan]);

    const handleSearch = (e) => { if (e.key === 'Enter') fetchData(); };

    const toggleSelect = (id) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    const toggleAll = () => {
        const ids = data.map(d => d.id);
        setSelected(p => p.length === ids.length ? [] : ids);
    };

    const handleOpen = (item = null) => {
        if (item) {
            setForm({
                nim: item.nim, nama: item.nama,
                email: item.email || '', telepon: item.telepon || '',
                alamat: item.alamat || '',
                tahunAngkatan: item.tahunAngkatan,
                semester: item.semester, status: item.status,
                prodiId: item.prodiId || '',
                jenisKelasId: item.jenisKelasId || '',
                dosenWaliId: item.dosenWaliId || '',
                password: ''
            });
            setEditId(item.id);
        } else {
            setForm(FORM_INIT);
            setEditId(null);
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.nim || !form.nama || !form.prodiId) {
            toast.error('NIM, nama, dan prodi wajib diisi!'); return;
        }
        setSaving(true);
        try {
            if (editId) {
                await api.put(`/akademik/mahasiswa/${editId}`, form);
                toast.success('Mahasiswa berhasil diupdate!');
            } else {
                await api.post('/akademik/mahasiswa', form);
                toast.success('Mahasiswa berhasil ditambahkan!');
            }
            setShowModal(false);
            fetchData();
        } catch (e) { toast.error(e.response?.data?.message || 'Gagal!'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id, nama) => {
        if (!confirm(`Hapus mahasiswa ${nama}?`)) return;
        try {
            await api.delete(`/akademik/mahasiswa/${id}`);
            toast.success('Berhasil dihapus!');
            fetchData();
        } catch { toast.error('Gagal hapus!'); }
    };

    const handleNaikSemester = async () => {
        if (selected.length === 0) { toast.error('Pilih minimal 1 mahasiswa!'); return; }
        if (!confirm(`Naikkan semester ${selected.length} mahasiswa terpilih?`)) return;
        try {
            await api.post('/akademik/mahasiswa/naik-semester', { mahasiswaIds: selected });
            toast.success('Berhasil naik semester!');
            setSelected([]);
            fetchData();
        } catch { toast.error('Gagal!'); }
    };

    const angkatanList = [...new Set(data.map(d => d.tahunAngkatan))].sort((a, b) => b - a);
    const stats = {
        total: data.length,
        aktif: data.filter(d => d.status === 'AKTIF').length,
        cuti: data.filter(d => d.status === 'CUTI').length,
        lulus: data.filter(d => d.status === 'LULUS').length,
    };

    const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition";
    const labelClass = "block text-sm font-medium text-slate-600 mb-1.5";

    return (
        <Layout title="Manajemen Mahasiswa">
            <Toaster position="top-right" />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {[
                    { icon: Users,     label: 'Total',  value: stats.total, iconBg: 'bg-slate-100',  iconColor: 'text-slate-600' },
                    { icon: UserCheck, label: 'Aktif',  value: stats.aktif, iconBg: 'bg-green-50',   iconColor: 'text-green-600' },
                    { icon: TrendingUp,label: 'Cuti',   value: stats.cuti,  iconBg: 'bg-yellow-50',  iconColor: 'text-yellow-600' },
                    { icon: UserX,     label: 'Lulus',  value: stats.lulus, iconBg: 'bg-blue-50',    iconColor: 'text-blue-600' },
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
            <div className="flex flex-col sm:flex-row gap-2 mb-4 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={handleSearch}
                        placeholder="Cari NIM, nama, email... (Enter)"
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
                </div>
                <select value={filterProdi} onChange={e => setFilterProdi(e.target.value)}
                    className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none bg-white">
                    <option value="">Semua Prodi</option>
                    {prodi.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                </select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                    className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none bg-white">
                    <option value="">Semua Status</option>
                    {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={filterAngkatan} onChange={e => setFilterAngkatan(e.target.value)}
                    className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none bg-white">
                    <option value="">Semua Angkatan</option>
                    {angkatanList.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <div className="flex gap-2">
                    {selected.length > 0 && (
                        <button onClick={handleNaikSemester}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition whitespace-nowrap">
                            <ChevronUp size={15} />
                            Naik Semester ({selected.length})
                        </button>
                    )}
                    {!isReadOnly && (<button onClick={() => handleOpen()}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition whitespace-nowrap">
                        <Plus size={15} />
                        Tambah
                    </button>)}
                </div>
            </div>

            {/* Tabel Desktop */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-4 py-3 w-10">
                                    <input type="checkbox"
                                        checked={selected.length === data.length && data.length > 0}
                                        onChange={toggleAll} className="rounded border-slate-300" />
                                </th>
                                {['NIM', 'Nama', 'Prodi', 'Kelas', 'Smt', 'Angkatan', 'Status', ...(!isReadOnly ? ['Aksi'] : [])].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={9} className="text-center py-12">
                                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                                </td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan={9} className="text-center py-12 text-slate-400">Tidak ada data</td></tr>
                            ) : data.map(item => (
                                <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${selected.includes(item.id) ? 'bg-indigo-50/60' : ''}`}>
                                    <td className="px-4 py-3">
                                        <input type="checkbox" checked={selected.includes(item.id)}
                                            onChange={() => toggleSelect(item.id)} className="rounded border-slate-300" />
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs font-bold text-indigo-600">{item.nim}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-700 text-sm">{item.nama}</div>
                                        <div className="text-xs text-slate-400">{item.email || '-'}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{item.prodi?.nama}</td>
                                    <td className="px-4 py-3 text-sm text-slate-500">{item.jenisKelas?.nama || '-'}</td>
                                    <td className="px-4 py-3 text-center font-semibold text-slate-700 text-sm">{item.semester}</td>
                                    <td className="px-4 py-3 text-center text-slate-500 text-sm">{item.tahunAngkatan}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium border ${STATUS_STYLE[item.status]}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1.5">
                                            <button onClick={() => router.push(`/akademik/mahasiswa/${item.id}`)}
                                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Detail">
                                                <Eye size={14} />
                                            </button>
                                            <button onClick={() => handleOpen(item)}
                                                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition" title="Edit">
                                                <Pencil size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(item.id, item.nama)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="Hapus">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-slate-100">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                        </div>
                    ) : data.map(item => (
                        <div key={item.id} className={`p-4 ${selected.includes(item.id) ? 'bg-indigo-50/60' : ''}`}>
                            <div className="flex items-start gap-3">
                                <input type="checkbox" checked={selected.includes(item.id)}
                                    onChange={() => toggleSelect(item.id)} className="rounded border-slate-300 mt-1" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="font-medium text-slate-700 text-sm truncate">{item.nama}</div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${STATUS_STYLE[item.status]}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <div className="font-mono text-xs text-indigo-600 mt-0.5">{item.nim}</div>
                                    <div className="text-xs text-slate-400 mt-0.5">{item.prodi?.nama} — Smt {item.semester}</div>
                                    {!isReadOnly &&(<div className="flex gap-2 mt-3">
                                        <button onClick={() => router.push(`/akademik/mahasiswa/${item.id}`)}
                                            className="flex items-center gap-1 text-xs text-indigo-600 border border-indigo-200 px-2.5 py-1.5 rounded-lg">
                                            <Eye size={11} /> Detail
                                        </button>
                                        <button onClick={() => handleOpen(item)}
                                            className="flex items-center gap-1 text-xs text-slate-600 border border-slate-200 px-2.5 py-1.5 rounded-lg">
                                            <Pencil size={11} /> Edit
                                        </button>
                                        <button onClick={() => handleDelete(item.id, item.nama)}
                                            className="flex items-center gap-1 text-xs text-red-500 border border-red-200 px-2.5 py-1.5 rounded-lg">
                                            <Trash2 size={11} /> Hapus
                                        </button>
                                    </div>)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
                            <h2 className="font-bold text-slate-800">{editId ? 'Edit Mahasiswa' : 'Tambah Mahasiswa'}</h2>
                            <button onClick={() => setShowModal(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>NIM *</label>
                                    <input type="text" value={form.nim}
                                        onChange={e => setForm({ ...form, nim: e.target.value })}
                                        className={`${inputClass} ${editId ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        placeholder="Nomor Induk Mahasiswa"
                                        disabled={!!editId} />
                                </div>
                                <div>
                                    <label className={labelClass}>Status *</label>
                                    <select value={form.status}
                                        onChange={e => setForm({ ...form, status: e.target.value })}
                                        className={inputClass}>
                                        {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Nama Lengkap *</label>
                                    <input type="text" value={form.nama}
                                        onChange={e => setForm({ ...form, nama: e.target.value })}
                                        className={inputClass} placeholder="Nama lengkap mahasiswa" />
                                </div>
                                <div>
                                    <label className={labelClass}>Email</label>
                                    <input type="email" value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        className={inputClass} placeholder="email@gmail.com" />
                                </div>
                                <div>
                                    <label className={labelClass}>Telepon</label>
                                    <input type="text" value={form.telepon}
                                        onChange={e => setForm({ ...form, telepon: e.target.value })}
                                        className={inputClass} placeholder="08xxxxxxxxxx" />
                                </div>
                                <div>
                                    <label className={labelClass}>Program Studi *</label>
                                    <select value={form.prodiId}
                                        onChange={e => setForm({ ...form, prodiId: e.target.value })}
                                        className={inputClass}>
                                        <option value="">-- Pilih Prodi --</option>
                                        {prodi.map(p => <option key={p.id} value={p.id}>{p.nama} ({p.jenjang})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Jenis Kelas</label>
                                    <select value={form.jenisKelasId}
                                        onChange={e => setForm({ ...form, jenisKelasId: e.target.value })}
                                        className={inputClass}>
                                        <option value="">-- Pilih Kelas --</option>
                                        {jenisKelas.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Dosen Wali</label>
                                    <select value={form.dosenWaliId}
                                        onChange={e => setForm({ ...form, dosenWaliId: e.target.value })}
                                        className={inputClass}>
                                        <option value="">-- Pilih Dosen --</option>
                                        {dosen.filter(d => d.isAktif).map(d => (
                                            <option key={d.id} value={d.id}>{d.nama}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Tahun Angkatan *</label>
                                    <input type="number" value={form.tahunAngkatan}
                                        onChange={e => setForm({ ...form, tahunAngkatan: e.target.value })}
                                        className={inputClass} min="2000" max="2030" />
                                </div>
                                <div>
                                    <label className={labelClass}>Semester</label>
                                    <select value={form.semester}
                                        onChange={e => setForm({ ...form, semester: e.target.value })}
                                        className={inputClass}>
                                        {[...Array(14)].map((_, i) => (
                                            <option key={i+1} value={i+1}>Semester {i+1}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Alamat</label>
                                    <textarea rows={2} value={form.alamat}
                                        onChange={e => setForm({ ...form, alamat: e.target.value })}
                                        className={`${inputClass} resize-none`} placeholder="Alamat domisili" />
                                </div>
                                {!editId && (
                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Password Akun</label>
                                        <input type="password" value={form.password}
                                            onChange={e => setForm({ ...form, password: e.target.value })}
                                            className={inputClass} placeholder="Kosongkan untuk password default" />
                                        <p className="text-xs text-slate-400 mt-1">Kosongkan untuk password default.</p>
                                    </div>
                                )}
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