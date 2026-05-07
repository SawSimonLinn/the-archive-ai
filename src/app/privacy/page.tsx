import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpenCheck,
  Cookie,
  Database,
  FileText,
  Globe2,
  Lock,
  Mail,
  RefreshCw,
  Server,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SectionScrollNav } from "@/components/layout/section-scroll-nav";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy | The Archive.ai",
  description:
    "Full Privacy Policy for The Archive.ai, including account data, uploaded document processing, AI providers, billing, analytics, retention, and privacy rights.",
  alternates: {
    canonical: "/privacy",
  },
};

const privacyHighlights = [
  {
    title: "Private document workspace",
    body: "Uploaded files, extracted text, summaries, embeddings, and chats are scoped to your authenticated account.",
    icon: Lock,
  },
  {
    title: "AI processing is service-based",
    body: "Document text is sent to AI infrastructure only when needed to summarize, embed, search, or answer questions.",
    icon: Sparkles,
  },
  {
    title: "No document sales",
    body: "We do not sell uploaded document content and do not share it for cross-context behavioral advertising.",
    icon: ShieldCheck,
  },
  {
    title: "Requests through support",
    body: "You can request access, correction, export, deletion, or account closure through our support address.",
    icon: UserCheck,
  },
];

const policyNav = [
  { label: "What we collect", href: "#what-we-collect" },
  { label: "How we use it", href: "#how-we-use" },
  { label: "AI processing", href: "#ai-processing" },
  { label: "Sharing", href: "#sharing" },
  { label: "Cookies", href: "#cookies" },
  { label: "Retention", href: "#retention" },
  { label: "Your rights", href: "#your-rights" },
  { label: "Contact", href: "#contact" },
];

const collectionCategories = [
  {
    category: "Account and identity",
    examples: "Email address, user ID, password authentication status, OAuth provider details when you sign in with Google or GitHub, and account settings.",
    source: "You, Supabase Auth, and connected authentication providers.",
    purpose: "Create accounts, authenticate sessions, secure access, connect identity providers, and provide support.",
  },
  {
    category: "Uploaded documents",
    examples: "Original uploaded files, file names, file type, file size, storage path, extracted readable text, document chunks, summaries, and suggested questions.",
    source: "You and the files you choose to upload.",
    purpose: "Store your archive, extract text, create search indexes, generate document analysis, display files, and answer document-based questions.",
  },
  {
    category: "AI and chat activity",
    examples: "Questions you ask, generated answers, source document references, message timestamps, embeddings, and document context used to answer a request.",
    source: "You, the documents in your account, and AI processing providers.",
    purpose: "Run retrieval-augmented generation, keep chat history, cite source material, enforce chat limits, and improve reliability.",
  },
  {
    category: "Billing and plan data",
    examples: "Stripe customer ID, subscription ID, selected plan, payment status, invoice history, billing portal actions, and transaction metadata.",
    source: "You and Stripe.",
    purpose: "Process subscriptions, manage plan limits, handle billing support, reconcile payments, and comply with tax, accounting, and fraud-prevention obligations.",
  },
  {
    category: "Usage, device, and security data",
    examples: "Request metadata, pages visited, product events, rate-limit records, approximate device/browser data, IP-derived network information, errors, and logs.",
    source: "Your browser, our app, Vercel Analytics, Supabase, and server logs.",
    purpose: "Operate the service, measure reliability, prevent abuse, troubleshoot errors, protect accounts, and understand aggregate product usage.",
  },
  {
    category: "Support and communications",
    examples: "Emails, request details, attachments you send to support, privacy request verification details, and resolution history.",
    source: "You and our support workflow.",
    purpose: "Respond to questions, resolve issues, verify privacy requests, document decisions, and maintain customer records.",
  },
];

const detailedSections = [
  {
    id: "what-we-collect",
    title: "What We Collect",
    icon: Database,
    body: "We collect the information needed to provide a private document archive, authenticate users, process uploaded files, answer questions, run billing, protect the service, and respond to support requests.",
    bullets: [
      "You choose which documents to upload. Those documents may contain personal information, confidential business information, health information, financial information, or other sensitive material depending on the content you provide.",
      "We do not intentionally require sensitive personal information to create an account, but uploaded files and chat prompts may include sensitive content controlled by you.",
      "We also collect technical information generated by normal use of the app, such as authentication cookies, request logs, rate-limit events, browser/device information, and analytics events.",
    ],
  },
  {
    id: "how-we-use",
    title: "How We Use Information",
    icon: BookOpenCheck,
    body: "We use personal information and document content to deliver the service the user requested and to keep the app reliable, secure, and billable.",
    bullets: [
      "Provide account access, authenticated sessions, dashboard features, settings, document upload, document viewing, search, chat, and plan enforcement.",
      "Extract readable text from supported files, split text into searchable chunks, create embeddings, generate summaries, suggest questions, and return cited answers.",
      "Process payments, maintain subscription state, provide invoices and billing portal access, detect failed payments, and support plan upgrades or cancellations.",
      "Detect abuse, enforce rate limits, debug errors, improve uptime, protect accounts, investigate security events, and comply with lawful requests.",
    ],
  },
  {
    id: "ai-processing",
    title: "Document And AI Processing",
    icon: Sparkles,
    body: "The Archive.ai is a retrieval-augmented document assistant. AI processing is central to how uploads, summaries, search, and chat answers work.",
    bullets: [
      "When you upload a supported document, the app extracts readable text and sends the text needed for embeddings and initial analysis to AI infrastructure providers such as OpenAI.",
      "When you ask a question, the app searches your stored document chunks and sends the relevant snippets plus your prompt to the AI provider to generate an answer.",
      "AI outputs can be incomplete or incorrect. You should verify important answers against the cited source document text.",
      "We do not use uploaded document content to train a public model owned by The Archive.ai. Third-party AI providers process the content as subprocessors for service delivery.",
    ],
  },
  {
    id: "sharing",
    title: "How We Share Information",
    icon: Server,
    body: "We share information only as needed to operate the product, process payments, use infrastructure providers, respond to legal obligations, protect the service, or complete a business transaction.",
    bullets: [
      "Supabase provides authentication, database, and document storage infrastructure.",
      "OpenAI provides AI model and embedding infrastructure for summaries, search, and answers.",
      "Stripe processes checkout, subscriptions, billing portal sessions, invoices, and payment records. We do not store full card numbers.",
      "Vercel provides hosting and analytics infrastructure used to deliver the site and understand aggregate usage.",
      "We may disclose information if required by law, subpoena, court order, government request, security investigation, fraud prevention, or to protect rights, safety, and service integrity.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies, Local Storage, And Analytics",
    icon: Cookie,
    body: "The app uses browser storage technologies for authentication, product state, dashboard behavior, and analytics.",
    bullets: [
      "Supabase and Next.js use cookies to keep users signed in, process auth callbacks, and protect authenticated routes.",
      "The dashboard stores limited local browser state, such as the current and previous document references, so the chat workspace can restore your active context.",
      "UI preferences, such as sidebar state, may be stored in cookies or local storage.",
      "Analytics and server logs help us understand performance, errors, and aggregate product usage. Analytics events are not used to read document contents.",
      "You can control cookies through your browser settings, but blocking required cookies may prevent sign-in, dashboard access, billing redirects, or document workflows from working.",
    ],
  },
  {
    id: "retention",
    title: "Retention, Deletion, And Backups",
    icon: RefreshCw,
    body: "We keep information for as long as needed to provide the service, satisfy legal obligations, secure the app, resolve disputes, and maintain business records.",
    bullets: [
      "Uploaded documents, extracted text, document chunks, summaries, and chat messages remain available while your account keeps them in the active product experience.",
      "Deleting a document removes it from the active dashboard experience and deletes associated active document records that power chat and search. Backup copies, logs, and provider retention systems may persist for a limited period.",
      "Billing and transaction records may be retained for tax, accounting, chargeback, fraud-prevention, and legal reasons even after account closure.",
      "Support messages and privacy request records may be retained to document how we handled the request.",
      "If you want account closure or help confirming deletion, contact support from the email address associated with your account.",
    ],
  },
  {
    id: "your-rights",
    title: "Your Choices And Privacy Rights",
    icon: UserCheck,
    body: "Depending on where you live, you may have rights to access, know, correct, export, delete, restrict, object to, or limit certain uses of personal information.",
    bullets: [
      "You can manage uploaded documents in the dashboard and billing through account settings or the Stripe billing portal.",
      "You can request access, correction, export, deletion, restriction, objection, or account closure by contacting support.",
      "California and some other U.S. state residents may have rights to know, delete, correct, opt out of certain data sales or sharing, limit sensitive personal information use, and receive equal treatment for exercising rights.",
      "We do not sell personal information and do not share personal information for cross-context behavioral advertising.",
      "We may need to verify your identity before completing a privacy request. Some requests may be limited by security, legal, billing, fraud-prevention, backup, or operational requirements.",
    ],
  },
  {
    id: "contact",
    title: "Contact, Changes, And Scope",
    icon: Mail,
    body: "This policy applies to The Archive.ai web app, dashboard, document workflows, billing workflows, and support communications.",
    bullets: [
      `Privacy questions and requests can be sent to ${SITE.supportEmail}.`,
      "We may update this policy when product features, providers, laws, or operations change. The updated date on this page will show the latest revision.",
      "The service is not directed to children under 13, and we do not knowingly collect personal information from children under 13.",
      "Information may be processed in the United States and in other locations where our providers operate infrastructure.",
      "This policy does not reduce any privacy rights you may have under applicable law.",
    ],
  },
];

const serviceProviders = [
  {
    name: "Supabase",
    role: "Authentication, user accounts, database, object storage, security controls, and session handling.",
  },
  {
    name: "OpenAI",
    role: "AI responses, initial document analysis, embeddings, and model infrastructure used for document intelligence.",
  },
  {
    name: "Stripe",
    role: "Checkout, subscriptions, invoices, billing portal sessions, payment status, refunds, disputes, and customer billing records.",
  },
  {
    name: "Vercel",
    role: "Application hosting, deployment infrastructure, performance data, request logs, and analytics.",
  },
];

const requestSteps = [
  "Email support from the account email address when possible.",
  "Describe the request: access, correction, export, deletion, account closure, billing data, or another privacy concern.",
  "Include enough detail for us to find the relevant account or document records, but do not send passwords or unnecessary sensitive files.",
  "We may ask for verification before disclosing, changing, exporting, or deleting information.",
];

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b-2 border-foreground px-6 py-20 md:py-24">
          <div className="container mx-auto grid gap-12 lg:grid-cols-12 lg:items-end">
            <div className="space-y-6 border-l-8 border-primary pl-8 lg:col-span-8">
              <div className="inline-flex items-center gap-3 bg-foreground px-4 py-1 font-mono text-xs font-bold uppercase tracking-widest text-background">
                <ShieldCheck className="h-4 w-4" /> Full privacy policy
              </div>
              <h1 className="font-headline text-5xl font-black uppercase leading-[0.85] tracking-tighter sm:text-7xl md:text-8xl">
                Privacy <br />
                Policy<span className="text-primary">.</span>
              </h1>
              <p className="max-w-3xl text-lg font-medium leading-relaxed text-muted-foreground">
                This full policy explains what information {SITE.legalName} collects, how uploaded documents and AI requests are processed, which providers support the product, how long data is kept, and how to make privacy requests.
              </p>
            </div>

            <div className="border-4 border-foreground bg-card p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] lg:col-span-4">
              <Lock className="h-10 w-10 text-primary" />
              <p className="mt-6 font-mono text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground">
                Last updated
              </p>
              <p className="mt-2 font-headline text-3xl font-black tracking-tighter">
                {SITE.policyUpdatedAt}
              </p>
              <p className="mt-5 text-sm font-medium leading-relaxed text-muted-foreground">
                Privacy questions or data requests can be sent to{" "}
                <a className="font-bold text-foreground underline decoration-primary decoration-2 underline-offset-4" href={`mailto:${SITE.supportEmail}`}>
                  {SITE.supportEmail}
                </a>
                .
              </p>
            </div>
          </div>
        </section>

        <section className="border-b-2 border-foreground px-6 py-12">
          <div className="container mx-auto grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {privacyHighlights.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="border-4 border-foreground bg-card p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <Icon className="h-8 w-8 text-primary" />
                  <h2 className="mt-5 font-headline text-xl font-black uppercase tracking-tighter">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="container mx-auto grid gap-12 lg:grid-cols-12">
            <aside className="lg:col-span-4">
              <div className="sticky top-28 space-y-6">
                <div className="border-4 border-foreground bg-primary p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
                  <FileText className="h-10 w-10" />
                  <h2 className="mt-8 font-headline text-3xl font-black uppercase tracking-tighter">
                    Policy contents
                  </h2>
                  <SectionScrollNav items={policyNav} ariaLabel="Privacy policy sections" />
                </div>

                <div className="border-4 border-foreground bg-card p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <Globe2 className="h-8 w-8 text-primary" />
                  <h2 className="mt-5 font-headline text-2xl font-black uppercase tracking-tighter">
                    Notice scope
                  </h2>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">
                    This page covers the website, account dashboard, uploads, document search, AI chat, subscriptions, support, and security operations for {SITE.domain}.
                  </p>
                </div>
              </div>
            </aside>

            <div className="space-y-10 lg:col-span-8">
              <section id="collection-details" className="scroll-mt-28 border-4 border-foreground bg-card p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="font-mono text-[10px] font-black uppercase tracking-[0.35em] text-primary">
                      Data categories
                    </p>
                    <h2 className="mt-3 font-headline text-3xl font-black uppercase tracking-tighter">
                      Detailed Collection Table
                    </h2>
                  </div>
                  <Database className="h-10 w-10 text-primary" />
                </div>

                <div className="mt-8 overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse text-left">
                    <thead>
                      <tr className="border-b-4 border-foreground bg-muted">
                        <th className="p-4 text-xs font-black uppercase tracking-widest">Category</th>
                        <th className="p-4 text-xs font-black uppercase tracking-widest">Examples</th>
                        <th className="p-4 text-xs font-black uppercase tracking-widest">Source</th>
                        <th className="p-4 text-xs font-black uppercase tracking-widest">Purpose</th>
                      </tr>
                    </thead>
                    <tbody>
                      {collectionCategories.map((row) => (
                        <tr key={row.category} className="border-b-2 border-foreground/15 align-top">
                          <td className="p-4 text-sm font-black uppercase tracking-tight text-foreground">
                            {row.category}
                          </td>
                          <td className="p-4 text-sm font-medium leading-relaxed text-muted-foreground">
                            {row.examples}
                          </td>
                          <td className="p-4 text-sm font-medium leading-relaxed text-muted-foreground">
                            {row.source}
                          </td>
                          <td className="p-4 text-sm font-medium leading-relaxed text-muted-foreground">
                            {row.purpose}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {detailedSections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <article key={section.id} id={section.id} className="scroll-mt-28 border-4 border-foreground bg-card p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:p-8">
                    <div className="flex flex-col gap-5 md:flex-row md:items-start">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-foreground font-headline text-xl font-black text-background">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <h2 className="font-headline text-3xl font-black uppercase tracking-tighter">
                            {section.title}
                          </h2>
                          <Icon className="h-8 w-8 shrink-0 text-primary" />
                        </div>
                        <p className="mt-4 text-base font-medium leading-relaxed text-muted-foreground">
                          {section.body}
                        </p>
                        <ul className="mt-6 space-y-4">
                          {section.bullets.map((bullet) => (
                            <li key={bullet} className="border-l-4 border-primary pl-4 text-sm font-medium leading-relaxed text-muted-foreground">
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </article>
                );
              })}

              <section className="border-4 border-foreground bg-card p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="font-mono text-[10px] font-black uppercase tracking-[0.35em] text-primary">
                      Subprocessors
                    </p>
                    <h2 className="mt-3 font-headline text-3xl font-black uppercase tracking-tighter">
                      Current Service Providers
                    </h2>
                  </div>
                  <Server className="h-10 w-10 text-primary" />
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {serviceProviders.map((provider) => (
                    <article key={provider.name} className="border-2 border-foreground p-5">
                      <h3 className="font-headline text-xl font-black uppercase tracking-tighter">
                        {provider.name}
                      </h3>
                      <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">
                        {provider.role}
                      </p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="border-4 border-foreground bg-primary p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="font-mono text-[10px] font-black uppercase tracking-[0.35em] text-foreground/55">
                      Privacy requests
                    </p>
                    <h2 className="mt-3 font-headline text-3xl font-black uppercase tracking-tighter">
                      How To Make A Request
                    </h2>
                    <p className="mt-4 max-w-2xl text-sm font-bold leading-relaxed text-foreground/75">
                      Send requests to{" "}
                      <a className="underline decoration-2 underline-offset-4" href={`mailto:${SITE.supportEmail}`}>
                        {SITE.supportEmail}
                      </a>
                      . We respond based on applicable law, account verification, and the operational limits described in this policy.
                    </p>
                  </div>
                  <Mail className="h-10 w-10 shrink-0" />
                </div>

                <ol className="mt-8 grid gap-4 md:grid-cols-2">
                  {requestSteps.map((step, index) => (
                    <li key={step} className="border-2 border-foreground bg-background p-5">
                      <span className="font-mono text-[10px] font-black uppercase tracking-[0.35em] text-primary">
                        Step {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="mt-3 text-sm font-black uppercase tracking-tight">
                        {step}
                      </p>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          </div>
        </section>

        <section className="border-t-2 border-foreground px-6 py-16">
          <div className="container mx-auto flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <FileText className="mt-1 h-8 w-8 text-primary" />
              <div>
                <h2 className="font-headline text-2xl font-black uppercase tracking-tighter">
                  Related policies
                </h2>
                <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-muted-foreground">
                  Review the Terms of Service and Refund Policy for account, subscription, cancellation, refund, and acceptable use details.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/terms" className="inline-flex h-12 items-center justify-center border-2 border-foreground bg-foreground px-5 text-sm font-black uppercase tracking-tighter text-background">
                Terms
              </Link>
              <Link href="/refund-policy" className="inline-flex h-12 items-center justify-center border-2 border-foreground px-5 text-sm font-black uppercase tracking-tighter transition-colors hover:bg-primary">
                Refunds
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
