"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Leaf,
  Loader2,
  ShieldCheck,
  Mail,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ─── Validation Schema ────────────────────────────────────────────────────────
const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must include at least one uppercase letter")
      .regex(/[0-9]/, "Must include at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

// ─── Password strength helper ─────────────────────────────────────────────────
function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: "Weak", color: "#A32D2D" };
  if (score <= 2) return { score: 2, label: "Fair", color: "#854F0B" };
  if (score <= 3) return { score: 3, label: "Good", color: "#185FA5" };
  return { score: 4, label: "Strong", color: "#1A5C2A" };
}

// ─── Field wrapper with icon ──────────────────────────────────────────────────
function FieldIcon({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none">
      <Icon className="w-4 h-4" />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Validation errors
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const passwordStrength = getPasswordStrength(password);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate all fields
    const result = registerSchema.safeParse({
      email,
      password,
      confirmPassword,
    });

    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.issues.forEach((err) => {
        const path = err.path[0] as keyof typeof errors;
        if (path) fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    setServerError(null);

    try {
      await createUserWithEmailAndPassword(auth, result.data.email, result.data.password);
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setErrors((prev) => ({
          ...prev,
          email: "An account with this email already exists",
        }));
      } else {
        setServerError(error.message ?? "Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  // ── Success state ──
  if (success) {
    return (
      <div className="min-h-screen bg-[#F4F7F4] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#E8F5E9] border-2 border-[#A5D6A7] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-[#1A5C2A]" />
          </div>
          <h2 className="text-xl font-semibold text-[#1A5C2A] mb-2">
            Account created!
          </h2>
          <p className="text-sm text-[#6B7280]">
            Redirecting to your dashboard…
          </p>
        </div>
      </div>
    );
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
                Free account · No credit card required
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#D6E4D6] shadow-sm overflow-hidden">
            {/* Green top strip */}
            <div className="bg-[#1A5C2A] px-8 pt-7 pb-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-3">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white mb-1">
                Create your account
              </h1>
              <p className="text-sm text-white/60">
                Start monitoring your farm with AI
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
                  <div className="relative">
                    <FieldIcon icon={Mail} />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="farmer@example.com"
                      autoComplete="email"
                      disabled={isLoading}
                      className={inputCn(!!errors.email)}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-[#A32D2D] mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="text-sm font-medium text-[#374151] block mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <FieldIcon icon={Lock} />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                      disabled={isLoading}
                      className={cn(inputCn(!!errors.password), "pr-10")}
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

                  {/* Strength meter */}
                  {password && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((s) => (
                          <div
                            key={s}
                            className="h-1 flex-1 rounded-full transition-all duration-300"
                            style={{
                              background:
                                passwordStrength.score >= s
                                  ? passwordStrength.color
                                  : "#E5EDE5",
                            }}
                          />
                        ))}
                      </div>
                      {passwordStrength.label && (
                        <p
                          className="text-xs font-medium"
                          style={{ color: passwordStrength.color }}
                        >
                          {passwordStrength.label} password
                        </p>
                      )}
                    </div>
                  )}
                  {errors.password && (
                    <p className="text-xs text-[#A32D2D] mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="text-sm font-medium text-[#374151] block mb-1.5">
                    Confirm password
                  </label>
                  <div className="relative">
                    <FieldIcon icon={Lock} />
                    <Input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      disabled={isLoading}
                      className={cn(inputCn(!!errors.confirmPassword), "pr-10")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#1A5C2A] transition-colors"
                      tabIndex={-1}
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                    >
                      {showConfirm ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-[#A32D2D] mt-1">{errors.confirmPassword}</p>
                  )}
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
                      Creating account…
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E5EDE5]" />
                </div>
                <div className="relative flex justify-center text-xs text-[#9CA3AF] bg-white px-3">
                  Already have an account?
                </div>
              </div>

              <Link href="/login">
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-xl border-[#D6E4D6] text-[#1A5C2A] text-sm font-medium hover:bg-[#F0F9F0] hover:border-[#A5D6A7] transition-all"
                >
                  Sign in instead
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

// ─── Shared input class helper ────────────────────────────────────────────────
function inputCn(hasError?: boolean) {
  return cn(
    "h-11 rounded-xl border-[#D6E4D6] bg-[#F9FCF9] text-sm pl-9",
    "placeholder:text-[#9CA3AF]",
    "focus-visible:ring-[#1A5C2A] focus-visible:ring-1 focus-visible:border-[#1A5C2A]",
    "hover:border-[#86BFAA] transition-colors",
    hasError &&
      "border-[#F7C1C1] bg-[#FFFAFA] focus-visible:ring-[#A32D2D] focus-visible:border-[#A32D2D]"
  );
}