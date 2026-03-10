import { useState } from 'react';
import { useRouter } from 'next/router';
import { KeyRound, Mail, MessageCircle, ArrowLeft, CheckCircle, GraduationCap } from 'lucide-react';

export default function LupaPasswordPage() {
    const router = useRouter();
    const [submitted, setSubmitted] = useState(false);
    const [email, setEmail] = useState('');

    const waText = encodeURIComponent(`Halo Admin, saya lupa password. Email saya: ${email || '...'}`);
    const waUrl = `https://wa.me/62881026611502?text=${waText}`;
    const mailUrl = `mailto:admin@kampus.ac.id?subject=Reset%20Password&body=${waText}`;

    return (
        <div className="min-h-screen bg-slate-900 flex">

            {/* Panel Kiri — hanya desktop */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 flex-col items-center justify-center p-12 relative overflow-hidden">
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
                </div>
            </div>

            {/* Panel Kanan */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md">

                    {/* Logo mobile */}
                    <div className="flex justify-center mb-8 lg:hidden">
                        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center">
                            <GraduationCap size={28} className="text-white" />
                        </div>
                    </div>

                    {!submitted ? (
                        <>
                            {/* Heading */}
                            <div className="mb-8">
                                <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center mb-4">
                                    <KeyRound size={22} className="text-indigo-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Lupa Password</h2>
                                <p className="text-slate-400 mt-1 text-sm">
                                    Hubungi admin untuk mereset password akun Anda
                                </p>
                            </div>

                            <div className="space-y-5">

                                {/* Info langkah */}
                                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                                    <h3 className="text-sm font-semibold text-indigo-300 mb-3">
                                        Cara Reset Password
                                    </h3>
                                    <ol className="space-y-2">
                                        {[
                                            'Masukkan email akun Anda di bawah',
                                            'Hubungi admin melalui kontak yang tersedia',
                                            'Admin akan mereset password Anda',
                                            'Login dengan password baru',
                                        ].map((step, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                                                <span className="w-5 h-5 bg-indigo-600/40 border border-indigo-500/30 rounded-full flex items-center justify-center text-xs text-indigo-300 font-bold flex-shrink-0 mt-0.5">
                                                    {i + 1}
                                                </span>
                                                {step}
                                            </li>
                                        ))}
                                    </ol>
                                </div>

                                {/* Input Email */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Email Akun Anda
                                    </label>
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                                            placeholder="email@kampus.ac.id"
                                        />
                                    </div>
                                </div>

                                {/* Kontak Admin */}
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-slate-300">Hubungi Admin</p>

                                    <a href={waUrl} target="_blank" rel="noreferrer"
                                        className="flex items-center gap-3 bg-green-600/10 border border-green-600/20 hover:bg-green-600/20 text-green-400 px-4 py-3 rounded-xl transition">
                                        <MessageCircle size={18} className="flex-shrink-0" />
                                        <div>
                                            <div className="font-semibold text-sm">WhatsApp Admin</div>
                                            <div className="text-xs text-green-600">0881-0266-1150-2</div>
                                        </div>
                                    </a>

                                    <a href={mailUrl}
                                        className="flex items-center gap-3 bg-blue-600/10 border border-blue-600/20 hover:bg-blue-600/20 text-blue-400 px-4 py-3 rounded-xl transition">
                                        <Mail size={18} className="flex-shrink-0" />
                                        <div>
                                            <div className="font-semibold text-sm">Email Admin</div>
                                            <div className="text-xs text-blue-600">admin@kampus.ac.id</div>
                                        </div>
                                    </a>
                                </div>

                                {/* Tombol Sudah Hubungi */}
                                <button
                                    onClick={() => setSubmitted(true)}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition text-sm">
                                    Sudah Hubungi Admin
                                </button>

                                {/* Kembali */}
                                <button
                                    onClick={() => router.push('/login')}
                                    className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white text-sm transition">
                                    <ArrowLeft size={15} />
                                    Kembali ke Login
                                </button>
                            </div>
                        </>
                    ) : (
                        /* State Sukses */
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={32} className="text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">Terima Kasih!</h2>
                            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                                Admin akan segera memproses permintaan reset password Anda.
                                Harap tunggu konfirmasi dari admin.
                            </p>
                            <button
                                onClick={() => router.push('/login')}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition text-sm flex items-center justify-center gap-2">
                                <ArrowLeft size={16} />
                                Kembali ke Login
                            </button>
                        </div>
                    )}

                    <p className="text-center text-xs text-slate-600 mt-8">
                        © {new Date().getFullYear()} Sistem Informasi Akademik
                    </p>
                </div>
            </div>
        </div>
    );
}