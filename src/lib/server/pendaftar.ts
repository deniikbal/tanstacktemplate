import { createServerFn } from '@tanstack/react-start'
import { db } from '@/lib/db'
import { pendaftar } from '@/lib/db/pendaftar-schema'
import { tahunAjaran } from '@/lib/db/tahun-ajaran-schema'
import { eq, ilike, sql, asc, and } from 'drizzle-orm'

export const getPendaftarList = createServerFn({
    method: 'GET',
})
    .inputValidator((d: { limit?: number; offset?: number; search?: string, asalSekolah?: string, jalurMasuk?: string, tahunAjaran?: string }) => d)
    .handler(async ({ data }) => {
        const { limit = 10, offset = 0, search, asalSekolah, jalurMasuk, tahunAjaran } = data

        const filters = []

        if (search) {
            filters.push(ilike(pendaftar.nmLengkap, `%${search}%`))
        }

        if (asalSekolah && asalSekolah !== 'semua') {
            filters.push(ilike(pendaftar.asalSekolah, `%${asalSekolah}%`))
        }

        if (jalurMasuk && jalurMasuk !== 'semua') {
            filters.push(eq(pendaftar.jalurMasuk, jalurMasuk))
        }

        if (tahunAjaran && tahunAjaran !== 'semua') {
            filters.push(eq(pendaftar.tahunAjaran, tahunAjaran))
        }

        const whereClause = filters.length > 0 ? and(...filters) : undefined

        const pendaftarData = await db
            .select()
            .from(pendaftar)
            .where(whereClause)
            .limit(limit)
            .offset(offset)
            .orderBy(asc(pendaftar.nmLengkap))

        const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(pendaftar)
            .where(whereClause)

        return {
            pendaftar: pendaftarData,
            total: Number(countResult[0]?.count || 0),
        }
    })

export const getPendaftarStats = createServerFn({
    method: 'GET',
})
    .handler(async () => {
        const { sql } = await import('drizzle-orm')

        const stats = await db
            .select({
                total: sql<number>`count(*)`,
                verified: sql<number>`count(*) filter (where ${pendaftar.keterangan} = 'Sudah Verifikasi')`,
                unverified: sql<number>`count(*) filter (where ${pendaftar.keterangan} != 'Sudah Verifikasi' or ${pendaftar.keterangan} is null)`,
                tahap1: sql<number>`count(*) filter (where ${pendaftar.tahap} = '1')`,
                tahap2: sql<number>`count(*) filter (where ${pendaftar.tahap} = '2')`,
            })
            .from(pendaftar)

        return stats[0] || { total: 0, verified: 0, unverified: 0, tahap1: 0, tahap2: 0 }
    })



export const deletePendaftar = createServerFn({ method: 'POST' })
    .inputValidator((d: { id: string }) => d)
    .handler(async ({ data }) => {
        await db.delete(pendaftar).where(eq(pendaftar.id, data.id))
        return { success: true }
    })

interface PendaftarData {
    id?: string
    nmLengkap: string
    tempatLahir?: string | null
    tanggalLahir?: string | null
    alamat?: string | null
    asalSekolah?: string | null
    noHandphone?: string | null
    tahunLulus?: string | null
    jalurMasuk?: string | null
    keterangan?: string | null
    tahap?: string | null
}

export const savePendaftar = createServerFn({ method: 'POST' })
    .inputValidator((d: PendaftarData) => d)
    .handler(async ({ data }) => {
        const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
            acc[key] = (value === '' ? null : value)
            return acc
        }, {} as any)

        if (!cleanData.nmLengkap) {
            throw new Error('Nama Lengkap tidak boleh kosong')
        }

        try {
            if (cleanData.id) {
                // Update
                await db
                    .update(pendaftar)
                    .set({
                        ...cleanData,
                        updatedAt: new Date(),
                    })
                    .where(eq(pendaftar.id, cleanData.id))
            } else {
                // Create - get active tahun ajaran
                const activeTahun = await db
                    .select({ tahun: tahunAjaran.tahun })
                    .from(tahunAjaran)
                    .where(eq(tahunAjaran.isAktif, true))
                    .limit(1)

                const aktiveTahunAjaran = activeTahun[0]?.tahun || null

                await db.insert(pendaftar).values({
                    ...cleanData,
                    id: crypto.randomUUID(),
                    tahunAjaran: aktiveTahunAjaran,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
            }
            return { success: true }
        } catch (error: any) {
            console.error('Database operation failed:', error)
            throw new Error(`Gagal menyimpan data: ${error.message}`)
        }
    })
export const getSchoolSearch = createServerFn({ method: 'GET' })
    .inputValidator((d: { query?: string, kecCode?: string }) => d)
    .handler(async ({ data }) => {
        const { query, kecCode } = data
        const { sekolah } = await import('@/lib/db/sekolah-schema')
        const { or, and, eq, ilike } = await import('drizzle-orm')

        let whereClause
        if (kecCode) {
            whereClause = eq(sekolah.kode_kec, kecCode)
        } else if (query) {
            whereClause = ilike(sekolah.sekolah, `%${query}%`)
        } else {
            return []
        }

        return await db.select().from(sekolah)
            .where(and(
                whereClause,
                or(eq(sekolah.bentuk, 'SMP'), eq(sekolah.bentuk, 'MTS'))
            ))
            .limit(50)
    })

export const getLocations = createServerFn({ method: 'GET' })
    .inputValidator((d: { query: string }) => d)
    .handler(async ({ data }) => {
        const { sekolah } = await import('@/lib/db/sekolah-schema')
        const { ilike } = await import('drizzle-orm')

        // Find unique kecamatan from our schools matching the query
        return await db.select({
            code: sekolah.kode_kec,
            name: sekolah.kecamatan,
            kabupaten: sekolah.kabupaten_kota
        })
            .from(sekolah)
            .where(ilike(sekolah.kecamatan, `%${data.query}%`))
            .groupBy(sekolah.kode_kec, sekolah.kecamatan, sekolah.kabupaten_kota)
            .limit(10)
    })

// Get distinct tahunAjaran values for filter dropdown
export const getTahunAjaranOptions = createServerFn({
    method: 'GET',
})
    .handler(async () => {
        const results = await db
            .selectDistinct({ tahunAjaran: pendaftar.tahunAjaran })
            .from(pendaftar)
            .where(sql`${pendaftar.tahunAjaran} IS NOT NULL`)
            .orderBy(sql`${pendaftar.tahunAjaran} DESC`)

        return results.map(r => r.tahunAjaran).filter(Boolean) as string[]
    })
