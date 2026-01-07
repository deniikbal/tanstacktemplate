import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { getPendaftarList } from '@/lib/server/pendaftar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Users,
    Bell,
    Volume2,
    Clock,
    CheckCircle,
    Ticket,
    ArrowRight,
    Maximize,
    Minimize
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/monitor')({
    component: MonitorPage,
})

interface Pendaftar {
    id: string
    nmLengkap: string
    noAntrian: string | null
    statusAntrian: string | null
    tglAntrian: string | null
}

function MonitorPage() {
    const [pendaftar, setPendaftar] = useState<Pendaftar[]>([])
    const [isFullscreen, setIsFullscreen] = useState(false)
    const lastCalledId = useRef<string | null>(null)
    const today = new Date().toISOString().split('T')[0]

    const fetchData = async () => {
        try {
            const result = await getPendaftarList({
                data: {
                    limit: 100,
                    offset: 0,
                }
            })
            const todayPendaftar = (result.pendaftar as Pendaftar[]).filter((p: Pendaftar) => p.tglAntrian === today)
            setPendaftar(todayPendaftar)

            // Auto Announcement Logic
            const currentlyCalling = todayPendaftar.find((p: Pendaftar) => p.statusAntrian === 'CALLING')
            if (currentlyCalling && currentlyCalling.id !== lastCalledId.current) {
                lastCalledId.current = currentlyCalling.id
                announce(currentlyCalling)
            }
        } catch (error) {
            console.error('Failed to fetch monitor data:', error)
        }
    }

    const announce = (p: Pendaftar) => {
        if (!p.noAntrian) return
        const text = `Nomor Antrian, ${p.noAntrian.split('').join(' ')}, atas nama, ${p.nmLengkap}, silakan menuju meja pendaftaran.`
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'id-ID'
        utterance.rate = 0.85
        window.speechSynthesis.speak(utterance)
    }

    useEffect(() => {
        fetchData()
        const interval = setInterval(fetchData, 10000) // Poll every 10s

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }
        document.addEventListener('fullscreenchange', handleFullscreenChange)

        return () => {
            clearInterval(interval)
            document.removeEventListener('fullscreenchange', handleFullscreenChange)
        }
    }, [])

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen()
            }
        }
    }

    const calling = pendaftar.find((p: Pendaftar) => p.statusAntrian === 'CALLING')
    const inRoom = pendaftar.filter((p: Pendaftar) => p.statusAntrian === 'IN_ROOM')
    const waiting = pendaftar.filter((p: Pendaftar) => p.statusAntrian === 'WAITING').slice(0, 5)
    const recentDone = pendaftar.filter((p: Pendaftar) => p.statusAntrian === 'DONE').slice(0, 3)

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans selection:bg-emerald-500/30">
            <div className="max-w-[1600px] mx-auto space-y-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-600/20">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase">Monitoring Antrian Pendaftaran</h1>
                            <p className="text-slate-400 font-medium">SMAN 1 BANTARUJEG - {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleFullscreen}
                            className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl gap-2 h-10 px-4"
                        >
                            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                            <span className="text-xs font-bold uppercase tracking-wider">{isFullscreen ? 'Keluar' : 'Layar Penuh'}</span>
                        </Button>
                        <div className="flex items-center gap-3 bg-white/5 backdrop-blur px-6 py-3 rounded-2xl border border-white/10 h-10">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-sm font-bold tracking-widest uppercase text-emerald-400">Live Monitor</span>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Section: NOW CALLING */}
                    <div className="lg:col-span-8 space-y-8">
                        <Card className="bg-gradient-to-br from-emerald-600 to-teal-800 border-none shadow-2xl shadow-emerald-900/40 overflow-hidden relative min-h-[400px] flex flex-col justify-center">
                            <div className="absolute top-0 right-0 p-12 opacity-5">
                                <Volume2 className="w-64 h-64 rotate-12" />
                            </div>
                            <CardContent className="p-8 md:p-16 text-center relative z-10 space-y-8">
                                <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-xl px-8 py-3 rounded-full border border-white/30 text-white animate-bounce-slow">
                                    <Bell className="w-6 h-6" />
                                    <span className="text-xl font-black uppercase tracking-[0.2em]">Panggilan Saat Ini</span>
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-[10rem] md:text-[15rem] font-black leading-none tracking-tighter text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]">
                                        {calling ? `#${calling.noAntrian}` : '-'}
                                    </h2>
                                    <div className="h-2 w-32 bg-white/30 mx-auto rounded-full" />
                                </div>

                                <div className="space-y-4">
                                    <p className="text-3xl md:text-5xl font-bold text-white uppercase tracking-tight">
                                        {calling?.nmLengkap || 'Menunggu Antrian...'}
                                    </p>
                                    <p className="text-emerald-100 text-xl font-medium opacity-80">
                                        Silakan menuju Meja Pendaftaran Utama
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Next in Queue Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="bg-slate-800/50 border-white/5 backdrop-blur shadow-xl">
                                <CardHeader className="p-6 border-b border-white/10">
                                    <div className="flex items-center gap-3 text-amber-400">
                                        <Clock className="w-6 h-6" />
                                        <h3 className="text-xl font-black uppercase tracking-wider">Antrian Berikutnya</h3>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-white/5">
                                        {waiting.length > 0 ? waiting.map((p: Pendaftar, i: number) => (
                                            <div key={p.id} className="p-6 flex items-center justify-between group hover:bg-white/5 transition-colors">
                                                <div className="flex items-center gap-6">
                                                    <span className="text-3xl font-black text-white/20 group-hover:text-amber-500/50 transition-colors w-8">{i + 1}</span>
                                                    <div>
                                                        <p className="text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">{p.nmLengkap}</p>
                                                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Calon Siswa Baru</p>
                                                    </div>
                                                </div>
                                                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xl px-4 py-1 font-black">
                                                    #{p.noAntrian}
                                                </Badge>
                                            </div>
                                        )) : (
                                            <div className="p-12 text-center text-slate-500 italic font-medium">Antrian belum tersedia</div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-800/50 border-white/5 backdrop-blur shadow-xl">
                                <CardHeader className="p-6 border-b border-white/10">
                                    <div className="flex items-center gap-3 text-blue-400">
                                        <Ticket className="w-6 h-6" />
                                        <h3 className="text-xl font-black uppercase tracking-wider">Sedang Dilayani</h3>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-white/5">
                                        {inRoom.length > 0 ? inRoom.map((p: Pendaftar) => (
                                            <div key={p.id} className="p-6 flex items-center justify-between bg-blue-500/5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-2 h-12 bg-blue-500 rounded-full" />
                                                    <div>
                                                        <p className="text-2xl font-bold text-white">{p.nmLengkap}</p>
                                                        <p className="text-sm text-blue-400 font-bold uppercase tracking-widest mt-1">Status: Di Ruangan</p>
                                                    </div>
                                                </div>
                                                <Badge className="bg-blue-500 text-white text-xl px-4 py-1 font-black shadow-lg shadow-blue-500/20">
                                                    #{p.noAntrian}
                                                </Badge>
                                            </div>
                                        )) : (
                                            <div className="p-12 text-center text-slate-500 italic font-medium">Tidak ada pelayanan aktif</div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Side Section: STATS & HISTORY */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 text-center">
                                <p className="text-3xl font-black text-emerald-500">{pendaftar.filter((p: Pendaftar) => p.statusAntrian === 'DONE').length}</p>
                                <p className="text-xs font-bold uppercase tracking-widest text-emerald-500/70 mt-1">Selesai</p>
                            </div>
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 text-center">
                                <p className="text-3xl font-black text-amber-500">{pendaftar.filter((p: Pendaftar) => p.statusAntrian === 'WAITING').length}</p>
                                <p className="text-xs font-bold uppercase tracking-widest text-amber-500/70 mt-1">Sisa</p>
                            </div>
                        </div>

                        {/* Recent History */}
                        <Card className="bg-slate-800/30 border-white/5 backdrop-blur-sm overflow-hidden rounded-3xl">
                            <CardHeader className="p-6 border-b border-white/10 bg-white/5">
                                <div className="flex items-center gap-3 text-slate-300">
                                    <CheckCircle className="w-5 h-5" />
                                    <h3 className="font-black uppercase tracking-widest text-sm">Riwayat Terakhir</h3>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-white/5">
                                    {recentDone.map((p: Pendaftar) => (
                                        <div key={p.id} className="p-4 flex items-center justify-between opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg font-black text-slate-500">#{p.noAntrian}</span>
                                                <p className="font-bold text-slate-300">{p.nmLengkap}</p>
                                            </div>
                                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                                        </div>
                                    ))}
                                    {recentDone.length === 0 && (
                                        <div className="p-8 text-center text-slate-600 text-xs font-bold uppercase tracking-widest italic">Belum ada riwayat</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Help / Info */}
                        <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                            <div className="space-y-2">
                                <h4 className="text-xl font-black text-white px-2">Informasi Penting</h4>
                                <div className="h-1 w-12 bg-indigo-500 rounded-full mx-2" />
                            </div>
                            <ul className="space-y-4">
                                <li className="flex gap-4 items-start">
                                    <div className="mt-1 bg-indigo-500 p-1 rounded-lg">
                                        <ArrowRight className="w-3 h-3 text-white" />
                                    </div>
                                    <p className="text-sm text-slate-400 font-medium">Siapkan berkas pendaftaran asli dan fotokopi untuk diverifikasi petugas.</p>
                                </li>
                                <li className="flex gap-4 items-start">
                                    <div className="mt-1 bg-indigo-500 p-1 rounded-lg">
                                        <ArrowRight className="w-3 h-3 text-white" />
                                    </div>
                                    <p className="text-sm text-slate-400 font-medium">Nomor antrian yang terlewat akan dipanggil kembali di akhir sesi.</p>
                                </li>
                                <li className="flex gap-4 items-start">
                                    <div className="mt-1 bg-indigo-500 p-1 rounded-lg">
                                        <ArrowRight className="w-3 h-3 text-white" />
                                    </div>
                                    <p className="text-sm text-slate-400 font-medium">Harap tenang selama berada di area tunggu pendaftaran.</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Animation Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(-5px); }
                    50% { transform: translateY(5px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }
                /* Hide scrollbar for Chrome, Safari and Opera */
                body::-webkit-scrollbar {
                    display: none;
                }
                /* Hide scrollbar for IE, Edge and Firefox */
                body {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
            ` }} />
        </div>
    )
}
