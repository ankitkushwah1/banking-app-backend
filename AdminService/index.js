const AdminMongoDBRepo = require("./admin-mongodb-repo");
const AdminService = require("./AdminService");
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const mongoDbRepo = new AdminMongoDBRepo();
const adminService = new AdminService(mongoDbRepo);
const app = express();
const port = 5002;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.post("/api/v1/account/admin/login", async (req, res) => {
  let name = req.body.name;
  let password = req.body.password;
  const admin = await adminService.getAdmin(name);

  if (password == admin.password) {
    const payload = { id: admin.id, name: admin.name, isAdmin: true };
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "10m",
    });
    return res.json({ accessToken: accessToken, payload: payload });
  }
  res.status(500).send("Incorrect Password");
});

app.get(
  "/api/v1/account/admin/:name/all-admins",
  authenticateToken,
  async (req, res) => {
    let adminList = await adminService.getAllAdmin();
    res.json(adminList);
  }
);

app.get(
  "/api/v1/account/admin/:name/all-users",
  authenticateToken,
  async (req, res) => {
    let userList = await adminService.getUsers();
    res.json(userList);
  }
);

app.get(
  "/api/v1/account/admin/:name/all-transactions",
  authenticateToken,
  async (req, res) => {
    let txnList = await adminService.getAllUsersTransactions();
    res.json(txnList);
  }
);

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
    if (err) return res.sendStatus(403);
    req.user = payload;

    if (payload.name != req.params.name) return res.sendStatus(401);
    next();
  });
}

function authenticateToken(req, res, next) {
  console.log("inside authorization");
  const bearer_token = req.header("Authorization");

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
