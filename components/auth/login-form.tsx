"use client";

import Image from "next/image";
import { useEffect, useState, type ComponentProps } from "react";
import { signIn, useSession } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function LoginForm({ className, ...props }: ComponentProps<"div">) {
  const { data: session, isPending } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isPending && session?.user) {
      window.location.href = "/";
    }
  }, [isPending, session]);

  async function handleGoogleLogin() {
    setLoading(true);
    setError("");

    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch {
      setError("Gagal login dengan Google. Silakan coba lagi.");
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="p-0">
          <div className="relative h-40 bg-muted">
            <Image
              src="/Gambar-masjid.png"
              alt="Masjid"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/35" />
          </div>

          <div className="space-y-5 p-6">
            <div className="space-y-1 text-center">
              <h1 className="text-2xl font-bold">Login</h1>
              <p className="text-sm text-muted-foreground">
                Masuk dengan akun Google untuk melanjutkan.
              </p>
            </div>

            {error ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <Button
              variant="outline"
              type="button"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={loading || isPending}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              {loading || isPending ? "Memproses..." : "Login dengan Google"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
