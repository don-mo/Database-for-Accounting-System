import Database from "better-sqlite3"

const db = new Database(":memory:")

// Initialize database with schema
const createTablesSQL = `
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
`

// Seed data
const seedDataSQL = `
INSERT INTO Category (Name, Type)
VALUES
  ('Cash', 'Asset'),
  ('RSO Fund', 'Asset'),
  ('Planned Events', 'Liability'),
  ('Remaining Funds', 'Equity');

INSERT INTO Account
  (Name, AccountType, InitialAmount, BudgetedAmount, RemainingAmount, CurrentBalance, CategoryID)
VALUES
  ('Main Checking', 'Bank', 0.00, 0.00, 0.00, 1000.00, 1),
  ('Ice Cream Social', 'Expense', 0.00, 100.00, 100.00, 0.00, 3),
  ('Spring Grant', 'Fund', 500.00, 0.00, 500.00, 0.00, 2),
  ('Conference Fund', 'Fund', 800.00, 0.00, 800.00, 0.00, 2),
  ('Pizza Night', 'Expense', 0.00, 150.00, 150.00, 0.00, 3);

INSERT INTO Transactions (Time, Description)
VALUES 
  ('2025-01-15', 'Initial grant funding'),
  ('2025-01-20', 'Membership dues collected');

INSERT INTO TransactionEntry
  (TransactionID, AccountID, Amount, Direction)
VALUES
  (1, 1, 500.00, 'IN'),
  (1, 3, 500.00, 'IN'),
  (2, 1, 300.00, 'IN'),
  (2, 4, 300.00, 'IN');
`

// Initialize database
db.exec(createTablesSQL)
db.exec(seedDataSQL)

export default db

export interface Account {
  AccountID: number
  Name: string
  AccountType: "Fund" | "Expense" | "Bank" | "Custom"
  InitialAmount: number
  BudgetedAmount: number
  RemainingAmount: number
  CurrentBalance: number
  CategoryID: number
}

export interface Transaction {
  TransactionID: number
  Time: string
  Description: string
}

export interface TransactionEntry {
  EntryID: number
  TransactionID: number
  AccountID: number
  Amount: number
  Direction: "IN" | "OUT"
}

export interface Category {
  CategoryID: number
  Name: string
  Type: "Asset" | "Liability" | "Equity"
}
