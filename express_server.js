const express = require("express");
const cookieSession = require('cookie-session');

const app = express();
app.use(express.urlencoded({ extended: true }));
const PORT = 8080; // default port 8080

app.use(cookieSession({name: 'session', secret: 'somesecretnameorsomething'}));
const bcrypt = require('bcryptjs');

app.set("view engine", "ejs");


function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let randoString = "";
  for (let i = 0; i < 6; i++ ) {
    randoString += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return randoString;
};

function getUserByValue(emaill, database) {
  for (let user in database) {
    if (database[user].email === emaill) {
      return database[user];
    }
  }
}

function urlsForUser(id, database) {
  let usersUrls = {};
  for (let id in database) {
    if (database[id].userID === id) {
      usersUrls[id] = database[id];
    }
  }
  return usersUrls;
};


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
  userRandomID: {
    user_id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    user_id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};



app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//visit: http://localhost:8080/urls.json --> expect to see a JSON string representing our entire urlDatabase obejct
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//visit: http://localhost:8080/hello --> expect to see "Hello World"
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});




//visit: http://localhost:8080/urls --> you see something on the page based on the template i guess
app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    //need to return an HTML with a relevant error message if the user is not logged in. something like "please log in or register first to see urls"
    res.redirect('/login')
  }
  //pass user object to urls_index template
  let userID = req.session.user_id;
  let userUrls = urlsForUser(userID, urlDatabase);
  const templateVars = { urls: userUrls, user: users[userID]  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    const message = 'You do not have permission to shorten URLS';
    res.status(403).send(message);
  }
  const id = generateRandomString();
  urlDatabase[req.params.id] = req.body.longURL 
  res.redirect("/urls/:id"); 
});


app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login')
  }
  const templateVars = { user: users[req.session.user_id]}
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {

  //if not logged in, url pages isnt accessible
  //if logged in but url page doesnt belong to them, its not accessible to them
  if (!urlDatabase[req.params.id]) {
    const message = 'This url does not exist';
    res.status(404).send(message);
  } else if (!req.session.user_id) {
    const message = 'Please log in or register first';
    res.status(401).send(message);
  } else if (!userUrls[id]) {
    const message = 'You don\'t have permission to see this';
    res.status(403).send(message);
  }
  const id = req.params.id;
  const templateVars = { id: id, longURL: urlDatabase[id].longURL, user: users[req.session.user_id]  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req,res) => {
  const user = req.session.user_id;

  if (!urlDatabase[req.params.id]) {
    const message = 'This url does not exist';
    res.status(404).send(message);
  } else if (!req.session.user_id) {
    const message = 'Please log in or register first';
    res.status(401).send(message);
  } else if (!userUrls[id]) {
    const message = 'You don\'t have permission to see this';
    res.status(403).send(message);
  } else if (user && user === urlDatabase[id].userID) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  }  
})

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    const message = 'This url does not exist';
    res.status(404).send(message);
  }
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL); 
});

app.post("/urls/:id", (req,res) => {
  if (!urlDatabase[req.params.id]) {
    const message = 'This url does not exist';
    res.status(404).send(message);
  } else if (!req.session.user_id) {
    const message = 'Please log in or register first';
    res.status(401).send(message);
  } else if (!userUrls[id]) {
    const message = 'You don\'t have permission to see this';
    res.status(403).send(message);
  }
  urlDatabase[req.params.id] = req.body.updateLongURL
  const templateVars = { id: req.params.id, longURL: req.body.longURL  };
  res.redirect("/urls");
});


app.get("/login", (req,res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  }
  const templateVars = { email: req.body.email, password: req.body.password, user: users[req.session.user_id] };
  res.render("urls_login", templateVars);
});

app.post("/login", (req,res) => {
  const user = getUserByValue(req.body.email, users);

    if (user && user.email === req.body.email ) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        req.session.user_id = user.user_id;
        res.redirect("/urls");
      } else {
        res.status(403).send('Wrong password');
      }
    } else {
      res.status(403).send('Email cannot be found');
    }
});


app.post("/logout", (req,res) => {
  res.clearCookie("session")
  res.redirect("/login");
});

app.get("/register", (req,res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  }
  const templateVars = { user: users[req.session.user_id] };
  res.render("urls_register", templateVars);
});


app.post("/register", (req,res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('Fill in all boxes please.');
  }

  const user = getUserByValue(req.body.email, users);
  if (user && user.email === req.body.email) {
    res.status(400).send('Email already exists.');
  } 

  const user_id = generateRandomString();
  
  users[user_id] = {
    user_id,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  req.session.user_id = user_id;
  console.log(users)
  res.redirect("/urls");
});


















/* edge cases
What would happen if a client requests a short URL with a non-existant id?
What happens to the urlDatabase when the server is restarted?
What type of status code do our redirects have? What does this status code mean?
*/
 