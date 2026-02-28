import { createServerFn } from '@tanstack/react-start'
import { db } from '@/lib/db'
import { jadwalSpmb } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

// Get All Jadwal
export const getJadwalSpmbList = createServerFn({ method: "GET" }).handler(async () => {
    try {
        const jadwal = await db
            .select()
            .from(jadwalSpmb)
            .orderBy(desc(jadwalSpmb.startDate))
        return jadwal
    } catch (error: any) {
        throw new Error(error.message || 'Gagal mengambil data jadwal')
    }
})

// Types for Create/Update
type JadwalInput = {
    title: string
    startDate: string | Date
    endDate: string | Date
    timeDetails?: string | null
    tahap?: string | null
    status?: string | null
}

type JadwalUpdateInput = JadwalInput & {
    id: string
}

// Create Jadwal
export const createJadwalSpmb = createServerFn({ method: "POST" })
    .inputValidator((data: JadwalInput) => data)
    .handler(async ({ data }) => {
        try {
            const startDate = new Date(data.startDate)
            const endDate = new Date(data.endDate)
            const id = crypto.randomUUID()

            await db.insert(jadwalSpmb).values({
                id,
                title: data.title,
                startDate: startDate,
                endDate: endDate,
                timeDetails: data.timeDetails || null,
                tahap: data.tahap || null,
                status: data.status || 'Akan Datang',
            })
            return { success: true, id }
        } catch (error: any) {
            console.error('Create jadwal error:', error)
            throw new Error(error.message || 'Gagal membuat jadwal baru')
        }
    })

// Update Jadwal
export const updateJadwalSpmb = createServerFn({ method: "POST" })
    .inputValidator((data: JadwalUpdateInput) => data)
    .handler(async ({ data }) => {
        try {
            const startDate = new Date(data.startDate)
            const endDate = new Date(data.endDate)

            await db.update(jadwalSpmb)
                .set({
                    title: data.title,
                    startDate: startDate,
                    endDate: endDate,
                    timeDetails: data.timeDetails || null,
                    tahap: data.tahap || null,
                    status: data.status || 'Akan Datang',
                    updatedAt: new Date(),
                })
                .where(eq(jadwalSpmb.id, data.id))
            return { success: true }
        } catch (error: any) {
            console.error('Update jadwal error:', error)
            throw new Error(error.message || 'Gagal mengubah jadwal')
        }
    })

// Delete Jadwal
export const deleteJadwalSpmb = createServerFn({ method: "POST" })
    .inputValidator((data: { id: string }) => data)
    .handler(async ({ data }) => {
        try {
            await db.delete(jadwalSpmb).where(eq(jadwalSpmb.id, data.id))
            return { success: true }
        } catch (error: any) {
            console.error('Delete jadwal error:', error)
            throw new Error(error.message || 'Gagal menghapus jadwal')
        }
    })
