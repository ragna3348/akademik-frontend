import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import '@/styles/globals.css';

const PUBLIC_ROUTES = ['/login', '/lupa-password', '/daftar', '/selesaikan-pendaftaran'];

const ROLE_HOME = {
    MAHASISWA: '/portal/dashboard',
    DOSEN: '/portal/dosen',
    SUPER_ADMIN: '/dashboard',
    ADMIN: '/dashboard',
    AKADEMIK: '/dashboard',
    KEUANGAN: '/dashboard',
    KAPRODI: '/dashboard',
    PAMABA: '/dashboard',
    PENDAFTAR: '/selesaikan-pendaftaran',
};

const ADMIN_ROUTES = ['/dashboard', '/akademik', '/keuangan', '/pamaba', '/jadwal', '/pengaturan'];
const MAHASISWA_ROUTES = ['/portal'];
const DAFTAR_ROUTES = ['/daftar', '/selesaikan-pendaftaran'];

export default function App({ Component, pageProps }) {
    const router = useRouter();
    const pathname = router.pathname;
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const check = () => {
            const token = localStorage.getItem('token');
            const userRaw = localStorage.getItem('user');
            const isPublic = PUBLIC_ROUTES.some(r => pathname.startsWith(r));

            // Belum login
            if (!token || !userRaw) {
                if (!isPublic) {
                    router.push('/login');
                    setAuthorized(false);
                } else {
                    setAuthorized(true);
                }
                return;
            }

            let user;
            try {
                user = JSON.parse(userRaw);
            } catch {
                localStorage.clear();
                router.push('/login');
                setAuthorized(false);
                return;
            }

            const userRoles = user?.roles?.map(r => r.role || r) || [];
            const primaryRole = userRoles[0];

            const isMahasiswa = userRoles.includes('MAHASISWA');
            const isPendaftar = userRoles.includes('PENDAFTAR') && !isMahasiswa;
            const isDosen = userRoles.includes('DOSEN') && !userRoles.some(r =>
                ['SUPER_ADMIN', 'ADMIN', 'AKADEMIK', 'KEUANGAN', 'KAPRODI', 'PAMABA'].includes(r)
            );
            const isAdmin = userRoles.some(r =>
                ['SUPER_ADMIN', 'ADMIN', 'AKADEMIK', 'KEUANGAN', 'KAPRODI', 'PAMABA'].includes(r)
            );

            const isAdminArea = ADMIN_ROUTES.some(r => pathname.startsWith(r));
            const isMahasiswaArea = MAHASISWA_ROUTES.some(r => pathname.startsWith(r));
            const isDaftarArea = DAFTAR_ROUTES.some(r => pathname.startsWith(r));
            const isDosenArea = pathname.startsWith('/portal/dosen') || pathname.startsWith('/jadwal');

            // Sudah login buka halaman login/lupa-password → redirect ke home
            if (pathname === '/login' || pathname === '/lupa-password') {
                router.push(ROLE_HOME[primaryRole] || '/dashboard');
                setAuthorized(false);
                return;
            }

            // PENDAFTAR: hanya boleh akses /selesaikan-pendaftaran dan /daftar
            if (isPendaftar) {
                if (!isDaftarArea) {
                    router.push('/selesaikan-pendaftaran');
                    setAuthorized(false);
                } else {
                    setAuthorized(true);
                }
                return;
            }

            // DOSEN hanya boleh akses /portal/dosen
            if (isDosen) {
                if (!isDosenArea) {
                    router.push('/portal/dosen');
                    setAuthorized(false);
                } else {
                    setAuthorized(true);
                }
                return;
            }

            // MAHASISWA tidak boleh akses area admin atau halaman daftar
            if (isMahasiswa && (isAdminArea || isDaftarArea)) {
                router.push('/portal/dashboard');
                setAuthorized(false);
                return;
            }

            // ADMIN tidak boleh akses area mahasiswa atau halaman daftar
            if (isAdmin && (isMahasiswaArea || isDaftarArea)) {
                router.push('/dashboard');
                setAuthorized(false);
                return;
            }

            setAuthorized(true);
        };

        check();
    }, [pathname]);

    if (!authorized) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <div className="text-slate-400 text-sm">Memuat...</div>
                </div>
            </div>
        );
    }

    return <Component {...pageProps} />;
}