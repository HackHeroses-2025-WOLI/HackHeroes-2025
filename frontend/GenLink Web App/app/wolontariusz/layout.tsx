"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { useRequireAuth } from "@/hooks/use-require-auth";

export default function WolontariuszLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const p = pathname ?? "";

  const requireAuth = /^\/wolontariusz(?!\/(?:login|rejestracja)(?:\/|$))/.test(p);

  useRequireAuth("/wolontariusz/login", requireAuth);

  return <div className="flex flex-col gap-6 py-6">{children}</div>;
}
