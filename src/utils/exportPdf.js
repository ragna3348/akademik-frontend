import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Export laporan mahasiswa
export const exportMahasiswaPdf = (data, namaProdi = 'Semua Prodi') => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('LAPORAN DATA MAHASISWA', 105, 20, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Program Studi: ${namaProdi}`, 105, 28, { align: 'center' });
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 105, 35, { align: 'center' });

    // Garis
    doc.line(14, 40, 196, 40);

    // Tabel
    autoTable(doc, {
        startY: 45,
        head: [['No', 'NIM', 'Nama', 'Program Studi', 'Semester', 'Status']],
        body: data.map((mhs, i) => [
            i + 1,
            mhs.nim,
            mhs.nama,
            mhs.prodi?.nama || '-',
            `Semester ${mhs.semester}`,
            mhs.status
        ]),
        headStyles: { fillColor: [37, 99, 235] },
        alternateRowStyles: { fillColor: [239, 246, 255] },
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.text(`Halaman ${i} dari ${pageCount}`, 105, 290, { align: 'center' });
        doc.text('Sistem Informasi Akademik', 14, 290);
    }

    doc.save(`laporan-mahasiswa-${Date.now()}.pdf`);
};

// Export laporan keuangan
export const exportKeuanganPdf = (data) => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('LAPORAN KEUANGAN MAHASISWA', 105, 20, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 105, 28, { align: 'center' });
    doc.line(14, 33, 196, 33);

    // Hitung total
    const totalBelumBayar = data
        .filter(k => k.status === 'belum_bayar')
        .reduce((sum, k) => sum + k.nominal, 0);

    const totalSudahBayar = data
        .filter(k => k.status === 'sudah_bayar')
        .reduce((sum, k) => sum + k.nominal, 0);

    // Summary
    doc.setFontSize(10);
    doc.text(`Total Belum Bayar: Rp ${totalBelumBayar.toLocaleString('id-ID')}`, 14, 42);
    doc.text(`Total Sudah Bayar: Rp ${totalSudahBayar.toLocaleString('id-ID')}`, 14, 49);

    autoTable(doc, {
        startY: 55,
        head: [['No', 'Mahasiswa', 'Jenis', 'Nominal', 'Status', 'Tanggal']],
        body: data.map((item, i) => [
            i + 1,
            item.mahasiswa?.nama || '-',
            item.jenis,
            `Rp ${item.nominal.toLocaleString('id-ID')}`,
            item.status === 'sudah_bayar' ? 'Lunas' : 'Belum Bayar',
            new Date(item.tanggal).toLocaleDateString('id-ID')
        ]),
        headStyles: { fillColor: [37, 99, 235] },
        alternateRowStyles: { fillColor: [239, 246, 255] },
    });

    doc.save(`laporan-keuangan-${Date.now()}.pdf`);
};