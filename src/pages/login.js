import { useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/utils/api';
import toast, { Toaster } from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, GraduationCap, LogIn } from 'lucide-react';

const ROLE_HOME = {
    MAHASISWA: '/portal/dashboard',
    PENDAFTAR: '/daftar',
    SUPER_ADMIN: '/dashboard',
    ADMIN: '/dashboard',
    AKADEMIK: '/dashboard',
    KEUANGAN: '/dashboard',
    KAPRODI: '/dashboard',
    PAMABA: '/dashboard',
    DOSEN: '/dashboard',
};

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/login', form);
            const { token, user } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            toast.success(`Selamat datang, ${user.nama}!`);

            const roles = user.roles?.map(r => typeof r === 'string' ? r : r.role) || [];
            const primaryRole = roles[0];
            const dest = ROLE_HOME[primaryRole] || '/dashboard';

            setTimeout(() => router.push(dest), 800);

        } catch (error) {
            toast.error(error.response?.data?.message || 'Email atau password salah!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex">
            <Toaster position="top-right" />

            {/* Panel Kiri — hanya tampil di layar besar */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 flex-col items-center justify-center p-12 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-indigo-400 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-48 h-48 bg-blue-400 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 text-center">
                    <div className="w-20 h-20 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <GraduationCap size={40} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-3">Sistem Akademik</h1>
                    <p className="text-indigo-300 text-lg max-w-xs mx-auto leading-relaxed">
                        Platform manajemen akademik kampus yang terintegrasi
                    </p>

                    <div className="mt-12 grid grid-cols-3 gap-6 text-center">
                        {[
                            { value: 'Mahasiswa', label: 'Terdaftar' },
                            { value: 'Dosen', label: 'Pengajar' },
                            { value: 'Program', label: 'Studi' },
                        ].map(s => (
                            <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <div className="text-white font-bold text-lg">{s.value}</div>
                                <div className="text-indigo-400 text-xs mt-0.5">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Panel Kanan — Form Login */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md">

                    {/* Logo mobile */}
                    <div className="flex justify-center mb-8 lg:hidden">
                        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center">
                            <GraduationCap size={28} className="text-white" />
                        </div>
                    </div>

                    {/* Heading */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white">Selamat Datang</h2>
                        <p className="text-slate-400 mt-1 text-sm">Masuk ke akun Anda untuk melanjutkan</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Alamat Email
                            </label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                                    placeholder="email@kampus.ac.id"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-slate-300">
                                    Password
                                </label>
                                <a href="/lupa-password"
                                    className="text-xs text-indigo-400 hover:text-indigo-300 transition">
                                    Lupa password?
                                </a>
                            </div>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-12 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                                    placeholder="Masukkan password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Tombol Login */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <LogIn size={16} />
                                    Masuk
                                </>
                            )}
                        </button>

                        {/* Divider */}
                        <div className="relative my-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-700" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-slate-900 px-3 text-xs text-slate-500">atau</span>
                            </div>
                        </div>

                        {/* Daftar */}
                        <a href="/daftar"
                            className="w-full flex items-center justify-center gap-2 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white font-medium py-3 rounded-xl transition text-sm">
                            <GraduationCap size={16} />
                            Daftar Mahasiswa Baru
                        </a>

                    </form>

                    <p className="text-center text-xs text-slate-600 mt-8">
                        © {new Date().getFullYear()} Sistem Informasi Akademik
                    </p>
                </div>
            </div>
        </div>
    );
}