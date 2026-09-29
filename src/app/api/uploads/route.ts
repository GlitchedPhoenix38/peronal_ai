import { NextResponse } from "next/server";
import { z } from "zod";

const uploadSchema = z.object({
  name: z.string().min(1).max(160),
  mimeType: z.string().min(1).max(120),
  sizeBytes: z.number().int().positive().max(25 * 1024 * 1024)
});

export async function POST(request: Request) {
  const payload = uploadSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: "Invalid upload metadata", details: payload.error.flatten() }, { status: 400 });
  }

  return NextResponse.json({
    uploadId: crypto.randomUUID(),
    kind: payload.data.mimeType.startsWith("image/") ? "image" : "file",
    note: "Connect this endpoint to object storage for signed uploads in production."
  });
}
