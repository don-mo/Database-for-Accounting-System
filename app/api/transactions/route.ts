import { NextResponse } from "next/server"
import db from "@/lib/database"

export async function GET() {
  try {
    const transactions = await db.getTransactions()
    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { type, fromAccountId, toAccountId, amount, description } = await request.json()

    const result = await db.createTransaction(type, fromAccountId, toAccountId, amount, description)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get("id")

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID required" }, { status: 400 })
    }

    const result = await db.deleteTransaction(Number.parseInt(transactionId))
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error deleting transaction:", error)
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 })
  }
}
