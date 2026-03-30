import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import {
    UserCheck, User, Mail, Lock, Eye, EyeOff, ArrowLeft,
    Upload, FileText, CheckCircle, GraduationCap, Hash,
    Phone, BookOpen, RefreshCw, LogIn, Send, Camera
} from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const inputClass = "w-full border-2 border-slate-200 bg-white rounded-xl px-4 py-2.5 text-slate-700 text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition";
const labelClass = "block text-sm font-semibold text-slate-600 mb-1.5";

export default function DaftarDosen() {
    const router = useRouter();
    const [step, setStep] = useState(0); // 0 = form akun, 1 = berkas, 2 = selesai
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({
        nama: '', username: '', nidn: '', email: '',
        password: '', konfirmasiPassword: '',
        telepon: '', pendidikanTerakhir: ''
    });
    const [files, setFiles] = useState({
        foto: null, dokumenCV: null, dokumenIjazah: null,
        dokumenKTP: null, dokumenSertifikasi: null
    });
    const [previews, setPreviews] = useState({});

    const handleFileChange = (field, file) => {
        if (!file) return;
        setFiles(f => ({ ...f, [field]: file }));
        setPreviews(p => ({ ...p, [field]: URL.createObjectURL(file) }));
    };

    const handleSubmit = async () => {
        if (!form.nama || !form.username || !form.email || !form.password) {
            toast.error('Nama, username, email, dan password wajib diisi!'); return;
        }
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) {
            toast.error('Username harus 3-20 karakter (huruf, angka, underscore)!'); return;
        }
        if (form.password.length < 8) {
            toast.error('Password minimal 8 karakter!'); return;
        }
        if (form.password !== form.konfirmasiPassword) {
            toast.error('Password dan konfirmasi tidak sama!'); return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => { if (v && k !== 'konfirmasiPassword') formData.append(k, v); });
            Object.entries(files).forEach(([k, v]) => { if (v) formData.append(k, v); });

            await axios.post(`${BASE_URL}/pamaba/dosen/daftar`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Pendaftaran berhasil!');
            setStep(2);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Gagal mendaftar!');
        } finally {
            setLoading(false);
        }
    };

    const berkasList = [
        { field: 'foto', label: 'Pas Foto', icon: Camera, desc: 'Foto formal ukuran 3x4' },
        { field: 'dokumenCV', label: 'Curriculum Vitae (CV)', icon: FileText, desc: 'Format PDF' },
        { field: 'dokumenIjazah', label: 'Ijazah Terakhir', icon: GraduationCap, desc: 'Scan ijazah S1/S2/S3' },
        { field: 'dokumenKTP', label: 'KTP', icon: FileText, desc: 'Scan KTP berlaku' },
        { field: 'dokumenSertifikasi', label: 'Sertifikasi Pendidik', icon: BookOpen, desc: 'Opsional, jika ada' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="bg-black/30 backdrop-blur-sm border-b border-white/10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                            <UserCheck size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-lg leading-tight">Pendaftaran Dosen</h1>
                            <p className="text-emerald-400 text-xs">Sistem Informasi Akademik</p>
                        </div>
                    </div>
                    <a href="/login" className="flex items-center gap-1.5 text-emerald-400 hover:text-white text-sm transition">
                        <LogIn size={14} /> Sudah punya akun?
                    </a>
                </div>
            </div>

            <div className="max-w-2xl mx-auto py-8 px-4">

                {/* Step indicator */}
                {step < 2 && (
                    <div className="flex items-center justify-center mb-8 gap-2">
                        {[
                            { num: 0, label: 'Data Diri', icon: User },
                            { num: 1, label: 'Upload Berkas', icon: Upload },
                        ].map((s, i) => {
                            const Icon = s.icon;
                            const done = step > s.num;
                            const active = step === s.num;
                            return (
                                <div key={s.num} className="flex items-center">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                                            done ? 'bg-green-400 text-white' : active ? 'bg-white text-emerald-800' : 'bg-emerald-800/60 text-emerald-400 border-2 border-emerald-700'
                                        }`}>
                                            {done ? <CheckCircle size={16} /> : <Icon size={15} />}
                                        </div>
                                        <span className={`text-xs mt-1 ${step >= s.num ? 'text-white' : 'text-emerald-500'}`}>{s.label}</span>
                                    </div>
                                    {i < 1 && <div className={`w-16 h-0.5 mx-2 mb-5 rounded ${done ? 'bg-green-400' : 'bg-emerald-700'}`} />}
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">

                    {/* Step 0 — Data Diri */}
                    {step === 0 && (
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                                    <User size={18} className="text-emerald-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">Data Diri</h2>
                                    <p className="text-slate-400 text-xs">Isi data diri untuk membuat akun dosen</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>Nama Lengkap (tanpa gelar) *</label>
                                    <input type="text" value={form.nama}
                                        onChange={e => setForm({ ...form, nama: e.target.value })}
                                        className={inputClass} placeholder="Contoh: Ahmad Fauzan" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Username *</label>
                                        <input type="text" value={form.username}
                                            onChange={e => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                            className={inputClass} placeholder="contoh: ahmad_fauzan" maxLength={20} />
                                        <p className="text-xs text-slate-400 mt-1">3-20 karakter (huruf kecil, angka, _)</p>
                                    </div>
                                    <div>
                                        <label className={labelClass}>NIDN</label>
                                        <input type="text" value={form.nidn}
                                            onChange={e => setForm({ ...form, nidn: e.target.value })}
                                            className={inputClass} placeholder="Kosongkan jika belum ada" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Email *</label>
                                        <input type="email" value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                            className={inputClass} placeholder="email@gmail.com" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Telepon</label>
                                        <input type="text" value={form.telepon}
                                            onChange={e => setForm({ ...form, telepon: e.target.value })}
                                            className={inputClass} placeholder="08xxxxxxxxxx" />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Pendidikan Terakhir</label>
                                    <select value={form.pendidikanTerakhir}
                                        onChange={e => setForm({ ...form, pendidikanTerakhir: e.target.value })}
                                        className={inputClass}>
                                        <option value="">-- Pilih --</option>
                                        <option value="S1">S1 (Sarjana)</option>
                                        <option value="S2">S2 (Magister)</option>
                                        <option value="S3">S3 (Doktor)</option>
                                        <option value="Profesor">Profesor</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Password *</label>
                                    <div className="relative">
                                        <input type={showPassword ? 'text' : 'password'} value={form.password}
                                            onChange={e => setForm({ ...form, password: e.target.value })}
                                            className={`${inputClass} pr-12`} placeholder="Minimal 8 karakter" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Konfirmasi Password *</label>
                                    <input type="password" value={form.konfirmasiPassword}
                                        onChange={e => setForm({ ...form, konfirmasiPassword: e.target.value })}
                                        className={inputClass} placeholder="Ulangi password" />
                                </div>
                            </div>

                            <button onClick={() => {
                                if (!form.nama || !form.username || !form.email || !form.password || !form.konfirmasiPassword) {
                                    toast.error('Semua field wajib harus diisi!'); return;
                                }
                                if (form.password !== form.konfirmasiPassword) {
                                    toast.error('Password tidak sama!'); return;
                                }
                                setStep(1);
                            }}
                                className="w-full mt-6 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition">
                                Lanjutkan <Send size={15} />
                            </button>

                            <p className="text-center text-sm text-slate-400 mt-4">
                                Sudah punya akun? <a href="/login" className="text-emerald-600 hover:underline font-medium">Masuk disini</a>
                            </p>
                        </div>
                    )}

                    {/* Step 1 — Upload Berkas */}
                    {step === 1 && (
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                                    <Upload size={18} className="text-emerald-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">Upload Berkas</h2>
                                    <p className="text-slate-400 text-xs">Unggah dokumen yang diperlukan</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {berkasList.map(b => {
                                    const Icon = b.icon;
                                    return (
                                        <div key={b.field} className="flex items-center gap-4 border-2 border-dashed border-slate-200 rounded-xl p-4 hover:border-emerald-300 transition">
                                            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Icon size={18} className="text-slate-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-700">{b.label}</p>
                                                <p className="text-xs text-slate-400">{b.desc}</p>
                                                {files[b.field] && (
                                                    <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                                                        <CheckCircle size={11} /> {files[b.field].name}
                                                    </p>
                                                )}
                                            </div>
                                            <label className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer transition">
                                                <Upload size={12} /> Pilih File
                                                <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf"
                                                    onChange={e => handleFileChange(b.field, e.target.files[0])} />
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setStep(0)}
                                    className="flex-1 border-2 border-slate-200 text-slate-600 py-3 rounded-xl font-semibold hover:bg-slate-50 transition flex items-center justify-center gap-2">
                                    <ArrowLeft size={15} /> Kembali
                                </button>
                                <button onClick={handleSubmit} disabled={loading}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 transition flex items-center justify-center gap-2">
                                    {loading ? <><RefreshCw size={15} className="animate-spin" /> Mendaftar...</> : <><CheckCircle size={15} /> Kirim Pendaftaran</>}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2 — Selesai */}
                    {step === 2 && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={40} className="text-emerald-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Pendaftaran Berhasil!</h2>
                            <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
                                Akun dosen Anda telah dibuat. Berkas sedang dalam proses verifikasi oleh admin. 
                                Anda akan mendapat notifikasi setelah berkas disetujui.
                            </p>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-md mx-auto mb-6">
                                <p className="text-amber-700 text-sm">
                                    <strong>Catatan:</strong> Anda sudah bisa login, namun beberapa fitur portal dosen 
                                    akan terkunci sampai berkas Anda diverifikasi dan disetujui oleh admin.
                                </p>
                            </div>
                            <button onClick={() => router.push('/login')}
                                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-semibold transition">
                                <LogIn size={16} /> Masuk ke Akun
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
