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
        <div className="h-screen bg-slate-900 text-slate-100 p-4 font-sans selection:bg-emerald-500/30 overflow-hidden flex flex-col">
            <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col gap-4">
                {/* Header & Stats Combined */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-600/20">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight uppercase">Monitor Antrian</h1>
                            <p className="text-slate-400 text-[10px] font-medium">SMAN 1 BANTARUJEG - {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-1 flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-widest text-emerald-500/70">Selesai:</span>
                                <span className="text-lg font-black text-emerald-500">{pendaftar.filter((p: Pendaftar) => p.statusAntrian === 'DONE').length}</span>
                            </div>
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-1 flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-widest text-amber-500/70">Sisa:</span>
                                <span className="text-lg font-black text-amber-500">{pendaftar.filter((p: Pendaftar) => p.statusAntrian === 'WAITING').length}</span>
                            </div>
                        </div>

                        <div className="h-8 w-px bg-white/10 mx-1 hidden md:block" />

                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={toggleFullscreen}
                                className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl gap-2 h-9 px-3"
                            >
                                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                                <span className="text-[10px] font-bold uppercase tracking-wider">{isFullscreen ? 'Keluar' : 'Layar Penuh'}</span>
                            </Button>
                            <div className="flex items-center gap-2 bg-white/5 backdrop-blur px-4 py-2 rounded-xl border border-white/10 h-9">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">Live</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <div className="flex-1 min-h-0 flex flex-col gap-4">
                    {/* Primary Focus: NOW CALLING */}
                    <Card className="flex-1 bg-gradient-to-br from-emerald-600 to-teal-800 border-none shadow-2xl shadow-emerald-900/40 overflow-hidden relative flex flex-col justify-center min-h-0">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Volume2 className="w-48 h-48 rotate-12" />
                        </div>
                        <CardContent className="p-6 md:p-8 text-center relative z-10 flex flex-col items-center justify-center space-y-4">
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xl px-6 py-2 rounded-full border border-white/30 text-white animate-bounce-slow shrink-0">
                                <Bell className="w-4 h-4" />
                                <span className="text-sm font-black uppercase tracking-[0.2em]">Panggilan Saat Ini</span>
                            </div>

                            <div className="space-y-0 leading-none">
                                <h2 className="text-[8rem] md:text-[12rem] font-black tracking-tighter text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]">
                                    {calling ? `#${calling.noAntrian}` : '-'}
                                </h2>
                                <div className="h-1.5 w-24 bg-white/30 mx-auto rounded-full" />
                            </div>

                            <div className="space-y-1">
                                <p className="text-3xl md:text-5xl font-bold text-white uppercase tracking-tight">
                                    {calling?.nmLengkap || 'Menunggu Antrian...'}
                                </p>
                                <p className="text-emerald-100 text-lg font-medium opacity-80">
                                    Silakan menuju Meja Pendaftaran Utama
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Secondary Sections: Next & Serving Side-by-Side */}
                    <div className="h-[35%] min-h-[200px] grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
                        <Card className="bg-slate-800/50 border-white/5 backdrop-blur shadow-xl flex flex-col min-h-0">
                            <CardHeader className="p-3 border-b border-white/10 shrink-0">
                                <div className="flex items-center gap-2 text-amber-400">
                                    <Clock className="w-4 h-4" />
                                    <h3 className="text-sm font-black uppercase tracking-wider">Antrian Berikutnya</h3>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 overflow-hidden flex-1">
                                <div className="divide-y divide-white/5">
                                    {waiting.length > 0 ? waiting.slice(0, 3).map((p: Pendaftar, i: number) => (
                                        <div key={p.id} className="p-3 flex items-center justify-between group hover:bg-white/5 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl font-black text-white/20 group-hover:text-amber-500/50 transition-colors w-5">{i + 1}</span>
                                                <div>
                                                    <p className="text-base font-bold text-white group-hover:text-amber-400 transition-colors truncate max-w-[200px] leading-tight">{p.nmLengkap}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Calon Siswa Baru</p>
                                                </div>
                                            </div>
                                            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-base px-3 py-0.5 font-black">
                                                #{p.noAntrian}
                                            </Badge>
                                        </div>
                                    )) : (
                                        <div className="p-6 text-center text-slate-500 italic text-xs font-medium">Antrian belum tersedia</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-800/50 border-white/5 backdrop-blur shadow-xl flex flex-col min-h-0">
                            <CardHeader className="p-3 border-b border-white/10 shrink-0">
                                <div className="flex items-center gap-2 text-blue-400">
                                    <Ticket className="w-4 h-4" />
                                    <h3 className="text-sm font-black uppercase tracking-wider">Sedang Dilayani</h3>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 overflow-hidden flex-1">
                                <div className="divide-y divide-white/5">
                                    {inRoom.length > 0 ? inRoom.slice(0, 3).map((p: Pendaftar) => (
                                        <div key={p.id} className="p-3 flex items-center justify-between bg-blue-500/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1 h-8 bg-blue-500 rounded-full" />
                                                <div>
                                                    <p className="text-base font-bold text-white truncate max-w-[200px] leading-tight">{p.nmLengkap}</p>
                                                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-0.5">Status: Di Ruangan</p>
                                                </div>
                                            </div>
                                            <Badge className="bg-blue-500 text-white text-base px-3 py-0.5 font-black shadow-lg shadow-blue-500/20">
                                                #{p.noAntrian}
                                            </Badge>
                                        </div>
                                    )) : (
                                        <div className="p-6 text-center text-slate-500 italic text-xs font-medium">Tidak ada pelayanan aktif</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
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
