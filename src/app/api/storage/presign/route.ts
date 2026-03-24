import { type NextRequest, NextResponse } from "next/server";
import { createPresignedUpload, getStorageLimits } from "@/lib/storage/s3";
import { createSupabaseServer } from "@/lib/supabase/server";

type PresignBody = {
  filename?: unknown;
  contentType?: unknown;
  size?: unknown;
  folder?: unknown;
};

function parseBody(body: PresignBody) {
  const { filename, contentType, size, folder } = body;

  if (!filename || typeof filename !== "string") {
    return { valid: false as const, error: "filename is required" };
  }

  if (!contentType || typeof contentType !== "string") {
    return { valid: false as const, error: "contentType is required" };
  }

  if (typeof size !== "number" || !Number.isFinite(size) || size <= 0) {
    return { valid: false as const, error: "size must be a positive number" };
  }

  if (folder !== undefined && typeof folder !== "string") {
    return { valid: false as const, error: "folder must be a string" };
  }

  return {
    valid: true as const,
    data: {
      filename,
      contentType,
      size,
      folder,
    },
  };
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as PresignBody;
    const parsed = parseBody(body);

    if (!parsed.valid) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const upload = await createPresignedUpload({
      ...parsed.data,
      folder: parsed.data.folder ? `${user.id}/${parsed.data.folder}` : user.id,
    });

    return NextResponse.json(upload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create upload URL";
    const status =
      message.startsWith("Unsupported MIME") || message.startsWith("File too large") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json(getStorageLimits());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Storage is not configured";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
