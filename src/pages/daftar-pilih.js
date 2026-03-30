import { useRouter } from 'next/router';
import { GraduationCap, UserCheck, ArrowRight, ArrowLeft } from 'lucide-react';

export default function DaftarPilih() {
    const router = useRouter();

    const options = [
        {
            icon: GraduationCap,
            title: 'Mahasiswa Baru',
            desc: 'Daftar sebagai calon mahasiswa baru untuk mengikuti seleksi penerimaan.',
            href: '/daftar',
            gradient: 'from-blue-600 to-indigo-700',
            hoverGradient: 'hover:from-blue-700 hover:to-indigo-800',
            iconBg: 'bg-blue-500/20',
        },
        {
            icon: UserCheck,
            title: 'Dosen / Tenaga Pengajar',
            desc: 'Daftar sebagai calon dosen atau tenaga pengajar. Berkas akan diverifikasi oleh admin.',
            href: '/daftar/dosen',
            gradient: 'from-emerald-600 to-teal-700',
            hoverGradient: 'hover:from-emerald-700 hover:to-teal-800',
            iconBg: 'bg-emerald-500/20',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <GraduationCap size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Pendaftaran</h1>
                    <p className="text-blue-300 text-sm">Pilih jenis pendaftaran yang sesuai dengan Anda</p>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {options.map(opt => {
                        const Icon = opt.icon;
                        return (
                            <button
                                key={opt.href}
                                onClick={() => router.push(opt.href)}
                                className={`group bg-gradient-to-br ${opt.gradient} ${opt.hoverGradient} rounded-2xl p-6 text-left transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl shadow-lg`}
                            >
                                <div className={`w-14 h-14 ${opt.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                                    <Icon size={28} className="text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{opt.title}</h3>
                                <p className="text-white/70 text-sm leading-relaxed mb-4">{opt.desc}</p>
                                <div className="flex items-center gap-2 text-white/90 text-sm font-medium group-hover:gap-3 transition-all">
                                    Daftar Sekarang <ArrowRight size={16} />
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Back to login */}
                <div className="text-center mt-8">
                    <button onClick={() => router.push('/login')}
                        className="flex items-center gap-2 text-blue-400 hover:text-white text-sm transition mx-auto">
                        <ArrowLeft size={14} /> Kembali ke halaman login
                    </button>
                </div>
            </div>
        </div>
    );
}
