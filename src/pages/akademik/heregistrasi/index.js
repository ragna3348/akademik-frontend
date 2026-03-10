import { useState, useEffect } from 'react';
import Layout from '@/components/layouts/Layout';
import api from '@/utils/api';
import { useRole } from '@/utils/useRole';
import toast, { Toaster } from 'react-hot-toast';
import {
    Search, Filter, CheckCircle, Clock, Users,
    RefreshCw, X, UserCheck, Hash, Mail,
    Phone, School, GraduationCap, Calendar
} from 'lucide-react';

export default function HeregistrasiPage() {
    const { isReadOnly } = useRole();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterProdi, setFilterProdi] = useState('');
    const [selected, setSelected] = useState([]);
    const [processing, setProcessing] = useState(null);
    const [processingMassal, setProcessingMassal] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [detailItem, setDetailItem] = useState(null);

    const fetchData = async () => {
        try {
            const res = await api.get('/akademik/heregistrasi');
            setData(res.data.data);
        } catch {
            toast.error('Gagal ambil data!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const prodiList = [...new Set(data.map(d => d.prodi?.nama).filter(Boolean))];

    const filtered = data.filter(d => {
        const matchSearch =
            d.nama?.toLowerCase().includes(search.toLowerCase()) ||
            d.email?.toLowerCase().includes(search.toLowerCase()) ||
            d.noPendaftaran?.toLowerCase().includes(search.toLowerCase());
        const matchProdi = filterProdi ? d.prodi?.nama === filterProdi : true;
        return matchSearch && matchProdi;
    });

    const belumRegistrasi = filtered.filter(d => !d.sudahRegistrasi);
    const sudahRegistrasi = filtered.filter(d => d.sudahRegistrasi);

    const toggleSelect = (id) => {
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        const ids = belumRegistrasi.map(d => d.id);
        if (selected.length === ids.length) setSelected([]);
        else setSelected(ids);
    };

    const handleProses = async (pendaftarId, nama) => {
        if (!confirm(`Proses heregistrasi untuk ${nama}?`)) return;
        setProcessing(pendaftarId);
        try {
            const res = await api.post(`/akademik/heregistrasi/proses/${pendaftarId}`);
            toast.success(res.data.message);
            fetchData();
            setSelected(prev => prev.filter(x => x !== pendaftarId));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal proses!');
        } finally {
            setProcessing(null);
        }
    };

    const handleProsesMassal = async () => {
        if (selected.length === 0) { toast.error('Pilih minimal 1 pendaftar!'); return; }
        if (!confirm(`Proses heregistrasi untuk ${selected.length} pendaftar?`)) return;
        setProcessingMassal(true);
        try {
            const res = await api.post('/akademik/heregistrasi/proses-massal', { pendaftarIds: selected });
            const { berhasil, gagal } = res.data.data;
            toast.success(`${berhasil.length} berhasil diregistrasi!`);
            if (gagal.length > 0) toast.error(`${gagal.length} gagal!`);
            setSelected([]);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal proses massal!');
        } finally {
            setProcessingMassal(false);
        }
    };

    const stats = {
        total: data.length,
        belum: data.filter(d => !d.sudahRegistrasi).length,
        sudah: data.filter(d => d.sudahRegistrasi).length,
    };

    return (
        <Layout title="Heregistrasi">
            <Toaster position="top-right" />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                    { icon: Users, label: 'Total Lulus', value: stats.total, iconColor: 'text-indigo-600', iconBg: 'bg-indigo-50' },
                    { icon: Clock, label: 'Belum Registrasi', value: stats.belum, iconColor: 'text-orange-500', iconBg: 'bg-orange-50' },
                    { icon: CheckCircle, label: 'Sudah Registrasi', value: stats.sudah, iconColor: 'text-green-600', iconBg: 'bg-green-50' },
                ].map(s => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-5">
                            <div className={`w-9 h-9 ${s.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                                <Icon size={17} className={s.iconColor} />
                            </div>
                            <div className="text-2xl font-bold text-slate-800">{s.value}</div>
                            <div className="text-slate-400 text-sm mt-0.5">{s.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Filter & Aksi */}
            <div className="flex flex-col sm:flex-row gap-2 mb-5">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Cari nama, email, no. pendaftaran..."
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
                </div>
                <div className="relative">
                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select value={filterProdi} onChange={e => setFilterProdi(e.target.value)}
                        className="pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 appearance-none bg-white">
                        <option value="">Semua Prodi</option>
                        {prodiList.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                {selected.length > 0 && (
                    <button onClick={handleProsesMassal} disabled={processingMassal}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50 whitespace-nowrap transition">
                        {processingMassal ? (
                            <><RefreshCw size={14} className="animate-spin" /> Memproses...</>
                        ) : (
                            <><CheckCircle size={14} /> Proses {selected.length} Terpilih</>
                        )}
                    </button>
                )}
            </div>

            {/* Tabel Belum Registrasi */}
            {belumRegistrasi.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-4">
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-orange-100 bg-orange-50">
                        <div className="flex items-center gap-2">
                            <Clock size={15} className="text-orange-500" />
                            <span className="font-semibold text-orange-800 text-sm">
                                Belum Diregistrasi ({belumRegistrasi.length})
                            </span>
                        </div>
                        <button onClick={toggleSelectAll}
                            className="text-xs text-orange-600 hover:text-orange-800 font-medium">
                            {selected.length === belumRegistrasi.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                        </button>
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-4 py-3 w-10">
                                        <input type="checkbox"
                                            checked={selected.length === belumRegistrasi.length && belumRegistrasi.length > 0}
                                            onChange={toggleSelectAll}
                                            className="rounded border-slate-300" />
                                    </th>
                                    {['No. Pendaftaran', 'Nama', 'Program Studi', 'Jenis Kelas', 'Gelombang', 'Aksi'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {belumRegistrasi.map(item => (
                                    <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${selected.includes(item.id) ? 'bg-orange-50/60' : ''}`}>
                                        <td className="px-4 py-3">
                                            <input type="checkbox"
                                                checked={selected.includes(item.id)}
                                                onChange={() => toggleSelect(item.id)}
                                                className="rounded border-slate-300" />
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-indigo-600">{item.noPendaftaran}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-700 text-sm">{item.nama}</div>
                                            <div className="text-xs text-slate-400">{item.email}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{item.prodi?.nama}</td>
                                        <td className="px-4 py-3 text-sm text-slate-500">{item.jenisKelas?.nama || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-500">{item.gelombang?.nama || '-'}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button onClick={() => { setDetailItem(item); setShowDetail(true); }}
                                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1.5 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition">
                                                    Detail
                                                </button>
                                                <button onClick={() => handleProses(item.id, item.nama)}
                                                    disabled={processing === item.id}
                                                    className="flex items-center gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg disabled:opacity-50 transition">
                                                    {processing === item.id
                                                        ? <RefreshCw size={11} className="animate-spin" />
                                                        : <UserCheck size={11} />
                                                    }
                                                    {processing === item.id ? 'Proses...' : 'Registrasi'}
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
                        {belumRegistrasi.map(item => (
                            <div key={item.id} className={`p-4 ${selected.includes(item.id) ? 'bg-orange-50/60' : ''}`}>
                                <div className="flex items-start gap-3">
                                    <input type="checkbox" checked={selected.includes(item.id)}
                                        onChange={() => toggleSelect(item.id)}
                                        className="rounded border-slate-300 mt-1" />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-slate-700 text-sm">{item.nama}</div>
                                        <div className="text-xs text-slate-400">{item.email}</div>
                                        <div className="text-xs text-indigo-600 font-mono mt-0.5">{item.noPendaftaran}</div>
                                        <div className="text-xs text-slate-500 mt-1">{item.prodi?.nama}</div>
                                        <div className="flex gap-2 mt-3">
                                            <button onClick={() => { setDetailItem(item); setShowDetail(true); }}
                                                className="text-xs text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg">
                                                Detail
                                            </button>
                                            <button onClick={() => handleProses(item.id, item.nama)}
                                                disabled={processing === item.id}
                                                className="flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg disabled:opacity-50">
                                                <UserCheck size={11} />
                                                Registrasi
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tabel Sudah Registrasi */}
            {sudahRegistrasi.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-2 px-5 py-3.5 border-b border-green-100 bg-green-50">
                        <CheckCircle size={15} className="text-green-600" />
                        <span className="font-semibold text-green-800 text-sm">
                            Sudah Diregistrasi ({sudahRegistrasi.length})
                        </span>
                    </div>
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    {['Nama', 'NIM', 'Program Studi', 'Jenis Kelas', 'Status'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {sudahRegistrasi.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-700 text-sm">{item.nama}</div>
                                            <div className="text-xs text-slate-400">{item.email}</div>
                                        </td>
                                        <td className="px-4 py-3 font-mono font-bold text-indigo-600 text-sm">{item.mahasiswa?.nim}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{item.prodi?.nama}</td>
                                        <td className="px-4 py-3 text-sm text-slate-500">{item.jenisKelas?.nama || '-'}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center gap-1.5 text-xs bg-green-100 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-medium">
                                                <CheckCircle size={11} />
                                                {item.mahasiswa?.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {sudahRegistrasi.map(item => (
                            <div key={item.id} className="p-4 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="font-medium text-slate-700 text-sm">{item.nama}</div>
                                    <div className="font-mono text-xs text-indigo-600 mt-0.5">{item.mahasiswa?.nim}</div>
                                    <div className="text-xs text-slate-400 mt-0.5">{item.prodi?.nama}</div>
                                </div>
                                <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-1 rounded-full flex-shrink-0">
                                    {item.mahasiswa?.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty */}
            {data.length === 0 && !loading && (
                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <GraduationCap size={28} className="text-slate-400" />
                    </div>
                    <div className="text-slate-500 font-medium">Belum ada pendaftar berstatus LULUS</div>
                    <p className="text-slate-400 text-sm mt-1">Ubah status pendaftar ke LULUS di menu Pendaftar terlebih dahulu</p>
                </div>
            )}

            {/* Modal Detail */}
            {showDetail && detailItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
                            <h2 className="font-bold text-slate-800">Detail Pendaftar</h2>
                            <button onClick={() => setShowDetail(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-5">
                            {detailItem.foto && (
                                <div className="flex justify-center mb-4">
                                    <img src={`http://localhost:3000${detailItem.foto}`} alt="Foto"
                                        className="w-20 h-20 rounded-2xl object-cover border-4 border-indigo-100" />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                {[
                                    { icon: Hash, label: 'No. Pendaftaran', value: detailItem.noPendaftaran },
                                    { icon: Users, label: 'Nama', value: detailItem.nama },
                                    { icon: Mail, label: 'Email', value: detailItem.email },
                                    { icon: Phone, label: 'Telepon', value: detailItem.telepon || '-' },
                                    { icon: GraduationCap, label: 'Program Studi', value: detailItem.prodi?.nama },
                                    { icon: School, label: 'Jenjang', value: detailItem.prodi?.jenjang },
                                    { icon: Users, label: 'Jenis Kelas', value: detailItem.jenisKelas?.nama || '-' },
                                    { icon: Calendar, label: 'Gelombang', value: detailItem.gelombang?.nama || '-' },
                                    { icon: Calendar, label: 'Tahun Daftar', value: detailItem.tahunDaftar },
                                    { icon: School, label: 'Asal Sekolah', value: detailItem.asalSekolah || '-' },
                                ].map(({ icon: Icon, label, value }) => (
                                    <div key={label} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                                            <Icon size={11} />
                                            {label}
                                        </div>
                                        <div className="font-medium text-slate-700 text-sm break-all">{value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-5 border-t flex justify-between">
                            <button onClick={() => setShowDetail(false)}
                                className="border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm hover:bg-slate-50 transition">
                                Tutup
                            </button>
                            {!detailItem.sudahRegistrasi && (
                                <button onClick={() => { setShowDetail(false); handleProses(detailItem.id, detailItem.nama); }}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl font-semibold text-sm transition">
                                    <UserCheck size={15} />
                                    Proses Registrasi
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}