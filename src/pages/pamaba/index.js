import { useState, useEffect } from 'react';
import Layout from '@/components/layouts/Layout';
import api from '@/utils/api';
import {
    Users, CheckCircle, Clock, GraduationCap,
    XCircle, Waves, UserCircle, CreditCard
} from 'lucide-react';

export default function PamabaDashboard() {
    const [stats, setStats] = useState({
        totalPendaftar: 0, sudahBayar: 0,
        lulus: 0, gugur: 0, belumBayar: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/pamaba/pendaftar/stats')
            .then(res => setStats(res.data.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const cards = [
        { icon: Users, label: 'Total Pendaftar', value: stats.totalPendaftar, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
        { icon: CheckCircle, label: 'Sudah Bayar', value: stats.sudahBayar, iconBg: 'bg-green-50', iconColor: 'text-green-600' },
        { icon: Clock, label: 'Belum Bayar', value: stats.belumBayar, iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
        { icon: GraduationCap, label: 'Diterima', value: stats.lulus, iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
        { icon: XCircle, label: 'Gugur', value: stats.gugur, iconBg: 'bg-red-50', iconColor: 'text-red-500' },
    ];

    const links = [
        {
            href: '/pamaba/gelombang',
            icon: Waves,
            label: 'Gelombang Pendaftaran',
            desc: 'Kelola gelombang & periode pendaftaran',
            iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600'
        },
        {
            href: '/pamaba/pendaftar',
            icon: UserCircle,
            label: 'Data Pendaftar',
            desc: 'Lihat & kelola semua pendaftar',
            iconBg: 'bg-blue-50', iconColor: 'text-blue-600'
        },
        {
            href: '/pamaba/pembayaran',
            icon: CreditCard,
            label: 'Pembayaran',
            desc: 'Konfirmasi pembayaran pendaftar',
            iconBg: 'bg-green-50', iconColor: 'text-green-600'
        },
    ];

    return (
        <Layout title="Dashboard PAMABA">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="bg-white border border-slate-200 rounded-xl p-4">
                            <div className={`w-9 h-9 ${card.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                                <Icon size={17} className={card.iconColor} />
                            </div>
                            <div className="text-2xl font-bold text-slate-700">
                                {loading ? <span className="text-slate-300">...</span> : card.value}
                            </div>
                            <div className="text-slate-400 text-sm mt-0.5">{card.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {links.map((item) => {
                    const Icon = item.icon;
                    return (
                        <a key={item.href} href={item.href}
                            className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-sm transition group block">
                            <div className={`w-11 h-11 ${item.iconBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                                <Icon size={20} className={item.iconColor} />
                            </div>
                            <div className="font-semibold text-slate-700 mb-1">{item.label}</div>
                            <div className="text-slate-400 text-sm">{item.desc}</div>
                        </a>
                    );
                })}
            </div>
        </Layout>
    );
}