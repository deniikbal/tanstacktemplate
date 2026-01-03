import {
  getAllKelulusan,
  searchStudents,
  createKelulusanFn,
  updateKelulusan,
  deleteKelulusan,
  bulkCreateKelulusanFn,
} from '@/lib/server/kelulusan'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Search, Loader2, Users, Check, Trash2, Pencil, GraduationCap, AlertCircle, CheckCircle2, XCircle, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { useState, useEffect } from 'react'
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

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [editingData, setEditingData] = useState<any>(null)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [dataToDelete, setDataToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [tahapFilter, setTahapFilter] = useState('all')
  const [jalurFilter, setJalurFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

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
    }, 500)
    return () => clearTimeout(timer)
  }, [page, limit, searchTerm, tahapFilter, jalurFilter, statusFilter])

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

  const totalPages = Math.ceil(total / Number(limit))

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <GraduationCap className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Kelulusan</h1>
          <p className="text-sm text-slate-500">Kelola status kelulusan siswa pendaftar</p>
        </div>
      </div>

      <GraduationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingData={editingData}
        onSuccess={() => {
          fetchKelulusan()
          setIsModalOpen(false)
        }}
      />

      <BulkGraduationModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={() => {
          fetchKelulusan()
          setIsBulkModalOpen(false)
        }}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Kelulusan?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data ini?
              <br />
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
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

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Daftar Status Kelulusan
            </CardTitle>
            <CardDescription>
              Kelola status kelulusan siswa, edit status, atau tambah data baru.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsBulkModalOpen(true)}
            >
              <Users className="mr-2 h-4 w-4 text-slate-500" />
              Bulk Tambah
            </Button>
            <Button
              onClick={() => {
                setEditingData(null)
                setIsModalOpen(true)
              }}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="mr-2 h-4 w-4 text-white" />
              Tambah Data
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Filter Bar */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-4 border-b border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-2 flex-1 max-w-5xl">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Cari siswa..."
                  className="pl-9 bg-white h-9 border-slate-200"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setPage(1)
                  }}
                />
              </div>

              <Select value={tahapFilter} onValueChange={(val) => {
                setTahapFilter(val)
                setJalurFilter('all') // Reset jalur saat tahap berubah
                setPage(1)
              }}>
                <SelectTrigger className="w-[130px] bg-white h-9 border-slate-200 shadow-sm focus:ring-emerald-500">
                  <SelectValue placeholder="Tahap" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tahap</SelectItem>
                  <SelectItem value="Tahap 1">Tahap 1</SelectItem>
                  <SelectItem value="Tahap 2">Tahap 2</SelectItem>
                </SelectContent>
              </Select>

              <Select value={jalurFilter} onValueChange={(val) => {
                setJalurFilter(val)
                setPage(1)
              }}>
                <SelectTrigger className="w-[180px] bg-white h-9 border-slate-200 shadow-sm focus:ring-emerald-500">
                  <SelectValue placeholder="Jalur" />
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

              <Select value={statusFilter} onValueChange={(val) => {
                setStatusFilter(val)
                setPage(1)
              }}>
                <SelectTrigger className="w-[150px] bg-white h-9 border-slate-200 shadow-sm focus:ring-emerald-500">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="Lulus">Lulus</SelectItem>
                  <SelectItem value="Tidak Lulus">Tidak Lulus</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-12 text-center text-slate-500 font-semibold">No</TableHead>
                <TableHead className="font-semibold text-slate-800">Nama Siswa</TableHead>
                <TableHead className="font-semibold text-slate-800">NISN / No. Daftar</TableHead>
                <TableHead className="font-semibold text-slate-800">Tahap</TableHead>
                <TableHead className="font-semibold text-slate-800">Jalur</TableHead>
                <TableHead className="font-semibold text-slate-800">Status</TableHead>
                <TableHead className="text-right font-semibold text-slate-800 pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-32">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin opacity-20" />
                      <p>Memuat data...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2 opacity-50">
                      <AlertCircle className="h-8 w-8" />
                      <p>Belum ada data kelulusan.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item: any, index: number) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="text-center text-slate-400">{(page - 1) * Number(limit) + index + 1}</TableCell>
                    <TableCell className="font-semibold text-slate-700">{item.studentName}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600 font-medium">{item.studentNisn}</span>
                        <span className="text-xs text-muted-foreground uppercase">{item.noDaftar || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                        {item.tahap}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">{item.jalur || '-'}</TableCell>
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
                            setIsModalOpen(true)
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
                ))
              )}
            </TableBody>
          </Table>

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
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'LULUS') {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 flex w-fit gap-1 items-center px-2 py-0.5">
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

function GraduationModal({
  isOpen,
  onClose,
  editingData,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  editingData?: any
  onSuccess: () => void
}) {
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [students, setStudents] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [formData, setFormData] = useState({
    jalur: 'ZONASI',
    status: 'LULUS',
    tahap: 'Tahap 1',
  })

  useEffect(() => {
    if (editingData) {
      setSelectedStudent({
        id: editingData.studentId,
        nmSiswa: editingData.studentName,
        nisn: editingData.studentNisn,
        noDaftar: editingData.noDaftar,
      })
      setFormData({
        jalur: editingData.jalur,
        status: editingData.status,
        tahap: editingData.tahap,
      })
      setSearch(editingData.studentName)
    } else if (isOpen) {
      setSelectedStudent(null)
      setFormData({
        jalur: 'ZONASI',
        status: 'LULUS',
        tahap: 'Tahap 1',
      })
      setSearch('')
      setStudents([])
    }
  }, [editingData, isOpen])

  const handleSearch = async (val: string) => {
    setSearch(val)
    if (val.length < 2) {
      setStudents([])
      return
    }

    setLoading(true)
    try {
      const results = await searchStudents({ data: { q: val } })
      setStudents(results || [])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedStudent) {
      toast.error('Pilih siswa terlebih dahulu')
      return
    }

    setSubmitting(true)
    try {
      if (editingData) {
        await updateKelulusan({
          data: {
            id: editingData.id,
            data: {
              ...formData,
              studentId: selectedStudent.id,
            },
          },
        })
        toast.success('Data kelulusan berhasil diperbarui')
      } else {
        await createKelulusanFn({
          data: {
            ...formData,
            studentId: selectedStudent.id,
          },
        })
        toast.success('Data kelulusan berhasil ditambahkan')
      }
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan data')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editingData ? 'Edit Data Kelulusan' : 'Tambah Data Kelulusan'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="search">Cari Siswa (Nama/NISN/No.Daftar)</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Ketik minimal 2 huruf..."
                className="pl-8"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                disabled={!!editingData}
              />
            </div>
            {loading && <div className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Mencari...</div>}
            {students.length > 0 && !selectedStudent && (
              <div className="border rounded-md mt-1 divide-y shadow-sm max-h-[200px] overflow-auto bg-white z-20 absolute w-full top-[calc(100%-8px)]">
                {students.map(s => (
                  <div
                    key={s.id}
                    className="p-2 hover:bg-slate-50 cursor-pointer text-sm"
                    onClick={() => {
                      setSelectedStudent(s)
                      setSearch(s.nmSiswa)
                      setStudents([])
                    }}
                  >
                    <div className="font-medium">{s.nmSiswa}</div>
                    <div className="text-xs text-muted-foreground">NISN: {s.nisn} | No. Daftar: {s.noDaftar}</div>
                  </div>
                ))}
              </div>
            )}
            {selectedStudent && (
              <div className="bg-emerald-50 border border-emerald-100 p-2 rounded-md text-xs flex justify-between items-center mt-1">
                <span>Terpilih: <strong>{selectedStudent.nmSiswa}</strong></span>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50" onClick={() => setSelectedStudent(null)} disabled={!!editingData}>Ganti</Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Tahap Pendaftaran</Label>
              <Select value={formData.tahap} onValueChange={(v) => setFormData({ ...formData, tahap: v, jalur: v === 'Tahap 1' ? 'KETM' : 'Kejuaraan Akademik' })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Tahap" />
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
                  <SelectValue placeholder="Pilih Jalur" />
                </SelectTrigger>
                <SelectContent>
                  {formData.tahap === 'Tahap 1' ? (
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

          <div className="grid gap-2">
            <Label>Hasil / Status</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
              <SelectTrigger className="w-full text-left">
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LULUS">LULUS</SelectItem>
                <SelectItem value="TIDAK LULUS">TIDAK LULUS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Batal</Button>
          <Button onClick={handleSubmit} disabled={submitting || !selectedStudent} className="bg-emerald-600 hover:bg-emerald-700">
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editingData ? 'Simpan Perubahan' : 'Tambah Data'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function BulkGraduationModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [students, setStudents] = useState<any[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState({
    jalur: 'ZONASI',
    status: 'LULUS',
    tahap: 'Tahap 1',
  })

  useEffect(() => {
    if (isOpen) {
      setSearch('')
      setStudents([])
      setSelectedIds(new Set())
      setFormData({ jalur: 'ZONASI', status: 'LULUS', tahap: 'Tahap 1' })
    }
  }, [isOpen])

  const handleSearch = async (val: string) => {
    setSearch(val)
    if (val.length < 2) {
      setStudents([])
      return
    }

    setLoading(true)
    try {
      const results = await searchStudents({ data: { q: val } })
      setStudents(results || [])
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handleSubmit = async () => {
    if (selectedIds.size === 0) {
      toast.error('Pilih minimal satu siswa')
      return
    }

    setSubmitting(true)
    try {
      const res = await bulkCreateKelulusanFn({
        data: {
          studentIds: Array.from(selectedIds),
          ...formData,
        },
      })
      toast.success(`${res.imported} data berhasil ditambahkan, ${res.skipped} dilewati (sudah ada).`)
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || 'Gagal memproses data bulk')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600" />
            Bulk Tambah Data Kelulusan
          </DialogTitle>
          <DialogDescription>
            Pilih beberapa siswa untuk diberikan status kelulusan yang sama secara massal.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4 py-4">
          <div className="grid gap-2">
            <Label>1. Cari & Pilih Siswa ({selectedIds.size} terpilih)</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan Nama, NISN, atau No. Daftar..."
                className="pl-8"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <div className="h-[250px] border rounded-md p-2 bg-slate-50/50 mt-2 overflow-y-auto">
              {loading && (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground opacity-30" />
                </div>
              )}

              {!loading && students.length === 0 && search.length >= 2 && (
                <div className="text-center py-8 text-muted-foreground text-sm italic">
                  Siswa tidak ditemukan.
                </div>
              )}

              {!loading && students.length === 0 && search.length < 2 && (
                <div className="text-center py-8 text-muted-foreground text-sm italic opacity-50">
                  Masukkan nama atau NISN untuk mencari...
                </div>
              )}

              <div className="space-y-1">
                {students.map((s) => (
                  <div
                    key={s.id}
                    className={`flex items-center space-x-3 p-3 rounded-md transition-colors border cursor-pointer select-none ${selectedIds.has(s.id)
                      ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-100'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    onClick={() => toggleSelect(s.id)}
                  >
                    <Checkbox id={`student-${s.id}`} checked={selectedIds.has(s.id)} onCheckedChange={() => toggleSelect(s.id)} />
                    <div className="flex-1 min-w-0 pointer-events-none">
                      <div className="font-semibold text-slate-700 text-sm truncate">{s.nmSiswa}</div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        NISN: {s.nisn} <span className="mx-1">•</span> NO: {s.noDaftar}
                      </div>
                    </div>
                    {selectedIds.has(s.id) && <Check className="h-4 w-4 text-emerald-600 shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border p-4 rounded-lg space-y-4 shadow-inner">
            <Label className="font-bold text-slate-800 text-sm">2. Atur Status Massal</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-[10px] uppercase font-bold text-slate-500">Tahap</Label>
                <Select value={formData.tahap} onValueChange={(v) => setFormData({ ...formData, tahap: v, jalur: v === 'Tahap 1' ? 'KETM' : 'Kejuaraan Akademik' })}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tahap 1">Tahap 1</SelectItem>
                    <SelectItem value="Tahap 2">Tahap 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] uppercase font-bold text-slate-500">Jalur</Label>
                <Select value={formData.jalur} onValueChange={(v) => setFormData({ ...formData, jalur: v })}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.tahap === 'Tahap 1' ? (
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
            <div className="grid gap-2">
              <Label className="text-[10px] uppercase font-bold text-slate-500">Hasil / Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LULUS">LULUS</SelectItem>
                  <SelectItem value="TIDAK LULUS">TIDAK LULUS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2 border-t mt-auto">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || selectedIds.size === 0}
            className="bg-emerald-600 hover:bg-emerald-700 font-bold min-w-[150px]"
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Users className="mr-2 h-4 w-4" />
            )}
            SIMPAN {selectedIds.size} SISWA
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

