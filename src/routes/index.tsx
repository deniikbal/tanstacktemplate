import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  Facebook,
  GraduationCap,
  Instagram,
  Mail,
  MapPin,
  Megaphone,
  Menu,
  Phone,
  ShieldCheck,
  Sparkles,
  Twitter,
  Upload,
  UserPlus,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/')({ component: LandingPage })

function LandingPage() {
  const [isOpen, setIsOpen] = useState(false)
  const steps = [
    {
      id: '1',
      title: 'Login Akun',
      description: 'Silahkan Login dengan akun yang sudah diberikan dari SMP / MTs',
      icon: <UserPlus className="w-6 h-6 text-white" />
    },
    {
      id: '2',
      title: 'Pengisian Formulir',
      description: 'Lengkapi formulir pendaftaran dengan data yang valid',
      icon: <ClipboardList className="w-6 h-6 text-white" />
    },
    {
      id: '3',
      title: 'Unggah Dokumen',
      description: 'Unggah semua dokumen persyaratan dalam format PDF/JPG (max 1MB).',
      icon: <Upload className="w-6 h-6 text-white" />
    },
    {
      id: '4',
      title: 'Verifikasi',
      description: 'Tim SPMB akan memverifikasi data dan dokumen yang telah diupload.',
      icon: <ShieldCheck className="w-6 h-6 text-white" />
    },
    {
      id: '5',
      title: 'Tes Seleksi',
      description: 'Khusus jalur Prestasi ikuti tes seleksi sesuai jadwal yang ditentukan',
      icon: <BookOpenCheck className="w-6 h-6 text-white" />
    },
    {
      id: '6',
      title: 'Pengumuman',
      description: 'Cek hasil seleksi pada halaman pengumuman dengan memasukkan NISN.',
      icon: <Megaphone className="w-6 h-6 text-white" />
    }
  ]

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">SPMB <span className="text-emerald-600">SMANSABA</span></span>
          </div>
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#beranda" className="hover:text-emerald-600 transition-colors">Beranda</a>
            <a href="#alur" className="hover:text-emerald-600 transition-colors">Alur</a>
            <a href="#persyaratan" className="hover:text-emerald-600 transition-colors">Persyaratan</a>
            <a href="#jadwal" className="hover:text-emerald-600 transition-colors">Jadwal</a>
            <a href="#kontak" className="hover:text-emerald-600 transition-colors">Kontak</a>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-slate-600 font-semibold">Masuk</Button>
            </Link>
            <Link to="/pengumuman">
              <Button className="bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-lg shadow-emerald-600/20 px-6">
                Pengumuman
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-600">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
                <SheetHeader className="p-6 border-b text-left">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                      <GraduationCap className="text-white w-5 h-5" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">SPMB <span className="text-emerald-600">SMANSABA</span></span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col py-6 px-4 gap-2">
                  <a href="#beranda" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-slate-600 font-medium transition-colors">Beranda</a>
                  <a href="#alur" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-slate-600 font-medium transition-colors">Alur</a>
                  <a href="#persyaratan" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-slate-600 font-medium transition-colors">Persyaratan</a>
                  <a href="#jadwal" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-slate-600 font-medium transition-colors">Jadwal</a>
                  <a href="#kontak" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-slate-600 font-medium transition-colors">Kontak</a>
                </div>
                <div className="mt-auto p-6 border-t bg-slate-50/50 space-y-3">
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block">
                    <Button variant="outline" className="w-full h-11 border-slate-200 text-slate-600 font-semibold">Masuk</Button>
                  </Link>
                  <Link to="/pengumuman" onClick={() => setIsOpen(false)} className="block">
                    <Button className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-lg shadow-emerald-600/20">
                      Pengumuman
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="beranda" className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-emerald-50 rounded-full blur-3xl opacity-50 -z-10"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-blue-50 rounded-full blur-3xl opacity-40 -z-10"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight">
              <span className="text-emerald-600">SPMB</span>
              <br />
              <span className="text-emerald-600">Online 2026</span>
            </h1>
            <p className="text-base md:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Sistem Penerimaan Murid Baru <span className="font-bold text-slate-900">SMAN 1 Bantarujeg</span> tahun ajaran 2026/2027.
              <br />
              Daftar secara online dengan <span className="text-emerald-600 font-bold">mudah & cepat</span>!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Link to="/login">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 h-12 px-6 text-base font-bold shadow-xl shadow-emerald-500/30 group">
                  <UserPlus className="mr-2 w-5 h-5" />
                  Daftar Sekarang
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="h-12 px-6 text-base font-bold border-2 hover:bg-slate-50">
                <ClipboardList className="mr-2 w-5 h-5 text-emerald-600" />
                Lihat Persyaratan
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
                <div className="text-2xl md:text-3xl font-black text-slate-900">500+</div>
                <div className="text-xs md:text-sm text-slate-500 font-medium">Siswa Diterima</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
                <div className="text-2xl md:text-3xl font-black text-slate-900">4</div>
                <div className="text-xs md:text-sm text-slate-500 font-medium">Jalur Pendaftaran</div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center shadow-sm">
                <div className="text-2xl md:text-3xl font-black text-emerald-600">100%</div>
                <div className="text-xs md:text-sm text-emerald-600 font-medium">Digital</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
              <img
                src="/student_hero.png"
                alt="Siswa SMAN 1 BANTARUJEG"
                className="w-full h-auto object-cover aspect-[4/5]"
              />
            </div>
            {/* Decorative elements around image */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-100 rounded-xl -z-10 animate-bounce transition-all duration-1000"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-slate-100 rounded-full -z-10 animate-pulse outline-dashed outline-slate-200 outline-offset-8"></div>
          </div>
        </div>
      </section>

      {/* Alur Pendaftaran Section */}
      <section id="alur" className="py-12 md:py-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-[0.2em]">Langkah Mudah</h2>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900">Alur Pendaftaran Online</h3>
            <p className="text-slate-500 text-lg">Ikuti 6 langkah sederhana untuk menjadi bagian dari SMAN 1 BANTARUJEG.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
            {steps.map((step, index) => (
              <div key={index} className="bg-white p-6 rounded-sm shadow-sm border-l-4 border-emerald-500 flex gap-4 items-start group hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <div className="space-y-1.5 text-left">
                  <div className="inline-block px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                    Langkah {step.id}
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 leading-tight">
                    {step.title}
                  </h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Persyaratan Pendaftaran Section */}
      <section id="persyaratan" className="py-8 md:py-16 px-4 md:px-6 bg-slate-50/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12 space-y-4">
            <h3 className="text-2xl md:text-4xl font-black text-emerald-600 underline underline-offset-8 decoration-4">
              Persyaratan Pendaftaran
            </h3>
            <p className="text-slate-500 text-base md:text-lg">
              Pilih jalur pendaftaran untuk melihat persyaratan lengkap
            </p>
          </div>

          <Tabs defaultValue="domisili" className="w-full">
            <div className="flex justify-center mb-6 md:mb-10">
              <TabsList className="bg-white border p-1 h-auto rounded-lg grid grid-cols-2 md:flex md:flex-row gap-1">
                <TabsTrigger
                  value="domisili"
                  className="rounded-md px-3 md:px-6 py-2 md:py-2.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-semibold text-xs md:text-base"
                >
                  Domisili
                </TabsTrigger>
                <TabsTrigger
                  value="prestasi"
                  className="rounded-md px-3 md:px-6 py-2 md:py-2.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-semibold text-xs md:text-base"
                >
                  Prestasi
                </TabsTrigger>
                <TabsTrigger
                  value="afirmasi"
                  className="rounded-md px-3 md:px-6 py-2 md:py-2.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-semibold text-xs md:text-base"
                >
                  Afirmasi
                </TabsTrigger>
                <TabsTrigger
                  value="mutasi"
                  className="rounded-md px-3 md:px-6 py-2 md:py-2.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-semibold text-xs md:text-base"
                >
                  Mutasi
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="domisili">
              <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h4 className="text-lg md:text-xl font-bold text-slate-900">Persyaratan Jalur Domisili</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <ClipboardList className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-slate-700 font-medium text-sm md:text-base">Kartu Keluarga (KK)</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <ClipboardList className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-slate-700 font-medium text-sm md:text-base">KTP Orang Tua</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <ClipboardList className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-slate-700 font-medium text-sm md:text-base">Akta Kelahiran</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <ClipboardList className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-slate-700 font-medium text-sm md:text-base">Rapor Semester 1-5 (File PDF per semester)</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                  <p className="text-amber-800 text-sm md:text-base">
                    <span className="font-bold">Catatan:</span><br />
                    Semua dokumen harus discan dalam format PDF dengan ukuran maksimal 1 MB per file.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="prestasi">
              <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h4 className="text-lg md:text-xl font-bold text-slate-900">Persyaratan Jalur Prestasi</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <ClipboardList className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-slate-700 font-medium text-sm md:text-base">Kartu Keluarga (KK)</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <ClipboardList className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-slate-700 font-medium text-sm md:text-base">KTP Orang Tua</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <ClipboardList className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-slate-700 font-medium text-sm md:text-base">Akta Kelahiran</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <ClipboardList className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-slate-700 font-medium text-sm md:text-base">Rapor Semester 1-5 (File PDF per semester)</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <ClipboardList className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-slate-700 font-medium text-sm md:text-base">Sertifikat Penghargaan (Minimal Kabupaten)</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <ClipboardList className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-slate-700 font-medium text-sm md:text-base">Piagam/Sertifikat Prestasi (Asli dan Copy)</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                  <p className="text-amber-800 text-sm md:text-base">
                    <span className="font-bold">Catatan:</span><br />
                    Semua dokumen harus discan dalam format PDF dengan ukuran maksimal 1 MB per file.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="afirmasi">
              <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h4 className="text-lg md:text-xl font-bold text-slate-900">Persyaratan Jalur Afirmasi</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <ClipboardList className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-slate-700 font-medium text-sm md:text-base">Kartu Keluarga (KK)</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <ClipboardList className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-slate-700 font-medium text-sm md:text-base">KTP Orang Tua</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <ClipboardList className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-slate-700 font-medium text-sm md:text-base">Akta Kelahiran</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <ClipboardList className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-slate-700 font-medium text-sm md:text-base">Kartu KIP/KKS/KPS</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <ClipboardList className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-slate-700 font-medium text-sm md:text-base">Surat Keterangan Tidak Mampu (SKTM)</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                  <p className="text-amber-800 text-sm md:text-base">
                    <span className="font-bold">Catatan:</span><br />
                    Semua dokumen harus discan dalam format PDF dengan ukuran maksimal 1 MB per file.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="mutasi">
              <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h4 className="text-lg md:text-xl font-bold text-slate-900">Persyaratan Jalur Mutasi</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <ClipboardList className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-slate-700 font-medium text-sm md:text-base">Kartu Keluarga (KK)</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <ClipboardList className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-slate-700 font-medium text-sm md:text-base">KTP Orang Tua</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <ClipboardList className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-slate-700 font-medium text-sm md:text-base">Akta Kelahiran</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <ClipboardList className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-slate-700 font-medium text-sm md:text-base">Surat Perpindahan Tugas Orang Tua</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <ClipboardList className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-slate-700 font-medium text-sm md:text-base">SK Pengangkatan sebagai Guru</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                  <p className="text-amber-800 text-sm md:text-base">
                    <span className="font-bold">Catatan:</span><br />
                    Semua dokumen harus discan dalam format PDF dengan ukuran maksimal 1 MB per file.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Jadwal SPMB Section */}
      <section id="jadwal" className="py-8 md:py-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-16 space-y-4">
            <h3 className="text-2xl md:text-4xl font-black text-emerald-600">Jadwal SPMB</h3>
          </div>

          <Tabs defaultValue="tahap1" className="w-full">
            <div className="flex justify-center mb-6 md:mb-12">
              <TabsList className="bg-white border p-1 h-auto gap-1 md:gap-2 rounded-xl flex-wrap">
                <TabsTrigger
                  value="tahap1"
                  className="rounded-lg px-4 md:px-8 py-2 md:py-3 data-[state=active]:bg-emerald-600 data-[state=active]:text-white border border-transparent data-[state=active]:border-emerald-700 transition-all flex flex-col items-start text-left gap-0.5 md:gap-1"
                >
                  <span className="font-bold text-sm md:text-base">SPMB Tahap 1</span>
                  <span className="text-[9px] md:text-[10px] opacity-80 font-medium hidden sm:block">Proses pendaftaran SPMB SMA, SMK, SLB.</span>
                </TabsTrigger>
                <TabsTrigger
                  value="tahap2"
                  className="rounded-lg px-4 md:px-8 py-2 md:py-3 data-[state=active]:bg-emerald-600 data-[state=active]:text-white border border-transparent data-[state=active]:border-emerald-700 transition-all flex flex-col items-start text-left gap-0.5 md:gap-1"
                >
                  <span className="font-bold text-sm md:text-base">SPMB Tahap 2</span>
                  <span className="text-[9px] md:text-[10px] opacity-80 font-medium hidden sm:block">Proses pendaftaran SPMB SMA, SMK, SLB.</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="tahap1">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8 items-start">
                {/* Information Column (Left) */}
                <div className="lg:col-span-4 space-y-4 md:space-y-8">
                  {/* SMA Quota Card */}
                  <div className="bg-emerald-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-xl shadow-emerald-500/20">
                    <h4 className="text-center font-bold text-base md:text-lg mb-4 md:mb-6 leading-tight">Jalur & Kuota SMA Tahap 1</h4>
                    <div className="space-y-3">
                      {[
                        { title: 'Domisili', quota: '35%' },
                        { title: 'Afirmasi', quota: '30%' },
                        { title: 'Mutasi', quota: '5%' },
                      ].map((item, i) => (
                        <div key={i} className="flex gap-2 text-sm italic">
                          <div className="flex-1 bg-white text-emerald-600 font-bold px-4 py-2.5 rounded-sm">
                            {item.title}
                          </div>
                          <div className="w-20 bg-white text-emerald-600 font-bold px-3 py-2.5 rounded-sm text-right">
                            {item.quota}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Timeline Column (Right) */}
                <div className="lg:col-span-8 bg-white rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-10 border border-slate-100 shadow-sm relative">
                  <div className="text-right font-bold text-slate-900 text-base md:text-lg mb-4 md:mb-8">
                    Jadwal SPMB Tahap 1
                  </div>

                  <div className="space-y-4 md:space-y-6 relative">
                    {/* Vertical line connector */}
                    <div className="absolute left-[0.9rem] md:left-[1.2rem] top-8 md:top-10 bottom-8 w-0.5 bg-emerald-500/30"></div>

                    {[
                      {
                        id: 1,
                        title: 'Pendaftaran & Verifikasi Dokumen SPMB tahap 1',
                        date: '10 Juni 2025 – 16 Juni 2025',
                        time: '08:00 - 20:00'
                      },
                      {
                        id: 2,
                        title: 'Masa Sanggah Verifikasi',
                        date: '10 Juni 2025 – 17 Juni 2025',
                      },
                      {
                        id: 3,
                        title: 'Rapat Dewan Guru penetapan hasil seleksi SPMB tahap 1',
                        date: '18 Juni 2025 – 18 Juni 2025',
                      },
                      {
                        id: 4,
                        title: 'Koordinasi Satuan Pendidikan dengan Cabang Dinas',
                        date: '18 Juni 2025 – 18 Juni 2025',
                      },
                      {
                        id: 5,
                        title: 'Rapat Koordinasi Penyaluran KETM yang tidak lolos seleksi',
                        date: '18 Juni 2025 – 18 Juni 2025',
                      },
                      {
                        id: 6,
                        title: 'Pengumuman hasil SPMB tahap 1',
                        date: '19 Juni 2025 – 19 Juni 2025',
                        time: '09:00 - Selesai'
                      },
                      {
                        id: 7,
                        title: 'Daftar Ulang SPMB Tahap 1',
                        date: '20 Juni 2025 – 23 Juni 2025',
                        time: '08:00 - 14:00'
                      },
                    ].map((step, i) => (
                      <div key={i} className="flex gap-3 md:gap-6 relative group">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm md:text-base relative z-10 shrink-0 shadow-lg shadow-emerald-600/30 group-hover:scale-110 transition-transform">
                          {step.id}
                        </div>
                        <div className="space-y-1 md:space-y-2">
                          <h5 className="font-bold text-slate-900 text-sm md:text-lg leading-snug">
                            {step.title}
                          </h5>
                          <div className="space-y-0.5 md:space-y-1">
                            <div className="flex items-center gap-1.5 md:gap-2 text-slate-500 text-xs md:text-sm font-medium">
                              <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              {step.date}
                            </div>
                            {step.time && (
                              <div className="flex items-center gap-1.5 md:gap-2 text-slate-500 text-xs md:text-sm font-medium">
                                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                {step.time}
                              </div>
                            )}
                          </div>
                          <div className="pt-0.5 md:pt-1">
                            <Badge className="bg-emerald-600 hover:bg-emerald-700 font-bold px-2 md:px-4 py-0.5 md:py-1 text-xs md:text-sm tracking-wide rounded-sm">
                              Selesai
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tahap2">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8 items-start">
                {/* Information Column (Left) */}
                <div className="lg:col-span-4 space-y-4 md:space-y-8">
                  {/* SMA Quota Card Tahap 2 */}
                  <div className="bg-emerald-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-xl shadow-emerald-600/20">
                    <h4 className="text-center font-bold text-base md:text-lg mb-4 md:mb-6 leading-tight">Jalur & Kuota SMA Tahap 2</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <div className="bg-white text-emerald-600 font-bold px-4 py-4 rounded-sm text-sm h-[70px] flex items-center justify-center text-center leading-tight">
                          Prestasi Akademik
                        </div>
                        <div className="bg-white text-emerald-600 font-bold px-4 py-4 rounded-sm text-sm h-[70px] flex items-center justify-center text-center leading-tight">
                          Prestasi Non-Akademik
                        </div>
                      </div>
                      <div className="bg-white text-emerald-600 font-bold px-4 py-4 rounded-sm flex flex-col items-center justify-center text-center gap-1">
                        <span className="text-2xl">30%</span>
                        <span className="text-[10px] leading-tight font-medium">ditetapkan satuan pendidikan</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline Column (Right) */}
                <div className="lg:col-span-8 bg-white rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-10 border border-slate-100 shadow-sm relative">
                  <div className="text-right font-bold text-slate-900 text-base md:text-lg mb-4 md:mb-8">
                    Jadwal SPMB Tahap 2
                  </div>

                  <div className="space-y-4 md:space-y-6 relative">
                    {/* Vertical line connector */}
                    <div className="absolute left-[0.9rem] md:left-[1.2rem] top-8 md:top-10 bottom-8 w-0.5 bg-emerald-500/30"></div>

                    {[
                      {
                        id: 1,
                        title: 'Pendaftaran & Verifikasi Dokumen SPMB tahap 2',
                        date: '24 Juni 2025 – 01 Juli 2025',
                        time: '08:00 - 20:00',
                      },
                      {
                        id: 2,
                        title: 'Masa Sanggah Verifikasi',
                        date: '24 Juni 2025 – 02 Juli 2025',
                      },
                      {
                        id: 3,
                        title: 'Persiapan pelaksanaan Tes Terstandar',
                        date: '02 Juli 2025 – 02 Juli 2025',
                      },
                      {
                        id: 4,
                        title: 'Pelaksanaan Tes Terstandar',
                        date: '03 Juli 2025 – 04 Juli 2025',
                      },
                      {
                        id: 5,
                        title: 'Susulan Tes Terstandar',
                        date: '07 Juli 2025 – 07 Juli 2025',
                      },
                      {
                        id: 6,
                        title: 'Uji kompetensi prestasi non akademik',
                        date: '02 Juli 2025 – 07 Juli 2025',
                      },
                      {
                        id: 7,
                        title: 'Rapat Dewan Guru penetapan hasil seleksi SPMB tahap 2',
                        date: '08 Juli 2025 – 08 Juli 2025',
                      },
                      {
                        id: 8,
                        title: 'Pengumuman Hasil SPMB tahap 2',
                        date: '09 Juli 2025 – 10 Juli 2025',
                      },
                      {
                        id: 9,
                        title: 'Daftar Ulang SPMB Tahap 2',
                        date: '10 Juli 2025 – 11 Juli 2025',
                      },
                    ].map((step, i) => (
                      <div key={i} className="flex gap-3 md:gap-6 relative group">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm md:text-base relative z-10 shrink-0 shadow-lg shadow-emerald-600/30 group-hover:scale-110 transition-transform">
                          {step.id}
                        </div>
                        <div className="space-y-1 md:space-y-2">
                          <h5 className="font-bold text-slate-900 text-sm md:text-lg leading-snug">{step.title}</h5>
                          <div className="space-y-0.5 md:space-y-1">
                            <div className="flex items-center gap-1.5 md:gap-2 text-slate-500 text-xs md:text-sm font-medium">
                              <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              {step.date}
                            </div>
                            {step.time && (
                              <div className="flex items-center gap-1.5 md:gap-2 text-slate-500 text-xs md:text-sm font-medium">
                                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                {step.time}
                              </div>
                            )}
                          </div>
                          <div className="pt-0.5 md:pt-1">
                            <Badge className="bg-emerald-600 hover:bg-emerald-700 font-bold px-2 md:px-4 py-0.5 md:py-1 text-xs md:text-sm tracking-wide rounded-sm">
                              Selesai
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Footer */}
      <footer id="kontak" className="pt-24 pb-12 px-6 bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">SPMB <span className="text-emerald-500">SMANSABA</span></span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Sistem Penerimaan Murid Baru (SPMB) online SMA Negeri 1 Bantarujeg. Sekolah Unggul, Berkarakter, dan Berdaya Saing Global.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"><Twitter className="w-5 h-5" /></a>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-white font-bold text-lg uppercase tracking-wider">Navigasi</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#beranda" className="hover:text-emerald-500 transition-colors">Beranda</a></li>
              <li><a href="#alur" className="hover:text-emerald-500 transition-colors">Alur</a></li>
              <li><a href="#persyaratan" className="hover:text-emerald-500 transition-colors">Persyaratan</a></li>
              <li><a href="#jadwal" className="hover:text-emerald-500 transition-colors">Jadwal</a></li>
              <li><a href="/login" className="hover:text-emerald-500 transition-colors">Masuk Akun</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-white font-bold text-lg uppercase tracking-wider">Kontak Kami</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Jl. Siliwangi No.1, Bantarujeg, Majalengka, Jawa Barat</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>(0233) 281000</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>info@sman1bantarujeg.sch.id</span>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-white font-bold text-lg uppercase tracking-wider">Jam Layanan</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="font-semibold text-white">Senin - Jumat</p>
                  <p className="text-slate-400">08:00 - 15:00 WIB</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="font-semibold text-white">Sabtu</p>
                  <p className="text-slate-400">08:00 - 12:00 WIB</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2026 SMAN 1 BANTARUJEG. All rights reserved.</p>
          <div className="flex gap-6 uppercase tracking-widest font-bold">
            <a href="#" className="hover:text-emerald-500 transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Syarat & Ketentuan</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
