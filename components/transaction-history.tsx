"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownLeft } from "lucide-react"

interface TransactionEntry {
  TransactionID: number
  Time: string
  Description: string
  AccountName: string
  Direction: "IN" | "OUT"
  Amount: number
}

interface TransactionHistoryProps {
  transactions: TransactionEntry[]
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  // Group transactions by TransactionID
  const groupedTransactions = transactions.reduce(
    (acc, entry) => {
      if (!acc[entry.TransactionID]) {
        acc[entry.TransactionID] = {
          id: entry.TransactionID,
          time: entry.Time,
          description: entry.Description,
          entries: [],
        }
      }
      acc[entry.TransactionID].entries.push(entry)
      return acc
    },
    {} as Record<number, any>,
  )

  const transactionList = Object.values(groupedTransactions).slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Latest financial activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactionList.map((transaction) => (
            <div key={transaction.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">{new Date(transaction.time).toLocaleDateString()}</p>
                </div>
                <Badge variant="outline">#{transaction.id}</Badge>
              </div>

              <div className="grid gap-2">
                {transaction.entries.map((entry: TransactionEntry, index: number) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {entry.Direction === "IN" ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4 text-red-600" />
                      )}
                      <span>{entry.AccountName}</span>
                    </div>
                    <span className={`font-medium ${entry.Direction === "IN" ? "text-green-600" : "text-red-600"}`}>
                      {entry.Direction === "IN" ? "+" : "-"}${entry.Amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
