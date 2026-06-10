"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ComponentProps, type FormEvent } from "react";
import { signIn, signUp, useSession } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormMode = "login" | "register";

function getSafeCallbackUrl(value: string | null) {
  if (!value) {
    return "/";
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

function getAuthErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null) {
    const maybeMessage = "message" in error ? error.message : null;
    if (typeof maybeMessage === "string" && maybeMessage.trim()) {
      return maybeMessage;
    }

    const maybeError = "error" in error ? error.error : null;
    if (typeof maybeError === "string" && maybeError.trim()) {
      return maybeError;
    }

    if (
      typeof maybeError === "object" &&
      maybeError !== null &&
      "message" in maybeError &&
      typeof maybeError.message === "string" &&
      maybeError.message.trim()
    ) {
      return maybeError.message;
    }
  }

  return fallback;
}

export function LoginForm({ className, ...props }: ComponentProps<"div">) {
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();
  const callbackURL = useMemo(
    () => getSafeCallbackUrl(searchParams.get("next")),
    [searchParams],
  );
  const [mode, setMode] = useState<FormMode>("login");
  const [loading, setLoading] = useState<"email" | "google" | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isPending && session?.user) {
      window.location.href = callbackURL;
    }
  }, [callbackURL, isPending, session]);

  async function handleGoogleLogin() {
    setLoading("google");
    setError("");

    try {
      await signIn.social({
        provider: "google",
        callbackURL,
      });
    } catch (authError) {
      setError(getAuthErrorMessage(authError, "Gagal login dengan Google. Silakan coba lagi."));
      setLoading(null);
    }
  }

  async function handleEmailAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading("email");
    setError("");

    try {
      if (mode === "register") {
        const result = await signUp.email({
          name: name.trim(),
          email: email.trim(),
          password,
          callbackURL,
        });

        if (result.error) {
          setError(getAuthErrorMessage(result.error, "Gagal membuat akun. Silakan coba lagi."));
          setLoading(null);
          return;
        }
      } else {
        const result = await signIn.email({
          email: email.trim(),
          password,
          callbackURL,
        });

        if (result.error) {
          setError(getAuthErrorMessage(result.error, "Email atau password tidak sesuai."));
          setLoading(null);
          return;
        }
      }

      window.location.href = callbackURL;
    } catch (authError) {
      setError(
        getAuthErrorMessage(
          authError,
          mode === "register"
            ? "Gagal membuat akun. Silakan coba lagi."
            : "Gagal login dengan email. Silakan coba lagi.",
        ),
      );
      setLoading(null);
    }
  }

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-md flex-col gap-6",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col items-center text-center">
        <Image
          src="/logo.webp"
          alt="Logo Masjid"
          width={64}
          height={64}
          className="mb-4 h-16 w-16 object-contain"
          priority
        />

        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-emerald-950">
            {mode === "login" ? "Masuk ke akun Anda" : "Buat akun Anda"}
          </h1>
          <p className="text-sm leading-6 text-emerald-900/70">
            {mode === "login"
              ? "Lanjutkan untuk mengakses akun dan riwayat donasi Anda."
              : "Daftar cepat dengan email untuk mulai mengakses akun dan riwayat donasi."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 rounded-full bg-emerald-100/70 p-1 text-sm">
        <button
          type="button"
          className={cn(
            "rounded-full px-4 py-2 font-medium transition-colors",
            mode === "login"
              ? "bg-emerald-900 text-white"
              : "text-emerald-800 hover:text-emerald-950",
          )}
          onClick={() => {
            setMode("login");
            setError("");
          }}
        >
          Login
        </button>
        <button
          type="button"
          className={cn(
            "rounded-full px-4 py-2 font-medium transition-colors",
            mode === "register"
              ? "bg-emerald-900 text-white"
              : "text-emerald-800 hover:text-emerald-950",
          )}
          onClick={() => {
            setMode("register");
            setError("");
          }}
        >
          Daftar
        </button>
      </div>

      <form className="space-y-4" onSubmit={handleEmailAuth}>
        {mode === "register" ? (
          <div className="space-y-2 text-left">
            <Label htmlFor="name" className="text-sm text-emerald-900">
              Nama
            </Label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Nama lengkap"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-11 rounded-xl border-emerald-200 bg-white"
            />
          </div>
        ) : null}

        <div className="space-y-2 text-left">
          <Label htmlFor="email" className="text-sm text-emerald-900">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="email@contoh.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 rounded-xl border-emerald-200 bg-white"
          />
        </div>

        <div className="space-y-2 text-left">
          <Label htmlFor="password" className="text-sm text-emerald-900">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder="Minimal 8 karakter"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 rounded-xl border-emerald-200 bg-white"
          />
        </div>

        {error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <Button
          type="submit"
          className="h-11 w-full rounded-xl bg-emerald-900 text-white hover:bg-emerald-800"
          disabled={
            loading !== null ||
            isPending ||
            email.trim().length === 0 ||
            password.length < 8 ||
            (mode === "register" && name.trim().length === 0)
          }
        >
          {loading === "email"
            ? "Memproses..."
            : mode === "login"
              ? "Login dengan Email"
              : "Daftar dengan Email"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-emerald-100" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-[0.22em] text-emerald-700/55">
          <span className="bg-white px-3">Atau</span>
        </div>
      </div>

      <div className="space-y-4">
        <Button
          variant="outline"
          type="button"
          className="h-11 w-full rounded-xl border-emerald-200 bg-white text-emerald-950 hover:bg-emerald-50"
          onClick={handleGoogleLogin}
          disabled={loading !== null || isPending}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="currentColor"
            />
          </svg>
          {loading === "google" || isPending ? "Memproses..." : "Continue with Google"}
        </Button>

        <p className="text-center text-xs leading-5 text-emerald-900/65">
          By clicking continue, you agree to our{" "}
          <Link
            href="/terms-of-service"
            className="font-medium text-emerald-800 underline underline-offset-4 hover:text-emerald-950"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy-policy"
            className="font-medium text-emerald-800 underline underline-offset-4 hover:text-emerald-950"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
