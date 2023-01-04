const express = require("express");
const app = express();
const cookieSession = require('cookie-session');
const PORT = 8080; // default port 8080
const bcrypt = require('bcryptjs');
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({name: 'session', keys: ['user_id']}));


const {
  getUserByEmail ,
  generateRandomString,
  urlsForUser
} = require('./helpers');


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  '1': {
    user_id: "1",
    email: "1@1.com",
    password: "purple", 
  },
};



//displays user's urls page
app.get("/urls", (req, res) => {
  const userID = users[req.session.user_id];
  if (!userID) {
    return res.status(401).send(`
      <html>
        <body>Please <a href="http://localhost:8080/login">login</a> or <a href="http://localhost:8080/register">register</a> first to see the URLs</body>
      </html>
      `);
  }
  //pass user object to urls_index template
  const userUrls = urlsForUser(userID.id, urlDatabase);
  const templateVars = { urls: userUrls, user:userID};
  res.render("urls_index", templateVars);
});

//Registration
app.get("/register", (req,res) => {
  const userID = users[req.session.user_id];
  if (userID) {
    return res.redirect("/urls");
  }else
  res.render("urls_register", {user: userID});
});

app.post("/register", (req,res) => {
  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).send(`
      <html>
        <body>Please fill in all boxes and <a href="http://localhost:8080/register">register</a> first to see the URLs</body>
      </html>
      `);
  } 
  if (getUserByEmail(req.body.email, users)) {
    return res.status(400).send(`
      <html>
        <body>Email already exists!. Please <a href="http://localhost:8080/login">login</a> to see the URLs</body>
      </html>
    `);
    
  } else {
    const user_id = generateRandomString();
    req.session.user_id = user_id;
    users[user_id] = {
      user_id,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    res.redirect("/urls");
  }
});

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/login", (req,res) => {
  const user = users[req.session.user_id]
  if (user) {
    return res.redirect("/urls");
  } else {
    return res.render("urls_login", {user: user});
  }
});

app.post("/login", (req,res) => {
  const user = getUserByEmail(req.body.email, users);

    if (user) {
      let passWord = false;
      if (bcrypt.compareSync(req.body.password, user.password)) {
        passWord = true;
      }
      if (!passWord) {
        return res.status(400).send(`
        <html>
          <body>Wrong password!   <a href="http://localhost:8080/login">Go back to login.</a></body>
          </html>
        `);
      } else {
        req.session.user_id = user.user_id;
        return res.redirect("/urls");
      }
   } else {
      return res.status(403).send(`
          <html>
            <body>Email cannot be found!   <a href="http://localhost:8080/login">Go back to login.</a></body>
          </html>
        `);
      }
});

//clears session and redirects to login when logout button is clicked
app.get("/logout", (req, res) => {
  res.clearCookie("session")
  res.clearCookie('session.sig');
  res.redirect("/login");
});
app.post("/logout", (req,res) => {
  res.clearCookie("session")
  res.clearCookie('session.sig');
  res.redirect("/login");
});


app.post("/urls", (req, res) => {
  const userID = users[req.session.user_id];
  if (!req.session.user_id) {
    return res.status(403).send(`
          <html>
            <body>You do not have permission to shorten URLS   <a href="http://localhost:8080/login">Go back to login.</a></body>
          </html>
        `);
  }
  const shortID = generateRandomString();
  urlDatabase[shortID] = {
    longURL: req.body.longURL,
    userId:  userID.id
  };
  res.redirect(`/urls/${shortID}`); 
});


app.get("/urls/:id", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(401).send('Please log in or register first');
  }
  if (user.id !== urlDatabase[req.params.id].userID) {
    res.status(403).send('You don\'t have permission to see this');
  }
  const id = req.params.id;
  const templateVars = { id: id, longURL: urlDatabase[id], user: user  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const user = users[req.session.user_id];
  if (req.params.id === undefined) {
    return res.status(404).send('This url does not exist');
  }
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL); 
});

app.post("/urls/:id", (req,res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.session.user_id]}
  const user = users[req.session.user_id];
  if (!user) {
    return res.redirect('/login')
  }
  res.render("urls_new", templateVars);
});

app.post("/urls/:id/delete", (req,res) => {
  const user = req.session.user_id;

  if (!urlDatabase[req.params.id]) {
    res.status(404).send('This url does not exist');
  } else if (!req.session.user_id) {
    res.status(401).send('Please log in or register first');
  } else if (!userUrls[id]) {
    res.status(403).send('You don\'t have permission to see this');
  } else if (user && user === urlDatabase[id].userID) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  }  
})



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});