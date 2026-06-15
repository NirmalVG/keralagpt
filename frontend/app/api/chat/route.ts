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
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Backend unavailable"
    return new Response(
      `data: Backend unavailable: ${message.replace(/\n/g, " ")}\n\ndata: [SOURCES][][/SOURCES]\n\ndata: [DONE]\n\n`,
      {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      },
    )
  }
  if (!upstream.ok) {
    const detail = await upstream.text()
    return new Response(`data: Backend error ${upstream.status}: ${detail.replace(/\n/g, " ")}\n\ndata: [SOURCES][][/SOURCES]\n\ndata: [DONE]\n\n`, {
      status: 200,
      headers: { "Content-Type": "text/event-stream" },
    })
  }
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
