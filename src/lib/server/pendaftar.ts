import { createServerFn } from '@tanstack/react-start'
import { db } from '@/lib/db'
import { pendaftar } from '@/lib/db/pendaftar-schema'
import { tahunAjaran } from '@/lib/db/tahun-ajaran-schema'
import { eq, ilike, sql, asc, and } from 'drizzle-orm'
import { sendWhatsApp } from './whatsapp'
import { getJakartaDate } from '@/lib/utils'


// Helper to get the next queue number for a specific date
async function getNextQueueNumber(dateStr: string) {
    // Explicitly compare using SQL to avoid Drizzle/Driver date conversion issues
    const result = await db
        .select({ maxNo: sql<number>`COALESCE(max(NULLIF(${pendaftar.noAntrian}, '')::integer), 0)` })
        .from(pendaftar)
        .where(sql`CAST(${pendaftar.tglAntrian} AS DATE) = ${dateStr}::DATE`)

    return Number(result[0]?.maxNo || 0) + 1
}

export const getPendaftarList = createServerFn({
    method: 'GET',
})
    .inputValidator((d: { limit?: number; offset?: number; search?: string, asalSekolah?: string, jalurMasuk?: string, tahap?: string, statusAntrian?: string, tahunAjaran?: string, tglAntrian?: string }) => d)
    .handler(async ({ data }) => {
        const { limit = 10, offset = 0, search, asalSekolah, jalurMasuk, tahap, statusAntrian, tahunAjaran: inputTahunAjaran, tglAntrian } = data

        let targetTahunAjaran = inputTahunAjaran

        // If no specific year is provided, get the active one
        if (!targetTahunAjaran || targetTahunAjaran === 'semua') {
            const activeTahun = await db
                .select({ tahun: tahunAjaran.tahun })
                .from(tahunAjaran)
                .where(eq(tahunAjaran.isAktif, true))
                .limit(1)
            targetTahunAjaran = activeTahun[0]?.tahun || undefined
        }

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

        if (tahap && tahap !== 'semua') {
            filters.push(eq(pendaftar.tahap, tahap))
        }

        if (statusAntrian && statusAntrian !== 'semua') {
            filters.push(eq(pendaftar.statusAntrian, statusAntrian))
        }

        if (targetTahunAjaran && targetTahunAjaran !== 'semua') {
            filters.push(eq(pendaftar.tahunAjaran, targetTahunAjaran))
        }

        if (tglAntrian) {
            filters.push(eq(pendaftar.tglAntrian, tglAntrian))
        }

        const whereClause = filters.length > 0 ? and(...filters) : undefined

        const pendaftarData = await db
            .select()
            .from(pendaftar)
            .where(whereClause)
            .limit(limit)
            .offset(offset)
            .orderBy(
                sql`NULLIF(${pendaftar.noAntrian}, '')::integer ASC NULLS LAST`,
                asc(pendaftar.nmLengkap)
            )

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

export const getRegistrationChartData = createServerFn({
    method: 'GET',
})
    .handler(async () => {
        // 1. Daily Trend (Last 30 days)
        const trendData = await db
            .select({
                date: sql<string>`TO_CHAR(${pendaftar.createdAt}, 'YYYY-MM-DD')`,
                count: sql<number>`count(*)`
            })
            .from(pendaftar)
            .where(sql`${pendaftar.createdAt} > NOW() - INTERVAL '30 days'`)
            .groupBy(sql`TO_CHAR(${pendaftar.createdAt}, 'YYYY-MM-DD')`)
            .orderBy(sql`TO_CHAR(${pendaftar.createdAt}, 'YYYY-MM-DD')`)

        // 2. Jalur Distribution
        const jalurData = await db
            .select({
                name: sql<string>`COALESCE(${pendaftar.jalurMasuk}, 'Tidak Diketahui')`,
                value: sql<number>`count(*)`
            })
            .from(pendaftar)
            .groupBy(pendaftar.jalurMasuk)

        // 3. Verification Status
        const statusData = await db
            .select({
                name: sql<string>`CASE 
                    WHEN ${pendaftar.keterangan} = 'Sudah Verifikasi' THEN 'Terverifikasi' 
                    ELSE 'Belum Verifikasi' 
                END`,
                value: sql<number>`count(*)`
            })
            .from(pendaftar)
            .groupBy(sql`CASE 
                    WHEN ${pendaftar.keterangan} = 'Sudah Verifikasi' THEN 'Terverifikasi' 
                    ELSE 'Belum Verifikasi' 
                END`)

        return {
            trendData,
            jalurData,
            statusData
        }
    })



export const deletePendaftar = createServerFn({ method: 'POST' })
    .inputValidator((d: { id: string }) => d)
    .handler(async ({ data }) => {
        await db.delete(pendaftar).where(eq(pendaftar.id, data.id))
        return { success: true }
    })

export const updateQueueStatus = createServerFn({
    method: 'POST',
})
    .inputValidator((d: { id: string, status: string }) => d)
    .handler(async ({ data }) => {
        const { id, status } = data
        await db.update(pendaftar)
            .set({ statusAntrian: status })
            .where(eq(pendaftar.id, id))
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
    noAntrian?: string | null
    tglAntrian?: string | null
}

export const issueQueueNumber = createServerFn({ method: 'POST' })
    .inputValidator((d: { id: string }) => d)
    .handler(async ({ data }) => {
        const today = getJakartaDate()
        const nextNo = await getNextQueueNumber(today)

        await db
            .update(pendaftar)
            .set({
                noAntrian: nextNo.toString(),
                tglAntrian: today,
                updatedAt: new Date(),
            })
            .where(eq(pendaftar.id, data.id))

        // Send Notification
        const p = await db.select().from(pendaftar).where(eq(pendaftar.id, data.id)).limit(1)
        if (p[0] && p[0].noHandphone) {
            const message = `Halo *${p[0].nmLengkap}*, Nomor Antrian Anda adalah *#${nextNo}*.

*Asal Sekolah*: ${p[0].asalSekolah || '-'}
*Jalur*: ${p[0].jalurMasuk || '-'}
*Tahap*: ${p[0].tahap || '-'}

Silakan tunjukkan pesan ini kepada petugas saat verifikasi. Terima kasih.`
            await sendWhatsApp(p[0].noHandphone, message)
        }

        return { success: true, noAntrian: nextNo }
    })

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

                const today = getJakartaDate()
                const nextNo = await getNextQueueNumber(today)

                await db.insert(pendaftar).values({
                    ...cleanData,
                    id: crypto.randomUUID(),
                    tahunAjaran: aktiveTahunAjaran,
                    noAntrian: nextNo.toString(),
                    tglAntrian: today,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })

                // Send Notification for New Registration
                if (cleanData.noHandphone) {
                    const message = `Halo *${cleanData.nmLengkap}*, Pendaftaran Anda berhasil. Nomor Antrian Anda adalah *#${nextNo}*.

*Asal Sekolah*: ${cleanData.asalSekolah || '-'}
*Jalur*: ${cleanData.jalurMasuk || '-'}
*Tahap*: ${cleanData.tahap || '-'}

Silakan tunjukkan pesan ini kepada petugas saat verifikasi. Terima kasih.`
                    await sendWhatsApp(cleanData.noHandphone, message)
                }
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

        return results.map((r: { tahunAjaran: string | null }) => r.tahunAjaran).filter(Boolean) as string[]
    })

export const resendQueueWA = createServerFn({ method: 'POST' })
    .inputValidator((d: { id: string }) => d)
    .handler(async ({ data }) => {
        const p = await db.select().from(pendaftar).where(eq(pendaftar.id, data.id)).limit(1)
        if (!p[0] || !p[0].noHandphone || !p[0].noAntrian) {
            throw new Error('Data tidak lengkap (No HP atau Antrian kosong)')
        }

        const message = `Halo *${p[0].nmLengkap}*, ini adalah pengiriman ulang Nomor Antrian Anda: *#${p[0].noAntrian}*.

*Asal Sekolah*: ${p[0].asalSekolah || '-'}
*Jalur*: ${p[0].jalurMasuk || '-'}
*Tahap*: ${p[0].tahap || '-'}

Silakan tunjukkan pesan ini kepada petugas saat verifikasi. Terima kasih.`
        await sendWhatsApp(p[0].noHandphone, message)

        return { success: true }
    })
