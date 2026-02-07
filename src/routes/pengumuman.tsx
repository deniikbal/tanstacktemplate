import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
    Search,
    CheckCircle2,
    XCircle,
    ArrowLeft,
    Sparkles,
    Loader2,
    RotateCcw,
    User,
    Hash,
    Trophy,
    Printer,
    GraduationCap,
    Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import QRCode from 'qrcode'
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
            tahunAjaran: activeTahun?.tahun || '2026/2027',
            tahap: activeTahun?.tahap || 'Tahap 2'
        }
    },
})

function AnnouncementPage() {
    const { announcementDate, tahap, tahunAjaran } = Route.useLoaderData()
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

            if (data.found && data.nisn) {
                await QRCode.toDataURL(data.nisn, {
                    margin: 4,
                    width: 300,
                    errorCorrectionLevel: 'H'
                })
            }
        } catch (error: any) {
            console.error('Search failed:', error)
            setResult({ found: false })
        } finally {
            setIsSearching(false)
        }
    }


    const generateCoverMapPDF = async (data: any) => {
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        })
        const pageWidth = doc.internal.pageSize.width
        const margin = 20

        const getBase64ImageFromURL = (url: string): Promise<string> => {
            return new Promise((resolve, reject) => {
                const img = new Image()
                img.crossOrigin = 'Anonymous'
                img.src = url
                img.onload = () => {
                    const canvas = document.createElement('canvas')
                    canvas.width = img.width
                    canvas.height = img.height
                    const ctx = canvas.getContext('2d')
                    if (ctx) {
                        ctx.drawImage(img, 0, 0)
                        resolve(canvas.toDataURL('image/png'))
                    } else {
                        reject('Failed to get context')
                    }
                }
                img.onerror = (e) => reject(e)
            })
        }

        try {
            doc.setDrawColor(0)
            doc.setLineWidth(0.5)
            doc.rect(5, 5, pageWidth - 10, 170, 'S')

            const logoJabar = await getBase64ImageFromURL('/logo-pemprov.png')
            const logoSpmb = await getBase64ImageFromURL('/logo-spmb.png')

            const totalLogoWidth = 47
            const startX = (pageWidth - totalLogoWidth) / 2

            doc.addImage(logoJabar, 'PNG', startX, 10, 25, 21)
            doc.addImage(logoSpmb, 'PNG', startX + 26, 10, 40, 21)

            doc.setFont('helvetica', 'bold')
            doc.setFontSize(18)
            doc.text('SPMB SMAN 1 BANTARUJEG', pageWidth / 2, 45, { align: 'center' })
            doc.setFontSize(12)
            doc.text(`TAHAP 2 TAHUN AJAR 2025/2026`, pageWidth / 2, 51, { align: 'center' })

            doc.setFillColor(25, 118, 210)
            const jalurText = `JALUR : ${String(data.jalur).toUpperCase()}`
            const textWidth = doc.getTextWidth(jalurText)
            const rectWidth = textWidth + 30
            doc.roundedRect((pageWidth - rectWidth) / 2, 58, rectWidth, 11, 4, 4, 'F')
            doc.setTextColor(255, 255, 255)
            doc.setFontSize(15)
            doc.text(jalurText, pageWidth / 2, 65.5, { align: 'center' })

            doc.setTextColor(0, 0, 0)
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(11)

            const startY = 85
            const rowHeight = 6.5
            const labelCol = margin + 5
            const valCol = 65

            const info = [
                ['No. Pendaftar', `: ${data.regNo}`],
                ['NISN', `: ${data.nisn || '-'}`],
                ['Nama Lengkap', `: ${data.name.toUpperCase()}`],
                ['Jenis Kelamin', `: ${data.jenisKelamin || '-'}`],
                ['Asal Sekolah', `: ${data.sekolahAsal.toUpperCase()}`],
                ['Status', `: ${data.status}`]
            ]

            info.forEach((item, i) => {
                doc.setFont('helvetica', 'normal')
                doc.text(item[0], labelCol, startY + (i * rowHeight))
                if (item[0] === 'Asal Sekolah' && item[1].length > 40) {
                    const splitText = doc.splitTextToSize(item[1], 80);
                    doc.setFont('helvetica', 'bold')
                    doc.text(splitText, valCol, startY + (i * rowHeight))
                } else {
                    doc.setFont('helvetica', 'bold')
                    doc.text(item[1], valCol, startY + (i * rowHeight))
                }
            })

            const qrCodeBase64 = await QRCode.toDataURL(data.nisn, {
                margin: 4,
                width: 300,
                errorCorrectionLevel: 'H'
            })
            doc.addImage(qrCodeBase64, 'PNG', pageWidth - 60, 85, 35, 35)

            doc.setDrawColor(240)
            doc.setLineWidth(0.2)
            doc.line(margin, 135, pageWidth - margin, 135)

            doc.setTextColor(0)
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(10)
            doc.text('Silahkan tunjukkan QR Code ini saat melakukan pendaftaran ulang', margin, 148)
            doc.setFontSize(9)
            doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID').replace(/\./g, ':').replace(',', '')}`, margin, 153)

            const boxWidth = 35
            const boxHeight = 22
            doc.setDrawColor(0)
            doc.setLineWidth(0.5)
            doc.roundedRect(pageWidth - margin - boxWidth, 142, boxWidth, boxHeight, 3, 3, 'S')
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(9)
            doc.text('No. Absen', pageWidth - margin - boxWidth + 17.5, 146, { align: 'center' })

            const reqY = 185
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(14)
            doc.text('PERSYARATAN DAFTAR ULANG', pageWidth / 2, reqY, { align: 'center' })

            autoTable(doc, {
                startY: reqY + 5,
                head: [['Dokumen Persyaratan', 'Ceklis']],
                body: [
                    ['Surat Bukti Kelulusan SPMB 2025 Tahap 2', ''],
                    ['Foto Copy Kartu Keluarga', ''],
                    ['Ijazah SMP/MTs atau Surat Kelulusan atau Kartu Ujian', ''],
                    ['Tata Tertib SMA Negeri 1 Bantarujeg (Bermeterai)', ''],
                    ['Surat Pernyataan Tidak Mengkriminalisasi Sekolah', '']
                ],
                theme: 'grid',
                headStyles: {
                    fillColor: [232, 244, 253],
                    textColor: [0, 0, 0],
                    fontSize: 11,
                    halign: 'center',
                    fontStyle: 'bold',
                    lineWidth: 0.5,
                    lineColor: [0, 0, 0]
                },
                bodyStyles: {
                    fontSize: 10,
                    textColor: [50, 50, 50],
                    cellPadding: 5,
                    lineWidth: 0.5,
                    lineColor: [0, 0, 0]
                },
                columnStyles: {
                    0: { cellWidth: pageWidth - margin * 2 - 25 },
                    1: { cellWidth: 25, halign: 'center' }
                },
                didDrawCell: (data) => {
                    if (data.section === 'body' && data.column.index === 1) {
                        const size = 6
                        const x = data.cell.x + (data.cell.width - size) / 2
                        const y = data.cell.y + (data.cell.height - size) / 2
                        doc.setDrawColor(0)
                        doc.setLineWidth(0.5)
                        doc.rect(x, y, size, size, 'S')
                    }
                },
                margin: { left: margin, right: margin }
            })

            doc.addPage()
            doc.setDrawColor(0)
            doc.setLineWidth(0.5)
            doc.rect(5, 5, pageWidth - 10, 185, 'S')
            doc.addImage(logoJabar, 'PNG', startX, 15, 21, 21)
            doc.addImage(logoSpmb, 'PNG', startX + 26, 15, 40, 21)
            doc.setFillColor(103, 185, 235)
            doc.rect(margin, 52, pageWidth - margin * 2, 8, 'F')
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(16)
            doc.setTextColor(30, 30, 30)
            doc.text('Pengumuman Hasil Seleksi SPMB Jawa Barat 2025 Tahap 2', pageWidth / 2, 72, { align: 'center' })
            const contentY = 85
            doc.addImage(qrCodeBase64, 'PNG', margin, contentY, 40, 40)
            doc.setFontSize(11)
            doc.setFont('helvetica', 'normal')
            doc.text('No. Pendaftar', margin + 50, contentY + 4)
            doc.text('Nama', margin + 50, contentY + 11)
            doc.text('Asal Sekolah', margin + 50, contentY + 18)
            doc.text(`: ${data.regNo}`, margin + 85, contentY + 4)
            doc.setFont('helvetica', 'bold')
            doc.text(`: ${data.name.toUpperCase()}`, margin + 85, contentY + 11)
            doc.setFont('helvetica', 'normal')
            doc.text(`: ${data.sekolahAsal.toUpperCase()}`, margin + 85, contentY + 18)
            doc.setFontSize(12)
            doc.text('Selamat! Anda dinyatakan Diterima di:', margin + 50, contentY + 32)
            doc.setFontSize(15)
            doc.setFont('helvetica', 'bold')
            const resultText = `SMAN 1 BANTARUJEG - ${String(data.jalur).toUpperCase()}`
            doc.text(resultText, margin + 50, contentY + 41)
            doc.setFontSize(11)
            doc.text('PERHATIAN!', margin, contentY + 56)
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(10)
            const attentionText = `Pendaftar yang telah diterima wajib melakukan daftar ulang di sekolah tujuan pada tanggal 10 Juli 2025 - 11 Juli 2025.`
            const splitAttention = doc.splitTextToSize(attentionText, pageWidth - margin * 2)
            doc.text(splitAttention, margin, contentY + 62)
            doc.setFillColor(0, 150, 60)
            doc.rect(margin, contentY + 80, pageWidth - margin * 2, 10, 'F')
            doc.save(`Pengumuman_${data.name.replace(/\s+/g, '_')}.pdf`)
        } catch (error) {
            console.error('PDF generation failed:', error)
            alert('Gagal membuat PDF. Pastikan aset logo tersedia.')
        }
    }

    if (!isMounted) {
        return (
            <div className="min-h-screen bg-slate-50 flex col items-center justify-center p-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen flex flex-col font-sans antialiased transition-colors duration-300">
            {/* Header */}
            <header className="w-full px-4 md:px-6 py-4 flex items-center justify-between bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-50 transition-colors duration-300">
                <Link
                    to="/"
                    className="flex items-center text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-1" />
                    <span className="text-sm font-medium">Beranda</span>
                </Link>
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                        <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col leading-tight">
                        <span className="text-xs font-bold text-blue-600 tracking-wide uppercase">SPMB</span>
                        <span className="text-xs font-bold text-blue-600 tracking-wide uppercase">SMANSABA</span>
                    </div>
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center px-4 py-8 w-full max-w-2xl mx-auto">
                {!timeLeft.isExpired ? (
                    /* Countdown View */
                    <div className="w-full space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex justify-center">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 border border-blue-600/20 shadow-sm">
                                <Clock className="w-4 h-4" />
                                <span className="text-xs font-semibold uppercase tracking-wide">Menunggu Waktu Pengumuman</span>
                            </span>
                        </div>

                        <div className="text-center space-y-2">
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                                Pengumuman Hasil SPMB
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium">
                                {tahap} - Tahun Ajaran {tahunAjaran}
                            </p>
                        </div>

                        <div className="w-full bg-white dark:bg-slate-800 rounded-2xl px-3 py-6 md:p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-none dark:border dark:border-slate-700 transition-colors duration-300">
                            <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-6">
                                {[
                                    { label: 'Hari', value: timeLeft.days },
                                    { label: 'Jam', value: timeLeft.hours },
                                    { label: 'Menit', value: timeLeft.minutes },
                                    { label: 'Detik', value: timeLeft.seconds }
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col items-center">
                                        <div className={`w-full min-h-[90px] sm:min-h-[110px] md:min-h-[130px] bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-inner mb-2 group hover:border-blue-600/50 transition-colors relative overflow-hidden px-4`}>
                                            {item.label === 'Detik' && (
                                                <div className="absolute inset-0 bg-blue-600/5 animate-pulse rounded-xl"></div>
                                            )}
                                            <span className={`text-4xl sm:text-5xl md:text-6xl font-['Orbitron'] ${item.label === 'Detik' ? 'text-blue-600' : 'text-slate-900 dark:text-slate-100'} group-hover:text-blue-600 transition-colors leading-none tabular-nums relative z-10`}>
                                                {String(item.value).padStart(2, '0')}
                                            </span>
                                        </div>
                                        <span className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="w-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3 shadow-sm transition-colors duration-300">
                            <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
                                <span className="font-bold">Info:</span> Hasil seleksi akan dapat diakses setelah waktu pengumuman tiba.
                            </p>
                        </div>
                    </div>
                ) : (
                    /* Search/Result View */
                    <div className="w-full space-y-6 animate-in fade-in duration-500">
                        {!result || !result.found ? (
                            <>
                                <div className="flex justify-center mb-6">
                                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 border border-blue-600/20 shadow-sm">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span className="text-xs font-semibold uppercase tracking-wide">Pengumuman Terbuka</span>
                                    </span>
                                </div>

                                <div className="text-center mb-8 space-y-2">
                                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                                        Cek Hasil SPMB
                                    </h1>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium">
                                        Masukkan NISN untuk melihat hasil seleksi
                                    </p>
                                </div>

                                <Card className="border-slate-200 dark:border-slate-700 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                                    <CardContent className="p-6 space-y-5">
                                        <form onSubmit={handleSearch} className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">NISN (10 Digit)</label>
                                                <div className="relative">
                                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <Input
                                                        placeholder="Contoh: 0012345678"
                                                        className="h-12 pl-10 pr-16 text-base border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:ring-blue-600 rounded-lg bg-slate-50 dark:bg-slate-900"
                                                        value={searchQuery}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                                                            setSearchQuery(val)
                                                        }}
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium tabular-nums">
                                                        {searchQuery.length}/10
                                                    </span>
                                                </div>
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={isSearching || searchQuery.length !== 10}
                                                className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg shadow-blue-600/20"
                                            >
                                                {isSearching ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Search className="w-4 h-4 mr-2" />
                                                        Cek Hasil
                                                    </>
                                                )}
                                            </Button>
                                        </form>

                                        {/* Not Found Message */}
                                        {!result?.found && result !== null && (
                                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center">
                                                <XCircle className="w-5 h-5 text-red-500 mx-auto mb-2" />
                                                <p className="text-red-700 dark:text-red-400 text-sm font-medium">Data tidak ditemukan</p>
                                            </div>
                                        )}

                                        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Petunjuk:</p>
                                            <ul className="text-xs text-slate-500 space-y-1 list-disc pl-4">
                                                <li>NISN harus terdiri dari 10 digit angka</li>
                                                <li>Data diperbarui secara real-time</li>
                                            </ul>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            /* Result Card View */
                            <div className="animate-in fade-in zoom-in-95 duration-300 w-full">
                                <Card className={`border-2 shadow-xl rounded-2xl overflow-hidden bg-white dark:bg-slate-800 ${result.status === 'LULUS' ? 'border-blue-200 dark:border-blue-900' : 'border-red-200 dark:border-red-900'}`}>
                                    <div className={`p-8 text-center ${result.status === 'LULUS' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 shadow-sm ${result.status === 'LULUS' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'}`}>
                                            {result.status === 'LULUS' ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                                        </div>
                                        <h2 className={`text-2xl font-black tracking-tight ${result.status === 'LULUS' ? 'text-blue-900 dark:text-blue-100' : 'text-red-900 dark:text-red-100'}`}>
                                            {result.status === 'LULUS' ? 'SELAMAT! ANDA LULUS' : 'MOHON MAAF'}
                                        </h2>
                                        <p className={`text-sm font-medium mt-1 ${result.status === 'LULUS' ? 'text-blue-700 dark:text-blue-300' : 'text-red-700 dark:text-red-300'}`}>
                                            {result.status === 'LULUS' ? 'Pendaftaran SMAN 1 Bantarujeg' : 'Anda belum diterima di tahap ini'}
                                        </p>
                                    </div>

                                    <CardContent className="p-6 space-y-6">
                                        <div className="grid grid-cols-1 gap-4">
                                            {[
                                                { label: 'Nama Lengkap', value: result.name, icon: User },
                                                { label: 'NISN', value: result.nisn, icon: Hash },
                                                { label: 'Asal Sekolah', value: result.sekolahAsal, icon: GraduationCap },
                                                { label: 'Jalur', value: result.jalur, icon: Trophy }
                                            ].map((info, idx) => (
                                                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                                                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-slate-400">
                                                        <info.icon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{info.label}</p>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase">{info.value || '-'}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            {result.status === 'LULUS' && (
                                                <Button
                                                    onClick={() => generateCoverMapPDF(result)}
                                                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30"
                                                >
                                                    <Printer className="w-4 h-4 mr-2" />
                                                    Cetak Bukti Kelulusan
                                                </Button>
                                            )}
                                            <Button
                                                onClick={() => setResult(null)}
                                                variant="outline"
                                                className="w-full h-12 border-slate-200 dark:border-slate-700 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700"
                                            >
                                                <RotateCcw className="w-4 h-4 mr-2" />
                                                Kembali
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <footer className="w-full py-6 px-4 text-center mt-auto border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-300">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">
                    © 2026 SPMB Online SMAN 1 Bantarujeg
                </p>
                <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 font-bold tracking-widest uppercase">
                    Made with <span className="text-red-500">❤</span> by
                    <a
                        className="text-slate-900 dark:text-slate-100 hover:text-blue-600 transition-colors flex items-center gap-1"
                        href="https://instagram.com/deni_ikbal"
                        target="_blank"
                        rel="noreferrer"
                    >
                        deni_ikbal
                    </a>
                </div>
            </footer>
        </div>
    )
}
