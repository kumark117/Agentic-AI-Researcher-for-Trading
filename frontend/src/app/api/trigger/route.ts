import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

  let res: Response;
  try {
    res = await fetch(`${backendUrl}/research`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    return NextResponse.json(
      { error: `Cannot reach backend at ${backendUrl}` },
      { status: 502 },
    );
  }

  if (!res.ok) {
    return NextResponse.json({ error: `Backend returned ${res.status}` }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
