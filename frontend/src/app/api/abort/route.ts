import { NextResponse } from "next/server";

export async function POST() {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
  try {
    const res = await fetch(`${backendUrl}/abort`, { method: "POST" });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ aborted: false, reason: "backend_unreachable" });
  }
}
