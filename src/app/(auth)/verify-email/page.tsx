"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { insforge } from "@/lib/insforge";
import { AuthInput, AuthButton } from "@/components/auth/AuthUI";
import { ArrowRight, Loader2, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");
  
  const [email, setEmail] = useState(emailParam || "");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const otp = formData.get("otp") as string;

    const { data, error: authError } = await insforge.auth.verifyEmail({
      email,
      otp,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data?.accessToken) {
      document.cookie = `insforge-auth-token=${data.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      window.location.href = "/dashboard";
    }
  }

  async function handleResend() {
    if (!email) {
      setError("Email is required to resend verification code.");
      return;
    }
    setResendLoading(true);
    setError(null);
    setMessage(null);

    const { data, error: resendError } = await insforge.auth.resendVerificationEmail({
      email,
    });

    if (resendError) {
      setError(resendError.message);
    } else if (data?.success) {
      setMessage("Verification code has been resent to your email.");
    }
    setResendLoading(false);
  }

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-12 h-12 bg-brand-crimson/10 border border-brand-crimson/20 rounded-xl flex items-center justify-center mb-6"
        >
          <ShieldCheck className="h-6 w-6 text-brand-crimson" />
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-semibold tracking-tight text-white"
        >
          Verify Email
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-zinc-500 text-[14px] leading-relaxed"
        >
          We've sent a verification code to <span className="text-white font-medium">{email || "your email"}</span>.
        </motion.p>
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onSubmit={handleSubmit} 
        className="space-y-6"
      >
        <div className="space-y-4">
          {!emailParam && (
            <AuthInput 
              id="email" 
              name="email" 
              label="Email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          )}
          <AuthInput 
            id="otp" 
            name="otp" 
            label="Verification Code" 
            type="text" 
            placeholder="000000" 
            maxLength={6}
            className="text-center text-xl tracking-[0.5em] font-mono bg-zinc-900/50 border border-white/5 rounded-lg px-4 py-4 text-white outline-none focus:border-brand-crimson/50 transition-all"
            required 
          />
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[12px] font-bold uppercase tracking-wider text-brand-crimson bg-brand-crimson/5 border border-brand-crimson/20 p-4 rounded-lg flex items-center gap-3"
          >
            <div className="w-1 h-1 bg-brand-crimson rounded-full animate-pulse" />
            {error}
          </motion.div>
        )}

        {message && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[12px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-lg flex items-center gap-3"
          >
            <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
            {message}
          </motion.div>
        )}

        <div className="pt-2">
          <AuthButton loading={loading}>
            Verify Email
          </AuthButton>
        </div>
      </motion.form>

      <div className="flex flex-col items-center gap-4">
        <button 
          type="button" 
          onClick={handleResend}
          disabled={resendLoading || !email}
          className="text-[11px] uppercase tracking-widest font-bold text-zinc-500 hover:text-white transition-colors disabled:opacity-30"
        >
          {resendLoading ? "Sending..." : "Resend Code"}
        </button>
        
        <Link href="/login" className="text-[11px] uppercase tracking-widest font-bold text-zinc-700 hover:text-zinc-400 transition-colors">
          Cancel
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-brand-crimson" /></div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
