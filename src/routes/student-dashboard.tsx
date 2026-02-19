import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  GraduationCap,
  LogOut,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  StickyNote,
  ShieldCheck,
  FileDigit,
  Receipt,
  Eye,
  Camera,
  Info,
  User,
  Users,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { getFullStudentProfile, logoutStudent } from '@/lib/server/student-auth'
import { uploadStudentFile } from '@/lib/server/daftar-ulang'
import { getSchoolSearch } from '@/lib/server/pendaftar'
import { DocumentScanner } from '@/components/DocumentScanner'
import { Badge } from "@/components/ui/badge"

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
  const [isSaving, setIsSaving] = useState(false)
  const [activeStep, setActiveStep] = useState(1)
  const [uploadingField, setUploadingField] = useState<string | null>(null)

  const [formData, setFormData] = useState<any>({
    nmSiswa: '',
    nisn: '',
    tempatLahir: '',
    tanggalLahir: '',
    jenisKelamin: '',
    agama: '',
    statusDalamKel: '',
    anakKe: '',
    alamatSiswa: '',
    teleponSiswa: '',
    sekolahAsal: '',
    nmAyah: '',
    nmIbu: '',
    alamatOrtu: '',
    pekerjaanAyah: '',
    pekerjaanIbu: '',
    teleponOrtu: '',
  })

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
  const [sekolahResults, setSekolahResults] = useState<any[]>([])
  const [isSearchingSekolah, setIsSearchingSekolah] = useState(false)
  const [showSekolahResults, setShowSekolahResults] = useState(false)
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
      setFormData({
        id: data.student.id,
        nmSiswa: data.student.nmSiswa || '',
        nisn: data.student.nisn || '',
        tempatLahir: data.student.tempatLahir || '',
        tanggalLahir: data.student.tanggalLahir || '',
        jenisKelamin: data.student.jenisKelamin || '',
        agama: data.student.agama || '',
        statusDalamKel: data.student.statusDalamKel || '',
        anakKe: data.student.anakKe || '',
        alamatSiswa: data.student.alamatSiswa || '',
        teleponSiswa: data.student.teleponSiswa || '',
        sekolahAsal: data.student.sekolahAsal || '',
        nmAyah: data.student.nmAyah || '',
        nmIbu: data.student.nmIbu || '',
        alamatOrtu: data.student.alamatOrtu || '',
        pekerjaanAyah: data.student.pekerjaanAyah || '',
        pekerjaanIbu: data.student.pekerjaanIbu || '',
        teleponOrtu: data.student.teleponOrtu || '',
      })
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

  // School Search Toggle Results Logic
  useEffect(() => {
    const fetchSekolah = async () => {
      if (!formData.sekolahAsal || formData.sekolahAsal.length < 3) {
        setSekolahResults([])
        return
      }
      setIsSearchingSekolah(true)
      try {
        const results = await getSchoolSearch({ data: { query: formData.sekolahAsal } })
        setSekolahResults(results)
      } catch (error) {
        console.error('Failed to fetch sekolah:', error)
      } finally {
        setIsSearchingSekolah(false)
      }
    }
    const timeoutId = setTimeout(fetchSekolah, 500)
    return () => clearTimeout(timeoutId)
  }, [formData.sekolahAsal])

  const handleLogout = async () => {
    await logoutStudent()
    document.cookie = 'student_session=; path=/; max-age=0'
    navigate({ to: '/student-login' as any })
  }

  const handleSaveBiodata = async () => {
    // Validation for Step 2: Biodata Diri
    if (activeStep === 2) {
      const requiredFields = [
        'nmSiswa', 'tempatLahir', 'tanggalLahir', 'jenisKelamin',
        'agama', 'teleponSiswa', 'sekolahAsal', 'statusDalamKel',
        'anakKe', 'alamatSiswa'
      ]
      const missing = requiredFields.filter(f => !formData[f as keyof typeof formData])
      if (missing.length > 0) {
        toast.error('Mohon lengkapi semua data biodata diri')
        return
      }
    }
    // Validation for Step 3: Data Orang Tua
    else if (activeStep === 3) {
      const requiredFields = [
        'nmAyah', 'nmIbu', 'pekerjaanAyah', 'pekerjaanIbu',
        'teleponOrtu', 'alamatOrtu'
      ]
      const missing = requiredFields.filter(f => !formData[f as keyof typeof formData])
      if (missing.length > 0) {
        toast.error('Mohon lengkapi semua data orang tua')
        return
      }
    }

    setIsSaving(true)
    try {
      const { updateStudent } = await import('@/lib/server/students')
      await updateStudent({ data: formData })
      toast.success('Data biodata berhasil disimpan!')
      await fetchProfile()
      setActiveStep(prev => prev + 1)
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan biodata')
    } finally {
      setIsSaving(false)
    }
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
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)
    formDataUpload.append('type', type)
    formDataUpload.append('nisn', profile.student.nisn)
    formDataUpload.append('name', profile.student.nmSiswa)
    formDataUpload.append('kelulusanId', profile.kelulusan.id.toString())

    try {
      await uploadStudentFile({ data: formDataUpload })
      toast.success(`Berkas ${type.toUpperCase()} berhasil diunggah`)
      await fetchProfile()
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengunggah berkas')
    } finally {
      setUploadingField(null)
    }
  }

  const handleScannerUpload = async (file: File, type: string) => {
    setUploadingField(type)
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)
    formDataUpload.append('type', type)
    formDataUpload.append('nisn', profile.student.nisn)
    formDataUpload.append('name', profile.student.nmSiswa)
    formDataUpload.append('kelulusanId', profile.kelulusan.id.toString())

    try {
      await uploadStudentFile({ data: formDataUpload })
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
          <p className="text-slate-500 font-medium text-sm">Sedang memuat...</p>
        </div>
      </div>
    )
  }

  const docTypes = [
    { id: 'skl', label: 'SKL / Ijazah', icon: FileText, field: 'fileSklId' },
    { id: 'tatib', label: 'Surat Pernyataan Tatib', icon: StickyNote, field: 'fileTatibId' },
    { id: 'kk', label: 'Kartu Keluarga', icon: FileDigit, field: 'fileKkId' },
    { id: 'bukti', label: 'Bukti Pendaftaran', icon: Receipt, field: 'fileBuktiId' },
    { id: 'pernyataan', label: 'Surat Pertanggungjawaban Mutlak', icon: ShieldCheck, field: 'filePernyataanId' },
  ]

  const uploadedDocsCount = docTypes.filter(d => profile.daftarUlang?.[d.field]).length
  const totalDocs = docTypes.length

  const steps = [
    { id: 1, label: 'Informasi', icon: Info },
    { id: 2, label: 'Biodata Diri', icon: User },
    { id: 3, label: 'Orang Tua', icon: Users },
    { id: 4, label: 'Upload Berkas', icon: Upload },
    { id: 5, label: 'Selesai', icon: CheckCircle2 },
  ]

  return (
    <div className="min-h-screen bg-[#f8fafc] font-inter">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-sm sm:text-base">SPMB <span className="text-blue-600">SMANSABA</span></span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-red-600 rounded-md h-9 px-2 sm:px-3">
            <LogOut className="w-4 h-4 mr-1.5" />
            <span className="text-xs sm:text-sm">Keluar</span>
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between bg-white p-2 sm:p-4 border border-slate-200 rounded-md shadow-sm overflow-x-auto no-scrollbar scroll-smooth">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border transition-all ${activeStep === step.id ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' : activeStep > step.id ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-transparent border-transparent text-slate-400'}`}>
                <step.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4`} />
                <span className="text-[10px] sm:text-xs whitespace-nowrap">{step.label}</span>
              </div>
              {idx < steps.length - 1 && <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-200" />}
            </div>
          ))}
        </div>

        <Card className="border-slate-200 shadow-sm rounded-md overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                  {steps.find(s => s.id === activeStep)?.label}
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500">Tahap {activeStep} dari 5</CardDescription>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600/10 rounded-md flex items-center justify-center">
                {activeStep === 1 && <Info className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />}
                {activeStep === 2 && <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />}
                {activeStep === 3 && <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />}
                {activeStep === 4 && <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />}
                {activeStep === 5 && <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-8">
            {/* Step 1: Welcome & Status */}
            {activeStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="bg-blue-600 rounded-md p-8 text-white relative overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 opacity-10">
                    <GraduationCap className="w-64 h-64 rotate-12" />
                  </div>
                  <div className="relative z-10 space-y-4">
                    <h2 className="text-2xl font-black">Selamat, {profile.student.nmSiswa}!</h2>
                    <p className="text-blue-50 leading-relaxed font-medium">
                      Anda dinyatakan <span className="underline decoration-indigo-300 font-bold">LULUS SELEKSI</span> di SMA Negeri 1 Bantarujeg melalui jalur {profile.kelulusan.jalur}.
                      Langkah selanjutnya adalah melengkapi biodata dan dokumen untuk proses daftar ulang.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-md border border-slate-100 bg-slate-50/50 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-md bg-white border border-slate-100 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Lengkap</p>
                      <p className="font-bold text-slate-900">{profile.student.nmSiswa}</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-md border border-slate-100 bg-slate-50/50 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-md bg-white border border-slate-100 flex items-center justify-center shrink-0">
                      <FileDigit className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NISN</p>
                      <p className="font-bold text-slate-900">{profile.student.nisn}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Biodata Diri */}
            {activeStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nama Lengkap <span className="text-destructive">*</span></Label>
                  <Input value={formData.nmSiswa} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nmSiswa: e.target.value })} className="rounded-md border-slate-200 h-11" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">NISN</Label>
                  <Input value={formData.nisn} disabled className="rounded-md bg-slate-50 border-slate-200 h-11 italic" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Tempat Lahir <span className="text-destructive">*</span></Label>
                  <Input value={formData.tempatLahir} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, tempatLahir: e.target.value })} className="rounded-md border-slate-200 h-11" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Tanggal Lahir <span className="text-destructive">*</span></Label>
                  <Input type="date" value={formData.tanggalLahir} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, tanggalLahir: e.target.value })} className="rounded-md border-slate-200 h-11" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Jenis Kelamin <span className="text-destructive">*</span></Label>
                  <Select value={formData.jenisKelamin} onValueChange={(v: string) => setFormData({ ...formData, jenisKelamin: v })}>
                    <SelectTrigger className="w-full rounded-md border-slate-200 !h-11 flex items-center"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Laki-laki">Laki-laki</SelectItem><SelectItem value="Perempuan">Perempuan</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Agama <span className="text-destructive">*</span></Label>
                  <Select value={formData.agama} onValueChange={(v: string) => setFormData({ ...formData, agama: v })}>
                    <SelectTrigger className="w-full rounded-md border-slate-200 !h-11 flex items-center"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Islam">Islam</SelectItem>
                      <SelectItem value="Katolik">Katolik</SelectItem>
                      <SelectItem value="Protestan">Protestan</SelectItem>
                      <SelectItem value="Hindu">Hindu</SelectItem>
                      <SelectItem value="Budha">Budha</SelectItem>
                      <SelectItem value="Konghucu">Konghucu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">No. HP Siswa (WA) <span className="text-destructive">*</span></Label>
                  <Input value={formData.teleponSiswa} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, teleponSiswa: e.target.value })} className="rounded-md border-slate-200 h-11" required />
                </div>
                <div className="space-y-2 relative">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Asal Sekolah <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <Input
                      value={formData.sekolahAsal}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData({ ...formData, sekolahAsal: e.target.value })
                        setShowSekolahResults(true)
                      }}
                      onFocus={() => setShowSekolahResults(true)}
                      onBlur={() => setTimeout(() => setShowSekolahResults(false), 300)}
                      className="rounded-md border-slate-200 h-11 pr-10"
                      placeholder="Ketik nama sekolah..."
                      autoComplete="off"
                      required
                    />
                    {isSearchingSekolah && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                      </div>
                    )}
                  </div>
                  {showSekolahResults && sekolahResults.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                      {/* ... existing map code remains the same ... */}
                      {sekolahResults.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 border-b border-slate-50 flex flex-col group transition-colors"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setFormData({ ...formData, sekolahAsal: s.sekolah })
                            setShowSekolahResults(false)
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 group-hover:text-blue-700 capitalize">{s.sekolah.toLowerCase()}</span>
                            <Badge variant="outline" className={`text-[9px] font-bold px-1.5 py-0 rounded-md shrink-0 ${s.status === 'N' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                              {s.status === 'N' ? 'Negeri' : 'Swasta'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500 font-medium">
                            <Building2 className="w-3 h-3" />
                            <span>{s.kecamatan}, {s.kabupaten_kota}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Status Dalam Keluarga <span className="text-destructive">*</span></Label>
                  <Input value={formData.statusDalamKel} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, statusDalamKel: e.target.value })} className="rounded-md border-slate-200 h-11" placeholder="Misal: Anak Kandung" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Anak Ke <span className="text-destructive">*</span></Label>
                  <Input value={formData.anakKe} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, anakKe: e.target.value })} className="rounded-md border-slate-200 h-11" placeholder="Angka" required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Alamat Lengkap <span className="text-destructive">*</span></Label>
                  <Textarea value={formData.alamatSiswa} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, alamatSiswa: e.target.value })} className="rounded-md border-slate-200 min-h-[100px] resize-none" required />
                </div>
              </div>
            )}

            {/* Step 3: Orang Tua */}
            {activeStep === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nama Ayah <span className="text-destructive">*</span></Label>
                  <Input value={formData.nmAyah} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nmAyah: e.target.value })} className="rounded-md border-slate-200 h-11" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Pekerjaan Ayah <span className="text-destructive">*</span></Label>
                  <Input value={formData.pekerjaanAyah} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, pekerjaanAyah: e.target.value })} className="rounded-md border-slate-200 h-11" required />
                </div>
                <div className="space-y-2 border-t border-slate-50 pt-4 md:border-t-0 md:pt-0">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nama Ibu <span className="text-destructive">*</span></Label>
                  <Input value={formData.nmIbu} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nmIbu: e.target.value })} className="rounded-md border-slate-200 h-11" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Pekerjaan Ibu <span className="text-destructive">*</span></Label>
                  <Input value={formData.pekerjaanIbu} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, pekerjaanIbu: e.target.value })} className="rounded-md border-slate-200 h-11" required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">No. Telepon Orang Tua (WA) <span className="text-destructive">*</span></Label>
                  <Input value={formData.teleponOrtu} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, teleponOrtu: e.target.value })} className="rounded-md border-slate-200 h-11" required />
                </div>
                <div className="space-y-2 md:col-span-2 pt-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Alamat Orang Tua <span className="text-destructive">*</span></Label>
                  <Textarea value={formData.alamatOrtu} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, alamatOrtu: e.target.value })} className="rounded-md border-slate-200 min-h-[100px] resize-none" required />
                </div>
              </div>
            )}

            {/* Step 4: Documents */}
            {activeStep === 4 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-md flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-800 font-medium leading-relaxed">Pastikan semua dokumen dalam format <span className="font-bold">PDF</span> dengan ukuran maksimal <span className="font-bold">2MB</span> per berkas.</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {docTypes.map((doc) => {
                    const driveId = profile.daftarUlang?.[doc.field]
                    const isUploading = uploadingField === doc.id
                    return (
                      <div key={doc.id} className="p-4 border border-slate-200 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-200 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-md flex items-center justify-center ${driveId ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                            <doc.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{doc.label}</h4>
                            {driveId ? <span className="text-[10px] text-emerald-600 font-bold">Terupload</span> : <span className="text-[10px] text-slate-400">Belum diisi</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {driveId && <Button size="sm" variant="ghost" onClick={() => setPreviewConfig({ isOpen: true, driveId, label: doc.label })} className="h-8 rounded-md text-slate-500 hover:text-blue-600"><Eye className="w-4 h-4" /></Button>}
                          <Button size="sm" variant="outline" onClick={() => setScannerConfig({ isOpen: true, type: doc.id, label: doc.label })} className="h-8 rounded-md"><Camera className="w-4 h-4 mr-2" /> Foto</Button>
                          <label className="cursor-pointer">
                            <input type="file" className="hidden" accept=".pdf" onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpload(e, doc.id)} />
                            <div className="h-8 px-3 border border-slate-200 rounded-md flex items-center justify-center text-xs font-bold hover:bg-slate-50 transition-all">
                              {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3 mr-2" />}
                              Manual
                            </div>
                          </label>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 5: Success */}
            {activeStep === 5 && (
              <div className="py-12 flex flex-col items-center text-center space-y-6 animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 shadow-lg" />
                </div>
                <div className="space-y-2 max-w-sm mx-auto">
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">Proses Berhasil!</h2>
                  <p className="text-sm text-slate-500 font-medium">Data dan berkas Anda telah tersimpan. Silakan tunggu verifikasi dari panitia SPMB SMANSABA.</p>
                </div>
                <div className="pt-4">
                  <Button variant="outline" onClick={() => setActiveStep(1)} className="rounded-md border-slate-200 font-bold">
                    Tinjau Kembali
                  </Button>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="bg-slate-50/50 p-4 sm:p-6 border-t border-slate-100 flex items-center justify-between gap-3">
            <Button variant="ghost" disabled={activeStep === 1 || isSaving} onClick={() => setActiveStep(prev => prev - 1)} className="rounded-md font-bold text-slate-500 h-10 px-3 sm:px-4">
              <ChevronLeft className="w-4 h-4 mr-1" /> Kembali
            </Button>

            {activeStep < 4 ? (
              <Button onClick={handleSaveBiodata} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 rounded-md px-4 sm:px-8 h-10 font-bold shadow-lg shadow-blue-200 active:scale-[0.98] flex-1 sm:flex-none justify-center">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                <span className="hidden sm:inline">{activeStep === 1 ? 'Mulai Sekarang' : 'Simpan & Lanjut'}</span>
                <span className="sm:hidden">{activeStep === 1 ? 'Mulai' : 'Lanjut'}</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : activeStep === 4 ? (
              <Button onClick={() => setActiveStep(5)} disabled={uploadedDocsCount < totalDocs} className="bg-emerald-600 hover:bg-emerald-700 rounded-md px-4 sm:px-8 h-10 font-bold shadow-lg shadow-emerald-200 flex-1 sm:flex-none justify-center">
                Selesaikan <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <div className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Data Aman
              </div>
            )}
          </CardFooter>
        </Card>

        <p className="text-center text-[10px] text-slate-400 font-medium">
          &copy; 2026 SMAN 1 BANTARUJEG - Sistem Penerimaan Murid Baru
        </p>
      </main>

      {/* Components & Modals */}
      <DocumentScanner isOpen={scannerConfig.isOpen} onClose={() => setScannerConfig({ ...scannerConfig, isOpen: false })} title={scannerConfig.label} onUpload={(file) => handleScannerUpload(file, scannerConfig.type)} />

      <Dialog open={previewConfig.isOpen} onOpenChange={(open) => setPreviewConfig({ ...previewConfig, isOpen: open })}>
        <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden rounded-md border-none shadow-2xl flex flex-col bg-slate-900">
          <DialogHeader className="p-4 bg-white border-b flex flex-row items-center justify-between shrink-0 h-16">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <DialogTitle className="text-sm font-bold text-slate-900">{previewConfig.label}</DialogTitle>
            </div>
          </DialogHeader>
          <div className="flex-1 bg-slate-800 relative">
            {previewConfig.driveId && <iframe src={`https://drive.google.com/file/d/${previewConfig.driveId}/preview`} className="absolute inset-0 w-full h-full border-none" allow="autoplay" />}
          </div>
        </DialogContent>
      </Dialog>

      {uploadingField && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50/80 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-[300px] border-none shadow-2xl p-8 text-center space-y-4 rounded-md">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900">Mengunggah...</h3>
              <p className="text-[10px] text-slate-500">Berkas sedang diproses ke Google Drive</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
