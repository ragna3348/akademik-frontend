import { useState, useEffect } from 'react';
import Layout from '@/components/layouts/Layout';
import api from '@/utils/api';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Save, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function KeuanganJenisPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [limit, setLimit] = useState(25);
    const [page, setPage] = useState(1);

    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({ kode: '', nama: '', keterangan: '', isAktif: true });

    const fetchData = async () => {
        try {
            const res = await api.get('/keuangan/jenis');
            setData(res.data.data || []);
        } catch (error) {
            toast.error('Gagal memuat jenis keuangan');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async () => {
        if (!form.nama || !form.kode) {
            toast.error('Kode dan Nama wajib diisi!');
            return;
        }
        setSaving(true);
        try {
            if (editData) {
                await api.put(`/keuangan/jenis/${editData.id}`, form);
                toast.success('Jenis Keuangan diupdate!');
            } else {
                await api.post('/keuangan/jenis', form);
                toast.success('Jenis Keuangan ditambahkan!');
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
        if (!confirm('Yakin ingin menghapus jenis ini?')) return;
        try {
            await api.delete(`/keuangan/jenis/${id}`);
            toast.success('Jenis Terhapus');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menghapus');
        }
    };

    const handleEdit = (item) => {
        setEditData(item);
        setForm({ kode: item.kode, nama: item.nama, keterangan: item.keterangan || '', isAktif: item.isAktif });
        setShowModal(true);
    };

    const handleAdd = () => {
        setEditData(null);
        setForm({ kode: '', nama: '', keterangan: '', isAktif: true });
        setShowModal(true);
    };

    const filtered = data.filter(d => 
        (d.nama || '').toLowerCase().includes(search.toLowerCase()) || 
        (d.kode || '').toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / limit);
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return (
        <Layout title="Data Jenis Keuangan">
            <Toaster position="top-right" />
            <div className="bg-white border text-sm text-slate-800 border-slate-200 rounded-md">
                <div className="flex border-b items-center justify-between px-4 py-3">
                    <button onClick={handleAdd} className="flex items-center gap-2 border border-slate-300 px-3 py-1.5 rounded bg-slate-50 hover:bg-slate-100 font-medium">
                        <span className="text-xl leading-none -mt-1">+</span> Tambah
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
                        <input type="text" value={search} onChange={e => {setSearch(e.target.value); setPage(1)}} className="border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                </div>

                <div className="overflow-x-auto px-4 pb-2">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="border-b-2 border-slate-200">
                                <th className="p-2 font-semibold flex items-center gap-1 cursor-pointer">No <span className="text-slate-300 text-[10px]">▼▲</span></th>
                                <th className="p-2 font-semibold cursor-pointer">Kode Jenis <span className="text-slate-300 text-[10px]">▼▲</span></th>
                                <th className="p-2 font-semibold cursor-pointer">Nama Jenis <span className="text-slate-300 text-[10px]">▼▲</span></th>
                                <th className="p-2 font-semibold cursor-pointer">Keterangan <span className="text-slate-300 text-[10px]">▼▲</span></th>
                                <th className="p-2 font-semibold cursor-pointer w-24">Aksi <span className="text-slate-300 text-[10px]">▼▲</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="p-4 text-center text-slate-400">Loading...</td></tr>
                            ) : paginated.length === 0 ? (
                                <tr><td colSpan={5} className="p-4 text-center text-slate-400">Tidak ada data</td></tr>
                            ) : (
                                paginated.map((item, idx) => (
                                    <tr key={item.id} className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                                        <td className="p-2">{(page - 1) * limit + idx + 1}.</td>
                                        <td className="p-2">{item.kode}</td>
                                        <td className="p-2">{item.nama}</td>
                                        <td className="p-2">{item.keterangan || '-'}</td>
                                        <td className="p-2">
                                            <div className="flex gap-1.5">
                                                <button onClick={() => handleEdit(item)} className="p-1 border bg-white rounded text-slate-600 hover:text-blue-600">
                                                    <Edit2 size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(item.id)} className="p-1 border bg-white rounded text-slate-600 hover:text-red-500">
                                                    <Trash2 size={14} />
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-md shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b bg-slate-50">
                            <h2 className="font-semibold text-slate-700">{editData ? 'Edit Master Jenis' : 'Tambah Master Jenis'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                        </div>
                        <div className="p-4 space-y-4 text-sm">
                            <div>
                                <label className="block mb-1 text-slate-600">Kode Jenis *</label>
                                <input type="text" value={form.kode} onChange={e => setForm({...form, kode: e.target.value})} className="w-full border rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="1 / UPP / Pendaftaran" />
                            </div>
                            <div>
                                <label className="block mb-1 text-slate-600">Nama Jenis *</label>
                                <input type="text" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} className="w-full border rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Uang Pendaftaran" />
                            </div>
                            <div>
                                <label className="block mb-1 text-slate-600">Keterangan</label>
                                <textarea rows={2} value={form.keterangan} onChange={e => setForm({...form, keterangan: e.target.value})} className="w-full border rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.isAktif} onChange={e => setForm({...form, isAktif: e.target.checked})} className="rounded" />
                                    <span className="text-slate-600">Aktif</span>
                                </label>
                            </div>
                        </div>
                        <div className="p-4 border-t flex justify-end gap-2 bg-slate-50">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 border bg-white rounded text-slate-600 hover:bg-slate-50 text-sm">Batal</button>
                            <button onClick={handleSubmit} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center gap-2 disabled:opacity-50">
                                <Save size={14} /> {saving ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
