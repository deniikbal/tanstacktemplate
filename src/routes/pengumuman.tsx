import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import QRCode from 'qrcode'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { QRCodeSVG } from 'qrcode.react'

import { Download } from 'lucide-react'
import { getActiveTahunAjaran } from '@/lib/server/tahun-ajaran'
import { checkAnnouncement } from '@/lib/server/students'
import { Badge } from '@/components/ui/badge'


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

    const calculateTimeLeft = (target: number) => {
        const now = new Date().getTime()
        const distance = target - now

        if (distance <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
        }

        return {
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000),
            isExpired: false
        }
    }

    const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate))

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

        // Initial check
        const initial = calculateTimeLeft(targetDate)
        if (initial.isExpired) {
            setTimeLeft(initial)
            return
        }

        const timer = setInterval(() => {
            const next = calculateTimeLeft(targetDate)
            setTimeLeft(next)

            if (next.isExpired) {
                clearInterval(timer)
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [isMounted, targetDate])

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
                img.crossOrigin = 'anonymous'

                const timeout = setTimeout(() => {
                    reject(`Timeout loading image: ${url}`)
                }, 5000)

                img.onload = () => {
                    clearTimeout(timeout)
                    try {
                        const canvas = document.createElement('canvas')
                        canvas.width = img.width
                        canvas.height = img.height
                        const ctx = canvas.getContext('2d')
                        if (ctx) {
                            ctx.drawImage(img, 0, 0)
                            resolve(canvas.toDataURL('image/png'))
                        } else {
                            reject('Failed to get canvas context')
                        }
                    } catch (error) {
                        reject(`Error converting image: ${error}`)
                    }
                }

                img.onerror = (e) => {
                    clearTimeout(timeout)
                    reject(`Failed to load image from ${url}: ${e}`)
                }

                // Gunakan path absolute dengan window.location.origin
                img.src = `${window.location.origin}${url}`
            })
        }

        try {
            // Defensive data handling
            const safeName = (data.name || 'SISWA').toUpperCase()
            const safeNisn = data.nisn || '-'
            const safeSekolah = (data.sekolahAsal || '-').toUpperCase()
            const safeRegNo = data.regNo || '-'
            const safeJalur = (data.jalur || '-').toUpperCase()
            const safeGender = data.jenisKelamin || '-'
            const safeStatus = data.status || 'LULUS'

            doc.setDrawColor(0)
            doc.setLineWidth(0.5)
            doc.rect(5, 5, pageWidth - 10, 170, 'S')

            // Try to load logos, but continue even if they fail
            let logoJabar: string | null = null
            let logoSpmb: string | null = null

            try {
                logoJabar = await getBase64ImageFromURL('/logo-pemprov.png')
            } catch (err) {
                console.warn('Failed to load logo-pemprov.png:', err)
            }

            try {
                logoSpmb = await getBase64ImageFromURL('/logo-spmb.png')
            } catch (err) {
                console.warn('Failed to load logo-spmb.png:', err)
            }

            const totalLogoWidth = 47
            const startX = (pageWidth - totalLogoWidth) / 2

            if (logoJabar) {
                doc.addImage(logoJabar, 'PNG', startX, 10, 25, 21)
            }
            if (logoSpmb) {
                doc.addImage(logoSpmb, 'PNG', startX + 26, 10, 40, 21)
            }

            doc.setFont('helvetica', 'bold')
            doc.setFontSize(18)
            doc.text('SPMB SMAN 1 BANTARUJEG', pageWidth / 2, 45, { align: 'center' })
            doc.setFontSize(12)
            doc.text(`TAHAP 2 TAHUN AJAR 2025/2026`, pageWidth / 2, 51, { align: 'center' })

            doc.setFillColor(25, 118, 210)
            const jalurText = `JALUR : ${safeJalur}`
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
                ['No. Pendaftar', `: ${safeRegNo}`],
                ['NISN', `: ${safeNisn}`],
                ['Nama Lengkap', `: ${safeName}`],
                ['Jenis Kelamin', `: ${safeGender}`],
                ['Asal Sekolah', `: ${safeSekolah}`],
                ['Status', `: ${safeStatus}`]
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

            let qrCodeBase64 = ''
            try {
                qrCodeBase64 = await QRCode.toDataURL(safeNisn !== '-' ? safeNisn : 'SPMB-SMANSABA', {
                    margin: 4,
                    width: 300,
                    errorCorrectionLevel: 'H'
                })
                doc.addImage(qrCodeBase64, 'PNG', pageWidth - 60, 85, 35, 35)
            } catch (e) {
                console.error('QR generation failed:', e)
            }

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

            if (logoJabar) {
                doc.addImage(logoJabar, 'PNG', startX, 15, 21, 21)
            }
            if (logoSpmb) {
                doc.addImage(logoSpmb, 'PNG', startX + 26, 15, 40, 21)
            }
            doc.setFillColor(103, 185, 235)
            doc.rect(margin, 52, pageWidth - margin * 2, 8, 'F')
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(16)
            doc.setTextColor(30, 30, 30)
            doc.text('Pengumuman Hasil Seleksi SPMB Jawa Barat 2025 Tahap 2', pageWidth / 2, 72, { align: 'center' })
            const contentY = 85
            if (qrCodeBase64) {
                doc.addImage(qrCodeBase64, 'PNG', margin, contentY, 40, 40)
            }
            doc.setFontSize(11)
            doc.setFont('helvetica', 'normal')
            doc.text('No. Pendaftar', margin + 50, contentY + 4)
            doc.text('Nama', margin + 50, contentY + 11)
            doc.text('Asal Sekolah', margin + 50, contentY + 18)
            doc.text(`: ${safeRegNo}`, margin + 85, contentY + 4)
            doc.setFont('helvetica', 'bold')
            doc.text(`: ${safeName}`, margin + 85, contentY + 11)
            doc.setFont('helvetica', 'normal')
            doc.text(`: ${safeSekolah}`, margin + 85, contentY + 18)
            doc.setFontSize(12)
            doc.text('Selamat! Anda dinyatakan Diterima di:', margin + 50, contentY + 32)
            doc.setFontSize(15)
            doc.setFont('helvetica', 'bold')
            const resultText = `SMAN 1 BANTARUJEG - ${safeJalur}`
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

            const fileName = `Pengumuman_${safeName.replace(/\s+/g, '_')}.pdf`
            doc.save(fileName)
        } catch (error: any) {
            console.error('PDF generation failed:', error)
            alert(`Gagal membuat PDF: ${error.message || error}`)
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
        <div className="antialiased min-h-screen flex flex-col font-sans transition-colors duration-300 relative">
            {/* Background Image with Blur */}
            <div
                className="fixed inset-0 z-0"
                style={{
                    backgroundImage: 'url(/background.jpeg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    filter: 'blur(8px)',
                    transform: 'scale(1.1)',
                }}
            />
            {/* Dark overlay for readability */}
            <div className="fixed inset-0 z-0 bg-slate-900/60" />

            <main className="flex-grow flex items-center justify-center py-10 md:py-20 px-4 sm:px-6 lg:px-8 relative z-10">

                {!timeLeft.isExpired ? (
                    /* Countdown View */
                    <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex justify-center">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white/15 backdrop-blur-sm text-white border border-white/20 shadow-sm">
                                <span className="material-icons-round text-base">schedule</span>
                                <span className="text-xs font-semibold uppercase tracking-wide">Menunggu Waktu Pengumuman</span>
                            </span>
                        </div>

                        <div className="text-center space-y-2">
                            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight drop-shadow-md">
                                Pengumuman Hasil SPMB
                            </h1>
                            <p className="text-slate-200 text-sm md:text-base font-medium">
                                {tahap} - Tahun Ajaran {tahunAjaran}
                            </p>
                        </div>

                        <div className="w-full bg-white dark:bg-slate-800 rounded-md px-3 py-6 md:p-6 shadow-sm dark:border dark:border-slate-700 transition-colors duration-300">
                            <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-6">
                                {[
                                    { label: 'Hari', value: timeLeft.days },
                                    { label: 'Jam', value: timeLeft.hours },
                                    { label: 'Menit', value: timeLeft.minutes },
                                    { label: 'Detik', value: timeLeft.seconds }
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col items-center">
                                        <div className={`w-full min-h-[90px] sm:min-h-[110px] md:min-h-[130px] bg-slate-50 dark:bg-slate-900 rounded-md flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-inner mb-2 group hover:border-blue-600/50 transition-colors relative overflow-hidden px-4`}>
                                            {item.label === 'Detik' && (
                                                <div className="absolute inset-0 bg-blue-600/5 animate-pulse rounded-xl"></div>
                                            )}
                                            <span className={`text-4xl sm:text-5xl md:text-6xl font-['Orbitron'] ${item.label === 'Detik' ? 'text-blue-600' : 'text-slate-900 dark:text-slate-100'} group-hover:text-blue-600 transition-colors leading-none tabular-nums relative z-10`}>
                                                {String(item.value).padStart(2, '0')}
                                            </span>
                                        </div>
                                        <span className="text-[10px] md:text-xs text-slate-200 uppercase tracking-wider font-semibold">
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="w-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4 flex items-start gap-3 shadow-sm transition-colors duration-300">
                            <span className="material-icons-round text-blue-600 flex-shrink-0 mt-0.5">lightbulb</span>
                            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
                                <span className="font-bold">Info:</span> Hasil seleksi akan dapat diakses setelah waktu pengumuman tiba.
                            </p>
                        </div>
                    </div>
                ) : (
                    /* Search/Result View */
                    <div className="w-full max-w-6xl">
                        {!result || !result.found ? (
                            /* Search Form */
                            <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
                                <div className="flex justify-center mb-6">
                                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white/15 backdrop-blur-sm text-white border border-white/20 shadow-sm">
                                        <span className="material-icons-round text-base">check_circle</span>
                                        <span className="text-xs font-semibold uppercase tracking-wide">Pengumuman Terbuka</span>
                                    </span>
                                </div>

                                <div className="text-center mb-8 space-y-2">
                                    <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight drop-shadow-md">
                                        Cek Hasil SPMB
                                    </h1>
                                    <p className="text-slate-300 text-sm md:text-base font-medium">
                                        Masukkan NISN untuk melihat hasil seleksi
                                    </p>
                                </div>

                                <Card className="border-slate-700/50 shadow-xl rounded-md overflow-hidden bg-slate-900/90 backdrop-blur-sm">
                                    <CardContent className="p-6 space-y-5">
                                        <form onSubmit={handleSearch} className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-300">NISN (10 Digit)</label>
                                                <div className="relative">
                                                    <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-base">tag</span>
                                                    <Input
                                                        placeholder="Contoh: 0012345678"
                                                        className="h-12 pl-10 pr-16 text-base text-white border-slate-600 focus:border-amber-500 focus:ring-amber-500 rounded-md bg-slate-800/80 placeholder:text-slate-500"
                                                        value={searchQuery}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/\\D/g, '').slice(0, 10)
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
                                                className="w-full h-12 text-base font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-md shadow-lg shadow-amber-500/20"
                                            >
                                                {isSearching ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <>
                                                        <span className="material-icons-round text-base mr-2">search</span>
                                                        Cek Hasil
                                                    </>
                                                )}
                                            </Button>
                                        </form>

                                        {/* Not Found Message */}
                                        {!result?.found && result !== null && (
                                            <div className="p-4 bg-red-900/30 border border-red-800/50 rounded-md text-center">
                                                <span className="material-icons-round text-red-400 text-xl mb-2 block">cancel</span>
                                                <p className="text-red-300 text-sm font-medium">Data tidak ditemukan</p>
                                            </div>
                                        )}

                                        <div className="pt-4 border-t border-slate-700/50">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Petunjuk:</p>
                                            <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                                                <li>NISN harus terdiri dari 10 digit angka</li>
                                                <li>Data diperbarui secara real-time</li>
                                            </ul>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            /* Result View - Simple Layout */
                            <div className="w-full max-w-5xl animate-in fade-in duration-500 space-y-6">
                                {/* Big Heading */}
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white drop-shadow-lg leading-tight">
                                    {result.status === 'LULUS' ? (
                                        <>SELAMAT! ANDA DINYATAKAN <span className="text-amber-400">LULUS</span> {tahunAjaran?.split('/')[0] || '2026'}</>
                                    ) : (
                                        <>MOHON MAAF, ANDA <span className="text-red-400">BELUM LULUS</span> {tahunAjaran?.split('/')[0] || '2026'}</>
                                    )}
                                </h1>

                                {/* Main Content Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                                    {/* Student Info Card - Dark */}
                                    <div className="lg:col-span-2 bg-slate-900/90 backdrop-blur-sm rounded-md border border-slate-700/50 p-6 md:p-8 space-y-6">
                                        {/* NISN & Name */}
                                        <div>
                                            <p className="text-slate-400 text-sm font-semibold tracking-wide mb-1">NISN {result.nisn || '-'}</p>
                                            <h2 className="text-2xl md:text-3xl font-black text-white uppercase">{result.name}</h2>
                                        </div>

                                        {/* Status Badge */}
                                        <div>
                                            <Badge className={`text-sm font-bold px-4 py-1.5 rounded-md border-none ${result.status === 'LULUS' ? 'bg-green-600 hover:bg-green-600 text-white' : 'bg-red-600 hover:bg-red-600 text-white'}`}>
                                                {result.status === 'LULUS' ? 'LULUS' : 'TIDAK LULUS'}
                                            </Badge>
                                        </div>

                                        {/* Info & QR Row */}
                                        <div className="flex flex-col sm:flex-row gap-8 items-start">
                                            {/* Info Grid */}
                                            <div className="grid grid-cols-2 gap-x-8 gap-y-5 flex-1 w-full">
                                                <div>
                                                    <p className="text-amber-500 text-xs font-bold uppercase tracking-wider mb-1">Tempat Lahir</p>
                                                    <p className="text-white text-base font-bold">{result.tempatLahir || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-amber-500 text-xs font-bold uppercase tracking-wider mb-1">Tanggal Lahir</p>
                                                    <p className="text-white text-base font-bold">
                                                        {result.tanggalLahir
                                                            ? new Date(result.tanggalLahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                                            : '-'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-amber-500 text-xs font-bold uppercase tracking-wider mb-1">Jalur</p>
                                                    <p className="text-white text-base font-bold">{result.jalur || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-amber-500 text-xs font-bold uppercase tracking-wider mb-1">Asal Sekolah</p>
                                                    <p className="text-white text-base font-bold">{result.sekolahAsal || '-'}</p>
                                                </div>
                                            </div>

                                            {/* QR Code */}
                                            {result.nisn && (
                                                <div className="flex-shrink-0 bg-white p-2.5 rounded-md shadow-lg border border-white/20 self-center sm:self-start group hover:scale-105 transition-transform duration-300">
                                                    <div className="bg-white p-1 rounded-md">
                                                        <QRCodeSVG 
                                                            value={result.nisn} 
                                                            size={90} 
                                                            level="H"
                                                            includeMargin={false}
                                                            imageSettings={{
                                                                src: "/school-logo.png", // If exists, otherwise remove
                                                                x: undefined,
                                                                y: undefined,
                                                                height: 20,
                                                                width: 20,
                                                                excavate: true,
                                                            }}
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-slate-900 font-black text-center mt-1.5 tracking-widest leading-none">
                                                        {result.nisn}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Sidebar */}
                                    <div className="lg:col-span-1 space-y-5">
                                        {result.status === 'LULUS' ? (
                                            /* Download Surat Card */
                                            <div className="bg-white/95 backdrop-blur-sm rounded-md p-6 space-y-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900">Unduh Surat Kelulusan</h3>
                                                    <p className="text-sm text-slate-500 mt-1">Surat kelulusan resmi tersedia untuk diunduh atau dilihat secara online.</p>
                                                </div>
                                                <div className="space-y-3">
                                                    <Button
                                                        onClick={() => generateCoverMapPDF(result)}
                                                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-amber-500/20"
                                                    >
                                                        <span className="material-icons-round text-lg">visibility</span>
                                                        Preview Surat
                                                    </Button>
                                                    <Button
                                                        onClick={() => generateCoverMapPDF(result)}
                                                        variant="outline"
                                                        className="w-full border-2 border-slate-300 text-slate-700 font-bold py-3 rounded-md flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-[0.98]"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        Download Surat
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Tidak Lulus Info Card */
                                            <div className="bg-white/95 backdrop-blur-sm rounded-md p-6 space-y-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900">Informasi Penting</h3>
                                                    <p className="text-sm text-slate-500 mt-1">Tetap semangat, masih banyak peluang lain menunggu Anda.</p>
                                                </div>
                                                <ul className="space-y-3 text-sm text-slate-600">
                                                    <li className="flex gap-2 items-start">
                                                        <span className="material-icons-round text-amber-500 text-lg mt-0.5">calendar_today</span>
                                                        <span>Pendaftaran Gelombang 2 akan dibuka pada tanggal 10 Juli 2026.</span>
                                                    </li>
                                                    <li className="flex gap-2 items-start">
                                                        <span className="material-icons-round text-blue-500 text-lg mt-0.5">support_agent</span>
                                                        <span>Hubungi panitia jika terdapat kesalahan data.</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        )}

                                        {/* Back Button */}
                                        <Button
                                            onClick={() => setResult(null)}
                                            variant="outline"
                                            className="w-full bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white font-bold py-3 rounded-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                                        >
                                            <span className="material-icons-round text-lg">arrow_back</span>
                                            Cari NISN Lain
                                        </Button>
                                    </div>
                                </div>

                                {/* Footer Note */}
                                <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-lg px-5 py-4">
                                    <p className="text-sm text-slate-300 leading-relaxed">
                                        Status kelulusan Anda sebagai siswa akan ditetapkan setelah sekolah melakukan verifikasi data akademik. Silakan hubungi pihak sekolah jika memerlukan informasi lebih lanjut.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
