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
import { toast } from 'sonner'
import { Loader2, ClipboardList, Search, CheckCircle2, AlertCircle, XCircle, Phone, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { getDaftarUlangList, upsertDaftarUlang } from '@/lib/server/daftar-ulang'

export const Route = createFileRoute('/dashboard/daftar-ulang')({
  component: DaftarUlangPage,
})

function DaftarUlangPage() {
  const [data, setData] = useState<any[]>([])
  const [isPending, setIsPending] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [savingId, setSavingId] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  const fetchDaftarUlang = async () => {
    setIsPending(true)
    try {
      const res = await getDaftarUlangList({ data: { page, limit } })
      setData(res.students)
      setTotalPages(res.totalPages)
      setTotal(res.total)
    } catch (err) {
      toast.error('Gagal mengambil data daftar ulang')
    } finally {
      setIsPending(false)
    }
  }

  useEffect(() => {
    fetchDaftarUlang()
  }, [page])

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
      } catch (err) {
        toast.error('Gagal menyimpan perubahan otomatis');
        // Optional: revert local state on error
      } finally {
        setSavingId(null);
      }
    }
  }


  const filteredData = data.filter(item =>
    item.nmSiswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sekolahAsal?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const statsSudah = data.filter(item =>
    item.daftarUlang.skl && item.daftarUlang.tatib && item.daftarUlang.kk &&
    item.daftarUlang.bukti && item.daftarUlang.pernyataan
  ).length

  const statsBelumDaftar = data.filter(item =>
    !item.daftarUlang.skl && !item.daftarUlang.tatib && !item.daftarUlang.kk &&
    !item.daftarUlang.bukti && !item.daftarUlang.pernyataan
  ).length

  const statsBelumLengkap = data.length - statsSudah - statsBelumDaftar

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <ClipboardList className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daftar Ulang</h1>
          <p className="text-sm text-slate-500">Kelola berkas pendaftaran ulang siswa yang sudah lulus</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-emerald-100 bg-emerald-50/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Sudah Daftar Ulang</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-700">{statsSudah}</span>
                <span className="text-xs text-emerald-600/70">Siswa</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-100 bg-rose-50/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-rose-600 uppercase tracking-wider">Belum Daftar Ulang</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-rose-700">{statsBelumDaftar}</span>
                <span className="text-xs text-rose-600/70">Siswa</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-100 bg-orange-50/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-orange-600 uppercase tracking-wider">Belum Lengkap</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-orange-700">{statsBelumLengkap}</span>
                <span className="text-xs text-orange-600/70">Siswa</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Monitoring Berkas Daftar Ulang
              </CardTitle>
              <CardDescription>
                Verifikasi kelengkapan berkas siswa yang dinyatakan Lulus.
              </CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari nama atau asal sekolah..."
                className="pl-9 bg-white h-9 border-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
                {isPending ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center h-32">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin opacity-20" />
                        <p>Memuat data...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center h-32 text-muted-foreground">
                      <p>Tidak ada data siswa yang lulus.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="text-center text-slate-400 font-medium">{(page - 1) * limit + index + 1}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-700">{item.nmSiswa}</span>
                            {(item.teleponSiswa || item.teleponOrtu) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-emerald-50 hover:text-emerald-600">
                                    <Phone className="h-3.5 w-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-56">
                                  <DropdownMenuLabel className="text-xs text-slate-500 font-normal">Hubungi via WhatsApp</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  {item.teleponSiswa && (
                                    <DropdownMenuItem onClick={() => window.open(`https://wa.me/${item.teleponSiswa.replace(/\D/g, '').replace(/^0/, '62')}`, '_blank')}>
                                      <MessageCircle className="mr-2 h-4 w-4 text-emerald-500" />
                                      <div className="flex flex-col">
                                        <span className="text-xs font-medium">WhatsApp Siswa</span>
                                        <span className="text-[10px] text-slate-500">{item.teleponSiswa}</span>
                                      </div>
                                    </DropdownMenuItem>
                                  )}
                                  {item.teleponOrtu && (
                                    <DropdownMenuItem onClick={() => window.open(`https://wa.me/${item.teleponOrtu.replace(/\D/g, '').replace(/^0/, '62')}`, '_blank')}>
                                      <MessageCircle className="mr-2 h-4 w-4 text-emerald-500" />
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
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-pink-200 bg-pink-50 text-pink-700'
                            }`}>
                            {item.jenisKelamin === 'Laki-laki' || item.jenisKelamin === 'L' ? 'L' :
                              item.jenisKelamin === 'Perempuan' || item.jenisKelamin === 'P' ? 'P' : '-'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={item.daftarUlang.skl}
                          onCheckedChange={(checked) => handleCheckboxChange(item.id, 'skl', checked as boolean)}
                          className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={item.daftarUlang.tatib}
                          onCheckedChange={(checked) => handleCheckboxChange(item.id, 'tatib', checked as boolean)}
                          className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={item.daftarUlang.kk}
                          onCheckedChange={(checked) => handleCheckboxChange(item.id, 'kk', checked as boolean)}
                          className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={item.daftarUlang.bukti}
                          onCheckedChange={(checked) => handleCheckboxChange(item.id, 'bukti', checked as boolean)}
                          className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={item.daftarUlang.pernyataan}
                          onCheckedChange={(checked) => handleCheckboxChange(item.id, 'pernyataan', checked as boolean)}
                          className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center min-w-[100px]">
                          {(() => {
                            const status = calculateKeterangan(item.daftarUlang);
                            if (status === 'Lengkap') return (
                              <Badge className="justify-center font-medium w-full py-1 bg-emerald-500 hover:bg-emerald-600">Lengkap</Badge>
                            )
                            if (status === 'Belum Daftar Ulang') return (
                              <Badge variant="destructive" className="justify-center font-medium w-full py-1 bg-rose-500 hover:bg-rose-600">Belum Daftar</Badge>
                            )
                            return (
                              <Badge className="justify-center font-medium w-full py-1 bg-orange-500 hover:bg-orange-600">Belum Lengkap</Badge>
                            )
                          })()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end">
                          {savingId === item.id ? (
                            <div className="h-7 w-7 flex items-center justify-center rounded-full bg-slate-50 border border-slate-100">
                              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                            </div>
                          ) : (
                            <div className="h-7 w-7 flex items-center justify-center rounded-full bg-emerald-50 border border-emerald-100">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
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
            {isPending ? (
              <div className="p-8 text-center flex flex-col items-center gap-2 text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin opacity-20" />
                <p className="text-sm">Memuat data siswa...</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p className="text-sm">Tidak ada data siswa yang ditemukan.</p>
              </div>
            ) : (
              filteredData.map((item, index) => (
                <div key={item.id} className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="text-xs text-slate-400 font-medium mt-1">{(page - 1) * limit + index + 1}</div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{item.nmSiswa}</span>
                          {(item.teleponSiswa || item.teleponOrtu) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-emerald-50">
                                  <Phone className="h-3.5 w-3.5 text-emerald-600" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel className="text-xs">Hubungi via WhatsApp</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {item.teleponSiswa && (
                                  <DropdownMenuItem onClick={() => window.open(`https://wa.me/${item.teleponSiswa.replace(/\D/g, '').replace(/^0/, '62')}`, '_blank')}>
                                    <MessageCircle className="mr-2 h-4 w-4 text-emerald-500" />
                                    <div className="flex flex-col text-xs">
                                      <span className="font-medium">WhatsApp Siswa</span>
                                      <span className="text-slate-500">{item.teleponSiswa}</span>
                                    </div>
                                  </DropdownMenuItem>
                                )}
                                {item.teleponOrtu && (
                                  <DropdownMenuItem onClick={() => window.open(`https://wa.me/${item.teleponOrtu.replace(/\D/g, '').replace(/^0/, '62')}`, '_blank')}>
                                    <MessageCircle className="mr-2 h-4 w-4 text-emerald-500" />
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
                          <Badge variant="secondary" className="text-[10px] h-4 leading-none px-1.5">{item.jalur}</Badge>
                          <Badge variant="secondary" className="text-[10px] h-4 leading-none px-1.5">{item.tahap}</Badge>
                        </div>
                      </div>
                    </div>
                    {savingId === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-slate-300" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 opacity-50" />
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
                          className="h-5 w-5 rounded-md border-slate-200 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    {(() => {
                      const status = calculateKeterangan(item.daftarUlang);
                      return (
                        <Badge className={`w-full justify-center py-1 text-xs font-semibold ${status === 'Lengkap' ? 'bg-emerald-500' :
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
          <div className="border-t border-slate-100 p-4 flex items-center justify-between bg-slate-50/50 rounded-b-lg">
            <div className="text-xs text-slate-500">
              Menampilkan <span className="font-medium text-slate-700">{filteredData.length}</span> dari <span className="font-medium text-slate-700">{total}</span> siswa
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 px-3 bg-white"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isPending}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 px-3 bg-white"
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
    </div>
  )
}
