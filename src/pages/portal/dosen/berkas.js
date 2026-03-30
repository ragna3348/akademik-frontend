import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layouts/Layout';
import api from '@/utils/api';
import toast, { Toaster } from 'react-hot-toast';
import {
    FileCheck, Upload, CheckCircle, Clock, XCircle,
    FileText, GraduationCap, Camera, BookOpen, RefreshCw, AlertTriangle
} from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function DosenBerkasPage() {
    const router = useRouter();
    const [dosen, setDosen] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [files, setFiles] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const res = await api.get('/pamaba/dosen/by-email', { params: { email: userData.email } });
            setDosen(res.data.data);
        } catch (e) {
            toast.error('Gagal memuat data berkas');
        } finally {
            setLoading(false);
        }
    };

    const handleReupload = async () => {
        if (!dosen?.id) return;
        const formData = new FormData();
        Object.entries(files).forEach(([k, v]) => { if (v) formData.append(k, v); });
        if (Object.keys(files).length === 0) {
            toast.error('Pilih minimal satu file untuk diupload!'); return;
        }

        setUploading(true);
        try {
            await api.put(`/pamaba/dosen/berkas/${dosen.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Berkas berhasil diupdate!');
            setFiles({});
            fetchData();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Gagal upload berkas!');
        } finally {
            setUploading(false);
        }
    };

    const berkasList = [
        { field: 'foto', label: 'Pas Foto', icon: Camera },
        { field: 'dokumenCV', label: 'Curriculum Vitae', icon: FileText },
        { field: 'dokumenIjazah', label: 'Ijazah Terakhir', icon: GraduationCap },
        { field: 'dokumenKTP', label: 'KTP', icon: FileText },
        { field: 'dokumenSertifikasi', label: 'Sertifikasi Pendidik', icon: BookOpen },
    ];

    const statusConfig = {
        PENDING: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Menunggu Verifikasi', desc: 'Berkas Anda sedang ditinjau oleh admin.' },
        DISETUJUI: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200', label: 'Disetujui', desc: 'Semua berkas telah diverifikasi. Selamat!' },
        DITOLAK: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', label: 'Ditolak', desc: dosen?.alasanTolak || 'Berkas tidak lengkap/valid. Upload ulang.' },
    };

    if (loading) {
        return (
            <Layout title="Berkas Verifikasi">
                <div className="flex items-center justify-center py-24">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
            </Layout>
        );
    }

    const status = statusConfig[dosen?.statusVerifikasi] || statusConfig.PENDING;
    const StatusIcon = status.icon;

    return (
        <Layout title="Berkas Verifikasi">
            <Toaster position="top-right" />

            {/* Status Card */}
            <div className={`${status.bg} border ${status.border} rounded-2xl p-6 mb-6`}>
                <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${status.bg}`}>
                        <StatusIcon size={28} className={status.color} />
                    </div>
                    <div>
                        <h2 className={`text-lg font-bold ${status.color}`}>{status.label}</h2>
                        <p className="text-sm text-slate-600 mt-1">{status.desc}</p>
                    </div>
                </div>
            </div>

            {/* Berkas List */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FileCheck size={18} className="text-indigo-600" /> Daftar Berkas
                </h3>
                <div className="space-y-3">
                    {berkasList.map(b => {
                        const Icon = b.icon;
                        const hasFile = dosen?.[b.field];
                        return (
                            <div key={b.field} className="flex items-center gap-4 border border-slate-100 rounded-xl p-4 hover:border-indigo-200 transition">
                                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Icon size={18} className="text-slate-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-700">{b.label}</p>
                                    {hasFile ? (
                                        <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                                            <CheckCircle size={11} /> Terupload
                                        </p>
                                    ) : (
                                        <p className="text-xs text-slate-400 mt-0.5">Belum diupload</p>
                                    )}
                                    {files[b.field] && (
                                        <p className="text-xs text-indigo-600 mt-0.5">📎 {files[b.field].name}</p>
                                    )}
                                </div>
                                {(dosen?.statusVerifikasi === 'DITOLAK' || !hasFile) && (
                                    <label className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer transition">
                                        <Upload size={12} /> Upload
                                        <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf"
                                            onChange={e => setFiles(f => ({ ...f, [b.field]: e.target.files[0] }))} />
                                    </label>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Reupload button (only when DITOLAK or missing files) */}
                {(dosen?.statusVerifikasi === 'DITOLAK' || berkasList.some(b => !dosen?.[b.field])) && Object.keys(files).length > 0 && (
                    <button onClick={handleReupload} disabled={uploading}
                        className="w-full mt-5 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 transition">
                        {uploading ? <><RefreshCw size={15} className="animate-spin" /> Mengupload...</> : <><Upload size={15} /> Kirim Berkas</>}
                    </button>
                )}

                {dosen?.statusVerifikasi === 'DITOLAK' && dosen?.alasanTolak && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-start gap-2">
                            <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-red-700">Alasan Penolakan:</p>
                                <p className="text-sm text-red-600 mt-1">{dosen.alasanTolak}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
