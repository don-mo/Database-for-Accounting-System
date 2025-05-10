-- 1) seed some categories
INSERT INTO Category (Name, Type)
VALUES
  ('Cash', 'Asset'),
  ('RSO Fund', 'Asset'),
  ('Planned Events', 'Liability'),
  ('Remaining Funds', 'Equity');

-- 2) seed a couple of accounts
INSERT INTO Account
  (Name, AccountType, InitialAmount, BudgetedAmount, RemainingAmount, CurrentBalance, CategoryID)
VALUES
  ('Main Checking', 'Bank', 0.00, 0.00, 0.00, 1000.00, 1),  -- $1,000 in checking
  ('Ice Cream Social', 'Expense', 0.00, 100.00, 100.00, 0.00, 3),
  ('Spring Grant', 'Fund', 500.00, 0.00, 500.00, 0.00, 2);

-- 3) record a transaction (e.g. allocate $100 to the ice cream social)
INSERT INTO Transactions (`Time`, `Description`)
VALUES ('2025-05-10', 'Allocate for ice cream');

-- 4) link two entries under that transaction
INSERT INTO TransactionEntry
  (TransactionID, AccountID, Amount, Direction)
VALUES
  (1, 1, 100.00, 'OUT'),   -- $100 out of Main Checking (AccountID=1)
  (1, 2, 100.00, 'IN');    -- $100 into Ice Cream Social (AccountID=2)

-- 5) record revenue of $500 into checking and revenue account
INSERT INTO Transactions (`Time`, `Description`)
VALUES ('2025-05-10', 'Record revenue');
INSERT INTO TransactionEntry
  (TransactionID, AccountID, Amount, Direction)
VALUES
  (2, 1, 500.00, 'IN'),    -- +$500 checking
  (2, 3, 500.00, 'IN');    -- +$500 Spring Grant fund (or your Revenues account)
