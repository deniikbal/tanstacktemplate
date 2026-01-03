import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
    Search,
    CheckCircle2,
    XCircle,
    ArrowLeft,
    Sparkles,
    Loader2,
    Lock,
    RotateCcw,
    User,
    Hash,
    Calendar,
    Building,
    Trophy
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { getActiveTahunAjaran } from '@/lib/server/tahun-ajaran'
import { checkAnnouncement } from '@/lib/server/students'

export const Route = createFileRoute('/pengumuman')({
    component: AnnouncementPage,
    loader: async () => {
        const activeTahun = await getActiveTahunAjaran()
        return {
            announcementDate: activeTahun?.tanggalPengumuman || new Date('2026-06-01T08:00:00'),
            tahunAjaran: activeTahun?.tahun || '2026/2027'
        }
    },
})

function AnnouncementPage() {
    const { announcementDate } = Route.useLoaderData()
    // Target date for announcement from database
    const targetDate = new Date(announcementDate).getTime()

    const [timeLeft, setTimeLeft] = useState<{
        days: number,
        hours: number,
        minutes: number,
        seconds: number,
        isExpired: boolean
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false })

    const [isMounted, setIsMounted] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [result, setResult] = useState<{
        found: boolean,
        status?: 'LULUS' | 'TIDAK_LULUS',
        name?: string,
        regNo?: string | null,
        nisn?: string | null,
        sekolahAsal?: string | null,
        tempatLahir?: string | null,
        tanggalLahir?: string | null,
        jalur?: string | null
    } | null>(null)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (!isMounted) return
        const timer = setInterval(() => {
            const now = new Date().getTime()
            const distance = targetDate - now

            if (distance < 0) {
                clearInterval(timer)
                setTimeLeft(prev => ({ ...prev, isExpired: true }))
            } else {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000),
                    isExpired: false
                })
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [targetDate, isMounted])

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchQuery) return
        if (searchQuery.length !== 10) {
            alert('NISN harus 10 digit')
            return
        }

        setIsSearching(true)
        setResult(null)

        try {
            const data = await checkAnnouncement({ data: { nisn: searchQuery } })
            setResult(data)
        } catch (error: any) {
            console.error('Search failed:', error)
            setResult({ found: false })
        } finally {
            setIsSearching(false)
        }
    }

    // Helper function to format date efficiently
    const formatDate = (dateString?: string | null | Date) => {
        if (!dateString) return ''
        try {
            const date = new Date(dateString)
            const months = [
                'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
            ]
            return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
        } catch (e) {
            return String(dateString)
        }
    }

    if (!isMounted) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
            </div>
        )
    }

    return (
        <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900 font-sans flex flex-col items-center justify-center relative select-none overflow-x-hidden p-6 md:p-12">
            {/* Soft Light Mesh Background */}
            <div className="absolute top-0 inset-0 overflow-hidden -z-10 bg-[#f8fafc]">
                <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-emerald-100/40 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-blue-100/30 rounded-full blur-[120px]"></div>
                <div className="absolute top-[20%] right-[-5%] w-[50%] h-[50%] bg-emerald-50/20 rounded-full blur-[100px]"></div>
            </div>

            <nav className="absolute top-6 left-6 z-30">
                <Link to="/">
                    <Button
                        variant="ghost"
                        className="bg-white/90 border border-slate-300 hover:bg-white text-slate-700 hover:text-emerald-800 backdrop-blur-md transition-all gap-2 text-[10px] md:text-[11px] font-black tracking-widest uppercase h-9 md:h-10 px-4 md:px-6 rounded-sm shadow-md"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Beranda</span>
                    </Button>
                </Link>
            </nav>

            <div className="w-full max-w-2xl relative z-20">
                {!timeLeft.isExpired ? (
                    /* Premium Light Countdown View */
                    <div key="countdown-view" className="space-y-8 md:space-y-12 animate-in fade-in zoom-in-95 duration-1000 ease-out">
                        <div className="text-center space-y-2 md:space-y-3">
                            <h1 className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-emerald-800">Counting Down</h1>
                            <h2 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tighter text-slate-900 leading-tight">
                                Menuju <span className="text-emerald-700">Pengumuman</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {[
                                { label: 'Hari', value: timeLeft.days },
                                { label: 'Jam', value: timeLeft.hours },
                                { label: 'Menit', value: timeLeft.minutes },
                                { label: 'Detik', value: timeLeft.seconds }
                            ].map((item, i) => (
                                <div key={i} className="group relative">
                                    <div className="absolute inset-0 bg-emerald-200/30 rounded-sm blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="relative flex flex-col items-center bg-white rounded-sm p-5 md:p-8 border border-slate-200 shadow-[0_10px_40px_rgb(0,0,0,0.06)] transition-all hover:scale-105 hover:shadow-[0_25px_60px_rgb(0,0,0,0.1)]">
                                        <span className="text-3xl md:text-6xl font-black text-slate-900 tabular-nums tracking-tighter leading-none">
                                            {String(item.value).padStart(2, '0')}
                                        </span>
                                        <span className="text-[10px] md:text-[11px] font-black text-emerald-800 uppercase tracking-[0.2em] mt-2 md:mt-4">
                                            {item.label}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-center gap-4 text-slate-600 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em]">
                            <div className="h-px w-8 md:w-16 bg-slate-400 opacity-30"></div>
                            <span className="flex items-center gap-2 whitespace-nowrap">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                PPDB SMANSABA 2026
                            </span>
                            <div className="h-px w-8 md:w-16 bg-slate-400 opacity-30"></div>
                        </div>
                    </div>
                ) : (
                    /* Search View */
                    <div key="search-view" className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-lg mx-auto w-full">
                        {!result || !result.found ? (
                            <>
                                <div className="text-center space-y-1">
                                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-emerald-900">Cek Hasil SPMB Tahap 2</h2>
                                </div>
                                <Card className="bg-[#fafffb] border-emerald-100/50 shadow-sm rounded-sm overflow-hidden">
                                    <CardContent className="p-6 md:p-8 space-y-5">
                                        <form onSubmit={handleSearch} className="space-y-5">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Masukkan NISN</label>
                                                <div className="relative group">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                                                    <Input
                                                        placeholder="Masukkan 10 digit NISN"
                                                        className="h-12 pl-12 pr-12 text-base bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-400 focus:ring-0 rounded-sm transition-all shadow-sm"
                                                        value={searchQuery}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                                                            setSearchQuery(val)
                                                        }}
                                                    />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold tabular-nums">
                                                        {searchQuery.length}
                                                    </span>
                                                </div>
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={isSearching}
                                                className="w-full h-12 text-base font-bold bg-[#a0e9bc] hover:bg-[#86d9a5] text-emerald-900 rounded-sm shadow-sm transition-all flex items-center justify-center gap-2"
                                            >
                                                {isSearching ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Search className="w-4 h-4" />
                                                        Cek Hasil
                                                    </>
                                                )}
                                            </Button>
                                        </form>

                                        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Petunjuk</p>
                                            <ul className="text-xs text-slate-500 font-medium space-y-1.5 list-disc pl-4 text-left">
                                                <li>Pastikan NISN sesuai dengan kartu peserta.</li>
                                                <li>Jika data tidak ditemukan, hubungi panitia PPDB.</li>
                                                <li>Pengumuman ini bersifat final dan mengikat.</li>
                                            </ul>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            /* Premium Result View - Single Page Fit */
                            <div className="animate-in zoom-in-95 fade-in duration-500 ease-out w-full max-w-2xl mx-auto flex flex-col justify-center">
                                <Card className="bg-white border-slate-200 shadow-xl rounded-sm overflow-hidden relative border-t-0 my-auto">
                                    {/* Refresh Icon Button */}
                                    <Button
                                        onClick={() => setResult(null)}
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-3 right-3 text-slate-400 hover:text-emerald-600 transition-colors z-20 rounded-sm w-8 h-8"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </Button>

                                    {/* Merged Header & Content */}
                                    <div className="p-5 md:p-6 space-y-5">
                                        {/* Horizontal Header */}
                                        <div className={`p-4 rounded-sm flex items-center gap-4 ${result.status === 'LULUS' ? 'bg-[#f0fdf4] border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
                                            <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full ${result.status === 'LULUS' ? 'bg-[#dcfce7] text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                <div className={`${result.status === 'LULUS' ? 'bg-emerald-600' : 'bg-red-600'} text-white rounded-full p-1`}>
                                                    {result.status === 'LULUS' ? (
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-baseline gap-2 flex-wrap">
                                                    <h1 className="text-lg font-extrabold tracking-tight text-slate-900 uppercase leading-none">SELAMAT!</h1>
                                                    <p className={`text-base font-bold uppercase leading-none ${result.status === 'LULUS' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                        {result.status === 'LULUS' ? 'ANDA LULUS' : 'MAAF ANDA BELUM LULUS'}
                                                    </p>
                                                </div>
                                                <p className="text-slate-500 font-medium text-xs mt-1 truncate">Di SMAN 1 Bantarujeg - Tahun 2026/2027</p>
                                            </div>
                                        </div>

                                        {/* Data Grid */}
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                                                Data Siswa
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                                                {/* Left Column */}
                                                <div className="space-y-2">
                                                    <div className="flex gap-2 items-center group p-1.5 hover:bg-slate-50 rounded-sm transition-colors border border-transparent hover:border-slate-100">
                                                        <div className="p-1 bg-emerald-50 rounded-sm text-emerald-600">
                                                            <User className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Nama Lengkap</p>
                                                            <p className="text-xs font-bold text-slate-900 leading-tight uppercase truncate">{result.name}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 items-center group p-1.5 hover:bg-slate-50 rounded-sm transition-colors border border-transparent hover:border-slate-100">
                                                        <div className="p-1 bg-emerald-50 rounded-sm text-emerald-600">
                                                            <Hash className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">No. Peserta</p>
                                                            <p className="text-xs font-bold text-slate-900 tracking-tight truncate">{result.regNo}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 items-center group p-1.5 hover:bg-slate-50 rounded-sm transition-colors border border-transparent hover:border-slate-100">
                                                        <div className="p-1 bg-emerald-50 rounded-sm text-emerald-600">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Tgl Lahir</p>
                                                            <p className="text-xs font-bold text-slate-900 uppercase truncate">
                                                                {result.tempatLahir}, {formatDate(result.tanggalLahir)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Right Column */}
                                                <div className="space-y-2">
                                                    <div className="flex gap-2 items-center group p-1.5 hover:bg-slate-50 rounded-sm transition-colors border border-transparent hover:border-slate-100">
                                                        <div className="p-1 bg-emerald-50 rounded-sm text-emerald-600 flex items-center justify-center w-5.5 h-5.5">
                                                            <span className="font-bold text-[10px]">#</span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Asal Sekolah</p>
                                                            <p className="text-xs font-bold text-slate-900 leading-tight uppercase truncate">{result.sekolahAsal}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 items-center group p-1.5 hover:bg-slate-50 rounded-sm transition-colors border border-transparent hover:border-slate-100">
                                                        <div className="p-1 bg-emerald-50 rounded-sm text-emerald-600">
                                                            <Building className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">NISN</p>
                                                            <p className="text-xs font-bold text-slate-900 tracking-tight truncate">{result.nisn || '-'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 items-center group p-1.5 hover:bg-slate-50 rounded-sm transition-colors border border-transparent hover:border-slate-100">
                                                        <div className="p-1 bg-emerald-50 rounded-sm text-emerald-600">
                                                            <Trophy className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Jalur</p>
                                                            <p className="text-xs font-bold text-slate-900 uppercase truncate">{result.jalur || '-'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-slate-100 flex flex-col gap-1 text-center">
                                            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Catatan Penting</p>
                                            <p className="text-[9px] text-slate-500 font-medium leading-relaxed">
                                                Simpan tangkapan layar halaman ini sebagai bukti kelulusan sementara.
                                                <br />
                                                Informasi daftar ulang akan diberitahukan kemudian.
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {!result?.found && result !== null && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300 text-center p-4 bg-red-50 border border-red-100 rounded-sm">
                                <p className="text-xs text-red-700 font-bold uppercase tracking-wider">Data Tidak Ditemukan!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <p className="absolute bottom-6 md:bottom-10 text-[10px] font-black tracking-[0.5em] text-slate-500 uppercase opacity-90">
                © 2026 PPDB Online SMAN 1 BANTARUJEG
            </p>
        </div >
    )
}
