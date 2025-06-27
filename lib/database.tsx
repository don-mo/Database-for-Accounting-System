import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
export const supabase = createClient(supabaseUrl, supabaseKey)

export const getTransactions = async () => {
  const [{ data: entries, error: entErr }, { data: txns, error: txnErr }, { data: accts, error: acctErr }] =
    await Promise.all([
      supabase.from("transactionentry").select("*"),
      supabase.from("transactions").select("transactionid, time, description"),
      supabase.from("account").select("accountid, name"),
    ])

  if (entErr) console.error(entErr)
  if (txnErr) console.error(txnErr)
  if (acctErr) console.error(acctErr)

  if (!entries || !txns || !accts) return []

  return entries.map((e: any) => {
    const t = txns.find((tx: any) => tx.transactionid === e.transactionid)
    const a = accts.find((ac: any) => ac.accountid === e.accountid)
    return {
      TransactionID: e.transactionid,
      Time: t?.time,
      Description: t?.description,
      AccountName: a?.name,
      Direction: e.direction,
      Amount: e.amount,
    }
  })
}

export const createTransaction = async (accountid: string, direction: string, amount: number, description: string) => {
  const { data: tx, error: txErr } = await supabase
    .from("transactions")
    .insert([{ time: new Date().toISOString().split("T")[0], description }])
    .select()

  if (txErr) {
    console.error(txErr)
    return
  }

  if (!tx) return

  const transactionid = tx[0].transactionid

  const { data: acct, error: acctErr } = await supabase.from("account").select("*").eq("accountid", accountid)

  if (acctErr) {
    console.error(acctErr)
    return
  }

  if (!acct) return

  const currentBalance = acct[0].currentbalance
  const newBalance = direction === "debit" ? currentBalance - amount : currentBalance + amount

  const { data: update, error: updateErr } = await supabase
    .from("account")
    .update({ currentbalance: newBalance })
    .eq("accountid", accountid)
    .select()

  if (updateErr) {
    console.error(updateErr)
    return
  }

  const entries = [
    {
      transactionid: transactionid,
      accountid: accountid,
      direction: direction,
      amount: amount,
      remainingamount: amount,
    },
  ]

  const { data: entry, error: entryErr } = await supabase.from("transactionentry").insert(entries).select()

  if (entryErr) {
    console.error(entryErr)
    return
  }

  return { ...entries[0], Time: tx[0].time, Description: description, AccountName: acct[0].name }
}

export const deleteTransaction = async (
  transactionId: string,
  accountId: string,
  direction: string,
  amount: number,
) => {
  const { data: entriesToDelete, error: selectErr } = await supabase
    .from("transactionentry")
    .select("*")
    .eq("transactionid", transactionId)

  if (selectErr) {
    console.error(selectErr)
    return
  }

  if (!entriesToDelete) return

  for (const entry of entriesToDelete) {
    const { accountid, direction, amount } = entry

    const { data: acct, error: acctErr } = await supabase.from("account").select("*").eq("accountid", accountid)

    if (acctErr) {
      console.error(acctErr)
      return
    }

    if (!acct) return

    const currentBalance = acct[0].currentbalance

    const newBalance = direction === "debit" ? currentBalance + amount : currentBalance - amount

    const { data: update, error: updateErr } = await supabase
      .from("account")
      .update({ currentbalance: newBalance })
      .eq("accountid", accountid)
      .select()

    if (updateErr) {
      console.error(updateErr)
      return
    }
  }

  const { error: deleteErr } = await supabase.from("transactionentry").delete().eq("transactionid", transactionId)

  if (deleteErr) {
    console.error(deleteErr)
    return
  }

  const { error: transactionDeleteErr } = await supabase
    .from("transactions")
    .delete()
    .eq("transactionid", transactionId)

  if (transactionDeleteErr) {
    console.error(transactionDeleteErr)
    return
  }
}
