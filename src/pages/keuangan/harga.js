import { useState, useEffect } from 'react';
import Layout from '@/components/layouts/Layout';
import api from '@/utils/api';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Save, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function KeuanganHargaPage() {
    const [data, setData] = useState([]);
    const [jenisKeuangan, setJenisKeuangan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [limit, setLimit] = useState(25);
    const [page, setPage] = useState(1);

    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({ jenisKeuanganId: '', nominal: '', angkatan: '', keterangan: '' });

    const fetchData = async () => {
        try {
            const [hargaRes, jenisRes] = await Promise.all([
                api.get('/keuangan/harga'),
                api.get('/keuangan/jenis')
            ]);
            setData(hargaRes.data.data || []);
            setJenisKeuangan(jenisRes.data.data?.filter(j => j.isAktif) || []);
        } catch (error) {
            toast.error('Gagal memuat data harga');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async () => {
        if (!form.jenisKeuanganId || !form.nominal) {
            toast.error('Jenis Keuangan dan Nominal wajib diisi!');
            return;
        }
        setSaving(true);
        try {
            if (editData) {
                await api.put(`/keuangan/harga/${editData.id}`, form);
                toast.success('Harga diupdate!');
            } else {
                await api.post('/keuangan/harga', form);
                toast.success('Harga ditambahkan!');
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Terjadi kesalahan!');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus harga ini?')) return;
        try {
            await api.delete(`/keuangan/harga/${id}`);
            toast.success('Harga Terhapus');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menghapus');
        }
    };

    const handleEdit = (item) => {
        setEditData(item);
        setForm({
            jenisKeuanganId: item.jenisKeuanganId,
            nominal: item.nominal,
            angkatan: item.angkatan || '',
            keterangan: item.keterangan || ''
        });
        setShowModal(true);
    };

    const handleAdd = () => {
        setEditData(null);
        setForm({ jenisKeuanganId: '', nominal: '', angkatan: '', keterangan: '' });
        setShowModal(true);
    };

    const filtered = data.filter(d => 
        (d.jenisKeuangan?.nama || '').toLowerCase().includes(search.toLowerCase()) || 
        (d.keterangan || '').toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / limit);
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return (
        <Layout title="Data Harga Keuangan">
            <Toaster position="top-right" />
            <div className="bg-white border text-sm text-slate-800 border-slate-200 rounded-md">
                <div className="flex border-b items-center justify-between px-4 py-3 bg-slate-50">
                    <button onClick={handleAdd} className="flex items-center gap-2 border border-slate-300 px-3 py-1.5 rounded bg-white hover:bg-slate-100 font-medium">
                        <span className="text-xl leading-none -mt-1">+</span> Tambah Harga
                    </button>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 gap-3">
                    <div className="flex items-center gap-2">
                        <span>Tampilkan</span>
                        <select value={limit} onChange={e => {setLimit(Number(e.target.value)); setPage(1)}} className="border rounded px-2 py-1">
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span>Per Halaman</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Pencarian</span>
                        <input type="text" value={search} onChange={e => {setSearch(e.target.value); setPage(1)}} placeholder="Cari nama jenis..." className="border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                </div>

                <div className="overflow-x-auto px-4 pb-2">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="border-b-2 border-slate-200 text-slate-700">
                                <th className="p-2 font-semibold">No <span className="text-slate-300 text-[10px] ml-1">▼▲</span></th>
                                <th className="p-2 font-semibold">Jenis Keuangan <span className="text-slate-300 text-[10px] ml-1">▼▲</span></th>
                                <th className="p-2 font-semibold">Tahun Angkatan <span className="text-slate-300 text-[10px] ml-1">▼▲</span></th>
                                <th className="p-2 font-semibold text-right">Nominal (Rp) <span className="text-slate-300 text-[10px] ml-1">▼▲</span></th>
                                <th className="p-2 font-semibold">Keterangan <span className="text-slate-300 text-[10px] ml-1">▼▲</span></th>
                                <th className="p-2 font-semibold w-24 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="p-4 text-center text-slate-400">Loading...</td></tr>
                            ) : paginated.length === 0 ? (
                                <tr><td colSpan={6} className="p-4 text-center text-slate-400">Tidak ada data</td></tr>
                            ) : (
                                paginated.map((item, idx) => (
                                    <tr key={item.id} className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                                        <td className="p-2">{(page - 1) * limit + idx + 1}.</td>
                                        <td className="p-2 font-medium text-slate-700">{item.jenisKeuangan?.nama || '-'}</td>
                                        <td className="p-2">{item.angkatan ? `Angkatan ${item.angkatan}` : <span className="text-slate-400 text-xs bg-slate-100 px-2 py-0.5 rounded">Semua Angkatan</span>}</td>
                                        <td className="p-2 text-right font-semibold text-blue-600">Rp {Number(item.nominal).toLocaleString('id-ID')}</td>
                                        <td className="p-2 text-slate-500">{item.keterangan || '-'}</td>
                                        <td className="p-2">
                                            <div className="flex justify-center gap-1.5">
                                                <button onClick={() => handleEdit(item)} className="p-1 border bg-white rounded text-slate-500 hover:text-blue-600">
                                                    <Edit2 size={13} />
                                                </button>
                                                <button onClick={() => handleDelete(item.id)} className="p-1 border bg-white rounded text-slate-500 hover:text-red-500">
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between items-center px-4 py-4 text-sm text-slate-600 border-t">
                    <div>Menampilkan {paginated.length > 0 ? (page - 1) * limit + 1 : 0} - {Math.min(page * limit, filtered.length)} dari total {filtered.length} item</div>
                    <div className="flex border rounded overflow-hidden">
                        <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1 bg-white hover:bg-slate-50 disabled:opacity-50 border-r text-slate-600"><ChevronLeft size={16} /></button>
                        <span className="px-3 py-1 bg-blue-500 text-white font-medium">{page}</span>
                        <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(page + 1)} className="px-3 py-1 bg-white hover:bg-slate-50 disabled:opacity-50 border-l text-slate-600"><ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-16 z-50 p-4">
                    <div className="bg-white rounded-md shadow-xl w-full max-w-md overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
                        <div className="flex items-center justify-between p-4 border-b bg-slate-50">
                            <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                                <DollarSign size={16} className="text-blue-500" />
                                {editData ? 'Edit Harga Keuangan' : 'Tambah Harga Keuangan'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                        </div>
                        <div className="p-5 space-y-4 text-sm">
                            <div>
                                <label className="block mb-1.5 font-medium text-slate-600">Jenis Keuangan *</label>
                                <select value={form.jenisKeuanganId} onChange={e => setForm({...form, jenisKeuanganId: e.target.value})} className="w-full border rounded-md p-2.5 focus:ring-1 focus:ring-blue-500 outline-none bg-white">
                                    <option value="">-- Pilih Jenis --</option>
                                    {jenisKeuangan.map(j => (
                                        <option key={j.id} value={j.id}>{j.kode} - {j.nama}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block mb-1.5 font-medium text-slate-600">Tahun Angkatan</label>
                                <input type="number" value={form.angkatan} onChange={e => setForm({...form, angkatan: e.target.value})} className="w-full border rounded-md p-2.5 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Isi tahun, kosongkan = Berlaku Umum" />
                                <p className="text-[11px] text-slate-400 mt-1">Biarkan kosong jika harga ini berlaku untuk semua pendaftar.</p>
                            </div>
                            <div>
                                <label className="block mb-1.5 font-medium text-slate-600">Nominal Harga (Rp) *</label>
                                <input type="number" value={form.nominal} onChange={e => setForm({...form, nominal: e.target.value})} className="w-full border rounded-md p-2.5 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="150000" />
                            </div>
                            <div>
                                <label className="block mb-1.5 font-medium text-slate-600">Keterangan Khusus</label>
                                <textarea rows={2} value={form.keterangan} onChange={e => setForm({...form, keterangan: e.target.value})} className="w-full border rounded-md p-2.5 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Opsional" />
                            </div>
                        </div>
                        <div className="p-4 border-t flex justify-end gap-2 bg-slate-50">
                            <button onClick={() => setShowModal(false)} className="px-5 py-2 border bg-white rounded-md font-medium text-slate-600 hover:bg-slate-50 text-sm transition">Batal</button>
                            <button onClick={handleSubmit} disabled={saving} className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm flex items-center gap-2 disabled:opacity-50 shadow-sm transition">
                                <Save size={14} /> {saving ? 'Menyimpan...' : 'Simpan Harga'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
