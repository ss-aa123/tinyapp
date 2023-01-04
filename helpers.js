

const getUserByEmail = function(emaill, database) {
  for (const user in database) {
    if (database[user].email === emaill) {
      return database[user];
    }
  }
}

const generateRandomString = function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let randoString = "";
  for (let i = 0; i < 6; i++ ) {
    randoString += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return randoString;
};

const urlsForUser = function(id, database) {
  let usersUrls = {};
  for (let id in database) {
    if (database[id].userID === id) {
      usersUrls[id] = database[id];
    }
  }
  return usersUrls;
};

module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUser
}