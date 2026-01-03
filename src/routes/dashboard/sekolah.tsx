import { createFileRoute } from '@tanstack/react-router'
import { getSekolahList, saveSekolah, deleteSekolah } from '@/lib/server/sekolah'
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
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
    Plus,
    Search,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Building2,
    MoreHorizontal,
    Pencil
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from 'react'
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Filter } from "lucide-react"

export const Route = createFileRoute('/dashboard/sekolah')({
    component: SekolahManagement,
})

function SekolahManagement() {
    const [searchTerm, setSearchTerm] = useState('')
    const [bentukFilter, setBentukFilter] = useState('semua')
    const [statusFilter, setStatusFilter] = useState('semua')
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState('10')

    const [data, setData] = useState<{ sekolah: any[], total: number }>({ sekolah: [], total: 0 })
    const [loading, setLoading] = useState(true)

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingSekolah, setEditingSekolah] = useState<any>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const fetchSekolah = async () => {
        setLoading(true)
        try {
            const result = await getSekolahList({
                data: {
                    limit: Number(pageSize),
                    offset: (page - 1) * Number(pageSize),
                    search: searchTerm,
                    bentuk: bentukFilter,
                    status: statusFilter
                }
            })
            setData(result)
        } catch (error) {
            toast.error('Gagal mengambil data sekolah')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const timeoutId = setTimeout(fetchSekolah, 500)
        return () => clearTimeout(timeoutId)
    }, [searchTerm, page, pageSize, bentukFilter, statusFilter])

    // Reset page on filter change
    useEffect(() => {
        setPage(1)
    }, [searchTerm, bentukFilter, statusFilter, pageSize])

    const handleDelete = async () => {
        if (!deletingId) return
        try {
            await deleteSekolah({ data: { id: deletingId } })
            toast.success('Sekolah berhasil dihapus')
            fetchSekolah()
        } catch (error) {
            toast.error('Gagal menghapus sekolah')
        } finally {
            setIsDeleteDialogOpen(false)
            setDeletingId(null)
        }
    }

    const totalPages = Math.ceil(data.total / Number(pageSize))

    return (
        <div className="p-6 space-y-6">
            {/* Page Header with Icon */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                    <Building2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Data Sekolah</h1>
                    <p className="text-sm text-slate-500">Kelola database sekolah asal pendaftar</p>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-emerald-600" />
                            Daftar Sekolah
                        </CardTitle>
                        <CardDescription>
                            Database sekolah SMP/MTS untuk referensi pendaftaran.
                        </CardDescription>
                    </div>
                    <Button onClick={() => { setEditingSekolah(null); setIsDialogOpen(true) }} className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Filter Bar */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-4 border-b border-slate-200 bg-slate-50/50">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Cari sekolah, NPSN, atau kecamatan..."
                                className="pl-9 bg-white h-9 border-slate-200"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 items-center">
                            <Filter className="h-4 w-4 text-slate-400" />
                            <Select value={bentukFilter} onValueChange={setBentukFilter}>
                                <SelectTrigger className="w-[130px] h-9 bg-white border-slate-200">
                                    <SelectValue placeholder="Bentuk" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="semua">Semua Jenjang</SelectItem>
                                    <SelectItem value="SMP">SMP</SelectItem>
                                    <SelectItem value="MTS">MTS</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[130px] h-9 bg-white border-slate-200">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="semua">Semua Status</SelectItem>
                                    <SelectItem value="N">Negeri</SelectItem>
                                    <SelectItem value="S">Swasta</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead className="w-[300px] px-4 font-semibold text-slate-700">Nama Sekolah</TableHead>
                                    <TableHead className="px-4 font-semibold text-slate-700">NPSN</TableHead>
                                    <TableHead className="px-4 font-semibold text-slate-700">Bentuk</TableHead>
                                    <TableHead className="px-4 font-semibold text-slate-700">Kecamatan</TableHead>
                                    <TableHead className="px-4 font-semibold text-slate-700">Status</TableHead>
                                    <TableHead className="text-right px-4 font-semibold text-slate-700">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-600" />
                                        </TableCell>
                                    </TableRow>
                                ) : data.sekolah.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            Data tidak ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.sekolah.map((item) => (
                                        <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="font-medium px-4">{item.sekolah}</TableCell>
                                            <TableCell className="px-4">{item.npsn || '-'}</TableCell>
                                            <TableCell className="px-4">{item.bentuk || '-'}</TableCell>
                                            <TableCell className="px-4">{item.kecamatan || '-'}</TableCell>
                                            <TableCell className="px-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${item.status === 'N' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                                                    {item.status === 'N' ? 'Negeri' : 'Swasta'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right px-4">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => { setEditingSekolah(item); setIsDialogOpen(true) }}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit Data
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                                            onClick={() => { setDeletingId(item.id); setIsDeleteDialogOpen(true) }}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Hapus Data
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

                    {data.total > 0 && (
                        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/30">
                            <div className="flex items-center gap-4">
                                <div className="text-sm text-slate-500">
                                    Menampilkan <span className="font-medium text-slate-900">{Math.min(data.total, (page - 1) * Number(pageSize) + 1)}</span>
                                    {' '}- <span className="font-medium text-slate-900">{Math.min(data.total, page * Number(pageSize))}</span>
                                    {' '}dari <span className="font-medium text-slate-900">{data.total}</span> data
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-400 font-medium">Baris:</span>
                                    <select
                                        value={pageSize}
                                        onChange={(e) => {
                                            setPageSize(e.target.value)
                                            setPage(1)
                                        }}
                                        className="text-xs border border-slate-200 rounded px-1 py-0.5 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    >
                                        <option value="10">10</option>
                                        <option value="25">25</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                    </select>
                                </div>
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => page > 1 && setPage(p => p - 1)}
                                        disabled={page === 1}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Sebelumnya
                                    </button>

                                    {(() => {
                                        const pages = []
                                        const showEllipsisStart = page > 3
                                        const showEllipsisEnd = page < totalPages - 2

                                        pages.push(1)
                                        if (showEllipsisStart) pages.push('...')
                                        for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
                                            if (!pages.includes(i)) pages.push(i)
                                        }
                                        if (showEllipsisEnd) pages.push('...')
                                        if (totalPages > 1 && !pages.includes(totalPages)) pages.push(totalPages)

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
                                        Selanjutnya
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <SekolahDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                initialData={editingSekolah}
                onSuccess={() => { fetchSekolah(); setIsDialogOpen(false) }}
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Sekolah?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Data sekolah akan dihapus secara permanen dari database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

function SekolahDialog({ open, onOpenChange, initialData, onSuccess }: {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialData?: any
    onSuccess: () => void
}) {
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        try {
            await saveSekolah({
                data: {
                    id: initialData?.id,
                    sekolah: formData.get('sekolah') as string,
                    npsn: formData.get('npsn') as string,
                    bentuk: formData.get('bentuk') as string,
                    status: formData.get('status') as string,
                    kecamatan: formData.get('kecamatan') as string,
                    kabupaten_kota: formData.get('kabupaten_kota') as string,
                    propinsi: formData.get('propinsi') as string,
                    alamat_jalan: formData.get('alamat_jalan') as string,
                }
            })
            toast.success(initialData ? 'Sekolah berhasil diperbarui' : 'Sekolah berhasil ditambah')
            onSuccess()
        } catch (error: any) {
            toast.error(error.message || 'Gagal menyimpan data sekolah')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Data Sekolah' : 'Tambah Sekolah Baru'}</DialogTitle>
                    <DialogDescription>
                        Lengkapi informasi sekolah di bawah ini. Info bertanda * wajib diisi.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="sekolah">Nama Sekolah *</Label>
                            <Input id="sekolah" name="sekolah" defaultValue={initialData?.sekolah} required placeholder="Contoh: SMP NEGERI 1 BANTARUJEG" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="npsn">NPSN</Label>
                            <Input id="npsn" name="npsn" defaultValue={initialData?.npsn} placeholder="Masukkan NPSN" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bentuk">Bentuk Sekolah (SMP/MTS/dll)</Label>
                            <Input id="bentuk" name="bentuk" defaultValue={initialData?.bentuk} placeholder="Contoh: SMP" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Status (N=Negeri, S=Swasta)</Label>
                            <Input id="status" name="status" defaultValue={initialData?.status} placeholder="N atau S" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="kecamatan">Kecamatan</Label>
                            <Input id="kecamatan" name="kecamatan" defaultValue={initialData?.kecamatan} placeholder="Masukkan Kecamatan" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="kabupaten_kota">Kabupaten/Kota</Label>
                            <Input id="kabupaten_kota" name="kabupaten_kota" defaultValue={initialData?.kabupaten_kota || 'KAB. MAJALENGKA'} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="propinsi">Provinsi</Label>
                            <Input id="propinsi" name="propinsi" defaultValue={initialData?.propinsi || 'PROV. JAWA BARAT'} />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="alamat_jalan">Alamat Jalan</Label>
                            <Input id="alamat_jalan" name="alamat_jalan" defaultValue={initialData?.alamat_jalan} placeholder="Jl. Raya..." />
                        </div>
                    </div>
                    <DialogFooter className="pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>Batal</Button>
                        <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Simpan Perubahan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
