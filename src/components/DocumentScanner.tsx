import React, { useState, useRef, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Camera, RefreshCw, Check, X, Scissors, Loader2 } from 'lucide-react'
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

    const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob> => {
        const image = await createImage(imageSrc)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) throw new Error('No 2d context')

        canvas.width = pixelCrop.width
        canvas.height = pixelCrop.pixelCropHeight || pixelCrop.height

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        )

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
            const croppedBlob = await getCroppedImg(image, croppedAreaPixels)
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

                await onUpload(file)
                onClose()
                setImage(null)
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
            <DialogContent className="sm:max-w-[600px] h-[90vh] flex flex-col p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
                <DialogHeader className="p-6 bg-white border-b shrink-0">
                    <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Scissors className="w-5 h-5 text-blue-600" />
                        Scan {title}
                    </DialogTitle>
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
                            <div className="absolute inset-x-8 inset-y-20 border-2 border-white/50 rounded-xl pointer-events-none">
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
                                aspect={1 / 1.414} // A4 Aspect Ratio
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>
                    )}

                    {!isCameraActive && !image && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="w-10 h-10 text-white animate-spin" />
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 bg-white border-t flex flex-row items-center justify-between sm:justify-between gap-4 shrink-0">
                    {image ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => { setImage(null); startCamera(); }}
                                className="rounded-xl border-slate-200"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Ulang Foto
                            </Button>
                            <Button
                                onClick={handleProcessAndUpload}
                                disabled={isProcessing}
                                className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100"
                            >
                                {isProcessing ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <Check className="w-4 h-4 mr-2" />
                                )}
                                Simpan & Upload
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                className="rounded-xl border-slate-200"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Batal
                            </Button>
                            <Button
                                onClick={capturePhoto}
                                className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 h-12 px-8 font-bold"
                            >
                                <Camera className="w-5 h-5 mr-2" />
                                Ambil Foto
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
