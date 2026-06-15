const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://localhost:8000"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const upstreamUrl = new URL("/retrieve/", FASTAPI_URL)
  url.searchParams.forEach((value, key) => upstreamUrl.searchParams.set(key, value))

  try {
    const res = await fetch(upstreamUrl, { cache: "no-store" })
    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch (error) {
    return Response.json(
      {
        status: "error",
        message:
          error instanceof Error ? error.message : "Backend unavailable",
      },
      { status: 503 },
    )
  }
}
