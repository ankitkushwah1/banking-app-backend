const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const app = express();
const port = 5000;

require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const AccountMysqlRepo = require("./account-mysql-repo");
const UserService = require("./UserService");
const User = require("./User");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const sqlRepo = new AccountMysqlRepo();
const userService = new UserService(sqlRepo);
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER,
    pass: process.env.PASSWORD,
  },
});
app.get("/", (req, res) => {
  return res.send("<h1>Welcome to Banking App</h1>");
});

app.post("/api/v1/account/registration", async (req, res) => {
  const allUsers = await userService.getUsers();
  const accno = "ACC00" + (allUsers.length + 1);
  const date = moment(new Date()).format("YYYY-MM-DD");
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const user = new User(
    accno,
    req.body.firstName,
    req.body.lastName,
    Number(req.body.balance),
    req.body.email,
    req.body.phone,
    date,
    hashedPassword
  );
  await userService.addUser(user);
  let mailOption = {
    from: "ankitkmonocept@gmail.com",
    to: `${req.body.email}`,
    subject: "Successfully Registered",
    text: ` Account No :${accno}
              firstName: ${req.body.firstName}   
              lastName : ${req.body.lastName}
              balance  :${req.body.balance}
              password :${req.body.password}
      `,
  };

  transporter.sendMail(mailOption, (err, data) => {
    if (err) {
      console.log("error occur");
    } else {
      console.log("email send");
    }
  });
  res.json(user);
});

app.post("/api/v1/account/login", async (req, res) => {
  const name = req.body.name;
  const password = req.body.password;

  let user = await userService.getUserByName(name);

  if (user.length == 0) {
    res.status(500).send("Invalid user");
    return;
  }
  //authenticate user
  if (await bcrypt.compare(password, user.password)) {
    const payload = { id: user.accno, name: user.firstName, isAdmin: false };
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "40m",
    });

    res.json({ accessToken: accessToken, payload: payload });
    return;
  }

  res.status(500).send("Incorrect Password");
});

app.post(
  "/api/v1/account/update-balance/:id",
  authenticateToken,
  async (req, res) => {
    await userService.updateBalance(req.params.id, req.body.balance);
    res.json({});
  }
);

app.post("/api/v1/account/update/:id", authenticateToken, async (req, res) => {
  const date = moment(new Date()).format("YYYY-MM-DD");
  const user = new User(
    req.body.accno,
    req.body.firstName,
    req.body.lastName,
    Number(req.body.balance),
    req.body.email,
    req.body.phone,
    date,
    req.body.password
  );
  await userService.updateUserDetails(user);
  res.json(user);
});

app.get("/api/v1/account/user/:id", authenticateToken, async (req, res) => {
  const user = await userService.getUser(req.params.id);
  res.json(user);
});

app.get(
  "/api/v1/account/admin/:id/users",
  authenticateToken,
  async (req, res) => {
    const users = await userService.getUsers();
    res.json(users);
  }
);

app.listen(port, function (err) {
  if (err) {
    console.log(err);
    return;
  }
  console.log("Server is up and running on port : " + port);
});

function authenticateToken(req, res, next) {
  console.log("inside authorization");
  const bearer_token = req.header("authorization");
  console.log("b", bearer_token);
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
