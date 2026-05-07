import type { Metadata } from "next";
import { PlansClient } from "./plans-client";

export const metadata: Metadata = {
  title: "Plans & Pricing | The Archive.ai",
  description:
    "Compare Free, Pro, and Team plans for document uploads, AI chats, analysis, exports, and team workspaces.",
  alternates: {
    canonical: "/plans",
  },
  openGraph: {
    title: "Plans & Pricing | The Archive.ai",
    description:
      "Choose the right Archive.ai plan for your document library, from a free starter archive to team workspaces.",
    url: "/plans",
    type: "website",
  },
};

export default function PlansPage() {
  return <PlansClient />;
}
