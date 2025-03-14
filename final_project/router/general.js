const express = require('express');
let getBooks = require("./booksdb.js");
const e = require("express");
let hasUser = require("./auth_users.js").hasUser;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Empty username or password" });
  }

  if (hasUser(username)) {
    return res.status(404).json({ message: "User already exists" });
  }

  users.push({"username": username, "password": password})
  return res.status(200).json({message: "User created"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  getBooks()
      .then((books) => {
        res.send(JSON.stringify(books, null, 4));
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send(error)
      });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  getBooks()
      .then((books) => {
        let book = books[req.params.isbn];
        if (book) {
          return res.send(JSON.stringify(book, null, 4))
        } else {
          return res.status(404).json({message: "Not found"});
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send(error)
      });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  getBooks()
      .then((books) => {
        let book = books[req.params.isbn];
        if (book) {
          return res.send(JSON.stringify(book.reviews, null, 4))
        }
        return res.status(404).json({message: "Not found"});
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send(error)
      });
});

async function getFilteredBooks(filter) {
  return getBooks()
      .then((books) => {
        let result = {};
        for (let isbn in books) {
          if (filter(books[isbn])) {
            result[isbn] = books[isbn]
          }
        }
        return result;
      });
}

// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  let result = await getFilteredBooks(function (book) {
    return book.author === req.params.author;
  });
  return res.send(JSON.stringify(result, null, 4))
});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
  let result = await getFilteredBooks(function (book) {
    return book.title === req.params.title;
  });
  return res.send(JSON.stringify(result, null, 4))
});


module.exports.general = public_users;
