
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { User, Bell, Shield, Trash2, Save, Fingerprint, Cpu } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-l-8 border-primary pl-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-foreground text-background px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-[0.3em]">
            Account: User_01
          </div>
          <h2 className="text-5xl lg:text-7xl font-headline font-black uppercase leading-none tracking-tighter">My<br />Settings<span className="text-primary">.</span></h2>
        </div>
      </div>

      <div className="grid gap-12">
        {/* Profile Section */}
        <div className="border-4 border-foreground bg-card shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="p-6 border-b-4 border-foreground bg-primary flex items-center gap-3">
             <User className="h-6 w-6" />
             <h3 className="font-headline font-black text-2xl uppercase tracking-tighter">My Profile</h3>
          </div>
          <div className="p-8 space-y-8">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="relative">
                <Avatar className="h-32 w-32 rounded-none border-4 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]">
                  <AvatarImage src="https://picsum.photos/seed/user/200" alt="Profile" className="object-cover" />
                  <AvatarFallback className="rounded-none bg-muted font-black text-3xl">JD</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-primary p-1 border-2 border-foreground">
                  <Cpu className="h-4 w-4" />
                </div>
              </div>
              <div className="flex flex-col gap-4 items-center sm:items-start">
                <Button className="rounded-none border-2 border-foreground font-black uppercase tracking-tighter bg-foreground text-background hover:bg-primary hover:text-foreground transition-all">
                  Change Photo
                </Button>
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-40">JPG/PNG only, max 2MB</p>
              </div>
            </div>
            
            <Separator className="h-1 bg-foreground/10" />
            
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="font-mono text-[10px] uppercase font-bold tracking-widest opacity-60">Full Name</Label>
                <Input className="border-2 border-foreground rounded-none h-14 font-bold focus-visible:ring-primary" defaultValue="John Doe" />
              </div>
              <div className="space-y-3">
                <Label className="font-mono text-[10px] uppercase font-bold tracking-widest opacity-60">Email Address</Label>
                <Input className="border-2 border-foreground rounded-none h-14 font-bold opacity-50 bg-muted" defaultValue="john.doe@example.com" disabled />
              </div>
              <div className="sm:col-span-2 space-y-3">
                <Label className="font-mono text-[10px] uppercase font-bold tracking-widest opacity-60">Bio</Label>
                <Input className="border-2 border-foreground rounded-none h-14 font-bold focus-visible:ring-primary" placeholder="Tell us about yourself..." />
              </div>
            </div>
          </div>
          <div className="p-6 bg-muted border-t-4 border-foreground flex justify-end">
            <Button className="h-14 px-8 bg-primary text-foreground border-2 border-foreground rounded-none font-black uppercase text-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all gap-2">
              <Save className="h-5 w-5" /> Save Changes
            </Button>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="grid md:grid-cols-2 gap-12">
          <div className="border-4 border-foreground bg-card shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <div className="p-6 border-b-4 border-foreground bg-foreground text-background flex items-center gap-3">
               <Bell className="h-6 w-6" />
               <h3 className="font-headline font-black text-2xl uppercase tracking-tighter">Notifications</h3>
            </div>
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between group">
                <div className="space-y-1">
                  <Label className="font-bold uppercase tracking-tighter text-lg group-hover:text-primary transition-colors">Email Alerts</Label>
                  <p className="font-mono text-[10px] uppercase font-bold tracking-widest opacity-40 leading-tight">Get updates about your files.</p>
                </div>
                <Switch className="data-[state=checked]:bg-primary rounded-none h-8 w-14 border-2 border-foreground" defaultChecked />
              </div>
              <Separator className="h-0.5 bg-foreground/10" />
              <div className="flex items-center justify-between group">
                <div className="space-y-1">
                  <Label className="font-bold uppercase tracking-tighter text-lg group-hover:text-primary transition-colors">Weekly Report</Label>
                  <p className="font-mono text-[10px] uppercase font-bold tracking-widest opacity-40 leading-tight">Summary of AI activities.</p>
                </div>
                <Switch className="data-[state=checked]:bg-primary rounded-none h-8 w-14 border-2 border-foreground" />
              </div>
            </div>
          </div>

          <div className="border-4 border-foreground bg-card shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <div className="p-6 border-b-4 border-foreground bg-accent text-accent-foreground flex items-center gap-3">
               <Shield className="h-6 w-6" />
               <h3 className="font-headline font-black text-2xl uppercase tracking-tighter">Security</h3>
            </div>
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="font-bold uppercase tracking-tighter text-lg">Two-Factor Auth</Label>
                  <p className="font-mono text-[10px] uppercase font-bold tracking-widest opacity-40 leading-tight">Keep your account extra safe.</p>
                </div>
                <Button variant="outline" className="border-2 border-foreground rounded-none font-black uppercase tracking-tighter h-10 hover:bg-foreground hover:text-background">Enable</Button>
              </div>
              <Separator className="h-0.5 bg-foreground/10" />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="font-bold uppercase tracking-tighter text-lg">Active Sessions</Label>
                  <p className="font-mono text-[10px] uppercase font-bold tracking-widest opacity-40 leading-tight">See where you are logged in.</p>
                </div>
                <Button variant="outline" className="border-2 border-foreground rounded-none font-black uppercase tracking-tighter h-10 hover:bg-foreground hover:text-background">Check</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="border-4 border-accent bg-card shadow-[12px_12px_0px_0px_rgba(153,27,27,0.2)] overflow-hidden">
          <div className="p-6 border-b-4 border-accent bg-accent/10 flex items-center gap-3">
             <Trash2 className="h-6 w-6 text-accent" />
             <h3 className="font-headline font-black text-2xl uppercase tracking-tighter text-accent">Danger Zone</h3>
          </div>
          <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 max-w-xl">
              <p className="font-black uppercase tracking-tighter text-xl text-accent">Delete Account</p>
              <p className="font-medium text-muted-foreground leading-tight">
                This will permanently delete your account and all your uploaded documents. This action cannot be undone.
              </p>
            </div>
            <Button variant="destructive" className="w-full md:w-auto h-16 px-12 rounded-none border-4 border-foreground bg-accent text-white font-black uppercase text-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              Delete Forever
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center pt-8">
        <div className="inline-flex items-center gap-4 bg-muted border-2 border-foreground px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
           <Fingerprint className="h-4 w-4" /> System Revision: 4.0.1 Stable
        </div>
      </div>
    </div>
  )
}
