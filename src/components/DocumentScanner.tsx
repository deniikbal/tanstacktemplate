import React, { useState, useRef, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Camera, RefreshCw, Check, X, Scissors, Loader2, RotateCw } from 'lucide-react'
import { jsPDF } from 'jspdf'

interface DocumentScannerProps {
    isOpen: boolean
    onClose: () => void
    onUpload: (file: File) => Promise<void>
    title: string
}

export function DocumentScanner({ isOpen, onClose, onUpload, title }: DocumentScannerProps) {
    const [image, setImage] = useState<string | null>(null)
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
    const [isCameraActive, setIsCameraActive] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)

    const videoRef = useRef<HTMLVideoElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    const startCamera = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('Kamera tidak tersedia. Pastikan Anda menggunakan HTTPS atau localhost.')
            onClose()
            return
        }

        try {
            const constraints: MediaStreamConstraints = {
                video: {
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            }

            let stream: MediaStream
            try {
                // Try with ideal environment camera first
                stream = await navigator.mediaDevices.getUserMedia(constraints)
            } catch (err) {
                // Fallback to any camera if environment camera fails
                console.warn('Environment camera failed, falling back to any camera:', err)
                stream = await navigator.mediaDevices.getUserMedia({ video: true })
            }

            streamRef.current = stream

            // Wait for ref to be ready if it's not yet
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                setIsCameraActive(true)
            } else {
                // If ref is not ready, we still mark as active so the video tag renders
                // then we'll attach the stream in a separate effect
                setIsCameraActive(true)
            }
        } catch (err) {
            console.error('Error accessing camera:', err)
            alert('Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.')
            onClose()
        }
    }

    // Effect to attach stream whenever video component is mounted and camera is active
    React.useEffect(() => {
        if (isCameraActive && streamRef.current && videoRef.current && !videoRef.current.srcObject) {
            videoRef.current.srcObject = streamRef.current
        }
    }, [isCameraActive])

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
        setIsCameraActive(false)
    }

    const capturePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas')
            canvas.width = videoRef.current.videoWidth
            canvas.height = videoRef.current.videoHeight
            const ctx = canvas.getContext('2d')
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0)
                setImage(canvas.toDataURL('image/jpeg', 0.8))
                stopCamera()
            }
        }
    }

    const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image()
            image.addEventListener('load', () => resolve(image))
            image.addEventListener('error', (error) => reject(error))
            image.setAttribute('crossOrigin', 'anonymous')
            image.src = url
        })

    const getCroppedImg = async (imageSrc: string, pixelCrop: any, rotation = 0): Promise<Blob> => {
        const image = await createImage(imageSrc)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) throw new Error('No 2d context')

        const rotRad = (rotation * Math.PI) / 180
        const { width: bWidth, height: bHeight } = {
            width: Math.abs(Math.cos(rotRad) * image.width) + Math.abs(Math.sin(rotRad) * image.height),
            height: Math.abs(Math.sin(rotRad) * image.width) + Math.abs(Math.cos(rotRad) * image.height),
        }

        canvas.width = bWidth
        canvas.height = bHeight

        ctx.translate(bWidth / 2, bHeight / 2)
        ctx.rotate(rotRad)
        ctx.translate(-image.width / 2, -image.height / 2)
        ctx.drawImage(image, 0, 0)

        const data = ctx.getImageData(
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height
        )

        canvas.width = pixelCrop.width
        canvas.height = pixelCrop.height

        ctx.putImageData(data, 0, 0)

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (blob) resolve(blob)
            }, 'image/jpeg', 0.8)
        })
    }

    const handleProcessAndUpload = async () => {
        if (!image || !croppedAreaPixels) return

        setIsProcessing(true)
        try {
            const croppedBlob = await getCroppedImg(image, croppedAreaPixels, rotation)
            const reader = new FileReader()

            reader.onloadend = async () => {
                const base64data = reader.result as string

                // Generate PDF
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                })

                const imgProps = pdf.getImageProperties(base64data)
                const pdfWidth = pdf.internal.pageSize.getWidth()
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

                pdf.addImage(base64data, 'JPEG', 0, 0, pdfWidth, pdfHeight)

                const pdfBlob = pdf.output('blob')
                const file = new File([pdfBlob], 'document_scan.pdf', { type: 'application/pdf' })

                onUpload(file)
                onClose()
                setImage(null)
                setRotation(0)
            }

            reader.readAsDataURL(croppedBlob)
        } catch (err) {
            console.error('Processing error:', err)
            alert('Gagal memproses gambar.')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleClose = () => {
        stopCamera()
        setImage(null)
        setRotation(0)
        onClose()
    }

    React.useEffect(() => {
        if (isOpen && !image && !isCameraActive) {
            startCamera()
        }
        return () => stopCamera()
    }, [isOpen, image])

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[100vw] w-screen h-[100vh] sm:h-[90vh] sm:max-w-[600px] flex flex-col p-0 overflow-hidden sm:rounded-3xl border-none shadow-2xl bg-slate-950">
                <DialogHeader className="p-4 sm:p-6 bg-white border-b shrink-0 h-20 sm:h-auto flex flex-col justify-center">
                    <DialogTitle className="text-base sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Scissors className="w-5 h-5 text-blue-600" />
                        Scan {title}
                    </DialogTitle>
                    <DialogDescription className="text-[10px] sm:text-xs text-slate-500">Ambil foto dokumen & simpan sebagai PDF.</DialogDescription>
                </DialogHeader>

                <div className="flex-1 relative bg-slate-950 overflow-hidden">
                    {!image && isCameraActive && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-x-6 inset-y-16 sm:inset-x-8 sm:inset-y-20 border-2 border-white/30 rounded-xl pointer-events-none">
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1 rounded-tl-md"></div>
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1 rounded-tr-md"></div>
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1 rounded-bl-md"></div>
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1 rounded-br-md"></div>
                            </div>
                        </div>
                    )}

                    {image && (
                        <div className="absolute inset-0">
                            <Cropper
                                image={image}
                                crop={crop}
                                zoom={zoom}
                                rotation={rotation}
                                aspect={1 / 1.414} // A4 Aspect Ratio
                                onCropChange={setCrop}
                                onRotationChange={setRotation}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>
                    )}

                    {!isCameraActive && !image && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center space-y-3">
                                <Loader2 className="w-10 h-10 text-white animate-spin mx-auto" />
                                <p className="text-white/50 text-[10px] font-medium tracking-wider">MENGAKTIFKAN KAMERA...</p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-4 sm:p-6 bg-white border-t flex flex-row items-center justify-between gap-3 shrink-0">
                    {image ? (
                        <>
                            <div className="flex gap-2 shrink-0">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => { setImage(null); startCamera(); setRotation(0); }}
                                    className="rounded-xl border-slate-200 h-10 sm:h-11"
                                >
                                    <RefreshCw className="w-3.5 h-3.5 mr-1.5 sm:mr-2" />
                                    <span className="text-xs sm:text-sm">Ulang</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                                    className="rounded-xl border-slate-200 h-10 sm:h-11"
                                >
                                    <RotateCw className="w-3.5 h-3.5 mr-1.5 sm:mr-2" />
                                    <span className="text-xs sm:text-sm">Putar</span>
                                </Button>
                            </div>
                            <Button
                                onClick={handleProcessAndUpload}
                                disabled={isProcessing}
                                size="sm"
                                className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 h-10 sm:h-11"
                            >
                                {isProcessing ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <Check className="w-4 h-4 mr-2" />
                                )}
                                <span className="text-xs sm:text-sm">Simpan & Upload</span>
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClose}
                                className="rounded-xl border-slate-200 h-10 sm:h-11"
                            >
                                <X className="w-4 h-4 mr-1.5 sm:mr-2" />
                                <span className="text-xs sm:text-sm">Batal</span>
                            </Button>
                            <Button
                                onClick={capturePhoto}
                                size="sm"
                                className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 h-11 sm:h-12 font-bold px-4 sm:px-8 transition-transform active:scale-95"
                            >
                                <Camera className="w-5 h-5 mr-1.5 sm:mr-2" />
                                <span className="text-sm sm:text-base">Ambil Foto Dokumen</span>
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
