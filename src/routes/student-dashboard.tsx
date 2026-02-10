import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  GraduationCap,
  LogOut,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  StickyNote,
  ShieldCheck,
  FileDigit,
  Receipt,
  ClipboardCheck,
  Eye,
  Camera,
  Info,
  Lightbulb,
  MousePointerClick
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { getFullStudentProfile, logoutStudent } from '@/lib/server/student-auth'
import { uploadStudentFile } from '@/lib/server/daftar-ulang'
import { DocumentScanner } from '@/components/DocumentScanner'


export const Route = createFileRoute('/student-dashboard')({
  component: StudentDashboard,
})

// Helper to read session from client cookie
const getClientSession = () => {
  const match = document.cookie.match(/(?:^|; )student_session=([^;]*)/)
  if (match) {
    try {
      return JSON.parse(decodeURIComponent(match[1]))
    } catch { return null }
  }
  return null
}

function StudentDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [uploadingField, setUploadingField] = useState<string | null>(null)
  const [scannerConfig, setScannerConfig] = useState<{ isOpen: boolean, type: string, label: string }>({
    isOpen: false,
    type: '',
    label: ''
  })
  const [previewConfig, setPreviewConfig] = useState<{ isOpen: boolean, driveId: string, label: string }>({
    isOpen: false,
    driveId: '',
    label: ''
  })
  const navigate = useNavigate()

  const fetchProfile = async () => {
    try {
      const session = getClientSession()
      if (!session) {
        navigate({ to: '/student-login' as any })
        return
      }
      const data = await getFullStudentProfile({ data: { studentId: session.id } })
      if (!data) {
        navigate({ to: '/student-login' as any })
        return
      }
      setProfile(data)
    } catch (error: any) {
      toast.error('Gagal mengambil data profil')
      navigate({ to: '/student-login' as any })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleLogout = async () => {
    await logoutStudent()
    // Clear cookie on client side
    document.cookie = 'student_session=; path=/; max-age=0'
    navigate({ to: '/student-login' as any })
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Hanya file PDF yang diperbolehkan')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB')
      return
    }

    setUploadingField(type)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    formData.append('nisn', profile.student.nisn)
    formData.append('name', profile.student.nmSiswa)
    formData.append('kelulusanId', profile.kelulusan.id.toString())

    try {
      await uploadStudentFile({ data: formData })
      toast.success(`Berkas ${type.toUpperCase()} berhasil diunggah ke Google Drive`)
      await fetchProfile() // Refresh data
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengunggah berkas')
    } finally {
      setUploadingField(null)
    }
  }

  const handleScannerUpload = async (file: File, type: string) => {
    setUploadingField(type)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    formData.append('nisn', profile.student.nisn)
    formData.append('name', profile.student.nmSiswa)
    formData.append('kelulusanId', profile.kelulusan.id.toString())

    try {
      await uploadStudentFile({ data: formData })
      toast.success(`Berkas ${type.toUpperCase()} berhasil di-scan dan diunggah`)
      await fetchProfile()
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengunggah berkas hasil scan')
    } finally {
      setUploadingField(null)
    }
  }

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="text-slate-500 font-medium font-inter text-sm">Sedang memuat...</p>
        </div>
      </div>
    )
  }

  const isLulus = profile?.kelulusan?.status === 'LULUS'

  const docTypes = [
    { id: 'skl', label: 'SKL / Ijazah', icon: FileText, field: 'fileSklId' },
    { id: 'tatib', label: 'Surat Pernyataan Tatib', icon: StickyNote, field: 'fileTatibId' },
    { id: 'kk', label: 'Kartu Keluarga', icon: FileDigit, field: 'fileKkId' },
    { id: 'bukti', label: 'Bukti Pendaftaran', icon: Receipt, field: 'fileBuktiId' },
    { id: 'pernyataan', label: 'Surat Pertanggungjawaban Mutlak', icon: ShieldCheck, field: 'filePernyataanId' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 font-inter">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900 hidden sm:block">SPMB SMANSABA</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-slate-900">{profile.student.nmSiswa}</p>
              <p className="text-xs text-slate-500">NISN: {profile.student.nisn}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-500 hover:text-red-600 rounded-xl hover:bg-red-50">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
        {/* Welcome Card */}
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <GraduationCap className="w-48 h-48 text-blue-600" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">Selamat Datang, {profile.student.nmSiswa}!</h2>
              <p className="text-slate-500 text-sm sm:text-base">Silakan pantau status pendaftaran dan lengkapi berkas Anda di bawah ini.</p>
            </div>

            <div className={`p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-4 sm:gap-6 ${isLulus ? 'bg-emerald-50 border border-emerald-100' : 'bg-rose-50 border border-rose-100'}`}>
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shrink-0 ${isLulus ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                {isLulus ? <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" /> : <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" />}
              </div>
              <div className="text-center sm:text-left space-y-0.5 sm:space-y-1">
                <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest opacity-70">Hasil Seleksi</p>
                <h3 className={`text-2xl sm:text-4xl font-black italic tracking-tighter ${isLulus ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {isLulus ? 'ANDA LULUS' : 'TIDAK LULUS'}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                  {isLulus
                    ? `Selamat! Anda dinyatakan lulus pada jalur ${profile.kelulusan.jalur} (${profile.kelulusan.tahap}). Segera lengkapi berkas untuk daftar ulang.`
                    : 'Mohon maaf, Anda belum dinyatakan lulus pada seleksi kali ini. Tetap semangat!'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info & Guide Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150">
          <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Lightbulb className="w-20 h-20" />
            </div>
            <div className="relative z-10 space-y-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Info className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm sm:text-base">Panduan Berkas</h3>
              <p className="text-blue-50 text-[10px] sm:text-xs leading-relaxed">Pilih salah satu metode unggah yang paling mudah bagi Anda (Scan Foto atau Upload File PDF).</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm md:col-span-2 flex flex-col sm:flex-row gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 text-blue-600">
                <Camera className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Metode 1: Smart Scanner</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">Gunakan kamera HP untuk memfoto dokumen fisik secara langsung. Sistem akan otomatis merapikan (crop) dan merubahnya menjadi PDF.</p>
            </div>
            <div className="w-px h-full bg-slate-100 hidden sm:block" />
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 text-slate-400">
                <Upload className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Metode 2: Upload PDF</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">Jika Anda sudah memiliki file PDF digital (hasil scan mesin), gunakan tombol Upload untuk mengirim file tersebut.</p>
            </div>
          </div>
        </div>

        {isLulus && (
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden animate-in slide-in-from-bottom-4 duration-700 delay-300">
            <CardHeader className="bg-white border-b border-slate-100 px-6 py-5 sm:px-8 sm:py-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-slate-800">
                    <ClipboardCheck className="w-5 h-5 text-blue-600" />
                    Lengkapi Berkas Daftar Ulang
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm flex items-center gap-1.5">
                    <MousePointerClick className="w-3.5 h-3.5 text-blue-500" />
                    Klik tombol "Foto" atau "Upload" pada setiap dokumen.
                  </CardDescription>
                </div>
                <div className="flex items-center self-start sm:self-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold border border-blue-100 uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                  Google Drive Sync
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 bg-white">
              <div className="divide-y divide-slate-50">
                {docTypes.map((doc) => {
                  const driveId = profile.daftarUlang?.[doc.field]
                  const isUploading = uploadingField === doc.id

                  return (
                    <div key={doc.id} className="p-6 sm:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/30 transition-all duration-200">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${driveId ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400 group-hover:scale-110'}`}>
                          <doc.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{doc.label}</p>
                          {driveId ? (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Berhasil Diupload
                            </div>
                          ) : (
                            <p className="text-[10px] text-slate-400 font-medium italic">Menunggu unggahan berkas...</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        {driveId && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl h-10 px-4 font-bold border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:scale-95 flex-1 sm:flex-none justify-center"
                            onClick={() => setPreviewConfig({ isOpen: true, driveId: driveId, label: doc.label })}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            <span className="whitespace-nowrap">Lihat</span>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl h-10 px-4 font-bold border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:scale-95 flex-1 sm:flex-none justify-center"
                          onClick={() => setScannerConfig({ isOpen: true, type: doc.id, label: doc.label })}
                          disabled={!!isUploading}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          <span className="whitespace-nowrap">Foto</span>
                        </Button>

                        <label className="relative flex-1 sm:flex-none">
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf"
                            onChange={(e) => handleUpload(e, doc.id)}
                            disabled={!!isUploading}
                          />
                          <Button
                            variant={driveId ? "outline" : "default"}
                            size="sm"
                            className={`w-full rounded-xl h-10 px-6 font-bold transition-all ${!driveId ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 active:scale-95' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            asChild
                          >
                            <div>
                              {isUploading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Upload className="w-4 h-4 mr-2" />
                              )}
                              <span className="whitespace-nowrap">{driveId ? 'Ganti' : 'Upload'}</span>
                            </div>
                          </Button>
                        </label>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Cards */}
        <div className="grid sm:grid-cols-2 gap-4 animate-in fade-in duration-700 delay-300">
          <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4 relative overflow-hidden group hover:scale-[1.02] transition-transform">
            <div className="absolute -bottom-4 -right-4 opacity-10 rotate-12 transition-transform group-hover:scale-110">
              <ShieldCheck className="w-32 h-32" />
            </div>
            <div className="bg-white/10 w-10 h-10 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold">Keamanan Dokumen</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dokumen Anda tersimpan aman di infrastruktur Google Drive sekolah dengan enkripsi standar industri.
              </p>
            </div>
          </div>
          <div className="bg-blue-600 rounded-3xl p-6 text-white space-y-4 relative overflow-hidden group hover:scale-[1.02] transition-transform shadow-xl shadow-blue-200">
            <div className="absolute -bottom-4 -right-4 opacity-20 -rotate-12 transition-transform group-hover:scale-110">
              <StickyNote className="w-32 h-32" />
            </div>
            <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold">Butuh Bantuan?</h4>
              <p className="text-xs text-blue-100 leading-relaxed">
                Jika mengalami kendala teknis saat mengunggah PDF, hubungi sekretariat SPMB SMANSABA di hari kerja.
              </p>
            </div>
          </div>
        </div>
      </main>

      <DocumentScanner
        isOpen={scannerConfig.isOpen}
        onClose={() => setScannerConfig({ ...scannerConfig, isOpen: false })}
        title={scannerConfig.label}
        onUpload={(file) => handleScannerUpload(file, scannerConfig.type)}
      />

      <Dialog
        open={previewConfig.isOpen}
        onOpenChange={(open) => setPreviewConfig({ ...previewConfig, isOpen: open })}
      >
        <DialogContent className="max-w-[100vw] w-screen h-screen sm:max-w-5xl sm:h-[90vh] p-0 overflow-hidden sm:rounded-3xl border-none shadow-2xl flex flex-col bg-slate-900">
          <DialogHeader className="p-4 sm:p-6 bg-white border-b flex flex-row items-center justify-between shrink-0 h-16 sm:h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-sm sm:text-base font-bold text-slate-900">Preview: {previewConfig.label}</DialogTitle>
                <DialogDescription className="text-[10px] sm:text-xs text-slate-500 font-medium">Google Drive Viewer</DialogDescription>
              </div>
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

      {/* Upload Progress Overlay */}
      {uploadingField && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-[280px] sm:w-[320px] bg-white rounded-3xl border-none shadow-2xl p-6 sm:p-8 text-center space-y-4">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 border-4 border-blue-50/50 rounded-full" />
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Upload className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900">Sedang Mengunggah</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Mohon tunggu, berkas <span className="font-bold text-blue-600 uppercase">{uploadingField}</span> sedang disinkronkan ke Google Drive...
              </p>
            </div>
            <div className="pt-2">
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 w-2/3 animate-[pulse_2s_ease-in-out_infinite]" />
              </div>
            </div>
          </Card>
        </div>
      )}

      <footer className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="w-12 h-1 bg-slate-200 mx-auto rounded-full mb-6" />
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
          &copy; 2026 SMAN 1 BANTARUJEG • DIGITAL ADMISSION PORTAL
        </p>
      </footer>
    </div>
  )
}
