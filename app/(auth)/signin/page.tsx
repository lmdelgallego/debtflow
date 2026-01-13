"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"

type OAuthProvider = "google"

export default function SigninPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-10">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Iniciar sesión
              </CardTitle>
              <CardDescription className="text-center">
                Cargando...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled aria-label="Cargando">
                Continuar con Google
              </Button>
            </CardContent>
          </Card>
        </div>
      }
    >
      <SigninContent />
    </Suspense>
  )
}

const SigninContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()

  const supabase = useMemo(() => createClient(), [])
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const nextPath = searchParams.get("next") ?? "/"

  useEffect(() => {
    if (authLoading) return
    if (!user) return
    router.replace(nextPath)
  }, [authLoading, nextPath, router, user])

  const handleSignInWithProvider = async (provider: OAuthProvider) => {
    if (submitting) return

    setSubmitting(true)
    setErrorMessage(null)

    const redirectTo = new URL("/auth/callback", window.location.origin)
    redirectTo.searchParams.set("next", nextPath)

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectTo.toString(),
      },
    })

    if (!error) return

    setSubmitting(false)
    setErrorMessage(error.message)
  }

  if (!authLoading && user) return null

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Iniciar sesión
          </CardTitle>
          <CardDescription className="text-center">
            Accede con tu cuenta usando inicio de sesión único
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            type="button"
            className="w-full"
            disabled={submitting || authLoading}
            onClick={() => handleSignInWithProvider("google")}
            aria-label="Continuar con Google"
          >
            Continuar con Google
          </Button>
          {errorMessage ? (
            <p
              className="text-sm text-destructive"
              role="alert"
              aria-live="polite"
            >
              {errorMessage}
            </p>
          ) : null}
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            ¿No tienes una cuenta?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Crea una
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
