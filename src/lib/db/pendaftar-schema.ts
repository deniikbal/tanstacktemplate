import { pgTable, text, timestamp, date } from "drizzle-orm/pg-core";

export const pendaftar = pgTable("pendaftar", {
    id: text("id").primaryKey(),
    nmLengkap: text("nm_lengkap").notNull(),
    tempatLahir: text("tempat_lahir"),
    tanggalLahir: date("tanggal_lahir"),
    alamat: text("alamat"),
    asalSekolah: text("asal_sekolah"),
    noHandphone: text("no_handphone"),
    tahunLulus: text("tahun_lulus"),
    jalurMasuk: text("jalur_masuk"),
    keterangan: text("keterangan"),
    tahap: text('tahap').default('1'), // '1' or '2'
    noAntrian: text("no_antrian"), // Store as text to allow formatting if needed, but we'll use numbers
    tglAntrian: text('tgl_antrian'),
    statusAntrian: text('status_antrian').default('WAITING'),
    tahunAjaran: text("tahun_ajaran"), // e.g., "2026/2027"
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
