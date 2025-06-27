-- Run this once in the Supabase SQL editor --------------------------
-- 1. Drop the views if they already exist (harmless if they don't).
drop view if exists account           cascade;
drop view if exists category          cascade;
drop view if exists transactions      cascade;
drop view if exists transactionentry  cascade;

-- 2. Re-create every view, mapping the exact-case table
--    names to lower-case PostgREST-friendly names.
create or replace view account          as select * from "Account";
create or replace view category         as select * from "Category";
create or replace view transactions     as select * from "Transactions";
create or replace view transactionentry as select * from "TransactionEntry";
