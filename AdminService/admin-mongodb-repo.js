const { MongoClient } = require("mongodb");
require("dotenv").config();
const uri = process.env.URL;
const client = new MongoClient(uri);

class AdminMongoDBRepo {
  async getAllAdmin() {
    await client.connect();
    const database = client.db("account_db");
    const collection = database.collection("admin");
    const cursor = collection.find();
    let adminList = new Array();

    await cursor.forEach(function (doc) {
      let admin = {
        id: doc.id,
        name: doc.name,
        password: doc.password,
        email: doc.email,
      };
      adminList.push(admin);
    });

    return adminList;
  }

  async getAdmin(name) {
    await client.connect();
    const database = client.db("account_db");
    const collection = database.collection("admin");
    const admin = await collection.findOne({ name: `${name}` });
    return admin;
  }
}

module.exports = AdminMongoDBRepo;
