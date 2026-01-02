import { db } from "../src/lib/db";
import { sekolah } from "../src/lib/db/sekolah-schema";

async function importSekolah() {
    console.log("🚀 Memulai import data sekolah Majalengka (SMP & MTS)...");

    let page = 1;
    const perPage = 100;
    let totalImported = 0;
    let hasMore = true;

    // Kabupaten Majalengka code: 021600
    const kabKotaCode = "021600";

    while (hasMore) {
        try {
            console.log(`📡 Mengambil data halaman ${page}...`);
            const response = await fetch(`https://api-sekolah-indonesia.vercel.app/sekolah?kab_kota=${kabKotaCode}&page=${page}&perPage=${perPage}`);
            const result: any = await response.json();

            if (result.status === "success" && result.dataSekolah && result.dataSekolah.length > 0) {
                // Filter for SMP and MTS only
                const filteredData = result.dataSekolah.filter((s: any) =>
                    s.bentuk === "SMP" || s.bentuk === "MTS" || s.sekolah.includes("MTS")
                ).map((s: any) => ({
                    id: s.id,
                    kode_prop: s.kode_prop?.trim(),
                    propinsi: s.propinsi,
                    kode_kab_kota: s.kode_kab_kota?.trim(),
                    kabupaten_kota: s.kabupaten_kota,
                    kode_kec: s.kode_kec?.trim(),
                    kecamatan: s.kecamatan,
                    npsn: s.npsn,
                    sekolah: s.sekolah,
                    bentuk: s.bentuk,
                    status: s.status,
                    alamat_jalan: s.alamat_jalan,
                    lintang: s.lintang,
                    bujur: s.bujur,
                }));

                if (filteredData.length > 0) {
                    // Batch insert using Drizzle
                    await db.insert(sekolah).values(filteredData).onConflictDoNothing();
                    totalImported += filteredData.length;
                    console.log(`✅ Berhasil import ${filteredData.length} data Majalengka. Total: ${totalImported}`);
                }

                if (result.dataSekolah.length < perPage) {
                    hasMore = false;
                } else {
                    page++;
                }
            } else {
                hasMore = false;
            }
        } catch (error) {
            console.error(`❌ Error pada halaman ${page}:`, error);
            hasMore = false;
        }
    }

    console.log(`🎉 Selesai! Total data sekolah Majalengka diimport: ${totalImported}`);
    process.exit(0);
}

importSekolah();

