import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const volunteers = 18;
  const etaMinutes = 12;

  return NextResponse.json({ volunteers, etaMinutes });
}
