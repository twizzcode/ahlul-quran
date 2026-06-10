import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Login",
  description: "Masuk atau daftar akun untuk mengakses riwayat donasi dan layanan akun Masjid Semilyar Tangan.",
  path: "/login",
  robots: {
    index: false,
    follow: false,
  },
});

export default function LoginPage() {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#ecfdf5_0%,#f8fafc_45%,#ffffff_100%)] px-6 py-10">
      <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_60%)]" />
      <div className="absolute -left-20 top-20 h-48 w-48 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="absolute -right-20 bottom-16 h-56 w-56 rounded-full bg-emerald-100/60 blur-3xl" />
      <div className="relative z-10 w-full">
        <LoginForm />
      </div>
    </main>
  );
}
