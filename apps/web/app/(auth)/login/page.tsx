"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Eye, EyeOff, Leaf, Loader2, ShieldCheck } from "lucide-react";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";

// ─── Validation Schema ────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Component ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validate form data
    const result = loginSchema.safeParse({ email, password, rememberMe });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.issues.forEach((err) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    
    setErrors({});
    setIsLoading(true);
    setServerError(null);

    try {
      const persistence = result.data.rememberMe
        ? browserLocalPersistence
        : browserSessionPersistence;
      await setPersistence(auth, persistence);
      await signInWithEmailAndPassword(
        auth,
        result.data.email,
        result.data.password
      );
      router.push("/dashboard");
    } catch (error: any) {
      const code = error?.code as string | undefined;
      if (code === "auth/invalid-credential" || code === "auth/user-not-found") {
        setServerError("Invalid email or password. Please try again.");
      } else if (code === "auth/too-many-requests") {
        setServerError("Too many attempts. Please try again later.");
      } else {
        setServerError("Sign in failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F7F4] flex flex-col">
      {/* ── Header bar ── */}
      <header className="h-14 flex items-center px-6 border-b border-[#D6E4D6] bg-white">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#1A5C2A] flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-[#1A5C2A] text-sm tracking-tight">
            AgriSense
          </span>
        </Link>
      </header>

      {/* ── Main card ── */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Hero badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 bg-[#E8F5E9] border border-[#A5D6A7] rounded-full px-4 py-1.5">
              <div className="w-2 h-2 rounded-full bg-[#1A5C2A]" />
              <span className="text-xs font-medium text-[#1A5C2A]">
                Smart Agriculture Platform
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#D6E4D6] shadow-sm overflow-hidden">
            {/* Green top strip */}
            <div className="bg-[#1A5C2A] px-8 pt-8 pb-7 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white mb-1">
                Welcome back
              </h1>
              <p className="text-sm text-white/60">
                Sign in to your AgriSense account
              </p>
            </div>

            {/* Form area */}
            <div className="px-8 py-7">
              {/* Server error */}
              {serverError && (
                <div className="mb-5 flex items-start gap-3 bg-[#FCEBEB] border border-[#F7C1C1] rounded-xl p-3.5">
                  <div className="w-5 h-5 rounded-full bg-[#A32D2D] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <p className="text-sm text-[#791F1F]">{serverError}</p>
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="text-sm font-medium text-[#374151] block mb-1.5">
                    Email address
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="farmer@example.com"
                    autoComplete="email"
                    disabled={isLoading}
                    className={cn(
                      "h-11 rounded-xl border-[#D6E4D6] bg-[#F9FCF9] text-sm",
                      "placeholder:text-[#9CA3AF]",
                      "focus-visible:ring-[#1A5C2A] focus-visible:ring-1 focus-visible:border-[#1A5C2A]",
                      "hover:border-[#86BFAA] transition-colors",
                      errors.email &&
                        "border-[#F7C1C1] bg-[#FFFAFA] focus-visible:ring-[#A32D2D] focus-visible:border-[#A32D2D]"
                    )}
                  />
                  {errors.email && (
                    <p className="text-xs text-[#A32D2D] mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-[#374151]">
                      Password
                    </label>
                    <Link
                      href="#"
                      className="text-xs text-[#1A5C2A] hover:text-[#2E7D32] font-medium transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={isLoading}
                      className={cn(
                        "h-11 rounded-xl border-[#D6E4D6] bg-[#F9FCF9] text-sm pr-10",
                        "placeholder:text-[#9CA3AF]",
                        "focus-visible:ring-[#1A5C2A] focus-visible:ring-1 focus-visible:border-[#1A5C2A]",
                        "hover:border-[#86BFAA] transition-colors",
                        errors.password &&
                          "border-[#F7C1C1] bg-[#FFFAFA] focus-visible:ring-[#A32D2D] focus-visible:border-[#A32D2D]"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#1A5C2A] transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-[#A32D2D] mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Remember me */}
                <div className="flex items-center gap-2.5">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    disabled={isLoading}
                    className="border-[#D6E4D6] data-[state=checked]:bg-[#1A5C2A] data-[state=checked]:border-[#1A5C2A] rounded"
                  />
                  <label
                    htmlFor="rememberMe"
                    className="text-sm text-[#6B7280] cursor-pointer font-normal"
                  >
                    Remember me for 30 days
                  </label>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl bg-[#1A5C2A] hover:bg-[#154921] text-white text-sm font-medium transition-all active:scale-[0.98] mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E5EDE5]" />
                </div>
                <div className="relative flex justify-center text-xs text-[#9CA3AF] bg-white px-3">
                  New to AgriSense?
                </div>
              </div>

              <Link href="/signup">
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-xl border-[#D6E4D6] text-[#1A5C2A] text-sm font-medium hover:bg-[#F0F9F0] hover:border-[#A5D6A7] transition-all"
                >
                  Create a free account
                </Button>
              </Link>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-[#9CA3AF]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#86BFAA]" />
            <span>Protected by Firebase Auth · End-to-end encrypted</span>
          </div>
        </div>
      </main>
    </div>
  );
}