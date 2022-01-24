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

  async getUsers() {
    const resp = await axios.get(
      "http://localhost:5000/api/v1/account/admin/users"
    );
    return resp.data;
  }

  async getAllUsersTransactions() {}
}

module.exports = AdminService;
