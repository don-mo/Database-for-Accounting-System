"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, DollarSign, Target, CreditCard } from "lucide-react"

interface Account {
  AccountID: number
  Name: string
  AccountType: string
  RemainingAmount: number
  CurrentBalance: number
  BudgetedAmount: number
  CategoryType: string
}

interface AccountManagementProps {
  accounts: Account[]
  onAccountChange: () => void
}

export function AccountManagement({ accounts, onAccountChange }: AccountManagementProps) {
  const [loading, setLoading] = useState(false)
  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "Fund" as "Fund" | "Expense" | "Debt",
    amount: "",
  })

  const handleCreateAccount = async () => {
    if (!newAccount.name || !newAccount.amount) {
      alert("Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newAccount.name,
          type: newAccount.type,
          amount: Number.parseFloat(newAccount.amount),
        }),
      })

      if (response.ok) {
        setNewAccount({ name: "", type: "Fund", amount: "" })
        onAccountChange()
      } else {
        alert("Failed to create account")
      }
    } catch (error) {
      console.error("Error creating account:", error)
      alert("Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async (accountId: number, accountName: string) => {
    if (!confirm(`Are you sure you want to delete "${accountName}"? This can only be done if the balance is zero.`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/accounts?id=${accountId}`, {
        method: "DELETE",
      })

      const result = await response.json()
      if (result.success) {
        onAccountChange()
      } else {
        alert(result.error || "Failed to delete account")
      }
    } catch (error) {
      console.error("Error deleting account:", error)
      alert("Failed to delete account")
    } finally {
      setLoading(false)
    }
  }

  const fundAccounts = accounts.filter((a) => a.AccountType === "Fund")
  const expenseAccounts = accounts.filter((a) => a.AccountType === "Expense")
  const debtAccounts = accounts.filter((a) => a.AccountType === "Debt")

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-green-600" />
          Account Management
        </CardTitle>
        <CardDescription>Create new revenue sources, expense categories, and debt accounts</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Account</TabsTrigger>
            <TabsTrigger value="manage">Manage Accounts</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="account-name">Account Name</Label>
                <Input
                  id="account-name"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                  placeholder="e.g., HCP Donut Fundraiser"
                />
              </div>
              <div>
                <Label htmlFor="account-type">Account Type</Label>
                <Select
                  value={newAccount.type}
                  onValueChange={(value: "Fund" | "Expense" | "Debt") => setNewAccount({ ...newAccount, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fund">Revenue Source (Fund)</SelectItem>
                    <SelectItem value="Expense">Expense Category</SelectItem>
                    <SelectItem value="Debt">Debt Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="account-amount">
                  {newAccount.type === "Fund"
                    ? "Initial Amount"
                    : newAccount.type === "Expense"
                      ? "Budget Amount"
                      : "Debt Amount"}{" "}
                  ($)
                </Label>
                <Input
                  id="account-amount"
                  type="number"
                  step="0.01"
                  value={newAccount.amount}
                  onChange={(e) => setNewAccount({ ...newAccount, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <Button onClick={handleCreateAccount} disabled={loading} className="w-full">
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            {/* Revenue Sources */}
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-green-700 mb-3">
                <DollarSign className="h-5 w-5" />
                Revenue Sources
              </h3>
              <div className="grid gap-2">
                {fundAccounts.map((account) => (
                  <div key={account.AccountID} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <span className="font-medium">{account.Name}</span>
                      <Badge variant="outline" className="ml-2">
                        ${account.RemainingAmount.toFixed(2)}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAccount(account.AccountID, account.Name)}
                      disabled={loading || account.RemainingAmount !== 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Expense Categories */}
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-purple-700 mb-3">
                <Target className="h-5 w-5" />
                Expense Categories
              </h3>
              <div className="grid gap-2">
                {expenseAccounts.map((account) => (
                  <div
                    key={account.AccountID}
                    className="flex items-center justify-between p-3 bg-purple-50 rounded-lg"
                  >
                    <div>
                      <span className="font-medium">{account.Name}</span>
                      <Badge variant="outline" className="ml-2">
                        ${account.RemainingAmount.toFixed(2)} / ${account.BudgetedAmount.toFixed(2)}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAccount(account.AccountID, account.Name)}
                      disabled={loading || account.RemainingAmount !== 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Debt Accounts */}
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-red-700 mb-3">
                <CreditCard className="h-5 w-5" />
                Debt Accounts
              </h3>
              <div className="grid gap-2">
                {debtAccounts.map((account) => (
                  <div key={account.AccountID} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <span className="font-medium">{account.Name}</span>
                      <Badge variant="outline" className="ml-2">
                        ${account.CurrentBalance.toFixed(2)}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAccount(account.AccountID, account.Name)}
                      disabled={loading || account.CurrentBalance !== 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
