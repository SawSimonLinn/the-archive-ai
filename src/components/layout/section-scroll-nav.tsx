"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type SectionNavItem = {
  label: string;
  href: string;
};

type SectionScrollNavProps = {
  items: SectionNavItem[];
  ariaLabel: string;
};

export function SectionScrollNav({ items, ariaLabel }: SectionScrollNavProps) {
  const targetIds = useMemo(
    () => items.map((item) => item.href.slice(1)),
    [items],
  );
  const [activeHref, setActiveHref] = useState(items[0]?.href ?? "");

  useEffect(() => {
    if (targetIds.length === 0) return;

    let animationFrame = 0;

    const updateActiveSection = () => {
      const viewportMarker = Math.max(140, window.innerHeight * 0.3);
      let currentId = targetIds[0];

      for (const id of targetIds) {
        const element = document.getElementById(id);
        if (!element) continue;

        if (element.getBoundingClientRect().top <= viewportMarker) {
          currentId = id;
        }
      }

      const isAtPageBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

      if (isAtPageBottom) {
        currentId = targetIds[targetIds.length - 1];
      }

      setActiveHref(`#${currentId}`);
    };

    const requestUpdate = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("hashchange", requestUpdate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("hashchange", requestUpdate);
    };
  }, [targetIds]);

  return (
    <nav className="mt-6 grid gap-2" aria-label={ariaLabel}>
      {items.map((item) => {
        const isActive = item.href === activeHref;

        return (
          <a
            key={item.href}
            href={item.href}
            aria-current={isActive ? "true" : undefined}
            onClick={() => setActiveHref(item.href)}
            className={cn(
              "flex min-h-11 items-center justify-between border-2 px-3 py-3 text-sm font-black uppercase tracking-tight transition-colors",
              isActive
                ? "border-foreground bg-foreground text-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                : "border-transparent border-t-foreground/15 hover:border-foreground hover:bg-background/15",
            )}
          >
            {item.label}
            <ArrowRight className={cn("h-4 w-4", isActive && "text-primary")} />
          </a>
        );
      })}
    </nav>
  );
}
