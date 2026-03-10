import { useState, useEffect } from 'react';

const BASE = 'https://www.emsifa.com/api-wilayah-indonesia/api';

export default function WilayahDropdown({ onChange }) {
    const [provinsi, setProvinsi] = useState([]);
    const [kabupaten, setKabupaten] = useState([]);
    const [kecamatan, setKecamatan] = useState([]);
    const [kelurahan, setKelurahan] = useState([]);

    const [selected, setSelected] = useState({
        provinsiId: '', provinsiNama: '',
        kabupatenId: '', kabupatenNama: '',
        kecamatanId: '', kecamatanNama: '',
        kelurahanId: '', kelurahanNama: ''
    });

    const [loading, setLoading] = useState({
        provinsi: false, kabupaten: false, kecamatan: false, kelurahan: false
    });

    // Fetch Provinsi
    useEffect(() => {
        setLoading(l => ({ ...l, provinsi: true }));
        fetch(`${BASE}/provinces.json`)
            .then(r => r.json())
            .then(data => setProvinsi(data))
            .catch(console.error)
            .finally(() => setLoading(l => ({ ...l, provinsi: false })));
    }, []);

    // Fetch Kabupaten
    useEffect(() => {
        if (!selected.provinsiId) return;
        setKabupaten([]); setKecamatan([]); setKelurahan([]);
        setLoading(l => ({ ...l, kabupaten: true }));
        fetch(`${BASE}/regencies/${selected.provinsiId}.json`)
            .then(r => r.json())
            .then(data => setKabupaten(data))
            .catch(console.error)
            .finally(() => setLoading(l => ({ ...l, kabupaten: false })));
    }, [selected.provinsiId]);

    // Fetch Kecamatan
    useEffect(() => {
        if (!selected.kabupatenId) return;
        setKecamatan([]); setKelurahan([]);
        setLoading(l => ({ ...l, kecamatan: true }));
        fetch(`${BASE}/districts/${selected.kabupatenId}.json`)
            .then(r => r.json())
            .then(data => setKecamatan(data))
            .catch(console.error)
            .finally(() => setLoading(l => ({ ...l, kecamatan: false })));
    }, [selected.kabupatenId]);

    // Fetch Kelurahan
    useEffect(() => {
        if (!selected.kecamatanId) return;
        setKelurahan([]);
        setLoading(l => ({ ...l, kelurahan: true }));
        fetch(`${BASE}/villages/${selected.kecamatanId}.json`)
            .then(r => r.json())
            .then(data => setKelurahan(data))
            .catch(console.error)
            .finally(() => setLoading(l => ({ ...l, kelurahan: false })));
    }, [selected.kecamatanId]);

    // Notify parent
    useEffect(() => {
        if (selected.kelurahanNama) {
            const alamatLengkap = `${selected.kelurahanNama}, ${selected.kecamatanNama}, ${selected.kabupatenNama}, ${selected.provinsiNama}`;
            onChange(alamatLengkap, selected);
        }
    }, [selected.kelurahanId]);

    const selectClass = "w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-blue-500 transition disabled:bg-gray-100 disabled:cursor-not-allowed";

    return (
        <div className="space-y-3">
            {/* Provinsi */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Provinsi *</label>
                <select
                    value={selected.provinsiId}
                    onChange={e => {
                        const opt = provinsi.find(p => p.id === e.target.value);
                        setSelected(s => ({
                            ...s,
                            provinsiId: e.target.value,
                            provinsiNama: opt?.name || '',
                            kabupatenId: '', kabupatenNama: '',
                            kecamatanId: '', kecamatanNama: '',
                            kelurahanId: '', kelurahanNama: ''
                        }));
                    }}
                    className={selectClass}
                    disabled={loading.provinsi}
                >
                    <option value="">{loading.provinsi ? 'Memuat...' : '-- Pilih Provinsi --'}</option>
                    {provinsi.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>

            {/* Kabupaten/Kota */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Kabupaten/Kota *</label>
                <select
                    value={selected.kabupatenId}
                    onChange={e => {
                        const opt = kabupaten.find(k => k.id === e.target.value);
                        setSelected(s => ({
                            ...s,
                            kabupatenId: e.target.value,
                            kabupatenNama: opt?.name || '',
                            kecamatanId: '', kecamatanNama: '',
                            kelurahanId: '', kelurahanNama: ''
                        }));
                    }}
                    className={selectClass}
                    disabled={!selected.provinsiId || loading.kabupaten}
                >
                    <option value="">{loading.kabupaten ? 'Memuat...' : '-- Pilih Kabupaten/Kota --'}</option>
                    {kabupaten.map(k => (
                        <option key={k.id} value={k.id}>{k.name}</option>
                    ))}
                </select>
            </div>

            {/* Kecamatan */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Kecamatan *</label>
                <select
                    value={selected.kecamatanId}
                    onChange={e => {
                        const opt = kecamatan.find(k => k.id === e.target.value);
                        setSelected(s => ({
                            ...s,
                            kecamatanId: e.target.value,
                            kecamatanNama: opt?.name || '',
                            kelurahanId: '', kelurahanNama: ''
                        }));
                    }}
                    className={selectClass}
                    disabled={!selected.kabupatenId || loading.kecamatan}
                >
                    <option value="">{loading.kecamatan ? 'Memuat...' : '-- Pilih Kecamatan --'}</option>
                    {kecamatan.map(k => (
                        <option key={k.id} value={k.id}>{k.name}</option>
                    ))}
                </select>
            </div>

            {/* Kelurahan */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Kelurahan/Desa *</label>
                <select
                    value={selected.kelurahanId}
                    onChange={e => {
                        const opt = kelurahan.find(k => k.id === e.target.value);
                        setSelected(s => ({
                            ...s,
                            kelurahanId: e.target.value,
                            kelurahanNama: opt?.name || ''
                        }));
                    }}
                    className={selectClass}
                    disabled={!selected.kecamatanId || loading.kelurahan}
                >
                    <option value="">{loading.kelurahan ? 'Memuat...' : '-- Pilih Kelurahan/Desa --'}</option>
                    {kelurahan.map(k => (
                        <option key={k.id} value={k.id}>{k.name}</option>
                    ))}
                </select>
            </div>

            {/* Detail Alamat */}
            {selected.kelurahanId && (
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Detail Alamat (RT/RW, Nama Jalan, No. Rumah)
                    </label>
                    <textarea
                        rows={3}
                        onChange={e => {
                            const alamatLengkap = `${e.target.value}, ${selected.kelurahanNama}, ${selected.kecamatanNama}, ${selected.kabupatenNama}, ${selected.provinsiNama}`;
                            onChange(alamatLengkap, selected);
                        }}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-blue-500 transition"
                        placeholder="Contoh: Jl. Merdeka No. 10, RT 01/RW 02"
                    />
                </div>
            )}

            {/* Preview Alamat */}
            {selected.kelurahanNama && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs text-green-700">
                        📍 {selected.kelurahanNama}, {selected.kecamatanNama}, {selected.kabupatenNama}, {selected.provinsiNama}
                    </p>
                </div>
            )}
        </div>
    );
}