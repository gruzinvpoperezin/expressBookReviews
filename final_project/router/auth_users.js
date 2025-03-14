const express = require('express');
const jwt = require('jsonwebtoken');
let getBooks = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const hasUser = (username) => {
  for (let i = 0; i < users.length; i++) {
    if (users[i].username === username) {
      return true;
    }
  }
  return false;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  for (let i = 0; i < users.length; i++) {
    if (users[i].username === username) {
      return users[i].password === password;
    }
  }
  return false;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(208).json({ message: "Error logging in" });
  }

  let accessToken = jwt.sign({
    username: username
  }, 'access', { expiresIn: 60 * 60 });

  // Store access token and username in session
  req.session.authorization = {
    accessToken, username
  }

  return res.status(200).json({message: "Logged in"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", async (req, res) => {
  const username = req.session.authorization['username'];
  const books = await getBooks();
  const book = books[req.params.isbn];

  if (!book) {
    return res.status(404).json({ message: "not found" });
  }
  book.reviews[username] = req.body["review"];
  return res.status(200).json(JSON.stringify(book));
});

// Add a book review
regd_users.delete("/auth/review/:isbn", async (req, res) => {
  const username = req.session.authorization['username'];
  const books = await getBooks();
  const book = books[req.params.isbn];

  if (!book) {
    return res.status(404).json({ message: "not found" });
  }

  delete book.reviews[username];
  return res.status(200).json(JSON.stringify(book));
});

module.exports.authenticated = regd_users;
module.exports.hasUser = hasUser;
module.exports.users = users;
