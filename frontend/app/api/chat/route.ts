// app/api/chat/route.ts
const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://localhost:8000"

export async function POST(req: Request) {
  const body = await req.json()
  let upstream: Response
  try {
    upstream = await fetch(`${FASTAPI_URL}/chat/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  } catch {
    return new Response("data: Backend unavailable.\\n\ndata: [DONE]\n\n", {
      status: 200,
      headers: { "Content-Type": "text/event-stream" },
    })
  }
  if (!upstream.ok)
    return new Response(`Backend error: ${upstream.status}`, {
      status: upstream.status,
    })
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
