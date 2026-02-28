import { createServerFn } from '@tanstack/react-start'
import { db } from '@/lib/db'
import { activityReport } from '@/lib/db/activity-report-schema'
import { eq, and, desc } from 'drizzle-orm'

export const SCHEDULE = [
    {
        hari: 'Selasa',
        jadwal: [
            { jamKe: [1, 2], waktu: '06.30-07.30', kegiatan: 'Shalat Duha, Poe Ibu, Tadarrus' },
            { jamKe: [3, 4], waktu: '07.30-08.30', kegiatan: 'Senam Anak Indonesia Hebat' },
            { jamKe: [5, 6], waktu: '08.30-09.30', kegiatan: 'Tatacara Wudhu/Shalat' },
            { jamKe: [7, 8], waktu: '10.00-11.00', kegiatan: 'Hafalan Surat-surat Pendek Juz 30' },
            { jamKe: [9, 10], waktu: '11.00-12.00', kegiatan: 'Ekologi: Merawat Lingkungan Sekitar (Mengelola Sampah)' },
        ]
    },
    {
        hari: 'Rabu',
        jadwal: [
            { jamKe: [1, 2], waktu: '06.30-07.30', kegiatan: 'Shalat Duha, Poe Ibu, Tadarrus' },
            { jamKe: [3, 4], waktu: '07.30-08.30', kegiatan: 'Akhlak Kepada Orang Tua' },
            { jamKe: [5, 6], waktu: '08.30-09.30', kegiatan: 'Sejarah Orang-orang Saleh' },
            { jamKe: [7, 8], waktu: '10.00-11.00', kegiatan: 'Hafalan Doa-doa Harian' },
            { jamKe: [9, 10], waktu: '11.00-12.00', kegiatan: 'Ekologi: Menanam Pohon (Bambu Haur Kuning)' },
        ]
    },
    {
        hari: 'Kamis',
        jadwal: [
            { jamKe: [1, 2], waktu: '06.30-07.30', kegiatan: 'Shalat Duha, Poe Ibu, Tadarrus' },
            { jamKe: [3, 4], waktu: '07.30-08.30', kegiatan: 'Akhlaq Kepada Guru' },
            { jamKe: [5, 6], waktu: '08.30-09.30', kegiatan: 'Makna Iman, Islam, Ihsan' },
            { jamKe: [7, 8], waktu: '10.00-11.00', kegiatan: 'Hafalan Asmaul Husna' },
            { jamKe: [9, 10], waktu: '11.00-12.00', kegiatan: 'Ekologi: Merawat Lingkungan (Membuat Poster Kampanye Hemat Energi)' },
        ]
    },
    {
        hari: 'Jumat',
        jadwal: [
            { jamKe: [1, 2], waktu: '06.30-07.30', kegiatan: 'Shalat Duha, Poe Ibu, Tadarrus' },
            { jamKe: [3, 4], waktu: '07.30-08.30', kegiatan: 'Akhlak Kepada Sesama Manusia/Makhluk' },
            { jamKe: [5, 6], waktu: '08.30-09.30', kegiatan: 'Pembinaan Wali Kelas/ Rantang Kanyaah' },
        ]
    }
]

export const submitActivityReport = createServerFn({ method: 'POST' })
    .inputValidator((d: {
        studentId: string,
        tanggal: string,
        hari: string,
        reports: {
            jamKe: number,
            waktu: string,
            kegiatan: string,
            guruMasuk: string,
            isAbsent: boolean,
            notes?: string
        }[]
    }) => d)
    .handler(async ({ data }) => {
        const { studentId, tanggal, hari, reports } = data

        const inserts = reports.map(r => ({
            id: crypto.randomUUID(),
            studentId,
            tanggal,
            hari,
            jamKe: r.jamKe,
            waktu: r.waktu,
            kegiatan: r.kegiatan,
            guruMasuk: r.guruMasuk,
            isAbsent: r.isAbsent,
            notes: r.notes,
        }))

        // Optional: delete existing reports for the day if re-submitting
        const reportTable = (await import('@/lib/db/activity-report-schema')).activityReport
        await db.delete(reportTable).where(and(
            eq(reportTable.studentId, studentId),
            eq(reportTable.tanggal, tanggal)
        ))

        await db.insert(reportTable).values(inserts)

        return { success: true }
    })

export const getActivityReports = createServerFn({ method: 'GET' })
    .handler(async () => {
        return await db.query.activityReport.findMany({
            with: {
                student: true
            },
            orderBy: [desc(activityReport.createdAt)]
        })
    })

export const getStudentReportsForToday = createServerFn({ method: 'POST' })
    .inputValidator((d: { studentId: string, tanggal: string }) => d)
    .handler(async ({ data }) => {
        const { studentId, tanggal } = data
        return await db.query.activityReport.findMany({
            where: and(
                eq(activityReport.studentId, studentId),
                eq(activityReport.tanggal, tanggal)
            )
        })
    })
