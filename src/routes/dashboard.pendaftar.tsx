import { createFileRoute } from '@tanstack/react-router'
import { getPendaftarList, savePendaftar, deletePendaftar, getSchoolSearch } from '@/lib/server/pendaftar'
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
  UserCog,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
  Building2,
  Users,
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

export const Route = createFileRoute('/dashboard/pendaftar')({
  component: DashboardPendaftarPage,
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
}

function DashboardPendaftarPage() {
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

  // Pagination
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState('10')

  const fetchPendaftar = async () => {
    setIsPending(true)
    try {
      const data = await getPendaftarList({
        data: {
          limit: Number(limit),
          offset: (page - 1) * Number(limit),
          search: searchTerm,
          asalSekolah: sekolahFilter,
          jalurMasuk: jalurFilter
        }
      })
      setPendaftarInfo(data)
    } catch (error) {
      toast.error('Gagal mengambil data pendaftar')
    }
    setIsPending(false)
  }

  useEffect(() => {
    fetchPendaftar()
  }, [page, limit, searchTerm, sekolahFilter, jalurFilter])

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

  const totalPages = Math.ceil((pendaftarInfo?.total || 0) / Number(limit))

  return (
    <div className="p-6 space-y-6">
      {/* Page Header with Icon */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <Users className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Data Pendaftar</h1>
          <p className="text-sm text-slate-500">Kelola data calon peserta didik baru</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="w-5 h-5 text-emerald-600" />
              Daftar Calon Pendaftar
            </CardTitle>
            <CardDescription>
              Kelola data pendaftar, edit, atau hapus data.
            </CardDescription>
          </div>
          <Button
            onClick={() => {
              setSelectedPendaftar({})
              setIsFormOpen(true)
            }}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {/* Filter Bar */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-4 border-b border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Cari nama pendaftar..."
                  className="pl-9 bg-white h-9 border-slate-200"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setPage(1)
                  }}
                />
              </div>
              <div className="relative flex-1 max-w-sm">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Filter asal sekolah..."
                  className="pl-9 bg-white h-9 border-slate-200"
                  value={sekolahFilter}
                  onChange={(e) => {
                    setSekolahFilter(e.target.value)
                    setPage(1)
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <Select value={jalurFilter} onValueChange={(val) => {
                setJalurFilter(val)
                setPage(1)
              }}>
                <SelectTrigger className="w-[180px] h-9 bg-white border-slate-200">
                  <SelectValue placeholder="Semua Jalur" />
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
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700 px-4">Nama Lengkap</TableHead>
                  <TableHead className="font-semibold text-slate-700 px-4">Asal Sekolah</TableHead>
                  <TableHead className="font-semibold text-slate-700 px-4">Tahap</TableHead>
                  <TableHead className="font-semibold text-slate-700 px-4">Jalur Masuk</TableHead>
                  <TableHead className="font-semibold text-slate-700 px-4">No. HP</TableHead>
                  <TableHead className="w-[100px] text-right px-4">Aksi</TableHead>
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
                      <TableCell className="font-medium text-slate-900 px-4">{p.nmLengkap}</TableCell>
                      <TableCell className="px-4">{p.asalSekolah || '-'}</TableCell>
                      <TableCell className="px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.tahap === '1' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                          Tahap {p.tahap}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600 px-4">{p.jalurMasuk || '-'}</TableCell>
                      <TableCell className="text-slate-600 px-4">{p.noHandphone || '-'}</TableCell>
                      <TableCell className="text-right px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedPendaftar(p)
                              setIsFormOpen(true)
                            }}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Data
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                              onClick={() => {
                                setPendaftarToDelete(p)
                                setIsDeleteDialogOpen(true)
                              }}
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

          {pendaftarInfo && pendaftarInfo.total > 0 && (
            <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/30">
              <div className="flex items-center gap-4">
                <div className="text-sm text-slate-500">
                  Menampilkan <span className="font-medium text-slate-900">{Math.min(pendaftarInfo.total, (page - 1) * Number(limit) + 1)}</span>
                  {' '}- <span className="font-medium text-slate-900">{Math.min(pendaftarInfo.total, page * Number(limit))}</span>
                  {' '}dari <span className="font-medium text-slate-900">{pendaftarInfo.total}</span> data
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Baris:</span>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(e.target.value)
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

  // School Search
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
          <Label htmlFor="nmLengkap">Nama Lengkap *</Label>
          <Input id="nmLengkap" name="nmLengkap" defaultValue={initialData.nmLengkap} required placeholder="Masukkan nama sesuai ijazah" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="noHandphone">No. Handphone (WA)</Label>
          <Input id="noHandphone" name="noHandphone" defaultValue={initialData.noHandphone || ''} placeholder="0812..." />
        </div>

        {/* Row 2: Birth & Year */}
        <div className="space-y-1.5">
          <Label htmlFor="tempatLahir">Tempat Lahir</Label>
          <Input id="tempatLahir" name="tempatLahir" defaultValue={initialData.tempatLahir || ''} placeholder="Contoh: Bantarujeg" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tanggalLahir">Tanggal Lahir</Label>
          <Input id="tanggalLahir" name="tanggalLahir" type="date" defaultValue={initialData.tanggalLahir || ''} />
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
          <Label htmlFor="asalSekolah">Asal Sekolah *</Label>
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
                  className="w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 border-b border-slate-100 flex flex-col group"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setSekolahQuery(s.sekolah)
                    setShowSekolahResults(false)
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900 group-hover:text-emerald-700">{s.sekolah}</span>
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
          <Label htmlFor="alamat">Alamat Lengkap</Label>
          <Textarea
            id="alamat"
            name="alamat"
            defaultValue={initialData.alamat || ''}
            placeholder="Jl. Contoh No. 123"
            rows={2}
            className="min-h-0"
          />
        </div>

        {/* Row 4: Registration Process */}
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
        <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 min-w-[100px]">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Simpan
        </Button>
      </DialogFooter>
    </form>
  )
}
