import { useState, useEffect } from 'react';
import Layout from '@/components/layouts/Layout';
import api from '@/utils/api';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { 
    Home, Users, PercentCircle, DollarSign, UserCog, 
    ShieldCheck, AlertCircle, Settings, FileBarChart,
    Search, Calendar, Filter, Download
} from 'lucide-react';

export default function KeuanganDashboard() {
    const router = useRouter();
    const [data, setData] = useState([]);
    const [summary, setSummary] = useState({ totalBelum: 0, totalLunas: 0, totalTagihan: 0 });
    const [mahasiswa, setMahasiswa] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [searchName, setSearchName] = useState('');
    const [filterTanggal, setFilterTanggal] = useState('');
    const [filterMetode, setFilterMetode] = useState('');

    const fetchData = async () => {
        try {
            const params = { status: 'belum_bayar' };
            if (searchName) params.search = searchName;
            
            const [keuRes, mhsRes] = await Promise.all([
                api.get('/keuangan', { params }),
                api.get('/akademik/mahasiswa')
            ]);
            setData(keuRes.data.data || []);
            setSummary(keuRes.data.summary || {});
            setMahasiswa(mhsRes.data.data || []);
        } catch { 
            toast.error('Gagal ambil data tagihan!'); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { fetchData(); }, [filterTanggal, filterMetode]);

    const handleSearchClick = () => {
        fetchData();
    };

    const handleBayar = async (id) => {
        if (!confirm('Tandai tagihan ini sebagai LUNAS?')) return;
        try {
            await api.patch(`/keuangan/${id}/bayar`);
            toast.success('Pembayaran dikonfirmasi!');
            fetchData();
        } catch { 
            toast.error('Gagal konfirmasi pembayaran!'); 
        }
    };

    const menus = [
        { icon: Home, label: 'Beranda', path: '/keuangan', active: true },
        { icon: Users, label: 'Mahasiswa', path: '#' },
        { icon: PercentCircle, label: 'Diskon', path: '#' },
        { icon: DollarSign, label: 'Harga', path: '/keuangan/harga' },
        { icon: UserCog, label: 'User', path: '#' },
        { icon: ShieldCheck, label: 'Whitelist', path: '#' },
        { icon: AlertCircle, label: 'Tunggakan', path: '#' },
        { icon: Settings, label: 'Setting', path: '/keuangan/jenis' },
        { icon: FileBarChart, label: 'Laporan', path: '#' },
    ];

    return (
        <Layout title="Data Keuangan">
            <Toaster position="top-right" />
            
            <div className="flex flex-col lg:flex-row gap-6">
                
                {/* PANEL KIRI (SIDEBAR MENU) */}
                <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-5">
                    
                    {/* Proses Transaksi */}
                    <div className="bg-white border border-slate-200 rounded-sm">
                        <div className="text-slate-600 font-medium px-4 py-3 border-b border-slate-100 uppercase text-sm tracking-wide">
                            Proses Transaksi
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-2">NIM/Mahasiswa :</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={searchName}
                                        onChange={e => setSearchName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                                        placeholder="NIM / Nama Mahasiswa" 
                                        className="w-full border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                    />
                                    <button 
                                        onClick={handleSearchClick}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium whitespace-nowrap transition"
                                    >
                                        Proses
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Menu Keuangan Grid */}
                    <div className="bg-white border border-slate-200 rounded-sm">
                        <div className="text-slate-600 font-medium px-4 py-3 border-b border-slate-100 uppercase text-sm tracking-wide">
                            Menu Keuangan
                        </div>
                        <div className="p-4 grid grid-cols-3 gap-3">
                            {menus.map((m, idx) => {
                                const Icon = m.icon;
                                return (
                                    <button 
                                        key={idx}
                                        onClick={() => m.path !== '#' && router.push(m.path)}
                                        className={`flex flex-col items-center justify-center p-3 rounded border hover:border-blue-400 hover:bg-blue-50 transition cursor-pointer group h-20 ${m.active ? 'border-none bg-[#f1f5f9] shadow-inner text-blue-800' : 'bg-[#fcfdfd] border-slate-200 text-slate-600'}`}
                                    >
                                        <Icon size={22} className={`mb-2 ${m.active ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-500'}`} strokeWidth={1.5} />
                                        <span className={`text-[11px] font-medium leading-tight ${m.active ? 'text-blue-700' : 'text-slate-600 hover:text-blue-600'}`}>{m.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* PANEL KANAN (CONTENT) */}
                <div className="flex-1 flex flex-col gap-6">
                    
                    <div className="bg-white border border-slate-200 rounded-sm">
                        
                        {/* Tab Headers */}
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <h2 className="text-lg text-slate-700 font-normal">Beranda</h2>
                            <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border border-slate-300 rounded bg-[#fcfdfd] hover:bg-slate-50 text-slate-700 transition">
                                <Download size={13} /> Export Keuangan
                            </button>
                        </div>
                        
                        {/* Filters */}
                        <div className="p-6 pb-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-2">Filter Tanggal :</label>
                                    <div className="flex">
                                        <input type="date" value={filterTanggal} onChange={e => setFilterTanggal(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-2">Filter Metode Bayar :</label>
                                    <select value={filterMetode} onChange={e => setFilterMetode(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500 bg-white">
                                        <option value="">PILIH METODE BAYAR</option>
                                        <option value="CASH">CASH</option>
                                        <option value="TRANSFER">TRANSFER BANK</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Tampilkan</label>
                                    <select className="border border-slate-300 rounded px-3 py-1 bg-white text-sm outline-none">
                                        <option>10</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Pencarian</label>
                                    <input type="text" className="border border-slate-300 rounded px-2 py-1 w-48 text-sm outline-none focus:border-blue-500" />
                                </div>
                            </div>

                            {/* Main Table */}
                            <div className="overflow-x-auto border-t">
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b-2 border-slate-200">
                                            <th className="py-3 px-2 font-bold text-slate-700 w-12 text-center">No</th>
                                            <th className="py-3 px-2 font-bold text-slate-700 w-32">Kode Print <span className="text-slate-300 text-[10px] ml-1">▼▲</span></th>
                                            <th className="py-3 px-2 font-bold text-slate-700">NIM</th>
                                            <th className="py-3 px-2 font-bold text-slate-700">Nama Mahasiswa <span className="text-slate-300 text-[10px] ml-1">▼▲</span></th>
                                            <th className="py-3 px-2 font-bold text-slate-700 text-center">Jenis Pembayaran <span className="text-slate-300 text-[10px] ml-1">▼▲</span></th>
                                            <th className="py-3 px-2 font-bold text-slate-700 text-right">Jumlah <span className="text-slate-300 text-[10px] ml-1">▼▲</span></th>
                                            <th className="py-3 px-2 font-bold text-slate-700 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-slate-600">
                                        {loading ? (
                                            <tr><td colSpan={7} className="text-center py-8">Memuat data...</td></tr>
                                        ) : data.length === 0 ? (
                                            <tr><td colSpan={7} className="text-center py-8">Tidak ada tagihan tertunda!</td></tr>
                                        ) : (
                                            data.map((item, idx) => {
                                                // Create a dummy Kode Print to match visual requirements "26/03/KWT/00077"
                                                const d = new Date(item.tanggal);
                                                const dStr = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/KWT/${String(item.id).padStart(5,'0')}`;
                                                
                                                return (
                                                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                        <td className="py-2.5 px-2 text-center">{idx + 1}.</td>
                                                        <td className="py-2.5 px-2">
                                                            <div className="bg-[#4d7ca6] text-white text-[11px] font-mono px-2 py-1 rounded inline-block shadow-sm">
                                                                {dStr}
                                                            </div>
                                                        </td>
                                                        <td className="py-2.5 px-2">{item.mahasiswa?.nim || '-'}</td>
                                                        <td className="py-2.5 px-2 font-medium">{item.mahasiswa?.nama}</td>
                                                        <td className="py-2.5 px-2 text-center">{item.jenis}</td>
                                                        <td className="py-2.5 px-2 text-right">Rp {Number(item.nominal).toLocaleString('id-ID')}</td>
                                                        <td className="py-2.5 px-2 text-center">
                                                            <button 
                                                                onClick={() => handleBayar(item.id)}
                                                                className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded transition"
                                                            >
                                                                Bayar
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="flex justify-between items-center py-4 text-sm text-slate-500">
                                <div>Menampilkan 1 - {data.length} item dari total {data.length} item</div>
                                <div className="flex items-center gap-1 border rounded p-0.5">
                                    <button className="px-2 py-1 text-slate-400">&lt;</button>
                                    <button className="px-2.5 py-1 bg-[#4d7ca6] text-white rounded font-medium">1</button>
                                    <button className="px-2 py-1 text-slate-400">&gt;</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rekapitulasi Table */}
                    <div className="bg-white border border-slate-200 rounded-sm p-6">
                        <h3 className="text-slate-700 font-normal mb-6">Rekapitulasi Transaksi</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-slate-200">
                                        <th className="py-2 font-bold text-slate-700">Kode Jenis</th>
                                        <th className="py-2 font-bold text-slate-700">Transaksi</th>
                                        <th className="py-2 font-bold text-slate-700 text-right">Total Transaksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-slate-100">
                                        <td className="py-3 text-slate-600">ALL</td>
                                        <td className="py-3 text-slate-600">Semua Tagihan Tertunda</td>
                                        <td className="py-3 text-right font-bold text-slate-700">Rp {Number(summary.totalBelum || 0).toLocaleString('id-ID')}</td>
                                    </tr>
                                    <tr className="border-b border-slate-100">
                                        <td className="py-3 text-slate-600">LUNAS</td>
                                        <td className="py-3 text-slate-600">Total Pemasukan Berhasil</td>
                                        <td className="py-3 text-right font-bold text-green-600">Rp {Number(summary.totalLunas || 0).toLocaleString('id-ID')}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
            
            {/* Footer text */}
            <div className="text-[10px] font-bold text-slate-400 mt-10 tracking-widest uppercase">
                © POLITEKNIK NSC SURABAYA
            </div>
        </Layout>
    );
}