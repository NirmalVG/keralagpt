const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://localhost:8000"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const res = await fetch(`${FASTAPI_URL}/conversations/${sessionId}`, { cache: "no-store" })
    const data = await res.json()
    return Response.json(data)
  } catch {
    return Response.json([])
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const res = await fetch(`${FASTAPI_URL}/conversations/${sessionId}`, {
      method: "DELETE",
    })
    const data = await res.json()
    return Response.json(data)
  } catch {
    return Response.json({ status: "ok" })
  }
}
