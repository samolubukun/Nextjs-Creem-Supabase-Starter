import { type NextRequest, NextResponse } from "next/server";
import { createPresignedDownload } from "@/lib/storage/s3";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fileId = request.nextUrl.searchParams.get("fileId");
  if (!fileId) {
    return NextResponse.json({ error: "fileId is required" }, { status: 400 });
  }

  try {
    const { data: file, error } = await supabase
      .from("files")
      .select("id, object_key, status, user_id")
      .eq("id", fileId)
      .eq("user_id", user.id)
      .single();

    if (error || !file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (file.status !== "uploaded") {
      return NextResponse.json({ error: "File is not available for download" }, { status: 400 });
    }

    const download = await createPresignedDownload(file.object_key);
    return NextResponse.json(download);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create download URL";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
