"use client"

import { useState, useEffect } from "react"
import { TransactionForm } from "@/components/transaction-form"
import { FinancialSummary } from "@/components/financial-summary"
import { TransactionHistory } from "@/components/transaction-history"
import { AccountManagement } from "@/components/account-management"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Users, Code } from "lucide-react"

export default function Home() {
  const blankSummary = {
    categoryTotals: [],
    accountBalances: [],
    totals: { assets: 0, liabilities: 0, equity: 0, balanceCheck: 0 },
  }
  const [summary, setSummary] = useState(blankSummary)
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [accountsRes, transactionsRes, summaryRes] = await Promise.all([
        fetch("/api/accounts"),
        fetch("/api/transactions"),
        fetch("/api/summary"),
      ])

      const accountsData = await accountsRes.json()
      const transactionsData = await transactionsRes.json()
      const summaryData = await summaryRes.json()

      setAccounts(accountsData)
      setTransactions(transactionsData)
      setSummary(summaryData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your financial data...</p>
        </div>
      </div>
    )
  }

  if (!summary || !summary.totals) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading&hellip;</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-600 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Husky Coding Project</h1>
                <p className="text-sm text-gray-600">Financial Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>University of Washington</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Code className="h-5 w-5" />
              Welcome to Club Finance Tracker
            </CardTitle>
            <CardDescription className="text-blue-100">
              Simple financial management for student organizations - no accounting degree required! Track your funds,
              budgets, expenses, and debts with ease.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Financial Summary */}
        <div className="mb-8">
          <FinancialSummary accounts={summary.accountBalances} totals={summary.totals} />
        </div>

        {/* Account Management */}
        <div className="mb-8">
          <AccountManagement accounts={accounts} onAccountChange={fetchData} />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Transaction Form */}
          <div>
            <TransactionForm accounts={accounts} onTransactionComplete={fetchData} />
          </div>

          {/* Transaction History */}
          <div>
            <TransactionHistory transactions={transactions} onTransactionChange={fetchData} />
          </div>
        </div>

        {/* Balance Sheet Info */}
        <Card className="mt-8 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-gray-800">📊 Financial Health Check</CardTitle>
            <CardDescription>
              Your organization follows the fundamental accounting equation: Assets = Liabilities + Equity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-blue-100 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">${summary.totals.assets.toFixed(2)}</div>
                <div className="text-sm text-blue-600">Assets (What you have)</div>
              </div>
              <div className="text-center p-4 bg-red-100 rounded-lg">
                <div className="text-2xl font-bold text-red-700">${summary.totals.liabilities.toFixed(2)}</div>
                <div className="text-sm text-red-600">Liabilities (What you owe)</div>
              </div>
              <div className="text-center p-4 bg-green-100 rounded-lg">
                <div className="text-2xl font-bold text-green-700">${summary.totals.equity.toFixed(2)}</div>
                <div className="text-sm text-green-600">Equity (Assets - Liabilities)</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Balance Check: {Math.abs(summary.totals.balanceCheck) < 0.01 ? "✅ Balanced" : "⚠️ Needs Review"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
