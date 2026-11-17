const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');
const regd_users = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'access';

const users = [];

// Returns true when the username is already registered.
const isValid = (username) => users.some(
  (user) => user.username.toLowerCase() === String(username).trim().toLowerCase()
);

const authenticatedUser = (username, password) => users.some(
  (user) => user.username.toLowerCase() === String(username).trim().toLowerCase()
    && user.password === password
);

// Only registered users can log in.
regd_users.post('/login', (req, res) => {
  const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }

  const registeredUser = users.find(
    (user) => user.username.toLowerCase() === username.toLowerCase()
  );
  const accessToken = jwt.sign(
    { username: registeredUser.username },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  req.session.authorization = {
    accessToken,
    username: registeredUser.username
  };

  return res.status(200).json({
    message: 'User successfully logged in.',
    accessToken
  });
});

// Add or modify the logged-in user's own book review.
regd_users.put('/auth/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  const review = typeof req.query.review === 'string'
    ? req.query.review.trim()
    : typeof req.body.review === 'string' ? req.body.review.trim() : '';

  if (!book) {
    return res.status(404).json({ message: `No book found for ISBN ${req.params.isbn}.` });
  }

  if (!review) {
    return res.status(400).json({ message: 'A non-empty review is required.' });
  }

  const username = req.auth.username;
  const wasUpdated = Object.prototype.hasOwnProperty.call(book.reviews, username);
  book.reviews[username] = review;

  return res.status(200).json({
    message: wasUpdated ? 'Review successfully updated.' : 'Review successfully added.',
    reviews: book.reviews
  });
});

// Delete only the logged-in user's own review.
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];

  if (!book) {
    return res.status(404).json({ message: `No book found for ISBN ${req.params.isbn}.` });
  }

  const username = req.auth.username;
  if (!Object.prototype.hasOwnProperty.call(book.reviews, username)) {
    return res.status(404).json({ message: 'You do not have a review for this book.' });
  }

  delete book.reviews[username];
  return res.status(200).json({
    message: 'Review successfully deleted.',
    reviews: book.reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.authenticatedUser = authenticatedUser;
module.exports.users = users;
