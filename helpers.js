

const getUserByEmail = function(emaill, database) {
  for (let user in database) {
    if (database[user].email === emaill) {
      return database[user];
    }
  }
}

module.exports = {
  getUserByEmail
}