class Transaction {
  constructor(id, accno, firstName, lastName, amount, type, date) {
    this.id = id;
    this.accno = accno;
    this.firstName = firstName;
    this.lastName = lastName;
    this.amount = amount;
    this.type = type;
    this.date = date;
  }
}

module.exports = Transaction;
