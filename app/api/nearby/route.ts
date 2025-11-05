// app/api/nearby/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")
  const type = searchParams.get("type")

  if (!lat || !lng || !type) {
    return NextResponse.json({ error: "Missing query params" }, { status: 400 })
  }

  const amenity = type === "pharmacies" ? "pharmacy" : "doctors"
  const radius = 3000 // meters

  const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];node[amenity=${amenity}](around:${radius},${lat},${lng});out;`

  try {
    const response = await fetch(overpassUrl)
    const data = await response.json()

    const results = data.elements.map((item: any) => ({
      name: item.tags?.name || "Unnamed",
      lat: item.lat,
      lng: item.lon,
    }))

    return NextResponse.json({ results })
  } catch (err) {
    console.error("Overpass API error:", err)
    return NextResponse.json({ error: "Failed to fetch nearby services" }, { status: 500 })
  }
}
