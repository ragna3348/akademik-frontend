import { useState, useEffect } from 'react';
import Layout from '@/components/layouts/Layout';
import api from '@/utils/api';
import toast, { Toaster } from 'react-hot-toast';
import {
    Search, Filter, Users, UserCheck, CreditCard,
    GraduationCap, XCircle, Eye, RefreshCw, X,
    Save, AlertTriangle, CheckCircle, Hash, Mail,
    Phone, MapPin, FileText, ExternalLink
} from 'lucide-react';

const statusConfig = {
    DAFTAR: { label: 'Mendaftar', className: 'bg-blue-50 text-blue-600 border-blue-200' },
    BAYAR: { label: 'Sudah Bayar', className: 'bg-amber-50 text-amber-600 border-amber-200' },
    LULUS: { label: 'Lulus', className: 'bg-green-50 text-green-600 border-green-200' },
    GUGUR: { label: 'Gugur', className: 'bg-red-50 text-red-500 border-red-200' },
};

export default function PendaftarPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [showDetail, setShowDetail] = useState(false);
    const [selected, setSelected] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusForm, setStatusForm] = useState({ status: '', alasan: '' });
    const [loadingStatus, setLoadingStatus] = useState(false);

    const fetchData = async () => {
        try {
            const res = await api.get('/pamaba/pendaftar');
            setData(res.data.data);
        } catch {
            toast.error('Gagal ambil data!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleOpenStatus = (pendaftar) => {
        setSelected(pendaftar);
        setStatusForm({ status: pendaftar.status, alasan: '' });
        setShowStatusModal(true);
    };

    const handleOpenDetail = (pendaftar) => {
        setSelected(pendaftar);
        setShowDetail(true);
    };

    const handleUbahStatus = async () => {
        if (!statusForm.status) { toast.error('Pilih status!'); return; }
        if (statusForm.status === 'GUGUR') {
            if (!confirm(`Mengubah status ke GUGUR akan menghapus akun ${selected.email}. Lanjutkan?`)) return;
        }
        setLoadingStatus(true);
        try {
            await api.patch(`/pamaba/pendaftar/${selected.id}/status`, {
                status: statusForm.status,
                alasan: statusForm.alasan || null
            });
            toast.success(statusForm.status === 'GUGUR'
                ? 'Status diupdate! Akun dihapus & email terkirim.'
                : 'Status berhasil diupdate!');
            setShowStatusModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal update status!');
        } finally {
            setLoadingStatus(false);
        }
    };

    const filtered = data.filter(d => {
        const matchSearch =
            d.nama?.toLowerCase().includes(search.toLowerCase()) ||
            d.email?.toLowerCase().includes(search.toLowerCase()) ||
            d.noPendaftaran?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus ? d.status === filterStatus : true;
        return matchSearch && matchStatus;
    });

    const stats = [
        { icon: Users, label: 'Total', value: data.length, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
        { icon: UserCheck, label: 'Mendaftar', value: data.filter(d => d.status === 'DAFTAR').length, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
        { icon: CreditCard, label: 'Sudah Bayar', value: data.filter(d => d.status === 'BAYAR').length, iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
        { icon: GraduationCap, label: 'Lulus', value: data.filter(d => d.status === 'LULUS').length, iconBg: 'bg-green-50', iconColor: 'text-green-600' },
        { icon: XCircle, label: 'Gugur', value: data.filter(d => d.status === 'GUGUR').length, iconBg: 'bg-red-50', iconColor: 'text-red-500' },
    ];

    const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400";
    const labelClass = "block text-sm font-medium text-slate-500 mb-1.5";

    return (
        <Layout title="Data Pendaftar">
            <Toaster position="top-right" />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
                {stats.map(s => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
                            <div className={`w-8 h-8 ${s.iconBg} rounded-lg flex items-center justify-center mb-2`}>
                                <Icon size={15} className={s.iconColor} />
                            </div>
                            <div className="text-2xl font-bold text-slate-700">{s.value}</div>
                            <div className="text-slate-400 text-sm">{s.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Filter */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Cari nama, email, no. pendaftaran..."
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
                </div>
                <div className="relative">
                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                        className="pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 bg-white appearance-none">
                        <option value="">Semua Status</option>
                        <option value="DAFTAR">Mendaftar</option>
                        <option value="BAYAR">Sudah Bayar</option>
                        <option value="LULUS">Lulus</option>
                        <option value="GUGUR">Gugur</option>
                    </select>
                </div>
            </div>

            {/* Tabel */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                {/* Desktop */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                {['No. Pendaftaran', 'Nama', 'Prodi', 'Gelombang', 'Status', 'Aksi'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                                    <div className="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2" />
                                    Memuat data...
                                </td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm">Tidak ada data</td></tr>
                            ) : filtered.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-mono text-xs text-indigo-600">{item.noPendaftaran}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-700 text-sm">{item.nama}</div>
                                        <div className="text-xs text-slate-400">{item.email}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-500">{item.prodi?.nama}</td>
                                    <td className="px-4 py-3 text-sm text-slate-500">{item.gelombang?.nama || '-'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${statusConfig[item.status]?.className}`}>
                                            {statusConfig[item.status]?.label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1.5">
                                            <button onClick={() => handleOpenDetail(item)}
                                                className="flex items-center gap-1 text-xs text-indigo-600 border border-indigo-200 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition">
                                                <Eye size={11} /> Detail
                                            </button>
                                            <button onClick={() => handleOpenStatus(item)}
                                                className="flex items-center gap-1 text-xs text-amber-600 border border-amber-200 px-2.5 py-1.5 rounded-lg hover:bg-amber-50 transition">
                                                <RefreshCw size={11} /> Status
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile */}
                <div className="md:hidden divide-y divide-slate-100">
                    {loading ? (
                        <div className="py-12 text-center">
                            <div className="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 text-sm">Tidak ada data</div>
                    ) : filtered.map(item => (
                        <div key={item.id} className="p-4">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div>
                                    <div className="font-medium text-slate-700 text-sm">{item.nama}</div>
                                    <div className="text-xs text-slate-400">{item.email}</div>
                                    <div className="text-xs text-indigo-600 font-mono mt-0.5">{item.noPendaftaran}</div>
                                    <div className="text-xs text-slate-400 mt-0.5">{item.prodi?.nama}</div>
                                </div>
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium border flex-shrink-0 ${statusConfig[item.status]?.className}`}>
                                    {statusConfig[item.status]?.label}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleOpenDetail(item)}
                                    className="flex items-center gap-1 text-xs text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg">
                                    <Eye size={11} /> Detail
                                </button>
                                <button onClick={() => handleOpenStatus(item)}
                                    className="flex items-center gap-1 text-xs text-amber-600 border border-amber-200 px-3 py-1.5 rounded-lg">
                                    <RefreshCw size={11} /> Status
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal Detail */}
            {showDetail && selected && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
                            <h2 className="font-bold text-slate-700">Detail Pendaftar</h2>
                            <button onClick={() => setShowDetail(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            {selected.foto && (
                                <div className="flex justify-center">
                                    <img src={`http://localhost:3000${selected.foto}`} alt="Foto"
                                        className="w-20 h-20 rounded-2xl object-cover border-4 border-indigo-100" />
                                </div>
                            )}
                            <div className="flex justify-center">
                                <span className={`text-xs px-3 py-1.5 rounded-full font-medium border ${statusConfig[selected.status]?.className}`}>
                                    {statusConfig[selected.status]?.label}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                {[
                                    { label: 'No. Pendaftaran', value: selected.noPendaftaran },
                                    { label: 'Nama Lengkap', value: selected.nama },
                                    { label: 'Email', value: selected.email },
                                    { label: 'Telepon', value: selected.telepon || '-' },
                                    { label: 'NIK', value: selected.nik || '-' },
                                    { label: 'NISN', value: selected.nisn || '-' },
                                    { label: 'Tempat Lahir', value: selected.tempatLahir || '-' },
                                    { label: 'Tanggal Lahir', value: selected.tanggalLahir ? new Date(selected.tanggalLahir).toLocaleDateString('id-ID') : '-' },
                                    { label: 'Jenis Kelamin', value: selected.jenisKelamin || '-' },
                                    { label: 'Agama', value: selected.agama || '-' },
                                    { label: 'Asal Sekolah', value: selected.asalSekolah || '-' },
                                    { label: 'Tahun Lulus', value: selected.tahunLulus || '-' },
                                    { label: 'Nilai Rapor', value: selected.nilaiRaport || '-' },
                                    { label: 'Program Studi', value: selected.prodi?.nama || '-' },
                                    { label: 'Jenis Mahasiswa', value: selected.jenisMhs?.nama || '-' },
                                    { label: 'Gelombang', value: selected.gelombang?.nama || '-' },
                                    { label: 'Tahun Daftar', value: selected.tahunDaftar },
                                ].map(({ label, value }) => (
                                    <div key={label} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                        <div className="text-xs text-slate-400 mb-1">{label}</div>
                                        <div className="font-medium text-slate-600 text-sm break-all">{value}</div>
                                    </div>
                                ))}
                            </div>

                            {selected.alamat && (
                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                                        <MapPin size={11} /> Alamat Domisili
                                    </div>
                                    <div className="font-medium text-slate-600 text-sm">{selected.alamat}</div>
                                </div>
                            )}

                            {/* Dokumen */}
                            <div>
                                <div className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
                                    <FileText size={14} /> Dokumen
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { label: 'Foto', key: 'foto' },
                                        { label: 'KTP', key: 'dokumenKTP' },
                                        { label: 'Kartu Keluarga', key: 'dokumenKK' },
                                        { label: 'Ijazah', key: 'dokumenIjazah' },
                                    ].map(({ label, key }) => (
                                        <div key={key} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                                            <div className="text-xs text-slate-400 mb-2">{label}</div>
                                            {selected[key] ? (
                                                <a href={`http://localhost:3000${selected[key]}`}
                                                    target="_blank" rel="noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                                                    <ExternalLink size={11} /> Lihat
                                                </a>
                                            ) : (
                                                <span className="text-xs text-slate-300">Belum upload</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-5 border-t flex justify-between">
                            <button onClick={() => { setShowDetail(false); handleOpenStatus(selected); }}
                                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-xl text-sm font-semibold transition">
                                <RefreshCw size={14} /> Ubah Status
                            </button>
                            <button onClick={() => setShowDetail(false)}
                                className="border border-slate-200 text-slate-500 px-5 py-2 rounded-xl text-sm hover:bg-slate-50 transition">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Ubah Status */}
            {showStatusModal && selected && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-5 border-b">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                                    <RefreshCw size={16} className="text-amber-500" />
                                </div>
                                <h2 className="font-bold text-slate-700">Ubah Status Pendaftar</h2>
                            </div>
                            <button onClick={() => setShowStatusModal(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                <div className="text-xs text-slate-400 mb-0.5">Pendaftar</div>
                                <div className="font-semibold text-slate-700">{selected.nama}</div>
                                <div className="text-sm text-slate-400">{selected.email}</div>
                            </div>

                            <div>
                                <label className={labelClass}>Status *</label>
                                <select value={statusForm.status}
                                    onChange={e => setStatusForm({ ...statusForm, status: e.target.value })}
                                    className={inputClass}>
                                    <option value="">-- Pilih Status --</option>
                                    <option value="DAFTAR">Mendaftar</option>
                                    <option value="BAYAR">Sudah Bayar</option>
                                    <option value="LULUS">Lulus Seleksi</option>
                                    <option value="GUGUR">Gugur / Ditolak</option>
                                </select>
                            </div>

                            {statusForm.status === 'GUGUR' && (
                                <>
                                    <div>
                                        <label className={labelClass}>Alasan Penolakan (opsional)</label>
                                        <textarea rows={3} value={statusForm.alasan}
                                            onChange={e => setStatusForm({ ...statusForm, alasan: e.target.value })}
                                            className={inputClass}
                                            placeholder="Contoh: Tidak memenuhi persyaratan administrasi" />
                                    </div>
                                    <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl p-3.5">
                                        <AlertTriangle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-red-600">
                                            <p className="font-semibold mb-1">Perhatian!</p>
                                            <ul className="space-y-0.5 text-xs list-disc list-inside">
                                                <li>Akun pendaftar akan dihapus permanen</li>
                                                <li>Email pemberitahuan akan dikirim ke <strong>{selected.email}</strong></li>
                                                <li>Pendaftar masih bisa daftar ulang dengan email yang sama</li>
                                            </ul>
                                        </div>
                                    </div>
                                </>
                            )}

                            {statusForm.status === 'LULUS' && (
                                <div className="flex items-start gap-2.5 bg-green-50 border border-green-200 rounded-xl p-3.5">
                                    <CheckCircle size={15} className="text-green-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-green-700">
                                        Pendaftar akan dinyatakan lulus seleksi. Proses heregistrasi dapat dilakukan setelah ini.
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="p-5 border-t flex gap-3">
                            <button onClick={() => setShowStatusModal(false)}
                                className="flex-1 border border-slate-200 text-slate-500 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition">
                                Batal
                            </button>
                            <button onClick={handleUbahStatus}
                                disabled={loadingStatus || !statusForm.status}
                                className={`flex-1 flex items-center justify-center gap-2 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition ${
                                    statusForm.status === 'GUGUR' ? 'bg-red-600 hover:bg-red-700' :
                                    statusForm.status === 'LULUS' ? 'bg-green-600 hover:bg-green-700' :
                                    'bg-indigo-600 hover:bg-indigo-700'
                                }`}>
                                {loadingStatus
                                    ? <><RefreshCw size={14} className="animate-spin" /> Memproses...</>
                                    : <><Save size={14} /> Simpan Status</>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}