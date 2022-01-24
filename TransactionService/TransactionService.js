class TransactionService {
  constructor(sqlRepo) {
    this.sqlRepo = sqlRepo;
  }

  performTransaction(transaction, user) {
    if (transaction.type === "deposit") {
      this.sqlRepo.deposit(transaction, user);
      return;
    }

    if (transaction.type === "withdraw") {
      this.sqlRepo.withdraw(transaction, user);
    }
  }

  async getTransactions(accno) {
    return this.sqlRepo.getTransactions(accno);
  }
}

module.exports = TransactionService;
