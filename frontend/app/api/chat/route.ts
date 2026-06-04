const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://localhost:8000"

export async function POST(req: Request) {
  const body = await req.json()

  const upstream = await fetch(`${FASTAPI_URL}/chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!upstream.ok) {
    return new Response("Backend error", { status: upstream.status })
  }

  // Pass the SSE stream straight through to the browser
  // next.js passes the ReadableStream body unchanged
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
