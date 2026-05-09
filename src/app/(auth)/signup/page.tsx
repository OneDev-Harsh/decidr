"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { insforge } from "@/lib/insforge";
import { ArrowRight, Loader2 } from "lucide-react";

export default function SignUpPage() {
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
    const name = formData.get("name") as string;

    const { data, error: authError } = await insforge.auth.signUp({
      email,
      password,
      name,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data?.requireEmailVerification) {
      router.push("/verify-email?email=" + encodeURIComponent(email));
    } else {
      router.push("/dashboard");
    }
  }

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

        <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-white">Create an account</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your details to get started with Decidr
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-400" htmlFor="name">Full Name</label>
                <Input id="name" name="name" placeholder="John Doe" required />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-400" htmlFor="email">Email</label>
                <Input id="email" name="email" type="email" placeholder="m@example.com" required />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-400" htmlFor="password">Password</label>
                <Input id="password" name="password" type="password" required />
              </div>
              {error && (
                <div className="text-sm text-brand-crimson font-medium bg-brand-crimson/10 p-3 rounded-md border border-brand-crimson/20">
                  {error}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button className="w-full group" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Sign Up
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
              <div className="text-sm text-gray-400 text-center">
                Already have an account?{" "}
                <Link href="/login" className="text-brand-crimson hover:underline font-medium">
                  Sign In
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
