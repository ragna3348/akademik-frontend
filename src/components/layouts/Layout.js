import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
    LayoutDashboard, Building2, GraduationCap, Users, BookOpen,
    ClipboardList, RefreshCw, CalendarDays, Wallet, Waves,
    UserCheck, Handshake, UserCog, Settings,
    ChevronLeft, ChevronRight, LogOut, Menu, X, School,
    ChevronDown, ChevronUp, Bell, Home, User, KeyRound, Shield,
    CreditCard, FileQuestion, PenLine, Database
} from 'lucide-react';

const MENU_GROUPS = [
    {
        group: 'Utama',
        items: [
            { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['SUPER_ADMIN', 'ADMIN', 'AKADEMIK', 'KEUANGAN', 'KAPRODI', 'PAMABA'] },
        ]
    },
    {
        group: 'Akademik',
        items: [
            { href: '/akademik/fakultas', icon: Building2, label: 'Fakultas', roles: ['SUPER_ADMIN', 'ADMIN', 'AKADEMIK'] },
            { href: '/akademik/prodi', icon: School, label: 'Program Studi', roles: ['SUPER_ADMIN', 'ADMIN', 'AKADEMIK', 'KAPRODI'] },
            { href: '/akademik/jenis-mahasiswa', icon: BookOpen, label: 'Jenis Mahasiswa', roles: ['SUPER_ADMIN', 'ADMIN', 'AKADEMIK'] },
            { href: '/akademik/mahasiswa', icon: GraduationCap, label: 'Mahasiswa', roles: ['SUPER_ADMIN', 'ADMIN', 'AKADEMIK', 'KAPRODI'] },
            { href: '/akademik/dosen', icon: UserCheck, label: 'Dosen', roles: ['SUPER_ADMIN', 'ADMIN', 'AKADEMIK', 'KAPRODI'] },
            { href: '/akademik/mata-kuliah', icon: BookOpen, label: 'Mata Kuliah', roles: ['SUPER_ADMIN', 'ADMIN', 'AKADEMIK', 'KAPRODI'] },
            { href: '/akademik/krs', icon: ClipboardList, label: 'KRS', roles: ['SUPER_ADMIN', 'ADMIN', 'AKADEMIK', 'KAPRODI'] },
            { href: '/jadwal', icon: CalendarDays, label: 'Jadwal Kuliah', roles: ['SUPER_ADMIN', 'ADMIN', 'AKADEMIK', 'KAPRODI'] },
        ]
    },
    {
        group: 'Keuangan',
        items: [
            { href: '/keuangan/jenis', icon: Database, label: 'Master Keuangan', roles: ['SUPER_ADMIN'] },
            { href: '/keuangan', icon: Wallet, label: 'Keuangan', roles: ['SUPER_ADMIN', 'ADMIN', 'KEUANGAN'] },
            { href: '/akademik/heregistrasi', icon: RefreshCw, label: 'Heregistrasi', roles: ['SUPER_ADMIN', 'ADMIN', 'KEUANGAN'] },
        ]
    },
    {
        group: 'Penerimaan',
        items: [
            { href: '/pamaba/gelombang', icon: Waves, label: 'Gelombang', roles: ['SUPER_ADMIN', 'ADMIN', 'PAMABA'] },
            { href: '/pamaba/pendaftar', icon: Users, label: 'Pendaftar', roles: ['SUPER_ADMIN', 'ADMIN', 'PAMABA', 'AKADEMIK'] },
            { href: '/pamaba/pembayaran', icon: CreditCard, label: 'Pembayaran', roles: ['SUPER_ADMIN', 'ADMIN', 'PAMABA', 'KEUANGAN'] },
            { href: '/pamaba/bank-soal', icon: FileQuestion, label: 'Bank Soal', roles: ['SUPER_ADMIN', 'ADMIN', 'PAMABA'] },
            { href: '/pamaba/afiliasi', icon: Handshake, label: 'Afiliasi', roles: ['SUPER_ADMIN', 'ADMIN', 'PAMABA'] },
        ]
    },
    {
        group: 'Pengaturan',
        items: [
            { href: '/pengaturan/users', icon: UserCog, label: 'Manajemen User', roles: ['SUPER_ADMIN'] },
            { href: '/pengaturan/setting', icon: Settings, label: 'Pengaturan', roles: ['SUPER_ADMIN', 'ADMIN'] },
        ]
    },
];

const DOSEN_MENU = [
    { href: '/portal/dosen', icon: Home, label: 'Dashboard' },
    { href: '/jadwal', icon: CalendarDays, label: 'Jadwal Mengajar' },
];

export default function Layout({ children, title }) {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsedGroups, setCollapsedGroups] = useState({});
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);
    const sidebarNavRef = useRef(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData));
    }, []);

    useEffect(() => { setMobileOpen(false); }, [router.pathname]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) setSidebarOpen(false);
            else setSidebarOpen(true);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Tutup dropdown saat klik di luar
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const toggleGroup = (group) => {
        setCollapsedGroups(prev => ({ ...prev, [group]: !prev[group] }));
    };

    const userRoles = user?.roles?.map(r => typeof r === 'string' ? r : r.role) || [];

    const isDosen = userRoles.includes('DOSEN') && !userRoles.some(r =>
        ['SUPER_ADMIN', 'ADMIN', 'AKADEMIK', 'KEUANGAN', 'KAPRODI', 'PAMABA'].includes(r)
    );

    const visibleGroups = MENU_GROUPS.map(g => ({
        ...g,
        items: g.items.filter(m => m.roles.some(r => userRoles.includes(r)))
    })).filter(g => g.items.length > 0);

    const getRoleLabel = (roles) => {
        const r = roles?.[0];
        if (typeof r === 'string') return r;
        return r?.role || '';
    };

    const currentRole = isDosen ? 'Dosen' : getRoleLabel(user?.roles);
    const userInitial = user?.nama?.charAt(0)?.toUpperCase() || 'A';

    // ===== PROFILE DROPDOWN MENU =====
    const profileMenuItems = [
        ...(userRoles.includes('SUPER_ADMIN') || userRoles.includes('ADMIN') ? [
            { icon: UserCog, label: 'Manajemen User', href: '/pengaturan/users', color: 'text-slate-600' },
            { icon: Settings, label: 'Pengaturan', href: '/pengaturan/setting', color: 'text-slate-600' },
        ] : []),
        { divider: true },
        { icon: LogOut, label: 'Keluar', onClick: handleLogout, color: 'text-red-500', hoverBg: 'hover:bg-red-50' },
    ];

    // ===== RENDER SIDEBAR CONTENT (inline, not a component — prevents DOM remount & scroll reset) =====
    const renderSidebarContent = (menuItems, isDosenMode = false) => (
        <div className="flex flex-col h-full">
            <div className={`flex items-center gap-3 px-4 h-16 border-b border-slate-700/50 flex-shrink-0 ${!sidebarOpen && 'justify-center'}`}>
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GraduationCap size={18} className="text-white" />
                </div>
                {sidebarOpen && (
                    <div>
                        <div className="text-white font-bold text-sm leading-tight">Sistem Akademik</div>
                        <div className="text-slate-400 text-xs">{isDosenMode ? 'Portal Dosen' : 'Management Portal'}</div>
                    </div>
                )}
            </div>

            <nav ref={sidebarNavRef} className="flex-1 overflow-y-auto py-4 px-2 space-y-1 sidebar-scroll">
                {isDosenMode ? (
                    <>
                        {sidebarOpen && (
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">Menu</p>
                        )}
                        {DOSEN_MENU.map(menu => {
                            const Icon = menu.icon;
                            const isActive = router.pathname === menu.href ||
                                (menu.href !== '/portal/dosen' && router.pathname.startsWith(menu.href));
                            return (
                                <Link key={menu.href} href={menu.href}>
                                    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150
                                        ${isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-700/60 hover:text-white'}
                                        ${!sidebarOpen && 'justify-center'}
                                    `}>
                                        <Icon size={17} className="flex-shrink-0" />
                                        {sidebarOpen && <span className="text-sm font-medium">{menu.label}</span>}
                                    </div>
                                </Link>
                            );
                        })}
                    </>
                ) : (
                    visibleGroups.map((group) => (
                        <div key={group.group} className="mb-2">
                            {sidebarOpen && (
                                <button onClick={() => toggleGroup(group.group)}
                                    className="w-full flex items-center justify-between px-3 py-1.5 mb-1">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        {group.group}
                                    </span>
                                    {collapsedGroups[group.group]
                                        ? <ChevronDown size={12} className="text-slate-500" />
                                        : <ChevronUp size={12} className="text-slate-500" />}
                                </button>
                            )}
                            {!collapsedGroups[group.group] && group.items.map(menu => {
                                const Icon = menu.icon;
                                const isActive = router.pathname === menu.href ||
                                    (menu.href !== '/dashboard' && router.pathname.startsWith(menu.href));
                                return (
                                    <Link key={menu.href} href={menu.href}>
                                        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 group
                                            ${isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-700/60 hover:text-white'}
                                            ${!sidebarOpen && 'justify-center'}
                                        `}>
                                            <Icon size={17} className="flex-shrink-0" />
                                            {sidebarOpen && <span className="text-sm font-medium truncate">{menu.label}</span>}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ))
                )}
            </nav>

            {sidebarOpen && (
                <div className="border-t border-slate-700/50 p-3 flex-shrink-0">
                    <div className="flex items-center gap-3 px-1">
                        <div className="w-8 h-8 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-400 text-xs font-bold">{userInitial}</span>
                        </div>
                        <div className="min-w-0">
                            <div className="text-white text-sm font-semibold truncate">{user?.nama}</div>
                            <div className="text-slate-400 text-xs truncate">{isDosenMode ? 'Dosen' : currentRole}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex min-h-screen bg-slate-100">

            {mobileOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)} />
            )}

            {/* Sidebar Desktop */}
            <aside className={`hidden lg:flex flex-col ${sidebarOpen ? 'w-64' : 'w-[68px]'} bg-slate-800 fixed h-full z-30 transition-all duration-300`}>
                <button onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-600 rounded-full flex items-center justify-center text-slate-400 hover:text-white z-50 transition-colors">
                    {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
                </button>
                {renderSidebarContent(null, isDosen)}
            </aside>

            {/* Sidebar Mobile */}
            <aside className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-slate-800 z-50 transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <button onClick={() => setMobileOpen(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white">
                    <X size={20} />
                </button>
                <div className="w-72">
                    {renderSidebarContent(null, isDosen)}
                </div>
            </aside>

            {/* Main */}
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-[68px]'}`}>

                {/* Header */}
                <header className="bg-white border-b border-slate-200 px-4 lg:px-6 h-16 flex items-center justify-between sticky top-0 z-20 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setMobileOpen(true)}
                            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100">
                            <Menu size={20} />
                        </button>
                        <div>
                            <h1 className="text-lg font-semibold text-slate-800 leading-tight">{title}</h1>
                            <div className="text-xs text-slate-400 hidden sm:block">
                                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>
                    </div>

                    {/* Kanan header: Notifikasi + Profile Dropdown */}
                    <div className="flex items-center gap-2">
                        {/* Bell */}
                        <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                            <Bell size={18} />
                        </button>

                        {/* Profile Dropdown */}
                        <div className="relative pl-2 border-l border-slate-200" ref={profileRef}>
                            <button
                                id="profile-menu-btn"
                                onClick={() => setProfileOpen(prev => !prev)}
                                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer select-none"
                            >
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <span className="text-white text-xs font-bold">{userInitial}</span>
                                </div>
                                <div className="hidden sm:block text-left">
                                    <div className="text-sm font-semibold text-slate-700 leading-tight">{user?.nama}</div>
                                    <div className="text-xs text-slate-400">{currentRole}</div>
                                </div>
                                <ChevronDown
                                    size={14}
                                    className={`hidden sm:block text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {/* Dropdown Panel */}
                            {profileOpen && (
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-fadeIn">
                                    {/* Info User */}
                                    <div className="px-4 py-3 border-b border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                                                <span className="text-white text-sm font-bold">{userInitial}</span>
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-semibold text-slate-800 truncate">{user?.nama}</div>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <Shield size={10} className="text-blue-500 flex-shrink-0" />
                                                    <span className="text-xs text-blue-600 font-medium truncate">{currentRole}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-1">
                                        {(userRoles.includes('SUPER_ADMIN') || userRoles.includes('ADMIN')) && (
                                            <>
                                                <Link href="/pengaturan/users" onClick={() => setProfileOpen(false)}>
                                                    <div className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors">
                                                        <UserCog size={15} className="text-slate-400" />
                                                        <span>Manajemen User</span>
                                                    </div>
                                                </Link>
                                                <Link href="/pengaturan/setting" onClick={() => setProfileOpen(false)}>
                                                    <div className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors">
                                                        <Settings size={15} className="text-slate-400" />
                                                        <span>Pengaturan Sistem</span>
                                                    </div>
                                                </Link>
                                            </>
                                        )}
                                    </div>

                                    {/* Divider + Keluar */}
                                    <div className="border-t border-slate-100 pt-1">
                                        <button
                                            id="logout-btn"
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
                                        >
                                            <LogOut size={15} />
                                            <span className="font-medium">Keluar</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 lg:p-6 overflow-auto content-scroll">
                    {children}
                </main>

                <footer className="text-center text-xs text-slate-400 py-4 border-t border-slate-200 bg-white">
                    © {new Date().getFullYear()} Sistem Akademik. All rights reserved.
                </footer>
            </div>

            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.15s ease-out;
                }
            `}</style>
        </div>
    );
}