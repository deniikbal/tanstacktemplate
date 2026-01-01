import { pgTable, text, timestamp, boolean, date } from "drizzle-orm/pg-core";

export const student = pgTable("student", {
    // Main Data (tabel_siswa.json)
    id: text("id").primaryKey(),
    nis: text("nis"), // JSON: nis
    nisn: text("nisn").unique(), // JSON: nisn
    nmSiswa: text("nm_siswa").notNull(), // JSON: nm_siswa
    tempatLahir: text("tempat_lahir"), // JSON: tempat_lahir
    tanggalLahir: date("tanggal_lahir"), // JSON: tanggal_lahir
    jenisKelamin: text("jenis_kelamin"), // JSON: jenis_kelamin
    agama: text("agama"), // JSON: agama
    alamatSiswa: text("alamat_siswa"), // JSON: alamat_siswa
    teleponSiswa: text("telepon_siswa"), // JSON: telepon_siswa
    diterimaTanggal: date("diterima_tanggal"), // JSON: diterima_tanggal

    // Parent/Guardian Info (tabel_siswa.json)
    nmAyah: text("nm_ayah"), // JSON: nm_ayah
    nmIbu: text("nm_ibu"), // JSON: nm_ibu
    pekerjaanAyah: text("pekerjaan_ayah"), // JSON: pekerjaan_ayah
    pekerjaanIbu: text("pekerjaan_ibu"), // JSON: pekerjaan_ibu
    nmWali: text("nm_wali"), // JSON: nm_wali
    pekerjaanWali: text("pekerjaan_wali"), // JSON: pekerjaan_wali

    // Additional Data (tabel_siswa_pelengkap.json)
    statusDalamKel: text("status_dalam_kel"), // JSON: status_dalam_kel
    anakKe: text("anak_ke"), // JSON: anak_ke
    sekolahAsal: text("sekolah_asal"), // JSON: sekolah_asal
    diterimaKelas: text("diterima_kelas"), // JSON: diterima_kelas
    alamatOrtu: text("alamat_ortu"), // JSON: alamat_ortu
    teleponOrtu: text("telepon_ortu"), // JSON: telepon_ortu
    alamatWali: text("alamat_wali"), // JSON: alamat_wali
    teleponWali: text("telepon_wali"), // JSON: telepon_wali
    fotoSiswa: text("foto_siswa"), // JSON: foto_siswa
    noIjasahnas: text("no_ijasahnas"), // JSON: no_ijasahnas
    tglLulus: date("tgl_lulus"), // JSON: tgl_lulus
    noTranskrip: text("no_transkrip"), // JSON: no_transkrip
    // System Metadata
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
