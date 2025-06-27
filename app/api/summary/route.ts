import { NextResponse } from "next/server"
import db from "@/lib/database"

export async function GET() {
  try {
    const summary = await db.getSummary()
    return NextResponse.json(summary)
  } catch (error) {
    console.error("Error fetching summary:", error)
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 })
  }
}
