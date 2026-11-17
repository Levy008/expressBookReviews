# Book Review REST API

An Express server for the IBM Node.js final project. It supports public book
searches, user registration and login, JWT/session authentication, and
owner-scoped review creation, modification, and deletion.

## Run locally

```bash
npm install
npm start
```

The API listens on `http://localhost:5000` by default. The in-memory users and
reviews reset whenever the process restarts, matching the supplied course
skeleton.

## Routes

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/` | Public | List every book |
| `GET` | `/isbn/:isbn` | Public | Find one book by ISBN |
| `GET` | `/author/:author` | Public | Find books by author |
| `GET` | `/title/:title` | Public | Find books by title |
| `GET` | `/review/:isbn` | Public | Get reviews for a book |
| `POST` | `/register` | Public | Register a user |
| `POST` | `/customer/login` | Public | Log in and receive a JWT |
| `PUT` | `/customer/auth/review/:isbn` | Authenticated | Add/update own review |
| `DELETE` | `/customer/auth/review/:isbn` | Authenticated | Delete own review |

The protected routes accept either the login session cookie or an
`Authorization: Bearer <token>` header. A review can be sent as a `review`
query parameter (the course format) or as `{ "review": "..." }` JSON.

## Verify

```bash
npm test
```

See `submission/README.md` for rubric-aligned cURL commands. After the server
is running, execute those commands and save each command plus output in its
named text file.
