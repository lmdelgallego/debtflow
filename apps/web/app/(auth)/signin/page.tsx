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
import { useForm } from "react-hook-form"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { GoogleIcon } from "@/components/ui/icon-google"
import { signinSchema, type SigninFormValues } from "@debtflow/validators"

type OAuthProvider = "google"

export default function SigninPage() {
  return (
    <Suspense
      fallback={
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Iniciar sesión
              </CardTitle>
              <CardDescription className="text-center">
                Cargando...
              </CardDescription>
          </CardHeader>
        </Card>
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

  const form = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const nextPath = searchParams.get("next") ?? "/dashboard"

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

  const onSubmit = async (data: SigninFormValues) => {
    if (submitting) return

    setSubmitting(true)
    setErrorMessage(null)

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setSubmitting(false)
      setErrorMessage(error.message)
      return
    }

    router.replace(nextPath)
  }

  if (!authLoading && user) return null

  return (
    <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Iniciar sesión
          </CardTitle>
          <CardDescription className="text-center">
            Accede con tu cuenta usando inicio de sesión único
          </CardDescription>
        </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input autoComplete="email" placeholder="nombre@ejemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input autoComplete="current-password" placeholder="Contraseña" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={submitting || authLoading}
            >
              Iniciar sesión
            </Button>
          </form>
        </Form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              o
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          type="button"
          className="w-full"
          disabled={submitting || authLoading}
          onClick={() => handleSignInWithProvider("google")}
        >
          <GoogleIcon className="mr-2 h-4 w-4" />
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
  )
}
