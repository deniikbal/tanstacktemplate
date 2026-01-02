import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
    Search,
    CheckCircle2,
    XCircle,
    ArrowLeft,
    Sparkles,
    Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/pengumuman')({
    component: AnnouncementPage,
})

function AnnouncementPage() {
    // Target date for announcement (set to June 1st, 2026)
    const targetDate = new Date('2026-06-01T08:00:00').getTime()

    const [timeLeft, setTimeLeft] = useState<{
        days: number,
        hours: number,
        minutes: number,
        seconds: number,
        isExpired: boolean
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false })

    const [searchQuery, setSearchQuery] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [result, setResult] = useState<{
        found: boolean,
        status?: 'LULUS' | 'TIDAK_LULUS',
        name?: string,
        regNo?: string
    } | null>(null)

    useEffect(() => {
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
    }, [targetDate])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchQuery) return

        setIsSearching(true)
        setResult(null)

        // Simulate API call
        setTimeout(() => {
            setIsSearching(false)
            if (searchQuery.length > 3) {
                setResult({
                    found: true,
                    status: searchQuery.includes('2026') ? 'LULUS' : 'TIDAK_LULUS',
                    name: 'CALON SISWA CONTOH',
                    regNo: searchQuery
                })
            } else {
                setResult({ found: false })
            }
        }, 1500)
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
                        className="bg-white/90 border border-slate-300 hover:bg-white text-slate-700 hover:text-emerald-800 backdrop-blur-md transition-all gap-2 text-[10px] md:text-[11px] font-black tracking-widest uppercase h-9 md:h-10 px-4 md:px-6 rounded-full shadow-md"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Beranda</span>
                    </Button>
                </Link>
            </nav>

            <div className="w-full max-w-2xl relative z-20">
                {!timeLeft.isExpired ? (
                    /* Premium Light Countdown View */
                    <div className="space-y-8 md:space-y-12 animate-in fade-in zoom-in-95 duration-1000 ease-out">
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
                                    <div className="absolute inset-0 bg-emerald-200/30 rounded-[1.5rem] md:rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="relative flex flex-col items-center bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-8 border border-slate-200 shadow-[0_10px_40px_rgb(0,0,0,0.06)] transition-all hover:scale-105 hover:shadow-[0_25px_60px_rgb(0,0,0,0.1)]">
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
                    /* Modern Light Result Search View */
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out max-w-md mx-auto">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900">Cek Hasil Seleksi</h2>
                            <p className="text-slate-700 text-sm font-semibold">Masukkan nomor pendaftaran Anda dengan teliti.</p>
                        </div>

                        <Card className="bg-white border-slate-200 shadow-[0_30px_60px_rgb(0,0,0,0.08)] rounded-[2.5rem] overflow-hidden">
                            <CardContent className="p-8 md:p-10">
                                <form onSubmit={handleSearch} className="space-y-6">
                                    <div className="relative group">
                                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-700 transition-colors" />
                                        <Input
                                            placeholder="2026xxxxxx"
                                            className="h-14 pl-14 text-lg bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-500 focus:bg-white focus:border-emerald-600/50 focus:ring-emerald-600/10 rounded-2xl transition-all shadow-sm"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={isSearching}
                                        className="w-full h-14 text-lg font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-xl shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        {isSearching ? (
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                        ) : 'LIHAT HASIL'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Search Result Card Light */}
                        {result && (
                            <div className="animate-in zoom-in-95 fade-in duration-500 ease-out">
                                {result.found ? (
                                    <div className={`p-1 rounded-[2.5rem] shadow-lg ${result.status === 'LULUS' ? 'bg-emerald-200' : 'bg-red-200'}`}>
                                        <div className="bg-white rounded-[2.4rem] p-8 flex flex-col items-center text-center space-y-6 shadow-sm">
                                            <div className={`p-5 rounded-3xl ${result.status === 'LULUS' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                                {result.status === 'LULUS' ? <CheckCircle2 className="w-14 h-14" /> : <XCircle className="w-14 h-14" />}
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-600 font-bold">Status Kelulusan</p>
                                                <h4 className={`text-3xl font-black tracking-tighter leading-tight ${result.status === 'LULUS' ? 'text-emerald-700' : 'text-red-700'}`}>
                                                    {result.status === 'LULUS' ? 'SELAMAT, ANDA LULUS!' : 'MAAF, TIDAK LULUS'}
                                                </h4>
                                            </div>

                                            <div className="bg-slate-50 p-5 rounded-2xl w-full border border-slate-200 grid grid-cols-2 gap-4 text-left">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-wider font-bold">No. Pendaftaran</p>
                                                    <p className="text-base font-black text-slate-900">{result.regNo}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-wider font-bold">Status Final</p>
                                                    <p className={`text-base font-black ${result.status === 'LULUS' ? 'text-emerald-700' : 'text-red-700'}`}>{result.status}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center p-5 bg-red-50 border border-red-200 rounded-2xl shadow-sm">
                                        <p className="text-sm text-red-700 font-black tracking-widest uppercase italic font-bold">Data Tidak Ditemukan!</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <p className="absolute bottom-6 md:bottom-10 text-[10px] font-black tracking-[0.5em] text-slate-500 uppercase opacity-90">
                © 2026 PPDB Online SMAN 1 BANTARUJEG
            </p>
        </div>
    )
}
