const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const port = 5001;
require("dotenv").config();
const uuid = require("uuid");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const moment = require("moment");

const TransactionMysqlRepo = require("./transaction-mysql-repo");
const TransactionService = require("./TransactionService");
const transactionService = new TransactionService(new TransactionMysqlRepo());
const Transaction = require("./Transaction");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.post(
  "/api/v1/account/:id/transaction",

  async (req, res) => {
    const resp = await axios.get(
      `http://localhost:5000/api/v1/account/user/${req.params.id}`
    );
    const user = resp.data;
    console.log(user);
    const id = uuid.v4();
    const accno = user.accno;
    const firstName = user.firstName;
    const lastName = user.lastName;
    const amount = Number(req.body.amount);
    const type = req.body.transactionType;
    const date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    let transaction = new Transaction(
      id,
      accno,
      firstName,
      lastName,
      amount,
      type,
      date
    );

    transactionService.performTransaction(transaction, user);
    res.json(transaction);
  }
);

app.get("/api/v1/account/:id/passbook", authenticateToken, async (req, res) => {
  let transactions = await transactionService.getTransactions(req.params.id);
  res.json(transactions);
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
    if (err) return res.sendStatus(403);
    req.user = payload;

    if (payload.id != req.params.id) return res.sendStatus(401);
    next();
  });
}
app.listen(port, function (err) {
  if (err) {
    console.log(err);
    return;
  }
  console.log("Server is up and running on port : " + port);
});
