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
const LOCAL_HOST = "user_svc";
app.post(
  "/api/v1/account/:id/transaction",

  async (req, res) => {
    console.log(req.headers);
    const accessToken = req.headers.authorization.split(" ")[1];
    console.log("accesToken", accessToken);
    const resp = await axios.get(
      `http://${LOCAL_HOST}:5000/api/v1/account/user/${req.params.id}`,
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-type": "Application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const user = resp.data;

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

    transactionService.performTransaction(transaction, user, accessToken);
    res.json(transaction);
  }
);

app.get("/api/v1/account/:id/passbook", authenticateToken, async (req, res) => {
  let transactions = await transactionService.getTransactions(req.params.id);
  res.json(transactions);
});

function authenticateToken(req, res, next) {
  console.log("inside authorization");
  const bearer_token = req.header("authorization");

  if (!bearer_token) return res.status(401).send("Access denied ,no token");

  try {
    const token = bearer_token.split(" ")[1];
    const decodePayload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    console.log(decodePayload);
    if (decodePayload.id === req.params.id) {
      req.user = decodePayload;
      next();
    } else {
      return res.sendStatus(401);
    }
  } catch (ex) {
    return res.status(400).send("invalid token");
  }
}
app.listen(port, function (err) {
  if (err) {
    console.log(err);
    return;
  }
  console.log("Server is up and running on port : " + port);
});
