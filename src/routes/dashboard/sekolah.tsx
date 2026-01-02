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
import { Button } from "@/components/ui/button"
import {
    Plus,
    Search,
    UserCog,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Building2
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    const [page, setPage] = useState(0)
    const limit = 10

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
                    limit,
                    offset: page * limit,
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
    }, [searchTerm, page, bentukFilter, statusFilter])

    // Reset page on filter change
    useEffect(() => {
        setPage(0)
    }, [searchTerm, bentukFilter, statusFilter])

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

    const totalPages = Math.ceil(data.total / limit)

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Data Sekolah</h1>
                    <p className="text-muted-foreground text-sm">Kelola database sekolah asal pendaftar.</p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3 text-emerald-800">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="h-5 w-5" /> Daftar Sekolah
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 pb-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari sekolah, NPSN, atau kecamatan..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 items-center">
                            <Filter className="h-4 w-4 text-slate-400 mr-1" />
                            <Select value={bentukFilter} onValueChange={setBentukFilter}>
                                <SelectTrigger className="w-[130px] h-9 text-xs">
                                    <SelectValue placeholder="Bentuk" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="semua">Semua Jenjang</SelectItem>
                                    <SelectItem value="SMP">SMP</SelectItem>
                                    <SelectItem value="MTS">MTS</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[130px] h-9 text-xs">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="semua">Semua Status</SelectItem>
                                    <SelectItem value="N">Negeri</SelectItem>
                                    <SelectItem value="S">Swasta</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="ml-auto">
                            <Button onClick={() => { setEditingSekolah(null); setIsDialogOpen(true) }} className="bg-emerald-600 hover:bg-emerald-700 h-9 text-sm">
                                <Plus className="mr-1.5 h-4 w-4" /> Tambah
                            </Button>
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
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="icon" onClick={() => { setEditingSekolah(item); setIsDialogOpen(true) }} className="h-8 w-8 hover:text-emerald-600 hover:border-emerald-200">
                                                        <UserCog className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="outline" size="icon" onClick={() => { setDeletingId(item.id); setIsDeleteDialogOpen(true) }} className="h-8 w-8 hover:text-red-600 hover:border-red-200">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between space-x-2 py-4">
                        <div className="text-sm text-muted-foreground font-medium">
                            Menampilkan {data.total > 0 ? (page * limit) + 1 : 0} sampai {Math.min(data.total, (page + 1) * limit)} dari {data.total} sekolah
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="h-8"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" /> Sebelum
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => p + 1)}
                                disabled={page >= totalPages - 1}
                                className="h-8"
                            >
                                Sesudah <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
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
                            <Input id="sekolah" name="sekolah" defaultValue={initialData?.sekolah} required placeholder="Contoh: SMP NEGERI 1 MAJALENGKA" />
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
