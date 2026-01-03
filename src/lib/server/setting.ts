import { createServerFn } from '@tanstack/react-start'
import { db } from '@/lib/db'
import { setting } from '@/lib/db/setting-schema'
import { eq } from 'drizzle-orm'

// Get the announcement date setting
export const getAnnouncementDate = createServerFn({
    method: 'GET',
})
    .handler(async () => {
        try {
            const result = await db
                .select()
                .from(setting)
                .where(eq(setting.id, 'announcement_date'))
                .limit(1)

            if (result.length === 0) {
                // Return a default date if not set
                return {
                    id: 'announcement_date',
                    tanggalPengumuman: new Date('2026-06-01T08:00:00'),
                    exists: false,
                }
            }

            return {
                ...result[0],
                exists: true,
            }
        } catch (error) {
            console.error('Error getting announcement date:', error)
            return {
                id: 'announcement_date',
                tanggalPengumuman: new Date('2026-06-01T08:00:00'),
                exists: false,
            }
        }
    })

// Update the announcement date setting (admin only)
export const updateAnnouncementDate = createServerFn({ method: 'POST' })
    .inputValidator((d: { tanggalPengumuman: string }) => d)
    .handler(async ({ data }) => {
        try {
            const now = new Date()
            const newDate = new Date(data.tanggalPengumuman)

            // Check if setting exists
            const existing = await db
                .select()
                .from(setting)
                .where(eq(setting.id, 'announcement_date'))
                .limit(1)

            if (existing.length === 0) {
                // Insert new setting
                await db.insert(setting).values({
                    id: 'announcement_date',
                    tanggalPengumuman: newDate,
                    createdAt: now,
                    updatedAt: now,
                })
            } else {
                // Update existing setting
                await db
                    .update(setting)
                    .set({
                        tanggalPengumuman: newDate,
                        updatedAt: now,
                    })
                    .where(eq(setting.id, 'announcement_date'))
            }

            return { success: true, tanggalPengumuman: newDate }
        } catch (error) {
            console.error('Error updating announcement date:', error)
            throw new Error('Failed to update announcement date')
        }
    })

// Get the active academic year setting
export const getActiveTahunAjaran = createServerFn({
    method: 'GET',
})
    .handler(async () => {
        try {
            const result = await db
                .select()
                .from(setting)
                .where(eq(setting.id, 'tahun_ajaran_aktif'))
                .limit(1)

            if (result.length === 0) {
                return {
                    id: 'tahun_ajaran_aktif',
                    tahunAjaran: '2026/2027', // Default
                    exists: false,
                }
            }

            return {
                ...result[0],
                exists: true,
            }
        } catch (error) {
            console.error('Error getting active tahun ajaran:', error)
            return {
                id: 'tahun_ajaran_aktif',
                tahunAjaran: '2026/2027',
                exists: false,
            }
        }
    })

// Update the active academic year setting
export const updateTahunAjaran = createServerFn({ method: 'POST' })
    .inputValidator((d: { tahunAjaran: string }) => d)
    .handler(async ({ data }) => {
        try {
            const now = new Date()

            // Check if setting exists
            const existing = await db
                .select()
                .from(setting)
                .where(eq(setting.id, 'tahun_ajaran_aktif'))
                .limit(1)

            if (existing.length === 0) {
                // Insert new setting
                await db.insert(setting).values({
                    id: 'tahun_ajaran_aktif',
                    tahunAjaran: data.tahunAjaran,
                    createdAt: now,
                    updatedAt: now,
                })
            } else {
                // Update existing setting
                await db
                    .update(setting)
                    .set({
                        tahunAjaran: data.tahunAjaran,
                        updatedAt: now,
                    })
                    .where(eq(setting.id, 'tahun_ajaran_aktif'))
            }

            return { success: true, tahunAjaran: data.tahunAjaran }
        } catch (error) {
            console.error('Error updating tahun ajaran:', error)
            throw new Error('Failed to update tahun ajaran')
        }
    })

// Get all settings for the dashboard
export const getAllSettings = createServerFn({
    method: 'GET',
})
    .handler(async () => {
        const results = await db.select().from(setting)
        return results
    })
