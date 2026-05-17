"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { insforge } from "@/lib/insforge";
import { AuthInput, AuthButton } from "@/components/auth/AuthUI";
import { ArrowRight, GitMerge, Share2 } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { data, error: authError } = await insforge.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data?.accessToken) {
      document.cookie = `insforge-auth-token=${data.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get("redirect") || "/dashboard";
      window.location.href = redirectTo;
    }
  }

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-semibold tracking-tight text-white"
        >
          Sign In
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-zinc-500 text-[14px]"
        >
          Enter your credentials to continue.
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
          <AuthInput 
            id="email" 
            name="email" 
            label="Email" 
            type="email" 
            placeholder="name@example.com" 
            required 
          />
          <div className="space-y-2">
            <AuthInput 
              id="password" 
              name="password" 
              label="Password" 
              type="password" 
              placeholder="••••••••"
              required 
            />
            <div className="flex justify-end">
              <Link href="/forgot-password" title="Coming soon" className="text-[11px] uppercase tracking-widest font-bold text-zinc-600 hover:text-brand-crimson transition-colors">
                Forgot Password?
              </Link>
            </div>
          </div>
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

        <div className="pt-2">
          <AuthButton loading={loading}>
            Sign In
          </AuthButton>
        </div>
      </motion.form>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-center text-zinc-600 text-[12px] font-medium pt-4"
      >
        Don't have an account?{" "}
        <Link href="/signup" className="text-white hover:text-brand-crimson transition-colors underline underline-offset-4 decoration-zinc-800 hover:decoration-brand-crimson">
          Sign Up
        </Link>
      </motion.p>
    </div>
  );
}
