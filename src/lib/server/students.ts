import { createServerFn } from '@tanstack/react-start'
import { db } from '@/lib/db'
import { student } from '@/lib/db/student-schema'
import { tahunAjaran } from '@/lib/db/tahun-ajaran-schema'
import { eq, like, sql, desc, asc, inArray, and } from 'drizzle-orm'

export const getStudents = createServerFn({
    method: 'GET',
})
    .inputValidator((d: { limit?: number; offset?: number; search?: string; tahunAjaran?: string }) => d)
    .handler(async ({ data }) => {
        const { limit = 10, offset = 0, search, tahunAjaran } = data

        const filters = []

        if (search) {
            filters.push(like(student.nmSiswa, `%${search}%`))
        }

        if (tahunAjaran && tahunAjaran !== 'semua') {
            filters.push(eq(student.tahunAjaran, tahunAjaran))
        }

        const whereClause = filters.length > 0 ? and(...filters) : undefined

        const studentsData = await db
            .select()
            .from(student)
            .where(whereClause)
            .limit(limit)
            .offset(offset)
            .orderBy(asc(student.nmSiswa))

        const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(student)
            .where(whereClause)

        return {
            students: studentsData,
            total: Number(countResult[0]?.count || 0),
        }
    })

export const deleteStudent = createServerFn({ method: 'POST' })
    .inputValidator((d: { id: string }) => d)
    .handler(async ({ data }) => {
        await db.delete(student).where(eq(student.id, data.id))
        return { success: true }
    })

export const bulkDeleteStudents = createServerFn({ method: 'POST' })
    .inputValidator((d: { ids: string[] }) => d)
    .handler(async ({ data }) => {
        if (!data.ids || data.ids.length === 0) {
            return { deleted: 0 }
        }

        try {
            // Delete all in a single SQL query using inArray
            await db.delete(student).where(inArray(student.id, data.ids))
            return { deleted: data.ids.length }
        } catch (error) {
            console.error('Bulk delete failed:', error)
            return { deleted: 0 }
        }
    })

interface UpdateStudentData {
    id: string
    // Identity
    nmSiswa: string
    nis?: string | null
    nisn?: string | null
    tempatLahir?: string | null
    tanggalLahir?: string | null
    jenisKelamin?: string | null
    agama?: string | null
    alamatSiswa?: string | null
    teleponSiswa?: string | null
    // Parents
    nmAyah?: string | null
    nmIbu?: string | null
    pekerjaanAyah?: string | null
    pekerjaanIbu?: string | null
    nmWali?: string | null
    pekerjaanWali?: string | null
    alamatOrtu?: string | null
    teleponOrtu?: string | null
    alamatWali?: string | null
    teleponWali?: string | null
    // Supplementary
    statusDalamKel?: string | null
    anakKe?: string | null
    sekolahAsal?: string | null
    diterimaKelas?: string | null
    diterimaTanggal?: string | null
    noIjasahnas?: string | null
    noTranskrip?: string | null
}

export const updateStudent = createServerFn({ method: 'POST' })
    .inputValidator((d: UpdateStudentData) => d)
    .handler(async ({ data }) => {
        console.log('Updating student with data:', JSON.stringify(data, null, 2))

        // Ensure empty strings are treated as null for database safety
        const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
            acc[key] = (value === '' ? null : value)
            return acc
        }, {} as any)

        if (!cleanData.nmSiswa) {
            throw new Error('Nama Siswa tidak boleh kosong')
        }

        try {
            await db
                .update(student)
                .set({
                    nmSiswa: cleanData.nmSiswa,
                    nis: cleanData.nis,
                    nisn: cleanData.nisn,
                    tempatLahir: cleanData.tempatLahir,
                    tanggalLahir: cleanData.tanggalLahir,
                    jenisKelamin: cleanData.jenisKelamin,
                    agama: cleanData.agama,
                    alamatSiswa: cleanData.alamatSiswa,
                    teleponSiswa: cleanData.teleponSiswa,
                    nmAyah: cleanData.nmAyah,
                    nmIbu: cleanData.nmIbu,
                    pekerjaanAyah: cleanData.pekerjaanAyah,
                    pekerjaanIbu: cleanData.pekerjaanIbu,
                    nmWali: cleanData.nmWali,
                    pekerjaanWali: cleanData.pekerjaanWali,
                    alamatOrtu: cleanData.alamatOrtu,
                    teleponOrtu: cleanData.teleponOrtu,
                    alamatWali: cleanData.alamatWali,
                    teleponWali: cleanData.teleponWali,
                    statusDalamKel: cleanData.statusDalamKel,
                    anakKe: cleanData.anakKe,
                    sekolahAsal: cleanData.sekolahAsal,
                    diterimaKelas: cleanData.diterimaKelas,
                    diterimaTanggal: cleanData.diterimaTanggal,
                    noIjasahnas: cleanData.noIjasahnas,
                    noTranskrip: cleanData.noTranskrip,
                    updatedAt: new Date(),
                })
                .where(eq(student.id, cleanData.id))
            return { success: true }
        } catch (error: any) {
            console.error('Database update failed:', error)
            throw new Error(`Gagal memperbarui database: ${error.message}`)
        }
    })

interface StudentImportData {
    nis?: string
    nisn?: string
    nm_siswa: string
    tempat_lahir?: string
    tanggal_lahir?: string
    jenis_kelamin?: string
    agama?: string
    alamat_siswa?: string
    telepon_siswa?: string
    diterima_tanggal?: string
    nm_ayah?: string
    nm_ibu?: string
    pekerjaan_ayah?: string
    pekerjaan_ibu?: string
    nm_wali?: string
    pekerjaan_wali?: string
}

export const bulkImportStudents = createServerFn({ method: 'POST' })
    .inputValidator((d: { students: StudentImportData[] }) => d)
    .handler(async ({ data }) => {
        const { students: importData } = data

        if (!importData || importData.length === 0) {
            throw new Error('No data to import')
        }

        // Get active tahun ajaran
        const activeTahun = await db
            .select({ tahun: tahunAjaran.tahun })
            .from(tahunAjaran)
            .where(eq(tahunAjaran.isAktif, true))
            .limit(1)

        const aktiveTahunAjaran = activeTahun[0]?.tahun || null

        let imported = 0
        let failed = 0

        for (const row of importData) {
            try {
                // Generate a unique ID
                const id = crypto.randomUUID()

                await db.insert(student).values({
                    id,
                    nis: row.nis || null,
                    nisn: row.nisn || null,
                    nmSiswa: row.nm_siswa,
                    tempatLahir: row.tempat_lahir || null,
                    tanggalLahir: row.tanggal_lahir || null,
                    jenisKelamin: row.jenis_kelamin || null,
                    agama: row.agama || null,
                    alamatSiswa: row.alamat_siswa || null,
                    teleponSiswa: row.telepon_siswa || null,
                    diterimaTanggal: row.diterima_tanggal || null,
                    nmAyah: row.nm_ayah || null,
                    nmIbu: row.nm_ibu || null,
                    pekerjaanAyah: row.pekerjaan_ayah || null,
                    pekerjaanIbu: row.pekerjaan_ibu || null,
                    nmWali: row.nm_wali || null,
                    pekerjaanWali: row.pekerjaan_wali || null,
                    tahunAjaran: aktiveTahunAjaran,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                imported++
            } catch (error) {
                console.error('Failed to import student:', row.nm_siswa, error)
                failed++
            }
        }

        return { imported, failed, total: importData.length }
    })

interface SingleStudentImportData {
    nis?: string
    nisn?: string
    nm_siswa: string
    tempat_lahir?: string
    tanggal_lahir?: string
    jenis_kelamin?: string
    agama?: string
    alamat_siswa?: string
    telepon_siswa?: string
    diterima_tanggal?: string
    nm_ayah?: string
    nm_ibu?: string
    pekerjaan_ayah?: string
    pekerjaan_ibu?: string
    nm_wali?: string
    pekerjaan_wali?: string
}

export const importBatchStudents = createServerFn({ method: 'POST' })
    .inputValidator((d: { students: SingleStudentImportData[] }) => d)
    .handler(async ({ data }) => {
        const { students: batch } = data

        if (!batch || batch.length === 0) {
            return { imported: 0, failed: 0 }
        }

        // Get active tahun ajaran
        const activeTahun = await db
            .select({ tahun: tahunAjaran.tahun })
            .from(tahunAjaran)
            .where(eq(tahunAjaran.isAktif, true))
            .limit(1)

        const aktiveTahunAjaran = activeTahun[0]?.tahun || null

        const values = batch.map(row => ({
            id: crypto.randomUUID(),
            nis: row.nis || null,
            nisn: row.nisn || null,
            nmSiswa: row.nm_siswa,
            tempatLahir: row.tempat_lahir || null,
            tanggalLahir: row.tanggal_lahir || null,
            jenisKelamin: row.jenis_kelamin || null,
            agama: row.agama || null,
            alamatSiswa: row.alamat_siswa || null,
            teleponSiswa: row.telepon_siswa || null,
            diterimaTanggal: row.diterima_tanggal || null,
            nmAyah: row.nm_ayah || null,
            nmIbu: row.nm_ibu || null,
            pekerjaanAyah: row.pekerjaan_ayah || null,
            pekerjaanIbu: row.pekerjaan_ibu || null,
            nmWali: row.nm_wali || null,
            pekerjaanWali: row.pekerjaan_wali || null,
            tahunAjaran: aktiveTahunAjaran,
            createdAt: new Date(),
            updatedAt: new Date(),
        }))

        try {
            await db.insert(student).values(values)
            return { imported: batch.length, failed: 0 }
        } catch (error) {
            console.error('Batch insert failed:', error)
            return { imported: 0, failed: batch.length }
        }
    })

// Get distinct tahunAjaran values for filter dropdown
export const getTahunAjaranStudentOptions = createServerFn({
    method: 'GET',
})
    .handler(async () => {
        const results = await db
            .selectDistinct({ tahunAjaran: student.tahunAjaran })
            .from(student)
            .where(sql`${student.tahunAjaran} IS NOT NULL`)
            .orderBy(sql`${student.tahunAjaran} DESC`)

        return results.map(r => r.tahunAjaran).filter(Boolean) as string[]
    })
