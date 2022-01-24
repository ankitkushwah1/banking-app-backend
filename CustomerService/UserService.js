class UserService {
  constructor(sqlRepo) {
    this.sqlRepo = sqlRepo;
  }

  async getUser(accno) {
    return this.sqlRepo.getUser(accno);
  }
  async getUserByName(name) {
    return this.sqlRepo.getUserByName(name);
  }

  async updateUserDetails(user) {
    return this.sqlRepo.updateUserDetails(user);
  }
  async updateBalance(accno, balance) {
    return this.sqlRepo.updateBalance(accno, balance);
  }
  async addUser(user) {
    return this.sqlRepo.addUser(user);
  }

  async getUsers() {
    return this.sqlRepo.getUsers();
  }

  async getUserDocs(accno) {
    return this.sqlRepo.getUserDocs(accno);
  }

  async uploadUsrDocs(accno, path) {
    return this.sqlRepo.uploadUsrDocs(accno, path);
  }
}

module.exports = UserService;
