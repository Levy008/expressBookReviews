const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const isValid = require('./auth_users.js').isValid;
const users = require('./auth_users.js').users;
const public_users = express.Router();

const normalise = (value) => String(value).trim().toLowerCase();

public_users.post('/register', (req, res) => {
  const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: 'That username is already registered.' });
  }

  users.push({ username, password });
  return res.status(201).json({ message: 'User successfully registered. You can now log in.' });
});

// Get the book list available in the shop.
public_users.get('/', async function (req, res) {
  return res.status(200).json(books);
});

// Get book details based on ISBN.
public_users.get('/isbn/:isbn', async function (req, res) {
  const book = books[req.params.isbn];

  if (!book) {
    return res.status(404).json({ message: `No book found for ISBN ${req.params.isbn}.` });
  }

  return res.status(200).json(book);
});

// Get book details based on author (case-insensitive partial match).
public_users.get('/author/:author', async function (req, res) {
  const requestedAuthor = normalise(req.params.author);
  const matches = Object.fromEntries(
    Object.entries(books).filter(([, book]) => normalise(book.author).includes(requestedAuthor))
  );

  if (Object.keys(matches).length === 0) {
    return res.status(404).json({ message: `No books found by author ${req.params.author}.` });
  }

  return res.status(200).json(matches);
});

// Get all books based on title (case-insensitive partial match).
public_users.get('/title/:title', async function (req, res) {
  const requestedTitle = normalise(req.params.title);
  const matches = Object.fromEntries(
    Object.entries(books).filter(([, book]) => normalise(book.title).includes(requestedTitle))
  );

  if (Object.keys(matches).length === 0) {
    return res.status(404).json({ message: `No books found with title ${req.params.title}.` });
  }

  return res.status(200).json(matches);
});

// Get book reviews.
public_users.get('/review/:isbn', async function (req, res) {
  const book = books[req.params.isbn];

  if (!book) {
    return res.status(404).json({ message: `No book found for ISBN ${req.params.isbn}.` });
  }

  return res.status(200).json(book.reviews);
});

/*
 * Task 10: reusable asynchronous Axios methods.
 * Start this application before calling them. BOOK_API_URL may be set when the
 * server is not running on the default http://localhost:5000 address.
 */
const apiClient = () => axios.create({
  baseURL: process.env.BOOK_API_URL || 'http://localhost:5000',
  timeout: 5000
});

async function getAllBooks() {
  const response = await apiClient().get('/');
  return response.data;
}

async function getBookByISBN(isbn) {
  const response = await apiClient().get(`/isbn/${encodeURIComponent(isbn)}`);
  return response.data;
}

async function getBooksByAuthor(author) {
  const response = await apiClient().get(`/author/${encodeURIComponent(author)}`);
  return response.data;
}

async function getBooksByTitle(title) {
  const response = await apiClient().get(`/title/${encodeURIComponent(title)}`);
  return response.data;
}

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
