import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
    LayoutDashboard, ClipboardList, CalendarDays,
    Wallet, UserCircle, LogOut, Menu, X,
    GraduationCap, Bell, ChevronLeft, ChevronRight
} from 'lucide-react';

const MENUS = [
    { href: '/portal/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/portal/krs', icon: ClipboardList, label: 'KRS' },
    { href: '/portal/jadwal', icon: CalendarDays, label: 'Jadwal Kuliah' },
    { href: '/portal/keuangan', icon: Wallet, label: 'Keuangan' },
    { href: '/portal/profil', icon: UserCircle, label: 'Profil Saya' },
];

export default function PortalLayout({ children, title }) {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData));
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [router.pathname]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) setSidebarOpen(false);
            else setSidebarOpen(true);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={`flex items-center gap-3 px-4 h-16 border-b border-indigo-700/50 flex-shrink-0 ${!sidebarOpen && 'justify-center'}`}>
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GraduationCap size={18} className="text-white" />
                </div>
                {sidebarOpen && (
                    <div>
                        <div className="text-white font-bold text-sm leading-tight">Portal Mahasiswa</div>
                        <div className="text-indigo-300 text-xs">Sistem Akademik</div>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                {MENUS.map(menu => {
                    const Icon = menu.icon;
                    const isActive = router.pathname === menu.href;
                    return (
                        <Link key={menu.href} href={menu.href}>
                            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150
                                ${isActive
                                    ? 'bg-white text-indigo-700 font-semibold shadow-sm'
                                    : 'text-indigo-200 hover:bg-indigo-700/60 hover:text-white'
                                }
                                ${!sidebarOpen && 'justify-center'}
                            `}>
                                <Icon size={17} className="flex-shrink-0" />
                                {sidebarOpen && <span className="text-sm">{menu.label}</span>}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* User & Logout */}
            <div className="border-t border-indigo-700/50 p-3 flex-shrink-0">
                {sidebarOpen ? (
                    <div className="flex items-center gap-3 mb-3 px-1">
                        <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 border border-white/20">
                            <span className="text-white text-sm font-bold">
                                {user?.nama?.charAt(0)?.toUpperCase() || 'M'}
                            </span>
                        </div>
                        <div className="min-w-0">
                            <div className="text-white text-sm font-semibold truncate">{user?.nama}</div>
                            <div className="text-indigo-300 text-xs">Mahasiswa</div>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center mb-3">
                        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                            <span className="text-white text-xs font-bold">
                                {user?.nama?.charAt(0)?.toUpperCase() || 'M'}
                            </span>
                        </div>
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-indigo-300 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm
                        ${!sidebarOpen && 'justify-center'}
                    `}
                >
                    <LogOut size={16} />
                    {sidebarOpen && <span>Keluar</span>}
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-slate-100">

            {/* Overlay mobile */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar Desktop */}
            <aside className={`
                hidden lg:flex flex-col
                ${sidebarOpen ? 'w-64' : 'w-[68px]'}
                bg-gradient-to-b from-indigo-800 to-indigo-900
                fixed h-full z-30 transition-all duration-300
            `}>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="absolute -right-3 top-20 w-6 h-6 bg-indigo-800 border border-indigo-600 rounded-full flex items-center justify-center text-indigo-300 hover:text-white z-50 transition-colors"
                >
                    {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
                </button>
                <SidebarContent />
            </aside>

            {/* Sidebar Mobile */}
            <aside className={`
                lg:hidden fixed top-0 left-0 h-full w-72
                bg-gradient-to-b from-indigo-800 to-indigo-900
                z-50 transform transition-transform duration-300
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <button
                    onClick={() => setMobileOpen(false)}
                    className="absolute top-4 right-4 text-indigo-300 hover:text-white"
                >
                    <X size={20} />
                </button>
                <div className="w-72">
                    <SidebarContent />
                </div>
            </aside>

            {/* Main */}
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300
                ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-[68px]'}
            `}>
                {/* Header */}
                <header className="bg-white border-b border-slate-200 px-4 lg:px-6 h-16 flex items-center justify-between sticky top-0 z-20 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                        >
                            <Menu size={20} />
                        </button>
                        <div>
                            <h1 className="text-lg font-semibold text-slate-800 leading-tight">{title}</h1>
                            <div className="text-xs text-slate-400 hidden sm:block">
                                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                            <Bell size={18} />
                        </button>
                        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
                            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                    {user?.nama?.charAt(0)?.toUpperCase() || 'M'}
                                </span>
                            </div>
                            <div className="text-sm">
                                <div className="font-semibold text-slate-700 leading-tight">{user?.nama}</div>
                                <div className="text-xs text-slate-400">Mahasiswa</div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-4 lg:p-6 overflow-auto">
                    {children}
                </main>

                {/* Footer */}
                <footer className="text-center text-xs text-slate-400 py-4 border-t border-slate-200 bg-white">
                    © {new Date().getFullYear()} Sistem Akademik. All rights reserved.
                </footer>
            </div>
        </div>
    );
}