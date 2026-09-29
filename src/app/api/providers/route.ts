import { getServerProviders } from "@/lib/providers/service";
import { saveLocalProvider } from "@/lib/local/key-store";
import { providerSettingsSchema } from "@/lib/security/validation";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    providers: getServerProviders().map(({ configured, ...provider }) => ({
      ...provider,
      hasApiKey: configured
    }))
  });
}

export async function POST(request: Request) {
  const payload = providerSettingsSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: "Invalid provider settings", details: payload.error.flatten() }, { status: 400 });
  }

  saveLocalProvider(payload.data);

  return NextResponse.json({
    ok: true,
    providerId: payload.data.providerId,
    note: "Saved locally on this laptop in .local-data/providers.json with encrypted key material."
  });
}
