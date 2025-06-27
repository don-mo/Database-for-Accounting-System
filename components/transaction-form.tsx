"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRightLeft, TrendingUp, TrendingDown } from "lucide-react"

interface Account {
  AccountID: number
  Name: string
  AccountType: string
  RemainingAmount: number
  CurrentBalance: number
  CategoryName: string
}

interface TransactionFormProps {
  accounts: Account[]
  onTransactionComplete: () => void
}

export function TransactionForm({ accounts, onTransactionComplete }: TransactionFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fromAccountId: "",
    toAccountId: "",
    amount: "",
    description: "",
  })

  const handleSubmit = async (type: "transfer" | "income" | "expense") => {
    if (!formData.fromAccountId || !formData.toAccountId || !formData.amount) {
      alert("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          fromAccountId: Number.parseInt(formData.fromAccountId),
          toAccountId: Number.parseInt(formData.toAccountId),
          amount: Number.parseFloat(formData.amount),
          description: formData.description,
        }),
      })

      if (response.ok) {
        setFormData({ fromAccountId: "", toAccountId: "", amount: "", description: "" })
        onTransactionComplete()
      } else {
        alert("Transaction failed")
      }
    } catch (error) {
      console.error("Transaction error:", error)
      alert("Transaction failed")
    } finally {
      setLoading(false)
    }
  }

  const cashAndDebtAccounts = accounts.filter((a) => a.AccountType === "Bank" || a.AccountType === "Debt")
  const fundAccounts = accounts.filter((a) => a.AccountType === "Fund")
  const expenseAccounts = accounts.filter((a) => a.AccountType === "Expense")

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5 text-blue-600" />
          Record Transaction
        </CardTitle>
        <CardDescription>Simple money tracking without accounting complexity</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="transfer" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transfer" className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              Transfer
            </TabsTrigger>
            <TabsTrigger value="income" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Income
            </TabsTrigger>
            <TabsTrigger value="expense" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Expense
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transfer" className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Transfer:</strong> Move money from one account to another (e.g., from checking to event budget)
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="from-transfer">From Account</Label>
                <Select
                  value={formData.fromAccountId}
                  onValueChange={(value) => setFormData({ ...formData, fromAccountId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.AccountID} value={account.AccountID.toString()}>
                        {account.Name} ($
                        {account.AccountType === "Bank" ? account.CurrentBalance : account.RemainingAmount})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="to-transfer">To Account</Label>
                <Select
                  value={formData.toAccountId}
                  onValueChange={(value) => setFormData({ ...formData, toAccountId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.AccountID} value={account.AccountID.toString()}>
                        {account.Name} ($
                        {account.AccountType === "Bank" ? account.CurrentBalance : account.RemainingAmount})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="amount-transfer">Amount ($)</Label>
              <Input
                id="amount-transfer"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="description-transfer">Description</Label>
              <Textarea
                id="description-transfer"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What is this transfer for?"
              />
            </div>
            <Button
              onClick={() => handleSubmit("transfer")}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Processing..." : "Record Transfer"}
            </Button>
          </TabsContent>

          <TabsContent value="income" className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Income:</strong> Record money coming in (e.g., membership dues, grants, fundraising)
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cash-income">Cash/Debt Account</Label>
                <Select
                  value={formData.fromAccountId}
                  onValueChange={(value) => setFormData({ ...formData, fromAccountId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Where does the money go?" />
                  </SelectTrigger>
                  <SelectContent>
                    {cashAndDebtAccounts.map((account) => (
                      <SelectItem key={account.AccountID} value={account.AccountID.toString()}>
                        {account.Name} ($
                        {account.AccountType === "Bank" ? account.CurrentBalance : account.CurrentBalance})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="revenue-income">Revenue Source</Label>
                <Select
                  value={formData.toAccountId}
                  onValueChange={(value) => setFormData({ ...formData, toAccountId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="What type of income?" />
                  </SelectTrigger>
                  <SelectContent>
                    {fundAccounts.map((account) => (
                      <SelectItem key={account.AccountID} value={account.AccountID.toString()}>
                        {account.Name} (${account.RemainingAmount})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="amount-income">Amount ($)</Label>
              <Input
                id="amount-income"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="description-income">Description</Label>
              <Textarea
                id="description-income"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Where did this money come from?"
              />
            </div>
            <Button
              onClick={() => handleSubmit("income")}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? "Processing..." : "Record Income"}
            </Button>
          </TabsContent>

          <TabsContent value="expense" className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>Expense:</strong> Record money spent (e.g., event costs, supplies, food)
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cash-expense">Cash/Debt Account</Label>
                <Select
                  value={formData.fromAccountId}
                  onValueChange={(value) => setFormData({ ...formData, fromAccountId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Where does money come from?" />
                  </SelectTrigger>
                  <SelectContent>
                    {cashAndDebtAccounts.map((account) => (
                      <SelectItem key={account.AccountID} value={account.AccountID.toString()}>
                        {account.Name} ($
                        {account.AccountType === "Bank" ? account.CurrentBalance : account.CurrentBalance})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="expense-category">Expense Category</Label>
                <Select
                  value={formData.toAccountId}
                  onValueChange={(value) => setFormData({ ...formData, toAccountId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="What was this for?" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseAccounts.map((account) => (
                      <SelectItem key={account.AccountID} value={account.AccountID.toString()}>
                        {account.Name} (Budget: ${account.BudgetedAmount}, Used: ${account.RemainingAmount})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="amount-expense">Amount ($)</Label>
              <Input
                id="amount-expense"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="description-expense">Description</Label>
              <Textarea
                id="description-expense"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What did you spend this money on?"
              />
            </div>
            <Button
              onClick={() => handleSubmit("expense")}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {loading ? "Processing..." : "Record Expense"}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
