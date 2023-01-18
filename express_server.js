const express = require("express");
const app = express();
const cookieSession = require('cookie-session');
const PORT = 8080; // default port 8080
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
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
    id: "1",
    email: "1@1.com",
    password: "purple", 
  },
};

//clears session and redirects to login when logout button is clicked
app.post("/logout", (req,res) => {
  res.clearCookie("session")
  res.clearCookie('session.sig');
  res.redirect("/login");
});
app.get("/logout", (req, res) => {
  res.clearCookie("session")
  res.clearCookie('session.sig');
  res.redirect("/login");
});

app.get("/", (req, res) => {
  res.redirect("/login");
});

//displays user's urls page
app.get("/urls", (req, res) => {
  const user = users[req.session['user_id']];
  if (!user) {
    return res.status(401).send(`
      <html>
        <body>Please <a href="http://localhost:8080/login">login</a> or <a href="http://localhost:8080/register">register</a> first to see the URLs</body>
      </html>
      `);
  }
  //pass user object to urls_index template
  const userUrls = urlsForUser(user.id, urlDatabase);
  const templateVars = { urls: userUrls, user: user};
  res.render("urls_index", templateVars);
});

//Registration
app.get("/register", (req,res) => {
  const user = users[req.session['user_id']];
  if (user) {
    return res.redirect("/urls");
  }else
  res.render("urls_register", {user: user});
});

app.post("/register", (req,res) => {
  if (!req.body.email || !req.body.password) {
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
      user_id : user_id,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, salt)
    };
    res.redirect("/urls");
  }
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
  console.log(user, req.body);
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
        req.session['user_id'] = user.id;
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

app.post("/urls/:id/delete", (req,res) => {
  const user = users[req.session['user_id']];
  if (!user) {
    return res.status(401).send(`
    <html>
      <body>This url may not exist or does not belong to you. Back to <a href="http://localhost:8080/login">login.</a></body>
    </html>
  `);
  }
    delete urlDatabase[req.params.id];
    res.redirect("/urls");  
});

app.post("/urls", (req, res) => {
  const user = users[req.session['user_id']];
  if (!user) {
    return res.status(401).send(`
          <html>
            <body>You do not have permission to shorten URLS.   Back to <a href="http://localhost:8080/login">login.</a></body>
          </html>
        `);
  }
  const shortID = generateRandomString();
  urlDatabase[shortID] = {
    longURL: req.body.longURL,
    userID:  user.id
  };
  res.redirect(`/urls/${shortID}`); 
});

app.post("/urls/:id", (req,res) => {
  const user = (users[req.session['user_id']]);
  if (!user) {
    return res.status(401).send(`
    <html>
      <body>Please go back to the <a href="http://localhost:8080/urls">urls</a> page.</body>
    </html>`);
  }
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.session['user_id']]}
  const user = users[req.session['user_id']];
  if (!user) {
    return res.redirect('/login')
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user = users[req.session['user_id']];
  if (!user) {
    return res.status(401).send(`
    <html>
      <body>Please first <a href="http://localhost:8080/login">login.</a></body>
    </html>
  `);
  }
  if (user.id !== urlDatabase[req.params.id].userID) {
    return res.status(401).send(`
    <html>
      <body>You don\'t have permission to see this. Please first <a href="http://localhost:8080/login">login.</a></body>
    </html>
  `);
  }
  const id = req.params.id;
  const templateVars = { id: id, longURL: urlDatabase[id], user: user  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const user = users[req.session['user_id']];
  if (req.params.id === undefined) {
    return res.status(404).send('This url does not exist');
  }
  const templateVars = { urls: urlDatabase, user: user};
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL); 
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});