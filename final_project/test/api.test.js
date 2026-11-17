const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../index.js');

let server;
let baseUrl;

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const data = await response.json();
  return { response, data };
}

async function registerAndLogin(username) {
  await request('/register', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username, password: 'secret123' })
  });
  const { response, data } = await request('/customer/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username, password: 'secret123' })
  });
  assert.equal(response.status, 200);
  return data.accessToken;
}

before(() => new Promise((resolve) => {
  server = app.listen(0, '127.0.0.1', () => {
    baseUrl = `http://127.0.0.1:${server.address().port}`;
    resolve();
  });
}));

after(() => new Promise((resolve, reject) => {
  server.close((error) => (error ? reject(error) : resolve()));
}));

test('public users can retrieve and search books', async () => {
  const [all, isbn, author, title, reviews] = await Promise.all([
    request('/'),
    request('/isbn/1'),
    request('/author/Jane%20Austen'),
    request('/title/Pride%20and%20Prejudice'),
    request('/review/1')
  ]);

  assert.equal(all.response.status, 200);
  assert.equal(Object.keys(all.data).length, 10);
  assert.equal(isbn.data.title, 'Things Fall Apart');
  assert.equal(author.data['8'].author, 'Jane Austen');
  assert.equal(title.data['8'].title, 'Pride and Prejudice');
  assert.deepEqual(reviews.data, {});
});

test('registration rejects duplicate usernames and login validates credentials', async () => {
  const registration = await request('/register', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'alice', password: 'secret123' })
  });
  assert.equal(registration.response.status, 201);

  const duplicate = await request('/register', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'ALICE', password: 'another' })
  });
  assert.equal(duplicate.response.status, 409);

  const failedLogin = await request('/customer/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'alice', password: 'wrong' })
  });
  assert.equal(failedLogin.response.status, 401);
});

test('logged-in users can add, update, and delete only their own reviews', async () => {
  const [aliceToken, bobToken] = await Promise.all([
    registerAndLogin('reviewer-alice'),
    registerAndLogin('reviewer-bob')
  ]);

  const auth = (token) => ({
    method: 'PUT',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json'
    }
  });

  const [aliceReview, bobReview] = await Promise.all([
    request('/customer/auth/review/1', {
      ...auth(aliceToken),
      body: JSON.stringify({ review: 'A powerful novel.' })
    }),
    request('/customer/auth/review/1', {
      ...auth(bobToken),
      body: JSON.stringify({ review: 'Essential reading.' })
    })
  ]);
  assert.equal(aliceReview.response.status, 200);
  assert.equal(bobReview.response.status, 200);

  const updated = await request('/customer/auth/review/1', {
    ...auth(aliceToken),
    body: JSON.stringify({ review: 'An unforgettable novel.' })
  });
  assert.equal(updated.data.reviews['reviewer-alice'], 'An unforgettable novel.');
  assert.equal(updated.data.reviews['reviewer-bob'], 'Essential reading.');

  const deleted = await request('/customer/auth/review/1', {
    method: 'DELETE',
    headers: { authorization: `Bearer ${aliceToken}` }
  });
  assert.equal(deleted.response.status, 200);
  assert.equal(deleted.data.reviews['reviewer-alice'], undefined);
  assert.equal(deleted.data.reviews['reviewer-bob'], 'Essential reading.');
});

test('protected review routes reject unauthenticated requests', async () => {
  const result = await request('/customer/auth/review/2', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ review: 'Should not be saved.' })
  });
  assert.equal(result.response.status, 401);
});
