import { useState, useEffect } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { db } from '@/lib/db'
import { jadwalSpmb } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'
import {
  ArrowRight,
  BookOpenCheck,
  Calendar,
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
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog"
import { Badge } from '@/components/ui/badge'

const getJadwalSpmb = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const jadwal = await db
      .select()
      .from(jadwalSpmb)
      .orderBy(asc(jadwalSpmb.startDate))
    console.log('[Homepage] Jadwal data loaded:', jadwal.length, 'items')
    return jadwal
  } catch (error) {
    console.error("Gagal mengambil jadwal:", error)
    return []
  }
})

export const Route = createFileRoute('/')({
  component: LandingPage,
  loader: async () => {
    const jadwal = await getJadwalSpmb()
    return { jadwal }
  },
})
// Gallery items pool (static data)
const galleryItemsPool = [
  { src: '/gallery/1.jpeg' },
  { src: '/gallery/2.jpeg' },
  { src: '/gallery/3.jpeg' },
  { src: '/gallery/4.jpeg' },
  { src: '/gallery/5.jpeg' },
  { src: '/gallery/6.jpeg' },
  { src: '/gallery/7.jpeg' },
  { src: '/gallery/8.jpeg' },
  { src: '/gallery/9.jpeg' },
  { src: '/gallery/10.jpeg' },
]

function LandingPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{ src: string } | null>(null)
  // Initialize with the first 10 items (all) so it's not empty on first (SSR) render
  const [randomGallery, setRandomGallery] = useState(galleryItemsPool)
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

  const { jadwal } = Route.useLoaderData()

  // Memisahkan jadwal berdasarkan tahap (fleksibel: cocokkan 'tahap1', 'Tahap 1', 'tahap 1', dll)
  const matchTahap = (tahap: string | null, num: string) => {
    if (!tahap) return false
    const normalized = tahap.toLowerCase().replace(/\s+/g, '')
    return normalized === `tahap${num}` || normalized === num
  }
  const jadwalTahap1 = jadwal.filter((j: any) => matchTahap(j.tahap, '1'))
  const jadwalTahap2 = jadwal.filter((j: any) => matchTahap(j.tahap, '2'))

  const formatTanggalSPMB = (start: string | Date, end: string | Date) => {
    const startDate = typeof start === 'string' ? new Date(start) : start;
    const endDate = typeof end === 'string' ? new Date(end) : end;

    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    const startDayStr = startDate.toLocaleDateString('id-ID', options);
    const endDayStr = endDate.toLocaleDateString('id-ID', options);

    if (startDayStr === endDayStr) {
      return startDayStr;
    }
    return `${startDayStr} - ${endDayStr}`;
  }

  // Shuffle and pick all 10 items on mount (client-side only)
  useEffect(() => {
    // Fisher-Yates shuffle algorithm
    const shuffled = [...galleryItemsPool]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setRandomGallery(shuffled)
  }, [])


  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
              <GraduationCap className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">SPMB <span className="text-blue-700">SMANSABA</span></span>
          </div>
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#beranda" className="hover:text-blue-700 transition-colors">Beranda</a>
            <a href="#alur" className="hover:text-blue-700 transition-colors">Alur</a>
            <a href="#persyaratan" className="hover:text-blue-700 transition-colors">Persyaratan</a>
            <a href="#jadwal" className="hover:text-blue-700 transition-colors">Jadwal</a>
            <a href="#galeri" className="hover:text-blue-700 transition-colors">Galeri</a>
            <a href="#kontak" className="hover:text-blue-700 transition-colors">Kontak</a>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/pengumuman">
              <Button className="bg-blue-700 hover:bg-blue-800 font-semibold shadow-lg shadow-blue-700/20 px-6">
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
                    <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                      <GraduationCap className="text-white w-5 h-5" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">SPMB <span className="text-blue-700">SMANSABA</span></span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col py-6 px-4 gap-2">
                  <a href="#beranda" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-slate-600 font-medium transition-colors">Beranda</a>
                  <a href="#alur" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-slate-600 font-medium transition-colors">Alur</a>
                  <a href="#persyaratan" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-slate-600 font-medium transition-colors">Persyaratan</a>
                  <a href="#jadwal" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-slate-600 font-medium transition-colors">Jadwal</a>
                  <a href="#galeri" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-slate-600 font-medium transition-colors">Galeri</a>
                  <a href="#kontak" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-slate-600 font-medium transition-colors">Kontak</a>
                </div>
                <div className="mt-auto p-6 border-t bg-slate-50/50 space-y-3">
                  <Link to="/pengumuman" onClick={() => setIsOpen(false)} className="block">
                    <Button className="w-full h-11 bg-blue-700 hover:bg-blue-800 font-semibold shadow-lg shadow-blue-700/20">
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
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-50 -z-10"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-blue-50 rounded-full blur-3xl opacity-40 -z-10"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight">
              <span className="text-blue-700">SPMB</span>
              <br />
              <span className="text-blue-700">Online 2026</span>
            </h1>
            <p className="text-base md:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Sistem Penerimaan Murid Baru <span className="font-bold text-slate-900">SMAN 1 Bantarujeg</span> tahun ajaran 2026/2027.
              <br />
              Daftar secara online dengan <span className="text-blue-700 font-bold">mudah & cepat</span>!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Link to="/login">
                <Button size="lg" className="bg-blue-700 hover:bg-blue-800 h-12 px-6 text-base font-bold shadow-xl shadow-blue-700/30 group">
                  <UserPlus className="mr-2 w-5 h-5" />
                  Daftar Sekarang
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="h-12 px-6 text-base font-bold border-2 hover:bg-slate-50">
                <ClipboardList className="mr-2 w-5 h-5 text-blue-700" />
                Lihat Persyaratan
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
                <div className="text-2xl md:text-3xl font-black text-slate-900">480</div>
                <div className="text-xs md:text-sm text-slate-500 font-medium">Siswa Diterima</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
                <div className="text-2xl md:text-3xl font-black text-slate-900">5</div>
                <div className="text-xs md:text-sm text-slate-500 font-medium">Jalur Pendaftaran</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center shadow-sm">
                <div className="text-2xl md:text-3xl font-black text-blue-700">100%</div>
                <div className="text-xs md:text-sm text-blue-700 font-medium">Digital</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
              <img
                src="/hero.JPG"
                alt="Siswa SMAN 1 BANTARUJEG"
                className="w-full h-auto object-cover aspect-[4/5]"
              />
            </div>
            {/* Decorative elements around image */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-100 rounded-xl -z-10 animate-bounce transition-all duration-1000"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-slate-100 rounded-full -z-10 animate-pulse outline-dashed outline-slate-200 outline-offset-8"></div>
          </div>
        </div>
      </section>

      {/* Alur Pendaftaran Section */}
      <section id="alur" className="py-12 md:py-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-sm font-bold text-blue-700 uppercase tracking-[0.2em]">Langkah Mudah</h2>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900">Alur Pendaftaran Online</h3>
            <p className="text-slate-500 text-lg">Ikuti 6 langkah sederhana untuk menjadi bagian dari SMAN 1 BANTARUJEG.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
            {steps.map((step, index) => (
              <div key={index} className="bg-white p-6 rounded-sm shadow-sm border-l-4 border-blue-600 flex gap-4 items-start group hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-700 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <div className="space-y-1.5 text-left">
                  <div className="inline-block px-2 py-0.5 rounded-sm bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider">
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
            <h3 className="text-2xl md:text-4xl font-black text-blue-700 underline underline-offset-8 decoration-4">
              Persyaratan Pendaftaran
            </h3>
            <p className="text-slate-500 text-base md:text-lg">
              Pilih jalur pendaftaran untuk melihat persyaratan lengkap
            </p>
          </div>

          <Tabs defaultValue="domisili" className="w-full">
            <div className="flex justify-center mb-8 md:mb-12 px-2">
              <TabsList className="bg-transparent h-auto gap-2 md:gap-3 grid grid-cols-2 md:flex md:flex-row justify-center p-0 w-full sm:w-auto">
                {[
                  { id: 'domisili', label: 'Domisili' },
                  { id: 'prestasi', label: 'Prestasi' },
                  { id: 'afirmasi', label: 'Afirmasi' },
                  { id: 'mutasi', label: 'Mutasi' },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="rounded-full px-3 sm:px-5 md:px-7 py-2 md:py-2.5 data-[state=active]:bg-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-700/20 bg-white border border-slate-100 text-slate-500 font-bold hover:border-blue-200 hover:text-blue-700 transition-all text-xs sm:text-sm data-[state=inactive]:hover:-translate-y-0.5 whitespace-nowrap"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Konten Tab yang Dirender Dinamis */}
            {[
              {
                id: 'domisili', title: 'Persyaratan Jalur Domisili', icon: <MapPin className="w-5 h-5 md:w-6 md:h-6" />,
                items: ['Kartu Keluarga (KK)', 'KTP Orang Tua', 'Akta Kelahiran', 'Rapor Semester 1-5 (PDF per semester)']
              },
              {
                id: 'prestasi', title: 'Persyaratan Jalur Prestasi', icon: <GraduationCap className="w-5 h-5 md:w-6 md:h-6" />,
                items: ['Kartu Keluarga (KK)', 'KTP Orang Tua', 'Akta Kelahiran', 'Rapor Semester 1-5 (PDF per semester)', 'Sertifikat Penghargaan (Min. Kabupaten)', 'Piagam Prestasi (Asli & Copy)']
              },
              {
                id: 'afirmasi', title: 'Persyaratan Jalur Afirmasi', icon: <Users className="w-5 h-5 md:w-6 md:h-6" />,
                items: ['Kartu Keluarga (KK)', 'KTP Orang Tua', 'Akta Kelahiran', 'Kartu KIP/KKS/KPS', 'Surat Keterangan Tidak Mampu (SKTM)']
              },
              {
                id: 'mutasi', title: 'Persyaratan Jalur Mutasi', icon: <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />,
                items: ['Kartu Keluarga (KK)', 'KTP Orang Tua', 'Akta Kelahiran', 'Surat Perpindahan Tugas Orang Tua', 'SK Pengangkatan sebagai Guru']
              },
            ].map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="focus-visible:outline-none focus:outline-none">
                <div className="bg-white rounded-[1.5rem] p-5 md:p-8 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden transition-all duration-500 animate-in fade-in zoom-in-95">
                  {/* Decorative Gradient Background */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-transparent rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>

                  <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-700 rounded-[1rem] flex items-center justify-center text-white shadow-lg shadow-blue-700/20 shrink-0 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                      {tab.icon}
                    </div>
                    <h4 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight">{tab.title}</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 md:mb-8">
                    {tab.items.map((item, idx) => (
                      <div key={idx} className="group flex items-center gap-3 p-3 md:p-4 bg-slate-50/80 rounded-[1rem] border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-md hover:shadow-blue-900/5 transition-all duration-300 cursor-default">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-white text-blue-600 flex items-center justify-center shrink-0 shadow-sm border border-slate-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:scale-110 transition-all duration-300">
                          <ClipboardList className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <span className="text-slate-700 font-semibold text-sm group-hover:text-blue-950 transition-colors">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Catatan Alert Box - Tema Biru */}
                  <div className="p-4 md:p-6 bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 rounded-[1rem] flex flex-col sm:flex-row items-start sm:items-center gap-4 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="absolute left-0 bottom-0 w-20 h-20 bg-blue-400 opacity-20 rounded-full blur-xl -translate-x-1/2 translate-y-1/2"></div>

                    <div className="p-2.5 md:p-3 bg-white/10 backdrop-blur-md rounded-xl shrink-0 border border-white/10 shadow-inner">
                      <Upload className="w-5 h-5 md:w-6 md:h-6 text-blue-100" />
                    </div>
                    <div className="relative z-10 w-full">
                      <h6 className="font-bold text-base md:text-lg mb-2 text-white">Format Dokumen Digital</h6>
                      <p className="text-blue-100 text-sm leading-8 md:leading-8 max-w-2xl">
                        Semua persyaratan wajib di-scan jelas dalam format <strong className="text-blue-900 bg-blue-100 px-2 py-1 rounded inline-flex leading-none align-baseline">PDF</strong> dengan ukuran maksimum <strong className="text-blue-900 bg-blue-100 px-2 py-1 rounded inline-flex leading-none align-baseline">1 MB</strong> per file.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Jadwal SPMB Section */}
      <section id="jadwal" className="py-8 md:py-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-16 space-y-4">
            <h3 className="text-2xl md:text-4xl font-black text-blue-700">Jadwal SPMB</h3>
          </div>

          <Tabs defaultValue="tahap1" className="w-full">
            <div className="flex justify-center mb-6 md:mb-12">
              <TabsList className="bg-white border p-1 h-auto gap-1 md:gap-2 rounded-xl flex-wrap">
                <TabsTrigger
                  value="tahap1"
                  className="rounded-lg px-4 md:px-8 py-2 md:py-3 data-[state=active]:bg-blue-700 data-[state=active]:text-white border border-transparent data-[state=active]:border-blue-800 transition-all flex flex-col items-start text-left gap-0.5 md:gap-1"
                >
                  <span className="font-bold text-sm md:text-base">SPMB Tahap 1</span>
                  <span className="text-[9px] md:text-[10px] opacity-80 font-medium hidden sm:block">Proses pendaftaran SPMB SMA, SMK, SLB.</span>
                </TabsTrigger>
                <TabsTrigger
                  value="tahap2"
                  className="rounded-lg px-4 md:px-8 py-2 md:py-3 data-[state=active]:bg-blue-700 data-[state=active]:text-white border border-transparent data-[state=active]:border-blue-800 transition-all flex flex-col items-start text-left gap-0.5 md:gap-1"
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
                  <div className="bg-blue-700 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-xl shadow-blue-700/20">
                    <h4 className="text-center font-bold text-base md:text-lg mb-4 md:mb-6 leading-tight">Jalur & Kuota SMA Tahap 1</h4>
                    <div className="space-y-3">
                      {[
                        { title: 'Domisili', quota: '35%' },
                        { title: 'Afirmasi', quota: '30%' },
                        { title: 'Mutasi', quota: '5%' },
                      ].map((item, i) => (
                        <div key={i} className="flex gap-2 text-sm italic">
                          <div className="flex-1 bg-white text-blue-700 font-bold px-4 py-2.5 rounded-sm">
                            {item.title}
                          </div>
                          <div className="w-20 bg-white text-blue-700 font-bold px-3 py-2.5 rounded-sm text-right">
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
                    <div className="absolute left-[0.9rem] md:left-[1.2rem] top-8 md:top-10 bottom-8 w-0.5 bg-blue-600/30"></div>

                    {jadwalTahap1.map((step: any, i: number) => (
                      <div key={i} className="flex gap-3 md:gap-6 relative group">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-700 text-white rounded-full flex items-center justify-center font-bold text-sm md:text-base relative z-10 shrink-0 shadow-lg shadow-blue-700/30 group-hover:scale-110 transition-transform">
                          {i + 1}
                        </div>
                        <div className="space-y-1 md:space-y-2">
                          <h5 className="font-bold text-slate-900 text-sm md:text-lg leading-snug">
                            {step.title}
                          </h5>
                          <div className="space-y-0.5 md:space-y-1">
                            <div className="flex items-center gap-1.5 md:gap-2 text-slate-500 text-xs md:text-sm font-medium">
                              <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              {formatTanggalSPMB(step.startDate, step.endDate)}
                            </div>
                            {step.timeDetails && (
                              <div className="flex items-center gap-1.5 md:gap-2 text-slate-500 text-xs md:text-sm font-medium">
                                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                {step.timeDetails}
                              </div>
                            )}
                          </div>
                          <div className="pt-0.5 md:pt-1">
                            <Badge className={`font-semibold px-1.5 md:px-2.5 py-0 md:py-0.5 text-[10px] md:text-xs rounded-sm ${step.status === 'Aktif' ? 'bg-emerald-600 hover:bg-emerald-700' : step.status === 'Akan Datang' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-700 hover:bg-blue-800'}`}>
                              {step.status || 'Selesai'}
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
                  <div className="bg-blue-700 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-xl shadow-blue-700/20">
                    <h4 className="text-center font-bold text-base md:text-lg mb-4 md:mb-6 leading-tight">Jalur & Kuota SMA Tahap 2</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <div className="bg-white text-blue-700 font-bold px-4 py-3 rounded-sm text-sm flex items-center justify-center text-center leading-tight">
                          Prestasi Nilai Rapor
                        </div>
                        <div className="bg-white text-blue-700 font-bold px-4 py-3 rounded-sm text-sm flex items-center justify-center text-center leading-tight">
                          Kejuaraan Akademik
                        </div>
                        <div className="bg-white text-blue-700 font-bold px-4 py-3 rounded-sm text-sm flex items-center justify-center text-center leading-tight">
                          Kejuaraan Non-Akademik
                        </div>
                        <div className="bg-white text-blue-700 font-bold px-4 py-3 rounded-sm text-sm flex items-center justify-center text-center leading-tight">
                          Prestasi Kepemimpinan (OSIS, dll)
                        </div>
                      </div>
                      <div className="bg-white text-blue-700 font-bold px-4 py-4 rounded-sm flex flex-col items-center justify-center text-center gap-1">
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
                    <div className="absolute left-[0.9rem] md:left-[1.2rem] top-8 md:top-10 bottom-8 w-0.5 bg-blue-600/30"></div>

                    {jadwalTahap2.map((step: any, i: number) => (
                      <div key={i} className="flex gap-3 md:gap-6 relative group">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-700 text-white rounded-full flex items-center justify-center font-bold text-sm md:text-base relative z-10 shrink-0 shadow-lg shadow-blue-700/30 group-hover:scale-110 transition-transform">
                          {i + 1}
                        </div>
                        <div className="space-y-1 md:space-y-2">
                          <h5 className="font-bold text-slate-900 text-sm md:text-lg leading-snug">{step.title}</h5>
                          <div className="space-y-0.5 md:space-y-1">
                            <div className="flex items-center gap-1.5 md:gap-2 text-slate-500 text-xs md:text-sm font-medium">
                              <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              {formatTanggalSPMB(step.startDate, step.endDate)}
                            </div>
                            {step.timeDetails && (
                              <div className="flex items-center gap-1.5 md:gap-2 text-slate-500 text-xs md:text-sm font-medium">
                                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                {step.timeDetails}
                              </div>
                            )}
                          </div>
                          <div className="pt-0.5 md:pt-1">
                            <Badge className={`font-semibold px-1.5 md:px-2.5 py-0 md:py-0.5 text-[10px] md:text-xs rounded-sm ${step.status === 'Aktif' ? 'bg-emerald-600 hover:bg-emerald-700' : step.status === 'Akan Datang' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-700 hover:bg-blue-800'}`}>
                              {step.status || 'Selesai'}
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

      {/* Galeri Section */}
      <section id="galeri" className="py-12 md:py-20 px-4 md:px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16 space-y-4">
            <h2 className="text-sm font-bold text-blue-700 uppercase tracking-[0.2em]">Dokumentasi</h2>
            <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Galeri Kegiatan</h3>
            <p className="text-slate-500 text-lg">Momen-momen inspiratif dan kegiatan seru siswa/siswi SMAN 1 Bantarujeg.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {randomGallery.map((item, index) => (
              <div 
                key={index} 
                className="group relative overflow-hidden rounded-xl aspect-square bg-slate-200 cursor-zoom-in"
                onClick={() => setSelectedImage(item)}
              >
                <img src={item.src} alt={`Galeri ${index + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-300">
                     <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Lightbox Dialog */}
          <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
            <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center">
              <DialogHeader>
                <DialogTitle className="sr-only">Preview Foto</DialogTitle>
              </DialogHeader>
              {selectedImage && (
                <div className="relative w-full h-full flex items-center justify-center animate-in fade-in zoom-in duration-300">
                  <img 
                    src={selectedImage.src} 
                    alt="Galeri Full" 
                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border-4 border-white/10"
                  />
                </div>
              )}
            </DialogContent>
          </Dialog>


        </div>
      </section>

      {/* Footer */}
      <footer id="kontak" className="pt-24 pb-12 px-6 bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                <GraduationCap className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">SPMB <span className="text-blue-600">SMANSABA</span></span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Sistem Penerimaan Murid Baru (SPMB) online SMA Negeri 1 Bantarujeg. Sekolah Unggul, Berkarakter, dan Berdaya Saing Global.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-700 hover:text-white transition-all"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-700 hover:text-white transition-all"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-700 hover:text-white transition-all"><Twitter className="w-5 h-5" /></a>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-white font-bold text-lg uppercase tracking-wider">Navigasi</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#beranda" className="hover:text-blue-600 transition-colors">Beranda</a></li>
              <li><a href="#alur" className="hover:text-blue-600 transition-colors">Alur</a></li>
              <li><a href="#persyaratan" className="hover:text-blue-600 transition-colors">Persyaratan</a></li>
              <li><a href="#jadwal" className="hover:text-blue-600 transition-colors">Jadwal</a></li>
              <li><a href="#galeri" className="hover:text-blue-600 transition-colors">Galeri</a></li>
              <li><a href="/login" className="hover:text-blue-600 transition-colors">Masuk Akun</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-white font-bold text-lg uppercase tracking-wider">Kontak Kami</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Jl. Siliwangi No.119, Bantarujeg, Majalengka, Jawa Barat</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-600 shrink-0" />
                <span>(0233) 281000</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600 shrink-0" />
                <span>info@sman1bantarujeg.sch.id</span>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-white font-bold text-lg uppercase tracking-wider">Jam Layanan</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <p className="font-semibold text-white">Senin - Jumat</p>
                  <p className="text-slate-400">08:00 - 15:00 WIB</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 shrink-0" />
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
            <a href="#" className="hover:text-blue-600 transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Syarat & Ketentuan</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
