// Export data ke CSV
export const exportCsv = (data, namaFile = 'export') => {
    if (!data || data.length === 0) {
        alert('Tidak ada data untuk diexport!');
        return;
    }

    // Ambil semua key dari object pertama sebagai header
    const headers = Object.keys(data[0]);

    // Buat baris header
    const headerRow = headers.join(',');

    // Buat baris data
    const dataRows = data.map(row =>
        headers.map(header => {
            let value = row[header];

            // Kalau value adalah object (misal prodi), ambil namanya
            if (typeof value === 'object' && value !== null) {
                value = value.nama || JSON.stringify(value);
            }

            // Kalau ada koma atau newline, wrap dengan quotes
            if (String(value).includes(',') || String(value).includes('\n')) {
                value = `"${value}"`;
            }

            return value ?? '';
        }).join(',')
    );

    // Gabungkan header dan data
    const csvContent = [headerRow, ...dataRows].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${namaFile}-${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
};

// Export khusus mahasiswa
export const exportMahasiswaCsv = (data) => {
    const formatted = data.map((mhs, i) => ({
        No: i + 1,
        NIM: mhs.nim,
        Nama: mhs.nama,
        Email: mhs.email || '-',
        Telepon: mhs.telepon || '-',
        'Program Studi': mhs.prodi?.nama || '-',
        Semester: mhs.semester,
        IPK: mhs.ipk,
        Status: mhs.status,
        'Tanggal Daftar': new Date(mhs.createdAt).toLocaleDateString('id-ID')
    }));
    exportCsv(formatted, 'data-mahasiswa');
};

// Export khusus dosen
export const exportDosenCsv = (data) => {
    const formatted = data.map((dsn, i) => ({
        No: i + 1,
        NIP: dsn.nip,
        Nama: dsn.nama,
        Email: dsn.email || '-',
        Telepon: dsn.telepon || '-',
        Jabatan: dsn.jabatan || '-',
        'Program Studi': dsn.prodi?.nama || '-',
    }));
    exportCsv(formatted, 'data-dosen');
};

// Export khusus keuangan
export const exportKeuanganCsv = (data) => {
    const formatted = data.map((item, i) => ({
        No: i + 1,
        Mahasiswa: item.mahasiswa?.nama || '-',
        NIM: item.mahasiswa?.nim || '-',
        Jenis: item.jenis,
        Nominal: item.nominal,
        Status: item.status === 'sudah_bayar' ? 'Lunas' : 'Belum Bayar',
        Keterangan: item.keterangan || '-',
        Tanggal: new Date(item.tanggal).toLocaleDateString('id-ID')
    }));
    exportCsv(formatted, 'data-keuangan');
};