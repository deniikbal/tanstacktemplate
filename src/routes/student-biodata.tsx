import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
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
import {
  GraduationCap,
  ArrowLeft,
  Save,
  Loader2,
  User,
  Database,
  Home,
  Phone,
  Users,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'
import { getFullStudentProfile } from '@/lib/server/student-auth'
import { updateStudent } from '@/lib/server/students'
import { Separator } from '@/components/ui/separator'
import { Badge } from "@/components/ui/badge"

export const Route = createFileRoute('/student-biodata')({
  component: StudentBiodataPage,
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

function StudentBiodataPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeStep, setActiveStep] = useState(1)
  const [profile, setProfile] = useState<any>(null)

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

      // Populate form
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsSaving(true)
    try {
      await updateStudent({ data: formData })
      toast.success('Biodata berhasil disimpan!')
      // Optional: redirect back to dashboard
      setTimeout(() => {
        navigate({ to: '/student-dashboard' as any })
      }, 1500)
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan biodata')
    } finally {
      setIsSaving(false)
    }
  }

  const nextStep = () => {
    // Basic validation based on step could go here
    setActiveStep(prev => Math.min(prev + 1, 3))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const prevStep = () => {
    setActiveStep(prev => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-slate-500 font-medium text-sm">Sedang memuat data...</p>
        </div>
      </div>
    )
  }

  const steps = [
    { id: 1, label: 'Data Pribadi', icon: User },
    { id: 2, label: 'Alamat & Kontak', icon: Home },
    { id: 3, label: 'Data Orang Tua', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-slate-50 font-inter py-8 px-4 pb-20">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Navigation with simplified look */}
        <div className="flex items-center justify-between">
          <Link
            to="/student-dashboard"
            className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Ke Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Formulir Peserta Didik</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Navigation (Desktop Sticky) */}
          <div className="lg:col-span-3 lg:block">
            <div className="sticky top-8 space-y-4">
              <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm">
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h2 className="font-bold text-slate-900 text-lg">Lengkapi Biodata</h2>
                    <p className="text-xs text-slate-500 leading-relaxed">Mohon isi data dengan benar sesuai dokumen asli (Ijazah/KK).</p>
                  </div>

                  <div className="space-y-1 relative">
                    {/* Connecting Line */}
                    <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-slate-100 -z-10" />

                    {steps.map((step) => (
                      <button
                        key={step.id}
                        onClick={() => setActiveStep(step.id)}
                        className={`flex items-center gap-3 w-full p-2 rounded-xl transition-all ${activeStep === step.id
                            ? 'bg-primary/10 text-primary'
                            : activeStep > step.id
                              ? 'text-emerald-600'
                              : 'text-slate-400 hover:bg-slate-50'
                          }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${activeStep === step.id
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : activeStep > step.id
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-100 text-slate-400'
                          }`}>
                          {activeStep > step.id ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                        </div>
                        <span className={`text-sm font-bold ${activeStep === step.id ? 'translate-x-1' : ''} transition-transform`}>{step.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-indigo-600 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-indigo-200">
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <Database className="w-32 h-32 rotate-12" />
                </div>
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-3 h-3" />
                    Penting
                  </div>
                  <p className="text-xs leading-relaxed font-medium">
                    Data yang disimpan akan digunakan untuk pencetakan formulir dan data pokok pendidikan (Dapodik).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form Area */}
          <div className="lg:col-span-9">
            <form onSubmit={(e) => e.preventDefault()}>
              <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden min-h-[600px] flex flex-col">
                <CardHeader className="px-8 pt-8 pb-0">
                  <div className="flex items-center justify-between mb-6">
                    <div className="space-y-1">
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight">{steps[activeStep - 1].label}</h1>
                      <p className="text-slate-500 text-sm">Langkah {activeStep} dari 3</p>
                    </div>
                    <div className="hidden sm:block">
                      <Badge variant="outline" className="px-3 py-1 rounded-full text-slate-500 border-slate-200">
                        {Math.round((activeStep / 3) * 100)}% Selesai
                      </Badge>
                    </div>
                  </div>
                  <Separator className="bg-slate-100" />
                </CardHeader>

                <CardContent className="p-8 flex-1">

                  {/* Step 1: Data Pribadi */}
                  {activeStep === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-700 ml-1">Nama Lengkap</Label>
                        <Input
                          value={formData.nmSiswa}
                          onChange={(e) => setFormData({ ...formData, nmSiswa: e.target.value })}
                          className="rounded-2xl h-12 border-slate-200 focus:ring-primary font-medium"
                          placeholder="Nama Lengkap"
                          autoFocus
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-700 ml-1">NISN (Sesuai Akun)</Label>
                        <Input
                          value={formData.nisn}
                          disabled
                          className="rounded-2xl h-12 border-slate-200 bg-slate-50 text-slate-400 font-medium italic"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-700 ml-1">Tempat Lahir</Label>
                        <Input
                          value={formData.tempatLahir}
                          onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                          className="rounded-2xl h-12 border-slate-200 focus:ring-primary font-medium"
                          placeholder="Contoh: Majalengka"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-700 ml-1">Tanggal Lahir</Label>
                        <Input
                          type="date"
                          value={formData.tanggalLahir}
                          onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                          className="rounded-2xl h-12 border-slate-200 focus:ring-primary font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-700 ml-1">Jenis Kelamin</Label>
                        <Select value={formData.jenisKelamin} onValueChange={(val) => setFormData({ ...formData, jenisKelamin: val })}>
                          <SelectTrigger className="rounded-2xl h-12 border-slate-200 focus:ring-primary font-medium">
                            <SelectValue placeholder="Pilih Jenis Kelamin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                            <SelectItem value="Perempuan">Perempuan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-700 ml-1">Agama</Label>
                        <Select value={formData.agama} onValueChange={(val) => setFormData({ ...formData, agama: val })}>
                          <SelectTrigger className="rounded-2xl h-12 border-slate-200 focus:ring-primary font-medium">
                            <SelectValue placeholder="Pilih Agama" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Islam">Islam</SelectItem>
                            <SelectItem value="Kristen">Kristen</SelectItem>
                            <SelectItem value="Katolik">Katolik</SelectItem>
                            <SelectItem value="Hindu">Hindu</SelectItem>
                            <SelectItem value="Budha">Budha</SelectItem>
                            <SelectItem value="Khonghucu">Khonghucu</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-700 ml-1">Status Keluarga</Label>
                        <Input
                          value={formData.statusDalamKel}
                          onChange={(e) => setFormData({ ...formData, statusDalamKel: e.target.value })}
                          className="rounded-2xl h-12 border-slate-200 focus:ring-primary font-medium"
                          placeholder="Contoh: Anak Kandung"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-700 ml-1">Anak Ke</Label>
                        <Input
                          value={formData.anakKe}
                          onChange={(e) => setFormData({ ...formData, anakKe: e.target.value })}
                          className="rounded-2xl h-12 border-slate-200 focus:ring-primary font-medium"
                          placeholder="Contoh: 1"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Alamat & Kontak */}
                  {activeStep === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-700 ml-1">Alamat Tinggal Lengkap</Label>
                        <Input
                          value={formData.alamatSiswa}
                          onChange={(e) => setFormData({ ...formData, alamatSiswa: e.target.value })}
                          className="rounded-2xl h-12 border-slate-200 focus:ring-primary font-medium"
                          placeholder="Jalan, RT/RW, Dusun, Desa/Kelurahan, Kecamatan"
                          autoFocus
                        />
                        <p className="text-[10px] text-slate-500 ml-1">Tuliskan alamat selengkap mungkin untuk keperluan surat menyurat.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-slate-700 ml-1 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-primary" /> No Handphone (Whatsapp)
                          </Label>
                          <Input
                            value={formData.teleponSiswa}
                            onChange={(e) => setFormData({ ...formData, teleponSiswa: e.target.value })}
                            className="rounded-2xl h-12 border-slate-200 focus:ring-primary font-medium"
                            placeholder="08xxxxxxxxxx"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-slate-700 ml-1 flex items-center gap-1.5">
                            <Home className="w-3.5 h-3.5 text-primary" /> Asal Sekolah
                          </Label>
                          <Input
                            value={formData.sekolahAsal}
                            onChange={(e) => setFormData({ ...formData, sekolahAsal: e.target.value })}
                            className="rounded-2xl h-12 border-slate-200 focus:ring-primary font-medium"
                            placeholder="Nama SMP/MTs Asal"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Data Orang Tua */}
                  {activeStep === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Ayah */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                            <span className="text-xs font-black text-primary uppercase tracking-wider">Data Ayah</span>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-700 ml-1">Nama Ayah Kandung</Label>
                            <Input
                              value={formData.nmAyah}
                              onChange={(e) => setFormData({ ...formData, nmAyah: e.target.value })}
                              className="rounded-2xl h-12 border-slate-200 focus:ring-primary font-medium"
                              placeholder="Nama Lengkap Ayah"
                              autoFocus
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-700 ml-1">Pekerjaan Ayah</Label>
                            <Input
                              value={formData.pekerjaanAyah}
                              onChange={(e) => setFormData({ ...formData, pekerjaanAyah: e.target.value })}
                              className="rounded-2xl h-12 border-slate-200 focus:ring-primary font-medium"
                              placeholder="Pekerjaan saat ini"
                            />
                          </div>
                        </div>

                        {/* Ibu */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                            <span className="text-xs font-black text-rose-500 uppercase tracking-wider">Data Ibu</span>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-700 ml-1">Nama Ibu Kandung</Label>
                            <Input
                              value={formData.nmIbu}
                              onChange={(e) => setFormData({ ...formData, nmIbu: e.target.value })}
                              className="rounded-2xl h-12 border-slate-200 focus:ring-primary font-medium"
                              placeholder="Nama Lengkap Ibu"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-700 ml-1">Pekerjaan Ibu</Label>
                            <Input
                              value={formData.pekerjaanIbu}
                              onChange={(e) => setFormData({ ...formData, pekerjaanIbu: e.target.value })}
                              className="rounded-2xl h-12 border-slate-200 focus:ring-primary font-medium"
                              placeholder="Pekerjaan saat ini"
                            />
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-slate-100" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-slate-700 ml-1">Alamat Orang Tua</Label>
                          <Input
                            value={formData.alamatOrtu}
                            onChange={(e) => setFormData({ ...formData, alamatOrtu: e.target.value })}
                            className="rounded-2xl h-12 border-slate-200 focus:ring-primary font-medium"
                            placeholder="Alamat lengkap tempat tinggal orang tua"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-slate-700 ml-1 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-primary" /> No WA Orang Tua (Aktif)
                          </Label>
                          <Input
                            value={formData.teleponOrtu}
                            onChange={(e) => setFormData({ ...formData, teleponOrtu: e.target.value })}
                            className="rounded-2xl h-12 border-slate-200 focus:ring-primary font-medium"
                            placeholder="08xxxxxxxxxx"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                </CardContent>

                <CardFooter className="p-8 bg-slate-50 border-t flex items-center justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={prevStep}
                    disabled={activeStep === 1}
                    className="rounded-xl h-12 px-6 font-bold text-slate-500 hover:text-slate-800 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Kembali
                  </Button>

                  {activeStep < 3 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="rounded-2xl h-12 px-8 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/10 active:scale-95 transition-all"
                    >
                      Selanjutnya
                      <ChevronRight className="w-5 h-5 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => handleSubmit()}
                      disabled={isSaving}
                      className="rounded-2xl h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-100 active:scale-95 transition-all w-full sm:w-auto min-w-[200px]"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          Simpan Permanen
                        </>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
