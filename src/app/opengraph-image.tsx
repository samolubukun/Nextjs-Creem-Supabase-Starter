import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "72px",
        background: "linear-gradient(135deg, #0f172a 0%, #111827 45%, #1d4ed8 100%)",
        color: "#f8fafc",
      }}
    >
      <div style={{ fontSize: 28, textTransform: "uppercase", letterSpacing: 4, opacity: 0.9 }}>
        SAASXCREEM
      </div>
      <div
        style={{
          marginTop: 20,
          fontSize: 72,
          lineHeight: 1,
          fontWeight: 800,
          maxWidth: 980,
        }}
      >
        Next.js + Supabase + Creem Boilerplate
      </div>
      <div style={{ marginTop: 28, fontSize: 30, opacity: 0.85, maxWidth: 920 }}>
        Production-ready SaaS starter with auth, subscriptions, credits, and webhooks.
      </div>
    </div>,
    size,
  );
}
