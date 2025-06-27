import { NextResponse } from "next/server"
import db from "@/lib/database"

export async function GET() {
  try {
    const accounts = await db.getAccounts()
    return NextResponse.json(accounts)
  } catch (error) {
    console.error("Error fetching accounts:", error)
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, type, amount } = await request.json()
    const result = await db.createAccount(name, type, amount || 0)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error creating account:", error)
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get("id")

    if (!accountId) {
      return NextResponse.json({ error: "Account ID required" }, { status: 400 })
    }

    const result = await db.deleteAccount(Number.parseInt(accountId))
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error deleting account:", error)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}
