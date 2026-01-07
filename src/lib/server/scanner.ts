import { db } from "@/lib/db";
import { kelulusan, student, daftarUlang } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createServerFn } from "@tanstack/react-start";

// Server function to lookup student by QR data
export const getStudentByQRData = createServerFn({ method: "GET" })
    .inputValidator((d: { qrData: string }) => d)
    .handler(async ({ data }) => {
        try {
            // Parse QR data: format is "regNo|name|nisn"
            const parts = data.qrData.split("|");
            if (parts.length < 3) {
                throw new Error("Format QR Code tidak valid");
            }

            const [regNo, name, nisn] = parts;

            // Find student and related data using manual joins
            // We search primarily by noDaftar as it is unique
            const results = await db
                .select({
                    kelulusan: kelulusan,
                    student: student,
                    daftarUlang: daftarUlang
                })
                .from(student)
                .innerJoin(kelulusan, eq(student.id, kelulusan.studentId))
                .leftJoin(daftarUlang, eq(kelulusan.id, daftarUlang.kelulusanId))
                .where(eq(student.noDaftar, regNo))
                .limit(1);

            if (results.length === 0) {
                throw new Error("Data pendaftaran tidak ditemukan");
            }

            const row = results[0];

            // Verify name and NISN to ensure QR belongs to this student
            const dbName = row.student.nmSiswa || "";
            const dbNisn = row.student.nisn || "";

            const isNameMatch = dbName.toUpperCase() === name.toUpperCase();
            // NISN might be null/empty in DB or QR, handle both
            const isNisnMatch = (dbNisn || "").toString() === (nisn || "").toString();

            if (!isNameMatch || !isNisnMatch) {
                throw new Error("Data pada QR Code (Nama/NISN) tidak cocok dengan pendaftaran");
            }

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
                },
            };
        } catch (error: any) {
            console.error("QR Lookup Error:", error);
            throw new Error(error.message || "Gagal memproses QR Code");
        }
    });
