import { useState, useEffect } from 'react';
import Layout from '@/components/layouts/Layout';
import api from '@/utils/api';
import {
    GraduationCap, Users, BookOpen, School, ClipboardList,
    Clock, CheckCircle, XCircle, Wallet, TrendingUp,
    ArrowRight, AlertCircle, BarChart2
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const STATUS_MAHASISWA_COLOR = {
    AKTIF: '#10b981', CUTI: '#f59e0b', LULUS: '#6366f1',
    DROPOUT: '#ef4444', CALON: '#8b5cf6'
};

const STATUS_KRS_COLOR = {
    DIAJUKAN: '#f59e0b', DISETUJUI: '#10b981', DITOLAK: '#ef4444',
    DRAFT: '#9ca3af', TERLAMBAT: '#f97316', PENGECUALIAN: '#8b5cf6'
};

const STATUS_PENDAFTAR_COLOR = {
    DAFTAR: 'bg-blue-100 text-blue-700',
    BAYAR: 'bg-yellow-100 text-yellow-700',
    LULUS: 'bg-green-100 text-green-700',
    GUGUR: 'bg-red-100 text-red-700',
};

function StatCard({ icon: Icon, label, value, sub, iconColor, iconBg, href }) {
    const content = (
        <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-default">
            <div className="flex items-start justify-between">
                <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} className={iconColor} />
                </div>
                {href && <ArrowRight size={14} className="text-slate-300" />}
            </div>
            <div className="mt-4">
                <div className="text-2xl font-bold text-slate-800">{value ?? '—'}</div>
                <div className="text-slate-500 text-sm mt-0.5">{label}</div>
                {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
            </div>
        </div>
    );
    if (href) return <a href={href} className="block">{content}</a>;
    return content;
}

function ChartCard({ title, children, action }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-slate-700 text-sm">{title}</h3>
                {action}
            </div>
            {children}
        </div>
    );
}

function EmptyChart() {
    return (
        <div className="flex flex-col items-center justify-center h-48 text-slate-300">
            <BarChart2 size={36} className="mb-2" />
            <div className="text-sm">Belum ada data</div>
        </div>
    );
}

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div className="bg-slate-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
                <div className="font-semibold mb-1">{label}</div>
                {payload.map((p, i) => (
                    <div key={i}>{p.name}: <strong>{p.value}</strong></div>
                ))}
            </div>
        );
    }
    return null;
};

export default function DashboardPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData));
        api.get('/dashboard')
            .then(r => setData(r.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <Layout title="Dashboard">
                <div className="flex items-center justify-center py-32">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                        <div className="text-slate-400 text-sm">Memuat dashboard...</div>
                    </div>
                </div>
            </Layout>
        );
    }

    const { stats, charts, aktivitas } = data || {};
    const jam = new Date().getHours();
    const salam = jam < 11 ? 'Selamat Pagi' : jam < 15 ? 'Selamat Siang' : jam < 18 ? 'Selamat Sore' : 'Selamat Malam';
    const firstName = user?.nama?.split(' ')[0];

    return (
        <Layout title="Dashboard">

            {/* Greeting Banner */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-full opacity-10">
                    <GraduationCap size={200} className="absolute -right-8 -top-8 text-white" />
                </div>
                <div className="relative z-10">
                    <p className="text-indigo-300 text-sm mb-1">{salam}</p>
                    <h1 className="text-2xl font-bold text-white">{firstName}!</h1>
                    <p className="text-indigo-300 text-sm mt-1">
                        {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>

                    {(stats?.krsMenunggu > 0 || stats?.tagihanBelumBayar > 0) && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {stats?.krsMenunggu > 0 && (
                                <a href="/akademik/krs"
                                    className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs px-3 py-2 rounded-lg transition">
                                    <AlertCircle size={13} />
                                    <span><strong>{stats.krsMenunggu}</strong> KRS menunggu persetujuan</span>
                                </a>
                            )}
                            {stats?.tagihanBelumBayar > 0 && (
                                <a href="/keuangan"
                                    className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs px-3 py-2 rounded-lg transition">
                                    <AlertCircle size={13} />
                                    <span><strong>{stats.tagihanBelumBayar}</strong> tagihan belum dibayar</span>
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Akademik */}
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Akademik</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <StatCard icon={GraduationCap} label="Total Mahasiswa" value={stats?.totalMahasiswa}
                    iconColor="text-indigo-600" iconBg="bg-indigo-50" href="/akademik/mahasiswa" />
                <StatCard icon={Users} label="Dosen Aktif" value={stats?.totalDosen}
                    iconColor="text-blue-600" iconBg="bg-blue-50" href="/akademik/dosen" />
                <StatCard icon={BookOpen} label="Mata Kuliah" value={stats?.totalMataKuliah}
                    iconColor="text-purple-600" iconBg="bg-purple-50" href="/akademik/mata-kuliah" />
                <StatCard icon={School} label="Program Studi" value={stats?.totalProdi}
                    iconColor="text-cyan-600" iconBg="bg-cyan-50" href="/akademik/prodi" />
            </div>

            {/* Stats PAMABA */}
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Penerimaan Mahasiswa Baru</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                <StatCard icon={ClipboardList} label="Total Pendaftar" value={stats?.totalPendaftar}
                    iconColor="text-orange-600" iconBg="bg-orange-50" href="/pamaba/pendaftar" />
                <StatCard icon={Clock} label="Dalam Proses" value={stats?.pendaftarProses}
                    iconColor="text-yellow-600" iconBg="bg-yellow-50" />
                <StatCard icon={CheckCircle} label="Diterima" value={stats?.pendaftarLulus}
                    iconColor="text-green-600" iconBg="bg-green-50" />
                <StatCard icon={XCircle} label="Gugur" value={stats?.pendaftarGugur}
                    iconColor="text-red-500" iconBg="bg-red-50" />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <ChartCard title="Tren Pendaftar 6 Bulan Terakhir">
                    {charts?.pendaftarPerBulan?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={210}>
                            <LineChart data={charts.pendaftarPerBulan}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5}
                                    dot={{ fill: '#6366f1', r: 4, strokeWidth: 0 }} name="Pendaftar" />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : <EmptyChart />}
                </ChartCard>

                <ChartCard title="Pendaftar per Gelombang">
                    {charts?.pendaftarPerGelombang?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={210}>
                            <BarChart data={charts.pendaftarPerGelombang} barSize={32}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="nama" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="total" name="Pendaftar" radius={[6, 6, 0, 0]}>
                                    {charts.pendaftarPerGelombang.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <EmptyChart />}
                </ChartCard>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                <ChartCard title="Mahasiswa per Program Studi"
                    action={<a href="/akademik/mahasiswa" className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1">Lihat <ArrowRight size={12} /></a>}>
                    <div className="lg:col-span-2">
                        {charts?.mahasiswaPerProdi?.length > 0 ? (
                            <ResponsiveContainer width="100%" height={210}>
                                <BarChart data={charts.mahasiswaPerProdi} layout="vertical" barSize={18}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="nama" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={130} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="total" name="Mahasiswa" radius={[0, 6, 6, 0]}>
                                        {charts.mahasiswaPerProdi.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <EmptyChart />}
                    </div>
                </ChartCard>

                {/* Pie Chart */}
                <ChartCard title="Status Mahasiswa">
                    {charts?.mahasiswaPerStatus?.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={150}>
                                <PieChart>
                                    <Pie data={charts.mahasiswaPerStatus} dataKey="total" nameKey="status"
                                        cx="50%" cy="50%" outerRadius={65} innerRadius={35} paddingAngle={3}>
                                        {charts.mahasiswaPerStatus.map((entry, i) => (
                                            <Cell key={i} fill={STATUS_MAHASISWA_COLOR[entry.status] || COLORS[i]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 mt-3">
                                {charts.mahasiswaPerStatus.map((s, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                style={{ background: STATUS_MAHASISWA_COLOR[s.status] || COLORS[i] }} />
                                            <span className="text-slate-500">{s.status}</span>
                                        </div>
                                        <span className="font-semibold text-slate-700">{s.total}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : <EmptyChart />}
                </ChartCard>
            </div>

            {/* Status KRS */}
            {charts?.krsPerStatus?.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
                    <h3 className="font-semibold text-slate-700 text-sm mb-4">Status KRS</h3>
                    <div className="flex flex-wrap gap-3">
                        {charts.krsPerStatus.map((k, i) => (
                            <div key={i} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                                <div className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ background: STATUS_KRS_COLOR[k.status] || COLORS[i] }} />
                                <div>
                                    <div className="text-xs text-slate-400">{k.status}</div>
                                    <div className="text-lg font-bold text-slate-800">{k.total}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Aktivitas Terbaru */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                <ChartCard title="Pendaftar Terbaru"
                    action={<a href="/pamaba/pendaftar" className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1">Lihat semua <ArrowRight size={12} /></a>}>
                    {!aktivitas?.pendaftarBaru?.length ? (
                        <div className="text-center py-8 text-slate-300">
                            <ClipboardList size={32} className="mx-auto mb-2" />
                            <div className="text-sm">Belum ada pendaftar</div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {aktivitas.pendaftarBaru.map((p, i) => (
                                <div key={i} className="flex items-center justify-between py-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0">
                                            {p.nama?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-700">{p.nama}</div>
                                            <div className="text-xs text-slate-400">{p.prodi?.nama}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_PENDAFTAR_COLOR[p.status] || 'bg-slate-100 text-slate-600'}`}>
                                            {p.status}
                                        </span>
                                        <div className="text-xs text-slate-300 mt-1">
                                            {new Date(p.createdAt).toLocaleDateString('id-ID')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ChartCard>

                <ChartCard title="KRS Menunggu Persetujuan"
                    action={<a href="/akademik/krs" className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1">Lihat semua <ArrowRight size={12} /></a>}>
                    {!aktivitas?.krsBaru?.length ? (
                        <div className="text-center py-8 text-slate-300">
                            <CheckCircle size={32} className="mx-auto mb-2" />
                            <div className="text-sm">Tidak ada KRS menunggu</div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {aktivitas.krsBaru.map((k, i) => (
                                <div key={i} className="flex items-center justify-between py-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-bold text-xs flex-shrink-0">
                                            {k.mahasiswa?.nama?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-700">{k.mahasiswa?.nama}</div>
                                            <div className="text-xs text-slate-400">{k.mahasiswa?.nim} • {k.periode?.nama}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-indigo-600">{k.totalSks} SKS</div>
                                        <div className="text-xs text-slate-300 mt-1">
                                            {new Date(k.createdAt).toLocaleDateString('id-ID')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ChartCard>
            </div>

        </Layout>
    );
}