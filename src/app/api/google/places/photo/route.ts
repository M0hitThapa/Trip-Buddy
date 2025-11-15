import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const photo_reference = searchParams.get("photo_reference");
    const maxwidth = searchParams.get("maxwidth") || "800";

    console.log("Photo request received:", { photo_reference, maxwidth });

    if (!photo_reference) {
      return NextResponse.json(
        { error: "Missing photo_reference" },
        { status: 400 }
      );
    }

    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key) {
      console.error("GOOGLE_MAPS_API_KEY not found in environment");
      return NextResponse.json(
        { error: "Missing GOOGLE_MAPS_API_KEY" },
        { status: 500 }
      );
    }

    const url = `https://maps.googleapis.com/maps/api/place/photo?photo_reference=${encodeURIComponent(photo_reference)}&maxwidth=${encodeURIComponent(maxwidth)}&key=${key}`;

    console.log("Fetching from Google:", url.replace(key, "***"));

    const res = await fetch(url, {
      // Add redirect follow explicitly
      redirect: "follow",
    });

    console.log("Google response:", {
      status: res.status,
      statusText: res.statusText,
      contentType: res.headers.get("content-type"),
      headers: Object.fromEntries(res.headers.entries()),
    });

    const contentType = res.headers.get("content-type") || "";

    if (!res.ok) {
      let message: unknown = undefined;
      try {
        message = await res.json();
      } catch {
        try {
          message = await res.text();
        } catch {}
      }
      console.error("Places photo fetch failed", {
        status: res.status,
        statusText: res.statusText,
        contentType,
        message,
      });
      return NextResponse.json(
        {
          error: "Google Places photo failed",
          status: res.status,
          statusText: res.statusText,
          message,
        },
        { status: 502 }
      );
    }

    if (!/^image\//i.test(contentType)) {
      console.error("Response is not an image:", contentType);
      return NextResponse.json(
        { error: "Response is not an image", contentType },
        { status: 502 }
      );
    }

    const buf = await res.arrayBuffer();
    console.log("Image buffer size:", buf.byteLength);

    return new NextResponse(Buffer.from(buf), {
      headers: {
        "Content-Type": contentType || "image/jpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e: unknown) {
    console.error("Places photo route error:", e);
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
