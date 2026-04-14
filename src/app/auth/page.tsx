
"use client"

import { useState } from "react"
import Link from "next/link"
import { Archive, Github, Mail, Fingerprint } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      window.location.href = "/dashboard"
    }, 1000)
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

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted p-1 border-2 border-foreground">
            <TabsTrigger value="login" className="font-black uppercase tracking-tighter data-[state=active]:bg-foreground data-[state=active]:text-background rounded-none">Login</TabsTrigger>
            <TabsTrigger value="signup" className="font-black uppercase tracking-tighter data-[state=active]:bg-foreground data-[state=active]:text-background rounded-none">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="font-mono text-[10px] uppercase font-bold tracking-widest opacity-60">Email Address</Label>
                <Input className="border-2 border-foreground rounded-none h-12 focus-visible:ring-primary" id="email" type="email" placeholder="user@example.com" required />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-mono text-[10px] uppercase font-bold tracking-widest opacity-60">Password</Label>
                  <Link href="#" className="text-[10px] font-bold text-primary hover:underline uppercase">Forgot?</Link>
                </div>
                <Input className="border-2 border-foreground rounded-none h-12 focus-visible:ring-primary" id="password" type="password" required />
              </div>
              <Button className="w-full h-14 bg-primary text-primary-foreground border-2 border-foreground rounded-none font-black uppercase text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all" type="submit" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="font-mono text-[10px] uppercase font-bold tracking-widest opacity-60">Full Name</Label>
                <Input className="border-2 border-foreground rounded-none h-12" id="signup-name" placeholder="John Doe" required />
              </div>
              <div className="space-y-2">
                <Label className="font-mono text-[10px] uppercase font-bold tracking-widest opacity-60">Email Address</Label>
                <Input className="border-2 border-foreground rounded-none h-12" id="signup-email" type="email" placeholder="name@example.com" required />
              </div>
              <div className="space-y-2">
                <Label className="font-mono text-[10px] uppercase font-bold tracking-widest opacity-60">Password</Label>
                <Input className="border-2 border-foreground rounded-none h-12" id="signup-password" type="password" required />
              </div>
              <Button className="w-full h-14 bg-foreground text-background border-2 border-foreground rounded-none font-black uppercase text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all" type="submit" disabled={isLoading}>
                 {isLoading ? "Creating..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t-2 border-foreground/20" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.3em]">
            <span className="bg-card px-4">Or use</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="border-2 border-foreground rounded-none font-bold uppercase tracking-tighter gap-2">
            <Github className="h-4 w-4" /> Github
          </Button>
          <Button variant="outline" className="border-2 border-foreground rounded-none font-bold uppercase tracking-tighter gap-2">
            <Mail className="h-4 w-4" /> Google
          </Button>
        </div>
      </div>
      
      <p className="mt-12 text-[10px] font-mono font-bold uppercase tracking-widest opacity-40 max-w-xs text-center">
        Your data is safe and encrypted.
      </p>
    </div>
  )
}
