const mysql = require("mysql");
const uuid = require("uuid");
const moment = require("moment");
const axios = require("axios");
const Transaction = require("./Transaction");
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "account_db",
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

class TransactionMysqlRepo {
  getTransactions(accno) {
    let txnList = new Array();
    return new Promise((resolve, reject) => {
      let sql = `select * from transaction  WHERE accno = '${accno}' `;
      con.query(sql, (err, res) => {
        if (err) return reject(err);
        for (let data of res) {
          let transaction = new Transaction(
            data.id,
            data.accno,
            data.firstName,
            data.lastName,
            data.amount,
            data.type,
            data.date
          );
          txnList.push(transaction);
        }

        resolve(txnList);
      });
    });
  }

  async deposit(transaction, user) {
    const txnId = uuid.v4();

    con.beginTransaction(async (err) => {
      if (err) throw err;
      const dateTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
      let sql1 = `INSERT INTO transaction(id, accno, firstName, lastName, amount, type, date) VALUES ('${txnId}',
      '${transaction.accno}', '${transaction.firstName}', '${transaction.lastName}', '${transaction.amount}', 'deposit', '${dateTime}')`;

      con.query(sql1, (err, res) => {
        if (err) {
          return con.rollback(function () {
            throw err;
          });
        }
      });

      const resp = await axios.post(
        `http://localhost:5000/api/v1/account/update-balance/${transaction.accno}`,
        {
          accno: transaction.accno,
          balance: user.balance + transaction.amount,
        }
      );

      con.commit((err) => {
        if (err) {
          return con.rollback(function () {
            throw err;
          });
        }
      });
      console.log("transaction successful");
    });
  }
  async withdraw(transaction, user) {
    const txnId = uuid.v4();

    con.beginTransaction(async (err) => {
      if (err) throw err;
      const dateTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
      let sql1 = `INSERT INTO transaction(id, accno, firstName, lastName, amount, type, date) VALUES ('${txnId}',
      '${transaction.accno}', '${transaction.firstName}', '${transaction.lastName}', '${transaction.amount}', 'withdraw', '${dateTime}')`;

      con.query(sql1, (err, res) => {
        if (err) {
          return con.rollback(function () {
            throw err;
          });
        }
      });

      const resp = await axios.post(
        `http://localhost:5000/api/v1/account/update-balance/${transaction.accno}`,
        {
          accno: transaction.accno,
          balance: user.balance - transaction.amount,
        }
      );

      con.commit((err) => {
        if (err) {
          return con.rollback(function () {
            throw err;
          });
        }
      });
      console.log("transaction successful");
    });
  }
}

module.exports = TransactionMysqlRepo;
