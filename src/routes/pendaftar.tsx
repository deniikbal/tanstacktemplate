import { createFileRoute } from '@tanstack/react-router'
import { getPendaftarList, savePendaftar, deletePendaftar, getSchoolSearch, getPendaftarStats, resendQueueWA } from '@/lib/server/pendaftar'
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
    Building2,
    Users,
    CheckCircle2,
    Clock,
    ArrowUpCircle,
    Ticket,
    Bell,
    Volume2,
    Play,
    CheckCircle,
    MoreVertical,
    XCircle,
    MessageSquare,
    Phone
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
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
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

export const Route = createFileRoute('/pendaftar')({
    component: PendaftaranPage,
})

interface Pendaftar {
    id: string
    nmLengkap: string
    tempatLahir: string | null
    tanggalLahir: string | null
    alamat: string | null
    asalSekolah: string | null
    noHandphone: string | null
    tahunLulus: string | null
    jalurMasuk: string | null
    keterangan: string | null
    tahap: string | null
    noAntrian: string | null
    tglAntrian: string | null
    statusAntrian: string | null
}

import { issueQueueNumber, updateQueueStatus } from '@/lib/server/pendaftar'
import { Badge } from '@/components/ui/badge'
import { getJakartaDate } from '@/lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

function PendaftaranPage() {
    const [pendaftarInfo, setPendaftarInfo] = useState<{ pendaftar: Pendaftar[], total: number } | null>(null)
    const [isPending, setIsPending] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedPendaftar, setSelectedPendaftar] = useState<Partial<Pendaftar> | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [pendaftarToDelete, setPendaftarToDelete] = useState<Pendaftar | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [sekolahFilter, setSekolahFilter] = useState('')
    const [jalurFilter, setJalurFilter] = useState('semua')
    const [tahapFilter, setTahapFilter] = useState('semua')
    const [statusFilter, setStatusFilter] = useState('semua')
    const [stats, setStats] = useState<{ total: number, verified: number, unverified: number, tahap1: number, tahap2: number } | null>(null)
    const [isSendingWA, setIsSendingWA] = useState(false)
    const [pendaftarToNotify, setPendaftarToNotify] = useState<Pendaftar | null>(null)
    const [isWANotifyDialogOpen, setIsWANotifyDialogOpen] = useState(false)

    // Pagination
    const [page, setPage] = useState(1)
    const pageSize = 10

    const fetchPendaftar = async () => {
        setIsPending(true)
        try {
            const data = await getPendaftarList({
                data: {
                    limit: pageSize,
                    offset: (page - 1) * pageSize,
                    search: searchTerm || undefined,
                    asalSekolah: sekolahFilter || undefined,
                    jalurMasuk: jalurFilter !== 'semua' ? jalurFilter : undefined,
                    tahap: tahapFilter !== 'semua' ? tahapFilter : undefined,
                    statusAntrian: statusFilter !== 'semua' ? statusFilter : undefined
                }
            })
            setPendaftarInfo(data)

            // Fetch stats separately to keep it fast
            const statsData = await getPendaftarStats({ data: {} })
            setStats(statsData)
        } catch (error: any) {
            toast.error(error.message || 'Gagal mengambil data pendaftar')
        }
        setIsPending(false)
    }

    useEffect(() => {
        fetchPendaftar()

        // Polling every 30 seconds to keep queue live
        const interval = setInterval(fetchPendaftar, 30000)
        return () => clearInterval(interval)
    }, [page, searchTerm, sekolahFilter, jalurFilter, tahapFilter, statusFilter])

    const handleVoiceCall = (p: Pendaftar) => {
        if (!p.noAntrian) return
        const text = `Nomor Antrian, ${p.noAntrian.split('').join(' ')}, atas nama, ${p.nmLengkap}, silakan menuju ruang tunggu.`
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'id-ID'
        utterance.rate = 0.9
        window.speechSynthesis.speak(utterance)

        // Update status to CALLING automatically
        updateQueueStatus({ data: { id: p.id, status: 'CALLING' } }).then(fetchPendaftar)
    }

    const handleResendWA = async () => {
        if (!pendaftarToNotify) return
        setIsSendingWA(true)
        try {
            await resendQueueWA({ data: { id: pendaftarToNotify.id } })
            toast.success('Notifikasi WhatsApp berhasil dikirim ulang')
            setIsWANotifyDialogOpen(false)
            setPendaftarToNotify(null)
        } catch (error: any) {
            toast.error(error.message || 'Gagal mengirim notifikasi WA')
        }
        setIsSendingWA(false)
    }

    const handleDelete = async () => {
        if (!pendaftarToDelete) return
        setIsDeleting(true)
        try {
            await deletePendaftar({ data: { id: pendaftarToDelete.id } })
            toast.success('Data pendaftar berhasil dihapus')
            setIsDeleteDialogOpen(false)
            setPendaftarToDelete(null)
            fetchPendaftar()
        } catch (error: any) {
            toast.error(error.message || 'Gagal menghapus data')
        }
        setIsDeleting(false)
    }

    const totalPages = Math.ceil((pendaftarInfo?.total || 0) / pageSize)

    return (
        <div className="min-h-screen bg-slate-50 p-6 space-y-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Data Calon Pendaftar</h1>
                        <p className="text-muted-foreground mt-1">
                            Manajemen pendaftaran calon peserta didik baru.
                        </p>
                    </div>
                </div>


                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-slate-200 shadow-sm overflow-hidden group hover:border-indigo-400 transition-all">
                        <CardContent className="p-0">
                            <div className="flex items-stretch h-20">
                                <div className="w-2 bg-indigo-500 group-hover:bg-indigo-600 transition-colors" />
                                <div className="flex-1 p-3 flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 rounded-lg">
                                        <Users className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Total Pendaftar</p>
                                        <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                                            {stats?.total ?? 0}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm overflow-hidden group hover:border-primary/50 transition-all">
                        <CardContent className="p-0">
                            <div className="flex items-stretch h-20">
                                <div className="w-2 bg-primary group-hover:bg-primary/80 transition-colors" />
                                <div className="flex-1 p-3 flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <CheckCircle2 className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Sudah Verifikasi</p>
                                        <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                                            {stats?.verified ?? 0}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm overflow-hidden group hover:border-amber-400 transition-all">
                        <CardContent className="p-0">
                            <div className="flex items-stretch h-20">
                                <div className="w-2 bg-amber-500 group-hover:bg-amber-600 transition-colors" />
                                <div className="flex-1 p-3 flex items-center gap-3">
                                    <div className="p-2 bg-amber-50 rounded-lg">
                                        <Clock className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Belum Verifikasi</p>
                                        <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                                            {stats?.unverified ?? 0}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm overflow-hidden group hover:border-purple-400 transition-all">
                        <CardContent className="p-0">
                            <div className="flex items-stretch h-20">
                                <div className="w-2 bg-purple-500 group-hover:bg-purple-600 transition-colors" />
                                <div className="flex-1 p-3 flex items-center gap-3">
                                    <div className="p-2 bg-purple-50 rounded-lg">
                                        <ArrowUpCircle className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Pendaftar Tahap 1</p>
                                        <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                                            {stats?.tahap1 ?? 0}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="p-4 border-b bg-white">
                        <div className="flex flex-wrap items-center gap-3 md:gap-4">
                            <div className="relative w-full md:max-w-xs transition-all flex-grow">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Cari nama..."
                                    className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors h-9 text-xs"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value)
                                        setPage(1)
                                    }}
                                />
                            </div>
                            <div className="relative w-full md:max-w-xs transition-all flex-grow">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Asal sekolah..."
                                    className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors h-9 text-xs"
                                    value={sekolahFilter}
                                    onChange={(e) => {
                                        setSekolahFilter(e.target.value)
                                        setPage(1)
                                    }}
                                />
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Select value={jalurFilter} onValueChange={(val) => {
                                    setJalurFilter(val)
                                    setPage(1)
                                }}>
                                    <SelectTrigger className="w-[140px] h-9 text-[11px] bg-slate-50 border-slate-200">
                                        <SelectValue placeholder="Jalur" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="semua">Semua Jalur</SelectItem>
                                        <SelectItem value="KETM">KETM</SelectItem>
                                        <SelectItem value="DOMISILI">DOMISILI</SelectItem>
                                        <SelectItem value="AFIRMASI">AFIRMASI</SelectItem>
                                        <SelectItem value="ANAK Guru">ANAK Guru</SelectItem>
                                        <SelectItem value="MUTASI">MUTASI</SelectItem>
                                        <SelectItem value="Kejuaraan Akademik">Kejuaraan Akademik</SelectItem>
                                        <SelectItem value="Kejuaraan Non Akademik">Kejuaraan Non Akademik</SelectItem>
                                        <SelectItem value="Kepemimpinan">Kepemimpinan</SelectItem>
                                        <SelectItem value="Prestasi Raport">Prestasi Raport</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={tahapFilter} onValueChange={(val) => {
                                    setTahapFilter(val)
                                    setPage(1)
                                }}>
                                    <SelectTrigger className="w-[100px] h-9 text-[11px] bg-slate-50 border-slate-200">
                                        <SelectValue placeholder="Tahap" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="semua">Semua Tahap</SelectItem>
                                        <SelectItem value="1">Tahap 1</SelectItem>
                                        <SelectItem value="2">Tahap 2</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={statusFilter} onValueChange={(val) => {
                                    setStatusFilter(val)
                                    setPage(1)
                                }}>
                                    <SelectTrigger className="w-[110px] h-9 text-[11px] bg-slate-50 border-slate-200">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="semua">Semua Status</SelectItem>
                                        <SelectItem value="WAITING">Menunggu</SelectItem>
                                        <SelectItem value="CALLING">Dipanggil</SelectItem>
                                        <SelectItem value="IN_ROOM">Masuk Ruangan</SelectItem>
                                        <SelectItem value="SKIPPED">Terlewat</SelectItem>
                                        <SelectItem value="DONE">Selesai</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex-grow md:flex-grow-0 ml-auto">
                                <Button
                                    onClick={() => {
                                        setSelectedPendaftar({})
                                        setIsFormOpen(true)
                                    }}
                                    className="bg-primary hover:bg-primary/90 shadow-sm h-9 text-xs w-full md:w-auto"
                                >
                                    <Plus className="mr-1 h-3.5 w-3.5" />
                                    Tambah
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="font-semibold text-slate-700 px-4 h-10 py-0">Antrian</TableHead>
                                        <TableHead className="font-semibold text-slate-700 px-4 h-10 py-0">Nama Lengkap</TableHead>
                                        <TableHead className="font-semibold text-slate-700 px-4 h-10 py-0 text-xs">Asal Sekolah</TableHead>
                                        <TableHead className="font-semibold text-slate-700 px-4 h-10 py-0 text-xs">Tahap/Jalur</TableHead>
                                        <TableHead className="font-semibold text-slate-700 px-4 h-10 py-0 text-xs">No. HP</TableHead>
                                        <TableHead className="w-[60px] text-right px-4 h-10 py-0">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isPending ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell><Skeleton className="h-5 w-[200px]" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-[150px]" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-[50px]" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-[120px]" /></TableCell>
                                                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : !pendaftarInfo || pendaftarInfo.pendaftar.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-32 text-center text-slate-500 italic">
                                                Belum ada data pendaftar.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        pendaftarInfo.pendaftar.map((p) => (
                                            <TableRow key={p.id} className="hover:bg-slate-50 transition-colors">
                                                <TableCell className="px-4">
                                                    {p.noAntrian && p.tglAntrian?.substring(0, 10) === getJakartaDate() ? (
                                                        <div className="flex flex-col gap-1">
                                                            <Badge className={`${p.statusAntrian === 'CALLING' ? 'bg-orange-500 animate-pulse' :
                                                                p.statusAntrian === 'IN_ROOM' ? 'bg-primary' :
                                                                    p.statusAntrian === 'SKIPPED' ? 'bg-red-500' :
                                                                        p.statusAntrian === 'DONE' ? 'bg-slate-400' :
                                                                            'bg-primary'} hover:opacity-90 text-white font-black px-3 py-1 text-sm shadow-sm w-fit`}>
                                                                #{p.noAntrian}
                                                            </Badge>
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase">
                                                                {p.statusAntrian === 'WAITING' ? 'Menunggu' :
                                                                    p.statusAntrian === 'CALLING' ? 'Mendekat/Dipanggil' :
                                                                        p.statusAntrian === 'IN_ROOM' ? 'Di Ruangan' :
                                                                            p.statusAntrian === 'SKIPPED' ? 'Terlewat' :
                                                                                p.statusAntrian === 'DONE' ? 'Selesai' : p.statusAntrian}
                                                            </span>
                                                        </div>
                                                    ) : p.noAntrian ? (
                                                        <div className="flex flex-col">
                                                            <Badge variant="outline" className="text-slate-400 border-slate-200 font-bold px-2 py-0.5 text-[10px] w-fit">
                                                                #{p.noAntrian}
                                                            </Badge>
                                                            <span className="text-[10px] text-slate-400 mt-0.5">Lama</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-300 text-xs italic">Belum Ada</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium text-slate-900 px-4">{p.nmLengkap}</TableCell>
                                                <TableCell className="px-4">{p.asalSekolah || '-'}</TableCell>
                                                <TableCell className="px-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`w-fit px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${p.tahap === '1' ? 'bg-primary/10 text-primary' : 'bg-purple-100 text-purple-700'}`}>
                                                            Tahap {p.tahap}
                                                        </span>
                                                        <span className="text-xs text-slate-600 font-medium">{p.jalurMasuk || '-'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-600 px-4">{p.noHandphone || '-'}</TableCell>
                                                <TableCell className="text-right flex items-center justify-end gap-1 px-4">
                                                    <TooltipProvider delayDuration={0}>
                                                        <div className="flex items-center gap-1 mr-1 pr-1 border-r border-slate-100">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                                                                        onClick={() => handleVoiceCall(p as Pendaftar)}
                                                                    >
                                                                        <Volume2 className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="top">Panggil (Suara)</TooltipContent>
                                                            </Tooltip>

                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-primary hover:bg-primary/10"
                                                                        onClick={() => updateQueueStatus({ data: { id: p.id, status: 'IN_ROOM' } }).then(fetchPendaftar)}
                                                                    >
                                                                        <Play className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="top">Masuk Ruangan</TooltipContent>
                                                            </Tooltip>

                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                        onClick={() => updateQueueStatus({ data: { id: p.id, status: 'SKIPPED' } }).then(fetchPendaftar)}
                                                                    >
                                                                        <XCircle className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="top">Terlewat</TooltipContent>
                                                            </Tooltip>

                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                                                                        onClick={() => updateQueueStatus({ data: { id: p.id, status: 'DONE' } }).then(fetchPendaftar)}
                                                                    >
                                                                        <CheckCircle className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="top">Selesai</TooltipContent>
                                                            </Tooltip>
                                                        </div>
                                                    </TooltipProvider>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                                Aksi Lainnya
                                                            </div>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={async () => {
                                                                    try {
                                                                        await issueQueueNumber({ data: { id: p.id } })
                                                                        toast.success(`Antrian #${p.nmLengkap} berhasil diterbitkan`)
                                                                        fetchPendaftar()
                                                                    } catch (error: any) {
                                                                        toast.error(error.message || 'Gagal menerbitkan antrian')
                                                                    }
                                                                }}
                                                                className="text-primary"
                                                            >
                                                                <Ticket className="mr-2 h-4 w-4" />
                                                                Terbitkan Antrian
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setSelectedPendaftar(p)
                                                                    setIsFormOpen(true)
                                                                }}
                                                            >
                                                                <UserCog className="mr-2 h-4 w-4" />
                                                                Edit Data
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setPendaftarToNotify(p as Pendaftar)
                                                                    setIsWANotifyDialogOpen(true)
                                                                }}
                                                                disabled={!p.noHandphone || !p.noAntrian}
                                                            >
                                                                <MessageSquare className="mr-2 h-4 w-4 text-primary" />
                                                                Kirim Ulang WA
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                                onClick={() => {
                                                                    setPendaftarToDelete(p as Pendaftar)
                                                                    setIsDeleteDialogOpen(true)
                                                                }}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Hapus
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

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-3 p-4 bg-slate-50/50">
                            {isPending ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="p-4 bg-white border border-slate-200 rounded-md shadow-sm space-y-3">
                                        <div className="flex justify-between">
                                            <Skeleton className="h-10 w-16" />
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                        </div>
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                ))
                            ) : !pendaftarInfo || pendaftarInfo.pendaftar.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 italic text-sm">
                                    Belum ada data pendaftar.
                                </div>
                            ) : (
                                pendaftarInfo.pendaftar.map((p) => (
                                    <div key={p.id} className="p-4 bg-white border border-slate-200 rounded-md shadow-sm hover:border-primary/30 transition-all space-y-3 relative overflow-hidden">
                                        {/* Colored accent bar */}
                                        <div className={`absolute top-0 left-0 w-1 h-full ${p.statusAntrian === 'CALLING' ? 'bg-orange-500 animate-pulse' :
                                            p.statusAntrian === 'IN_ROOM' ? 'bg-primary' :
                                                p.statusAntrian === 'SKIPPED' ? 'bg-red-500' :
                                                    p.statusAntrian === 'DONE' ? 'bg-slate-400' :
                                                        'bg-primary'
                                            }`} />
                                        <div className="flex justify-between items-start">
                                            <div>
                                                {p.noAntrian && p.tglAntrian?.substring(0, 10) === getJakartaDate() ? (
                                                    <div className="flex flex-col gap-0.5">
                                                        <Badge className={`${p.statusAntrian === 'CALLING' ? 'bg-amber-500 animate-pulse' :
                                                            p.statusAntrian === 'IN_ROOM' ? 'bg-primary' :
                                                                p.statusAntrian === 'SKIPPED' ? 'bg-red-500' :
                                                                    p.statusAntrian === 'DONE' ? 'bg-slate-400' :
                                                                        'bg-primary'} text-white font-black px-2 py-0.5 text-xs shadow-sm w-fit`}>
                                                            #{p.noAntrian}
                                                        </Badge>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                                            {p.statusAntrian === 'WAITING' ? 'Menunggu' :
                                                                p.statusAntrian === 'CALLING' ? 'Dipanggil' :
                                                                    p.statusAntrian === 'IN_ROOM' ? 'Di Ruangan' :
                                                                        p.statusAntrian === 'SKIPPED' ? 'Terlewat' :
                                                                            p.statusAntrian === 'DONE' ? 'Selesai' : p.statusAntrian}
                                                        </span>
                                                    </div>
                                                ) : p.noAntrian ? (
                                                    <div className="flex flex-col gap-0.5">
                                                        <Badge variant="outline" className="text-slate-400 border-slate-200 font-bold px-1.5 py-0 text-[10px] w-fit">
                                                            #{p.noAntrian}
                                                        </Badge>
                                                        <span className="text-[9px] text-slate-300 font-medium">Lama</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-300 text-[10px] italic">Belum Ada</span>
                                                )}
                                            </div>

                                        <div className="grid grid-cols-5 gap-2 pt-2 border-t border-slate-100">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex flex-col h-12 gap-1 text-amber-600 border-amber-100 bg-amber-50/30"
                                                onClick={() => handleVoiceCall(p as Pendaftar)}
                                            >
                                                <Volume2 className="h-4 w-4" />
                                                <span className="text-[9px] font-bold uppercase">Panggil</span>
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex flex-col h-12 gap-1 text-primary border-primary/20 bg-primary/5"
                                                onClick={() => updateQueueStatus({ data: { id: p.id, status: 'IN_ROOM' } }).then(fetchPendaftar)}
                                            >
                                                <Play className="h-4 w-4" />
                                                <span className="text-[9px] font-bold uppercase">Masuk</span>
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex flex-col h-12 gap-1 text-red-600 border-red-100 bg-red-50/30"
                                                onClick={() => updateQueueStatus({ data: { id: p.id, status: 'SKIPPED' } }).then(fetchPendaftar)}
                                            >
                                                <XCircle className="h-4 w-4" />
                                                <span className="text-[9px] font-bold uppercase">Lewat</span>
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex flex-col h-12 gap-1 text-emerald-600 border-emerald-100 bg-emerald-50/30"
                                                onClick={() => updateQueueStatus({ data: { id: p.id, status: 'DONE' } }).then(fetchPendaftar)}
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                                <span className="text-[9px] font-bold uppercase">Selesai</span>
                                            </Button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" size="sm" className="flex flex-col h-12 gap-1 text-slate-500">
                                                        <MoreVertical className="h-4 w-4" />
                                                        <span className="text-[9px] font-bold uppercase">Lainnya</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-52">
                                                    <div className="px-2 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 border-b mb-1">
                                                        Aksi Administratif
                                                    </div>
                                                    <DropdownMenuItem
                                                        onClick={async () => {
                                                            try {
                                                                await issueQueueNumber({ data: { id: p.id } })
                                                                toast.success(`Antrian #${p.nmLengkap} diterbitkan`)
                                                                fetchPendaftar()
                                                            } catch (error: any) {
                                                                toast.error(error.message || 'Gagal')
                                                            }
                                                        }}
                                                        className="text-primary"
                                                    >
                                                        <Ticket className="mr-2 h-4 w-4" />
                                                        Terbitkan Antrian
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setSelectedPendaftar(p)
                                                            setIsFormOpen(true)
                                                        }}
                                                    >
                                                        <UserCog className="mr-2 h-4 w-4" />
                                                        Edit Data
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setPendaftarToNotify(p as Pendaftar)
                                                            setIsWANotifyDialogOpen(true)
                                                        }}
                                                        disabled={!p.noHandphone || !p.noAntrian}
                                                    >
                                                        <MessageSquare className="mr-2 h-4 w-4 text-primary" />
                                                        Kirim Ulang WA
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                        onClick={() => {
                                                            setPendaftarToDelete(p as Pendaftar)
                                                            setIsDeleteDialogOpen(true)
                                                        }}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Hapus
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        </div>

                                        <div className="space-y-1">
                                            <h4 className="font-bold text-slate-800 text-sm leading-tight uppercase line-clamp-1">{p.nmLengkap}</h4>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <Building2 className="h-3 w-3 text-slate-400" />
                                                <span className="truncate">{p.asalSekolah || '-'}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                                            <div className="flex gap-1.5">
                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${p.tahap === '1' ? 'bg-primary/10 text-primary' : 'bg-purple-100 text-purple-700'}`}>
                                                    T-{p.tahap}
                                                </span>
                                                <span className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]">{p.jalurMasuk || '-'}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                                                <Phone className="h-2.5 w-2.5" />
                                                {p.noHandphone || '-'}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                    {totalPages > 1 && (
                        <div className="p-4 border-t bg-slate-50/30 flex items-center justify-between">
                            <p className="text-xs text-slate-500">
                                Total {pendaftarInfo?.total} pendaftar
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="h-8"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-xs font-medium">Halaman {page} dari {totalPages}</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page === totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                    className="h-8"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedPendaftar?.id ? 'Edit Data Pendaftar' : 'Pendaftaran Calon Siswa Baru'}</DialogTitle>
                        <DialogDescription>
                            Isi formulir pendaftaran di bawah ini dengan lengkap dan benar.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPendaftar && (
                        <PendaftarForm
                            initialData={selectedPendaftar}
                            onSuccess={() => {
                                setIsFormOpen(false)
                                fetchPendaftar()
                            }}
                            onCancel={() => setIsFormOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Data Pendaftar?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus data calon pendaftar <span className="font-bold text-slate-900">{pendaftarToDelete?.nmLengkap}</span>?
                            Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleDelete()
                            }}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Hapus Data'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* WA Notification Confirmation */}
            <AlertDialog open={isWANotifyDialogOpen} onOpenChange={setIsWANotifyDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Kirim Notifikasi WhatsApp?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin mengirim ulang nomor antrian <span className="font-bold text-slate-900">#{pendaftarToNotify?.noAntrian}</span> ke <span className="font-bold text-slate-900">{pendaftarToNotify?.nmLengkap}</span> ({pendaftarToNotify?.noHandphone})?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSendingWA}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleResendWA()
                            }}
                            disabled={isSendingWA}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isSendingWA ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Kirim Sekarang'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

function PendaftarForm({ initialData, onSuccess, onCancel }: {
    initialData: Partial<Pendaftar>,
    onSuccess: () => void,
    onCancel?: () => void
}) {
    const [loading, setLoading] = useState(false)
    const [tahap, setTahap] = useState(initialData.tahap || '1')
    const [jalurMasuk, setJalurMasuk] = useState(initialData.jalurMasuk || '')
    const [tahunLulus, setTahunLulus] = useState(initialData.tahunLulus || '2026')
    const [keterangan, setKeterangan] = useState(initialData.keterangan || 'Belum Daftar')

    // School & Location Search
    const [sekolahQuery, setSekolahQuery] = useState(initialData.asalSekolah || '')
    const [sekolahResults, setSekolahResults] = useState<any[]>([])
    const [isSearchingSekolah, setIsSearchingSekolah] = useState(false)
    const [showSekolahResults, setShowSekolahResults] = useState(false)


    // Fetch Schools by Name
    useEffect(() => {
        const fetchSekolah = async () => {
            if (sekolahQuery.length < 3) {
                setSekolahResults([])
                return
            }
            setIsSearchingSekolah(true)
            try {
                const results = await getSchoolSearch({ data: { query: sekolahQuery } })
                setSekolahResults(results)
            } catch (error) {
                console.error('Failed to fetch sekolah:', error)
            } finally {
                setIsSearchingSekolah(false)
            }
        }
        const timeoutId = setTimeout(fetchSekolah, 500)
        return () => clearTimeout(timeoutId)
    }, [sekolahQuery])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        try {
            await savePendaftar({
                data: {
                    id: initialData.id,
                    nmLengkap: formData.get('nmLengkap') as string,
                    tempatLahir: formData.get('tempatLahir') as string,
                    tanggalLahir: formData.get('tanggalLahir') as string,
                    alamat: formData.get('alamat') as string,
                    asalSekolah: sekolahQuery,
                    noHandphone: formData.get('noHandphone') as string,
                    tahunLulus: tahunLulus,
                    jalurMasuk: jalurMasuk,
                    keterangan: keterangan,
                    tahap: tahap,
                }
            })
            toast.success('Pendaftaran berhasil disimpan')
            onSuccess()
        } catch (error: any) {
            toast.error(error.message || 'Gagal menyimpan pendaftaran')
        } finally {
            setLoading(false)
        }
    }

    const jalurOptions = tahap === '1'
        ? ['KETM', 'DOMISILI', 'AFIRMASI', 'ANAK Guru', 'MUTASI']
        : ['Kejuaraan Akademik', 'Kejuaraan Non Akademik', 'Kepemimpinan', 'Prestasi Raport']

    return (
        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Row 1: Identity */}
                <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <Label htmlFor="nmLengkap">Nama Lengkap <span className="text-destructive">*</span></Label>
                    <Input id="nmLengkap" name="nmLengkap" defaultValue={initialData.nmLengkap} required placeholder="Masukkan nama sesuai ijazah" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="noHandphone">No. Handphone (WA) <span className="text-destructive">*</span></Label>
                    <Input id="noHandphone" name="noHandphone" defaultValue={initialData.noHandphone || ''} placeholder="0812..." required />
                </div>

                {/* Row 2: Birth & Year */}
                <div className="space-y-1.5">
                    <Label htmlFor="tempatLahir">Tempat Lahir <span className="text-destructive">*</span></Label>
                    <Input id="tempatLahir" name="tempatLahir" defaultValue={initialData.tempatLahir || ''} placeholder="Contoh: Bantarujeg" required />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="tanggalLahir">Tanggal Lahir <span className="text-destructive">*</span></Label>
                    <Input id="tanggalLahir" name="tanggalLahir" type="date" defaultValue={initialData.tanggalLahir || ''} required />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="tahunLulus">Tahun Lulus</Label>
                    <Select value={tahunLulus} onValueChange={setTahunLulus}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih Tahun" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2026">2026</SelectItem>
                            <SelectItem value="2025">2025</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Row 3: School & Address */}
                <div className="space-y-1.5 col-span-1 md:col-span-1 relative">
                    <Label htmlFor="asalSekolah">Asal Sekolah <span className="text-destructive">*</span></Label>
                    <div className="relative">
                        <Input
                            id="asalSekolah"
                            value={sekolahQuery}
                            onChange={(e) => {
                                setSekolahQuery(e.target.value)
                                setShowSekolahResults(true)
                            }}
                            onFocus={() => setShowSekolahResults(true)}
                            onBlur={() => setTimeout(() => setShowSekolahResults(false), 300)}
                            placeholder="Ketik nama sekolah..."
                            className="bg-white pr-10"
                            autoComplete="off"
                        />
                        {isSearchingSekolah && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                            </div>
                        )}
                    </div>
                    {showSekolahResults && sekolahResults.length > 0 && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {sekolahResults.map((s, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 border-b border-slate-100 flex flex-col group"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => {
                                        setSekolahQuery(s.sekolah)
                                        setShowSekolahResults(false)
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-slate-900 group-hover:text-blue-700">{s.sekolah}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${s.status === 'N' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                            {s.status === 'N' ? 'Negeri' : 'Swasta'}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400">{s.kecamatan}, {s.kabupaten_kota}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <Label htmlFor="alamat">Alamat Lengkap <span className="text-destructive">*</span></Label>
                    <Textarea
                        id="alamat"
                        name="alamat"
                        defaultValue={initialData.alamat || ''}
                        placeholder="Jl. Contoh No. 123"
                        rows={2}
                        className="min-h-0"
                        required
                    />
                </div>

                {/* Row 4: Registration Process (1 row 3 columns) */}
                <div className="space-y-1.5">
                    <Label htmlFor="tahap">Tahap Pendaftaran</Label>
                    <Select value={tahap} onValueChange={(val) => {
                        setTahap(val)
                        setJalurMasuk('') // Reset jalur saat tahap berubah
                    }}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih Tahap" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">Tahap 1</SelectItem>
                            <SelectItem value="2">Tahap 2</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="jalurMasuk">Jalur Masuk</Label>
                    <Select value={jalurMasuk} onValueChange={setJalurMasuk}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih Jalur Masuk" />
                        </SelectTrigger>
                        <SelectContent>
                            {jalurOptions.map(opt => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="keterangan">Keterangan</Label>
                    <Select value={keterangan} onValueChange={setKeterangan}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Belum Daftar">Belum Daftar</SelectItem>
                            <SelectItem value="Sudah Daftar">Sudah Daftar</SelectItem>
                            <SelectItem value="Sudah Verifikasi">Sudah Verifikasi</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter className="pt-4 border-t gap-2">
                <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>Batal</Button>
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 min-w-[100px]">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Simpan
                </Button>
            </DialogFooter>
        </form>
    )
}
