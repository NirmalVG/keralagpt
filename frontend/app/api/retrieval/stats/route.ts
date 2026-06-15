const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://localhost:8000"

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_URL}/retrieve/stats`, {
      cache: "no-store",
    })
    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch (error) {
    return Response.json(
      {
        status: "error",
        total_documents: 0,
        total_chunks: 0,
        documents_by_domain: {},
        message:
          error instanceof Error ? error.message : "Backend unavailable",
      },
      { status: 503 },
    )
  }
}
