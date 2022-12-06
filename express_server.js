const cookieParser = require('cookie-parser')
const express = require("express");

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs")

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

function generateRandomString() {}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  const templateVars = { urls: urlDatabase, username: req.cookies["username"]  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"]}
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL 
  res.redirect("/urls/:id"); 
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const templateVars = { id: id, longURL: urlDatabase[id], username: req.cookies["username"]  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req,res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
})

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});


app.post("/urls/:id", (req,res) => {
  urlDatabase[req.params.id] = req.body.updateLongURL
  const templateVars = { id: req.params.id, longURL: req.body.longURL  };
  res.redirect("/urls");
});

app.post("/login", (req,res) => {
  const username = req.body.username;
  console.log(username)
  res.cookie('username', username);
  res.redirect("/urls");
});

app.post("/logout", (req,res) => {
  res.clearCookie("username");
  res.redirect("/urls");

});

app.get("/register", (req,res) => {
  const templateVars = { email: req.body.email, password: req.body.password, username: req.cookies["username"]  };
  res.render("urls_register", templateVars);
});




















/* edge cases
What would happen if a client requests a short URL with a non-existant id?
What happens to the urlDatabase when the server is restarted?
What type of status code do our redirects have? What does this status code mean?
*/
 