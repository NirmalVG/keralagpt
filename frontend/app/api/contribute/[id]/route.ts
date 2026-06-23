const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://localhost:8000"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const body = await req.json()
    const res = await fetch(`${FASTAPI_URL}/contribute/${id}`, {
      method: "PATCH",
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
