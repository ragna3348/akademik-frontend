import { useState, useEffect, useRef } from 'react';
import Layout from '@/components/layouts/Layout';
import api from '@/utils/api';
import toast, { Toaster } from 'react-hot-toast';
import {
    Building2, Image, GraduationCap, Palette, Eye,
    Upload, Trash2, RefreshCw, Save, Phone, Mail,
    Globe, MapPin, Award, Hash
} from 'lucide-react';

export default function SettingPage() {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [previewLogo, setPreviewLogo] = useState(null);
    const logoRef = useRef();

    const fetchSettings = async () => {
        try {
            const res = await api.get('/pengaturan/setting');
            setSettings(res.data.data);
            if (res.data.data.logo) setPreviewLogo(`http://localhost:3000${res.data.data.logo}`);
        } catch { toast.error('Gagal ambil setting!'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchSettings(); }, []);

    const handleChange = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/pengaturan/setting', settings);
            toast.success('Pengaturan berhasil disimpan!');
        } catch (e) { toast.error(e.response?.data?.message || 'Gagal!'); }
        finally { setSaving(false); }
    };

    const handleUploadLogo = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setPreviewLogo(ev.target.result);
        reader.readAsDataURL(file);
        setUploadingLogo(true);
        try {
            const formData = new FormData();
            formData.append('logo', file);
            const res = await api.post('/pengaturan/setting/upload-logo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSettings(prev => ({ ...prev, logo: res.data.data.path }));
            toast.success('Logo berhasil diupload!');
        } catch (e) { toast.error(e.response?.data?.message || 'Gagal upload!'); }
        finally { setUploadingLogo(false); }
    };

    const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400";
    const labelClass = "block text-sm font-medium text-slate-500 mb-1.5";

    const SectionHeader = ({ icon: Icon, title }) => (
        <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Icon size={15} className="text-indigo-600" />
            </div>
            <h2 className="font-bold text-slate-700">{title}</h2>
        </div>
    );

    if (loading) return (
        <Layout title="Pengaturan Umum">
            <div className="flex items-center justify-center py-32">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        </Layout>
    );

    return (
        <Layout title="Pengaturan Umum">
            <Toaster position="top-right" />

            <div className="max-w-4xl space-y-4">

                {/* Identitas Kampus */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <SectionHeader icon={Building2} title="Identitas Kampus" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className={labelClass}>Nama Kampus</label>
                            <input type="text" value={settings.nama_kampus || ''}
                                onChange={e => handleChange('nama_kampus', e.target.value)}
                                className={inputClass} placeholder="Universitas..." />
                        </div>
                        <div>
                            <label className={labelClass}>Singkatan</label>
                            <input type="text" value={settings.singkatan || ''}
                                onChange={e => handleChange('singkatan', e.target.value)}
                                className={inputClass} placeholder="UNCON" />
                        </div>
                        <div>
                            <label className={labelClass}>Akreditasi</label>
                            <select value={settings.akreditasi || ''}
                                onChange={e => handleChange('akreditasi', e.target.value)}
                                className={inputClass}>
                                <option value="">-- Pilih --</option>
                                {['A', 'B', 'C', 'Unggul', 'Baik Sekali', 'Baik'].map(a => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Tahun Berdiri</label>
                            <input type="number" value={settings.tahun_berdiri || ''}
                                onChange={e => handleChange('tahun_berdiri', e.target.value)}
                                className={inputClass} placeholder="2000" />
                        </div>
                        <div>
                            <label className={labelClass}>Telepon</label>
                            <input type="text" value={settings.telepon || ''}
                                onChange={e => handleChange('telepon', e.target.value)}
                                className={inputClass} placeholder="(021) 1234567" />
                        </div>
                        <div>
                            <label className={labelClass}>Email</label>
                            <input type="email" value={settings.email || ''}
                                onChange={e => handleChange('email', e.target.value)}
                                className={inputClass} placeholder="info@kampus.ac.id" />
                        </div>
                        <div>
                            <label className={labelClass}>Website</label>
                            <input type="text" value={settings.website || ''}
                                onChange={e => handleChange('website', e.target.value)}
                                className={inputClass} placeholder="https://kampus.ac.id" />
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClass}>Alamat</label>
                            <textarea rows={2} value={settings.alamat || ''}
                                onChange={e => handleChange('alamat', e.target.value)}
                                className={inputClass} placeholder="Jl. ..." />
                        </div>
                    </div>
                </div>

                {/* Logo */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <SectionHeader icon={Image} title="Logo Kampus" />
                    <div className="flex items-center gap-6">
                        <div className="w-28 h-28 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden bg-slate-50 flex-shrink-0">
                            {previewLogo ? (
                                <img src={previewLogo} alt="Logo" className="w-full h-full object-contain p-2" />
                            ) : (
                                <div className="text-center text-slate-300">
                                    <Building2 size={32} className="mx-auto mb-1" />
                                    <div className="text-xs">Belum ada logo</div>
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 mb-3">
                                Format: PNG, JPG, SVG, WebP. Ukuran maksimal 2MB.
                            </p>
                            <input ref={logoRef} type="file" accept="image/*"
                                onChange={handleUploadLogo} className="hidden" />
                            <div className="flex gap-2">
                                <button onClick={() => logoRef.current.click()} disabled={uploadingLogo}
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 transition">
                                    {uploadingLogo
                                        ? <><RefreshCw size={13} className="animate-spin" /> Mengupload...</>
                                        : <><Upload size={13} /> Pilih Logo</>
                                    }
                                </button>
                                {previewLogo && (
                                    <button onClick={() => { setPreviewLogo(null); handleChange('logo', ''); }}
                                        className="flex items-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl text-sm transition">
                                        <Trash2 size={13} /> Hapus
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pengaturan Akademik */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <SectionHeader icon={GraduationCap} title="Pengaturan Akademik" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Minimal SKS per Semester</label>
                            <input type="number" value={settings.min_sks || ''}
                                onChange={e => handleChange('min_sks', e.target.value)}
                                className={inputClass} min="1" max="24" />
                        </div>
                        <div>
                            <label className={labelClass}>Maksimal SKS per Semester</label>
                            <input type="number" value={settings.max_sks || ''}
                                onChange={e => handleChange('max_sks', e.target.value)}
                                className={inputClass} min="1" max="30" />
                        </div>
                    </div>
                </div>

                {/* Tema */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <SectionHeader icon={Palette} title="Tampilan" />
                    <div>
                        <label className={labelClass}>Warna Tema Utama</label>
                        <div className="flex items-center gap-3 flex-wrap">
                            <input type="color" value={settings.warna_primer || '#4f46e5'}
                                onChange={e => handleChange('warna_primer', e.target.value)}
                                className="w-11 h-10 rounded-xl border border-slate-200 cursor-pointer p-1 bg-white" />
                            <input type="text" value={settings.warna_primer || ''}
                                onChange={e => handleChange('warna_primer', e.target.value)}
                                className="border border-slate-200 bg-slate-50 rounded-xl px-4 py-2 w-32 text-sm text-slate-700 focus:outline-none focus:border-indigo-400"
                                placeholder="#4f46e5" />
                            <div className="flex gap-2">
                                {['#4f46e5', '#2563eb', '#16a34a', '#dc2626', '#d97706', '#7c3aed'].map(c => (
                                    <button key={c} onClick={() => handleChange('warna_primer', c)}
                                        title={c}
                                        className={`w-8 h-8 rounded-full border-2 transition ${settings.warna_primer === c ? 'border-slate-400 scale-110' : 'border-white shadow-sm'}`}
                                        style={{ background: c }} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <SectionHeader icon={Eye} title="Preview" />
                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                        <div className="p-4 flex items-center gap-3"
                            style={{ background: settings.warna_primer || '#4f46e5' }}>
                            {previewLogo ? (
                                <img src={previewLogo} alt="Logo" className="w-10 h-10 object-contain bg-white rounded-xl p-1" />
                            ) : (
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold">
                                    {(settings.singkatan || 'K').charAt(0)}
                                </div>
                            )}
                            <div>
                                <div className="text-white font-bold text-sm">{settings.nama_kampus || 'Nama Kampus'}</div>
                                <div className="text-white/70 text-xs mt-0.5">
                                    {settings.singkatan || ''}{settings.akreditasi ? ` · Akreditasi ${settings.akreditasi}` : ''}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 text-sm text-slate-500 space-y-1.5">
                            {[
                                { icon: MapPin, value: settings.alamat },
                                { icon: Phone, value: settings.telepon },
                                { icon: Mail, value: settings.email },
                                { icon: Globe, value: settings.website },
                            ].map(({ icon: Icon, value }) => value && (
                                <div key={value} className="flex items-center gap-2 text-xs text-slate-500">
                                    <Icon size={12} className="text-slate-400 flex-shrink-0" />
                                    {value}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tombol Simpan */}
                <div className="flex justify-end gap-3 pb-6">
                    <button onClick={fetchSettings}
                        className="flex items-center gap-2 border border-slate-200 text-slate-500 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">
                        <RefreshCw size={14} /> Reset
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition">
                        {saving
                            ? <><RefreshCw size={14} className="animate-spin" /> Menyimpan...</>
                            : <><Save size={14} /> Simpan Pengaturan</>
                        }
                    </button>
                </div>
            </div>
        </Layout>
    );
}