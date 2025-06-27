import { NextResponse } from "next/server"
import db from "@/lib/database"

export async function GET() {
  try {
    const transactions = db
      .prepare(`
      SELECT 
        t.TransactionID,
        t.Time,
        t.Description,
        te.EntryID,
        a.Name as AccountName,
        te.Direction,
        te.Amount
      FROM Transactions t
      JOIN TransactionEntry te ON t.TransactionID = te.TransactionID
      JOIN Account a ON te.AccountID = a.AccountID
      ORDER BY t.TransactionID DESC, te.EntryID
    `)
      .all()

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { type, fromAccountId, toAccountId, amount, description } = await request.json()

    const insertTransaction = db.prepare(`
      INSERT INTO Transactions (Time, Description)
      VALUES (date('now'), ?)
    `)

    const insertEntry = db.prepare(`
      INSERT INTO TransactionEntry (TransactionID, AccountID, Amount, Direction)
      VALUES (?, ?, ?, ?)
    `)

    const updateAccount = db.prepare(`
      UPDATE Account 
      SET RemainingAmount = RemainingAmount + ?,
          CurrentBalance = CurrentBalance + ?
      WHERE AccountID = ?
    `)

    const transaction = db.transaction(() => {
      const result = insertTransaction.run(description)
      const transactionId = result.lastInsertRowid

      if (type === "transfer") {
        // Transfer: money out of fromAccount, into toAccount
        insertEntry.run(transactionId, fromAccountId, amount, "OUT")
        insertEntry.run(transactionId, toAccountId, amount, "IN")

        updateAccount.run(-amount, -amount, fromAccountId)
        updateAccount.run(amount, amount, toAccountId)
      } else if (type === "income") {
        // Income: money into both accounts (cash + revenue tracking)
        insertEntry.run(transactionId, fromAccountId, amount, "IN") // Cash account
        insertEntry.run(transactionId, toAccountId, amount, "IN") // Revenue account

        updateAccount.run(amount, amount, fromAccountId)
        updateAccount.run(amount, amount, toAccountId)
      } else if (type === "expense") {
        // Expense: money out of cash, into expense tracking
        insertEntry.run(transactionId, fromAccountId, amount, "OUT") // Cash account
        insertEntry.run(transactionId, toAccountId, amount, "IN") // Expense account

        updateAccount.run(-amount, -amount, fromAccountId)
        updateAccount.run(amount, amount, toAccountId)
      }
    })

    transaction()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}
