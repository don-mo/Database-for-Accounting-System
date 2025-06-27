"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Wallet, TrendingUp, TrendingDown, DollarSign } from "lucide-react"

interface Account {
  Name: string
  AccountType: string
  RemainingAmount: number
  CurrentBalance: number
  BudgetedAmount: number
  CategoryType: string
}

interface FinancialSummaryProps {
  accounts: Account[]
  totals: {
    assets: number
    liabilities: number
    equity: number
    balanceCheck: number
  }
}

export function FinancialSummary({ accounts, totals }: FinancialSummaryProps) {
  const bankAccounts = accounts.filter((a) => a.AccountType === "Bank")
  const fundAccounts = accounts.filter((a) => a.AccountType === "Fund")
  const expenseAccounts = accounts.filter((a) => a.AccountType === "Expense")

  const totalCash = bankAccounts.reduce((sum, acc) => sum + acc.CurrentBalance, 0)
  const totalFunds = fundAccounts.reduce((sum, acc) => sum + acc.RemainingAmount, 0)
  const totalBudgeted = expenseAccounts.reduce((sum, acc) => sum + acc.BudgetedAmount, 0)
  const totalSpent = expenseAccounts.reduce((sum, acc) => sum + acc.RemainingAmount, 0)

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Cash on Hand */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cash on Hand</CardTitle>
          <Wallet className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-700">${totalCash.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Available in bank accounts</p>
        </CardContent>
      </Card>

      {/* Total Funds */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Funds</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700">${totalFunds.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Grants and funding sources</p>
        </CardContent>
      </Card>

      {/* Budget Status */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
          <TrendingDown className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-700">
            ${totalSpent.toFixed(2)} / ${totalBudgeted.toFixed(2)}
          </div>
          <Progress value={totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0} className="mt-2" />
        </CardContent>
      </Card>

      {/* Net Worth */}
      <Card className="border-l-4 border-l-indigo-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
          <DollarSign className="h-4 w-4 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-indigo-700">${(totals.assets - totals.liabilities).toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Assets minus liabilities</p>
        </CardContent>
      </Card>

      {/* Detailed Account Breakdown */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>Current status of all your accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Bank Accounts */}
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">💰 Bank Accounts</h4>
              <div className="space-y-2">
                {bankAccounts.map((account, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span className="text-sm">{account.Name}</span>
                    <span className="font-medium text-blue-700">${account.CurrentBalance.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fund Accounts */}
            <div>
              <h4 className="font-semibold text-green-700 mb-2">🎯 Funding Sources</h4>
              <div className="space-y-2">
                {fundAccounts.map((account, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span className="text-sm">{account.Name}</span>
                    <span className="font-medium text-green-700">${account.RemainingAmount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expense Accounts */}
            <div>
              <h4 className="font-semibold text-purple-700 mb-2">📊 Event Budgets</h4>
              <div className="space-y-2">
                {expenseAccounts.map((account, index) => (
                  <div key={index} className="p-2 bg-purple-50 rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{account.Name}</span>
                      <span className="font-medium text-purple-700">
                        ${account.RemainingAmount.toFixed(2)} / ${account.BudgetedAmount.toFixed(2)}
                      </span>
                    </div>
                    <Progress
                      value={account.BudgetedAmount > 0 ? (account.RemainingAmount / account.BudgetedAmount) * 100 : 0}
                      className="mt-1 h-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
