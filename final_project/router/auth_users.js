const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = {}; // Use an object for easier access by username

const isValid = (username) => {
    // Check if the username is valid (not already taken)
    return !users[username];
}

const authenticatedUser = (username, password) => {
    // Check if username and password match the one we have in records.
    return users[username] && users[username].password === password;
}

// Register a new user
regd_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    if (!isValid(username)) {
        return res.status(400).json({ message: "Username already exists." });
    }

    // Store the user
    users[username] = { password }; // Store password (consider hashing in production)

    return res.status(201).json({ message: "User registered successfully." });
});

// Only registered users can log in
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body; // Destructure username and password from request body

  // Check if username and password are provided
  if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
  }

  // Validate user credentials
  if (!authenticatedUser(username, password)) {
      return res.status(401).json({ message: "Invalid username or password" });
  }

  // If validation is successful, create a JWT
  const token = jwt.sign({ username }, 'mySuperSecretKey1223', { expiresIn: '1h' }); // Use a strong secret key

  // Respond with the token
  return res.status(200).json({ message: "Login successful", token });
});

// Add a book review (this is just a placeholder, you can implement the review logic as needed)
// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {


  const { review } = req.query; // Get the review from the query
  const { username } = req.session; // Assuming you're storing the username in the session

  if (!review) {
      return res.status(400).json({ message: "Review is required" });
  }

  // Ensure the user is logged in
  if (!username) {
      return res.status(401).json({ message: "User not authenticated" });
  }

  // Find the book using ISBN
  const book = books[req.params.isbn]; // Assuming 'books' is your book database

  if (!book) {
      return res.status(404).json({ message: "Book not found" });
  }

  // Initialize reviews if they don't exist
  if (!book.reviews) {
      book.reviews = {};
  }

  // Update or add the review
  book.reviews[username] = review;

  return res.status(200).json({ message: "Review added/modified successfully", book });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn; // Get the ISBN from the request parameters
  const username = req.session.username; // Get the username from the session

  // Check if the review exists for the given ISBN
  if (!reviews[isbn] || !reviews[isbn][username]) {
      return res.status(404).json({ message: "Review not found" });
  }

  // Delete the review
  delete reviews[isbn][username];

  // Check if there are no reviews left for that ISBN
  if (Object.keys(reviews[isbn]).length === 0) {
      delete reviews[isbn]; // Remove the ISBN entry if no reviews left
  }

  return res.status(200).json({ message: "Review deleted successfully" });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
