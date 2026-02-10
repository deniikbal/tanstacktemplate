import { createServerFn } from '@tanstack/react-start'
import { db } from '@/lib/db'
import { student } from '@/lib/db/student-schema'
import { eq } from 'drizzle-orm'
import { kelulusan } from '@/lib/db/kelulusan-schema'
import { daftarUlang } from '@/lib/db/daftar-ulang-schema'

export const loginStudent = createServerFn({ method: 'POST' })
    .inputValidator((d: { nisn: string }) => d)
    .handler(async ({ data }) => {
        const { nisn } = data

        if (!nisn) {
            throw new Error('NISN tidak boleh kosong')
        }

        const foundStudent = await db.query.student.findFirst({
            where: eq(student.nisn, nisn)
        })

        if (!foundStudent) {
            throw new Error('NISN tidak terdaftar')
        }

        // Return session data to be stored client-side
        return {
            success: true,
            name: foundStudent.nmSiswa,
            session: {
                id: foundStudent.id,
                nisn: foundStudent.nisn,
                name: foundStudent.nmSiswa
            }
        }
    })

export const getFullStudentProfile = createServerFn({ method: 'POST' })
    .inputValidator((d: { studentId: string }) => d)
    .handler(async ({ data }) => {
        console.log('[Server] getFullStudentProfile called with data:', JSON.stringify(data))
        const { studentId } = data
        console.log('[Server] studentId:', studentId, 'type:', typeof studentId)

        try {
            const result = await db
                .select({
                    student: student,
                    kelulusan: kelulusan,
                    daftarUlang: daftarUlang,
                })
                .from(student)
                .leftJoin(kelulusan, eq(student.id, kelulusan.studentId))
                .leftJoin(daftarUlang, eq(kelulusan.id, daftarUlang.kelulusanId))
                .where(eq(student.id, studentId))
                .limit(1)

            console.log('[Server] Query result count:', result.length)
            if (result.length === 0) return null
            return result[0]
        } catch (err) {
            console.error('[Server] DB query error:', err)
            throw err
        }
    })

export const logoutStudent = createServerFn({ method: 'POST' })
    .handler(async () => {
        return { success: true }
    })
