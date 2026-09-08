import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title") ?? "Wholly Quran";
  const subtitle = searchParams.get("subtitle") ?? "Quran Memorization Platform";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1c1917 0%, #292524 50%, #44403c 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 50,
            fontSize: 120,
            opacity: 0.08,
            color: "#d97706",
          }}
        >
          ﴿
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 60px",
          }}
        >
          <div
            style={{
              fontSize: 28,
              color: "#d97706",
              letterSpacing: 6,
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            WHOLLY QURAN
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: "bold",
              color: "#fafaf9",
              textAlign: "center",
              lineHeight: 1.2,
              maxWidth: 900,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 24,
              color: "#a8a29e",
              marginTop: 20,
              textAlign: "center",
              maxWidth: 700,
            }}
          >
            {subtitle}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#78716c",
            fontSize: 16,
          }}
        >
          whollyquran.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
