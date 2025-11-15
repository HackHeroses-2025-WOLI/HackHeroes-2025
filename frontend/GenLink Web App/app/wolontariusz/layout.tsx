import type { ReactNode } from "react";

export default function WolontariuszLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="flex flex-col gap-6 py-6">{children}</div>;
}
