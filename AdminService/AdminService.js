const axios = require("axios");

class AdminService {
  constructor(mongoDbRepo, mySqlRepo) {
    this.mongoDbRepo = mongoDbRepo;
  }

  async getAllAdmin() {
    return this.mongoDbRepo.getAllAdmin();
  }

  async getAdmin(name) {
    return this.mongoDbRepo.getAdmin(name);
  }

  async getUsers(accessToken, id) {
    const resp = await axios.get(
      `http://localhost:5000/api/v1/account/admin/${id}/users`,
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-type": "Application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return resp.data;
  }
}

module.exports = AdminService;
