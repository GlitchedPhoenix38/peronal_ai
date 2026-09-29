import { getServerUsageMetrics } from "@/lib/providers/service";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ usage: getServerUsageMetrics() });
}
