import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const slug = (searchParams.get("slug") || "roast-pune").trim();
  const staffCode = searchParams.get("staffCode")?.trim();
  const format = (searchParams.get("format") || "svg").toLowerCase();
  const download = searchParams.get("download") === "true";

  // Base App URL from env or request origin
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    `${request.nextUrl.protocol}//${request.nextUrl.host}`;

  // Permanent Short Redirect Target (Section 7 Trap #9 & Trap #10)
  const staffQuery = staffCode ? `?s=${encodeURIComponent(staffCode)}` : "";
  const targetUrl = `${baseUrl}/q/${slug}${staffQuery}`;

  const options: QRCode.QRCodeToStringOptions = {
    type: "svg",
    errorCorrectionLevel: "H", // High 30% error correction enables logo overlay without breaking scans
    margin: 2,
    width: 512,
    color: {
      dark: "#1e1b18",
      light: "#ffffff",
    },
  };

  try {
    if (format === "png") {
      const pngBuffer = await QRCode.toBuffer(targetUrl, {
        errorCorrectionLevel: "H",
        margin: 2,
        width: 600,
        color: {
          dark: "#1e1b18",
          light: "#ffffff",
        },
      });

      const fileName = `qr-${slug}${staffCode ? `-${staffCode}` : ""}.png`;
      return new NextResponse(new Uint8Array(pngBuffer), {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=3600",
          ...(download
            ? { "Content-Disposition": `attachment; filename="${fileName}"` }
            : {}),
        },
      });
    }

    if (format === "dataurl") {
      const dataUrl = await QRCode.toDataURL(targetUrl, {
        errorCorrectionLevel: "H",
        margin: 2,
        width: 600,
      });

      return NextResponse.json({
        targetUrl,
        dataUrl,
        slug,
        staffCode: staffCode || null,
      });
    }

    // Default: SVG format
    const svgString = await QRCode.toString(targetUrl, options);
    const fileName = `qr-${slug}${staffCode ? `-${staffCode}` : ""}.svg`;

    return new NextResponse(svgString, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
        ...(download
          ? { "Content-Disposition": `attachment; filename="${fileName}"` }
          : {}),
      },
    });
  } catch (error: unknown) {
    console.error("QR Code Generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}

