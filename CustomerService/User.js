class User {

  constructor(accno, firstName, lastName, balance, email, phone, date, password) {
    this.accno = accno;
    this.firstName = firstName;
    this.lastName = lastName;
    this.balance = balance;
    this.email = email;
    this.phone = phone;
    this.date = date;
    this.password = password;
  }
  
}

module.exports = User;
