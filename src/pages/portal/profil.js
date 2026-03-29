import { useState, useEffect, useRef } from 'react';
import PortalLayout from '@/components/layouts/PortalLayout';
import api from '@/utils/api';
import toast, { Toaster } from 'react-hot-toast';
import {
    UserCircle, Mail, Phone, MapPin, Save,
    Lock, Eye, EyeOff, Camera, GraduationCap,
    BookOpen, Users, Calendar
} from 'lucide-react';

export default function PortalProfil() {
    const [mahasiswa, setMahasiswa] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('profil');
    const [showPass, setShowPass] = useState({ lama: false, baru: false, konfirmasi: false });
    const fotoRef = useRef();

    const [form, setForm] = useState({
        telepon: '', alamat: '', foto: ''
    });

    const [passForm, setPassForm] = useState({
        passwordLama: '', passwordBaru: '', konfirmasiPassword: ''
    });

    useEffect(() => {
        api.get('/portal/profil')
            .then(r => {
                const mhs = r.data.data;
                setMahasiswa(mhs);
                setForm({
                    telepon: mhs.telepon || '',
                    alamat: mhs.alamat || '',
                    foto: mhs.foto || ''
                });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleSaveProfil = async () => {
        setSaving(true);
        try {
            await api.put('/portal/profil', form);
            toast.success('Profil berhasil diperbarui!');
        } catch (e) {
            toast.error(e.response?.data?.message || 'Gagal simpan!');
        } finally {
            setSaving(false);
        }
    };

    const handleSavePassword = async () => {
        if (!passForm.passwordLama || !passForm.passwordBaru || !passForm.konfirmasiPassword) {
            toast.error('Semua field wajib diisi!'); return;
        }
        if (passForm.passwordBaru !== passForm.konfirmasiPassword) {
            toast.error('Password baru tidak cocok!'); return;
        }
        if (passForm.passwordBaru.length < 8) {
            toast.error('Password minimal 8 karakter!'); return;
        }
        setSavingPassword(true);
        try {
            await api.put('/portal/ganti-password', passForm);
            toast.success('Password berhasil diubah!');
            setPassForm({ passwordLama: '', passwordBaru: '', konfirmasiPassword: '' });
        } catch (e) {
            toast.error(e.response?.data?.message || 'Gagal ubah password!');
        } finally {
            setSavingPassword(false);
        }
    };

    const handleUploadFoto = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('foto', file);
        try {
            const res = await api.post('/portal/upload-foto', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setForm(prev => ({ ...prev, foto: res.data.data.path }));
            setMahasiswa(prev => ({ ...prev, foto: res.data.data.path }));
            toast.success('Foto berhasil diupload!');
        } catch {
            toast.error('Gagal upload foto!');
        }
    };

    const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition";
    const labelClass = "block text-sm font-medium text-slate-600 mb-1.5";

    const TABS = [
        { id: 'profil', label: 'Profil', icon: UserCircle },
        { id: 'password', label: 'Keamanan', icon: Lock },
    ];

    if (loading) return (
        <PortalLayout title="Profil Saya">
            <div className="flex items-center justify-center py-32">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                    <div className="text-slate-400 text-sm">Memuat profil...</div>
                </div>
            </div>
        </PortalLayout>
    );

    return (
        <PortalLayout title="Profil Saya">
            <Toaster position="top-right" />

            <div className="max-w-3xl mx-auto">

                {/* Header Profil */}
                <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-2xl p-6 text-white mb-5 relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-5">
                        <GraduationCap size={180} />
                    </div>
                    <div className="relative z-10 flex items-center gap-5">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <div className="w-20 h-20 rounded-2xl border-2 border-white/30 overflow-hidden bg-indigo-600 flex items-center justify-center">
                                {mahasiswa?.foto
                                    ? <img src={`http://localhost:3000${mahasiswa.foto}`} alt="Foto"
                                        className="w-full h-full object-cover" />
                                    : <UserCircle size={40} className="text-white/60" />
                                }
                            </div>
                            <button onClick={() => fotoRef.current.click()}
                                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-white rounded-xl flex items-center justify-center shadow-lg hover:bg-slate-50 transition">
                                <Camera size={13} className="text-indigo-600" />
                            </button>
                            <input ref={fotoRef} type="file" accept="image/*"
                                onChange={handleUploadFoto} className="hidden" />
                        </div>

                        <div className="min-w-0">
                            <h2 className="text-xl font-bold text-white truncate">{mahasiswa?.nama}</h2>
                            <p className="text-indigo-300 text-sm mt-0.5">{mahasiswa?.nim}</p>
                            <p className="text-indigo-300 text-sm truncate">{mahasiswa?.prodi?.nama}</p>
                        </div>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    {[
                        { icon: BookOpen, label: 'Semester', value: mahasiswa?.semester, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                        { icon: Calendar, label: 'Angkatan', value: mahasiswa?.tahunAngkatan, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { icon: Users, label: 'Jenis Mahasiswa', value: mahasiswa?.jenisMhs?.nama || '-', color: 'text-purple-600', bg: 'bg-purple-50' },
                        { icon: GraduationCap, label: 'Status', value: mahasiswa?.status, color: 'text-green-600', bg: 'bg-green-50' },
                    ].map(c => {
                        const Icon = c.icon;
                        return (
                            <div key={c.label} className="bg-white border border-slate-200 rounded-xl p-4">
                                <div className={`w-8 h-8 ${c.bg} rounded-lg flex items-center justify-center mb-2`}>
                                    <Icon size={15} className={c.color} />
                                </div>
                                <div className="text-sm font-bold text-slate-800 leading-tight">{c.value}</div>
                                <div className="text-xs text-slate-400 mt-0.5">{c.label}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-5">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                                    ${activeTab === tab.id
                                        ? 'bg-white text-indigo-700 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}>
                                <Icon size={15} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Profil */}
                {activeTab === 'profil' && (
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-semibold text-slate-700 text-sm">Informasi yang Dapat Diedit</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Data akademik tidak dapat diubah secara mandiri</p>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Read-only fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Nama Lengkap</label>
                                    <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5">
                                        <UserCircle size={15} className="text-slate-400 flex-shrink-0" />
                                        <span className="text-sm text-slate-500">{mahasiswa?.nama}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Email</label>
                                    <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5">
                                        <Mail size={15} className="text-slate-400 flex-shrink-0" />
                                        <span className="text-sm text-slate-500 truncate">{mahasiswa?.email}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Editable fields */}
                            <div>
                                <label className={labelClass}>Nomor Telepon</label>
                                <div className="relative">
                                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="text" value={form.telepon}
                                        onChange={e => setForm({ ...form, telepon: e.target.value })}
                                        className={`${inputClass} pl-9`}
                                        placeholder="08xxxxxxxxxx" />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Alamat</label>
                                <div className="relative">
                                    <MapPin size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                                    <textarea rows={3} value={form.alamat}
                                        onChange={e => setForm({ ...form, alamat: e.target.value })}
                                        className={`${inputClass} pl-9 resize-none`}
                                        placeholder="Alamat lengkap..." />
                                </div>
                            </div>
                        </div>

                        <div className="px-5 py-4 border-t border-slate-100 flex justify-end">
                            <button onClick={handleSaveProfil} disabled={saving}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50 transition">
                                {saving ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</>
                                ) : (
                                    <><Save size={15} /> Simpan Perubahan</>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Tab Password */}
                {activeTab === 'password' && (
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-semibold text-slate-700 text-sm">Ganti Password</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Gunakan password yang kuat minimal 8 karakter</p>
                        </div>

                        <div className="p-5 space-y-4">
                            {[
                                { key: 'passwordLama', label: 'Password Saat Ini', show: 'lama' },
                                { key: 'passwordBaru', label: 'Password Baru', show: 'baru' },
                                { key: 'konfirmasiPassword', label: 'Konfirmasi Password Baru', show: 'konfirmasi' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label className={labelClass}>{f.label}</label>
                                    <div className="relative">
                                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type={showPass[f.show] ? 'text' : 'password'}
                                            value={passForm[f.key]}
                                            onChange={e => setPassForm({ ...passForm, [f.key]: e.target.value })}
                                            className={`${inputClass} pl-9 pr-10`}
                                            placeholder="••••••••" />
                                        <button type="button"
                                            onClick={() => setShowPass(prev => ({ ...prev, [f.show]: !prev[f.show] }))}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                                            {showPass[f.show] ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="px-5 py-4 border-t border-slate-100 flex justify-end">
                            <button onClick={handleSavePassword} disabled={savingPassword}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50 transition">
                                {savingPassword ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</>
                                ) : (
                                    <><Lock size={15} /> Ubah Password</>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </PortalLayout>
    );
}