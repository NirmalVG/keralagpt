const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://localhost:8000"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const res = await fetch(`${FASTAPI_URL}/contribute/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json(
      { error: "Backend unavailable" },
      { status: 503 },
    )
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  try {
    const url = status
      ? `${FASTAPI_URL}/contribute/?status=${status}`
      : `${FASTAPI_URL}/contribute/`
    const res = await fetch(url, { cache: "no-store" })
    const data = await res.json()
    return Response.json(data)
  } catch {
    return Response.json([], { status: 503 })
  }
}
