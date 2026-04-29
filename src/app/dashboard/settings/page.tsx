"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Bell,
  CreditCard,
  ExternalLink,
  FileText,
  Loader2,
  ReceiptText,
  Save,
  Shield,
  User,
  Zap,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import {
  formatPlanLimit,
  serializePlan,
  type BillingAccountResponse,
  type BillingPlanSummary,
} from "@/lib/billing"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type UserMetadata = {
  full_name?: unknown;
  bio?: unknown;
  email_alerts?: unknown;
  weekly_report?: unknown;
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function getSessionIdFromUrl() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("session_id");
}

export default function SettingsPage() {
  const [billing, setBilling] = useState<BillingAccountResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<"pro" | "team" | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  const plan: BillingPlanSummary = billing?.plan ?? serializePlan("free");
  const transactions = billing?.transactions ?? [];
  const subscriptionStatus = billing?.subscription.status ?? "free";
  const currentPeriodEnd = billing?.subscription.currentPeriodEnd ?? null;

  const loadSettings = useCallback(async () => {
    setIsLoading(true);

    try {
      const [{ data: userData }, billingResponse] = await Promise.all([
        supabase.auth.getUser(),
        fetch(
          `/api/account/billing${
            getSessionIdFromUrl() ? `?session_id=${encodeURIComponent(getSessionIdFromUrl()!)}` : ""
          }`,
          { cache: "no-store" },
        ),
      ]);

      const user = userData.user;
      if (user) {
        const metadata = user.user_metadata as UserMetadata;
        setEmail(user.email ?? "");
        setFullName(typeof metadata.full_name === "string" ? metadata.full_name : "");
        setBio(typeof metadata.bio === "string" ? metadata.bio : "");
        setEmailAlerts(typeof metadata.email_alerts === "boolean" ? metadata.email_alerts : true);
        setWeeklyReport(typeof metadata.weekly_report === "boolean" ? metadata.weekly_report : false);
      }

      if (billingResponse.ok) {
        const data = (await billingResponse.json()) as BillingAccountResponse;
        setBilling(data);
        window.dispatchEvent(new CustomEvent("archive:billing-changed"));
      } else {
        throw new Error("Billing request failed");
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Settings Load Failed",
        description: "Could not load account billing settings.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    setIsSaving(true);

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName.trim(),
        bio: bio.trim(),
        email_alerts: emailAlerts,
        weekly_report: weeklyReport,
      },
    });

    setIsSaving(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error.message,
      });
      return;
    }

    toast({ title: "Settings Saved", description: "Your account settings were updated." });
  };

  const openBillingPortal = async () => {
    setIsPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.url) throw new Error(data.error ?? "Portal unavailable");
      window.location.href = data.url;
    } catch {
      toast({
        variant: "destructive",
        title: "Billing Portal Failed",
        description: "Could not open Stripe billing management.",
      });
      setIsPortalLoading(false);
    }
  };

  const startCheckout = async (planId: "pro" | "team") => {
    setCheckoutLoading(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();

      if (!res.ok || !data.url) throw new Error(data.error ?? "Checkout unavailable");
      window.location.href = data.url;
    } catch {
      toast({
        variant: "destructive",
        title: "Checkout Failed",
        description: "Could not start Stripe checkout.",
      });
      setCheckoutLoading(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-5">
      <div className="flex flex-col gap-4 border-l-4 border-primary pl-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 bg-foreground px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-background">
            Account: {email || "Loading"}
          </div>
          <h2 className="font-headline text-3xl font-black uppercase leading-tight tracking-tighter lg:text-4xl">
            My Settings<span className="text-primary">.</span>
          </h2>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3 border-b-2 border-foreground bg-primary p-4">
            <User className="h-5 w-5" />
            <h3 className="font-headline text-lg font-black uppercase tracking-tighter">Account Profile</h3>
          </div>
          <div className="space-y-5 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-60">
                  Display Name
                </Label>
                <Input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="h-10 rounded-none border-2 border-foreground font-bold focus-visible:ring-primary"
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-60">
                  Email Address
                </Label>
                <Input
                  value={email}
                  className="h-10 rounded-none border-2 border-foreground bg-muted font-bold opacity-70"
                  disabled
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-60">
                  Bio
                </Label>
                <Input
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  className="h-10 rounded-none border-2 border-foreground font-bold focus-visible:ring-primary"
                  placeholder="Short account note"
                />
              </div>
            </div>

            <Separator className="h-px bg-foreground/10" />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between gap-4 border-2 border-foreground bg-muted/30 p-4">
                <div>
                  <Label className="text-base font-bold uppercase tracking-tighter">Email Alerts</Label>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-40">
                    File and billing updates
                  </p>
                </div>
                <Switch
                  checked={emailAlerts}
                  onCheckedChange={setEmailAlerts}
                  className="h-6 w-12 rounded-none border-2 border-foreground data-[state=checked]:bg-primary"
                />
              </div>
              <div className="flex items-center justify-between gap-4 border-2 border-foreground bg-muted/30 p-4">
                <div>
                  <Label className="text-base font-bold uppercase tracking-tighter">Weekly Report</Label>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-40">
                    Archive activity digest
                  </p>
                </div>
                <Switch
                  checked={weeklyReport}
                  onCheckedChange={setWeeklyReport}
                  className="h-6 w-12 rounded-none border-2 border-foreground data-[state=checked]:bg-primary"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end border-t-2 border-foreground bg-muted p-4">
            <Button
              onClick={handleSave}
              disabled={isLoading || isSaving}
              className="h-10 rounded-none border-2 border-foreground bg-primary px-6 font-black uppercase text-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </section>

        <aside className="space-y-5">
          <section className="border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-3 border-b-2 border-foreground bg-foreground p-4 text-background">
              <CreditCard className="h-5 w-5" />
              <h3 className="font-headline text-lg font-black uppercase tracking-tighter">Billing Plan</h3>
            </div>
            <div className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-headline text-3xl font-black uppercase tracking-tighter">{plan.name}</p>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-50">
                    {plan.price === 0 ? "Free forever" : `$${plan.price}/mo`}
                  </p>
                </div>
                <Badge className="rounded-none border-2 border-foreground bg-primary px-2 py-1 font-mono text-[10px] font-black uppercase text-foreground">
                  {subscriptionStatus}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="border-2 border-foreground bg-muted/30 p-3">
                  <p className="font-headline text-xl font-black uppercase">{formatPlanLimit(plan.maxDocuments)}</p>
                  <p className="font-mono text-[9px] font-bold uppercase tracking-widest opacity-50">Documents</p>
                </div>
                <div className="border-2 border-foreground bg-muted/30 p-3">
                  <p className="font-headline text-xl font-black uppercase">
                    {formatPlanLimit(plan.chatMessagesPerHour)}
                  </p>
                  <p className="font-mono text-[9px] font-bold uppercase tracking-widest opacity-50">Chats / hour</p>
                </div>
              </div>

              {currentPeriodEnd && (
                <div className="flex items-center gap-2 border-2 border-primary bg-primary/10 p-3 font-mono text-[10px] font-bold uppercase tracking-widest">
                  <Shield className="h-4 w-4" />
                  Renews {formatDate(currentPeriodEnd)}
                </div>
              )}

              {billing?.portalAvailable ? (
                <Button
                  onClick={openBillingPortal}
                  disabled={isPortalLoading}
                  className="h-11 w-full rounded-none border-2 border-foreground bg-primary font-black uppercase text-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                >
                  {isPortalLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="mr-2 h-4 w-4" />
                  )}
                  Manage Billing
                </Button>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  {(["pro", "team"] as const).map((planId) => (
                    <Button
                      key={planId}
                      onClick={() => startCheckout(planId)}
                      disabled={checkoutLoading !== null}
                      className={cn(
                        "h-11 rounded-none border-2 border-foreground font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none",
                        planId === "pro" ? "bg-primary text-foreground" : "bg-foreground text-background",
                      )}
                    >
                      {checkoutLoading === planId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Zap className="mr-2 h-4 w-4" /> Upgrade to {planId}
                        </>
                      )}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-3 border-b-2 border-foreground bg-accent p-4 text-accent-foreground">
              <Bell className="h-5 w-5" />
              <h3 className="font-headline text-lg font-black uppercase tracking-tighter">Account Status</h3>
            </div>
            <div className="space-y-3 p-5 font-mono text-[10px] font-bold uppercase tracking-widest">
              <div className="flex items-center justify-between gap-3">
                <span className="opacity-50">User ID</span>
                <span className="truncate text-right">{billing?.user.id ?? "—"}</span>
              </div>
              <Separator className="h-px bg-foreground/10" />
              <div className="flex items-center justify-between gap-3">
                <span className="opacity-50">Created</span>
                <span>{formatDate(billing?.user.createdAt ?? null)}</span>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <section className="border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col gap-2 border-b-2 border-foreground bg-foreground p-4 text-background sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <ReceiptText className="h-5 w-5 text-primary" />
            <h3 className="font-headline text-lg font-black uppercase tracking-tighter">Stripe Transactions</h3>
          </div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-background/50">
            {transactions.length} total
          </span>
        </div>
        <div className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-foreground hover:bg-transparent">
                <TableHead className="font-mono text-[10px] font-black uppercase tracking-widest">Date</TableHead>
                <TableHead className="font-mono text-[10px] font-black uppercase tracking-widest">Invoice</TableHead>
                <TableHead className="font-mono text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                <TableHead className="text-right font-mono text-[10px] font-black uppercase tracking-widest">
                  Amount
                </TableHead>
                <TableHead className="text-right font-mono text-[10px] font-black uppercase tracking-widest">
                  Links
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center font-mono text-[10px] font-bold uppercase tracking-widest opacity-50">
                    Loading Stripe transactions...
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center font-mono text-[10px] font-bold uppercase tracking-widest opacity-50">
                    No Stripe transactions yet.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id} className="border-b border-foreground/10">
                    <TableCell className="font-mono text-xs font-bold uppercase tracking-widest">
                      {formatDate(transaction.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex min-w-0 items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-primary" />
                        <span className="truncate font-bold">{transaction.description}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="rounded-none border border-foreground bg-muted px-2 py-1 font-mono text-[9px] font-black uppercase text-foreground">
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-black uppercase">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {transaction.hostedInvoiceUrl && (
                          <Button
                            asChild
                            variant="outline"
                            className="h-8 rounded-none border-2 border-foreground px-3 font-black uppercase tracking-tighter"
                          >
                            <a href={transaction.hostedInvoiceUrl} target="_blank" rel="noreferrer">
                              <ExternalLink className="mr-1 h-3.5 w-3.5" /> View
                            </a>
                          </Button>
                        )}
                        {transaction.invoicePdfUrl && (
                          <Button
                            asChild
                            variant="outline"
                            className="h-8 rounded-none border-2 border-foreground px-3 font-black uppercase tracking-tighter"
                          >
                            <a href={transaction.invoicePdfUrl} target="_blank" rel="noreferrer">
                              PDF
                            </a>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  )
}
