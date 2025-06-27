import { NextResponse } from "next/server"
import db from "@/lib/database"

export async function GET() {
  try {
    // Get category totals
    const categoryTotals = db
      .prepare(`
      SELECT
        c.Name as CategoryName,
        c.Type as CategoryType,
        SUM(
          CASE
            WHEN te.Direction = 'IN' THEN te.Amount
            WHEN te.Direction = 'OUT' THEN -te.Amount
            ELSE 0
          END
        ) as NetAmount
      FROM Category c
      JOIN Account a ON a.CategoryID = c.CategoryID
      LEFT JOIN TransactionEntry te ON te.AccountID = a.AccountID
      GROUP BY c.CategoryID, c.Name, c.Type
    `)
      .all()

    // Get account balances
    const accountBalances = db
      .prepare(`
      SELECT
        a.Name,
        a.AccountType,
        a.RemainingAmount,
        a.CurrentBalance,
        a.BudgetedAmount,
        c.Type as CategoryType
      FROM Account a
      JOIN Category c ON a.CategoryID = c.CategoryID
      ORDER BY a.AccountType, a.Name
    `)
      .all()

    // Calculate totals
    const assets = categoryTotals.find((c) => c.CategoryType === "Asset")?.NetAmount || 0
    const liabilities = categoryTotals.find((c) => c.CategoryType === "Liability")?.NetAmount || 0
    const equity = categoryTotals.find((c) => c.CategoryType === "Equity")?.NetAmount || 0

    return NextResponse.json({
      categoryTotals,
      accountBalances,
      totals: {
        assets,
        liabilities,
        equity,
        balanceCheck: assets - liabilities - equity,
      },
    })
  } catch (error) {
    console.error("Error fetching summary:", error)
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 })
  }
}
