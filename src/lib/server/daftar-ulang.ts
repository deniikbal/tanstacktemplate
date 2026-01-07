import { db } from "@/lib/db";
import { daftarUlang, kelulusan } from "@/lib/db/schema";
import { eq, count, desc } from "drizzle-orm";
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/middleware";

export const getDaftarUlangList = createServerFn({ method: "GET" })
    .inputValidator((d: { page?: number; limit?: number }) => d)
    .handler(async ({ data }) => {
        const page = data?.page || 1;
        const limit = data?.limit || 10;
        const offset = (page - 1) * limit;

        const whereClause = eq(kelulusan.status, "LULUS");

        // Get total count
        const [totalRes] = await db
            .select({ value: count() })
            .from(kelulusan)
            .where(whereClause);

        const total = totalRes.value;

        // Get paginated results
        const results = await db.query.kelulusan.findMany({
            where: whereClause,
            with: {
                student: true,
                daftarUlang: true,
            },
            limit: limit,
            offset: offset,
            orderBy: [desc(kelulusan.id)],
        });

        const students = results.map((item: any) => ({
            id: item.id,
            studentId: item.studentId,
            nmSiswa: item.student.nmSiswa,
            sekolahAsal: item.student.sekolahAsal,
            jenisKelamin: item.student.jenisKelamin,
            teleponSiswa: item.student.teleponSiswa,
            teleponOrtu: item.student.teleponOrtu,
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

        return {
            students,
            total,
            totalPages: Math.ceil(total / limit),
        };
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
    }) => data)
    .middleware([authMiddleware])
    .handler(async ({ data, context }) => {
        try {
            const { kelulusanId, skl, tatib, kk, bukti, pernyataan, keterangan } = data;
            const petugas = context.session.user.name;

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
