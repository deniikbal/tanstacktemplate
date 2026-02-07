import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Scanner } from '@yudiel/react-qr-scanner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Loader2, QrCode, User, School, Phone, CheckCircle2, XCircle, RefreshCw, LogOut, Info } from 'lucide-react'
import { getStudentByQRData } from '@/lib/server/scanner'
import { upsertDaftarUlang } from '@/lib/server/daftar-ulang'
import { authClient } from '@/lib/auth-client'
import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export const Route = createFileRoute('/scanner')({
  component: ScannerPage,
})

function ScannerPage() {
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const navigate = useNavigate()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!sessionPending && !session) {
      navigate({ to: '/login' })
    }
  }, [session, sessionPending, navigate])

  if (sessionPending) return <LoadingSpinner />
  if (!session) return null

  const handleScan = async (result: any) => {
    if (!result || !result[0]?.rawValue) return

    setScanning(false)
    setLoading(true)
    try {
      const response = await getStudentByQRData({ data: { qrData: result[0].rawValue } })
      setData(response)
      toast.success('Data siswa ditemukan')
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengenali QR Code')
      setScanning(true)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleCheck = async (field: string, checked: boolean) => {
    if (!data) return

    const updatedDaftarUlang = { ...data.daftarUlang, [field]: checked }

    // Auto-calculate completion status
    const requiredFields = ['skl', 'kk', 'bukti', 'tatib', 'pernyataan']
    const isComplete = requiredFields.every(f => !!updatedDaftarUlang[f])
    const newKeterangan = isComplete ? 'LENGKAP' : 'BELUM LENGKAP'

    const finalDaftarUlang = { ...updatedDaftarUlang, keterangan: newKeterangan }
    setData({ ...data, daftarUlang: finalDaftarUlang })

    setSaving(true)
    try {
      await upsertDaftarUlang({
        data: {
          kelulusanId: data.student.kelulusanId,
          skl: !!finalDaftarUlang.skl,
          tatib: !!finalDaftarUlang.tatib,
          kk: !!finalDaftarUlang.kk,
          bukti: !!finalDaftarUlang.bukti,
          pernyataan: !!finalDaftarUlang.pernyataan,
          keterangan: newKeterangan,
        }
      })
      toast.success(isComplete ? 'Data Lengkap! Tersimpan.' : 'Kemajuan disimpan')
    } catch (error: any) {
      toast.error('Gagal menyimpan perubahan')
    } finally {
      setSaving(false)
    }
  }

  const resetScanner = () => {
    setData(null)
    setScanning(true)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-md">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">QR Scanner</h1>
              <p className="text-xs text-slate-500 font-medium">Panitia SPMB 2026</p>
            </div>
          </div>
          {(!scanning || data) && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetScanner} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Scan Ulang
              </Button>
              <Button variant="outline" size="sm" onClick={() => authClient.signOut({ fetchOptions: { onSuccess: () => navigate({ to: '/login' }) } })} className="gap-2 text-rose-600 hover:text-rose-700">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </header>

        <div className="mb-6 bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8 rounded-lg">
              <AvatarImage src={session.user.image || ''} />
              <AvatarFallback className="bg-blue-600 text-white text-[10px]">{session.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Petugas Aktif</p>
              <p className="text-sm font-bold text-slate-900">{session.user.name}</p>
            </div>
          </div>
        </div>

        {scanning ? (
          <Card className="overflow-hidden border-2 border-blue-100 shadow-xl">
            <div className="aspect-square relative flex items-center justify-center bg-black">
              <Scanner
                onScan={handleScan}
                onError={(err) => console.error(err)}
                styles={{
                  container: { width: '100%', height: '100%' }
                }}
              />
              <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none flex items-center justify-center">
                <div className="w-full aspect-square border-2 border-white/80 rounded-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500 animate-[scan_2s_linear_infinite]" />
                </div>
              </div>
            </div>
            <CardContent className="p-6 text-center">
              <CardTitle className="mb-2">Arahkan Kamera</CardTitle>
              <CardDescription>
                Posisikan QR Code di tengah kotak merah untuk memindai data pendaftar.
              </CardDescription>
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="text-slate-600 font-medium">Mencari data siswa...</p>
          </div>
        ) : data ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Student Info Card */}
            <Card className="border-none shadow-lg bg-white overflow-hidden">
              <div className="bg-blue-600 p-5 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black tracking-tight leading-tight mb-1">{data.student.nmSiswa}</h2>
                  <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">{data.student.noDaftar}</p>
                </div>
                <Badge variant="outline" className="bg-white/20 text-white border-white/20 px-3 py-1 font-bold text-[10px] uppercase tracking-tighter backdrop-blur-md">
                  {data.student.jalur}
                </Badge>
              </div>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Asal Sekolah</Label>
                    <div className="flex items-start gap-2 text-sm font-semibold text-slate-800 leading-snug">
                      <School className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{data.student.sekolahAsal}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Jenis Kelamin</Label>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <User className="w-4 h-4 text-blue-600" />
                      <span>{data.student.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Telepon Ortu</Label>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <Phone className="w-4 h-4 text-blue-600" />
                      <span>{data.student.teleponOrtu || '-'}</span>
                    </div>
                  </div>
                  <div className="space-y-1 flex flex-col justify-center items-end">
                    <div className={`px-4 py-1.5 rounded-full text-xs font-black border-2 flex items-center gap-2 ${data.student.status === 'LULUS'
                      ? 'bg-blue-50 text-blue-700 border-blue-500/30'
                      : 'bg-rose-50 text-rose-700 border-rose-500/30'
                      }`}>
                      {data.student.status === 'LULUS' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {data.student.status}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Checklist Card */}
            <Card className="border-none shadow-lg bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Checklist Berkas Daftar Ulang</CardTitle>
                <CardDescription className="text-xs">Centang dokumen yang sudah dibawa siswa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                {[
                  { id: 'skl', label: 'Surat Bukti Kelulusan' },
                  { id: 'kk', label: 'Foto Copy Kartu Keluarga' },
                  { id: 'bukti', label: 'Ijazah / Bukti Kelulusan SMP' },
                  { id: 'tatib', label: 'Tata Tertib (Bermeterai)' },
                  { id: 'pernyataan', label: 'Surat Pernyataan' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <Checkbox
                      id={item.id}
                      checked={!!data.daftarUlang[item.id]}
                      onCheckedChange={(checked) => handleToggleCheck(item.id, !!checked)}
                      disabled={saving}
                      className="w-5 h-5 rounded-md border-slate-300 data-[state=checked]:bg-blue-600"
                    />
                    <Label htmlFor={item.id} className="text-sm font-medium text-slate-700 cursor-pointer flex-1">
                      {item.label}
                    </Label>
                    {data.daftarUlang[item.id] ? (
                      <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-200" />
                    )}
                  </div>
                ))}

                <div className="pt-2 min-h-[20px]">
                  {saving && (
                    <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Menyimpan...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Button onClick={resetScanner} className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl text-md font-bold shadow-blue-200 shadow-lg mb-8">
              Selesai & Scan Siswa Lain
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <XCircle className="w-16 h-16 text-rose-500" />
            <div className="space-y-1">
              <h2 className="text-xl font-bold">Terjadi Kesalahan</h2>
              <p className="text-slate-500">QR Code tidak dapat diproses.</p>
            </div>
            <Button onClick={() => setScanning(true)} variant="outline">Coba Lagi</Button>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  )
}
