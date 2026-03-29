import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import {
    GraduationCap, User, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft,
    Search, MapPin, Star, School, Phone, BookOpen, Hash, FileText,
    Upload, CheckCircle, AlertTriangle, Printer, LogIn, Check,
    CreditCard, Users, Scroll, Camera, Send, RefreshCw, Info, X
} from 'lucide-react';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
function SearchSekolah({ onSelect }) {
    const [npsn, setNpsn] = useState('');
    const [loading, setLoading] = useState(false);
    const [sekolah, setSekolah] = useState(null);
    const [error, setError] = useState('');

    const handleCari = async () => {
        if (npsn.length !== 8) { setError('NPSN harus 8 digit!'); return; }
        setLoading(true); setError(''); setSekolah(null);
        try {
            const res = await fetch(`https://api.fazriansyah.eu.org/v1/sekolah?npsn=${npsn}`);
            const data = await res.json();
            if (data?.data?.satuanPendidikan) {
                setSekolah(data.data.satuanPendidikan);
                onSelect(data.data.satuanPendidikan);
            } else { setError('Sekolah tidak ditemukan. Periksa kembali NPSN.'); }
        } catch { setError('Gagal mengambil data. Coba lagi.'); }
        finally { setLoading(false); }
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <input type="text" value={npsn}
                    onChange={e => { setNpsn(e.target.value.replace(/\D/g, '').slice(0, 8)); setSekolah(null); setError(''); }}
                    className="flex-1 border-2 border-blue-200 bg-white rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:border-blue-400 transition"
                    placeholder="Masukkan NPSN (8 digit)" maxLength={8}
                    onKeyDown={e => e.key === 'Enter' && handleCari()} />
                <button type="button" onClick={handleCari} disabled={loading || npsn.length !== 8}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 whitespace-nowrap transition">
                    {loading ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
                    {loading ? 'Mencari...' : 'Cari'}
                </button>
            </div>

            {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-red-600 text-sm">
                    <X size={14} className="flex-shrink-0" /> {error}
                </div>
            )}

            {sekolah && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="font-semibold text-green-800 text-sm">{sekolah.nama}</div>
                    <div className="text-xs text-slate-500 mt-2 space-y-1">
                        <div className="flex items-start gap-1.5">
                            <MapPin size={11} className="text-slate-400 mt-0.5 flex-shrink-0" />
                            {sekolah.alamatJalan}, {sekolah.namaKecamatan}, {sekolah.namaKabupaten}, {sekolah.namaProvinsi}
                        </div>
                        {sekolah.akreditasi && (
                            <div className="flex items-center gap-1.5">
                                <Star size={11} className="text-slate-400" /> Akreditasi: {sekolah.akreditasi}
                            </div>
                        )}
                        <div className="flex items-center gap-1.5">
                            <School size={11} className="text-slate-400" /> {sekolah.statusSatuanPendidikan}
                        </div>
                    </div>
                </div>
            )}

            <p className="text-xs text-blue-300 flex items-center gap-1">
                <Info size={11} /> Tidak tahu NPSN? Cari di{' '}
                <a href="https://referensi.data.kemdikbud.go.id" target="_blank" rel="noreferrer"
                    className="text-blue-400 hover:text-white underline">
                    referensi.data.kemdikbud.go.id
                </a>
            </p>
        </div>
    );
}

// ==================== WILAYAH DROPDOWN ====================
function WilayahDropdown({ onChange }) {
    const BASE = 'https://www.emsifa.com/api-wilayah-indonesia/api';
    const [provinsi, setProvinsi] = useState([]);
    const [kabupaten, setKabupaten] = useState([]);
    const [kecamatan, setKecamatan] = useState([]);
    const [kelurahan, setKelurahan] = useState([]);
    const [detail, setDetail] = useState('');
    const [selected, setSelected] = useState({
        provinsiId: '', provinsiNama: '', kabupatenId: '', kabupatenNama: '',
        kecamatanId: '', kecamatanNama: '', kelurahanId: '', kelurahanNama: ''
    });
    const [loading, setLoading] = useState({ provinsi: false, kabupaten: false, kecamatan: false, kelurahan: false });

    useEffect(() => {
        setLoading(l => ({ ...l, provinsi: true }));
        fetch(`${BASE}/provinces.json`).then(r => r.json()).then(setProvinsi).catch(console.error)
            .finally(() => setLoading(l => ({ ...l, provinsi: false })));
    }, []);

    useEffect(() => {
        if (!selected.provinsiId) return;
        setKabupaten([]); setKecamatan([]); setKelurahan([]);
        setLoading(l => ({ ...l, kabupaten: true }));
        fetch(`${BASE}/regencies/${selected.provinsiId}.json`).then(r => r.json()).then(setKabupaten).catch(console.error)
            .finally(() => setLoading(l => ({ ...l, kabupaten: false })));
    }, [selected.provinsiId]);

    useEffect(() => {
        if (!selected.kabupatenId) return;
        setKecamatan([]); setKelurahan([]);
        setLoading(l => ({ ...l, kecamatan: true }));
        fetch(`${BASE}/districts/${selected.kabupatenId}.json`).then(r => r.json()).then(setKecamatan).catch(console.error)
            .finally(() => setLoading(l => ({ ...l, kecamatan: false })));
    }, [selected.kabupatenId]);

    useEffect(() => {
        if (!selected.kecamatanId) return;
        setKelurahan([]);
        setLoading(l => ({ ...l, kelurahan: true }));
        fetch(`${BASE}/villages/${selected.kecamatanId}.json`).then(r => r.json()).then(setKelurahan).catch(console.error)
            .finally(() => setLoading(l => ({ ...l, kelurahan: false })));
    }, [selected.kecamatanId]);

    const buildAlamat = (det, sel) => {
        const parts = [];
        if (det) parts.push(det);
        if (sel.kelurahanNama) parts.push(sel.kelurahanNama);
        if (sel.kecamatanNama) parts.push(sel.kecamatanNama);
        if (sel.kabupatenNama) parts.push(sel.kabupatenNama);
        if (sel.provinsiNama) parts.push(sel.provinsiNama);
        return parts.join(', ');
    };

    const selectClass = "w-full border-2 border-blue-200 bg-white rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-blue-400 transition disabled:bg-slate-100 disabled:cursor-not-allowed";
    const labelClass = "block text-sm font-semibold text-slate-600 mb-1.5";

    return (
        <div className="space-y-3">
            {[
                { key: 'provinsi', label: 'Provinsi', data: provinsi, disabled: loading.provinsi, placeholder: loading.provinsi ? 'Memuat...' : '-- Pilih Provinsi --' },
                { key: 'kabupaten', label: 'Kabupaten/Kota', data: kabupaten, disabled: !selected.provinsiId || loading.kabupaten, placeholder: loading.kabupaten ? 'Memuat...' : '-- Pilih Kabupaten/Kota --' },
                { key: 'kecamatan', label: 'Kecamatan', data: kecamatan, disabled: !selected.kabupatenId || loading.kecamatan, placeholder: loading.kecamatan ? 'Memuat...' : '-- Pilih Kecamatan --' },
            ].map(({ key, label, data, disabled, placeholder }) => (
                <div key={key}>
                    <label className={labelClass}>{label} *</label>
                    <select value={selected[`${key}Id`]} disabled={disabled} className={selectClass}
                        onChange={e => {
                            const opt = data.find(d => d.id === e.target.value);
                            const reset = key === 'provinsi'
                                ? { kabupatenId: '', kabupatenNama: '', kecamatanId: '', kecamatanNama: '', kelurahanId: '', kelurahanNama: '' }
                                : key === 'kabupaten'
                                ? { kecamatanId: '', kecamatanNama: '', kelurahanId: '', kelurahanNama: '' }
                                : { kelurahanId: '', kelurahanNama: '' };
                            setSelected(s => ({ ...s, [`${key}Id`]: e.target.value, [`${key}Nama`]: opt?.name || '', ...reset }));
                        }}>
                        <option value="">{placeholder}</option>
                        {data.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
            ))}

            <div>
                <label className={labelClass}>Kelurahan/Desa *</label>
                <select value={selected.kelurahanId}
                    disabled={!selected.kecamatanId || loading.kelurahan} className={selectClass}
                    onChange={e => {
                        const opt = kelurahan.find(k => k.id === e.target.value);
                        const newSelected = { ...selected, kelurahanId: e.target.value, kelurahanNama: opt?.name || '' };
                        setSelected(newSelected);
                        onChange(buildAlamat(detail, newSelected));
                    }}>
                    <option value="">{loading.kelurahan ? 'Memuat...' : '-- Pilih Kelurahan/Desa --'}</option>
                    {kelurahan.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                </select>
            </div>

            {selected.kelurahanId && (
                <div>
                    <label className={labelClass}>Detail Alamat (RT/RW, Nama Jalan, No. Rumah)</label>
                    <textarea rows={2} value={detail}
                        onChange={e => { setDetail(e.target.value); onChange(buildAlamat(e.target.value, selected)); }}
                        className={selectClass} placeholder="Contoh: Jl. Merdeka No. 10, RT 01/RW 02" />
                </div>
            )}

            {selected.kelurahanNama && (
                <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl p-3">
                    <MapPin size={12} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-green-700">
                        {selected.kelurahanNama}, {selected.kecamatanNama}, {selected.kabupatenNama}, {selected.provinsiNama}
                    </p>
                </div>
            )}
        </div>
    );
}

// ==================== HALAMAN PENDAFTARAN ====================
export default function PortalDaftar() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [noPendaftaran, setNoPendaftaran] = useState(null);
    const [countdown, setCountdown] = useState(0);
    const [showPassword, setShowPassword] = useState(false);

    const [gelombang, setGelombang] = useState([]);
    const [fakultas, setFakultas] = useState([]);
    const [semuaProdi, setSemuaProdi] = useState([]);
    const [filteredProdi, setFilteredProdi] = useState([]);
    const [jenisKelas, setJenisKelas] = useState([]);
    const [filterFakultas, setFilterFakultas] = useState('');
    const [filterJenjang, setFilterJenjang] = useState('');

    const [akun, setAkun] = useState({ nama: '', email: '', password: '', konfirmasiPassword: '' });
    const [otp, setOtp] = useState('');

    const [form, setForm] = useState({
        nama: '', nik: '', tempatLahir: '', tanggalLahir: '', jenisKelamin: '', agama: '',
        email: '', telepon: '', alamat: '',
        asalSekolah: '', tahunLulus: '', nisn: '', nilaiRaport: '',
        prodiId: '', prodiId2: '', jenisKelasId: '', gelombangId: ''
    });

    const [files, setFiles] = useState({ foto: null, dokumenKTP: null, dokumenKK: null, dokumenIjazah: null });
    const [previews, setPreviews] = useState({ foto: null, dokumenKTP: null, dokumenKK: null, dokumenIjazah: null });

const hasFetched = useRef(false);

useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchData = async () => {
        try {
            const [gelRes, fakRes, prodiRes, kelasRes] = await Promise.all([
                axios.get(`${BASE_URL}/pamaba/gelombang`),
                axios.get(`${BASE_URL}/fakultas`),
                axios.get(`${BASE_URL}/prodi`),
                axios.get(`${BASE_URL}/jenis-kelas/aktif`)
            ]);
            setGelombang(gelRes.data.data.filter(g => g.isAktif));
            setFakultas(fakRes.data.data.filter(f => f.isAktif));
            setSemuaProdi(prodiRes.data.data);
            setFilteredProdi(prodiRes.data.data);
            setJenisKelas(kelasRes.data.data);
        } catch (e) {
            console.error('Gagal fetch data:', e);
            if (e.response?.status === 429) {
                toast.error('Terlalu banyak permintaan, coba lagi dalam beberapa saat.');
            }
        }
    };

    const token = localStorage.getItem('token');
    if (token) {
        axios.get(`${BASE_URL}/auth/cek-status`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                if (res.data.success) {
                    const { sudahDaftar, pendaftar, mahasiswa, role } = res.data.data;
                    if (mahasiswa) {
                        toast.error('Anda sudah terdaftar sebagai mahasiswa!');
                        router.push('/dashboard');
                    } else if (sudahDaftar && pendaftar) {
                        setNoPendaftaran(pendaftar.noPendaftaran);
                        setStep(6);
                        toast.success('Anda sudah menyelesaikan pendaftaran. Lanjut ke Ujian Seleksi.');
                    } else if (role.includes('PENDAFTAR') || role.some(r => r.role === 'PENDAFTAR')) {
                        const user = JSON.parse(localStorage.getItem('user'));
                        setAkun(a => ({ ...a, nama: user.nama, email: user.email }));
                        setForm(f => ({ ...f, nama: user.nama, email: user.email }));
                        setStep(1);
                    }
                }
            })
            .catch(() => { /* Abaikan jika token invalid */ });
    } else {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                setAkun(a => ({ ...a, nama: user.nama, email: user.email }));
                setForm(f => ({ ...f, nama: user.nama, email: user.email }));
                setStep(1);
            } catch { /* ignore */ }
        }
    }

    fetchData();
}, []);

    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    useEffect(() => {
        let hasil = semuaProdi;
        if (filterFakultas) hasil = hasil.filter(p => String(p.fakultasId) === filterFakultas);
        if (filterJenjang) hasil = hasil.filter(p => p.jenjang === filterJenjang);
        setFilteredProdi(hasil);
        // Jangan hapus prodi sebelumnya saat filter berubah jika belum ada
    }, [filterFakultas, filterJenjang, semuaProdi]);

    const handleFileChange = (field, file) => {
        if (!file) return;
        setFiles(f => ({ ...f, [field]: file }));
        setPreviews(p => ({ ...p, [field]: URL.createObjectURL(file) }));
    };

    const handleKirimOTP = async () => {
        if (!akun.nama || !akun.email || !akun.password || !akun.konfirmasiPassword) { toast.error('Semua field harus diisi!'); return; }
        if (akun.password !== akun.konfirmasiPassword) { toast.error('Password tidak sama!'); return; }
        if (akun.password.length < 8) { toast.error('Password minimal 8 karakter!'); return; }
        setLoading(true);
        try {
            const res = await axios.post(`${BASE_URL}/otp/kirim`, akun);
            if (res.data.message.includes('Darurat')) {
                toast(res.data.message, { duration: 10000, icon: '⚠️' });
            } else {
                toast.success(res.data.message || `OTP dikirim ke ${akun.email}!`);
            }
            setStep(0.5); setCountdown(60);
        } catch (e) { toast.error(e.response?.data?.message || 'Gagal kirim OTP!'); }
        finally { setLoading(false); }
    };

    const handleVerifikasiOTP = async () => {
        if (!otp || otp.length !== 6) { toast.error('Masukkan kode OTP 6 digit!'); return; }
        setLoading(true);
        try {
            await axios.post(`${BASE_URL}/otp/verifikasi`, { email: akun.email, otp });
            toast.success('Email berhasil diverifikasi!');
            setForm(f => ({ ...f, nama: akun.nama, email: akun.email }));
            setStep(1);
        } catch (e) { toast.error(e.response?.data?.message || 'OTP salah!'); }
        finally { setLoading(false); }
    };

    const handleKirimUlang = async () => {
        try {
            const res = await axios.post(`${BASE_URL}/otp/kirim-ulang`, { email: akun.email });
            if (res.data.message.includes('Darurat')) {
                toast(res.data.message, { duration: 10000, icon: '⚠️' });
            } else {
                toast.success(res.data.message || 'OTP baru telah dikirim!');
            }
            setCountdown(60);
        } catch (e) { toast.error(e.response?.data?.message || 'Gagal kirim ulang!'); }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
            if (files.foto) formData.append('foto', files.foto);
            if (files.dokumenKTP) formData.append('dokumenKTP', files.dokumenKTP);
            if (files.dokumenKK) formData.append('dokumenKK', files.dokumenKK);
            if (files.dokumenIjazah) formData.append('dokumenIjazah', files.dokumenIjazah);
            const res = await axios.post(`${BASE_URL}/pamaba/pendaftar`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setNoPendaftaran(res.data.data.noPendaftaran);
            setStep(6);
            toast.success('Pendaftaran berhasil!');
        } catch (e) { toast.error(e.response?.data?.message || 'Gagal mendaftar!'); }
        finally { setLoading(false); }
    };

    const inputClass = "w-full border-2 border-blue-200 bg-white rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-blue-400 transition";
    const labelClass = "block text-sm font-semibold text-slate-600 mb-1.5";

    const steps = [
        { num: 0, label: 'Akun', icon: User },
        { num: 1, label: 'Data Pribadi', icon: FileText },
        { num: 2, label: 'Kontak', icon: Phone },
        { num: 3, label: 'Akademik', icon: BookOpen },
        { num: 4, label: 'Prodi', icon: GraduationCap },
        { num: 5, label: 'Dokumen', icon: Upload },
    ];

    const prodiSelected = semuaProdi.find(p => String(p.id) === form.prodiId);
    const prodiSelected2 = semuaProdi.find(p => String(p.id) === form.prodiId2);
    const gelombangSelected = gelombang.find(g => String(g.id) === form.gelombangId);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="bg-blue-950/80 backdrop-blur border-b border-blue-800/50 py-4 px-6">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                            <GraduationCap size={22} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-lg leading-tight">Portal Pendaftaran Mahasiswa Baru</h1>
                            <p className="text-blue-400 text-xs">Sistem Informasi Akademik</p>
                        </div>
                    </div>
                    <a href="/login" className="flex items-center gap-1.5 text-blue-400 hover:text-white text-sm transition">
                        <LogIn size={14} /> Sudah punya akun?
                    </a>
                </div>
            </div>

            <div className="max-w-4xl mx-auto py-8 px-4">

                {/* Step Indicator */}
                {step !== 6 && (
                    <div className="flex items-center justify-center mb-8 overflow-x-auto pb-2">
                        {steps.map((s, i) => {
                            const Icon = s.icon;
                            const done = step > s.num;
                            const active = step === s.num || (step === 0.5 && s.num === 0);
                            return (
                                <div key={s.num} className="flex items-center">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                                            done ? 'bg-green-400 text-white' : active ? 'bg-white text-blue-800' : 'bg-blue-800/60 text-blue-400 border-2 border-blue-700'
                                        }`}>
                                            {done ? <Check size={16} /> : <Icon size={15} />}
                                        </div>
                                        <span className={`text-xs mt-1 whitespace-nowrap ${step >= s.num ? 'text-white' : 'text-blue-500'}`}>
                                            {s.label}
                                        </span>
                                    </div>
                                    {i < steps.length - 1 && (
                                        <div className={`w-10 h-0.5 mx-1 mb-5 rounded ${done ? 'bg-green-400' : 'bg-blue-700'}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">

                    {/* ===== Step 0 — Buat Akun ===== */}
                    {step === 0 && (
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                    <User size={18} className="text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">Buat Akun</h2>
                                    <p className="text-slate-400 text-xs">Buat akun untuk melanjutkan pendaftaran</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>Nama Lengkap *</label>
                                    <input type="text" value={akun.nama}
                                        onChange={e => setAkun({ ...akun, nama: e.target.value })}
                                        className={inputClass} placeholder="Nama sesuai ijazah" />
                                </div>
                                <div>
                                    <label className={labelClass}>Email *</label>
                                    <input type="email" value={akun.email}
                                        onChange={e => setAkun({ ...akun, email: e.target.value })}
                                        className={inputClass} placeholder="email@gmail.com" />
                                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                        <Send size={10} /> Kode OTP akan dikirim ke email ini
                                    </p>
                                </div>
                                <div>
                                    <label className={labelClass}>Password *</label>
                                    <div className="relative">
                                        <input type={showPassword ? 'text' : 'password'} value={akun.password}
                                            onChange={e => setAkun({ ...akun, password: e.target.value })}
                                            className={`${inputClass} pr-12`} placeholder="Minimal 8 karakter" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Konfirmasi Password *</label>
                                    <input type="password" value={akun.konfirmasiPassword}
                                        onChange={e => setAkun({ ...akun, konfirmasiPassword: e.target.value })}
                                        className={inputClass} placeholder="Ulangi password" />
                                    {akun.konfirmasiPassword && akun.password !== akun.konfirmasiPassword && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <X size={11} /> Password tidak sama!
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button onClick={handleKirimOTP} disabled={loading}
                                className="w-full mt-6 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 transition">
                                {loading ? <><RefreshCw size={15} className="animate-spin" /> Mengirim OTP...</> : <><Send size={15} /> Kirim Kode Verifikasi</>}
                            </button>
                            <p className="text-center text-sm text-slate-400 mt-4">
                                Sudah punya akun?{' '}
                                <a href="/login" className="text-blue-600 hover:underline font-medium">Masuk disini</a>
                            </p>
                        </div>
                    )}

                    {/* ===== Step 0.5 — Verifikasi OTP ===== */}
                    {step === 0.5 && (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Mail size={30} className="text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 mb-1">Verifikasi Email</h2>
                            <p className="text-slate-400 text-sm mb-1">Kode OTP telah dikirim ke:</p>
                            <p className="text-blue-600 font-semibold mb-6">{akun.email}</p>
                            <div className="max-w-xs mx-auto">
                                <input type="text" value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full border-2 border-blue-200 rounded-2xl px-4 py-4 text-center text-3xl font-bold tracking-widest focus:outline-none focus:border-blue-500 text-slate-800"
                                    placeholder="000000" maxLength={6} />
                                <p className="text-slate-400 text-xs mt-2">Masukkan 6 digit kode OTP</p>
                            </div>
                            <button onClick={handleVerifikasiOTP} disabled={loading || otp.length !== 6}
                                className="w-full max-w-xs mx-auto mt-5 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 transition block">
                                {loading ? <><RefreshCw size={15} className="animate-spin" /> Memverifikasi...</> : <><CheckCircle size={15} /> Verifikasi OTP</>}
                            </button>
                            <div className="mt-4">
                                {countdown > 0 ? (
                                    <p className="text-slate-400 text-sm">Kirim ulang dalam <strong className="text-blue-600">{countdown}s</strong></p>
                                ) : (
                                    <button onClick={handleKirimUlang}
                                        className="flex items-center gap-1.5 text-blue-500 hover:text-blue-700 text-sm mx-auto">
                                        <RefreshCw size={12} /> Kirim Ulang OTP
                                    </button>
                                )}
                            </div>
                            <button onClick={() => setStep(0)}
                                className="mt-3 text-slate-400 hover:text-slate-600 text-sm block mx-auto">
                                Ganti Email
                            </button>
                        </div>
                    )}

                    {/* ===== Step 1 — Data Pribadi ===== */}
                    {step === 1 && (
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                    <FileText size={18} className="text-indigo-600" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">Data Pribadi</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Nama Lengkap *</label>
                                    <input type="text" value={form.nama}
                                        onChange={e => setForm({ ...form, nama: e.target.value })}
                                        className={inputClass} placeholder="Nama sesuai ijazah" />
                                </div>
                                <div>
                                    <label className={labelClass}>NIK (Nomor KTP)</label>
                                    <input type="text" value={form.nik}
                                        onChange={e => setForm({ ...form, nik: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                                        className={inputClass} placeholder="16 digit NIK" maxLength={16} />
                                </div>
                                <div>
                                    <label className={labelClass}>Tempat Lahir</label>
                                    <input type="text" value={form.tempatLahir}
                                        onChange={e => setForm({ ...form, tempatLahir: e.target.value })}
                                        className={inputClass} placeholder="Kota kelahiran" />
                                </div>
                                <div>
                                    <label className={labelClass}>Tanggal Lahir</label>
                                    <input type="date" value={form.tanggalLahir}
                                        onChange={e => setForm({ ...form, tanggalLahir: e.target.value })}
                                        className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Jenis Kelamin</label>
                                    <select value={form.jenisKelamin}
                                        onChange={e => setForm({ ...form, jenisKelamin: e.target.value })}
                                        className={inputClass}>
                                        <option value="">-- Pilih --</option>
                                        <option value="Laki-laki">Laki-laki</option>
                                        <option value="Perempuan">Perempuan</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Agama</label>
                                    <select value={form.agama}
                                        onChange={e => setForm({ ...form, agama: e.target.value })}
                                        className={inputClass}>
                                        <option value="">-- Pilih --</option>
                                        {['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'].map(a => (
                                            <option key={a} value={a}>{a}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end mt-6">
                                <button onClick={() => { if (!form.nama) { toast.error('Nama harus diisi!'); return; } setStep(2); }}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-xl font-semibold transition">
                                    Lanjut <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ===== Step 2 — Kontak ===== */}
                    {step === 2 && (
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                    <Phone size={18} className="text-indigo-600" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">Kontak & Domisili</h2>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>Email Aktif *</label>
                                    <input type="email" value={form.email} disabled
                                        className={`${inputClass} bg-slate-100 cursor-not-allowed text-slate-400`} />
                                    <p className="text-xs text-slate-400 mt-1">Email dari akun yang sudah dibuat</p>
                                </div>
                                <div>
                                    <label className={labelClass}>Nomor WhatsApp *</label>
                                    <input type="text" value={form.telepon}
                                        onChange={e => setForm({ ...form, telepon: e.target.value })}
                                        className={inputClass} placeholder="08xxxxxxxxxx" />
                                </div>
                                <div>
                                    <label className={labelClass}>Alamat Domisili *</label>
                                    <WilayahDropdown onChange={(a) => setForm(f => ({ ...f, alamat: a }))} />
                                </div>
                            </div>
                            <div className="flex justify-between mt-6">
                                <button onClick={() => setStep(1)}
                                    className="flex items-center gap-2 border-2 border-slate-200 text-slate-500 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition">
                                    <ArrowLeft size={16} /> Kembali
                                </button>
                                <button onClick={() => {
                                    if (!form.telepon) { toast.error('Nomor WhatsApp harus diisi!'); return; }
                                    if (!form.alamat) { toast.error('Alamat domisili harus diisi!'); return; }
                                    setStep(3);
                                }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-xl font-semibold transition">
                                    Lanjut <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ===== Step 3 — Data Akademik ===== */}
                    {step === 3 && (
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                    <BookOpen size={18} className="text-indigo-600" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">Data Akademik</h2>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>Asal Sekolah (Cari by NPSN)</label>
                                    <SearchSekolah onSelect={(sekolah) => setForm(f => ({ ...f, asalSekolah: sekolah.nama }))} />
                                    {form.asalSekolah && (
                                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                            <CheckCircle size={11} /> Terpilih: {form.asalSekolah}
                                        </p>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Tahun Lulus</label>
                                        <input type="number" value={form.tahunLulus}
                                            onChange={e => setForm({ ...form, tahunLulus: e.target.value })}
                                            className={inputClass} placeholder="2024" min="2000" max="2030" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>NISN</label>
                                        <input type="text" value={form.nisn}
                                            onChange={e => setForm({ ...form, nisn: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                            className={inputClass} placeholder="10 digit NISN" maxLength={10} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Nilai Rata-rata Rapor / Ijazah</label>
                                        <input type="number" step="0.01" value={form.nilaiRaport}
                                            onChange={e => setForm({ ...form, nilaiRaport: e.target.value })}
                                            className={inputClass} placeholder="Contoh: 85.50" min="0" max="100" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between mt-6">
                                <button onClick={() => setStep(2)}
                                    className="flex items-center gap-2 border-2 border-slate-200 text-slate-500 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition">
                                    <ArrowLeft size={16} /> Kembali
                                </button>
                                <button onClick={() => setStep(4)}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-xl font-semibold transition">
                                    Lanjut <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ===== Step 4 — Pilih Prodi ===== */}
                    {step === 4 && (
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                    <GraduationCap size={18} className="text-indigo-600" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">Pilih Program Studi</h2>
                            </div>
                            <div className="space-y-4">
                                {gelombang.length > 0 && (
                                    <div>
                                        <label className={labelClass}>Gelombang Pendaftaran *</label>
                                        <select value={form.gelombangId}
                                            onChange={e => setForm({ ...form, gelombangId: e.target.value })}
                                            className={inputClass}>
                                            <option value="">-- Pilih Gelombang --</option>
                                            {gelombang.map(g => (
                                                <option key={g.id} value={g.id}>
                                                    {g.nama} - {g.tahun} (Biaya: Rp {g.biayaDaftar.toLocaleString('id-ID')})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                    {fakultas.length > 0 && (
                                        <div>
                                            <label className={labelClass}>Filter Fakultas</label>
                                            <select value={filterFakultas}
                                                onChange={e => setFilterFakultas(e.target.value)}
                                                className={inputClass}>
                                                <option value="">-- Semua Fakultas --</option>
                                                {fakultas.map(f => <option key={f.id} value={f.id}>{f.nama}</option>)}
                                            </select>
                                        </div>
                                    )}
                                    <div>
                                        <label className={labelClass}>Filter Jenjang</label>
                                        <select value={filterJenjang}
                                            onChange={e => setFilterJenjang(e.target.value)}
                                            className={inputClass}>
                                            <option value="">-- Semua Jenjang --</option>
                                            {['D3', 'D4', 'S1', 'S2', 'S3'].map(j => <option key={j} value={j}>{j}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Program Studi (Pilihan 1) *</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 max-h-64 overflow-y-auto pr-1">
                                        {filteredProdi.length === 0 ? (
                                            <div className="col-span-2 text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl text-sm">
                                                Tidak ada prodi yang tersedia
                                            </div>
                                        ) : filteredProdi.map(p => (
                                            <div key={p.id} onClick={() => setForm(f => ({ ...f, prodiId: String(p.id) }))}
                                                className={`border-2 rounded-xl p-4 cursor-pointer transition ${
                                                    form.prodiId === String(p.id)
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-slate-200 hover:border-blue-300'
                                                }`}>
                                                <div className="font-semibold text-slate-800 text-sm">{p.nama}</div>
                                                <div className="text-xs text-slate-400 mt-1">
                                                    {p.jenjang}{p.fakultas && ` • ${p.fakultas.nama}`}
                                                </div>
                                                {p.peminatan && <div className="text-xs text-blue-500 mt-1">Peminatan: {p.peminatan}</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {form.prodiId && (
                                    <div>
                                        <label className={labelClass}>Program Studi (Pilihan 2 - Opsional)</label>
                                        <select value={form.prodiId2}
                                            onChange={e => setForm({ ...form, prodiId2: e.target.value })}
                                            className={inputClass}>
                                            <option value="">-- Pilih Prodi Ke-2 --</option>
                                            {semuaProdi.filter(p => String(p.id) !== form.prodiId).map(p => (
                                                <option key={p.id} value={p.id}>{p.nama} ({p.jenjang})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                {jenisKelas.length > 0 && (
                                    <div>
                                        <label className={labelClass}>Jenis Kelas *</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {jenisKelas.map(k => (
                                                <div key={k.id} onClick={() => setForm(f => ({ ...f, jenisKelasId: String(k.id) }))}
                                                    className={`border-2 rounded-xl p-3 cursor-pointer transition text-center ${
                                                        form.jenisKelasId === String(k.id)
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-slate-200 hover:border-blue-300'
                                                    }`}>
                                                    <div className="font-semibold text-slate-700 text-sm">{k.nama}</div>
                                                    <div className="text-xs text-slate-400">Kode: {k.kodeAngka}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {form.prodiId && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Info size={14} className="text-blue-600" />
                                            <h3 className="font-semibold text-blue-800 text-sm">Ringkasan Pilihan</h3>
                                        </div>
                                        <div className="text-sm space-y-1.5 text-slate-600">
                                            {[
                                                ['Nama', form.nama],
                                                ['Pilihan 1', prodiSelected?.nama],
                                                form.prodiId2 && ['Pilihan 2', prodiSelected2?.nama],
                                                ['Jenjang', prodiSelected?.jenjang],
                                                form.jenisKelasId && ['Jenis Kelas', jenisKelas.find(k => String(k.id) === form.jenisKelasId)?.nama],
                                                gelombangSelected && ['Gelombang', gelombangSelected.nama],
                                            ].filter(Boolean).map(([label, value]) => (
                                                <div key={label} className="flex gap-2">
                                                    <span className="text-slate-400 w-24 flex-shrink-0">{label}:</span>
                                                    <strong>{value}</strong>
                                                </div>
                                            ))}
                                            {gelombangSelected && (
                                                <div className="flex gap-2">
                                                    <span className="text-slate-400 w-24 flex-shrink-0">Biaya:</span>
                                                    <strong className="text-red-600">Rp {gelombangSelected.biayaDaftar.toLocaleString('id-ID')}</strong>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between mt-6">
                                <button onClick={() => setStep(3)}
                                    className="flex items-center gap-2 border-2 border-slate-200 text-slate-500 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition">
                                    <ArrowLeft size={16} /> Kembali
                                </button>
                                <button onClick={() => {
                                    if (!form.prodiId) { toast.error('Pilih program studi!'); return; }
                                    if (gelombang.length > 0 && !form.gelombangId) { toast.error('Pilih gelombang pendaftaran!'); return; }
                                    if (jenisKelas.length > 0 && !form.jenisKelasId) { toast.error('Pilih jenis kelas!'); return; }
                                    setStep(5);
                                }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-xl font-semibold transition">
                                    Lanjut <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ===== Step 5 — Upload Dokumen ===== */}
                    {step === 5 && (
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                    <Upload size={18} className="text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">Upload Dokumen</h2>
                                    <p className="text-slate-400 text-xs">Format: JPG, PNG, atau PDF. Maks 5MB per file.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                                {[
                                    { field: 'foto', label: 'Foto Profil (4x6)', icon: Camera, accept: 'image/*' },
                                    { field: 'dokumenKTP', label: 'Scan KTP', icon: CreditCard, accept: 'image/*,.pdf' },
                                    { field: 'dokumenKK', label: 'Scan Kartu Keluarga', icon: Users, accept: 'image/*,.pdf' },
                                    { field: 'dokumenIjazah', label: 'Ijazah / Transkrip Nilai', icon: Scroll, accept: 'image/*,.pdf' },
                                ].map(({ field, label, icon: Icon, accept }) => (
                                    <label key={field} className="block cursor-pointer border-2 border-dashed border-slate-200 rounded-xl p-5 hover:border-blue-400 hover:bg-blue-50/30 transition">
                                        <div className="text-center">
                                            {previews[field] ? (
                                                <img src={previews[field]} alt={label}
                                                    className="w-20 h-20 object-cover rounded-xl mx-auto mb-3" />
                                            ) : (
                                                <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                    <Icon size={22} className="text-slate-400" />
                                                </div>
                                            )}
                                            <div className="font-semibold text-slate-700 text-sm">{label}</div>
                                            <div className={`text-xs mt-1 flex items-center justify-center gap-1 ${files[field] ? 'text-green-600' : 'text-slate-400'}`}>
                                                {files[field] ? <><CheckCircle size={11} /> {files[field].name}</> : <><Upload size={11} /> Klik untuk upload</>}
                                            </div>
                                        </div>
                                        <input type="file" accept={accept} className="hidden"
                                            onChange={e => handleFileChange(field, e.target.files[0])} />
                                    </label>
                                ))}
                            </div>
                            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mt-5">
                                <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-amber-700 text-sm">
                                    Upload dokumen bersifat opsional saat ini, namun wajib dilengkapi sebelum proses seleksi dimulai.
                                </p>
                            </div>
                            <div className="flex justify-between mt-6">
                                <button onClick={() => setStep(4)}
                                    className="flex items-center gap-2 border-2 border-slate-200 text-slate-500 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition">
                                    <ArrowLeft size={16} /> Kembali
                                </button>
                                <button onClick={handleSubmit} disabled={loading}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-7 py-3 rounded-xl font-semibold disabled:opacity-50 transition">
                                    {loading ? <><RefreshCw size={15} className="animate-spin" /> Memproses...</> : <><CheckCircle size={15} /> Daftar Sekarang</>}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ===== Step 6 — Sukses ===== */}
                    {step === 6 && (
                        <div className="text-center py-6">
                            <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                <CheckCircle size={40} className="text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-1">Pendaftaran Berhasil!</h2>
                            <p className="text-slate-400 mb-6">Simpan nomor pendaftaran Anda!</p>
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-6 inline-block">
                                <div className="text-sm text-slate-400 mb-1">Nomor Pendaftaran</div>
                                <div className="text-3xl font-bold text-blue-700 tracking-wider">{noPendaftaran}</div>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left mb-6 max-w-md mx-auto">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info size={14} className="text-amber-600" />
                                    <h3 className="font-semibold text-amber-800 text-sm">Langkah Selanjutnya</h3>
                                </div>
                                <ol className="text-sm text-amber-700 space-y-1.5 list-decimal list-inside">
                                    <li>Screenshot nomor pendaftaran di atas</li>
                                    <li>Lakukan pembayaran biaya pendaftaran (jika ada)</li>
                                    <li>Konfirmasi pembayaran ke bagian keuangan</li>
                                    <li>Tunggu pengumuman hasil seleksi</li>
                                </ol>
                            </div>
                            <div className="flex gap-3 justify-center">
                                <button onClick={() => window.print()}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
                                    <Printer size={15} /> Cetak Bukti
                                </button>
                                <button onClick={() => router.push('/login')}
                                    className="flex items-center gap-2 border-2 border-slate-200 text-slate-500 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition">
                                    <LogIn size={15} /> Masuk Akun
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}