"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { insforge } from "@/lib/insforge";
import { ArrowRight, Loader2, Mail } from "lucide-react";
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
      router.push("/dashboard");
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
    <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
      <CardHeader className="space-y-1 text-center pb-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-maroon/20 mb-4">
          <Mail className="h-6 w-6 text-brand-crimson" />
        </div>
        <CardTitle className="text-2xl font-bold text-white">Check your email</CardTitle>
        <CardDescription className="text-gray-400">
          We've sent a 6-digit verification code to <br />
          <span className="font-medium text-white">{email || "your email"}</span>
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          {!emailParam && (
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-400" htmlFor="email">Email</label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          )}
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-400" htmlFor="otp">Verification Code</label>
            <Input 
              id="otp" 
              name="otp" 
              type="text" 
              placeholder="123456" 
              maxLength={6}
              className="text-center text-lg tracking-widest font-mono"
              required 
            />
          </div>
          
          {error && (
            <div className="text-sm text-brand-crimson font-medium bg-brand-crimson/10 p-3 rounded-md border border-brand-crimson/20">
              {error}
            </div>
          )}
          {message && (
            <div className="text-sm text-emerald-500 font-medium bg-emerald-500/10 p-3 rounded-md border border-emerald-500/20">
              {message}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full group" disabled={loading || !email}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                Verify Email
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
          <div className="text-sm text-gray-400 text-center flex flex-col gap-2">
            <div>
              Didn't receive the code?{" "}
              <button 
                type="button" 
                onClick={handleResend}
                disabled={resendLoading || !email}
                className="text-brand-crimson hover:underline font-medium disabled:opacity-50"
              >
                {resendLoading ? "Sending..." : "Resend"}
              </button>
            </div>
            <div>
              <Link href="/login" className="text-gray-500 hover:text-white transition-colors">
                Back to sign in
              </Link>
            </div>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6 py-12">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] bg-brand-maroon/10 blur-[150px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="h-10 w-10 rounded bg-brand-maroon flex items-center justify-center">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">Decidr</span>
          </Link>
        </div>

        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-brand-crimson" /></div>}>
          <VerifyEmailForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
