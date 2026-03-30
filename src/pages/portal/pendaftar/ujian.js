import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { ChevronRight, ChevronLeft, Flag, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function PendaftarUjian() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [soalList, setSoalList] = useState([]);
    const [ujianId, setUjianId] = useState(null);
    const [jawabanState, setJawabanState] = useState({}); // { soalId: { jawaban: 'A', raguRagu: true } }
    
    // UI State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [showSubmitModal, setShowSubmitModal] = useState(false);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${BASE_URL}/pamaba/ujian/soal`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data?.success) {
                const { ujian, soal } = res.data.data;
                setSoalList(soal);
                setUjianId(ujian.id);

                // Map jawaban yang sudah tersimpan
                const mappedJwb = {};
                (ujian.jawaban || []).forEach(jwb => {
                    mappedJwb[jwb.soalId] = {
                        jawaban: jwb.jawaban,
                        raguRagu: jwb.raguRagu
                    };
                });
                setJawabanState(mappedJwb);
            }
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'Gagal mengambil data ujian. Mungkin Anda belum diizinkan atau sudah menyelesaikannya.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectOption = async (opsiPilihan) => {
        const soal = soalList[currentIndex];
        if (!soal) return;

        // Optimistic update
        const prevData = jawabanState[soal.id] || {};
        const newData = { ...prevData, jawaban: opsiPilihan };
        setJawabanState(prev => ({ ...prev, [soal.id]: newData }));

        // Simpan ke db
        saveJawaban(soal.id, newData.jawaban, newData.raguRagu);
    };

    const handleToggleRagu = async () => {
        const soal = soalList[currentIndex];
        if (!soal) return;

        const prevData = jawabanState[soal.id] || {};
        const newData = { ...prevData, raguRagu: !prevData.raguRagu };
        setJawabanState(prev => ({ ...prev, [soal.id]: newData }));

        saveJawaban(soal.id, newData.jawaban, newData.raguRagu);
    };

    const saveJawaban = async (soalId, jwb, ragu) => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${BASE_URL}/pamaba/ujian/jawaban`, {
                ujianId,
                soalId,
                jawaban: jwb,
                raguRagu: ragu
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error('Gagal save', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAkhiriUjian = async () => {
        try {
            setIsSaving(true);
            const token = localStorage.getItem('token');
            await axios.post(`${BASE_URL}/pamaba/ujian/akhiri`, { ujianId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Ujian telah selesai. Terima kasih!');
            router.push('/selesaikan-pendaftaran');
        } catch (err) {
            alert('Gagal mengakhiri ujian: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
                <p className="text-slate-600 font-medium">Memuat Naskah Ujian...</p>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Akses Ditolak</h2>
                    <p className="text-slate-600 mb-6">{errorMsg}</p>
                    <button onClick={() => router.push('/selesaikan-pendaftaran')} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 rounded-lg font-semibold transition">
                        Kembali
                    </button>
                </div>
            </div>
        );
    }

    if (!soalList || soalList.length === 0) {
         return (
             <div className="min-h-screen flex items-center justify-center text-slate-500">
                 Belum ada soal ujian tersedia pada bank soal.
             </div>
         );
    }

    const currentSoal = soalList[currentIndex];
    const currentJwb = jawabanState[currentSoal?.id] || {};

    const options = [
        { label: 'A', text: currentSoal.opsiA },
        { label: 'B', text: currentSoal.opsiB },
        { label: 'C', text: currentSoal.opsiC },
        { label: 'D', text: currentSoal.opsiD },
    ].filter(o => o.text !== null && o.text !== undefined && o.text !== '');

    const totalTerjawab = Object.values(jawabanState).filter(j => j.jawaban).length;

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
            {/* Header / Sidebar Mobile */}
            <div className="md:w-80 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 h-auto md:h-screen md:sticky md:top-0">
                <div className="p-5 border-b border-slate-200">
                    <h1 className="text-xl font-bold text-slate-800">Ujian Seleksi PMB</h1>
                    <p className="text-sm text-slate-500 mt-1">Jawablah pertanyaan dengan jujur dan fokus.</p>
                </div>
                
                <div className="p-4 grid grid-cols-5 md:grid-cols-5 gap-2 overflow-y-auto max-h-64 md:max-h-[calc(100vh-200px)]">
                    {soalList.map((soal, idx) => {
                        const state = jawabanState[soal.id];
                        const isAnswered = !!state?.jawaban;
                        const isRagu = !!state?.raguRagu;
                        const isActive = idx === currentIndex;

                        let bgClass = "bg-white border-slate-200 text-slate-600"; // Belum diisi
                        if (isActive) bgClass = "bg-indigo-100 border-indigo-400 text-indigo-700 font-bold";
                        else if (isRagu) bgClass = "bg-amber-100 border-amber-400 text-amber-700";
                        else if (isAnswered) bgClass = "bg-emerald-100 border-emerald-400 text-emerald-700";

                        return (
                            <button key={soal.id} onClick={() => setCurrentIndex(idx)}
                                className={`h-10 border rounded-lg flex items-center justify-center text-sm transition-all hover:shadow-md ${bgClass}`}>
                                {idx + 1}
                            </button>
                        );
                    })}
                </div>

                <div className="p-5 border-t border-slate-200 mt-auto bg-slate-50">
                    <div className="text-sm mb-3">
                        <span className="text-slate-500">Terjawab:</span> <strong className="text-slate-800">{totalTerjawab} / {soalList.length}</strong>
                    </div>
                    <button onClick={() => setShowSubmitModal(true)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                        <CheckCircle size={18} /> Selesai Ujian
                    </button>
                </div>
            </div>

            {/* Area Soal */}
            <div className="flex-1 flex flex-col min-h-screen">
                <div className="bg-white p-4 md:px-8 md:py-5 border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
                    <div className="font-semibold text-slate-700">Soal Nomor <span className="text-indigo-600 text-xl font-bold ml-1">{currentIndex + 1}</span></div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        {isSaving && <span className="flex items-center gap-1 text-emerald-500"><Loader2 size={14} className="animate-spin"/> Menyimpan...</span>}
                    </div>
                </div>

                <div className="p-4 md:p-8 flex-1 overflow-y-auto">
                    <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-slate-200 max-w-4xl mx-auto">
                        
                        {currentSoal.kategori && (
                            <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full mb-4">
                                Kategori: {currentSoal.kategori.replace('_', ' ')}
                            </span>
                        )}

                        <div className="text-lg md:text-xl text-slate-800 leading-relaxed font-medium mb-8">
                            {currentSoal.pertanyaan.split('\n').map((line, i) => <p key={i} className="mb-2">{line}</p>)}
                        </div>

                        <div className="space-y-3">
                            {options.map((opt) => {
                                const isSelected = currentJwb.jawaban === opt.label;
                                return (
                                    <label key={opt.label}
                                        className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all hover:bg-slate-50
                                            ${isSelected ? 'border-indigo-500 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-500' : 'border-slate-200'}
                                        `}>
                                        <div className="flex items-center h-5">
                                            <input type="radio" name={`soal-${currentSoal.id}`} value={opt.label}
                                                checked={isSelected}
                                                onChange={() => handleSelectOption(opt.label)}
                                                className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-600"
                                            />
                                        </div>
                                        <div className="ml-3 text-md text-slate-700">
                                            <span className="font-bold mr-2 text-slate-400">{opt.label}.</span>
                                            {opt.text}
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer Navigasi */}
                <div className="bg-white p-4 border-t border-slate-200 mt-auto sticky bottom-0 z-10 flex flex-wrap gap-2 md:gap-4 justify-between items-center shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)]">
                    <button 
                        onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentIndex === 0}
                        className="flex items-center gap-1 md:gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition font-medium">
                        <ChevronLeft size={18} /> Sebelumnya
                    </button>
                    
                    <button onClick={handleToggleRagu}
                        className={`flex items-center gap-1.5 md:gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm
                            ${currentJwb.raguRagu ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-400' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        <Flag size={18} className={currentJwb.raguRagu ? 'fill-amber-400 text-amber-500' : ''} />
                        Ragu-ragu
                    </button>

                    <button 
                        onClick={() => {
                            if (currentIndex < soalList.length - 1) {
                                setCurrentIndex(prev => prev + 1);
                            } else {
                                setShowSubmitModal(true);
                            }
                        }}
                        className="flex items-center gap-1 md:gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition font-medium shadow-md shadow-indigo-200">
                        {currentIndex < soalList.length - 1 ? (
                            <>Selanjutnya <ChevronRight size={18} /></>
                        ) : (
                            <>Selesai <CheckCircle size={18} className="ml-1" /></>
                        )}
                    </button>
                </div>
            </div>

            {/* Modal Selesai */}
            {showSubmitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Akhiri Ujian?</h3>
                        <p className="text-slate-500 mb-6 leading-relaxed">
                            Apakah Anda yakin ingin mengakhiri ujian dan mengumpulkan seluruh jawaban?<br/>
                            <span className="font-semibold text-rose-500">Tindakan ini tidak dapat dibatalkan.</span>
                        </p>
                        
                        <div className="flex gap-3 w-full">
                            <button onClick={() => setShowSubmitModal(false)}
                                className="flex-1 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold transition">
                                Batal
                            </button>
                            <button onClick={handleAkhiriUjian} disabled={isSaving}
                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white border-0 rounded-xl font-semibold transition shadow-lg shadow-indigo-200 flex justify-center items-center">
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Ya, Kumpulkan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
