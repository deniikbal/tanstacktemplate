import {
  getAllKelulusan,
  updateKelulusan,
  deleteKelulusan,
  bulkDeleteKelulusan,
  syncKelulusan,
  getJalurStats,
} from '@/lib/server/kelulusan'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Loader2, Trash2, Pencil, GraduationCap, AlertCircle, CheckCircle2, XCircle, ChevronLeft, ChevronRight, MoreHorizontal, RefreshCw } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { createFileRoute } from '@tanstack/react-router'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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


export const Route = createFileRoute('/dashboard/kelulusan')({
  component: KelulusanPage,
})

function KelulusanPage() {
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState('10')
  const [isPending, setIsPending] = useState(true)
  const [jalurStats, setJalurStats] = useState<any[]>([])

  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingData, setEditingData] = useState<any>(null)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [dataToDelete, setDataToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [tahapFilter, setTahapFilter] = useState('all')
  const [jalurFilter, setJalurFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  const fetchKelulusan = async () => {
    setIsPending(true)
    try {
      const res = await getAllKelulusan({
        data: {
          page,
          limit: Number(limit),
          search: searchTerm || undefined,
          tahap: tahapFilter !== 'all' ? tahapFilter : undefined,
          jalur: jalurFilter !== 'all' ? jalurFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        }
      })
      setData(res.data)
      setTotal(res.pagination.total)
    } catch (err) {
      toast.error('Gagal mengambil data kelulusan')
    } finally {
      setIsPending(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchKelulusan()
    }, 300)
    return () => clearTimeout(timer)
  }, [page, limit, searchTerm, tahapFilter, jalurFilter, statusFilter])

  const fetchStats = async () => {
    try {
      const stats = await getJalurStats()
      setJalurStats(stats as any[])
    } catch (err) {
      console.error('Failed to fetch stats', err)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const statsMap = React.useMemo(() => {
    const map: Record<string, number> = {}
    jalurStats.forEach(s => {
      const key = s.jalur || '-'
      map[key] = s.count
    })
    return map
  }, [jalurStats])

  const handleDelete = (id: number) => {
    setDataToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const executeDelete = async () => {
    if (!dataToDelete) return
    setIsDeleting(true)
    try {
      await deleteKelulusan({ data: { id: dataToDelete } })
      toast.success('Data berhasil dihapus')
      setIsDeleteDialogOpen(false)
      setDataToDelete(null)
      fetchKelulusan()
    } catch (err) {
      toast.error('Gagal menghapus data')
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(data.map((item: any) => item.id)))
    }
  }

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return
    setIsBulkDeleteDialogOpen(true)
  }

  const executeBulkDelete = async () => {
    setIsBulkDeleting(true)
    try {
      await bulkDeleteKelulusan({ data: { ids: Array.from(selectedIds) } })
      toast.success('Data berhasil dihapus masal')
      setSelectedIds(new Set())
      setIsBulkDeleteDialogOpen(false)
      fetchKelulusan()
    } catch (err) {
      toast.error('Gagal menghapus data masal')
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const totalPages = Math.ceil(total / Number(limit))

  const handleCopy = (text: string, label: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    toast.success(`${label} disalin`, {
      description: text,
      duration: 1500,
    })
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <GraduationCap className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Manajemen Kelulusan</h1>
          <p className="text-xs md:text-sm text-slate-500">Kelola status kelulusan siswa pendaftar</p>
        </div>
      </div>

      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSuccess={() => {
          fetchKelulusan()
          fetchStats()
          setIsSyncModalOpen(false)
        }}
      />

      <EditGraduationModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingData(null)
        }}
        data={editingData}
        onSuccess={() => {
          fetchKelulusan()
          setIsEditModalOpen(false)
          setEditingData(null)
        }}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="w-[95vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Kelulusan?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data ini?
              <br />
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 justify-end">
            <AlertDialogCancel disabled={isDeleting} className="mt-0">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                executeDelete()
              }}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent className="w-[95vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Masal Data Kelulusan?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus <strong>{selectedIds.size}</strong> data sekaligus?
              <br />
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 justify-end">
            <AlertDialogCancel disabled={isBulkDeleting} className="mt-0">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                executeBulkDelete()
              }}
              disabled={isBulkDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isBulkDeleting ? 'Menghapus...' : 'Hapus Semua'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      <Card className="shadow-sm border-slate-200">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center justify-center sm:justify-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
              Daftar Status Kelulusan
            </CardTitle>
            <CardDescription>
              Kelola status kelulusan siswa, edit status, atau tambah data baru.
            </CardDescription>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={() => setIsSyncModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none font-bold"
            >
              <RefreshCw className="mr-2 h-4 w-4 text-white" />
              Sinkronkan Data Siswa
            </Button>
            {selectedIds.size > 0 && (
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="flex-1 sm:flex-none"
              >
                {isBulkDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Hapus ({selectedIds.size})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center gap-3 p-4 border-b border-slate-200 bg-slate-50/50">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                {isPending ? (
                  <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 text-slate-400" />
                )}
              </div>
              <Input
                placeholder="Cari nama/nisn..."
                className="pl-9 bg-white h-9 border-slate-200 shadow-sm"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
              />
            </div>

            <div className="grid grid-cols-2 lg:flex lg:items-center gap-2">
              <Select value={tahapFilter} onValueChange={(val) => {
                setTahapFilter(val)
                setJalurFilter('all')
                setPage(1)
              }}>
                <SelectTrigger className="bg-white h-9 border-slate-200 shadow-sm focus:ring-blue-500 lg:w-[130px]">
                  <SelectValue placeholder="Tahap" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tahap</SelectItem>
                  <SelectItem value="Tahap 1">Tahap 1</SelectItem>
                  <SelectItem value="Tahap 2">Tahap 2</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(val) => {
                setStatusFilter(val)
                setPage(1)
              }}>
                <SelectTrigger className="bg-white h-9 border-slate-200 shadow-sm focus:ring-blue-500 lg:w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="Lulus">Lulus</SelectItem>
                  <SelectItem value="Tidak Lulus">Tidak Lulus</SelectItem>
                </SelectContent>
              </Select>

              <Select value={jalurFilter} onValueChange={(val) => {
                setJalurFilter(val)
                setPage(1)
              }}>
                <SelectTrigger className="col-span-2 lg:w-[180px] bg-white h-9 border-slate-200 shadow-sm focus:ring-blue-500">
                  <SelectValue placeholder="Pilih Jalur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jalur</SelectItem>
                  {tahapFilter === 'all' ? (
                    <>
                      <SelectItem value="KETM">KETM</SelectItem>
                      <SelectItem value="DOMISILI">DOMISILI</SelectItem>
                      <SelectItem value="AFIRMASI">AFIRMASI</SelectItem>
                      <SelectItem value="ANAK GURU">ANAK GURU</SelectItem>
                      <SelectItem value="MUTASI">MUTASI</SelectItem>
                      <SelectItem value="Kejuaraan Akademik">Kejuaraan Akademik</SelectItem>
                      <SelectItem value="Kejuaraan Non Akademik">Kejuaraan Non Akademik</SelectItem>
                      <SelectItem value="Kepemimpinan">Kepemimpinan</SelectItem>
                      <SelectItem value="Prestasi Raport">Prestasi Raport</SelectItem>
                    </>
                  ) : tahapFilter === 'Tahap 1' ? (
                    <>
                      <SelectItem value="KETM">KETM</SelectItem>
                      <SelectItem value="DOMISILI">DOMISILI</SelectItem>
                      <SelectItem value="AFIRMASI">AFIRMASI</SelectItem>
                      <SelectItem value="ANAK GURU">ANAK GURU</SelectItem>
                      <SelectItem value="MUTASI">MUTASI</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="Kejuaraan Akademik">Kejuaraan Akademik</SelectItem>
                      <SelectItem value="Kejuaraan Non Akademik">Kejuaraan Non Akademik</SelectItem>
                      <SelectItem value="Kepemimpinan">Kepemimpinan</SelectItem>
                      <SelectItem value="Prestasi Raport">Prestasi Raport</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="w-12 text-center text-slate-500 font-semibold">
                    <Checkbox
                      checked={data.length > 0 && selectedIds.size === data.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-12 text-center text-slate-500 font-semibold">No</TableHead>
                  <TableHead className="font-semibold text-slate-800">Nama Siswa</TableHead>
                  <TableHead className="font-semibold text-slate-800">NISN / No. Daftar</TableHead>
                  <TableHead className="font-semibold text-slate-800">Asal Sekolah</TableHead>
                  <TableHead className="font-semibold text-slate-800">Status</TableHead>
                  <TableHead className="text-right font-semibold text-slate-800 pr-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending && !data.length ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-32">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin opacity-20" />
                        <p>Memuat data...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2 opacity-50">
                        <AlertCircle className="h-8 w-8" />
                        <p>Belum ada data kelulusan.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item: any, index: number) => {
                    const showHeader = index === 0 || data[index - 1].jalur !== item.jalur
                    return (
                      <React.Fragment key={item.id}>
                        {showHeader && (
                          <TableRow className="bg-slate-100/30 hover:bg-slate-100/30">
                            <TableCell colSpan={7} className="py-2 px-6">
                              <div className="flex items-center gap-2">
                                <Badge className={`${getJalurColor(item.jalur)} text-white border-none px-2 text-[10px] font-bold uppercase tracking-wider flex gap-2 h-5`}>
                                  <span>JALUR: {item.jalur}</span>
                                  <span className="bg-black/20 px-1 rounded-sm text-[11px] font-black min-w-[1.5rem] text-center">{statsMap[item.jalur || '-'] || 0}</span>
                                </Badge>
                                <div className="h-px flex-1 bg-slate-200" />
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                        <TableRow className={`${selectedIds.has(item.id) ? 'bg-blue-50/50' : 'hover:bg-slate-50/50'} transition-colors group ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
                          <TableCell className="text-center">
                            <Checkbox
                              checked={selectedIds.has(item.id)}
                              onCheckedChange={() => toggleSelect(item.id)}
                            />
                          </TableCell>
                          <TableCell className="text-center text-slate-400">{(page - 1) * Number(limit) + index + 1}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{item.studentName}</span>
                              <div className="flex gap-1">
                                <Badge variant="outline" className="text-[10px] h-4 px-1.5 bg-slate-50 text-slate-500 border-slate-200">
                                  {item.tahap}
                                </Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span
                                className="text-sm text-slate-600 font-medium hover:text-blue-600 cursor-pointer transition-colors"
                                onClick={() => handleCopy(item.studentNisn, 'NISN')}
                                title="Klik untuk salin NISN"
                              >
                                {item.studentNisn}
                              </span>
                              <span
                                className="text-[10px] text-muted-foreground uppercase font-semibold hover:text-blue-600 cursor-pointer transition-colors"
                                onClick={() => handleCopy(item.noDaftar, 'No. Daftar')}
                                title="Klik untuk salin No. Daftar"
                              >
                                {item.noDaftar || '-'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {item.sekolahAsal || '-'}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={item.status} />
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setEditingData(item)
                                  setIsEditModalOpen(true)
                                }}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit Data
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => handleDelete(item.id)}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Hapus Data
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-100">
            {isPending && !data.length ? (
              <div className="p-8 text-center flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500/20" />
                <p className="text-sm text-slate-400 font-medium">Memuat data kelulusan...</p>
              </div>
            ) : data.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Tidak ada data ditemukan.</p>
              </div>
            ) : (
              data.map((item: any, index: number) => {
                const showHeader = index === 0 || data[index - 1].jalur !== item.jalur
                return (
                  <React.Fragment key={item.id}>
                    {showHeader && (
                      <div className="px-4 py-1.5 bg-slate-50 border-y border-slate-100 flex items-center gap-2 sticky top-0 z-10">
                        <Badge className={`${getJalurColor(item.jalur)} text-white h-5 px-2 text-[9px] font-black uppercase tracking-widest border-none flex gap-2`}>
                          <span>JALUR: {item.jalur}</span>
                          <span className="bg-black/20 px-1 rounded-sm text-[10px] min-w-[1.2rem] text-center">{statsMap[item.jalur || '-'] || 0}</span>
                        </Badge>
                        <div className="h-px flex-1 bg-slate-200/50" />
                      </div>
                    )}
                    <div className={`p-4 bg-white hover:bg-slate-50/50 transition-colors ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-1 flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-400">
                            {(page - 1) * Number(limit) + index + 1}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-slate-800 leading-tight uppercase tracking-tight">{item.studentName}</span>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              <Badge variant="outline" className="text-[9px] h-3.5 px-1 bg-slate-50 text-slate-500 border-slate-200 uppercase">
                                {item.tahap}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-1">
                              <MoreHorizontal className="h-4 w-4 text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => {
                              setEditingData(item)
                              setIsEditModalOpen(true)
                            }}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Data
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Hapus Data
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="space-y-1.5 ml-7">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">NISN / No. Daftar</span>
                          <div className="text-right">
                            <div
                              className="font-bold text-slate-600 hover:text-blue-600 active:scale-95 transition-all cursor-pointer"
                              onClick={() => handleCopy(item.studentNisn, 'NISN')}
                            >
                              {item.studentNisn}
                            </div>
                            <div
                              className="text-[10px] text-slate-400 uppercase font-black hover:text-blue-600 active:scale-95 transition-all cursor-pointer"
                              onClick={() => handleCopy(item.noDaftar, 'No. Daftar')}
                            >
                              {item.noDaftar || '-'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Asal Sekolah</span>
                          <span className="font-semibold text-slate-600">{item.sekolahAsal || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs text-slate-400 font-medium">Status Kelulusan</span>
                          <StatusBadge status={item.status} />
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                )
              })
            )}
          </div>

          {total > 0 && (
            <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <div className="text-sm text-slate-500">
                  Menampilkan <span className="font-medium text-slate-900">{Math.min(total, (page - 1) * Number(limit) + 1)}</span>
                  {' '}- <span className="font-medium text-slate-900">{Math.min(total, page * Number(limit))}</span>
                  {' '}dari <span className="font-medium text-slate-900">{total}</span> data
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Baris:</span>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(e.target.value)
                      setPage(1)
                    }}
                    className="text-xs border border-slate-200 rounded px-1 py-0.5 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                            ? 'bg-blue-600 text-white font-medium'
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
    </div >
  )
}


function getJalurColor(jalur: string) {
  const j = jalur?.toUpperCase() || ''
  if (j.includes('KETM')) return 'bg-rose-600 hover:bg-rose-700'
  if (j.includes('DOMISILI')) return 'bg-emerald-600 hover:bg-emerald-700'
  if (j.includes('AFIRMASI')) return 'bg-amber-600 hover:bg-amber-700'
  if (j.includes('GURU')) return 'bg-indigo-600 hover:bg-indigo-700'
  if (j.includes('MUTASI')) return 'bg-violet-600 hover:bg-violet-700'
  if (j.includes('AKADEMIK')) return 'bg-sky-600 hover:bg-sky-700'
  if (j.includes('RAPORT')) return 'bg-cyan-600 hover:bg-cyan-700'
  if (j.includes('PEMIMPIN')) return 'bg-orange-600 hover:bg-orange-700'
  return 'bg-slate-600 hover:bg-slate-700'
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'LULUS') {
    return (
      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 flex w-fit gap-1 items-center px-2 py-0.5">
        <CheckCircle2 className="h-3 w-3" />
        LULUS
      </Badge>
    )
  }
  if (status === 'TIDAK LULUS') {
    return (
      <Badge variant="destructive" className="flex w-fit gap-1 items-center bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200 px-2 py-0.5 shadow-none">
        <XCircle className="h-3 w-3" />
        TIDAK LULUS
      </Badge>
    )
  }
  return null
}

function SyncModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [tahap, setTahap] = useState('Tahap 1')
  const [status, setStatus] = useState('LULUS')

  const handleSync = async () => {
    setLoading(true)
    try {
      const res = await syncKelulusan({ data: { tahap, status } })
      toast.success(`${res.synced} data siswa baru berhasil disinkronkan ke tabel kelulusan dengan status ${status}.`)
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || 'Gagal sinkronisasi data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-blue-600" />
            Sinkronisasi Data Kelulusan
          </DialogTitle>
          <DialogDescription>
            Menarik semua data siswa yang belum ada di Manajemen Kelulusan secara otomatis.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="space-y-2 w-full">
            <Label className="text-sm font-bold text-slate-700">Pilih Tahap Kelulusan</Label>
            <Select value={tahap} onValueChange={setTahap}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tahap 1">Tahap 1</SelectItem>
                <SelectItem value="Tahap 2">Tahap 2</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground italic">
              *Jalur pendaftaran akan disesuaikan otomatis dengan data di profil siswa.
            </p>
          </div>

          <div className="space-y-2 w-full">
            <Label className="text-sm font-bold text-slate-700">Status Kelulusan Default</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LULUS">LULUS</SelectItem>
                <SelectItem value="TIDAK LULUS">TIDAK LULUS</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground italic">
              *Semua siswa baru yang masuk akan diberikan status ini.
            </p>
          </div>
        </div>

        <DialogFooter className="sm:justify-between gap-2 border-t pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1 sm:flex-none">
            Batal
          </Button>
          <Button onClick={handleSync} disabled={loading} className="bg-blue-600 hover:bg-blue-700 font-bold flex-1 sm:flex-none">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Mulai Sinkronisasi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditGraduationModal({
  isOpen,
  onClose,
  data,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  data?: any
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    status: 'LULUS',
    tahap: 'Tahap 1',
    jalur: '',
  })

  useEffect(() => {
    if (data) {
      setFormData({
        status: data.status,
        tahap: data.tahap,
        jalur: data.jalur,
      })
    }
  }, [data])

  const handleUpdate = async () => {
    if (!data) return
    setLoading(true)
    try {
      await updateKelulusan({
        data: {
          id: data.id,
          data: formData,
        },
      })
      toast.success('Data kelulusan berhasil diperbarui')
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Edit Status Kelulusan</DialogTitle>
          <DialogDescription>
            Memperbarui status atau tahap untuk <strong>{data?.studentName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Tahap</Label>
            <Select value={formData.tahap} onValueChange={(v) => setFormData({ ...formData, tahap: v })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tahap 1">Tahap 1</SelectItem>
                <SelectItem value="Tahap 2">Tahap 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Jalur Pendaftaran</Label>
            <Select value={formData.jalur} onValueChange={(v) => setFormData({ ...formData, jalur: v })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="KETM">KETM</SelectItem>
                <SelectItem value="DOMISILI">DOMISILI</SelectItem>
                <SelectItem value="AFIRMASI">AFIRMASI</SelectItem>
                <SelectItem value="ANAK GURU">ANAK GURU</SelectItem>
                <SelectItem value="MUTASI">MUTASI</SelectItem>
                <SelectItem value="Kejuaraan Akademik">Kejuaraan Akademik</SelectItem>
                <SelectItem value="Kejuaraan Non Akademik">Kejuaraan Non Akademik</SelectItem>
                <SelectItem value="Kepemimpinan">Kepemimpinan</SelectItem>
                <SelectItem value="Prestasi Raport">Prestasi Raport</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Hasil / Status</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LULUS">LULUS</SelectItem>
                <SelectItem value="TIDAK LULUS">TIDAK LULUS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Batal</Button>
          <Button onClick={handleUpdate} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Perubahan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

