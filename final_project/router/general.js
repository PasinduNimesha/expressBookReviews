const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password){
    console.log(username, password)
    return res.status(400).json({message: "Username and password is required."});
  }
  if (users[username]) {
    return res.status(400).json({message: "Username already exists."});
  }
  users[username] = {password: password};
  return res.status(201).json({message: "User registered successfully!"});
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  // Send the list of all books as a JSON response
  res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  // Get the ISBN from the request parameters
  const isbn = req.params.isbn;

  // Find the book by ISBN
  const book = books[isbn];

  if (book) {
    // If found, send the book details
    res.status(200).send(JSON.stringify(book, null, 4));
  } else {
    // If not found, send a 404 error
    res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author;
  const booksByAuthor = [];
  for (let key in books) {
    if (books[key].author.toLowerCase() === author.toLocaleLowerCase()){
        booksByAuthor.push({isbn: key, ...books[key]});
    }
  }
  if (booksByAuthor.length > 0){
    res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
  } else {
    res.status(404).json({message: "No books found"});
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title;
  const booksByTitle = [];
  for (let key in books) {
    if (books[key].title.toLowerCase() === title.toLocaleLowerCase()){
        booksByTitle.push({isbn: key, ...books[key]});
    }
  }
  if (booksByTitle.length > 0){
    res.status(200).send(JSON.stringify(booksByTitle, null, 4));
  } else {
    res.status(404).json({message: "No books found"});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  // Get the ISBN from the request parameters
  const isbn = req.params.isbn;

  // Find the book by ISBN
  const book = books[isbn];

  if (book) {
    // If found, send the book details
    res.status(200).send(JSON.stringify(book.reviews, null, 4));
  } else {
    // If not found, send a 404 error
    res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }
});

module.exports.general = public_users;
