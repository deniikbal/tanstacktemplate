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
  ChevronLeft,
  CalendarDays,
  ClipboardCheck,
  MapPin,
  Phone,
  Sparkles,
  Clock
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
  const [justUploaded, setJustUploaded] = useState<string | null>(null)

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
      console.log('Student data:', data.student)
      console.log('jenisKelamin:', data.student.jenisKelamin)
      console.log('agama:', data.student.agama)
      setProfile(data)
      // Normalisasi jenis kelamin dari "L"/"P" ke "Laki-laki"/"Perempuan"
      const rawJenisKelamin = data.student.jenisKelamin || ''
      const normalizedJenisKelamin = rawJenisKelamin === 'L' ? 'Laki-laki' : rawJenisKelamin === 'P' ? 'Perempuan' : rawJenisKelamin
      const newFormData = {
        id: data.student.id,
        nmSiswa: data.student.nmSiswa || '',
        nisn: data.student.nisn || '',
        tempatLahir: data.student.tempatLahir || '',
        tanggalLahir: data.student.tanggalLahir || '',
        jenisKelamin: normalizedJenisKelamin,
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
      }
      console.log('newFormData jenisKelamin:', newFormData.jenisKelamin)
      console.log('newFormData agama:', newFormData.agama)
      setFormData(newFormData)
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
    // Step 1: just navigate
    if (activeStep === 1) {
      setActiveStep(2)
      return
    }
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
      // Normalisasi jenis kelamin dari "Laki-laki"/"Perempuan" ke "L"/"P" sebelum menyimpan
      const dataToSave = {
        ...formData,
        jenisKelamin: formData.jenisKelamin === 'Laki-laki' ? 'L' : formData.jenisKelamin === 'Perempuan' ? 'P' : formData.jenisKelamin
      }
      await updateStudent({ data: dataToSave })
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
      setJustUploaded(type)
      setTimeout(() => setJustUploaded(null), 2000)
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
      setJustUploaded(type)
      setTimeout(() => setJustUploaded(null), 2000)
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
        <div className="text-center space-y-2">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-slate-500 font-medium text-xs">Sedang memuat...</p>
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

  // === Progress Calculation ===
  const biodataFields = ['nmSiswa', 'tempatLahir', 'tanggalLahir', 'jenisKelamin', 'agama', 'teleponSiswa', 'sekolahAsal', 'statusDalamKel', 'anakKe', 'alamatSiswa']
  const parentFields = ['nmAyah', 'nmIbu', 'pekerjaanAyah', 'pekerjaanIbu', 'teleponOrtu', 'alamatOrtu']
  const biodataFilled = biodataFields.filter(f => !!formData[f]).length
  const parentFilled = parentFields.filter(f => !!formData[f]).length
  const totalItems = biodataFields.length + parentFields.length + totalDocs
  const filledItems = biodataFilled + parentFilled + uploadedDocsCount
  const progressPercent = Math.round((filledItems / totalItems) * 100)

  // === Status Daftar Ulang ===
  const getRegistrationStatus = () => {
    if (filledItems === 0) return { label: 'Belum Mulai', color: 'bg-slate-100 text-slate-500 border-slate-200' }
    if (filledItems === totalItems) return { label: 'Lengkap', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    return { label: 'Sedang Proses', color: 'bg-amber-50 text-amber-700 border-amber-200' }
  }
  const regStatus = getRegistrationStatus()

  const steps = [
    { id: 1, label: 'Informasi', icon: Info },
    { id: 2, label: 'Biodata Diri', icon: User },
    { id: 3, label: 'Orang Tua', icon: Users },
    { id: 4, label: 'Upload Berkas', icon: Upload },
    { id: 5, label: 'Ringkasan', icon: ClipboardCheck },
    { id: 6, label: 'Selesai', icon: CheckCircle2 },
  ]

  // Timeline data
  const timelineItems = [
    { date: '14 - 30 Juni 2026', label: 'Periode Daftar Ulang', status: 'active' as const },
    { date: '1 - 3 Juli 2026', label: 'Verifikasi Berkas', status: 'upcoming' as const },
    { date: '7 Juli 2026', label: 'Pengumuman Hasil', status: 'upcoming' as const },
    { date: '14 Juli 2026', label: 'Masuk Sekolah', status: 'upcoming' as const },
  ]

  // Review data helper
  const reviewBiodata = [
    { label: 'Nama Lengkap', value: formData.nmSiswa },
    { label: 'NISN', value: formData.nisn },
    { label: 'Tempat Lahir', value: formData.tempatLahir },
    { label: 'Tanggal Lahir', value: formData.tanggalLahir ? new Date(formData.tanggalLahir).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-' },
    { label: 'Jenis Kelamin', value: formData.jenisKelamin },
    { label: 'Agama', value: formData.agama },
    { label: 'Status Dalam Keluarga', value: formData.statusDalamKel },
    { label: 'Anak Ke', value: formData.anakKe },
    { label: 'No. HP Siswa', value: formData.teleponSiswa },
    { label: 'Asal Sekolah', value: formData.sekolahAsal },
    { label: 'Alamat Siswa', value: formData.alamatSiswa },
  ]

  const reviewOrtu = [
    { label: 'Nama Ayah', value: formData.nmAyah },
    { label: 'Pekerjaan Ayah', value: formData.pekerjaanAyah },
    { label: 'Nama Ibu', value: formData.nmIbu },
    { label: 'Pekerjaan Ibu', value: formData.pekerjaanIbu },
    { label: 'No. Telepon Ortu', value: formData.teleponOrtu },
    { label: 'Alamat Orang Tua', value: formData.alamatOrtu },
  ]

  return (
    <div className="min-h-screen bg-[#f8fafc] font-inter">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-3 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-xs sm:text-sm">SPMB <span className="text-primary">SMANSABA</span></span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-red-600 rounded-md h-7 px-2 text-xs">
            <LogOut className="w-3.5 h-3.5 mr-1" />
            <span className="text-xs">Keluar</span>
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4 space-y-2 sm:space-y-3">

        {/* === 1. Progress Bar === */}
        <div className="bg-white border border-slate-200 rounded-md shadow-sm p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Progres Daftar Ulang</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge className={`text-[9px] font-bold px-1.5 py-0 border ${regStatus.color}`}>{regStatus.label}</Badge>
              <span className="text-xs font-black text-primary">{progressPercent}%</span>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progressPercent}%`,
                background: progressPercent === 100
                  ? 'linear-gradient(90deg, #10b981, #059669)'
                  : 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))'
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-[9px] text-slate-400 font-medium">
            <span>Biodata {biodataFilled}/{biodataFields.length}</span>
            <span>Ortu {parentFilled}/{parentFields.length}</span>
            <span>Berkas {uploadedDocsCount}/{totalDocs}</span>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between bg-white p-1.5 sm:p-2 border border-slate-200 rounded-md shadow-sm overflow-x-auto no-scrollbar scroll-smooth">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={() => setActiveStep(step.id)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md border transition-all ${activeStep === step.id ? 'bg-primary/10 border-primary/20 text-primary font-bold' : activeStep > step.id ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-transparent border-transparent text-slate-400'}`}
              >
                <step.icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5`} />
                <span className="text-[9px] sm:text-[10px] whitespace-nowrap">{step.label}</span>
              </button>
              {idx < steps.length - 1 && <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-200" />}
            </div>
          ))}
        </div>

        <Card className="border-slate-200 shadow-sm rounded-md overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <CardTitle className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  {steps.find(s => s.id === activeStep)?.label}
                </CardTitle>
                <CardDescription className="text-[10px] font-medium text-slate-500">Tahap {activeStep} dari 6</CardDescription>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary/10 rounded-md flex items-center justify-center">
                {activeStep === 1 && <Info className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
                {activeStep === 2 && <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
                {activeStep === 3 && <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
                {activeStep === 4 && <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
                {activeStep === 5 && <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
                {activeStep === 6 && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-5">
            {/* Step 1: Welcome & Status - ENHANCED */}
            {activeStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-500">
                {/* Welcome Banner */}
                <div className="bg-primary rounded-md p-4 sm:p-6 text-white relative overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 opacity-10">
                    <GraduationCap className="w-32 h-32 sm:w-64 sm:h-64 rotate-12" />
                  </div>
                  <div className="relative z-10 space-y-2 sm:space-y-3">
                    <h2 className="text-lg sm:text-2xl font-black">Selamat, {profile.student.nmSiswa}!</h2>
                    <p className="text-primary-foreground/90 leading-relaxed font-medium text-xs sm:text-sm">
                      Anda dinyatakan <span className="underline decoration-white/30 font-bold">LULUS SELEKSI</span> di SMA Negeri 1 Bantarujeg melalui jalur {profile.kelulusan.jalur}.
                      Langkah selanjutnya adalah melengkapi biodata dan dokumen untuk proses daftar ulang.
                    </p>
                  </div>
                </div>

                {/* === 5. Card Ringkasan Informatif === */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-3 rounded-md border border-slate-100 bg-slate-50/50 flex items-start gap-2">
                    <div className="w-8 h-8 rounded-md bg-white border border-slate-100 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Nama</p>
                      <p className="font-bold text-slate-900 text-xs truncate">{profile.student.nmSiswa}</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-md border border-slate-100 bg-slate-50/50 flex items-start gap-2">
                    <div className="w-8 h-8 rounded-md bg-white border border-slate-100 flex items-center justify-center shrink-0">
                      <FileDigit className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">NISN</p>
                      <p className="font-bold text-slate-900 text-xs">{profile.student.nisn}</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-md border border-slate-100 bg-slate-50/50 flex items-start gap-2">
                    <div className="w-8 h-8 rounded-md bg-white border border-slate-100 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Jalur Masuk</p>
                      <p className="font-bold text-slate-900 text-xs truncate">{profile.kelulusan.jalur || '-'}</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-md border border-slate-100 bg-slate-50/50 flex items-start gap-2">
                    <div className="w-8 h-8 rounded-md bg-white border border-slate-100 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sekolah Asal</p>
                      <p className="font-bold text-slate-900 text-xs truncate">{profile.student.sekolahAsal || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* === 3. Status Daftar Ulang === */}
                <div className="p-3 rounded-md border border-slate-200 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold text-slate-700">Status Daftar Ulang</span>
                    </div>
                    <Badge className={`text-[10px] font-bold px-2 py-0.5 border ${regStatus.color}`}>
                      {regStatus.label}
                    </Badge>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <div className="text-center p-2 rounded-md bg-slate-50">
                      <p className="text-lg font-black text-primary">{biodataFilled}/{biodataFields.length}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Biodata</p>
                    </div>
                    <div className="text-center p-2 rounded-md bg-slate-50">
                      <p className="text-lg font-black text-primary">{parentFilled}/{parentFields.length}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Ortu</p>
                    </div>
                    <div className="text-center p-2 rounded-md bg-slate-50">
                      <p className="text-lg font-black text-primary">{uploadedDocsCount}/{totalDocs}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Berkas</p>
                    </div>
                  </div>
                </div>


              </div>
            )}

            {/* Step 2: Biodata Diri */}
            {activeStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in slide-in-from-right-4 duration-500">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Nama Lengkap <span className="text-destructive">*</span></Label>
                  <Input value={formData.nmSiswa} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nmSiswa: e.target.value })} className="rounded-md border-slate-200 h-8 text-sm" required />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">NISN</Label>
                  <Input value={formData.nisn} disabled className="rounded-md bg-slate-50 border-slate-200 h-8 text-sm italic" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tempat Lahir <span className="text-destructive">*</span></Label>
                  <Input value={formData.tempatLahir} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, tempatLahir: e.target.value })} className="rounded-md border-slate-200 h-8 text-sm" required />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tanggal Lahir <span className="text-destructive">*</span></Label>
                  <Input type="date" value={formData.tanggalLahir} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, tanggalLahir: e.target.value })} className="rounded-md border-slate-200 h-8 text-sm" required />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Jenis Kelamin <span className="text-destructive">*</span></Label>
                  <Select value={formData.jenisKelamin} onValueChange={(v: string) => setFormData({ ...formData, jenisKelamin: v })}>
                    <SelectTrigger className="w-full h-8 rounded-md border-slate-200 bg-white text-sm">
                      <SelectValue placeholder="Pilih Jenis Kelamin" />
                    </SelectTrigger>
                    <SelectContent><SelectItem value="Laki-laki" className="text-sm">Laki-laki</SelectItem><SelectItem value="Perempuan" className="text-sm">Perempuan</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Agama <span className="text-destructive">*</span></Label>
                  <Select value={formData.agama} onValueChange={(v: string) => setFormData({ ...formData, agama: v })}>
                    <SelectTrigger className="w-full h-8 rounded-md border-slate-200 bg-white text-sm">
                      <SelectValue placeholder="Pilih Agama" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Islam" className="text-sm">Islam</SelectItem>
                      <SelectItem value="Katolik" className="text-sm">Katolik</SelectItem>
                      <SelectItem value="Protestan" className="text-sm">Protestan</SelectItem>
                      <SelectItem value="Hindu" className="text-sm">Hindu</SelectItem>
                      <SelectItem value="Budha" className="text-sm">Budha</SelectItem>
                      <SelectItem value="Konghucu" className="text-sm">Konghucu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">No. HP Siswa (WA) <span className="text-destructive">*</span></Label>
                  <Input value={formData.teleponSiswa} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, teleponSiswa: e.target.value })} className="rounded-md border-slate-200 h-8 text-sm" required />
                </div>
                <div className="space-y-1 relative">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Asal Sekolah <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <Input
                      value={formData.sekolahAsal}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData({ ...formData, sekolahAsal: e.target.value })
                        setShowSekolahResults(true)
                      }}
                      onFocus={() => setShowSekolahResults(true)}
                      onBlur={() => setTimeout(() => setShowSekolahResults(false), 300)}
                      className="rounded-md border-slate-200 h-8 text-sm pr-10"
                      placeholder="Ketik nama sekolah..."
                      autoComplete="off"
                      required
                    />
                    {isSearchingSekolah && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
                      </div>
                    )}
                  </div>
                  {showSekolahResults && sekolahResults.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                      {sekolahResults.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="w-full text-left px-3 py-2 text-xs hover:bg-primary/5 border-b border-slate-50 flex flex-col group transition-colors"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setFormData({ ...formData, sekolahAsal: s.sekolah })
                            setShowSekolahResults(false)
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 group-hover:text-primary capitalize">{s.sekolah.toLowerCase()}</span>
                            <Badge variant="outline" className={`text-[8px] font-bold px-1 py-0 rounded-md shrink-0 ${s.status === 'N' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                              {s.status === 'N' ? 'Negeri' : 'Swasta'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5 text-[9px] text-slate-500 font-medium">
                            <Building2 className="w-2.5 h-2.5" />
                            <span>{s.kecamatan}, {s.kabupaten_kota}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Status Dalam Keluarga <span className="text-destructive">*</span></Label>
                  <Select value={formData.statusDalamKel} onValueChange={(v: string) => setFormData({ ...formData, statusDalamKel: v })}>
                    <SelectTrigger className="w-full h-8 rounded-md border-slate-200 bg-white text-sm">
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Anak Kandung" className="text-sm">Anak Kandung</SelectItem>
                      <SelectItem value="Anak Tiri" className="text-sm">Anak Tiri</SelectItem>
                      <SelectItem value="Anak Angkat" className="text-sm">Anak Angkat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Anak Ke <span className="text-destructive">*</span></Label>
                  <Input value={formData.anakKe} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, anakKe: e.target.value })} className="rounded-md border-slate-200 h-8 text-sm" placeholder="Angka" required />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Alamat Lengkap <span className="text-destructive">*</span></Label>
                  <Textarea value={formData.alamatSiswa} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, alamatSiswa: e.target.value })} className="rounded-md border-slate-200 min-h-[60px] resize-none text-sm" required />
                </div>
              </div>
            )}

            {/* Step 3: Orang Tua */}
            {activeStep === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in slide-in-from-right-4 duration-500">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Nama Ayah <span className="text-destructive">*</span></Label>
                  <Input value={formData.nmAyah} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nmAyah: e.target.value })} className="rounded-md border-slate-200 h-8 text-sm" required />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pekerjaan Ayah <span className="text-destructive">*</span></Label>
                  <Input value={formData.pekerjaanAyah} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, pekerjaanAyah: e.target.value })} className="rounded-md border-slate-200 h-8 text-sm" required />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Nama Ibu <span className="text-destructive">*</span></Label>
                  <Input value={formData.nmIbu} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nmIbu: e.target.value })} className="rounded-md border-slate-200 h-8 text-sm" required />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pekerjaan Ibu <span className="text-destructive">*</span></Label>
                  <Input value={formData.pekerjaanIbu} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, pekerjaanIbu: e.target.value })} className="rounded-md border-slate-200 h-8 text-sm" required />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">No. Telepon Orang Tua (WA) <span className="text-destructive">*</span></Label>
                  <Input value={formData.teleponOrtu} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, teleponOrtu: e.target.value })} className="rounded-md border-slate-200 h-8 text-sm" required />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Alamat Orang Tua <span className="text-destructive">*</span></Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData({ ...formData, alamatOrtu: formData.alamatSiswa })}
                      className="h-6 text-[9px] text-primary hover:text-primary/90 hover:bg-primary/10 font-medium"
                      disabled={!formData.alamatSiswa}
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      Salin dari Alamat Siswa
                    </Button>
                  </div>
                  <Textarea value={formData.alamatOrtu} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, alamatOrtu: e.target.value })} className="rounded-md border-slate-200 min-h-[60px] resize-none text-sm" required />
                </div>
              </div>
            )}

            {/* Step 4: Documents - with micro-animation */}
            {activeStep === 4 && (
              <div className="space-y-3 animate-in slide-in-from-right-4 duration-500">
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-md flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 font-medium leading-relaxed">Pastikan semua dokumen dalam format <span className="font-bold">PDF</span> dengan ukuran maksimal <span className="font-bold">2MB</span> per berkas.</p>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {docTypes.map((doc) => {
                    const driveId = profile.daftarUlang?.[doc.field]
                    const isUploading = uploadingField === doc.id
                    const isJustUploaded = justUploaded === doc.id
                    return (
                      <div
                        key={doc.id}
                        className={`p-3 border rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-500 ${
                          isJustUploaded
                            ? 'border-emerald-400 bg-emerald-50 scale-[1.01] shadow-md shadow-emerald-100'
                            : driveId
                              ? 'border-emerald-200 bg-emerald-50/30 hover:border-emerald-300'
                              : 'border-slate-200 hover:border-primary/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-md flex items-center justify-center transition-all duration-500 ${
                            isJustUploaded
                              ? 'bg-emerald-500 text-white scale-110'
                              : driveId
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-slate-50 text-slate-400'
                          }`}>
                            {isJustUploaded ? (
                              <CheckCircle2 className="w-4 h-4 animate-in zoom-in duration-300" />
                            ) : (
                              <doc.icon className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{doc.label}</h4>
                            {isJustUploaded ? (
                              <span className="text-[9px] text-emerald-600 font-bold animate-in fade-in duration-300">✓ Berhasil diupload!</span>
                            ) : driveId ? (
                              <span className="text-[9px] text-emerald-600 font-bold">Terupload</span>
                            ) : (
                              <span className="text-[9px] text-slate-400">Belum diisi</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {driveId && <Button size="sm" variant="ghost" onClick={() => setPreviewConfig({ isOpen: true, driveId, label: doc.label })} className="h-7 rounded-md text-slate-500 hover:text-primary"><Eye className="w-3.5 h-3.5" /></Button>}
                          <label className="cursor-pointer">
                            <input type="file" className="hidden" accept=".pdf" onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpload(e, doc.id)} />
                            <div className="h-7 px-2 border border-slate-200 rounded-md flex items-center justify-center text-xs font-bold hover:bg-slate-50 transition-all">
                              {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3 sm:mr-1" />}
                              <span className="hidden sm:inline">Manual</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* === 2. Step 5: Review / Ringkasan === */}
            {activeStep === 5 && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                {/* Biodata Review */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-3.5 h-3.5 text-primary" />
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Biodata Diri</h3>
                    <Button variant="ghost" size="sm" className="ml-auto h-5 text-[9px] text-primary hover:text-primary/90 px-1.5" onClick={() => setActiveStep(2)}>
                      Edit
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 p-3 rounded-md border border-slate-100 bg-slate-50/50">
                    {reviewBiodata.map((item, idx) => (
                      <div key={idx} className={`flex flex-col py-1 ${item.label === 'Alamat Siswa' ? 'sm:col-span-2' : ''}`}>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
                        <span className={`text-xs font-medium ${item.value ? 'text-slate-900' : 'text-red-400 italic'}`}>
                          {item.value || 'Belum diisi'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Orang Tua Review */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Data Orang Tua</h3>
                    <Button variant="ghost" size="sm" className="ml-auto h-5 text-[9px] text-primary hover:text-primary/90 px-1.5" onClick={() => setActiveStep(3)}>
                      Edit
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 p-3 rounded-md border border-slate-100 bg-slate-50/50">
                    {reviewOrtu.map((item, idx) => (
                      <div key={idx} className={`flex flex-col py-1 ${item.label === 'Alamat Orang Tua' ? 'sm:col-span-2' : ''}`}>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
                        <span className={`text-xs font-medium ${item.value ? 'text-slate-900' : 'text-red-400 italic'}`}>
                          {item.value || 'Belum diisi'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Berkas Review */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Upload className="w-3.5 h-3.5 text-primary" />
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Berkas Dokumen</h3>
                    <Button variant="ghost" size="sm" className="ml-auto h-5 text-[9px] text-primary hover:text-primary/90 px-1.5" onClick={() => setActiveStep(4)}>
                      Edit
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 p-3 rounded-md border border-slate-100 bg-slate-50/50">
                    {docTypes.map((doc) => {
                      const driveId = profile.daftarUlang?.[doc.field]
                      return (
                        <div key={doc.id} className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-2">
                            <doc.icon className={`w-3.5 h-3.5 ${driveId ? 'text-emerald-600' : 'text-slate-400'}`} />
                            <span className="text-xs font-medium text-slate-700">{doc.label}</span>
                          </div>
                          {driveId ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] font-bold px-1.5 py-0">
                              <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                              Terupload
                            </Badge>
                          ) : (
                            <Badge className="bg-red-50 text-red-500 border-red-200 text-[9px] font-bold px-1.5 py-0">
                              <AlertCircle className="w-2.5 h-2.5 mr-1" />
                              Belum
                            </Badge>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Warning if not complete */}
                {filledItems < totalItems && (
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-md flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 font-medium leading-relaxed">
                      Masih ada <span className="font-bold">{totalItems - filledItems} data</span> yang belum diisi. Lengkapi terlebih dahulu agar proses daftar ulang bisa diselesaikan.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 6: Success */}
            {activeStep === 6 && (
              <div className="py-8 flex flex-col items-center text-center space-y-4 animate-in zoom-in duration-500">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 shadow-lg" />
                </div>
                <div className="space-y-1.5 max-w-sm mx-auto">
                  <h2 className="text-xl font-black text-slate-900 leading-tight">Proses Berhasil!</h2>
                  <p className="text-xs text-slate-500 font-medium">Data dan berkas Anda telah tersimpan. Silakan tunggu verifikasi dari panitia SPMB SMANSABA.</p>
                </div>
                <div className="pt-2">
                  <Button variant="outline" onClick={() => setActiveStep(1)} className="rounded-md border-slate-200 font-bold h-8 text-xs">
                    Tinjau Kembali
                  </Button>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="bg-slate-50/50 p-3 sm:p-4 border-t border-slate-100 flex items-center justify-between gap-2">
            <Button variant="ghost" disabled={activeStep === 1 || isSaving} onClick={() => setActiveStep(prev => prev - 1)} className="rounded-md font-bold text-slate-500 h-8 px-2 sm:px-3 text-xs">
              <ChevronLeft className="w-3.5 h-3.5 mr-1" /> <span className="hidden sm:inline">Kembali</span>
            </Button>

            {activeStep === 1 ? (
              <Button onClick={() => setActiveStep(2)} className="bg-primary hover:bg-primary/90 rounded-md px-3 sm:px-6 h-8 font-bold shadow-lg shadow-primary/20 active:scale-[0.98] flex-1 sm:flex-none justify-center text-xs">
                Mulai Sekarang
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            ) : activeStep < 4 ? (
              <Button onClick={handleSaveBiodata} disabled={isSaving} className="bg-primary hover:bg-primary/90 rounded-md px-3 sm:px-6 h-8 font-bold shadow-lg shadow-primary/20 active:scale-[0.98] flex-1 sm:flex-none justify-center text-xs">
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                <span className="hidden sm:inline">Simpan & Lanjut</span>
                <span className="sm:hidden">Lanjut</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            ) : activeStep === 4 ? (
              <Button onClick={() => setActiveStep(5)} className="bg-primary hover:bg-primary/90 rounded-md px-3 sm:px-6 h-8 font-bold shadow-lg shadow-primary/20 flex-1 sm:flex-none justify-center text-xs">
                Lihat Ringkasan <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            ) : activeStep === 5 ? (
              <Button onClick={() => setActiveStep(6)} disabled={filledItems < totalItems} className="bg-emerald-600 hover:bg-emerald-700 rounded-md px-3 sm:px-6 h-8 font-bold shadow-lg shadow-emerald-200 flex-1 sm:flex-none justify-center text-xs">
                Selesaikan Daftar Ulang <CheckCircle2 className="w-3.5 h-3.5 ml-1" />
              </Button>
            ) : (
              <div className="text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> <span className="hidden sm:inline">Data Aman</span>
              </div>
            )}
          </CardFooter>
        </Card>

        <p className="text-center text-[9px] text-slate-400 font-medium">
          &copy; 2026 SMAN 1 BANTARUJEG - Sistem Penerimaan Murid Baru
        </p>
      </main>

      {/* Components & Modals */}
      <DocumentScanner isOpen={scannerConfig.isOpen} onClose={() => setScannerConfig({ ...scannerConfig, isOpen: false })} title={scannerConfig.label} onUpload={(file) => handleScannerUpload(file, scannerConfig.type)} />

      <Dialog open={previewConfig.isOpen} onOpenChange={(open) => setPreviewConfig({ ...previewConfig, isOpen: open })}>
        <DialogContent className="w-[90vw] sm:max-w-4xl h-[90vh] p-0 overflow-hidden rounded-2xl sm:rounded-3xl border-none shadow-2xl flex flex-col bg-slate-900">
          <DialogHeader className="p-4 bg-white border-b flex flex-row items-center justify-between shrink-0 h-16">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
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
          <Card className="w-[300px] border-none shadow-2xl p-6 text-center space-y-4 rounded-md bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="relative mx-auto w-16 h-16">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
                <Upload className="w-7 h-7 text-white animate-bounce" />
              </div>
            </div>
            <div className="space-y-1.5">
              <h3 className="font-black text-slate-900 text-base">Mengunggah...</h3>
              <p className="text-[10px] text-slate-500 font-medium">Berkas sedang diproses ke Google Drive</p>
            </div>
            <div className="flex justify-center gap-1 pt-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-primary/80 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
