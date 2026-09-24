import { NextResponse } from "next/server";
import { applyLocalEdit } from "@/lib/compose";
import type { WebsiteSchema } from "@/lib/types";
import { clean } from "@/lib/text";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > 40_000) {
    return NextResponse.json({ error: "Pedido grande demais." }, { status: 413 });
  }

  let body: { schema?: WebsiteSchema; instruction?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const instruction = clean(body.instruction, 200);
  if (!instruction || !body.schema?.project?.id || !body.schema.theme) {
    return NextResponse.json({ error: "Diga o ajuste e envie o projeto." }, { status: 400 });
  }

  if (process.env.AI_GENERATION_ENABLED === "true") {
    return NextResponse.json(
      { error: "Ajuste por IA paga ainda não está ligado. Use o compositor local." },
      { status: 503 },
    );
  }

  return NextResponse.json({
    source: "local",
    schema: applyLocalEdit(body.schema, instruction),
  });
}
