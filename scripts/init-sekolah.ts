import { db } from "../src/lib/db";
import { sql } from "drizzle-orm";

async function initSekolahTable() {
    console.log("🛠️ Inisialisasi tabel sekolah...");
    try {
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "sekolah" (
                "id" text PRIMARY KEY,
                "kode_prop" text,
                "propinsi" text,
                "kode_kab_kota" text,
                "kabupaten_kota" text,
                "kode_kec" text,
                "kecamatan" text,
                "npsn" text,
                "sekolah" text,
                "bentuk" text,
                "status" text,
                "alamat_jalan" text,
                "lintang" text,
                "bujur" text
            );
        `);
        console.log("✅ Tabel sekolah siap!");
    } catch (error) {
        console.error("❌ Gagal membuat tabel sekolah:", error);
    }
    process.exit(0);
}

initSekolahTable();
