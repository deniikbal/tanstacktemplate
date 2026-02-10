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
  ClipboardCheck
} from 'lucide-react'
import { toast } from 'sonner'
import { getFullStudentProfile, logoutStudent } from '@/lib/server/student-auth'
import { uploadStudentFile } from '@/lib/server/daftar-ulang'

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
  const navigate = useNavigate()

  const fetchProfile = async () => {
    try {
      console.log('[Client] All cookies:', document.cookie)
      const session = getClientSession()
      console.log('[Client] Parsed session:', session)
      if (!session) {
        console.log('[Client] No session found, redirecting to login')
        navigate({ to: '/student-login' as any })
        return
      }
      console.log('[Client] Calling getFullStudentProfile with studentId:', session.id)
      const data = await getFullStudentProfile({ data: { studentId: session.id } })
      console.log('[Client] Profile data received:', data ? 'yes' : 'null')
      if (!data) {
        navigate({ to: '/student-login' as any })
        return
      }
      setProfile(data)
    } catch (error: any) {
      console.error('[Client] fetchProfile error:', error?.message || error)
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

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB')
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

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="text-slate-500 font-medium font-inter text-sm">Memvalidasi sesi portal siswa...</p>
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
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
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
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <GraduationCap className="w-48 h-48 text-blue-600" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Selamat Datang, {profile.student.nmSiswa}!</h2>
              <p className="text-slate-500">Silakan pantau status pendaftaran dan lengkapi berkas Anda di bawah ini.</p>
            </div>

            <div className={`p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-6 ${isLulus ? 'bg-emerald-50 border border-emerald-100' : 'bg-rose-50 border border-rose-100'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 ${isLulus ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                {isLulus ? <CheckCircle2 className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
              </div>
              <div className="text-center sm:text-left space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest opacity-70">Hasil Seleksi</p>
                <h3 className={`text-4xl font-black italic tracking-tighter ${isLulus ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {isLulus ? 'ANDA LULUS' : 'TIDAK LULUS'}
                </h3>
                <p className="text-slate-600 text-sm font-medium">
                  {isLulus
                    ? `Selamat! Anda dinyatakan lulus pada jalur ${profile.kelulusan.jalur} (${profile.kelulusan.tahap}). Segera lengkapi berkas untuk daftar ulang.`
                    : 'Mohon maaf, Anda belum dinyatakan lulus pada seleksi kali ini. Tetap semangat!'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {isLulus && (
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden animate-in slide-in-from-bottom-4 duration-700">
            <CardHeader className="bg-white border-b border-slate-100 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                    <ClipboardCheck className="w-5 h-5 text-blue-600" />
                    Upload Berkas (PDF)
                  </CardTitle>
                  <CardDescription>File maksimal 5MB per dokumen.</CardDescription>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold border border-blue-100 uppercase tracking-wider">
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

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <label className="relative">
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
                            className={`rounded-xl h-10 px-6 font-bold transition-all ${!driveId ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 active:scale-95' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            asChild
                          >
                            <span>
                              {isUploading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <Upload className="w-4 h-4 mr-2" />
                              )}
                              {isUploading ? 'Mengunggah...' : driveId ? 'Ganti Berkas' : 'Upload Berkas'}
                            </span>
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

      <footer className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="w-12 h-1 bg-slate-200 mx-auto rounded-full mb-6" />
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
          &copy; 2026 SMAN 1 BANTARUJEG • DIGITAL ADMISSION PORTAL
        </p>
      </footer>
    </div>
  )
}
