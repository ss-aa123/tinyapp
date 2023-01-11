

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

const urlsForUser = function(userID, database) {
  let usersUrls = {};
  for (const id in database) {
    if (database[id].userID === userID) {
      usersUrls[id] = database[id].longURL;
    }
  }
  return usersUrls;
};

module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUser
}