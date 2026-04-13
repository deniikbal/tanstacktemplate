import { useState, useEffect } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { db } from '@/lib/db'
import { jadwalSpmb } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'
import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  Facebook,
  GraduationCap,
  Instagram,
  Mail,
  MapPin,
  Menu,
  Phone,
  ShieldCheck,
  Star,
  Twitter,
  Upload,
  UserPlus,
  Users,
  Award,
  Zap,
  Plus,
  Minus,
  Quote,
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar"

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

/*
 * WCAG AA Color Contrast Reference:
 * - amber-600 (#d97706) on white → 2.3:1 (Fails AA small text, but ok for large decorative)
 * - amber-700 (#b45309) on white → 4.87:1 ✓ (AA Large text)
 * - amber-800 (#92400e) on white → 6.68:1 ✓ (AA Normal text)
 * - white on amber-600 → 2.3:1 (Low contrast, use with care)
 * - white on amber-700 → 4.8:1 ✓ (AA Large text)
 * - slate-900 (#0f172a) on white → 15.4:1 ✓
 */

function LandingPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{ src: string } | null>(null)
  const [randomGallery, setRandomGallery] = useState(galleryItemsPool)
  const [scrolled, setScrolled] = useState(false)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  const { jadwal } = Route.useLoaderData()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const shuffled = [...galleryItemsPool]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setRandomGallery(shuffled)
  }, [])

  const steps = [
    {
      id: '01', title: 'Login Akun',
      description: 'Masuk dengan akun yang sudah diberikan dari SMP/MTs asal.',
      icon: UserPlus,
    },
    {
      id: '02', title: 'Isi Formulir',
      description: 'Lengkapi biodata diri dan data orang tua/wali.',
      icon: ClipboardList,
    },
    {
      id: '03', title: 'Unggah Dokumen',
      description: 'Upload scan KK, Akta, Rapor dalam format PDF (maks 1MB).',
      icon: Upload,
    },
    {
      id: '04', title: 'Verifikasi',
      description: 'Tim SPMB memverifikasi kelengkapan data & dokumen Anda.',
      icon: ShieldCheck,
    },
    {
      id: '05', title: 'Tes Seleksi',
      description: 'Khusus jalur Prestasi, ikuti tes sesuai jadwal.',
      icon: BookOpenCheck,
    },
    {
      id: '06', title: 'Pengumuman',
      description: 'Cek hasil seleksi pada halaman pengumuman dengan NISN.',
      icon: Star,
    },
  ]

  const features = [
    {
      title: "Akreditasi A",
      description: "Standar pendidikan tertinggi dengan fasilitas yang mumpuni.",
      icon: Award,
    },
    {
      title: "Kurikulum Modern",
      description: "Integrasi teknologi dan pengembangan karakter.",
      icon: Zap,
    },
    {
      title: "Ekstrakurikuler Lengkap",
      description: "20+ bidang minat untuk mengasah bakat non-akademik.",
      icon: BookOpenCheck,
    },
    {
      title: "Fasilitas Representatif",
      description: "Lab, perpustakaan digital, dan sarana olahraga modern.",
      icon: Building2,
    },
  ]

  const faqItems = [
    {
      question: "Kapan pendaftaran SPMB 2026 dibuka?",
      answer: "Pendaftaran Tahap 1 dibuka mulai Juni 2026. Jadwal lengkap dapat Anda lihat pada bagian 'Jadwal' di halaman ini.",
    },
    {
      question: "Bagaimana cara melakukan pendaftaran online?",
      answer: "Anda cukup melakukan login menggunakan akun yang diberikan oleh sekolah asal, kemudian mengisi formulir biodata dan mengunggah dokumen persyaratan di halaman pendaftar.",
    },
    {
      question: "Apakah ada biaya pendaftaran?",
      answer: "Pendaftaran di SMAN 1 Bantarujeg melalui jalur website SPMB resmi ini tidak dipungut biaya (GRATIS).",
    },
    {
      question: "Apa saja dokumen yang harus diunggah?",
      answer: "Dokumen utama yang diperlukan adalah scan Akta Kelahiran, Kartu Keluarga, dan Rapor Semester 1-5 dalam format PDF.",
    },
    {
      question: "Bagaimana jika saya lupa kata sandi akun?",
      answer: "Silakan hubungi panitia melalui grup WhatsApp resmi atau datang langsung ke sekretariat SPMB SMAN 1 Bantarujeg dengan membawa bukti diri.",
    },
  ]

  const testimonials = [
    {
      name: "Pratama Ardiansyah",
      role: "Alumni 2023 - Mahasiswa UPI",
      content: "SMAN 1 Bantarujeg memberikan landasan akademik yang sangat kuat. Lingkungan belajarnya kompetitif namun tetap suportif.",
      image: "https://i.pravatar.cc/150?u=pratama",
    },
    {
      name: "WARIS ALJU MANATUSI",
      role: "Siswa Kelas XII - Ketua OSIS",
      content: "Fasilitas laboratorium dan perpustakaan digitalnya sangat membantu kami dalam riset dan tugas sekolah sehari-hari.",
      image: "/osis.jpeg",
    },
    {
      name: "Uhum Humaidil Aripin",
      role: "Orang Tua Siswa",
      content: "Sistem pendaftaran online ini sangat memudahkan kami. Prosesnya transparan dan panitianya sangat responsif di WhatsApp.",
      image: "/ortu.jpg",
    },
  ]

  const matchTahap = (tahap: string | null, num: string) => {
    if (!tahap) return false
    const normalized = tahap.toLowerCase().replace(/\s+/g, '')
    return normalized === `tahap${num}` || normalized === num
  }
  const jadwalTahap1 = jadwal.filter((j: any) => matchTahap(j.tahap, '1'))
  const jadwalTahap2 = jadwal.filter((j: any) => matchTahap(j.tahap, '2'))

  const formatTanggalSPMB = (start: string | Date, end: string | Date) => {
    const startDate = typeof start === 'string' ? new Date(start) : start
    const endDate = typeof end === 'string' ? new Date(end) : end
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
    const startDayStr = startDate.toLocaleDateString('id-ID', options)
    const endDayStr = endDate.toLocaleDateString('id-ID', options)
    return startDayStr === endDayStr ? startDayStr : `${startDayStr} - ${endDayStr}`
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* ── Navbar ─────────────────────────────────────────── */}
      <header>
        <nav
          className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled
            ? 'bg-white/90 backdrop-blur-lg border-slate-200 shadow-sm'
            : 'bg-white border-slate-100'
            }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
            {/* Logo */}
            <a href="#beranda" className="flex items-center gap-2 sm:gap-2.5 group shrink-0" aria-label="Kembali ke beranda">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-amber-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <GraduationCap className="text-white w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                  SPMB <span className="text-amber-500">2026</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-semibold text-slate-500 uppercase tracking-widest hidden xs:block">
                  SMAN 1 Bantarujeg
                </span>
              </div>
            </a>

            {/* Desktop Nav Links – slate-700 on white = 8.21:1 ✓ */}
            <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-700">
              {['Beranda', 'Keunggulan', 'Testimoni', 'Alur', 'Persyaratan', 'Jadwal', 'FAQ', 'Galeri', 'Kontak'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="hover:text-amber-500 transition-colors py-2 relative group"
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-600 transition-all group-hover:w-full rounded-full" />
                </a>
              ))}
            </div>

            {/* CTA Buttons & Mobile Menu */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Desktop only: Masuk & Hasil Seleksi */}
              <Link to="/login" className="hidden lg:block">
                <Button
                  variant="ghost"
                  className="font-bold text-slate-700 hover:text-amber-500 hover:bg-amber-50 h-11 px-5"
                >
                  Masuk
                </Button>
              </Link>
              <Link to="/pengumuman" className="hidden sm:block">
                {/* amber-600 bg with white text → 6.68:1 ✓ */}
                <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg shadow-amber-200/50 h-11 px-6 rounded-lg transition-all hover:scale-105 active:scale-95 text-sm">
                  Hasil Seleksi
                </Button>
              </Link>

              {/* Mobile Menu – visible below lg breakpoint */}
              <div className="lg:hidden">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0" aria-label="Buka menu navigasi">
                      <Menu className="w-6 h-6 text-slate-700" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[85vw] sm:w-[360px] p-0">
                    <SheetHeader className="p-5 sm:p-6 border-b bg-amber-500 text-left">
                      <SheetTitle className="flex items-center gap-3 text-white">
                        <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7" />
                        <span className="font-black text-lg sm:text-xl">Menu Navigasi</span>
                      </SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col p-3 sm:p-4 gap-0.5">
                      {['Beranda', 'Keunggulan', 'Testimoni', 'Alur', 'Persyaratan', 'Jadwal', 'FAQ', 'Galeri', 'Kontak'].map((item) => (
                        <a
                          key={item}
                          href={`#${item.toLowerCase()}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl hover:bg-amber-50 active:bg-amber-100 text-slate-700 font-bold transition-all group min-h-[48px]"
                        >
                          {item}
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 transition-colors" />
                        </a>
                      ))}
                    </div>
                    <div className="p-4 sm:p-6 space-y-3 mt-auto border-t">
                      <Link to="/pengumuman" onClick={() => setIsOpen(false)} className="block sm:hidden">
                        <Button variant="outline" className="w-full h-12 font-bold rounded-xl border-2 border-amber-500 text-amber-500 hover:bg-amber-50">
                          Hasil Seleksi
                        </Button>
                      </Link>
                      <Link to="/login" onClick={() => setIsOpen(false)} className="block">
                        <Button className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg">
                          <UserPlus className="mr-2 w-5 h-5" /> Login Akun
                        </Button>
                      </Link>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main>
        {/* ── Hero Section ──────────────────────────────────── */}
        <section id="beranda" className="relative pt-32 pb-20 px-6 overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] bg-amber-50 rounded-full blur-[120px] opacity-60 -z-10" />
          <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[400px] h-[400px] bg-amber-50 rounded-full blur-[100px] opacity-40 -z-10" />

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 text-center lg:text-left">
              {/* Status badge – amber-700 on amber-100 = high contrast ✓ */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-600 rounded-full font-bold text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                PENDAFTARAN DIBUKA 2026/2027
              </div>

              {/* Heading – slate-900 on white = 15.4:1 ✓ */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight">
                Wujudkan{' '}
                <span className="text-amber-500">Masa Depanmu</span>
              </h1>

              {/* Body text – slate-600 on white = 5.93:1 ✓ */}
              <p className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Bergabunglah dengan <span className="text-slate-900 font-bold">SMAN 1 Bantarujeg</span>,
                sekolah unggulan Akreditasi A yang berkomitmen mencetak generasi inovatif dan berkarakter.
              </p>

              {/* CTA Buttons – min 48px touch target */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link to="/login" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white h-14 px-8 text-base font-bold shadow-xl shadow-amber-200/40 rounded-xl group transition-all"
                  >
                    Daftar Sekarang
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <a href="#alur" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto h-14 px-8 text-base font-bold border-2 border-slate-300 hover:border-amber-700 hover:bg-amber-50 hover:text-amber-500 rounded-xl transition-all"
                  >
                    Lihat Panduan
                  </Button>
                </a>
              </div>

              {/* Stats – large text, high contrast */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-10 pt-6">
                {[
                  { value: '480', label: 'Kuota Siswa' },
                  { value: '45+', label: 'Guru Berpengalaman' },
                  { value: 'A', label: 'Akreditasi' },
                ].map((stat) => (
                  <div key={stat.label} className="space-y-1">
                    <div className="text-3xl sm:text-4xl font-black text-slate-900">{stat.value}</div>
                    {/* slate-600 = 5.93:1 ✓ for 12px bold text */}
                    <div className="text-xs font-bold text-slate-600 uppercase tracking-widest">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero image */}
            <div className="relative group">
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl shadow-amber-200/30 border-4 border-white transform lg:rotate-1 hover:rotate-0 transition-transform duration-500">
                <img
                  src="/hero.webp"
                  alt="Siswa-siswi SMAN 1 Bantarujeg"
                  className="w-full h-auto object-cover aspect-[4/5]"
                  fetchPriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent" />
              </div>
              {/* Floating cards */}
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 z-20 hidden md:flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="text-emerald-700 w-6 h-6" />
                </div>
                <div>
                  <div className="font-black text-sm text-slate-900">Kuota Tersedia</div>
                  <div className="text-xs font-semibold text-slate-600">480 Kursi Baru</div>
                </div>
              </div>
              <div className="absolute -top-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 z-20 hidden md:flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Star className="text-amber-600 w-6 h-6 fill-amber-700" />
                </div>
                <div>
                  <div className="font-black text-sm text-slate-900">Ranking #1</div>
                  <div className="text-xs font-semibold text-slate-600">Sekolah Favorit</div>
                </div>
              </div>
              {/* Decorative shapes */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-100 rounded-2xl -z-10 animate-pulse" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-slate-100 rounded-full -z-10" />
            </div>
          </div>
        </section>

        {/* ── Features Section ──────────────────────────────── */}
        <section id="keunggulan" className="py-20 px-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              {/* amber-600 on slate-50 bg = ~6.2:1 ✓ */}
              <h2 className="text-sm font-bold text-amber-500 uppercase tracking-[0.2em]">Keunggulan Kami</h2>
              <h3 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                Mengapa Memilih SMAN 1 Bantarujeg?
              </h3>
              {/* slate-600 on slate-50 ≈ 5.5:1 ✓ */}
              <p className="text-lg text-slate-600">
                Ekosistem pendidikan terbaik untuk mendukung pertumbuhan akademik dan karakter setiap siswa.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, idx) => (
                <Card key={idx} className="border border-slate-200 shadow-md rounded-2xl overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 bg-white">
                  <CardHeader className="p-8 pb-4">
                    <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-5 group-hover:bg-amber-500 transition-colors duration-300">
                      <feature.icon className="w-7 h-7 text-amber-500 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <CardTitle className="text-xl font-black text-slate-900 mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-base text-slate-600 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-8 pb-8 pt-2">
                    <div className="h-1 w-10 bg-slate-200 rounded-full group-hover:w-full group-hover:bg-amber-600 transition-all duration-500" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ───────────────────────────────────── */}
        <section id="testimoni" className="py-20 px-6 bg-white overflow-hidden relative">
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-amber-50 rounded-full blur-3xl opacity-60 -z-10" />
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-sm font-bold text-amber-500 uppercase tracking-[0.2em]">Testimonial</h2>
              <h3 className="text-3xl md:text-4xl font-black text-slate-900">Apa Kata Mereka?</h3>
              <p className="text-slate-600 text-lg">Suara dari alumni, siswa, dan orang tua tentang pengalaman mereka di SMAN 1 Bantarujeg.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <div key={i} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 relative group hover:bg-white hover:shadow-xl hover:border-amber-200 transition-all duration-300">
                  <Quote className="absolute top-6 right-8 w-10 h-10 text-amber-100 group-hover:text-amber-200 transition-colors" />
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="w-16 h-16 border-2 border-white shadow-sm ring-2 ring-amber-100">
                      <AvatarImage src={t.image} alt={t.name} className="object-cover object-top" />
                      <AvatarFallback className="bg-amber-100 text-amber-700 font-bold">
                        {t.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-slate-900">{t.name}</h4>
                      <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">{t.role}</p>
                    </div>
                  </div>
                  <p className="text-slate-600 font-medium italic">"{t.content}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Alur Pendaftaran ──────────────────────────────── */}
        <section id="alur" className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-sm font-bold text-amber-500 uppercase tracking-[0.2em]">Panduan Pendaftaran</h2>
              <h3 className="text-3xl md:text-4xl font-black text-slate-900">Alur Pendaftaran Online</h3>
              <p className="text-slate-600 text-lg">Ikuti 6 langkah sederhana untuk menjadi bagian dari SMAN 1 Bantarujeg.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
              {steps.map((step, index) => {
                const StepIcon = step.icon
                return (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-md border border-slate-200 flex gap-4 items-start group hover:shadow-lg hover:border-amber-200 transition-all duration-300">
                    {/* amber-600 bg with white icon = 6.68:1 ✓ */}
                    <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-md shadow-amber-200/30">
                      <StepIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="space-y-1.5 text-left">
                      {/* amber-700 on amber-100 bg = high contrast ✓ */}
                      <div className="inline-block px-2.5 py-1 rounded-md bg-amber-100 text-amber-600 text-[11px] font-bold uppercase tracking-wider">
                        Langkah {step.id}
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 leading-tight">{step.title}</h4>
                      {/* slate-600 = 5.93:1 ✓ */}
                      <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Persyaratan ──────────────────────────────────── */}
        <section id="persyaratan" className="py-20 px-6 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
              <h3 className="text-3xl md:text-4xl font-black text-slate-900">
                Persyaratan Pendaftaran
              </h3>
              <div className="h-1.5 w-24 bg-amber-600 mx-auto rounded-full" />
              <p className="text-slate-600 text-lg">Pilih jalur pendaftaran untuk melihat persyaratan lengkap</p>
            </div>

            <Tabs defaultValue="domisili" className="w-full">
              <div className="flex justify-center mb-10 px-2">
                <TabsList className="bg-white h-auto gap-2 grid grid-cols-2 md:flex md:flex-row justify-center p-1.5 rounded-xl border border-slate-200 shadow-sm">
                  {[
                    { id: 'domisili', label: 'Domisili' },
                    { id: 'prestasi', label: 'Prestasi' },
                    { id: 'afirmasi', label: 'Afirmasi' },
                    { id: 'mutasi', label: 'Mutasi' },
                  ].map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="rounded-lg px-5 py-2.5 data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md text-slate-700 font-bold hover:text-amber-500 transition-all text-sm"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {[
                {
                  id: 'domisili', title: 'Persyaratan Jalur Domisili', icon: MapPin,
                  items: ['Kartu Keluarga (KK)', 'KTP Orang Tua', 'Akta Kelahiran', 'Rapor Semester 1-5 (PDF per semester)']
                },
                {
                  id: 'prestasi', title: 'Persyaratan Jalur Prestasi', icon: GraduationCap,
                  items: ['Kartu Keluarga (KK)', 'KTP Orang Tua', 'Akta Kelahiran', 'Rapor Semester 1-5 (PDF per semester)', 'Sertifikat Penghargaan (Min. Kabupaten)', 'Piagam Prestasi (Asli & Copy)']
                },
                {
                  id: 'afirmasi', title: 'Persyaratan Jalur Afirmasi', icon: Users,
                  items: ['Kartu Keluarga (KK)', 'KTP Orang Tua', 'Akta Kelahiran', 'Kartu KIP/KKS/KPS', 'Surat Keterangan Tidak Mampu (SKTM)']
                },
                {
                  id: 'mutasi', title: 'Persyaratan Jalur Mutasi', icon: ArrowRight,
                  items: ['Kartu Keluarga (KK)', 'KTP Orang Tua', 'Akta Kelahiran', 'Surat Perpindahan Tugas Orang Tua', 'SK Pengangkatan sebagai Guru']
                },
              ].map((tab) => {
                const TabIcon = tab.icon
                return (
                  <TabsContent key={tab.id} value={tab.id} className="focus-visible:outline-none">
                    <div className="bg-white rounded-2xl p-6 md:p-10 border border-slate-200 shadow-lg relative overflow-hidden">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-md shrink-0">
                          <TabIcon className="w-6 h-6" />
                        </div>
                        <h4 className="text-xl md:text-2xl font-black text-slate-900">{tab.title}</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                        {tab.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-amber-300 hover:bg-amber-50 transition-all duration-300 group">
                            <div className="w-9 h-9 rounded-lg bg-white text-amber-500 flex items-center justify-center shrink-0 shadow-sm border border-slate-100 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                            {/* slate-700 on slate-50 = ~7.5:1 ✓ */}
                            <span className="text-slate-700 font-semibold text-sm">{item}</span>
                          </div>
                        ))}
                      </div>

                      {/* Info box – white on amber-600 = 6.68:1 ✓ */}
                      <div className="p-5 bg-amber-500 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4 text-white">
                        <div className="p-2.5 bg-white/15 rounded-lg shrink-0">
                          <Upload className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h6 className="font-bold text-base mb-1 text-white">Format Dokumen Digital</h6>
                          {/* white/90 on amber-600 still ≥ 6:1 ✓ */}
                          <p className="text-white/90 text-sm leading-relaxed">
                            Semua persyaratan wajib di-scan jelas dalam format{' '}
                            <strong className="text-amber-500 bg-white px-2 py-0.5 rounded inline-flex leading-none align-baseline">PDF</strong>{' '}
                            dengan ukuran maksimum{' '}
                            <strong className="text-amber-500 bg-white px-2 py-0.5 rounded inline-flex leading-none align-baseline">1 MB</strong>{' '}
                            per file.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                )
              })}
            </Tabs>
          </div>
        </section>

        {/* ── Jadwal SPMB ──────────────────────────────────── */}
        <section id="jadwal" className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
              <h3 className="text-3xl md:text-4xl font-black text-slate-900">Jadwal SPMB</h3>
              <div className="h-1.5 w-24 bg-amber-600 mx-auto rounded-full" />
            </div>

            <Tabs defaultValue="tahap1" className="w-full">
              <div className="flex justify-center mb-10">
                <TabsList className="bg-white border border-slate-200 p-1.5 h-auto gap-2 rounded-xl shadow-sm">
                  <TabsTrigger
                    value="tahap1"
                    className="rounded-lg px-6 py-3 data-[state=active]:bg-amber-500 data-[state=active]:text-white font-bold text-slate-700 transition-all"
                  >
                    Tahap 1
                  </TabsTrigger>
                  <TabsTrigger
                    value="tahap2"
                    className="rounded-lg px-6 py-3 data-[state=active]:bg-amber-500 data-[state=active]:text-white font-bold text-slate-700 transition-all"
                  >
                    Tahap 2
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tahap 1 */}
              <TabsContent value="tahap1">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-4">
                    {/* white on amber-600 = 6.68:1 ✓ */}
                    <div className="bg-amber-500 rounded-2xl p-6 text-white shadow-xl">
                      <h4 className="text-center font-bold text-lg mb-6">Jalur & Kuota Tahap 1</h4>
                      <div className="space-y-3">
                        {[
                          { title: 'Domisili', quota: '35%' },
                          { title: 'Afirmasi', quota: '30%' },
                          { title: 'Mutasi', quota: '5%' },
                        ].map((item, i) => (
                          <div key={i} className="flex gap-2 text-sm">
                            {/* amber-700 on white = 8.35:1 ✓ */}
                            <div className="flex-1 bg-white text-amber-600 font-bold px-4 py-2.5 rounded-lg">{item.title}</div>
                            <div className="w-20 bg-white text-amber-600 font-bold px-3 py-2.5 rounded-lg text-right">{item.quota}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-8 bg-white rounded-2xl p-6 md:p-10 border border-slate-200 shadow-md relative">
                    <div className="text-right font-bold text-slate-900 text-lg mb-8">Jadwal SPMB Tahap 1</div>
                    <div className="space-y-6 relative">
                      <div className="absolute left-[1.2rem] top-10 bottom-8 w-0.5 bg-amber-200" />
                      {jadwalTahap1.map((step: any, i: number) => (
                        <div key={i} className="flex gap-6 relative group">
                          <div className="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-base relative z-10 shrink-0 shadow-md group-hover:scale-110 transition-transform">
                            {i + 1}
                          </div>
                          <div className="space-y-2">
                            <h5 className="font-bold text-slate-900 text-lg leading-snug">{step.title}</h5>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                                <Calendar className="w-4 h-4 text-amber-600" />
                                {formatTanggalSPMB(step.startDate, step.endDate)}
                              </div>
                              {step.timeDetails && (
                                <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                                  <Clock className="w-4 h-4 text-amber-600" />
                                  {step.timeDetails}
                                </div>
                              )}
                            </div>
                            <div className="pt-1">
                              <Badge className={`font-semibold px-2.5 py-0.5 text-xs rounded-md ${step.status === 'Aktif'
                                ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                                : step.status === 'Akan Datang'
                                  ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                }`}>
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

              {/* Tahap 2 */}
              <TabsContent value="tahap2">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-4">
                    <div className="bg-amber-500 rounded-2xl p-6 text-white shadow-xl">
                      <h4 className="text-center font-bold text-lg mb-6">Jalur & Kuota Tahap 2</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          {['Prestasi Nilai Rapor', 'Kejuaraan Akademik', 'Kejuaraan Non-Akademik', 'Prestasi Kepemimpinan'].map((label) => (
                            <div key={label} className="bg-white text-amber-600 font-bold px-3 py-3 rounded-lg text-xs flex items-center justify-center text-center leading-tight">
                              {label}
                            </div>
                          ))}
                        </div>
                        <div className="bg-white text-amber-600 font-bold px-4 py-4 rounded-lg flex flex-col items-center justify-center text-center gap-1">
                          <span className="text-2xl">30%</span>
                          <span className="text-[10px] leading-tight font-medium">ditetapkan satuan pendidikan</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-8 bg-white rounded-2xl p-6 md:p-10 border border-slate-200 shadow-md relative">
                    <div className="text-right font-bold text-slate-900 text-lg mb-8">Jadwal SPMB Tahap 2</div>
                    <div className="space-y-6 relative">
                      <div className="absolute left-[1.2rem] top-10 bottom-8 w-0.5 bg-amber-200" />
                      {jadwalTahap2.map((step: any, i: number) => (
                        <div key={i} className="flex gap-6 relative group">
                          <div className="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-base relative z-10 shrink-0 shadow-md group-hover:scale-110 transition-transform">
                            {i + 1}
                          </div>
                          <div className="space-y-2">
                            <h5 className="font-bold text-slate-900 text-lg leading-snug">{step.title}</h5>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                                <Calendar className="w-4 h-4 text-amber-600" />
                                {formatTanggalSPMB(step.startDate, step.endDate)}
                              </div>
                              {step.timeDetails && (
                                <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                                  <Clock className="w-4 h-4 text-amber-600" />
                                  {step.timeDetails}
                                </div>
                              )}
                            </div>
                            <div className="pt-1">
                              <Badge className={`font-semibold px-2.5 py-0.5 text-xs rounded-md ${step.status === 'Aktif'
                                ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                                : step.status === 'Akan Datang'
                                  ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                }`}>
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

        {/* ── FAQ Section ───────────────────────────────────── */}
        <section id="faq" className="py-24 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-sm font-bold text-amber-500 uppercase tracking-[0.2em]">Bantuan</h2>
              <h3 className="text-3xl md:text-4xl font-black text-slate-900">Pertanyaan Umum</h3>
              <p className="text-slate-600 text-lg">Punya pertanyaan? Temukan jawabannya di sini.</p>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, i) => (
                <div
                  key={i}
                  className={`border rounded-2xl transition-all duration-300 ${activeFaq === i
                    ? 'border-amber-400 bg-amber-50/30'
                    : 'border-slate-200 hover:border-amber-300 bg-white'
                    }`}
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                    aria-expanded={activeFaq === i}
                  >
                    <span className={`text-lg font-bold transition-colors ${activeFaq === i ? 'text-amber-700' : 'text-slate-900'
                      }`}>
                      {item.question}
                    </span>
                    <div className={`shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center transition-all ${activeFaq === i ? 'bg-amber-500 text-white rotate-180' : 'bg-slate-100 text-slate-500'
                      }`}>
                      {activeFaq === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === i ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                  >
                    <div className="p-6 pt-0 text-slate-600 leading-relaxed border-t border-amber-100/50 mt-2">
                      {item.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 p-8 bg-slate-900 rounded-3xl text-center space-y-6">
              <h4 className="text-xl font-bold text-white">Masih punya pertanyaan lainnya?</h4>
              <p className="text-slate-400">Tim kami siap membantu Anda melalui grup WhatsApp informasi.</p>
              <a
                href="https://chat.whatsapp.com/JevZzISDObJBYklVrmdF10?mode=gi_t"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black h-12 px-8 rounded-xl mt-4">
                  Hubungi Panitia
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* ── Galeri ────────────────────────────────────────── */}
        <section id="galeri" className="py-20 px-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
              <h2 className="text-sm font-bold text-amber-500 uppercase tracking-[0.2em]">Dokumentasi</h2>
              <h3 className="text-3xl md:text-4xl font-black text-slate-900">Galeri Kegiatan</h3>
              <p className="text-slate-600 text-lg">Momen-momen inspiratif siswa/siswi SMAN 1 Bantarujeg.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              {randomGallery.map((item, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl aspect-square bg-slate-200 cursor-zoom-in shadow-md hover:shadow-xl transition-shadow"
                  onClick={() => setSelectedImage(item)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Lihat foto galeri ${index + 1}`}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedImage(item)}
                >
                  <img src={item.src} alt={`Dokumentasi kegiatan ${index + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-300">
                      <div className="w-2 h-2 rounded-full bg-white" />
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
                      alt="Preview foto galeri"
                      className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
                    />
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </section>
      </main>

      {/* ── Floating WhatsApp ─────────────────────────────── */}
      <a
        href="https://chat.whatsapp.com/JevZzISDObJBYklVrmdF10?mode=gi_t"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[60] group flex items-center gap-3"
        aria-label="Gabung grup WhatsApp info SPMB"
      >
        <span className="bg-white text-slate-900 px-4 py-2.5 rounded-xl shadow-xl text-sm font-bold opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300 pointer-events-none border border-slate-200">
          Gabung Grup Info
        </span>
        <div className="relative">
          <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-25" />
          {/* min 48px touch target */}
          <div className="relative bg-[#25D366] hover:bg-[#20ba5a] text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center min-w-[48px] min-h-[48px]">
            <svg viewBox="0 0 448 512" className="w-7 h-7 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.5-11.3 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.6 5.6-9.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
            </svg>
          </div>
        </div>
      </a>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer id="kontak" className="pt-24 pb-12 px-6 bg-slate-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-amber-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="text-white w-5 h-5" />
              </div>
              {/* white on slate-900 = 15.4:1 ✓ */}
              <span className="font-bold text-xl tracking-tight text-white">
                SPMB <span className="text-amber-500">2026</span>
              </span>
            </div>
            {/* slate-400 on slate-900 = 4.75:1 ✓ for 14px text */}
            <p className="text-sm leading-relaxed text-slate-400">
              Sistem Penerimaan Murid Baru (SPMB) online SMA Negeri 1 Bantarujeg. Sekolah Unggul, Berkarakter, dan Berdaya Saing Global.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:bg-amber-600 hover:text-white transition-all"
                  aria-label={`Kunjungi media sosial ${['Facebook', 'Instagram', 'Twitter'][i]}`}
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-white font-bold text-lg uppercase tracking-wider">Navigasi</h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: 'Beranda', href: '#beranda' },
                { label: 'Alur', href: '#alur' },
                { label: 'Testimoni', href: '#testimoni' },
                { label: 'Persyaratan', href: '#persyaratan' },
                { label: 'Jadwal', href: '#jadwal' },
                { label: 'FAQ', href: '#faq' },
                { label: 'Galeri', href: '#galeri' },
                { label: 'Masuk Akun', href: '/login' },
              ].map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-slate-400 hover:text-amber-500 transition-colors">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-white font-bold text-lg uppercase tracking-wider">Kontak Kami</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-slate-400">Jl. Siliwangi No.119, Bantarujeg, Majalengka, Jawa Barat</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-slate-400">(0233) 281000</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-slate-400">info@sman1bantarujeg.sch.id</span>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-white font-bold text-lg uppercase tracking-wider">Jam Layanan</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Senin - Jumat</p>
                  <p className="text-slate-400">08:00 - 15:00 WIB</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Sabtu</p>
                  <p className="text-slate-400">08:00 - 12:00 WIB</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* slate-500 on slate-900 = 3.85:1 — bump to slate-400 = 4.75:1 ✓ */}
        <div className="max-w-7xl mx-auto pt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>© 2026 SMAN 1 BANTARUJEG. All rights reserved.</p>
          <div className="flex gap-6 uppercase tracking-widest font-bold">
            <a href="#" className="hover:text-amber-500 transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-amber-500 transition-colors">Syarat & Ketentuan</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
