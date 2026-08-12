import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: "linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #8b5cf6 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#0f172a",
          fontWeight: 900,
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(245, 158, 11, 0.4)",
        }}
      >
        I
      </div>
    ),
    { ...size }
  );
}
