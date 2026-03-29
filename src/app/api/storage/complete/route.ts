import { type NextRequest, NextResponse } from "next/server";
import { isOwnedObjectKey, verifyUpload } from "@/lib/storage/s3";
import { createSupabaseServer } from "@/lib/supabase/server";

type CompleteBody = {
  key?: unknown;
  filename?: unknown;
  contentType?: unknown;
  size?: unknown;
  status?: unknown;
};

function parseBody(body: CompleteBody) {
  const { key, filename, contentType, size, status } = body;

  if (!key || typeof key !== "string") {
    return { valid: false as const, error: "key is required" };
  }

  if (!filename || typeof filename !== "string") {
    return { valid: false as const, error: "filename is required" };
  }

  if (!contentType || typeof contentType !== "string") {
    return { valid: false as const, error: "contentType is required" };
  }

  if (typeof size !== "number" || !Number.isFinite(size) || size <= 0) {
    return { valid: false as const, error: "size must be a positive number" };
  }

  if (status !== undefined && status !== "uploaded" && status !== "failed") {
    return { valid: false as const, error: "status must be 'uploaded' or 'failed'" };
  }

  return {
    valid: true as const,
    data: {
      key,
      filename,
      contentType,
      size,
      status: status === "failed" ? "failed" : "uploaded",
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
    const body = (await request.json()) as CompleteBody;
    const parsed = parseBody(body);

    if (!parsed.valid) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    if (!isOwnedObjectKey(user.id, parsed.data.key)) {
      return NextResponse.json(
        { error: "Object key does not belong to current user" },
        { status: 403 },
      );
    }

    // Verify the S3 object actually exists and matches claimed metadata
    if (parsed.data.status === "uploaded") {
      const verification = await verifyUpload(parsed.data.key);
      if (!verification.exists) {
        return NextResponse.json({ error: "Upload not found in storage" }, { status: 404 });
      }
    }

    const { data, error } = await supabase
      .from("files")
      .upsert(
        {
          user_id: user.id,
          storage_provider: process.env.S3_PROVIDER || "s3",
          bucket: process.env.S3_BUCKET,
          object_key: parsed.data.key,
          original_filename: parsed.data.filename,
          content_type: parsed.data.contentType,
          size_bytes: parsed.data.size,
          status: parsed.data.status,
        },
        { onConflict: "object_key" },
      )
      .select("id, object_key, status, content_type, size_bytes, original_filename, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ file: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to record file upload";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
