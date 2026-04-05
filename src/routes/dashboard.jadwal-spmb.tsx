import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { CalendarDays, Plus, Trash2, Pencil, Loader2, Save, Search } from 'lucide-react'
import {
    getJadwalSpmbList,
    createJadwalSpmb,
    updateJadwalSpmb,
    deleteJadwalSpmb,
} from '@/lib/server/jadwal-spmb'

export const Route = createFileRoute('/dashboard/jadwal-spmb')({
    component: JadwalSpmbPage,
})

type JadwalData = {
    id: string
    title: string
    startDate: Date | string
    endDate: Date | string
    timeDetails: string | null
    tahap: string | null
    status: string
    createdAt: Date | null
    updatedAt: Date | null
}

const STATUS_OPTIONS = [
    { value: 'Akan Datang', label: 'Akan Datang', color: 'bg-orange-100 text-orange-700 border border-orange-200' },
    { value: 'Aktif', label: 'Aktif', color: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
    { value: 'Selesai', label: 'Selesai', color: 'bg-primary/10 text-primary border border-primary/20' },
]

function getStatusBadge(status: string) {
    const found = STATUS_OPTIONS.find((s) => s.value === status)
    if (!found) return <Badge variant="secondary">{status}</Badge>
    return <Badge className={`${found.color} font-semibold`}>{found.label}</Badge>
}

function formatDateDisplay(date: Date | string) {
    return new Date(date).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

function toInputDate(date: Date | string) {
    const d = new Date(date)
    return d.toISOString().split('T')[0]
}

function JadwalSpmbPage() {
    const [jadwalList, setJadwalList] = useState<JadwalData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    // Add dialog
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isAdding, setIsAdding] = useState(false)
    const [addForm, setAddForm] = useState({
        title: '',
        startDate: '',
        endDate: '',
        timeDetails: '',
        tahap: '',
        status: 'Akan Datang',
    })

    // Edit dialog
    const [editItem, setEditItem] = useState<JadwalData | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState({
        title: '',
        startDate: '',
        endDate: '',
        timeDetails: '',
        tahap: '',
        status: 'Akan Datang',
    })

    // Delete dialog
    const [deleteItem, setDeleteItem] = useState<JadwalData | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setIsLoading(true)
            const data = await getJadwalSpmbList()
            setJadwalList(data as JadwalData[])
        } catch (error) {
            console.error('Error loading jadwal:', error)
            toast.error('Gagal memuat data jadwal')
        } finally {
            setIsLoading(false)
        }
    }

    // === Add ===
    const handleAdd = async () => {
        if (!addForm.title || !addForm.startDate || !addForm.endDate) {
            toast.error('Judul, Tanggal Mulai, dan Tanggal Selesai wajib diisi')
            return
        }
        if (new Date(addForm.endDate) < new Date(addForm.startDate)) {
            toast.error('Tanggal Selesai tidak boleh sebelum Tanggal Mulai')
            return
        }
        try {
            setIsAdding(true)
            await createJadwalSpmb({
                data: {
                    title: addForm.title,
                    startDate: addForm.startDate,
                    endDate: addForm.endDate,
                    timeDetails: addForm.timeDetails || null,
                    tahap: addForm.tahap || null,
                    status: addForm.status,
                },
            })
            toast.success('Jadwal berhasil ditambahkan')
            setIsAddOpen(false)
            resetAddForm()
            loadData()
        } catch (error) {
            console.error('Error creating jadwal:', error)
            toast.error('Gagal menambahkan jadwal')
        } finally {
            setIsAdding(false)
        }
    }

    const resetAddForm = () => {
        setAddForm({
            title: '',
            startDate: '',
            endDate: '',
            timeDetails: '',
            tahap: '',
            status: 'Akan Datang',
        })
    }

    // === Edit ===
    const openEditDialog = (item: JadwalData) => {
        setEditItem(item)
        setEditForm({
            title: item.title,
            startDate: toInputDate(item.startDate),
            endDate: toInputDate(item.endDate),
            timeDetails: item.timeDetails || '',
            tahap: item.tahap || '',
            status: item.status,
        })
    }

    const handleEdit = async () => {
        if (!editItem) return
        if (!editForm.title || !editForm.startDate || !editForm.endDate) {
            toast.error('Judul, Tanggal Mulai, dan Tanggal Selesai wajib diisi')
            return
        }
        if (new Date(editForm.endDate) < new Date(editForm.startDate)) {
            toast.error('Tanggal Selesai tidak boleh sebelum Tanggal Mulai')
            return
        }
        try {
            setIsEditing(true)
            await updateJadwalSpmb({
                data: {
                    id: editItem.id,
                    title: editForm.title,
                    startDate: editForm.startDate,
                    endDate: editForm.endDate,
                    timeDetails: editForm.timeDetails || null,
                    tahap: editForm.tahap || null,
                    status: editForm.status,
                },
            })
            toast.success('Jadwal berhasil diperbarui')
            setEditItem(null)
            loadData()
        } catch (error) {
            console.error('Error updating jadwal:', error)
            toast.error('Gagal memperbarui jadwal')
        } finally {
            setIsEditing(false)
        }
    }

    // === Delete ===
    const handleDelete = async () => {
        if (!deleteItem) return
        try {
            setIsDeleting(true)
            await deleteJadwalSpmb({ data: { id: deleteItem.id } })
            toast.success('Jadwal berhasil dihapus')
            setDeleteItem(null)
            loadData()
        } catch (error) {
            console.error('Error deleting jadwal:', error)
            toast.error('Gagal menghapus jadwal')
        } finally {
            setIsDeleting(false)
        }
    }

    // === Filter ===
    const filteredList = jadwalList.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.tahap || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.status.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-md">
                    <CalendarDays className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Jadwal SPMB</h1>
                    <p className="text-sm text-slate-500">Kelola jadwal pendaftaran peserta didik baru</p>
                </div>
            </div>

            {/* Statistik singkat */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="rounded-md border-slate-300 shadow-sm overflow-hidden">
                    <CardContent className="py-4 flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-md">
                            <CalendarDays className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{jadwalList.filter((j) => j.status === 'Aktif').length}</p>
                            <p className="text-xs text-slate-500">Jadwal Aktif</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-md border-slate-300 shadow-sm overflow-hidden">
                    <CardContent className="py-4 flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-md">
                            <CalendarDays className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{jadwalList.filter((j) => j.status === 'Akan Datang').length}</p>
                            <p className="text-xs text-slate-500">Akan Datang</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-md border-slate-300 shadow-sm overflow-hidden">
                    <CardContent className="py-4 flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-md">
                            <CalendarDays className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{jadwalList.filter((j) => j.status === 'Selesai').length}</p>
                            <p className="text-xs text-slate-500">Selesai</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Card Tabel */}
            <Card className="rounded-md border-slate-300 shadow-sm overflow-hidden">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
                            <CalendarDays className="w-5 h-5 text-primary" />
                            Daftar Jadwal
                        </CardTitle>
                        <CardDescription className="text-slate-500 font-medium">
                            Total {jadwalList.length} jadwal terdaftar
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Cari jadwal..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 w-56 rounded-md border-slate-300 focus:ring-1 focus:ring-primary transition-all font-medium"
                            />
                        </div>
                        {/* Tombol Tambah */}
                        <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetAddForm() }}>
                            <DialogTrigger asChild>
                                <Button className="bg-primary hover:bg-primary/90 rounded-md font-bold shadow-sm transition-all active:scale-95">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah Jadwal
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl rounded-md border-slate-300">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold text-slate-900">Tambah Jadwal Baru</DialogTitle>
                                    <DialogDescription className="text-slate-500">Isi detail jadwal SPMB yang baru.</DialogDescription>
                                </DialogHeader>
                                <JadwalForm form={addForm} setForm={setAddForm} />
                                <DialogFooter className="gap-2 sm:gap-0 border-t pt-4 mt-2">
                                    <Button variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-md border-slate-300">Batal</Button>
                                    <Button onClick={handleAdd} disabled={isAdding} className="bg-primary hover:bg-primary/90 rounded-md font-bold text-white shadow-sm">
                                        {isAdding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                                        Tambah
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/80">
                            <TableRow>
                                <TableHead className="w-[60px] text-center font-semibold text-slate-500">No</TableHead>
                                <TableHead className="font-semibold text-slate-800">Judul Kegiatan</TableHead>
                                <TableHead className="font-semibold text-slate-800">Tahap</TableHead>
                                <TableHead className="font-semibold text-slate-800">Tanggal Mulai</TableHead>
                                <TableHead className="font-semibold text-slate-800">Tanggal Selesai</TableHead>
                                <TableHead className="font-semibold text-slate-800">Waktu</TableHead>
                                <TableHead className="font-semibold text-slate-800 text-center">Status</TableHead>
                                <TableHead className="text-right font-semibold text-slate-800 pr-6">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredList.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center text-slate-500 py-16">
                                        <div className="flex flex-col items-center gap-2 opacity-50">
                                            <CalendarDays className="h-10 w-10 text-slate-300" />
                                            <p className="font-medium">{searchQuery ? 'Tidak ada jadwal yang cocok dengan pencarian.' : 'Belum ada jadwal. Klik "Tambah Jadwal" untuk memulai.'}</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredList.map((item, idx) => (
                                    <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <TableCell className="text-center text-slate-400 font-medium">{(idx + 1).toString().padStart(2, '0')}</TableCell>
                                        <TableCell className="font-bold text-slate-700 group-hover:text-primary transition-colors uppercase tracking-tight">{item.title}</TableCell>
                                        <TableCell>
                                            {item.tahap ? (
                                                <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-medium rounded-sm">
                                                    {item.tahap}
                                                </Badge>
                                            ) : (
                                                <span className="text-slate-400 italic text-xs">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-slate-600 font-medium">{formatDateDisplay(item.startDate)}</TableCell>
                                        <TableCell className="whitespace-nowrap text-slate-600 font-medium">{formatDateDisplay(item.endDate)}</TableCell>
                                        <TableCell>
                                            {item.timeDetails ? (
                                                <span className="text-slate-600 text-sm font-medium">{item.timeDetails}</span>
                                            ) : (
                                                <span className="text-slate-400 italic text-xs">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">{getStatusBadge(item.status)}</TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => openEditDialog(item)} 
                                                    title="Edit"
                                                    className="h-8 w-8 p-0 text-slate-400 hover:text-primary hover:bg-primary/10"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDeleteItem(item)}
                                                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
                <DialogContent className="max-w-2xl rounded-md border-slate-300">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900">Edit Jadwal</DialogTitle>
                        <DialogDescription className="text-slate-500">Perbarui informasi jadwal SPMB.</DialogDescription>
                    </DialogHeader>
                    <JadwalForm form={editForm} setForm={setEditForm} />
                    <DialogFooter className="gap-2 sm:gap-0 border-t pt-4 mt-2">
                        <Button variant="outline" onClick={() => setEditItem(null)} className="rounded-md border-slate-300">Batal</Button>
                        <Button onClick={handleEdit} disabled={isEditing} className="bg-primary hover:bg-primary/90 rounded-md font-bold text-white shadow-sm">
                            {isEditing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Simpan Perubahan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm Dialog */}
            <AlertDialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
                <AlertDialogContent className="rounded-md border-slate-300">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold text-slate-900">Hapus Jadwal?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-500">
                            Apakah Anda yakin ingin menghapus jadwal <strong className="text-slate-900">{deleteItem?.title}</strong>?
                            <br />
                            Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-4 border-t gap-2 flex-row justify-end">
                        <AlertDialogCancel className="rounded-md border-slate-300 mt-0">Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 rounded-md font-bold text-white shadow-sm"
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Hapus Jadwal
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

// === Reusable Form Component ===
type FormState = {
    title: string
    startDate: string
    endDate: string
    timeDetails: string
    tahap: string
    status: string
}

function JadwalForm({ form, setForm }: { form: FormState; setForm: React.Dispatch<React.SetStateAction<FormState>> }) {
    return (
        <div className="space-y-4 py-2">
            <div className="space-y-2">
                <Label htmlFor="title">Judul Kegiatan <span className="text-red-500">*</span></Label>
                <Input
                    id="title"
                    placeholder="Contoh: Pendaftaran Gelombang 1"
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    className="rounded-md border-slate-300"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="startDate">Tanggal Mulai <span className="text-red-500">*</span></Label>
                    <Input
                        id="startDate"
                        type="date"
                        value={form.startDate}
                        onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                        className="rounded-md border-slate-300"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="endDate">Tanggal Selesai <span className="text-red-500">*</span></Label>
                    <Input
                        id="endDate"
                        type="date"
                        value={form.endDate}
                        onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                        className="rounded-md border-slate-300"
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="timeDetails">Detail Waktu</Label>
                <Input
                    id="timeDetails"
                    placeholder="Contoh: 08:00 - 15:00 WIB"
                    value={form.timeDetails}
                    onChange={(e) => setForm((p) => ({ ...p, timeDetails: e.target.value }))}
                    className="rounded-md border-slate-300"
                />
                <p className="text-xs text-slate-500">Opsional. Berisi jam pelaksanaan.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="tahap">Tahap <span className="text-red-500">*</span></Label>
                    <Select value={form.tahap} onValueChange={(val) => setForm((p) => ({ ...p, tahap: val }))}>
                        <SelectTrigger id="tahap" className='w-full rounded-md border-slate-300'>
                            <SelectValue placeholder="Pilih Tahap" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="tahap1">SPMB Tahap 1</SelectItem>
                            <SelectItem value="tahap2">SPMB Tahap 2</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={form.status} onValueChange={(val) => setForm((p) => ({ ...p, status: val }))}>
                        <SelectTrigger id="status" className='w-full rounded-md border-slate-300'>
                            <SelectValue placeholder="Pilih Status" />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Preview tanggal */}
            {form.startDate && form.endDate && (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
                    <p className="text-sm text-primary">
                        <strong>Preview:</strong>{' '}
                        {formatDateDisplay(form.startDate)} — {formatDateDisplay(form.endDate)}
                        {form.timeDetails ? `, ${form.timeDetails}` : ''}
                    </p>
                </div>
            )}
        </div>
    )
}
