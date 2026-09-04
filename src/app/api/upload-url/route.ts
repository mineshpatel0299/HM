import { NextResponse } from "next/server";
import { assertCoupleMember, CoupleAccessError } from "@/lib/db/assertCoupleMember";
import { buildObjectKey, getPublicUrl, getUploadUrl } from "@/lib/storage/r2";

// Both get interpolated straight into the R2 object key, so they're
// validated as narrow segments rather than checked against a feature
// allowlist future phases would otherwise need to keep updating.
const SAFE_SEGMENT = /^[a-z0-9][a-z0-9_-]{0,31}$/;
const SAFE_EXT = /^[a-z0-9]{1,10}$/i;
const SAFE_CONTENT_TYPE = /^[\w.+-]+\/[\w.+-]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const coupleId = typeof body?.coupleId === "string" ? body.coupleId : null;
  const feature = typeof body?.feature === "string" ? body.feature : null;
  const contentType = typeof body?.contentType === "string" ? body.contentType : null;
  const ext = typeof body?.ext === "string" ? body.ext : null;

  if (!coupleId || !feature || !contentType || !ext) {
    return NextResponse.json(
      { error: "Missing coupleId, feature, contentType, or ext." },
      { status: 400 },
    );
  }
  if (!SAFE_SEGMENT.test(feature)) {
    return NextResponse.json({ error: "Invalid feature name." }, { status: 400 });
  }
  if (!SAFE_EXT.test(ext)) {
    return NextResponse.json({ error: "Invalid file extension." }, { status: 400 });
  }
  if (!SAFE_CONTENT_TYPE.test(contentType)) {
    return NextResponse.json({ error: "Invalid content type." }, { status: 400 });
  }

  try {
    await assertCoupleMember(coupleId);
  } catch (error) {
    if (error instanceof CoupleAccessError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    throw error;
  }

  const key = buildObjectKey(coupleId, feature, ext);
  const uploadUrl = await getUploadUrl(key, contentType);
  const publicUrl = getPublicUrl(key);

  return NextResponse.json({ uploadUrl, publicUrl, key });
}
