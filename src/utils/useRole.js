import { useState, useEffect } from 'react';

export function useRole() {
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const userRoles = user?.roles?.map(r => r.role || r) || [];
            setRoles(userRoles);
        } catch { setRoles([]); }
    }, []);

    const hasRole = (...r) => r.some(role => roles.includes(role));

    const isSuperAdmin = hasRole('SUPER_ADMIN');
    const isAdmin = hasRole('ADMIN');
    const isAkademik = hasRole('AKADEMIK');
    const isKeuangan = hasRole('KEUANGAN');
    const isKaprodi = hasRole('KAPRODI') && !hasRole('SUPER_ADMIN', 'ADMIN', 'AKADEMIK');
    const isDosen = hasRole('DOSEN') && !hasRole('SUPER_ADMIN', 'ADMIN', 'AKADEMIK', 'KAPRODI');

    // Read-only: tidak bisa tambah/edit/hapus
    const isReadOnly = isKaprodi || isDosen;

    // Hanya bisa lihat data keuangan, tidak bisa approve/aksi lain
    const isKeuanganOnly = isKeuangan && !hasRole('SUPER_ADMIN', 'ADMIN');

    return {
        roles,
        hasRole,
        isSuperAdmin,
        isAdmin,
        isAkademik,
        isKeuangan,
        isKaprodi,
        isDosen,
        isReadOnly,       // KAPRODI & DOSEN → sembunyikan tambah/edit/hapus
        isKeuanganOnly,   // KEUANGAN → sembunyikan aksi non-keuangan
    };
}