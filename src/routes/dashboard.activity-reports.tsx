import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ClipboardList, User, Calendar, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getActivityReports } from '@/lib/server/activity-report'

export const Route = createFileRoute('/dashboard/activity-reports')({
    component: AdminActivityReports,
})

function AdminActivityReports() {
    const [reports, setReports] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await getActivityReports()
                setReports(data)
            } catch (error) {
                console.error('Failed to fetch reports:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchReports()
    }, [])

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Rekap Laporan Kegiatan</h1>
                <p className="text-slate-500 text-sm font-medium">Monitoring kehadiran guru dan kegiatan harian siswa.</p>
            </div>

            <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <ClipboardList className="w-5 h-5 text-blue-600" />
                                Daftar Laporan
                            </CardTitle>
                            <CardDescription>Seluruh laporan yang masuk dari siswa reporter.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-12 text-center">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
                            <p className="text-slate-500 text-xs font-medium">Sedang memuat data...</p>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="p-12 text-center">
                            <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                            <p className="text-slate-500 text-xs font-medium">Belum ada laporan yang masuk.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="text-[11px] font-black uppercase text-slate-500 px-4">Tanggal / Hari</TableHead>
                                        <TableHead className="text-[11px] font-black uppercase text-slate-500 px-4">Siswa</TableHead>
                                        <TableHead className="text-[11px] font-black uppercase text-slate-500 px-4">Jam / Kegiatan</TableHead>
                                        <TableHead className="text-[11px] font-black uppercase text-slate-500 px-4">Guru Masuk</TableHead>
                                        <TableHead className="text-[11px] font-black uppercase text-slate-500 px-4">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reports.map((report) => (
                                        <TableRow key={report.id} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-900">{report.tanggal}</span>
                                                        <span className="text-[10px] text-slate-500 font-medium">{report.hari}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-3.5 h-3.5 text-blue-500" />
                                                    <span className="text-xs font-medium text-slate-700">{report.student?.nmSiswa}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="w-3 h-3 text-slate-400" />
                                                        <span className="text-[11px] font-bold text-slate-900">Jam {report.jamKe} ({report.waktu})</span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 leading-normal max-w-[200px]">{report.kegiatan}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <span className={`text-xs font-bold ${report.isAbsent ? 'text-red-600 italic' : 'text-slate-900'}`}>
                                                    {report.guruMasuk}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <Badge variant={report.isAbsent ? 'destructive' : 'outline'} className="text-[9px] font-black px-1.5 py-0 rounded-md">
                                                    {report.isAbsent ? 'TIDAK MASUK' : 'MASUK'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
