import { getProviderAdapter } from "@/lib/providers/adapters";
import { getServerProviders } from "@/lib/providers/service";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ providerId: string }> }) {
  const { providerId } = await params;
  const provider = getServerProviders().find((item) => item.id === providerId);
  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  const result = await getProviderAdapter(provider.id).testConnection();

  return NextResponse.json({
    providerId,
    status: result.ok ? "healthy" : provider.status,
    configured: provider.configured,
    latencyMs: result.latencyMs ?? null,
    error: result.error
  });
}
