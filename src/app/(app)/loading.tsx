import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-[#050505]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-b-2 border-brand-crimson animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-brand-crimson" />
          </div>
        </div>
        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em]">Loading</span>
      </div>
    </div>
  );
}
