"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownLeft, Trash2 } from "lucide-react"

interface TransactionEntry {
  TransactionID: number
  Time: string
  Description: string
  AccountName: string
  Direction: "IN" | "OUT"
  Amount: number
}

interface TransactionHistoryProps {
  transactions?: TransactionEntry[] /*  <-- can be undefined */
  onTransactionChange: () => void
}

export function TransactionHistory({
  transactions = [] /* 1️⃣ safe default   */,
  onTransactionChange,
}: TransactionHistoryProps) {
  const [loading, setLoading] = useState(false)

  /* 2️⃣ be certain we’re working with an array */
  const txArray: TransactionEntry[] = Array.isArray(transactions) ? transactions : []

  /* -------- group by TransactionID -------- */
  const grouped = txArray.reduce<Record<number, any>>((acc, entry) => {
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
  }, {})

  const list = Object.values(grouped).slice(0, 10)

  /* -------- delete helper (unchanged) ------ */
  const handleDeleteTransaction = async (id: number, description: string) => {
    if (!confirm(`Delete "${description}"? This will reverse the changes.`)) return
    setLoading(true)
    try {
      const res = await fetch(`/api/transactions?id=${id}`, { method: "DELETE" })
      const json = await res.json()
      if (json.success) onTransactionChange()
      else alert(json.error || "Failed to delete")
    } catch (err) {
      console.error(err)
      alert("Failed to delete")
    } finally {
      setLoading(false)
    }
  }

  /* -------- UI (unchanged) ----------------- */
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Latest financial activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {list.map((tx) => (
            <div key={tx.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{tx.description}</p>
                  <p className="text-sm text-muted-foreground">{new Date(tx.time).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">#{tx.id}</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTransaction(tx.id, tx.description)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                {tx.entries.map((e: TransactionEntry, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {e.Direction === "IN" ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4 text-red-600" />
                      )}
                      <span>{e.AccountName}</span>
                    </div>
                    <span className={`font-medium ${e.Direction === "IN" ? "text-green-600" : "text-red-600"}`}>
                      {e.Direction === "IN" ? "+" : "-"}${e.Amount.toFixed(2)}
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
