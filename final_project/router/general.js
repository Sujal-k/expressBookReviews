const express = require('express');
const axios = require('axios'); // Ensure axios is imported
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body; // Destructure username and password from request body

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if the username already exists
    if (users[username]) {
        return res.status(400).json({ message: "Username already exists" });
    }

    // If the username does not exist, add the user
    users[username] = { password }; // Save the user with the password (you might want to hash the password in a real application)

    // Respond with success message
    return res.status(200).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn; // Extract ISBN from the request parameters

    // Check if a book exists for the provided ISBN
    if (books[isbn]) {
        res.status(200).send(JSON.stringify(books[isbn], null, 4)); // Return the book details
    } else {
        res.status(404).json({ message: "Book not found" }); // Send a 404 if book not found
    }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const authorName = req.params.author; // Extract author from the request parameters
    const booksByAuthor = []; // Array to store books written by the specified author

    // Iterate through the books object
    for (let isbn in books) {
        if (books[isbn].author === authorName) {
            booksByAuthor.push({ isbn: isbn, ...books[isbn] }); // Add matching books to the array
        }
    }

    // If books are found, return them, otherwise return a 'not found' message
    if (booksByAuthor.length > 0) {
        res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
    } else {
        res.status(404).json({ message: "No books found by this author" });
    }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const titleName = req.params.title.toLowerCase(); // Extract and normalize the title from the request
    const booksByTitle = []; // Array to store books matching the title

    // Iterate through the books object
    for (let isbn in books) {
        if (books[isbn].title.toLowerCase() === titleName) { // Check if the title matches
            booksByTitle.push({ isbn: isbn, ...books[isbn] }); // Add matching books to the array
        }
    }

    // If books are found, return them; otherwise, return a 'not found' message
    if (booksByTitle.length > 0) {
        res.status(200).send(JSON.stringify(booksByTitle, null, 4));
    } else {
        res.status(404).json({ message: "No books found with this title" });
    }
});

// Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn; // Get the ISBN from the request parameters

    // Check if the book exists in the books object
    if (books[isbn]) {
        // If the book exists, send the reviews
        const reviews = books[isbn].reviews;
        res.status(200).send(JSON.stringify(reviews, null, 4));
    } else {
        // If the book does not exist, send a not found message
        res.status(404).json({ message: "No reviews found for this ISBN" });
    }
});

// Task 10: Get the List of Books Available in the Shop
public_users.get('/books', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:5000/'); // Adjust the URL if necessary
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books' });
    }
});

// Task 11: Get Book Details Based on ISBN
public_users.get('/books/:isbn', async (req, res) => {
    const { isbn } = req.params;
    try {
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`); // Adjust the URL if necessary
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching book details' });
    }
});

// Task 12: Get Book Details Based on Author
public_users.get('/books/author/:author', async (req, res) => {
    const { author } = req.params;
    try {
        const response = await axios.get(`http://localhost:5000/author/${author}`); // Adjust the URL if necessary
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books by author' });
    }
});

// Task 13: Get Book Details Based on Title
public_users.get('/books/title/:title', async (req, res) => {
    const { title } = req.params;
    try {
        const response = await axios.get(`http://localhost:5000/title/${title}`); // Adjust the URL if necessary
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books by title' });
    }
});

module.exports.general = public_users;
