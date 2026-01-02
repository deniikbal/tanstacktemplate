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
    tahap: text("tahap"), // '1' or '2'
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
