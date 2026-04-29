"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Archive, Fingerprint } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import { getClientAppOrigin } from "@/lib/site-url"

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function AuthContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get("error")) {
      setError("Authentication failed. Please try again.")
    }
  }, [searchParams])

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    const form = e.currentTarget
    const email = (form.elements.namedItem("email") as HTMLInputElement).value
    const password = (form.elements.namedItem("password") as HTMLInputElement).value

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      router.push("/dashboard")
    }
  }

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)
    const form = e.currentTarget
    const email = (form.elements.namedItem("signup-email") as HTMLInputElement).value
    const password = (form.elements.namedItem("signup-password") as HTMLInputElement).value

    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
    } else {
      setMessage("Check your email for a confirmation link.")
    }
    setIsLoading(false)
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${getClientAppOrigin()}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 font-body">
      <div className="absolute top-0 left-0 w-full h-2 bg-primary" />

      <Link href="/" className="flex items-center gap-3 mb-12 group">
        <div className="w-12 h-12 bg-foreground flex items-center justify-center transition-transform group-hover:-rotate-6">
          <Archive className="h-7 w-7 text-background" />
        </div>
        <span className="font-headline font-black text-3xl tracking-tighter uppercase">
          The Archive<span className="text-primary">.ai</span>
        </span>
      </Link>

      <div className="w-full max-w-md border-4 border-foreground bg-card p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <div className="mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 bg-primary px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest">
            <Fingerprint className="h-3 w-3" /> Secure Access
          </div>
          <h1 className="text-4xl font-headline font-black uppercase leading-none">Welcome Back</h1>
        </div>

        {error && (
          <div className="mb-6 border-2 border-destructive bg-destructive/10 p-3 text-xs font-mono font-bold text-destructive uppercase tracking-wide">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-6 border-2 border-primary bg-primary/10 p-3 text-xs font-mono font-bold text-foreground uppercase tracking-wide">
            {message}
          </div>
        )}

        {/* Google sign-in — full width, primary action */}
        <Button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
          className="w-full h-14 bg-foreground text-background border-2 border-foreground rounded-none font-black uppercase text-base tracking-tighter shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all gap-3 mb-8"
        >
          <GoogleIcon />
          {isGoogleLoading ? "Redirecting..." : "Continue with Google"}
        </Button>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t-2 border-foreground/20" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.3em]">
            <span className="bg-card px-4">Or use email</span>
          </div>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted p-1 border-2 border-foreground">
            <TabsTrigger value="login" className="font-black uppercase tracking-tighter data-[state=active]:bg-foreground data-[state=active]:text-background rounded-none">Login</TabsTrigger>
            <TabsTrigger value="signup" className="font-black uppercase tracking-tighter data-[state=active]:bg-foreground data-[state=active]:text-background rounded-none">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleSignIn} className="space-y-6">
              <div className="space-y-2">
                <Label className="font-mono text-[10px] uppercase font-bold tracking-widest opacity-60">Email Address</Label>
                <Input name="email" className="border-2 border-foreground rounded-none h-12 focus-visible:ring-primary" type="email" placeholder="user@example.com" required />
              </div>
              <div className="space-y-2">
                <Label className="font-mono text-[10px] uppercase font-bold tracking-widest opacity-60">Password</Label>
                <Input name="password" className="border-2 border-foreground rounded-none h-12 focus-visible:ring-primary" type="password" required />
              </div>
              <Button className="w-full h-14 bg-primary text-primary-foreground border-2 border-foreground rounded-none font-black uppercase text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all" type="submit" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-6">
              <div className="space-y-2">
                <Label className="font-mono text-[10px] uppercase font-bold tracking-widest opacity-60">Email Address</Label>
                <Input name="signup-email" className="border-2 border-foreground rounded-none h-12" type="email" placeholder="name@example.com" required />
              </div>
              <div className="space-y-2">
                <Label className="font-mono text-[10px] uppercase font-bold tracking-widest opacity-60">Password</Label>
                <Input name="signup-password" className="border-2 border-foreground rounded-none h-12" type="password" required />
              </div>
              <Button className="w-full h-14 bg-foreground text-background border-2 border-foreground rounded-none font-black uppercase text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all" type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>

      <p className="mt-12 text-[10px] font-mono font-bold uppercase tracking-widest opacity-40 max-w-xs text-center">
        Your data is safe and encrypted.
      </p>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthContent />
    </Suspense>
  )
}
