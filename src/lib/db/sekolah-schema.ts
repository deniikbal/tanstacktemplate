import { pgTable, text } from "drizzle-orm/pg-core";

export const sekolah = pgTable("sekolah", {
    id: text("id").primaryKey(),
    kode_prop: text("kode_prop"),
    propinsi: text("propinsi"),
    kode_kab_kota: text("kode_kab_kota"),
    kabupaten_kota: text("kabupaten_kota"),
    kode_kec: text("kode_kec"),
    kecamatan: text("kecamatan"),
    npsn: text("npsn"),
    sekolah: text("sekolah"),
    bentuk: text("bentuk"),
    status: text("status"),
    alamat_jalan: text("alamat_jalan"),
    lintang: text("lintang"),
    bujur: text("bujur"),
});
