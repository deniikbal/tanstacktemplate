import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  GraduationCap,
  Users,
  Building2,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({ component: LandingPage })

function LandingPage() {
  const features = [
    {
      icon: <GraduationCap className="w-6 h-6 text-emerald-500" />,
      title: 'Akreditasi A',
      description: 'Pendidikan berkualitas dengan standar nasional tertinggi dan penerapan Kurikulum Merdeka yang adaptif.'
    },
    {
      icon: <Building2 className="w-6 h-6 text-emerald-500" />,
      title: 'Fasilitas Modern',
      description: 'Laboratorium komputer, perpustakaan digital, serta sarana olahraga yang mendukung penuh potensi minat bakat.'
    },
    {
      icon: <Users className="w-6 h-6 text-emerald-500" />,
      title: 'Lulusan Unggul',
      description: 'Mencetak lulusan yang cerdas, berkarakter, dan siap bersaing di perguruan tinggi ternama nasional.'
    }
  ]

  const steps = [
    { number: '01', title: 'Registrasi Akun', description: 'Buat akun menggunakan email aktif untuk memulai proses pendaftaran.' },
    { number: '02', title: 'Lengkapi Data', description: 'Isi biodata, asal sekolah, dan upload dokumen yang diperlukan.' },
    { number: '03', title: 'Verifikasi', description: 'Tim panitia akan memvalidasi data dan dokumen yang telah diunggah.' },
    { number: '04', title: 'Hasil Seleksi', description: 'Lihat pengumuman kelulusan secara langsung melalui portal Anda.' }
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
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#beranda" className="hover:text-emerald-600 transition-colors">Beranda</a>
            <a href="#fitur" className="hover:text-emerald-600 transition-colors">Keunggulan</a>
            <a href="#alur" className="hover:text-emerald-600 transition-colors">Alur</a>
            <a href="#kontak" className="hover:text-emerald-600 transition-colors">Kontak</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-slate-600 font-semibold">Masuk</Button>
            </Link>
            <Link to="/pengumuman">
              <Button className="bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-lg shadow-emerald-600/20 px-6">
                Pengumuman
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="beranda" className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-emerald-50 rounded-full blur-3xl opacity-50 -z-10"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-blue-50 rounded-full blur-3xl opacity-40 -z-10"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold border border-emerald-100 animate-pulse">
              <Sparkles className="w-4 h-4" />
              Pendaftaran 2026/2027 Telah Dibuka
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Mulai Masa Depan Gemilang di <span className="text-emerald-600">SMAN 1 BANTARUJEG</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Bergabunglah dengan sekolah terbaik untuk menggapai cita-cita. Sistem pendaftaran online yang mudah, cepat, dan transparan.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link to="/login">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 h-14 px-8 text-lg font-bold shadow-xl shadow-emerald-500/30 group">
                  Daftar Sekarang
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-bold border-2 hover:bg-slate-50">
                Panduan Pendaftaran
              </Button>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-8 pt-4">
              <div className="flex flex-col items-center lg:items-start text-xs font-semibold text-slate-400 uppercase tracking-widest gap-2">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Akreditasi A</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Fasilitas Lengkap</span>
              </div>
              <div className="flex flex-col items-center lg:items-start text-xs font-semibold text-slate-400 uppercase tracking-widest gap-2">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Kurikulum Merdeka</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Guru Profesional</span>
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

      {/* Features Section */}
      <section id="fitur" className="py-24 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-[0.2em]">Keunggulan Kami</h2>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900">Mengapa Memilih SMAN 1 BANTARUJEG?</h3>
            <p className="text-slate-500 text-lg">Kami menghadirkan pengalaman pendaftaran sekolah yang modern dan memudahkan calon siswa.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-emerald-200 transition-all group">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
                <p className="text-slate-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alur Pendaftaran Section */}
      <section id="alur" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-[0.2em]">Langkah Mudah</h2>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900">Alur Pendaftaran Online</h3>
            <p className="text-slate-500 text-lg">Ikuti 4 langkah sederhana untuk menjadi bagian dari SMAN 1 BANTARUJEG.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 relative">
            {/* Desktop connector line */}
            <div className="hidden lg:block absolute top-[2.2rem] left-0 w-full h-0.5 bg-slate-100 -z-10"></div>

            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center space-y-4 group">
                <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-emerald-600/30 group-hover:scale-125 transition-transform border-4 border-white">
                  {step.number}
                </div>
                <h4 className="text-lg font-bold text-slate-900 pt-2">{step.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto bg-emerald-600 rounded-[2.5rem] p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-emerald-600/40">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-900/20 rounded-full blur-3xl"></div>

          <div className="relative z-10 space-y-8">
            <h3 className="text-4xl md:text-5xl font-black">Siap Untuk Bergabung?</h3>
            <p className="text-emerald-100 text-lg md:text-xl max-w-2xl mx-auto">
              Jangan lewatkan kesempatan untuk belajar di lingkungan yang mendukung dan modern. Daftar sekarang juga!
            </p>
            <div className="flex justify-center">
              <Link to="/login">
                <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 h-14 px-10 text-xl font-bold rounded-xl shadow-lg">
                  Portal Pendaftaran
                </Button>
              </Link>
            </div>
          </div>
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
              Sistem pendaftaran peserta didik baru (PPDB) online SMA Negeri 1 Bantarujeg. Sekolah Unggul, Berkarakter, dan Berdaya Saing Global.
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
              <li><a href="#fitur" className="hover:text-emerald-500 transition-colors">Keunggulan</a></li>
              <li><a href="#alur" className="hover:text-emerald-500 transition-colors">Alur Pendaftaran</a></li>
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
