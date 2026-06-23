const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://localhost:8000"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const res = await fetch(`${FASTAPI_URL}/feedback/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch {
    // Feedback is non-critical — don't fail loudly
    return Response.json({ status: "ok", message: "Feedback noted" })
  }
}

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_URL}/feedback/stats`, { cache: "no-store" })
    const data = await res.json()
    return Response.json(data)
  } catch {
    return Response.json({ total: 0, positive: 0, negative: 0, reports: 0 })
  }
}
