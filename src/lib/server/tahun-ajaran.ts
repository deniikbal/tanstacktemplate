import { createServerFn } from '@tanstack/react-start'
import { db } from '@/lib/db'
import { tahunAjaran } from '@/lib/db/tahun-ajaran-schema'
import { eq, desc } from 'drizzle-orm'

// Get all tahun ajaran
export const getAllTahunAjaran = createServerFn({
    method: 'GET',
})
    .handler(async () => {
        const results = await db
            .select()
            .from(tahunAjaran)
            .orderBy(desc(tahunAjaran.tahun))
        return results
    })

// Get active tahun ajaran
export const getActiveTahunAjaran = createServerFn({
    method: 'GET',
})
    .handler(async () => {
        const result = await db
            .select()
            .from(tahunAjaran)
            .where(eq(tahunAjaran.isAktif, true))
            .limit(1)

        if (result.length === 0) {
            return null
        }

        return result[0]
    })

// Create new tahun ajaran
export const createTahunAjaran = createServerFn({ method: 'POST' })
    .inputValidator((d: { tahun: string; tanggalPengumuman?: string }) => d)
    .handler(async ({ data }) => {
        const now = new Date()
        const id = crypto.randomUUID()

        await db.insert(tahunAjaran).values({
            id,
            tahun: data.tahun,
            tanggalPengumuman: data.tanggalPengumuman ? new Date(data.tanggalPengumuman) : null,
            isAktif: false,
            createdAt: now,
            updatedAt: now,
        })

        return { success: true, id }
    })

// Update tahun ajaran
export const updateTahunAjaran = createServerFn({ method: 'POST' })
    .inputValidator((d: { id: string; tahun?: string; tanggalPengumuman?: string | null }) => d)
    .handler(async ({ data }) => {
        const now = new Date()

        const updateData: any = { updatedAt: now }
        if (data.tahun !== undefined) updateData.tahun = data.tahun
        if (data.tanggalPengumuman !== undefined) {
            updateData.tanggalPengumuman = data.tanggalPengumuman ? new Date(data.tanggalPengumuman) : null
        }

        await db
            .update(tahunAjaran)
            .set(updateData)
            .where(eq(tahunAjaran.id, data.id))

        return { success: true }
    })

// Set tahun ajaran as active (deactivate others)
export const setActiveTahunAjaran = createServerFn({ method: 'POST' })
    .inputValidator((d: { id: string }) => d)
    .handler(async ({ data }) => {
        const now = new Date()

        // First, deactivate all
        await db
            .update(tahunAjaran)
            .set({ isAktif: false, updatedAt: now })

        // Then activate the selected one
        await db
            .update(tahunAjaran)
            .set({ isAktif: true, updatedAt: now })
            .where(eq(tahunAjaran.id, data.id))

        return { success: true }
    })

// Delete tahun ajaran
export const deleteTahunAjaran = createServerFn({ method: 'POST' })
    .inputValidator((d: { id: string }) => d)
    .handler(async ({ data }) => {
        await db.delete(tahunAjaran).where(eq(tahunAjaran.id, data.id))
        return { success: true }
    })

// Get tahun ajaran options for dropdown (just the tahun values)
export const getTahunAjaranOptions = createServerFn({
    method: 'GET',
})
    .handler(async () => {
        const results = await db
            .select({ tahun: tahunAjaran.tahun })
            .from(tahunAjaran)
            .orderBy(desc(tahunAjaran.tahun))

        return results.map(r => r.tahun)
    })
