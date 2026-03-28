import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import {
    GraduationCap, ArrowRight, AlertCircle, LogOut,
    Clock, CheckCircle, XCircle, Loader
} from 'lucide-react';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const STATUS_CONFIG = {
    DAFTAR: {
        icon: AlertCircle,
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-500',
        title: 'Pendaftaran Belum Selesai',
        desc: 'Akun kamu sudah terdaftar, tapi proses pendaftaran belum selesai. Lanjutkan pendaftaran untuk melanjutkan.',
        showLanjut: true,
        showWaiting: false,
    },
    BAYAR: {
        icon: Clock,
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-500',
        title: 'Menunggu Konfirmasi Pembayaran',
        desc: 'Pendaftaran kamu sudah diterima. Pembayaran sedang dalam proses verifikasi oleh tim keuangan. Mohon tunggu.',
        showLanjut: false,
        showWaiting: true,
    },
    LULUS: {
        icon: CheckCircle,
        iconBg: 'bg-green-50',
        iconColor: 'text-green-500',
        title: 'Selamat! Kamu Dinyatakan Lulus',
        desc: 'Kamu telah lulus seleksi. Akun mahasiswa kamu sedang diproses oleh admin. Silakan login kembali dalam beberapa saat.',
        showLanjut: false,
        showWaiting: true,
    },
    GUGUR: {
        icon: XCircle,
        iconBg: 'bg-red-50',
        iconColor: 'text-red-500',
        title: 'Pendaftaran Gugur',
        desc: 'Maaf, pendaftaran kamu dinyatakan gugur. Silakan hubungi panitia penerimaan mahasiswa baru untuk informasi lebih lanjut.',
        showLanjut: false,
        showWaiting: false,
    },
};

export default function SelesaikanPendaftaran() {
    const router = useRouter();
    const [status, setStatus] = useState(null);
    const [noPendaftaran, setNoPendaftaran] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        try {
            const u = JSON.parse(localStorage.getItem('user') || '{}');
            setUser(u);
            const roles = u?.roles?.map(r => r.role || r) || [];
            // Kalau sudah bukan PENDAFTAR (sudah jadi MAHASISWA), redirect
            if (!roles.includes('PENDAFTAR')) {
                router.push('/portal/dashboard');
                return;
            }
            fetchStatus(u.email);
        } catch {
            setLoading(false);
        }
    }, []);

    const fetchStatus = async (email) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${BASE_URL}/pamaba/pendaftar/by-email`, {
                params: { email },
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data?.data) {
                setStatus(res.data.data.status);
                setNoPendaftaran(res.data.data.noPendaftaran);
            }
        } catch {
            // Kalau endpoint tidak ada, default ke DAFTAR
            setStatus('DAFTAR');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const handleRefresh = async () => {
        setLoading(true);
        // Coba ambil token baru dari backend untuk refresh roles
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${BASE_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data?.data) {
                localStorage.setItem('user', JSON.stringify(res.data.data));
                const roles = res.data.data?.roles?.map(r => r.role || r) || [];
                if (!roles.includes('PENDAFTAR')) {
                    router.push('/portal/dashboard');
                    return;
                }
            }
        } catch {}
        await fetchStatus(user?.email);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-white rounded-full animate-spin" />
                    <div className="text-blue-200 text-sm">Memuat status...</div>
                </div>
            </div>
        );
    }

    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['DAFTAR'];
    const Icon = cfg.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">

                <div className={`w-16 h-16 ${cfg.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-5`}>
                    <Icon size={32} className={cfg.iconColor} />
                </div>

                <h1 className="text-xl font-bold text-slate-800 mb-2">{cfg.title}</h1>
                <p className="text-slate-400 text-sm mb-4">{cfg.desc}</p>

                {noPendaftaran && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-5">
                        <div className="text-xs text-slate-400 mb-0.5">Nomor Pendaftaran</div>
                        <div className="font-bold text-slate-700 tracking-wider">{noPendaftaran}</div>
                    </div>
                )}

                {/* Steps untuk DAFTAR */}
                {cfg.showLanjut && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5 text-left space-y-2">
                        {['Lengkapi data pribadi', 'Pilih program studi', 'Upload dokumen', 'Submit pendaftaran'].map((step, i) => (
                            <div key={i} className="flex items-center gap-2.5 text-sm text-slate-600">
                                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-blue-600 text-xs font-bold">{i + 1}</span>
                                </div>
                                {step}
                            </div>
                        ))}
                    </div>
                )}

                {/* Info tunggu untuk BAYAR/LULUS */}
                {cfg.showWaiting && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-5 text-left">
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                            <Loader size={14} className="text-slate-400" />
                            Halaman ini akan otomatis diperbarui. Kamu juga bisa klik tombol refresh di bawah.
                        </div>
                    </div>
                )}

                {/* Tombol aksi */}
                {cfg.showLanjut && (
                    <button onClick={() => router.push('/daftar')}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition mb-3">
                        <GraduationCap size={16} /> Lanjutkan Pendaftaran <ArrowRight size={16} />
                    </button>
                )}

                {cfg.showWaiting && (
                    <button onClick={handleRefresh} disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition mb-3 disabled:opacity-50">
                        <Loader size={16} className={loading ? 'animate-spin' : ''} />
                        Cek Status Terbaru
                    </button>
                )}

                <button onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 border border-slate-200 text-slate-400 hover:bg-slate-50 py-3 rounded-xl text-sm transition">
                    <LogOut size={14} /> Keluar
                </button>
            </div>
        </div>
    );
}