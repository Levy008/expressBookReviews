const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'access';
const SESSION_SECRET = process.env.SESSION_SECRET || 'fingerprint_customer';

app.use(express.json());

app.use('/customer', session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 1000
  }
}));

app.use('/customer/auth', function auth(req, res, next) {
  const sessionAuth = req.session && req.session.authorization;
  const bearerToken = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  const accessToken = bearerToken || sessionAuth?.accessToken;

  if (!accessToken) {
    return res.status(401).json({ message: 'Please log in to access this resource.' });
  }

  try {
    const decoded = jwt.verify(accessToken, JWT_SECRET);
    const username = decoded.username || decoded.data;

    if (!username || (sessionAuth?.username && sessionAuth.username !== username)) {
      return res.status(401).json({ message: 'Invalid authentication token.' });
    }

    req.auth = { username };
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired authentication token.' });
  }
});

app.use('/customer', customer_routes);
app.use('/', genl_routes);

if (require.main === module) {
  app.listen(PORT, () => console.log(`Book review server is running on port ${PORT}`));
}

module.exports = app;
