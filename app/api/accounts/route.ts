import { NextResponse } from "next/server"
import db from "@/lib/database"

export async function GET() {
  try {
    const accounts = db
      .prepare(`
      SELECT a.*, c.Name as CategoryName, c.Type as CategoryType
      FROM Account a
      JOIN Category c ON a.CategoryID = c.CategoryID
      ORDER BY a.AccountType, a.Name
    `)
      .all()

    return NextResponse.json(accounts)
  } catch (error) {
    console.error("Error fetching accounts:", error)
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 })
  }
}
