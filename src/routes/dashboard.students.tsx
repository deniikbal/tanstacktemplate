import { createFileRoute } from '@tanstack/react-router'
import { getStudents, deleteStudent, updateStudent, importBatchStudents, bulkDeleteStudents } from '@/lib/server/students'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
    MoreHorizontal,
    Search,
    UserCog,
    Trash2,
    Upload,
    FileSpreadsheet,
    X,
    ChevronLeft,
    ChevronRight,
    GraduationCap
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import * as XLSX from 'xlsx'

export const Route = createFileRoute('/dashboard/students')({
    component: StudentsPage,
})

interface Student {
    id: string
    // Identity
    nmSiswa: string
    noDaftar: string | null
    nis: string | null
    nisn: string | null
    tempatLahir: string | null
    tanggalLahir: string | null
    jenisKelamin: string | null
    agama: string | null
    alamatSiswa: string | null
    teleponSiswa: string | null
    // Parents
    nmAyah: string | null
    nmIbu: string | null
    pekerjaanAyah: string | null
    pekerjaanIbu: string | null
    nmWali: string | null
    pekerjaanWali: string | null
    alamatOrtu: string | null
    teleponOrtu: string | null
    alamatWali: string | null
    teleponWali: string | null
    // Supplementary
    statusDalamKel: string | null
    anakKe: string | null
    sekolahAsal: string | null
    diterimaKelas: string | null
    diterimaTanggal: string | null
    noIjasahnas: string | null
    noTranskrip: string | null
    // Meta
    createdAt: Date | null
}

interface ImportStudent {
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

function StudentsPage() {
    const [studentsInfo, setStudentsInfo] = useState<{ students: Student[], total: number } | null>(null)
    const [isPending, setIsPending] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

    // Import State
    const [isImportOpen, setIsImportOpen] = useState(false)
    const [importData, setImportData] = useState<ImportStudent[]>([])
    const [isImporting, setIsImporting] = useState(false)
    const [importProgress, setImportProgress] = useState({ current: 0, total: 0, failed: 0 })
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Pagination State
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState('10')

    // Bulk Delete State
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Single Delete State
    const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)
    const [isDeleteSingleOpen, setIsDeleteSingleOpen] = useState(false)

    const fetchStudents = async () => {
        setIsPending(true)
        try {
            const data = await getStudents({
                data: {
                    limit: Number(pageSize),
                    offset: (page - 1) * Number(pageSize),
                    search: searchTerm || undefined,
                }
            })
            setStudentsInfo(data)
        } catch (error: any) {
            toast.error(error.message || 'Gagal mengambil data siswa')
        }
        setIsPending(false)
    }

    useEffect(() => {
        fetchStudents()
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStudents()
        }, 500)
        return () => clearTimeout(timer)
    }, [page, searchTerm, pageSize])

    const startDeleteStudent = (student: Student) => {
        setStudentToDelete(student)
        setIsDeleteSingleOpen(true)
    }

    const executeDeleteStudent = async () => {
        if (!studentToDelete) return

        setIsDeleting(true)
        try {
            await deleteStudent({ data: { id: studentToDelete.id } })
            toast.success('Data siswa berhasil dihapus')
            setIsDeleteSingleOpen(false)
            setStudentToDelete(null)
            fetchStudents()
        } catch (error: any) {
            toast.error(error.message || 'Gagal menghapus data siswa')
        }
        setIsDeleting(false)
    }

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return

        setIsDeleting(true)
        try {
            const result = await bulkDeleteStudents({ data: { ids: selectedIds } })
            toast.success(`${result.deleted} data siswa berhasil dihapus`)
            setSelectedIds([])
            setIsDeleteDialogOpen(false)
            fetchStudents()
        } catch (error: any) {
            toast.error(error.message || 'Gagal menghapus data siswa')
        }
        setIsDeleting(false)
    }

    const toggleSelectAll = () => {
        if (!studentsInfo) return
        if (selectedIds.length === studentsInfo.students.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(studentsInfo.students.map(s => s.id))
        }
    }

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        )
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const data = event.target?.result
                const workbook = XLSX.read(data, { type: 'binary' })
                const sheetName = workbook.SheetNames[0]
                const worksheet = workbook.Sheets[sheetName]
                const jsonData = XLSX.utils.sheet_to_json<ImportStudent>(worksheet)

                if (jsonData.length === 0) {
                    toast.error('File Excel kosong atau tidak memiliki data')
                    return
                }

                // Validate required field
                const validData = jsonData.filter(row => row.nm_siswa)
                if (validData.length === 0) {
                    toast.error('Tidak ada data dengan kolom nm_siswa yang valid')
                    return
                }

                setImportData(validData)
                setIsImportOpen(true)
            } catch (error) {
                toast.error('Gagal membaca file Excel')
                console.error(error)
            }
        }
        reader.readAsBinaryString(file)

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleImport = async () => {
        if (importData.length === 0) return

        setIsImporting(true)
        setImportProgress({ current: 0, total: importData.length, failed: 0 })

        const BATCH_SIZE = 50 // Insert 50 records at a time
        let totalImported = 0
        let totalFailed = 0

        for (let i = 0; i < importData.length; i += BATCH_SIZE) {
            const batch = importData.slice(i, i + BATCH_SIZE)
            try {
                const result = await importBatchStudents({ data: { students: batch } })
                totalImported += result.imported
                totalFailed += result.failed
            } catch (error) {
                console.error('Batch import failed:', error)
                totalFailed += batch.length
            }
            setImportProgress({
                current: Math.min(i + BATCH_SIZE, importData.length),
                total: importData.length,
                failed: totalFailed
            })
        }

        toast.success(`Berhasil import ${totalImported} dari ${importData.length} data siswa`)
        if (totalFailed > 0) {
            toast.warning(`${totalFailed} data gagal diimport`)
        }

        setIsImportOpen(false)
        setImportData([])
        setImportProgress({ current: 0, total: 0, failed: 0 })
        fetchStudents()
        setIsImporting(false)
    }

    const totalPages = Math.ceil((studentsInfo?.total || 0) / Number(pageSize))

    return (
        <div className="p-6 space-y-6">
            {/* Page Header with Icon */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                    <GraduationCap className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Data Siswa</h1>
                    <p className="text-sm text-slate-500">Kelola data peserta didik SPMB SMAN 1 BANTARUJEG</p>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <UserCog className="w-5 h-5 text-emerald-600" />
                            Daftar Peserta Didik
                        </CardTitle>
                        <CardDescription>
                            Kelola data siswa, import dari Excel, atau hapus data.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept=".xlsx,.xls"
                            className="hidden"
                        />
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Import Excel
                        </Button>
                        {selectedIds.length > 0 && (
                            <Button
                                onClick={() => setIsDeleteDialogOpen(true)}
                                variant="destructive"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Hapus ({selectedIds.length})
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Filter Bar */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-4 border-b border-slate-200 bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">Show</span>
                            <Select value={pageSize} onValueChange={(val) => {
                                setPageSize(val)
                                setPage(1)
                            }}>
                                <SelectTrigger className="w-[70px] bg-white h-8 border-slate-200 shadow-sm focus:ring-emerald-500">
                                    <SelectValue placeholder="10" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2 flex-1 md:justify-end max-w-sm">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Cari siswa..."
                                    className="pl-9 bg-white h-8 border-slate-200"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value)
                                        setPage(1)
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="border-b border-slate-200">
                                    <TableHead className="w-[50px] px-4 py-2 h-10">
                                        <Checkbox
                                            checked={!!(studentsInfo && studentsInfo.students.length > 0 && selectedIds.length === studentsInfo.students.length)}
                                            onCheckedChange={toggleSelectAll}
                                            aria-label="Select all"
                                        />
                                    </TableHead>
                                    <TableHead className="font-semibold text-slate-700 px-6 py-2 h-10">No Daftar</TableHead>
                                    <TableHead className="font-semibold text-slate-700 px-6 py-2 h-10">Nama Lengkap</TableHead>
                                    <TableHead className="font-semibold text-slate-700 px-6 py-2 h-10">NISN</TableHead>
                                    <TableHead className="font-semibold text-slate-700 px-6 py-2 h-10">Asal Sekolah</TableHead>
                                    <TableHead className="w-[70px] px-6 py-2 h-10"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isPending ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="px-4 py-2">
                                                <Skeleton className="h-4 w-4 bg-slate-200" />
                                            </TableCell>
                                            <TableCell className="px-6 py-2">
                                                <Skeleton className="h-5 w-[80px] bg-slate-200" />
                                            </TableCell>
                                            <TableCell className="px-6 py-2">
                                                <Skeleton className="h-5 w-[180px] bg-slate-200" />
                                            </TableCell>
                                            <TableCell className="px-6 py-2">
                                                <Skeleton className="h-5 w-[100px] bg-slate-200" />
                                            </TableCell>
                                            <TableCell className="px-6 py-2">
                                                <Skeleton className="h-5 w-[200px] bg-slate-200" />
                                            </TableCell>
                                            <TableCell className="px-6 py-2 text-right">
                                                <Skeleton className="ml-auto h-7 w-7 rounded-sm bg-slate-200" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : !studentsInfo || studentsInfo.students.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-slate-500 italic">
                                            Tidak ada data siswa ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    studentsInfo.students.map((s) => (
                                        <TableRow key={s.id} className={`hover:bg-slate-50/50 border-b border-slate-100 transition-colors group ${selectedIds.includes(s.id) ? 'bg-emerald-50' : ''}`}>
                                            <TableCell className="px-4 py-2">
                                                <Checkbox
                                                    checked={selectedIds.includes(s.id)}
                                                    onCheckedChange={() => toggleSelect(s.id)}
                                                    aria-label={`Select ${s.nmSiswa}`}
                                                />
                                            </TableCell>
                                            <TableCell className="text-slate-600 px-6 py-2">{s.noDaftar || '-'}</TableCell>
                                            <TableCell className="font-medium text-slate-900 px-6 py-2">{s.nmSiswa || '-'}</TableCell>
                                            <TableCell className="text-slate-600 px-6 py-2">{s.nisn || '-'}</TableCell>
                                            <TableCell className="text-slate-600 px-6 py-2">{s.sekolahAsal || '-'}</TableCell>
                                            <TableCell className="px-6 py-2">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-7 w-7 p-0 hover:bg-slate-100">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 shadow-lg border-slate-200">
                                                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => {
                                                            setSelectedStudent(s)
                                                            setIsEditOpen(true)
                                                        }}>
                                                            <UserCog className="mr-2 h-4 w-4" />
                                                            Edit Data
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                                            onClick={() => startDeleteStudent(s)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Hapus Siswa
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <div className="border-t bg-slate-50/30 px-6 py-4 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Showing {Math.min((page - 1) * Number(pageSize) + 1, studentsInfo?.total || 0)} to {Math.min(page * Number(pageSize), studentsInfo?.total || 0)} of {studentsInfo?.total || 0} entries
                    </p>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => page > 1 && setPage(p => p - 1)}
                                disabled={page === 1}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </button>

                            {(() => {
                                const pages = []
                                const showEllipsisStart = page > 3
                                const showEllipsisEnd = page < totalPages - 2

                                // Always show first page
                                pages.push(1)

                                if (showEllipsisStart) {
                                    pages.push('...')
                                }

                                // Show pages around current
                                for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
                                    if (!pages.includes(i)) {
                                        pages.push(i)
                                    }
                                }

                                if (showEllipsisEnd) {
                                    pages.push('...')
                                }

                                // Always show last page
                                if (totalPages > 1 && !pages.includes(totalPages)) {
                                    pages.push(totalPages)
                                }

                                return pages.map((p, idx) => (
                                    p === '...' ? (
                                        <span key={`ellipsis-${idx}`} className="px-2 py-1.5 text-slate-400">...</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p as number)}
                                            className={`min-w-[32px] h-8 px-3 py-1.5 text-sm rounded-md transition-colors ${page === p
                                                ? 'bg-emerald-600 text-white font-medium'
                                                : 'text-slate-600 hover:bg-slate-100'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    )
                                ))
                            })()}

                            <button
                                onClick={() => page < totalPages && setPage(p => p + 1)}
                                disabled={page === totalPages}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
            </Card>

            {/* Edit Student Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="!max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Data Siswa</DialogTitle>
                        <DialogDescription>
                            Ubah informasi data siswa. Klik tab untuk berpindah kategori.
                        </DialogDescription>
                    </DialogHeader>
                    <EditStudentForm
                        student={selectedStudent}
                        onSuccess={() => {
                            setIsEditOpen(false)
                            fetchStudents()
                        }}
                    />
                </DialogContent>
            </Dialog>

            {/* Import Preview Dialog */}
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                            Preview Import Data
                        </DialogTitle>
                        <DialogDescription>
                            {importData.length} data siswa akan diimport. Periksa data sebelum melanjutkan.
                        </DialogDescription>
                    </DialogHeader>
                    {!isImporting ? (
                        <>
                            <div className="flex-1 overflow-auto border rounded-lg">
                                <Table>
                                    <TableHeader className="bg-slate-50 sticky top-0">
                                        <TableRow>
                                            <TableHead className="font-semibold">No</TableHead>
                                            <TableHead className="font-semibold">NISN</TableHead>
                                            <TableHead className="font-semibold">Nama Siswa</TableHead>
                                            <TableHead className="font-semibold">Tempat Lahir</TableHead>
                                            <TableHead className="font-semibold">Tanggal Lahir</TableHead>
                                            <TableHead className="font-semibold">JK</TableHead>
                                            <TableHead className="font-semibold">Agama</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {importData.slice(0, 100).map((row, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="text-slate-500">{index + 1}</TableCell>
                                                <TableCell>{row.nisn || '-'}</TableCell>
                                                <TableCell className="font-medium">{row.nm_siswa}</TableCell>
                                                <TableCell>{row.tempat_lahir || '-'}</TableCell>
                                                <TableCell>{row.tanggal_lahir || '-'}</TableCell>
                                                <TableCell>{row.jenis_kelamin || '-'}</TableCell>
                                                <TableCell>{row.agama || '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {importData.length > 100 && (
                                    <div className="p-3 text-center text-sm text-slate-500 bg-slate-50 border-t">
                                        ...dan {importData.length - 100} data lainnya
                                    </div>
                                )}
                            </div>
                            <DialogFooter className="gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsImportOpen(false)
                                        setImportData([])
                                    }}
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Batal
                                </Button>
                                <Button
                                    onClick={handleImport}
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Import {importData.length} Data
                                </Button>
                            </DialogFooter>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center py-12 space-y-6">
                            <div className="text-center space-y-2">
                                <FileSpreadsheet className="h-12 w-12 text-emerald-600 mx-auto animate-pulse" />
                                <h3 className="text-lg font-semibold text-slate-900">Mengimport Data Siswa...</h3>
                                <p className="text-sm text-slate-500">
                                    {importProgress.current} dari {importProgress.total} data
                                    {importProgress.failed > 0 && (
                                        <span className="text-red-500"> ({importProgress.failed} gagal)</span>
                                    )}
                                </p>
                            </div>
                            <div className="w-full max-w-md space-y-2">
                                <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-600 transition-all duration-300 ease-out"
                                        style={{ width: `${importProgress.total > 0 ? (importProgress.current / importProgress.total) * 100 : 0}%` }}
                                    />
                                </div>
                                <p className="text-center text-xl font-bold text-emerald-600">
                                    {importProgress.total > 0 ? Math.round((importProgress.current / importProgress.total) * 100) : 0}%
                                </p>
                            </div>
                            <p className="text-xs text-slate-400">
                                Mohon tunggu, jangan tutup halaman ini
                            </p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Single Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteSingleOpen} onOpenChange={setIsDeleteSingleOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Data Siswa?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus data siswa <span className="font-semibold text-slate-900">{studentToDelete?.nmSiswa}</span>?
                            <br />
                            Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                executeDeleteStudent()
                            }}
                            disabled={isDeleting}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Menghapus...' : 'Hapus'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus {selectedIds.length} Data Siswa?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus {selectedIds.length} data siswa yang dipilih?
                            Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Menghapus...' : 'Hapus'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    )
}

function EditStudentForm({ student, onSuccess }: { student: Student | null, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!student) return
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        try {
            await updateStudent({
                data: {
                    id: student.id,
                    // Identity
                    nmSiswa: formData.get('nmSiswa') as string,
                    nis: formData.get('nis') as string || null,
                    nisn: formData.get('nisn') as string || null,
                    tempatLahir: formData.get('tempatLahir') as string || null,
                    tanggalLahir: formData.get('tanggalLahir') as string || null,
                    jenisKelamin: formData.get('jenisKelamin') as string || null,
                    agama: formData.get('agama') as string || null,
                    alamatSiswa: formData.get('alamatSiswa') as string || null,
                    teleponSiswa: formData.get('teleponSiswa') as string || null,
                    // Parents
                    nmAyah: formData.get('nmAyah') as string || null,
                    nmIbu: formData.get('nmIbu') as string || null,
                    pekerjaanAyah: formData.get('pekerjaanAyah') as string || null,
                    pekerjaanIbu: formData.get('pekerjaanIbu') as string || null,
                    nmWali: formData.get('nmWali') as string || null,
                    pekerjaanWali: formData.get('pekerjaanWali') as string || null,
                    alamatOrtu: formData.get('alamatOrtu') as string || null,
                    teleponOrtu: formData.get('teleponOrtu') as string || null,
                    alamatWali: formData.get('alamatWali') as string || null,
                    teleponWali: formData.get('teleponWali') as string || null,
                    // Supplementary
                    statusDalamKel: formData.get('statusDalamKel') as string || null,
                    anakKe: formData.get('anakKe') as string || null,
                    sekolahAsal: formData.get('sekolahAsal') as string || null,
                    diterimaKelas: formData.get('diterimaKelas') as string || null,
                    diterimaTanggal: formData.get('diterimaTanggal') as string || null,
                    noIjasahnas: formData.get('noIjasahnas') as string || null,
                    noTranskrip: formData.get('noTranskrip') as string || null,
                }
            })
            toast.success('Data siswa berhasil diperbarui')
            onSuccess()
        } catch (error: any) {
            toast.error(error.message || 'Gagal memperbarui data siswa')
        }
        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <Tabs defaultValue="identity" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-emerald-50 p-1">
                    <TabsTrigger value="identity" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Identitas Siswa</TabsTrigger>
                    <TabsTrigger value="parents" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Orang Tua/Wali</TabsTrigger>
                    <TabsTrigger value="supplementary" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Kelengkapan</TabsTrigger>
                </TabsList>

                {/* Tab Identitas Siswa */}
                <TabsContent value="identity" forceMount className="space-y-3 mt-3 data-[state=inactive]:hidden">
                    <div className="grid grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="edit-nmSiswa" className="text-xs">Nama Lengkap *</Label>
                            <Input id="edit-nmSiswa" name="nmSiswa" defaultValue={student?.nmSiswa} required className="h-8" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="edit-nis" className="text-xs">NIS</Label>
                            <Input id="edit-nis" name="nis" defaultValue={student?.nis || ''} className="h-8" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="edit-nisn" className="text-xs">NISN</Label>
                            <Input id="edit-nisn" name="nisn" defaultValue={student?.nisn || ''} className="h-8" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="edit-jenisKelamin" className="text-xs">Jenis Kelamin</Label>
                            <Select name="jenisKelamin" defaultValue={student?.jenisKelamin || ''}>
                                <SelectTrigger id="edit-jenisKelamin" className="w-full h-8">
                                    <SelectValue placeholder="Pilih L/P" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="L">Laki-laki</SelectItem>
                                    <SelectItem value="P">Perempuan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="edit-tempatLahir" className="text-xs">Tempat Lahir</Label>
                            <Input id="edit-tempatLahir" name="tempatLahir" defaultValue={student?.tempatLahir || ''} className="h-8" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="edit-tanggalLahir" className="text-xs">Tanggal Lahir</Label>
                            <Input id="edit-tanggalLahir" name="tanggalLahir" type="date" defaultValue={student?.tanggalLahir || ''} className="h-8" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="edit-agama" className="text-xs">Agama</Label>
                            <Select name="agama" defaultValue={student?.agama || ''}>
                                <SelectTrigger id="edit-agama" className="w-full h-8">
                                    <SelectValue placeholder="Pilih Agama" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Islam">Islam</SelectItem>
                                    <SelectItem value="Kristen">Kristen</SelectItem>
                                    <SelectItem value="Katolik">Katolik</SelectItem>
                                    <SelectItem value="Hindu">Hindu</SelectItem>
                                    <SelectItem value="Buddha">Buddha</SelectItem>
                                    <SelectItem value="Konghucu">Konghucu</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="edit-teleponSiswa" className="text-xs">Telepon Siswa</Label>
                            <Input id="edit-teleponSiswa" name="teleponSiswa" defaultValue={student?.teleponSiswa || ''} className="h-8" />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                        <div className="col-span-2 space-y-1">
                            <Label htmlFor="edit-alamatSiswa" className="text-xs">Alamat Siswa</Label>
                            <textarea
                                id="edit-alamatSiswa"
                                name="alamatSiswa"
                                defaultValue={student?.alamatSiswa || ''}
                                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                rows={2}
                            />
                        </div>
                    </div>
                </TabsContent>

                {/* Tab Orang Tua/Wali */}
                <TabsContent value="parents" forceMount className="space-y-3 mt-3 data-[state=inactive]:hidden">
                    <div className="border-b pb-1 mb-1">
                        <h4 className="font-medium text-xs text-slate-700">Data Orang Tua</h4>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="edit-nmAyah" className="text-xs">Nama Ayah</Label>
                            <Input id="edit-nmAyah" name="nmAyah" defaultValue={student?.nmAyah || ''} className="h-8" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="edit-pekerjaanAyah" className="text-xs">Pekerjaan Ayah</Label>
                            <Input id="edit-pekerjaanAyah" name="pekerjaanAyah" defaultValue={student?.pekerjaanAyah || ''} className="h-8" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="edit-nmIbu" className="text-xs">Nama Ibu</Label>
                            <Input id="edit-nmIbu" name="nmIbu" defaultValue={student?.nmIbu || ''} className="h-8" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="edit-pekerjaanIbu" className="text-xs">Pekerjaan Ibu</Label>
                            <Input id="edit-pekerjaanIbu" name="pekerjaanIbu" defaultValue={student?.pekerjaanIbu || ''} className="h-8" />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                        <div className="col-span-2 space-y-1">
                            <Label htmlFor="edit-alamatOrtu" className="text-xs">Alamat Orang Tua</Label>
                            <textarea
                                id="edit-alamatOrtu"
                                name="alamatOrtu"
                                defaultValue={student?.alamatOrtu || ''}
                                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                rows={2}
                            />
                        </div>
                        <div className="col-span-1 space-y-1">
                            <Label htmlFor="edit-teleponOrtu" className="text-xs">Telepon Orang Tua</Label>
                            <Input id="edit-teleponOrtu" name="teleponOrtu" defaultValue={student?.teleponOrtu || ''} className="h-8" />
                        </div>
                    </div>

                    <div className="border-b pb-1 mb-1 mt-2">
                        <h4 className="font-medium text-xs text-slate-700">Data Wali</h4>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="edit-nmWali" className="text-xs">Nama Wali</Label>
                            <Input id="edit-nmWali" name="nmWali" defaultValue={student?.nmWali || ''} className="h-8" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="edit-pekerjaanWali" className="text-xs">Pekerjaan Wali</Label>
                            <Input id="edit-pekerjaanWali" name="pekerjaanWali" defaultValue={student?.pekerjaanWali || ''} className="h-8" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="edit-teleponWali" className="text-xs">Telepon Wali</Label>
                            <Input id="edit-teleponWali" name="teleponWali" defaultValue={student?.teleponWali || ''} className="h-8" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="edit-alamatWali" className="text-xs">Alamat Wali</Label>
                            <Input id="edit-alamatWali" name="alamatWali" defaultValue={student?.alamatWali || ''} className="h-8" />
                        </div>
                    </div>
                </TabsContent>

                {/* Tab Kelengkapan */}
                <TabsContent value="supplementary" forceMount className="space-y-3 mt-3 data-[state=inactive]:hidden">
                    <div className="grid grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="edit-sekolahAsal" className="text-xs">Sekolah Asal</Label>
                            <Input id="edit-sekolahAsal" name="sekolahAsal" defaultValue={student?.sekolahAsal || ''} className="h-8" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="edit-diterimaKelas" className="text-xs">Diterima Kelas</Label>
                            <Input id="edit-diterimaKelas" name="diterimaKelas" defaultValue={student?.diterimaKelas || ''} className="h-8" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="edit-diterimaTanggal" className="text-xs">Tanggal Diterima</Label>
                            <Input id="edit-diterimaTanggal" name="diterimaTanggal" type="date" defaultValue={student?.diterimaTanggal || ''} className="h-8" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="edit-statusDalamKel" className="text-xs">Status Keluarga</Label>
                            <Select name="statusDalamKel" defaultValue={student?.statusDalamKel || ''}>
                                <SelectTrigger id="edit-statusDalamKel" className="w-full h-8">
                                    <SelectValue placeholder="Pilih Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Anak Kandung">Anak Kandung</SelectItem>
                                    <SelectItem value="Anak Angkat">Anak Angkat</SelectItem>
                                    <SelectItem value="Anak Tiri">Anak Tiri</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="edit-anakKe" className="text-xs">Anak Ke-</Label>
                            <Input id="edit-anakKe" name="anakKe" defaultValue={student?.anakKe || ''} className="h-8" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="edit-noIjasahnas" className="text-xs">No. Ijazah Nasional</Label>
                            <Input id="edit-noIjasahnas" name="noIjasahnas" defaultValue={student?.noIjasahnas || ''} className="h-8" />
                        </div>
                        <div className="col-span-2 space-y-1">
                            <Label htmlFor="edit-noTranskrip" className="text-xs">No. Transkrip</Label>
                            <Input id="edit-noTranskrip" name="noTranskrip" defaultValue={student?.noTranskrip || ''} className="h-8" />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            <DialogFooter className="mt-4">
                <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 h-9">
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
            </DialogFooter>
        </form>
    )
}

