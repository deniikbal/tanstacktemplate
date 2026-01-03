import { db } from "../db";
import { kelulusan } from "../db/kelulusan-schema";
import { student } from "../db/student-schema";
import { and, eq, desc, ilike, or, inArray, count } from "drizzle-orm";
import { createServerFn } from "@tanstack/react-start";

export const getAllKelulusan = createServerFn({ method: "GET" })
    .inputValidator((d: { page?: number; limit?: number; search?: string; tahap?: string; jalur?: string; status?: string }) => d)
    .handler(async ({ data }) => {
        const page = data.page || 1;
        const limit = data.limit || 10;
        const offset = (page - 1) * limit;
        const search = data.search;
        const tahap = data.tahap;
        const jalur = data.jalur;
        const status = data.status;


        const whereConditions = [];

        if (search) {
            whereConditions.push(
                or(
                    ilike(student.nmSiswa, `%${search}%`),
                    ilike(student.nisn, `%${search}%`),
                    ilike(student.noDaftar, `%${search}%`)
                )
            );
        }

        if (tahap && tahap !== 'all') {
            whereConditions.push(eq(kelulusan.tahap, tahap));
        }

        if (jalur && jalur !== 'all') {
            whereConditions.push(eq(kelulusan.jalur, jalur));
        }

        if (status && status !== 'all') {
            whereConditions.push(eq(kelulusan.status, status));
        }

        const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

        try {
            // Get total count
            const [totalRes] = await db
                .select({ value: count() })
                .from(kelulusan)
                .leftJoin(student, eq(kelulusan.studentId, student.id))
                .where(whereClause);

            const total = totalRes.value;

            // Get paginated results
            const results = await db
                .select({
                    id: kelulusan.id,
                    jalur: kelulusan.jalur,
                    status: kelulusan.status,
                    tahap: kelulusan.tahap,
                    studentId: kelulusan.studentId,
                    studentName: student.nmSiswa,
                    studentNisn: student.nisn,
                    noDaftar: student.noDaftar,
                })
                .from(kelulusan)
                .leftJoin(student, eq(kelulusan.studentId, student.id))
                .where(whereClause)
                .orderBy(desc(kelulusan.id))
                .limit(limit)
                .offset(offset);

            return {
                data: results,
                pagination: {
                    total,
                    pageCount: Math.ceil(total / limit),
                    page,
                    limit,
                }
            };
        } catch (error) {
            console.error("Error fetching kelulusan:", error);
            throw error;
        }
    });

export const createKelulusan = async (data: any) => {
    await db.insert(kelulusan).values(data);
};

export const searchStudents = createServerFn({ method: "GET" })
    .inputValidator((d: { q: string }) => d)
    .handler(async ({ data }) => {
        const { q } = data;
        if (!q || q.length < 2) return [];

        return await db
            .select({
                id: student.id,
                nmSiswa: student.nmSiswa,
                nisn: student.nisn,
                noDaftar: student.noDaftar,
            })
            .from(student)
            .where(
                or(
                    ilike(student.nmSiswa, `%${q}%`),
                    ilike(student.nisn, `%${q}%`),
                    ilike(student.noDaftar, `%${q}%`)
                )
            )
            .limit(10);
    });

export const createKelulusanFn = createServerFn({ method: "POST" })
    .inputValidator((d: any) => d)
    .handler(async ({ data }) => {
        // Check for duplicate
        const existing = await db
            .select({ id: kelulusan.id })
            .from(kelulusan)
            .where(eq(kelulusan.studentId, data.studentId))
            .limit(1);

        if (existing.length > 0) {
            throw new Error("Siswa ini sudah memiliki data kelulusan.");
        }

        await createKelulusan(data);
        return { success: true };
    });

export const updateKelulusan = createServerFn({ method: "POST" })
    .inputValidator((d: { id: number; data: any }) => d)
    .handler(async ({ data }) => {
        const { id, data: updateData } = data;
        await db.update(kelulusan).set(updateData).where(eq(kelulusan.id, id));
        return { success: true };
    });

export const deleteKelulusan = createServerFn({ method: "POST" })
    .inputValidator((d: { id: number }) => d)
    .handler(async ({ data }) => {
        await db.delete(kelulusan).where(eq(kelulusan.id, data.id));
        return { success: true };
    });
export const bulkCreateKelulusanFn = createServerFn({ method: "POST" })
    .inputValidator((d: { studentIds: string[]; jalur: string; status: string; tahap: string }) => d)
    .handler(async ({ data }) => {
        const { studentIds, jalur, status, tahap } = data;

        if (!studentIds || studentIds.length === 0) {
            return { imported: 0, skipped: 0 };
        }

        // 1. Get existing student IDs in kelulusan table
        const existingRecords = await db
            .select({ studentId: kelulusan.studentId })
            .from(kelulusan)
            .where(inArray(kelulusan.studentId, studentIds));

        const existingIds = new Set(existingRecords.map((r: { studentId: string }) => r.studentId));

        // 2. Filter out students that already have graduation data
        const newStudentIds = studentIds.filter(id => !existingIds.has(id));

        if (newStudentIds.length === 0) {
            return { imported: 0, skipped: studentIds.length };
        }

        // 3. Batch insert new records
        const values = newStudentIds.map(id => ({
            studentId: id,
            jalur,
            status,
            tahap,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));

        await db.insert(kelulusan).values(values);

        return {
            imported: newStudentIds.length,
            skipped: studentIds.length - newStudentIds.length,
        };
    });
