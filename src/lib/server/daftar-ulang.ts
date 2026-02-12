import { db } from "@/lib/db";
import { daftarUlang, kelulusan, student } from "@/lib/db/schema";
import { eq, count, and, ilike, or, asc, sql } from "drizzle-orm";
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/middleware";
import { createStudentFolder, uploadToDrive, deleteFromDrive } from "./google-drive";

export const getDaftarUlangList = createServerFn({ method: "GET" })
    .inputValidator((d: { page?: number; limit?: number; search?: string; jalur?: string }) => d)
    .handler(async ({ data }) => {
        const page = data?.page || 1;
        const limit = data?.limit || 10;
        const search = data?.search || "";
        const jalur = data?.jalur || "all";
        const offset = (page - 1) * limit;

        let whereClause = eq(kelulusan.status, "LULUS");

        if (jalur !== "all") {
            whereClause = and(whereClause, eq(kelulusan.jalur, jalur)) as any;
        }

        if (search) {
            whereClause = and(
                whereClause,
                or(
                    ilike(student.nmSiswa, `%${search}%`),
                    ilike(student.sekolahAsal, `%${search}%`)
                )
            ) as any;
        }

        // Get total count and stats for the whole filtered population in one efficient query
        const [statsRes]: any = await db
            .select({
                total: count(),
                sudah: sql<number>`sum(case when ${daftarUlang.skl} and ${daftarUlang.tatib} and ${daftarUlang.kk} and ${daftarUlang.bukti} and ${daftarUlang.pernyataan} then 1 else 0 end)`,
                // A student is "Belum" if: no record in daftarUlang OR all 5 docs are false
                belum: sql<number>`sum(case when ${daftarUlang.id} is null or (not ${daftarUlang.skl} and not ${daftarUlang.tatib} and not ${daftarUlang.kk} and not ${daftarUlang.bukti} and not ${daftarUlang.pernyataan}) then 1 else 0 end)`,
            })
            .from(kelulusan)
            .innerJoin(student, eq(kelulusan.studentId, student.id))
            .leftJoin(daftarUlang, eq(kelulusan.id, daftarUlang.kelulusanId))
            .where(whereClause);

        const total = Number(statsRes?.total || 0);
        const sudah = Number(statsRes?.sudah || 0);
        const belum = Number(statsRes?.belum || 0);
        const belumLengkap = Math.max(0, total - sudah - belum);

        // Get paginated results
        const results = await db
            .select({
                kelulusan: kelulusan,
                student: student,
                daftarUlang: daftarUlang,
            })
            .from(kelulusan)
            .innerJoin(student, eq(kelulusan.studentId, student.id))
            .leftJoin(daftarUlang, eq(kelulusan.id, daftarUlang.kelulusanId))
            .where(whereClause)
            .limit(limit)
            .offset(offset)
            .orderBy(asc(student.nmSiswa));

        const students = results.map((item: any) => ({
            id: item.kelulusan.id,
            studentId: item.kelulusan.studentId,
            nmSiswa: item.student.nmSiswa,
            sekolahAsal: item.student.sekolahAsal,
            jenisKelamin: item.student.jenisKelamin,
            teleponSiswa: item.student.teleponSiswa,
            teleponOrtu: item.student.teleponOrtu,
            jalur: item.kelulusan.jalur,
            tahap: item.kelulusan.tahap,
            daftarUlang: item.daftarUlang || {
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
        }));

        return {
            students,
            total,
            totalPages: Math.ceil(total / limit),
            stats: { sudah, belum, belumLengkap }
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

            const values: any = {
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

export const saveFileDriveId = createServerFn({ method: 'POST' })
    .inputValidator((d: {
        kelulusanId: number,
        field: 'fileSklId' | 'fileTatibId' | 'fileKkId' | 'fileBuktiId' | 'filePernyataanId',
        driveId: string
    }) => d)
    .handler(async ({ data }) => {
        const { kelulusanId, field, driveId } = data

        const existing = await db.query.daftarUlang.findFirst({
            where: eq(daftarUlang.kelulusanId, kelulusanId)
        })

        if (existing) {
            await db.update(daftarUlang)
                .set({ [field]: driveId, updatedAt: new Date() })
                .where(eq(daftarUlang.id, existing.id))
        } else {
            await db.insert(daftarUlang).values({
                kelulusanId,
                [field]: driveId as any,
                createdAt: new Date(),
                updatedAt: new Date(),
                skl: false,
                tatib: false,
                kk: false,
                bukti: false,
                pernyataan: false
            } as any)
        }

        return { success: true }
    })

export const uploadStudentFile = createServerFn({ method: 'POST' })
    .inputValidator((d: FormData) => d)
    .handler(async ({ data }) => {
        const file = data.get('file') as File
        const type = data.get('type') as string
        const nisn = data.get('nisn') as string
        const studentName = data.get('name') as string
        const kelulusanIdStr = data.get('kelulusanId') as string
        const kelulusanId = parseInt(kelulusanIdStr)

        if (!file || !type || !nisn || !kelulusanId) {
            throw new Error('Data tidak lengkap')
        }

        const parentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID
        if (!parentFolderId) {
            throw new Error('Konfigurasi Google Drive folder ID belum diatur')
        }

        // 1. Create/Get student folder
        const studentFolderId = await createStudentFolder(`${nisn}_${studentName}`, parentFolderId)

        if (!studentFolderId) {
            throw new Error('Gagal membuat atau menemukan folder siswa di Google Drive')
        }

        // 1.5 Cek dan hapus berkas lama jika ada
        const fieldMap: Record<string, 'fileSklId' | 'fileTatibId' | 'fileKkId' | 'fileBuktiId' | 'filePernyataanId'> = {
            'skl': 'fileSklId',
            'tatib': 'fileTatibId',
            'kk': 'fileKkId',
            'bukti': 'fileBuktiId',
            'pernyataan': 'filePernyataanId'
        }
        const field = fieldMap[type]
        if (!field) throw new Error('Tipe berkas tidak valid')

        const existingRecord = await db.query.daftarUlang.findFirst({
            where: eq(daftarUlang.kelulusanId, kelulusanId)
        })

        if (existingRecord && existingRecord[field]) {
            await deleteFromDrive(existingRecord[field] as string)
        }

        // 2. Upload file to drive
        const fileName = `${type.toUpperCase()}_${nisn}.pdf`
        const driveResult = await uploadToDrive(file, studentFolderId, fileName)

        if (!driveResult.id) {
            throw new Error('Gagal mengunggah file ke Google Drive')
        }

        // 3. Save drive ID to database
        await saveFileDriveId({
            data: {
                kelulusanId,
                field: field,
                driveId: driveResult.id
            }
        })

        return { success: true, driveId: driveResult.id }
    })
