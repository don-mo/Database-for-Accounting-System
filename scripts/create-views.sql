-- Run once in Supabase (SQL Editor) ---------------------------------
-- These views re-export the originally-quoted tables with lower-case
-- names that PostgREST expects.  No data is duplicated.

create or replace view account           as select * from "Account";
create or replace view category          as select * from "Category";
create or replace view transactions      as select * from "Transactions";
create or replace view transactionentry  as select * from "TransactionEntry";
