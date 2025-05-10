CREATE TABLE Transactions (
  TransactionID   INTEGER   PRIMARY KEY AUTOINCREMENT,
  Time            DATE      NOT NULL,
  Description     TEXT
);

CREATE TABLE Category (
  CategoryID      INTEGER   PRIMARY KEY AUTOINCREMENT,
  Name            TEXT      NOT NULL,
  Type            TEXT      NOT NULL
                       CHECK(Type IN ('Asset','Liability','Equity'))
);

CREATE TABLE Account (
  AccountID       INTEGER   PRIMARY KEY AUTOINCREMENT,
  Name            TEXT      NOT NULL,
  AccountType     TEXT      NOT NULL
                       CHECK(AccountType IN ('Fund','Expense','Bank','Custom')),
  InitialAmount   REAL      NOT NULL DEFAULT 0.0,
  BudgetedAmount  REAL      NOT NULL DEFAULT 0.0,
  RemainingAmount REAL      NOT NULL DEFAULT 0.0,
  CurrentBalance  REAL      NOT NULL DEFAULT 0.0,
  CategoryID      INTEGER   NOT NULL
                       REFERENCES Category(CategoryID)
                       ON DELETE RESTRICT
                       ON UPDATE CASCADE
);

CREATE TABLE TransactionEntry (
  EntryID         INTEGER   PRIMARY KEY AUTOINCREMENT,
  TransactionID   INTEGER   NOT NULL
                       REFERENCES Transactions(TransactionID)
                       ON DELETE CASCADE
                       ON UPDATE CASCADE,
  AccountID       INTEGER   NOT NULL
                       REFERENCES Account(AccountID)
                       ON DELETE RESTRICT
                       ON UPDATE CASCADE,
  Amount          REAL      NOT NULL,
  Direction       TEXT      NOT NULL
                       CHECK(Direction IN ('IN','OUT'))
);
