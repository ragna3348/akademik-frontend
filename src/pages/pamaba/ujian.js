import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { LayoutDashboard, Clock, FileText, AlertTriangle } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function UjianCBT() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [soal, setSoal] = useState([]);
    const [ujian, setUjian] = useState(null);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [jawabanState, setJawabanState] = useState({});

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        const fetchInit = async () => {
            try {
                // Cek status pendaftar
                const stRes = await axios.get(`${BASE_URL}/auth/cek-status`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!stRes.data.success) throw new Error('Unauth');
                
                const { pendaftar, sudahDaftar } = stRes.data.data;
                if (!sudahDaftar) {
                    toast.error('Anda belum mendaftar!');
                    router.push('/daftar');
                    return;
                }

                if (pendaftar.status === 'SELESAI_UJIAN' || pendaftar.status === 'LULUS' || pendaftar.status === 'GUGUR') {
                    router.push('/dashboard'); // atau halaman hasil ujian
                    return;
                }

                // Ambil soal ujian
                const res = await axios.get(`${BASE_URL}/pamaba/ujian/soal`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setUjian(res.data.data.ujian);
                setSoal(res.data.data.soal);

                // Map jawaban yang ada
                const jMap = {};
                (res.data.data.ujian.jawaban || []).forEach(jwb => {
                    jMap[jwb.soalId] = jwb.jawaban;
                });
                setJawabanState(jMap);

                setLoading(false);
            } catch (err) {
                console.error(err);
                toast.error('Gagal memuat ujian');
            }
        };

        fetchInit();
    }, [router]);

    const handlePilihJawaban = async (soalId, jwb) => {
        setJawabanState(prev => ({ ...prev, [soalId]: jwb }));
        
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${BASE_URL}/pamaba/ujian/jawaban`, {
                ujianId: ujian.id,
                soalId,
                jawaban: jwb
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            toast.error('Gagal menyimpan otomatis');
        }
    };

    const selesaikanUjian = async () => {
        if (!window.confirm('Yakin ingin menyelesaikan ujian? Anda tidak bisa mengubah jawaban lagi setelah ini.')) return;
        
        try {
             const token = localStorage.getItem('token');
             await axios.post(`${BASE_URL}/pamaba/ujian/akhiri`, {
                 ujianId: ujian.id
             }, {
                 headers: { Authorization: `Bearer ${token}` }
             });
             toast.success('Ujian Selesai!');
             router.push('/dashboard');
        } catch (err) {
             toast.error('Gagal mengakhiri ujian');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 font-medium animate-pulse">Memuat Soal Ujian CBT...</p>
        </div>
    );

    const s = soal[currentIdx];

    if (!soal.length) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <p className="mt-4 text-slate-500 font-medium text-lg">Tidak ada soal yang tersedia.</p>
                <button onClick={() => router.push('/dashboard')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">Kembali</button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-100 font-sans pb-10">
            <Toaster position="top-right" />
            
            {/* Header */}
            <header className="bg-indigo-900 border-b border-indigo-800 sticky top-0 z-50 shadow-md">
                <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                            <FileText className="text-white" size={20} />
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-lg leading-tight">Ujian PMB Online</h1>
                            <p className="text-indigo-200 text-xs text-opacity-80">Sistem Informasi Akademik CBT</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center bg-indigo-800/50 rounded-full px-4 py-1.5 border border-indigo-700">
                            <Clock size={16} className="text-indigo-300 mr-2" />
                            <span className="text-white font-semibold tabular-nums tracking-widest text-sm">BERLANGSUNG</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Main Content (Soal) */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                        <div className="flex justify-between border-b border-slate-100 pb-4 mb-6">
                            <h2 className="text-slate-500 font-semibold text-sm tracking-widest uppercase">
                                Pertanyaan {currentIdx + 1} dari {soal.length}
                            </h2>
                            {s?.kategori && <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">{s.kategori}</span>}
                        </div>
                        
                        <div className="prose max-w-none text-slate-800 text-lg sm:text-xl font-medium mb-10 leading-relaxed">
                            {s?.pertanyaan}
                        </div>

                        <div className="space-y-3">
                            {['A', 'B', 'C', 'D'].map(opsiKey => {
                                const opsiVal = s?.[`opsi${opsiKey}`];
                                if (!opsiVal) return null;
                                
                                const isSelected = jawabanState[s.id] === opsiKey;
                                return (
                                    <div key={opsiKey} 
                                         onClick={() => handlePilihJawaban(s.id, opsiKey)}
                                         className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 
                                            ${isSelected 
                                                ? 'border-indigo-500 bg-indigo-50 ring-4 ring-indigo-50' 
                                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                            }`}>
                                         <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm transition-colors
                                            ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                            {opsiKey}
                                         </div>
                                         <div className={`text-base mt-1 ${isSelected ? 'text-indigo-900 font-medium' : 'text-slate-600'}`}>
                                            {opsiVal}
                                         </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex justify-between items-center bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <button 
                            disabled={currentIdx === 0}
                            onClick={() => setCurrentIdx(c => c - 1)}
                            className="px-6 py-2.5 rounded-lg text-slate-600 font-medium hover:bg-slate-100 disabled:opacity-50 transition border border-slate-200">
                            Sebelumnya
                        </button>
                        <button 
                            disabled={currentIdx === soal.length - 1}
                            onClick={() => setCurrentIdx(c => c + 1)}
                            className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm shadow-indigo-200">
                            Selanjutnya
                        </button>
                    </div>
                </div>

                {/* Sidebar (Navigasi & Selesai) */}
                <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <LayoutDashboard size={18} className="text-slate-400" />
                            <h3 className="font-semibold text-slate-800">Navigasi Soal</h3>
                        </div>
                        
                        <div className="grid grid-cols-5 gap-2 mb-6">
                            {soal.map((sl, index) => {
                                const isAnswered = !!jawabanState[sl.id];
                                const isCurrent = currentIdx === index;
                                return (
                                    <button 
                                        key={sl.id}
                                        onClick={() => setCurrentIdx(index)}
                                        className={`w-full aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all
                                            ${isCurrent ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
                                            ${isAnswered 
                                                ? 'bg-indigo-500 text-white border-none' 
                                                : isCurrent ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                                            }`}>
                                        {index + 1}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-slate-100 pt-4">
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-indigo-500"></div> Dijawab</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full border border-slate-300"></div> Kosong</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-2xl shadow-lg border border-indigo-700 p-6 text-white text-center">
                        <AlertTriangle size={28} className="text-yellow-400 mx-auto mb-3" />
                        <h3 className="font-bold text-lg mb-2">Selesai Mengerjakan?</h3>
                        <p className="text-indigo-200 text-sm mb-5 leading-relaxed">
                            Pastikan semua soal telah terjawab. Ujian tidak bisa diulang setelah Anda menekan tombol di bawah.
                        </p>
                        <button 
                            onClick={selesaikanUjian}
                            className="w-full bg-yellow-500 hover:bg-yellow-400 text-indigo-950 font-bold py-3 rounded-xl transition duration-200 shadow-xl shadow-yellow-500/20">
                            Akhiri Ujian
                        </button>
                    </div>
                </div>

            </main>
        </div>
    );
}
