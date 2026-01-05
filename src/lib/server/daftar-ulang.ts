import { db } from "@/lib/db";
import { daftarUlang, kelulusan } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createServerFn } from "@tanstack/react-start";

export const getDaftarUlangList = createServerFn({ method: "GET" })
    .handler(async () => {
        const results = await db.query.kelulusan.findMany({
            where: eq(kelulusan.status, "LULUS"),
            with: {
                student: true,
                daftarUlang: true,
            },
        });

        return results.map((item: any) => ({
            id: item.id,
            studentId: item.studentId,
            nmSiswa: item.student.nmSiswa,
            sekolahAsal: item.student.sekolahAsal,
            jenisKelamin: item.student.jenisKelamin,
            jalur: item.jalur,
            tahap: item.tahap,
            daftarUlang: item.daftarUlang || {
                skl: false,
                tatib: false,
                kk: false,
                bukti: false,
                pernyataan: false,
                keterangan: "",
                petugas: "",
            },
        }));
    });

export const upsertDaftarUlang = createServerFn({ method: "POST" })
    .inputValidator((data: {
        kelulusanId: number;
        skl: boolean;
        tatib: boolean;
        kk: boolean;
        bukti: boolean;
        pernyataan: boolean;
        keterangan?: string;
        petugas?: string;
    }) => data)
    .handler(async ({ data }) => {
        try {
            const { kelulusanId, skl, tatib, kk, bukti, pernyataan, keterangan, petugas } = data;

            const existing = await db.query.daftarUlang.findFirst({
                where: eq(daftarUlang.kelulusanId, kelulusanId),
            });

            const values = {
                kelulusanId,
                skl,
                tatib,
                kk,
                bukti,
                pernyataan,
                keterangan: keterangan || null,
                petugas: petugas || null,
                updatedAt: new Date(),
            };

            if (existing) {
                await db
                    .update(daftarUlang)
                    .set(values)
                    .where(eq(daftarUlang.id, existing.id));
            } else {
                await db.insert(daftarUlang).values({
                    ...values,
                    createdAt: new Date(),
                });
            }

            return { success: true };
        } catch (error: any) {
            console.error("Upsert Daftar Ulang Error:", error);
            throw new Error(error.message || "Gagal menyimpan data ke database");
        }
    });
