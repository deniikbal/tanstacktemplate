import { Loader2 } from "lucide-react"

export function LoadingSpinner() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-slate-50/50">
            <div className="relative flex items-center justify-center">
                {/* Outer Glow */}
                <div className="absolute h-12 w-12 animate-ping rounded-full bg-emerald-400/20 duration-1000" />

                {/* Main Spinner */}
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            </div>

            <div className="flex flex-col items-center gap-1">
                <p className="text-sm font-medium text-slate-600 animate-pulse">
                    Menyiapkan Dashboard...
                </p>
                <div className="h-1 w-24 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-full origin-left animate-progress bg-emerald-500" />
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes progress {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(0.7); }
          100% { transform: scaleX(1); }
        }
        .animate-progress {
          animation: progress 2s infinite ease-in-out;
        }
      `}} />
        </div>
    )
}
