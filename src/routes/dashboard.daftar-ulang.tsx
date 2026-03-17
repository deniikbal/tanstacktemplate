import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { toast } from 'sonner'
import { Loader2, ClipboardList, Search, CheckCircle2, AlertCircle, XCircle, Phone, MessageCircle, ChevronLeft, ChevronRight, FileText, X, User, Users, GraduationCap } from 'lucide-react'
import { getDaftarUlangList, upsertDaftarUlang } from '@/lib/server/daftar-ulang'

export const Route = createFileRoute('/dashboard/daftar-ulang')({
  component: DaftarUlangPage,
})

function DaftarUlangPage() {
  const [data, setData] = useState<any[]>([])
  const [isPending, setIsPending] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [jalurFilter, setJalurFilter] = useState('all')
  const [tahapFilter, setTahapFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [savingId, setSavingId] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [globalStats, setGlobalStats] = useState({ sudah: 0, belum: 0, belumLengkap: 0 })
  const [previewConfig, setPreviewConfig] = useState<{
    isOpen: boolean,
    driveId: string,
    label: string,
    studentId: number | null,
    field: string | null
  }>({
    isOpen: false,
    driveId: '',
    label: '',
    studentId: null,
    field: null
  })
  const [detailStudent, setDetailStudent] = useState<any | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const limit = 10

  const fetchDaftarUlang = async () => {
    setIsPending(true)
    try {
      const res = await getDaftarUlangList({
        data: {
          page,
          limit,
          search: searchTerm,
          jalur: jalurFilter,
          tahap: tahapFilter,
          status: statusFilter
        }
      })
      setData(res.students)
      setTotalPages(res.totalPages)
      setTotal(res.total)
      if (res.stats) {
        setGlobalStats(res.stats)
      }
    } catch (err) {
      toast.error('Gagal mengambil data daftar ulang')
    } finally {
      setIsPending(false)
    }
  }

  useEffect(() => {
    fetchDaftarUlang()
  }, [page, jalurFilter, tahapFilter, statusFilter])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) {
        setPage(1)
      } else {
        fetchDaftarUlang()
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const calculateKeterangan = (daftarUlang: any) => {
    const isComplete = daftarUlang.skl && daftarUlang.tatib && daftarUlang.kk &&
      daftarUlang.bukti && daftarUlang.pernyataan;
    const isNone = !daftarUlang.skl && !daftarUlang.tatib && !daftarUlang.kk &&
      !daftarUlang.bukti && !daftarUlang.pernyataan;
    return isComplete ? 'Lengkap' : isNone ? 'Belum Daftar Ulang' : 'Belum Lengkap';
  }

  const handleCheckboxChange = async (itemId: number, field: string, checked: boolean) => {
    // 1. Update local state for immediate feedback
    let updatedItem: any = null;
    setData(prev => prev.map(item => {
      if (item.id === itemId) {
        updatedItem = {
          ...item,
          daftarUlang: { ...item.daftarUlang, [field]: checked }
        };
        return updatedItem;
      }
      return item;
    }));

    // 2. Auto save to database
    if (updatedItem) {
      setSavingId(itemId);
      try {
        const keteranganStatus = calculateKeterangan(updatedItem.daftarUlang);
        await upsertDaftarUlang({
          data: {
            kelulusanId: itemId,
            ...updatedItem.daftarUlang,
            keterangan: keteranganStatus
          }
        });
        toast.success(`Data ${updatedItem.nmSiswa} diperbarui`, {
          description: `Status berkas: ${keteranganStatus}`,
          duration: 2000,
        });

        // Refresh stats after change
        fetchDaftarUlang();
      } catch (err) {
        toast.error('Gagal menyimpan perubahan otomatis');
        // Optional: revert local state on error
      } finally {
        setSavingId(null);
      }
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <ClipboardList className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daftar Ulang</h1>
          <p className="text-sm text-slate-500">Kelola berkas pendaftaran ulang siswa yang sudah lulus</p>
        </div>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className={`cursor-pointer transition-all hover:shadow-md rounded-md ${statusFilter === 'sudah' ? 'ring-2 ring-blue-500 border-blue-500' : 'border-slate-300 bg-blue-50/30'}`}
          onClick={() => {
            const newFilter = statusFilter === 'sudah' ? 'all' : 'sudah'
            setStatusFilter(newFilter)
            setPage(1)
          }}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">Sudah Daftar Ulang</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-blue-700">{globalStats.sudah}</span>
                <span className="text-xs text-blue-600/70">Siswa</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md rounded-md ${statusFilter === 'belum' ? 'ring-2 ring-rose-500 border-rose-500' : 'border-slate-300 bg-rose-50/30'}`}
          onClick={() => {
            const newFilter = statusFilter === 'belum' ? 'all' : 'belum'
            setStatusFilter(newFilter)
            setPage(1)
          }}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-rose-600 uppercase tracking-wider">Belum Daftar Ulang</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-rose-700">{globalStats.belum}</span>
                <span className="text-xs text-rose-600/70">Siswa</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md rounded-md ${statusFilter === 'belum-lengkap' ? 'ring-2 ring-orange-500 border-orange-500' : 'border-slate-300 bg-orange-50/30'}`}
          onClick={() => {
            const newFilter = statusFilter === 'belum-lengkap' ? 'all' : 'belum-lengkap'
            setStatusFilter(newFilter)
            setPage(1)
          }}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-orange-600 uppercase tracking-wider">Belum Lengkap</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-orange-700">{globalStats.belumLengkap}</span>
                <span className="text-xs text-orange-600/70">Siswa</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="shadow-sm border-slate-300 rounded-md overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                Monitoring Berkas Daftar Ulang
              </CardTitle>
              <CardDescription>
                Verifikasi kelengkapan berkas siswa yang dinyatakan Lulus.
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  {isPending ? (
                    <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 text-slate-400" />
                  )}
                </div>
                 <Input
                   placeholder="Cari nama atau asal sekolah..."
                   className="pl-9 bg-white h-9 border-slate-300 rounded-md text-xs"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
              <Select value={jalurFilter} onValueChange={(v) => {
                setJalurFilter(v)
                setPage(1)
              }}>
                 <SelectTrigger className="w-full md:w-40 h-9 bg-white border-slate-300 rounded-md text-xs font-medium">
                   <SelectValue placeholder="Semua Jalur" />
                 </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jalur</SelectItem>
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
              <Select value={tahapFilter} onValueChange={(v) => {
                setTahapFilter(v)
                setPage(1)
              }}>
                 <SelectTrigger className="w-full md:w-32 h-9 bg-white border-slate-300 rounded-md text-xs font-medium">
                   <SelectValue placeholder="Semua Tahap" />
                 </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tahap</SelectItem>
                  <SelectItem value="TAHAP 1">TAHAP 1</SelectItem>
                  <SelectItem value="TAHAP 2">TAHAP 2</SelectItem>
                </SelectContent>
              </Select>
              {(searchTerm || jalurFilter !== 'all' || tahapFilter !== 'all' || statusFilter !== 'all') && (
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => {
                     setSearchTerm('')
                     setJalurFilter('all')
                     setTahapFilter('all')
                     setStatusFilter('all')
                     setPage(1)
                   }}
                   className="h-9 px-3 text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold text-[10px] rounded-md"
                 >
                   <X className="w-3 h-3 mr-1" />
                   RESET
                 </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table - Hidden on Mobile */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="w-12 text-center text-slate-500 font-semibold">No</TableHead>
                  <TableHead className="font-semibold text-slate-800">Nama Siswa</TableHead>
                  <TableHead className="font-semibold text-slate-800">Asal Sekolah</TableHead>
                  <TableHead className="font-semibold text-slate-800 w-24 text-center">JK</TableHead>
                  <TableHead className="font-semibold text-slate-800 text-center">SKL</TableHead>
                  <TableHead className="font-semibold text-slate-800 text-center">TATIB</TableHead>
                  <TableHead className="font-semibold text-slate-800 text-center">KK</TableHead>
                  <TableHead className="font-semibold text-slate-800 text-center">BUKTI</TableHead>
                  <TableHead className="font-semibold text-slate-800 text-center">SP</TableHead>
                  <TableHead className="font-semibold text-slate-800">Keterangan</TableHead>
                  <TableHead className="text-right font-semibold text-slate-800 pr-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending && !data.length ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center h-32">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin opacity-20" />
                        <p>Memuat data...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center h-32 text-muted-foreground">
                      <p>Tidak ada data siswa yang lulus.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item, index) => (
                    <TableRow key={item.id} className={`hover:bg-slate-50/50 transition-colors ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
                      <TableCell className="text-center text-slate-400 font-medium">{(page - 1) * limit + index + 1}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-700">{item.nmSiswa}</span>
                            {(item.teleponSiswa || item.teleponOrtu) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-blue-50 hover:text-blue-600">
                                    <Phone className="h-3.5 w-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-56">
                                  <DropdownMenuLabel className="text-xs text-slate-500 font-normal">Hubungi via WhatsApp</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  {item.teleponSiswa && (
                                    <DropdownMenuItem onClick={() => window.open(`https://wa.me/${item.teleponSiswa.replace(/\D/g, '').replace(/^0/, '62')}`, '_blank')}>
                                      <MessageCircle className="mr-2 h-4 w-4 text-blue-500" />
                                      <div className="flex flex-col">
                                        <span className="text-xs font-medium">WhatsApp Siswa</span>
                                        <span className="text-[10px] text-slate-500">{item.teleponSiswa}</span>
                                      </div>
                                    </DropdownMenuItem>
                                  )}
                                  {item.teleponOrtu && (
                                    <DropdownMenuItem onClick={() => window.open(`https://wa.me/${item.teleponOrtu.replace(/\D/g, '').replace(/^0/, '62')}`, '_blank')}>
                                      <MessageCircle className="mr-2 h-4 w-4 text-blue-500" />
                                      <div className="flex flex-col">
                                        <span className="text-xs font-medium">WhatsApp Ortu</span>
                                        <span className="text-[10px] text-slate-500">{item.teleponOrtu}</span>
                                      </div>
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">{item.jalur} - {item.tahap}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">{item.sekolahAsal || '-'}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Badge variant="outline" className={`w-8 h-8 flex items-center justify-center p-0 rounded-full border-2 ${(item.jenisKelamin === 'Laki-laki' || item.jenisKelamin === 'L')
                            ? 'border-blue-200 bg-blue-50 text-blue-700'
                            : 'border-pink-200 bg-pink-50 text-pink-700'
                            }`}>
                            {item.jenisKelamin === 'Laki-laki' || item.jenisKelamin === 'L' ? 'L' :
                              item.jenisKelamin === 'Perempuan' || item.jenisKelamin === 'P' ? 'P' : '-'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Checkbox
                            checked={item.daftarUlang.skl}
                            onCheckedChange={(checked) => handleCheckboxChange(item.id, 'skl', checked as boolean)}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                          {item.daftarUlang.fileSklId && (
                            <button
                              onClick={() => setPreviewConfig({
                                isOpen: true,
                                driveId: item.daftarUlang.fileSklId,
                                label: `SKL: ${item.nmSiswa}`,
                                studentId: item.id,
                                field: 'skl'
                              })}
                              className="p-1 hover:bg-blue-50 rounded-md transition-colors"
                              title="Lihat Berkas"
                            >
                              <FileText className="h-3.5 w-3.5 text-blue-500" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Checkbox
                            checked={item.daftarUlang.tatib}
                            onCheckedChange={(checked) => handleCheckboxChange(item.id, 'tatib', checked as boolean)}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                          {item.daftarUlang.fileTatibId && (
                            <button
                              onClick={() => setPreviewConfig({
                                isOpen: true,
                                driveId: item.daftarUlang.fileTatibId,
                                label: `Tatib: ${item.nmSiswa}`,
                                studentId: item.id,
                                field: 'tatib'
                              })}
                              className="p-1 hover:bg-blue-50 rounded-md transition-colors"
                              title="Lihat Berkas"
                            >
                              <FileText className="h-3.5 w-3.5 text-blue-500" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Checkbox
                            checked={item.daftarUlang.kk}
                            onCheckedChange={(checked) => handleCheckboxChange(item.id, 'kk', checked as boolean)}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                          {item.daftarUlang.fileKkId && (
                            <button
                              onClick={() => setPreviewConfig({
                                isOpen: true,
                                driveId: item.daftarUlang.fileKkId,
                                label: `KK: ${item.nmSiswa}`,
                                studentId: item.id,
                                field: 'kk'
                              })}
                              className="p-1 hover:bg-blue-50 rounded-md transition-colors"
                              title="Lihat Berkas"
                            >
                              <FileText className="h-3.5 w-3.5 text-blue-500" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Checkbox
                            checked={item.daftarUlang.bukti}
                            onCheckedChange={(checked) => handleCheckboxChange(item.id, 'bukti', checked as boolean)}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                          {item.daftarUlang.fileBuktiId && (
                            <button
                              onClick={() => setPreviewConfig({
                                isOpen: true,
                                driveId: item.daftarUlang.fileBuktiId,
                                label: `Bukti: ${item.nmSiswa}`,
                                studentId: item.id,
                                field: 'bukti'
                              })}
                              className="p-1 hover:bg-blue-50 rounded-md transition-colors"
                              title="Lihat Berkas"
                            >
                              <FileText className="h-3.5 w-3.5 text-blue-500" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Checkbox
                            checked={item.daftarUlang.pernyataan}
                            onCheckedChange={(checked) => handleCheckboxChange(item.id, 'pernyataan', checked as boolean)}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                          {item.daftarUlang.filePernyataanId && (
                            <button
                              onClick={() => setPreviewConfig({
                                isOpen: true,
                                driveId: item.daftarUlang.filePernyataanId,
                                label: `Pernyataan: ${item.nmSiswa}`,
                                studentId: item.id,
                                field: 'pernyataan'
                              })}
                              className="p-1 hover:bg-blue-50 rounded-md transition-colors"
                              title="Lihat Berkas"
                            >
                              <FileText className="h-3.5 w-3.5 text-blue-500" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center min-w-[100px]">
                          {(() => {
                            const status = calculateKeterangan(item.daftarUlang);
                             if (status === 'Lengkap') return (
                               <Badge className="justify-center font-medium w-full py-1 bg-blue-500 hover:bg-blue-600 rounded-md">Lengkap</Badge>
                             )
                             if (status === 'Belum Daftar Ulang') return (
                               <Badge variant="destructive" className="justify-center font-medium w-full py-1 bg-rose-500 hover:bg-rose-600 rounded-md">Belum Daftar</Badge>
                             )
                            return (
                               <Badge className="justify-center font-medium w-full py-1 bg-orange-500 hover:bg-orange-600 rounded-md">Belum Lengkap</Badge>
                             )
                          })()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-1">
                           <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDetailStudent(item)
                              setIsDetailOpen(true)
                            }}
                            className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                            title="Lihat Detail Siswa"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          {savingId === item.id ? (
                            <div className="h-7 w-7 flex items-center justify-center rounded-full bg-slate-50 border border-slate-100">
                              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                            </div>
                          ) : (
                            <div className="h-7 w-7 flex items-center justify-center rounded-full bg-blue-50 border border-blue-100">
                              <CheckCircle2 className="h-4 w-4 text-blue-500" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-100">
            {isPending && !data.length ? (
              <div className="p-8 text-center flex flex-col items-center gap-2 text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin opacity-20" />
                <p className="text-sm">Memuat data siswa...</p>
              </div>
            ) : data.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p className="text-sm">Tidak ada data siswa yang ditemukan.</p>
              </div>
            ) : (
              data.map((item, index) => (
                <div key={item.id} className={`p-4 space-y-4 ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="text-xs text-slate-400 font-medium mt-1">{(page - 1) * limit + index + 1}</div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{item.nmSiswa}</span>
                          {(item.teleponSiswa || item.teleponOrtu) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-blue-50">
                                  <Phone className="h-3.5 w-3.5 text-blue-600" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel className="text-xs">Hubungi via WhatsApp</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {item.teleponSiswa && (
                                  <DropdownMenuItem onClick={() => window.open(`https://wa.me/${item.teleponSiswa.replace(/\D/g, '').replace(/^0/, '62')}`, '_blank')}>
                                    <MessageCircle className="mr-2 h-4 w-4 text-blue-500" />
                                    <div className="flex flex-col text-xs">
                                      <span className="font-medium">WhatsApp Siswa</span>
                                      <span className="text-slate-500">{item.teleponSiswa}</span>
                                    </div>
                                  </DropdownMenuItem>
                                )}
                                {item.teleponOrtu && (
                                  <DropdownMenuItem onClick={() => window.open(`https://wa.me/${item.teleponOrtu.replace(/\D/g, '').replace(/^0/, '62')}`, '_blank')}>
                                    <MessageCircle className="mr-2 h-4 w-4 text-blue-500" />
                                    <div className="flex flex-col text-xs">
                                      <span className="font-medium">WhatsApp Ortu</span>
                                      <span className="text-slate-500">{item.teleponOrtu}</span>
                                    </div>
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">{item.sekolahAsal || '-'}</span>
                         <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[10px] h-4 leading-none px-1.5 rounded-md">{item.jalur}</Badge>
                          <Badge variant="secondary" className="text-[10px] h-4 leading-none px-1.5 rounded-md">{item.tahap}</Badge>
                        </div>
                      </div>
                    </div>
                    {savingId === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-slate-300" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-blue-500 opacity-50" />
                    )}
                  </div>

                  <div className="grid grid-cols-5 gap-2 pt-1">
                    {[
                      { id: 'skl', label: 'SKL' },
                      { id: 'tatib', label: 'TTB' },
                      { id: 'kk', label: 'KK' },
                      { id: 'bukti', label: 'BKT' },
                      { id: 'pernyataan', label: 'SP' },
                    ].map((doc) => (
                      <div key={doc.id} className="flex flex-col items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">{doc.label}</span>
                        <Checkbox
                          checked={item.daftarUlang[doc.id]}
                          onCheckedChange={(checked) => handleCheckboxChange(item.id, doc.id, checked as boolean)}
                          className="h-5 w-5 rounded-md border-slate-200 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                        />
                        {item.daftarUlang[`file${doc.id.charAt(0).toUpperCase() + doc.id.slice(1)}Id`] && (
                          <button
                            onClick={() => setPreviewConfig({
                              isOpen: true,
                              driveId: item.daftarUlang[`file${doc.id.charAt(0).toUpperCase() + doc.id.slice(1)}Id`],
                              label: `${doc.label}: ${item.nmSiswa}`,
                              studentId: item.id,
                              field: doc.id
                            })}
                            className="mt-1 flex items-center justify-center p-1 bg-blue-50 rounded-md text-blue-600 active:scale-95 transition-transform"
                          >
                            <FileText className="h-3 w-3" />
                            <span className="text-[9px] font-bold ml-0.5">LIHAT</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                   <div className="pt-2">
                    {(() => {
                      const status = calculateKeterangan(item.daftarUlang);
                      return (
                        <Badge className={`w-full justify-center py-1 text-xs font-semibold rounded-md ${status === 'Lengkap' ? 'bg-blue-500' :
                          status === 'Belum Daftar Ulang' ? 'bg-rose-500' : 'bg-orange-500'
                          }`}>
                          {status}
                        </Badge>
                      )
                    })()}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Simple Pagination Footer */}
           <div className="border-t border-slate-300 p-4 flex items-center justify-between bg-slate-50/50 rounded-b-lg">
            <div className="text-xs text-slate-500">
              Menampilkan <span className="font-medium text-slate-700">{data.length}</span> dari <span className="font-medium text-slate-700">{total}</span> siswa
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 px-3 bg-white border-slate-300 rounded-md"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isPending}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 px-3 bg-white border-slate-300 rounded-md"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isPending}
              >
                <span className="hidden sm:inline">Berikutnya</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin File Preview Modal */}
      <Dialog
        open={previewConfig.isOpen}
        onOpenChange={(open) => setPreviewConfig({ ...previewConfig, isOpen: open })}
      >
         <DialogContent
          className="w-[90vw] sm:max-w-5xl h-[90vh] p-0 overflow-hidden rounded-md border-none shadow-2xl flex flex-col bg-slate-900"
          showCloseButton={false}
        >
          <DialogHeader className="p-4 sm:p-6 bg-white border-b flex flex-row items-center justify-between shrink-0 h-16 sm:h-20">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-blue-50 rounded-md flex items-center justify-center border border-blue-100">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-sm sm:text-base font-bold text-slate-900">Preview Berkas Admin</DialogTitle>
                <DialogDescription className="text-[10px] sm:text-xs text-slate-500 font-medium">{previewConfig.label}</DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {previewConfig.studentId && previewConfig.field && (
                 <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50/50 rounded-md border border-blue-100/50">
                  <Checkbox
                    id="modal-verify"
                    checked={data.find(s => s.id === previewConfig.studentId)?.daftarUlang[previewConfig.field as string] || false}
                    onCheckedChange={(checked) => {
                      if (previewConfig.studentId && previewConfig.field) {
                        handleCheckboxChange(previewConfig.studentId, previewConfig.field, checked as boolean);
                      }
                    }}
                    className="h-4 w-4 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <label htmlFor="modal-verify" className="text-[10px] sm:text-xs font-bold text-blue-700 cursor-pointer whitespace-nowrap">
                    BERKAS SESUAI
                  </label>
                </div>
              )}

              <DialogClose className="p-2 hover:bg-slate-100 rounded-full transition-colors active:scale-95">
                <X className="h-5 w-5 text-slate-500" />
              </DialogClose>
            </div>
          </DialogHeader>
          <div className="flex-1 bg-slate-800 relative w-full h-full">
            {previewConfig.driveId && (
              <iframe
                src={`https://drive.google.com/file/d/${previewConfig.driveId}/preview`}
                className="absolute inset-0 w-full h-full border-none"
                allow="autoplay"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Siswa Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="w-[95vw] md:max-w-7xl max-h-[90vh] flex flex-col p-0 overflow-hidden" showCloseButton={false}>
          <DialogHeader className="p-6 pb-4 border-b shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-black text-slate-900">Detail Siswa</DialogTitle>
                  <DialogDescription className="text-xs">Informasi lengkap biodata siswa</DialogDescription>
                </div>
              </div>
              <DialogClose className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="h-5 w-5 text-slate-500" />
              </DialogClose>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6">
            {detailStudent && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {/* Kolom Kiri */}
                <div className="space-y-8">
                  {/* Data Jalur */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-indigo-600 border-b-2 border-indigo-100 pb-2 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      INFORMASI PENDAFTARAN
                    </h4>
                    <div className="space-y-2">
                      <DetailRow label="Jalur Pendaftaran" value={detailStudent.jalur} />
                      <DetailRow label="Tahap" value={detailStudent.tahap} />
                    </div>
                  </div>

                  {/* Data Pribadi */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-blue-600 border-b-2 border-blue-100 pb-2 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      DATA PRIBADI SISWA
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      <DetailRow label="Nama Lengkap" value={detailStudent.nmSiswa} />
                      <DetailRow label="NISN" value={detailStudent.nisn || '-'} />
                      <DetailRow label="Tempat, Tanggal Lahir" value={`${detailStudent.tempatLahir || '-'}, ${detailStudent.tanggalLahir || '-'}`} />
                      <DetailRow label="Jenis Kelamin" value={detailStudent.jenisKelamin === 'L' || detailStudent.jenisKelamin === 'Laki-laki' ? 'Laki-laki' : detailStudent.jenisKelamin === 'P' || detailStudent.jenisKelamin === 'Perempuan' ? 'Perempuan' : '-'} />
                      <DetailRow label="Agama" value={detailStudent.agama || '-'} />
                      <DetailRow label="No. HP Siswa" value={detailStudent.teleponSiswa || '-'} />
                      <DetailRow label="Alamat Siswa" value={detailStudent.alamatSiswa || '-'} />
                      <DetailRow label="Asal Sekolah" value={detailStudent.sekolahAsal || '-'} />
                      <DetailRow label="Status Keluarga" value={detailStudent.statusDalamKel || '-'} />
                      <DetailRow label="Anak Ke" value={detailStudent.anakKe || '-'} />
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan */}
                <div className="space-y-8">
                  {/* Data Orang Tua */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-slate-800 border-b-2 border-slate-200 pb-2 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      DATA ORANG TUA / WALI
                    </h4>
                    <div className="space-y-2">
                      <DetailRow label="Nama Ayah" value={detailStudent.nmAyah || '-'} />
                      <DetailRow label="Pekerjaan Ayah" value={detailStudent.pekerjaanAyah || '-'} />
                      <DetailRow label="Nama Ibu" value={detailStudent.nmIbu || '-'} />
                      <DetailRow label="Pekerjaan Ibu" value={detailStudent.pekerjaanIbu || '-'} />
                      <DetailRow label="No. Telp Orang Tua" value={detailStudent.teleponOrtu || '-'} />
                      <DetailRow label="Alamat Orang Tua" value={detailStudent.alamatOrtu || '-'} />
                    </div>
                  </div>

                  {/* Status Berkas */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-emerald-600 border-b-2 border-emerald-100 pb-2 flex items-center gap-2">
                      <ClipboardList className="w-5 h-5" />
                      STATUS BERKAS DAFTAR ULANG
                    </h4>
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                      <FileStatusItem
                        label="SKL"
                        checked={detailStudent.daftarUlang.skl}
                        fileId={detailStudent.daftarUlang.fileSklId}
                        onPreview={() => setPreviewConfig({
                          isOpen: true,
                          driveId: detailStudent.daftarUlang.fileSklId!,
                          label: `SKL: ${detailStudent.nmSiswa}`,
                          studentId: detailStudent.id,
                          field: 'skl'
                        })}
                      />
                      <FileStatusItem
                        label="Tatib"
                        checked={detailStudent.daftarUlang.tatib}
                        fileId={detailStudent.daftarUlang.fileTatibId}
                        onPreview={() => setPreviewConfig({
                          isOpen: true,
                          driveId: detailStudent.daftarUlang.fileTatibId!,
                          label: `Tatib: ${detailStudent.nmSiswa}`,
                          studentId: detailStudent.id,
                          field: 'tatib'
                        })}
                      />
                      <FileStatusItem
                        label="KK"
                        checked={detailStudent.daftarUlang.kk}
                        fileId={detailStudent.daftarUlang.fileKkId}
                        onPreview={() => setPreviewConfig({
                          isOpen: true,
                          driveId: detailStudent.daftarUlang.fileKkId!,
                          label: `KK: ${detailStudent.nmSiswa}`,
                          studentId: detailStudent.id,
                          field: 'kk'
                        })}
                      />
                      <FileStatusItem
                        label="Bukti"
                        checked={detailStudent.daftarUlang.bukti}
                        fileId={detailStudent.daftarUlang.fileBuktiId}
                        onPreview={() => setPreviewConfig({
                          isOpen: true,
                          driveId: detailStudent.daftarUlang.fileBuktiId!,
                          label: `Bukti: ${detailStudent.nmSiswa}`,
                          studentId: detailStudent.id,
                          field: 'bukti'
                        })}
                      />
                      <FileStatusItem
                        label="SP"
                        checked={detailStudent.daftarUlang.pernyataan}
                        fileId={detailStudent.daftarUlang.filePernyataanId}
                        onPreview={() => setPreviewConfig({
                          isOpen: true,
                          driveId: detailStudent.daftarUlang.filePernyataanId!,
                          label: `SP: ${detailStudent.nmSiswa}`,
                          studentId: detailStudent.id,
                          field: 'pernyataan'
                        })}
                      />
                    </div>
                  </div>

                  {/* Kontak */}
                  {(detailStudent.teleponSiswa || detailStudent.teleponOrtu) && (
                    <div className="flex gap-4 pt-6 mt-4 border-t border-slate-100">
                      {detailStudent.teleponSiswa && (
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={() => window.open(`https://wa.me/${detailStudent.teleponSiswa.replace(/\D/g, '').replace(/^0/, '62')}`, '_blank')}
                          className="flex-1 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 shadow-sm"
                        >
                          <MessageCircle className="w-5 h-5 mr-3" />
                          <div className="flex flex-col items-start leading-tight">
                            <span className="text-[10px] uppercase font-bold opacity-70">Hubungi Siswa</span>
                            <span className="text-sm">WhatsApp</span>
                          </div>
                        </Button>
                      )}
                      {detailStudent.teleponOrtu && (
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={() => window.open(`https://wa.me/${detailStudent.teleponOrtu.replace(/\D/g, '').replace(/^0/, '62')}`, '_blank')}
                          className="flex-1 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 shadow-sm"
                        >
                          <MessageCircle className="w-5 h-5 mr-3" />
                          <div className="flex flex-col items-start leading-tight">
                            <span className="text-[10px] uppercase font-bold opacity-70">Hubungi Ortu</span>
                            <span className="text-sm">WhatsApp</span>
                          </div>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="p-4 border-t bg-slate-50/50 shrink-0">
            <DialogClose asChild>
              <Button type="button" variant="secondary" className="w-full sm:w-auto font-bold px-8">
                TUTUP
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper Components
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 border-b border-slate-50/50 pb-1">
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider w-full sm:w-40 shrink-0">
        {label}
      </div>
      <div className="hidden sm:block text-slate-300">:</div>
      <div className="text-sm font-semibold text-slate-700 flex-1">
        {value}
      </div>
    </div>
  )
}

function FileStatusItem({
  label,
  checked,
  fileId,
  onPreview
}: {
  label: string;
  checked: boolean;
  fileId?: string;
  onPreview?: () => void
}) {
  return (
    <div className={`p-2 rounded-md border flex flex-col items-center gap-1 ${checked
      ? 'bg-emerald-50 border-emerald-200'
      : 'bg-rose-50 border-rose-200'
      }`}>
      {checked ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
      ) : (
        <XCircle className="w-4 h-4 text-rose-600" />
      )}
      <span className={`text-[10px] font-bold ${checked ? 'text-emerald-700' : 'text-rose-700'}`}>
        {label}
      </span>
      {fileId && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPreview?.();
          }}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded border transition-all ${checked
            ? 'bg-emerald-100 border-emerald-200 text-emerald-700 hover:bg-emerald-200'
            : 'bg-rose-100 border-rose-200 text-rose-700 hover:bg-rose-200'
            }`}
          title="Lihat Berkas"
        >
          <FileText className="w-3 h-3" />
          <span className="text-[8px] font-bold">LIHAT</span>
        </button>
      )}
    </div>
  )
}
