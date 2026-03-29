import { useState, useEffect } from 'react';
import Layout from '@/components/layouts/Layout';
import api from '@/utils/api';
import toast, { Toaster } from 'react-hot-toast';
import { School, Plus, Pencil, Trash2, X, Save, Hash, Award, Calendar, User, Search } from 'lucide-react';

const JENJANG_OPTIONS = ['D3', 'D4', 'S1', 'S2', 'S3'];
const AKREDITASI_OPTIONS = ['Unggul', 'Baik Sekali', 'Baik', 'A', 'B', 'C', 'Belum Terakreditasi'];

export default function ProdiPage() {
    const [data, setData] = useState([]);
    const [dosenList, setDosenList] = useState([]);
    const [fakultasList, setFakultasList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');

    const [form, setForm] = useState({
        kode: '', kodeNim: '', nama: '', jenjang: 'S1',
        fakultasId: '', skProdi: '', akreditasi: '',
        tglExAkreditasi: '', kaprodiId: ''
    });

    const fetchData = async () => {
        try {
            const [prodiRes, dosenRes] = await Promise.all([
                api.get('/prodi'),
                api.get('/akademik/dosen').catch(() => ({ data: { data: [] } })),
            ]);
            setData(prodiRes.data.data);
            setDosenList(dosenRes.data.data || []);

            // Fetch fakultas jika ada
            try {
                const fakRes = await api.get('/fakultas');
                setFakultasList(fakRes.data.data || []);
            } catch {}
        } catch {
            toast.error('Gagal ambil data!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleOpen = (item = null) => {
        setEditData(item);
        setForm(item ? {
            kode: item.kode, kodeNim: item.kodeNim, nama: item.nama, jenjang: item.jenjang,
            fakultasId: item.fakultasId || '', skProdi: item.skProdi || '',
            akreditasi: item.akreditasi || '',
            tglExAkreditasi: item.tglExAkreditasi ? item.tglExAkreditasi.slice(0, 10) : '',
            kaprodiId: item.kaprodiId || ''
        } : {
            kode: '', kodeNim: '', nama: '', jenjang: 'S1',
            fakultasId: '', skProdi: '', akreditasi: '',
            tglExAkreditasi: '', kaprodiId: ''
        });
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!form.kode || !form.kodeNim || !form.nama || !form.jenjang) {
            toast.error('Kode, Kode NIM, Nama, dan Jenjang wajib diisi!');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                ...form,
                fakultasId: form.fakultasId || null,
                kaprodiId: form.kaprodiId || null,
                tglExAkreditasi: form.tglExAkreditasi || null,
            };
            if (editData) {
                await api.put(`/prodi/${editData.id}`, payload);
                toast.success('Prodi berhasil diupdate!');
            } else {
                await api.post('/prodi', payload);
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
        if (!confirm(`Yakin hapus prodi "${nama}"? Data mahasiswa terkait bisa terpengaruh.`)) return;
        try {
            await api.delete(`/prodi/${id}`);
            toast.success('Prodi berhasil dihapus!');
            fetchData();
        } catch {
            toast.error('Gagal hapus! Pastikan tidak ada data mahasiswa terkait.');
        }
    };

    const filtered = data.filter(d =>
        !search || d.nama.toLowerCase().includes(search.toLowerCase()) ||
        d.kode.toLowerCase().includes(search.toLowerCase())
    );

    const hasFakultas = data.some(d => d.fakultas);

    const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition";
    const labelClass = "block text-sm font-medium text-slate-600 mb-1.5";

    const akreditasiColor = (akr) => {
        if (!akr) return 'bg-slate-100 text-slate-500';
        if (akr === 'Unggul' || akr === 'A') return 'bg-green-50 text-green-700 border-green-200';
        if (akr === 'Baik Sekali' || akr === 'B') return 'bg-blue-50 text-blue-700 border-blue-200';
        return 'bg-amber-50 text-amber-700 border-amber-200';
    };

    return (
        <Layout title="Program Studi">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                <div className="relative flex-1 max-w-sm">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={search}
                        onChange={e => setSearch(e.target.value)}
                        className={`${inputClass} pl-9`}
                        placeholder="Cari prodi..." />
                </div>
                <button onClick={() => handleOpen()}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm">
                    <Plus size={16} /> Tambah Prodi
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <School size={28} className="text-slate-400" />
                    </div>
                    <div className="text-slate-500 font-medium">Belum ada program studi</div>
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600 w-10">No</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600 w-24">Kode</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600 w-16">Jenjang</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Nama Program Studi</th>
                                    {hasFakultas && <th className="text-left px-4 py-3 font-semibold text-slate-600">Fakultas</th>}
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600 w-32">SK Prodi</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600 w-28">Akreditasi</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600 w-28">Tgl Ex</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600 w-40">Kaprodi</th>
                                    <th className="text-center px-4 py-3 font-semibold text-slate-600 w-16">Mhs</th>
                                    <th className="text-center px-4 py-3 font-semibold text-slate-600 w-24">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map((item, i) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                                        <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                                        <td className="px-4 py-3">
                                            <code className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-mono font-bold">{item.kode}</code>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium">{item.jenjang}</span>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-slate-700">{item.nama}</td>
                                        {hasFakultas && <td className="px-4 py-3 text-slate-500">{item.fakultas?.nama || '-'}</td>}
                                        <td className="px-4 py-3 text-slate-500 text-xs">{item.skProdi || '-'}</td>
                                        <td className="px-4 py-3">
                                            {item.akreditasi ? (
                                                <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium border ${akreditasiColor(item.akreditasi)}`}>
                                                    {item.akreditasi}
                                                </span>
                                            ) : <span className="text-slate-400 text-xs">-</span>}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-500">
                                            {item.tglExAkreditasi ? new Date(item.tglExAkreditasi).toLocaleDateString('id-ID') : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{item.kaprodi?.nama || '-'}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-bold">{item._count?.mahasiswa || 0}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1">
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
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                                    <School size={17} className="text-blue-600" />
                                </div>
                                <h2 className="font-bold text-slate-800">
                                    {editData ? 'Edit Program Studi' : 'Tambah Program Studi'}
                                </h2>
                            </div>
                            <button onClick={() => setShowModal(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition"><X size={18} /></button>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Row: Kode + Kode NIM */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>Kode Prodi *</label>
                                    <input type="text" value={form.kode}
                                        onChange={e => setForm({ ...form, kode: e.target.value })}
                                        className={inputClass} placeholder="Contoh: TIF"
                                        disabled={!!editData} />
                                </div>
                                <div>
                                    <label className={labelClass}>Kode NIM *</label>
                                    <input type="text" value={form.kodeNim}
                                        onChange={e => setForm({ ...form, kodeNim: e.target.value })}
                                        className={inputClass} placeholder="Contoh: 11" />
                                </div>
                            </div>

                            {/* Nama */}
                            <div>
                                <label className={labelClass}>Nama Program Studi *</label>
                                <input type="text" value={form.nama}
                                    onChange={e => setForm({ ...form, nama: e.target.value })}
                                    className={inputClass} placeholder="Contoh: Teknik Informatika" />
                            </div>

                            {/* Row: Jenjang + Fakultas */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>Jenjang *</label>
                                    <select value={form.jenjang}
                                        onChange={e => setForm({ ...form, jenjang: e.target.value })}
                                        className={inputClass}>
                                        {JENJANG_OPTIONS.map(j => <option key={j} value={j}>{j}</option>)}
                                    </select>
                                </div>
                                {fakultasList.length > 0 && (
                                    <div>
                                        <label className={labelClass}>Fakultas</label>
                                        <select value={form.fakultasId}
                                            onChange={e => setForm({ ...form, fakultasId: e.target.value })}
                                            className={inputClass}>
                                            <option value="">Pilih Fakultas</option>
                                            {fakultasList.map(f => <option key={f.id} value={f.id}>{f.nama}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-slate-200 pt-4">
                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-3">Detail Akreditasi</p>
                            </div>

                            {/* SK Prodi */}
                            <div>
                                <label className={labelClass}>SK Prodi</label>
                                <input type="text" value={form.skProdi}
                                    onChange={e => setForm({ ...form, skProdi: e.target.value })}
                                    className={inputClass} placeholder="Nomor SK Prodi" />
                            </div>

                            {/* Row: Akreditasi + Tanggal Expiry */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>Akreditasi</label>
                                    <select value={form.akreditasi}
                                        onChange={e => setForm({ ...form, akreditasi: e.target.value })}
                                        className={inputClass}>
                                        <option value="">Pilih Akreditasi</option>
                                        {AKREDITASI_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Tgl Expiry Akreditasi</label>
                                    <input type="date" value={form.tglExAkreditasi}
                                        onChange={e => setForm({ ...form, tglExAkreditasi: e.target.value })}
                                        className={inputClass} />
                                </div>
                            </div>

                            {/* Kaprodi */}
                            <div>
                                <label className={labelClass}>Kepala Program Studi (Kaprodi)</label>
                                <select value={form.kaprodiId}
                                    onChange={e => setForm({ ...form, kaprodiId: e.target.value })}
                                    className={inputClass}>
                                    <option value="">Pilih Dosen</option>
                                    {dosenList.map(d => (
                                        <option key={d.id} value={d.id}>{d.nama} ({d.nidn})</option>
                                    ))}
                                </select>
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