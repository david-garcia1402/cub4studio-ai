import { NextResponse } from "next/server";
import { createAiProvider } from "@/lib/ai-provider";
import { parseBriefing } from "@/lib/briefing";

export const runtime = "nodejs";

const hits = new Map<string, { count: number; reset: number }>();

function limited(ip: string): boolean {
  const now = Date.now();
  const slot = hits.get(ip);
  if (!slot || slot.reset < now) {
    hits.set(ip, { count: 1, reset: now + 60_000 });
    return false;
  }
  slot.count += 1;
  return slot.count > 20;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) {
    return NextResponse.json({ error: "Muitas tentativas. Espere um minuto." }, { status: 429 });
  }

  const raw = await request.text();
  if (raw.length > 20_000) {
    return NextResponse.json({ error: "Briefing grande demais." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const record = body as { briefing?: unknown; idempotencyKey?: unknown };
  const briefing = parseBriefing(record.briefing);
  if (!briefing) {
    return NextResponse.json(
      { error: "Faltam nome do negócio, oferta ou objetivo." },
      { status: 400 },
    );
  }

  const id =
    typeof record.idempotencyKey === "string" && /^[a-zA-Z0-9-]{8,80}$/.test(record.idempotencyKey)
      ? record.idempotencyKey
      : crypto.randomUUID();

  try {
    const result = await createAiProvider().compose(briefing, id);
    return NextResponse.json({
      source: result.source,
      project: {
        id,
        briefing,
        schema: result.schema,
        createdAt: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "O provedor de IA não respondeu um projeto válido. Nada foi cobrado." },
      { status: 503 },
    );
  }
}
