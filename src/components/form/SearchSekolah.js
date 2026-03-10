import { useState, useEffect, useRef } from 'react';

export default function SearchSekolah({ value, onChange, onSelect }) {
    const [query, setQuery] = useState(value || '');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const debounceRef = useRef(null);
    const wrapperRef = useRef(null);

    // Tutup dropdown kalau klik di luar
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (val) => {
        setQuery(val);
        onChange(val);
        setShowDropdown(true);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (val.length < 3) { setResults([]); return; }

        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `https://api-sekolah-indonesia.vercel.app/sekolah?sekolah=${encodeURIComponent(val)}&page=1&perPage=10`
                );
                const data = await res.json();
                setResults(data.dataSekolah || []);
            } catch (error) {
                console.error('Gagal ambil data sekolah:', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 500);
    };

    const handleSelect = (sekolah) => {
        setQuery(sekolah.sekolah);
        setShowDropdown(false);
        onSelect(sekolah);
    };

    return (
        <div ref={wrapperRef} className="relative">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={e => handleSearch(e.target.value)}
                    onFocus={() => query.length >= 3 && setShowDropdown(true)}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-blue-500 transition pr-10"
                    placeholder="Ketik nama sekolah... (min 3 huruf)"
                />
                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                )}
            </div>

            {showDropdown && results.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {results.map((s, i) => (
                        <div key={i}
                            onClick={() => handleSelect(s)}
                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0">
                            <div className="font-medium text-gray-800 text-sm">{s.sekolah}</div>
                            <div className="text-xs text-gray-400 mt-0.5">
                                {s.bentuk} • {s.kota} • {s.propinsi}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showDropdown && !loading && query.length >= 3 && results.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-gray-400 text-sm">
                    Sekolah tidak ditemukan. Ketik nama lain atau isi manual.
                </div>
            )}
        </div>
    );
}