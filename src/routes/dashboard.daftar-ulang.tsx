import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Loader2, ClipboardList, Search, Save, CheckCircle2 } from 'lucide-react'
import { getDaftarUlangList, upsertDaftarUlang } from '@/lib/server/daftar-ulang'

export const Route = createFileRoute('/dashboard/daftar-ulang')({
  component: DaftarUlangPage,
})

function DaftarUlangPage() {
  const [data, setData] = useState<any[]>([])
  const [isPending, setIsPending] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [savingId, setSavingId] = useState<number | null>(null)

  const fetchDaftarUlang = async () => {
    setIsPending(true)
    try {
      const res = await getDaftarUlangList()
      setData(res)
    } catch (err) {
      toast.error('Gagal mengambil data daftar ulang')
    } finally {
      setIsPending(false)
    }
  }

  useEffect(() => {
    fetchDaftarUlang()
  }, [])

  const handleUpdate = async (item: any) => {
    setSavingId(item.id)
    try {
      await upsertDaftarUlang({
        data: {
          kelulusanId: item.id,
          ...item.daftarUlang,
        }
      })
      toast.success(`Berhasil memperbarui data ${item.nmSiswa}`)
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui data')
    } finally {
      setSavingId(null)
    }
  }

  const handleCheckboxChange = (itemId: number, field: string, checked: boolean) => {
    setData(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          daftarUlang: {
            ...item.daftarUlang,
            [field]: checked
          }
        }
      }
      return item
    }))
  }

  const handleKeteranganChange = (itemId: number, value: string) => {
    setData(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          daftarUlang: {
            ...item.daftarUlang,
            keterangan: value
          }
        }
      }
      return item
    }))
  }

  const filteredData = data.filter(item =>
    item.nmSiswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sekolahAsal?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-12 text-center text-slate-500 font-semibold">No</TableHead>
                <TableHead className="font-semibold text-slate-800">Nama Siswa</TableHead>
                <TableHead className="font-semibold text-slate-800">Asal Sekolah</TableHead>
                <TableHead className="font-semibold text-slate-800 w-24">JK</TableHead>
                <TableHead className="font-semibold text-slate-800 text-center">SKL</TableHead>
                <TableHead className="font-semibold text-slate-800 text-center">TATIB</TableHead>
                <TableHead className="font-semibold text-slate-800 text-center">KK</TableHead>
                <TableHead className="font-semibold text-slate-800 text-center">BUKTI</TableHead>
                <TableHead className="font-semibold text-slate-800 text-center">PERNYATAAN</TableHead>
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
                    <TableCell className="text-center text-slate-400 font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-700">{item.nmSiswa}</span>
                        <span className="text-xs text-slate-400">{item.jalur} - {item.tahap}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{item.sekolahAsal || '-'}</TableCell>
                    <TableCell className="text-slate-600 text-center">
                      {item.jenisKelamin === 'Laki-laki' || item.jenisKelamin === 'L' ? 'L' :
                        item.jenisKelamin === 'Perempuan' || item.jenisKelamin === 'P' ? 'P' : '-'}
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
                      <Input
                        value={item.daftarUlang.keterangan || ''}
                        onChange={(e) => handleKeteranganChange(item.id, e.target.value)}
                        placeholder="Keterangan..."
                        className="h-8 text-xs border-slate-200"
                      />
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button
                        size="sm"
                        onClick={() => handleUpdate(item)}
                        disabled={savingId === item.id}
                        className="bg-emerald-600 hover:bg-emerald-700 h-8 gap-1"
                      >
                        {savingId === item.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Save className="h-3 w-3" />
                        )}
                        Simpan
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
