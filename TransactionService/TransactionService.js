class TransactionService {
  constructor(sqlRepo) {
    this.sqlRepo = sqlRepo;
  }

  performTransaction(transaction, user, accessToken) {
    if (transaction.type === "deposit") {
      this.sqlRepo.deposit(transaction, user, accessToken);
      return;
    }

    if (transaction.type === "withdraw") {
      this.sqlRepo.withdraw(transaction, user, accessToken);
    }
  }

  async getTransactions(accno) {
    return this.sqlRepo.getTransactions(accno);
  }
}

module.exports = TransactionService;
