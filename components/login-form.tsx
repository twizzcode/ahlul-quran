"use client"

import Image from "next/image"
import { useEffect, useState, type ComponentProps, type FormEvent } from "react"
import { cn } from "@/lib/utils"
import { signIn, useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { isDashboardRole } from "@/lib/user-roles"

type AuthMode = "login" | "register"

export function LoginForm({
  className,
  ...props
}: ComponentProps<"div">) {
  const { data: session, isPending: sessionLoading } = useSession()

  const [mode, setMode] = useState<AuthMode>("login")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (sessionLoading || !session?.user) return

    const role = (session.user as Record<string, unknown>).role as string | undefined
    if (isDashboardRole(role)) {
      window.location.href = "/"
      return
    }

    window.location.href = "/"
  }, [sessionLoading, session])

  const handleGoogleAuth = async () => {
    setLoading(true)
    setError("")

    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/login",
      })
    } catch {
      setError("Gagal login dengan Google. Silakan coba lagi.")
      setLoading(false)
    }
  }

  const handleEmailSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("Login/daftar dengan email & password belum diaktifkan.")
  }

  if (sessionLoading || session?.user) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <div className="flex min-h-105 items-center justify-center p-6 md:p-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Mengalihkan...</span>
              </div>
            </div>
            <div className="relative hidden bg-muted md:block">
              <Image
                src="/Gambar-masjid.png"
                alt="Image"
                fill
                className="object-cover dark:brightness-[0.2] dark:grayscale"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleEmailSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">
                  {mode === "login" ? "Welcome back" : "Create your account"}
                </h1>
                <p className="text-balance text-muted-foreground">
                  {mode === "login"
                    ? "Login to your account"
                    : "Sign up with Google to create a new account"}
                </p>
              </div>

              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  disabled
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                    onClick={(event) => event.preventDefault()}
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" type="password" disabled />
              </Field>
              <Field>
                <Button type="submit" disabled>
                  {mode === "login" ? "Login" : "Sign up"}
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>

              <Field className="grid gap-4">

                <Button variant="outline" type="button" onClick={handleGoogleAuth} disabled={loading}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Login with Google
                </Button>
              </Field>

              <FieldDescription className="text-center">
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  className="underline-offset-2 hover:underline"
                  onClick={() => {
                    setMode((prev) => (prev === "login" ? "register" : "login"))
                    setError("")
                  }}
                >
                  {mode === "login" ? "Sign up" : "Login"}
                </button>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="relative hidden bg-muted md:block">
            <Image
              src="/Gambar-masjid.png"
              alt="Image"
              fill
              className="object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
