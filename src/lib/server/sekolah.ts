import { createServerFn } from '@tanstack/react-start'
import { db } from '@/lib/db'
import { sekolah } from '@/lib/db/sekolah-schema'
import { eq, ilike, sql, or, asc, and } from 'drizzle-orm'

export const getSekolahList = createServerFn({
    method: 'GET',
})
    .inputValidator((d: { limit?: number; offset?: number; search?: string, bentuk?: string, status?: string }) => d)
    .handler(async ({ data }) => {
        const { limit = 10, offset = 0, search, bentuk, status } = data

        const filters = []

        if (search) {
            filters.push(or(
                ilike(sekolah.sekolah, `%${search}%`),
                ilike(sekolah.npsn, `%${search}%`),
                ilike(sekolah.kecamatan, `%${search}%`)
            ))
        }

        if (bentuk && bentuk !== 'semua') {
            filters.push(eq(sekolah.bentuk, bentuk))
        }

        if (status && status !== 'semua') {
            filters.push(eq(sekolah.status, status))
        }

        const whereClause = filters.length > 0 ? and(...filters) : undefined

        const sekolahData = await db
            .select()
            .from(sekolah)
            .where(whereClause)
            .limit(limit)
            .offset(offset)
            .orderBy(asc(sekolah.sekolah))

        const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(sekolah)
            .where(whereClause)

        return {
            sekolah: sekolahData,
            total: Number(countResult[0]?.count || 0),
        }
    })


export const deleteSekolah = createServerFn({ method: 'POST' })
    .inputValidator((d: { id: string }) => d)
    .handler(async ({ data }) => {
        await db.delete(sekolah).where(eq(sekolah.id, data.id))
        return { success: true }
    })

interface SekolahData {
    id?: string
    kode_prop?: string | null
    propinsi?: string | null
    kode_kab_kota?: string | null
    kabupaten_kota?: string | null
    kode_kec?: string | null
    kecamatan?: string | null
    npsn?: string | null
    sekolah: string
    bentuk?: string | null
    status?: string | null
    alamat_jalan?: string | null
    lintang?: string | null
    bujur?: string | null
}

export const saveSekolah = createServerFn({ method: 'POST' })
    .inputValidator((d: SekolahData) => d)
    .handler(async ({ data }) => {
        const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
            acc[key] = (value === '' ? null : value)
            return acc
        }, {} as any)

        if (!cleanData.sekolah) {
            throw new Error('Nama Sekolah tidak boleh kosong')
        }

        try {
            if (cleanData.id) {
                // Update
                await db
                    .update(sekolah)
                    .set(cleanData)
                    .where(eq(sekolah.id, cleanData.id))
            } else {
                // Create
                await db.insert(sekolah).values({
                    ...cleanData,
                    id: crypto.randomUUID(),
                })
            }
            return { success: true }
        } catch (error: any) {
            console.error('Database operation failed:', error)
            throw new Error(`Gagal menyimpan data: ${error.message}`)
        }
    })
