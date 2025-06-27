import { supabase } from "./supabase"

/* … (all interfaces stay the same) … */

export const db = {
  /* ---------- ACCOUNTS ---------- */
  getAccounts: async () => {
    const [{ data: accounts, error: accErr }, { data: categories, error: catErr }] = await Promise.all([
      supabase.from("account").select("*"),
      supabase.from("category").select("*"),
    ])
    if (accErr) throw accErr
    if (catErr) throw catErr

    return accounts.map((a: any) => {
      const c = categories.find((cat: any) => cat.CategoryID === a.CategoryID)
      return { ...a, CategoryName: c?.Name, CategoryType: c?.Type }
    })
  },

  /* ---------- TRANSACTIONS & ENTRIES ---------- */
  getTransactions: async () => {
    const [{ data: entries, error: entErr }, { data: txns, error: txnErr }, { data: accts, error: acctErr }] =
      await Promise.all([
        supabase.from("transactionentry").select("*"),
        supabase.from("transactions").select("TransactionID, Time, Description"),
        supabase.from("account").select("AccountID, Name"),
      ])
    if (entErr) throw entErr
    if (txnErr) throw txnErr
    if (acctErr) throw acctErr

    return entries.map((e: any) => {
      const t = txns.find((tx: any) => tx.TransactionID === e.TransactionID)
      const a = accts.find((ac: any) => ac.AccountID === e.AccountID)
      return { ...e, Time: t?.Time, Description: t?.Description, AccountName: a?.Name }
    })
  },

  /* ---------- CREATE / DELETE ACCOUNT ---------- */
  createAccount: async (name: string, type: "Fund" | "Expense" | "Debt", amount = 0) => {
    const categoryId = type === "Fund" ? 2 : type === "Expense" ? 3 : 5
    const { data, error } = await supabase
      .from("account")
      .insert([
        {
          Name: name,
          AccountType: type,
          InitialAmount: type === "Fund" ? amount : 0,
          BudgetedAmount: type === "Expense" ? amount : 0,
          RemainingAmount: amount,
          CurrentBalance: type === "Debt" ? amount : 0,
          CategoryID: categoryId,
        },
      ])
      .select()
    if (error) throw error
    return { success: true, account: data[0] }
  },

  deleteAccount: async (accountId: number) => {
    const { data: account, error: fetchError } = await supabase
      .from("account")
      .select("RemainingAmount, CurrentBalance")
      .eq("AccountID", accountId)
      .single()
    if (fetchError) throw fetchError

    if (account.RemainingAmount !== 0 || account.CurrentBalance !== 0) {
      return { success: false, error: "Cannot delete account with non-zero balance" }
    }
    const { error } = await supabase.from("account").delete().eq("AccountID", accountId)
    if (error) throw error
    return { success: true }
  },

  /* ---------- CREATE / DELETE TRANSACTION ---------- */
  createTransaction: async (
    type: string,
    fromAccountId: number,
    toAccountId: number,
    amount: number,
    description: string,
  ) => {
    const { data: tx, error: txErr } = await supabase
      .from("transactions")
      .insert([{ Time: new Date().toISOString().split("T")[0], Description: description }])
      .select()
    if (txErr) throw txErr
    const id = tx[0].TransactionID

    const entries =
      type === "transfer"
        ? [
            { TransactionID: id, AccountID: fromAccountId, Amount: amount, Direction: "OUT" },
            { TransactionID: id, AccountID: toAccountId, Amount: amount, Direction: "IN" },
          ]
        : type === "income"
          ? [
              { TransactionID: id, AccountID: fromAccountId, Amount: amount, Direction: "IN" },
              { TransactionID: id, AccountID: toAccountId, Amount: amount, Direction: "IN" },
            ]
          : [
              { TransactionID: id, AccountID: fromAccountId, Amount: amount, Direction: "OUT" },
              { TransactionID: id, AccountID: toAccountId, Amount: amount, Direction: "IN" },
            ]

    const { error: entErr } = await supabase.from("transactionentry").insert(entries)
    if (entErr) throw entErr
    return { success: true }
  },

  deleteTransaction: async (transactionId: number) => {
    const { data: entries, error: entErr } = await supabase
      .from("transactionentry")
      .select("*")
      .eq("TransactionID", transactionId)
    if (entErr) throw entErr

    for (const entry of entries) {
      const { data: acct, error: acctErr } = await supabase
        .from("account")
        .select("RemainingAmount, CurrentBalance")
        .eq("AccountID", entry.AccountID)
        .single()
      if (acctErr) throw acctErr

      const remaining =
        entry.Direction === "IN" ? acct.RemainingAmount - entry.Amount : acct.RemainingAmount + entry.Amount
      const balance = entry.Direction === "IN" ? acct.CurrentBalance - entry.Amount : acct.CurrentBalance + entry.Amount

      const { error: updErr } = await supabase
        .from("account")
        .update({ RemainingAmount: remaining, CurrentBalance: balance })
        .eq("AccountID", entry.AccountID)
      if (updErr) throw updErr
    }

    await supabase.from("transactionentry").delete().eq("TransactionID", transactionId)
    await supabase.from("transactions").delete().eq("TransactionID", transactionId)
    return { success: true }
  },

  /* ---------- SUMMARY ---------- */
  getSummary: async () => {
    const [catRes, acctRes, entRes] = await Promise.all([
      supabase.from("category").select("*"),
      supabase.from("account").select("*"),
      supabase.from("transactionentry").select("*"),
    ])
    if (catRes.error) throw catRes.error
    if (acctRes.error) throw acctRes.error
    if (entRes.error) throw entRes.error

    const categoryTotals = catRes.data.map((c: any) => {
      const catAccts = acctRes.data.filter((a: any) => a.CategoryID === c.CategoryID)
      const net = catAccts.reduce((sum: number, a: any) => {
        const ents = entRes.data.filter((e: any) => e.AccountID === a.AccountID)
        const delta = ents.reduce((s: number, e: any) => s + (e.Direction === "IN" ? e.Amount : -e.Amount), 0)
        return sum + delta
      }, 0)
      return { CategoryName: c.Name, CategoryType: c.Type, NetAmount: net }
    })

    const assets = categoryTotals.find((x: any) => x.CategoryType === "Asset")?.NetAmount || 0
    const liabilities = categoryTotals.find((x: any) => x.CategoryType === "Liability")?.NetAmount || 0
    const equity = assets - liabilities

    return {
      categoryTotals,
      accountBalances: acctRes.data,
      totals: {
        assets,
        liabilities,
        equity,
        balanceCheck: assets - liabilities - equity,
      },
    }
  },
}

export default db
