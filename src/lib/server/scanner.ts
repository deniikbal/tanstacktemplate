import { db } from "@/lib/db";
import { kelulusan, student, daftarUlang } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createServerFn } from "@tanstack/react-start";

// Server function to lookup student by QR data
export const getStudentByQRData = createServerFn({ method: "GET" })
    .inputValidator((d: { qrData: string }) => d)
    .handler(async ({ data }) => {
        try {
            // QR data now contains NISN only (10 digits)
            const nisn = data.qrData.trim();

            // Validate NISN format (should be 10 digits)
            if (!/^\d{10}$/.test(nisn)) {
                throw new Error("Format QR Code tidak valid. NISN harus 10 digit angka.");
            }

            // Find student by NISN
            const results = await db
                .select({
                    kelulusan: kelulusan,
                    student: student,
                    daftarUlang: daftarUlang
                })
                .from(student)
                .innerJoin(kelulusan, eq(student.id, kelulusan.studentId))
                .leftJoin(daftarUlang, eq(kelulusan.id, daftarUlang.kelulusanId))
                .where(eq(student.nisn, nisn))
                .limit(1);

            if (results.length === 0) {
                throw new Error("Data siswa dengan NISN tersebut tidak ditemukan");
            }

            const row = results[0];

            return {
                success: true,
                student: {
                    kelulusanId: row.kelulusan.id,
                    noDaftar: row.student.noDaftar,
                    nisn: row.student.nisn,
                    nmSiswa: row.student.nmSiswa,
                    jenisKelamin: row.student.jenisKelamin,
                    sekolahAsal: row.student.sekolahAsal,
                    teleponSiswa: row.student.teleponSiswa,
                    teleponOrtu: row.student.teleponOrtu,
                    jalur: row.kelulusan.jalur,
                    tahap: row.kelulusan.tahap,
                    status: row.kelulusan.status,
                },
                daftarUlang: row.daftarUlang || {
                    skl: false,
                    tatib: false,
                    kk: false,
                    bukti: false,
                    pernyataan: false,
                    keterangan: "",
                    petugas: "",
                    fileSklId: null,
                    fileTatibId: null,
                    fileKkId: null,
                    fileBuktiId: null,
                    filePernyataanId: null,
                },
            };
        } catch (error: any) {
            console.error("QR Lookup Error:", error);
            throw new Error(error.message || "Gagal memproses QR Code");
        }
    });
