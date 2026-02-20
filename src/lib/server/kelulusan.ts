import { db } from "../db";
import { kelulusan } from "../db/kelulusan-schema";
import { student } from "../db/student-schema";
import { and, eq, ilike, or, inArray, count, asc, sql } from "drizzle-orm";
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
                    sekolahAsal: student.sekolahAsal,
                })
                .from(kelulusan)
                .leftJoin(student, eq(kelulusan.studentId, student.id))
                .where(whereClause)
                .orderBy(asc(kelulusan.status), asc(kelulusan.jalur), asc(student.nmSiswa))
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

export const syncKelulusan = createServerFn({ method: "POST" })
    .inputValidator((d: { tahap: string, status: string }) => d)
    .handler(async ({ data }) => {
        const { tahap, status } = data;

        // 1. Get all students
        const allStudents = await db.select().from(student);

        if (allStudents.length === 0) {
            return { synced: 0, updated: 0 };
        }

        // 2. Get existing student IDs in kelulusan for reporting
        const existingRecords = await db.select({ studentId: kelulusan.studentId }).from(kelulusan);
        const existingIds = new Set(existingRecords.map((r: { studentId: string }) => r.studentId));

        // 3. Prepare values for upsert
        const values = allStudents.map((s: any) => ({
            studentId: s.id,
            jalur: s.jalur || '-',
            status: status || 'LULUS',
            tahap,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));

        // 4. Perform Upsert
        // We update 'jalur' to match student table, and refreshing 'updatedAt'
        // We keep 'status' and 'tahap' as they are for existing entries to preserve manual edits
        await db.insert(kelulusan)
            .values(values)
            .onConflictDoUpdate({
                target: kelulusan.studentId,
                set: {
                    jalur: sql`excluded.jalur`,
                    updatedAt: new Date(),
                }
            });

        const newCount = allStudents.filter((s: any) => !existingIds.has(s.id)).length;
        const updatedCount = allStudents.length - newCount;

        return {
            synced: newCount,
            updated: updatedCount,
            total: allStudents.length
        };
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

export const bulkDeleteKelulusan = createServerFn({ method: "POST" })
    .inputValidator((d: { ids: number[] }) => d)
    .handler(async ({ data }) => {
        const { ids } = data;
        if (!ids || ids.length === 0) return { success: true };
        await db.delete(kelulusan).where(inArray(kelulusan.id, ids));
        return { success: true };
    });

export const getJalurStats = createServerFn({ method: "GET" })
    .handler(async () => {
        try {
            const results = await db
                .select({
                    jalur: sql<string>`COALESCE(${kelulusan.jalur}, '-')`,
                    count: sql<number>`CAST(count(*) AS INTEGER)`,
                })
                .from(kelulusan)
                .where(eq(sql`upper(${kelulusan.status})`, 'LULUS'))
                .groupBy(kelulusan.jalur);

            return results;
        } catch (error) {
            console.error("Error fetching jalur stats:", error);
            throw error;
        }
    });

