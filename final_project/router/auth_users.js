const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{
    "username": "charlottelily",
    "password": "milk"
}]; // Array of { username, password }

const secretKey = "mySecretKey123"; // Secret for JWT (in production use env vars)

// Check if username exists
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Check if username and password match
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// Login route
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  const token = jwt.sign({ username: username }, secretKey, { expiresIn: "1h" });
  return res.status(200).json({
    message: "Login successful!",
    token: token
  });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;

  if (!review) {
    return res.status(400).json({ message: "Review query parameter is required." });
  }

  // Verify JWT token to get username
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing." });
  }

  const token = authHeader.split(" ")[1]; // Format: "Bearer <token>"

  try {
    const decoded = jwt.verify(token, secretKey);
    const username = decoded.username;

    // Check if the book exists
    if (!books[isbn]) {
      return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }

    // Add or modify review for the user
    books[isbn].reviews[username] = review;

    return res.status(200).json({
      message: "Review added/modified successfully.",
      reviews: books[isbn].reviews
    });
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
  
    // Verify JWT token to get username
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing." });
    }
  
    const token = authHeader.split(" ")[1]; // Format: "Bearer <token>"
  
    try {
      const decoded = jwt.verify(token, "mySecretKey123"); // Same secretKey used earlier
      const username = decoded.username;
  
      // Check if book exists
      if (!books[isbn]) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
      }
  
      // Check if user has a review to delete
      if (!books[isbn].reviews[username]) {
        return res.status(404).json({ message: `No review by user '${username}' for this book.` });
      }
  
      // Delete the review
      delete books[isbn].reviews[username];
  
      return res.status(200).json({
        message: "Your review deleted successfully.",
        reviews: books[isbn].reviews
      });
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }
  });
  

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
