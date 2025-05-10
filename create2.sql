CREATE TABLE Transactions (
  TransactionID     INT               NOT NULL AUTO_INCREMENT,
  Time              DATE              NOT NULL,
  Description       VARCHAR(255),
  PRIMARY KEY (TransactionID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Category (
  CategoryID        INT               NOT NULL AUTO_INCREMENT,
  Name              VARCHAR(255)      NOT NULL,
  Type              ENUM('Asset','Liability','Equity') NOT NULL,
  PRIMARY KEY (CategoryID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE Account (
  AccountID         INT               NOT NULL AUTO_INCREMENT,
  Name              VARCHAR(255)      NOT NULL,
  AccountType       ENUM('Fund','Expense','Bank','Custom') NOT NULL,
  InitialAmount     DECIMAL(12,2)     NOT NULL DEFAULT 0.00,
  BudgetedAmount    DECIMAL(12,2)     NOT NULL DEFAULT 0.00,
  RemainingAmount   DECIMAL(12,2)     NOT NULL DEFAULT 0.00,
  CurrentBalance    DECIMAL(12,2)     NOT NULL DEFAULT 0.00,
  CategoryID        INT               NOT NULL,
  PRIMARY KEY (AccountID),
  FOREIGN KEY (CategoryID)
    REFERENCES Category(CategoryID)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE TransactionEntry (
  EntryID           INT               NOT NULL AUTO_INCREMENT,
  TransactionID     INT               NOT NULL,
  AccountID         INT               NOT NULL,
  Amount            DECIMAL(12,2)     NOT NULL,
  Direction         ENUM('IN','OUT')  NOT NULL,
  PRIMARY KEY (EntryID),
  FOREIGN KEY (TransactionID)
    REFERENCES Transactions(TransactionID)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (AccountID)
    REFERENCES Account(AccountID)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
