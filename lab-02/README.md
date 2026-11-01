# Lab 2: SQLite Database and CRUD Routes

## Lab Information

- **Course:** Backend Development Fundamentals
- **Lab Number:** Lab 02

---

## Live Link

- **Live URL:** *Not applicable / Pending manual cloud deployment* (See [Deployment Instructions](#deployment-preparation--hosting-options) below)
- *Note:* SQLite uses local file-based storage. Deploying on free-tier platforms (such as Render Free Tier) provides ephemeral storage where database writes reset upon container restarts. Step-by-step instructions for deploying a separate Render web service without altering Lab 1 are documented below.

---

## Objective

To connect an Express.js server to a SQLite database using the `sqlite` and `sqlite3` packages, initialize the database connection asynchronously before launching the server, and expose full CRUD (Create, Read, Update, Delete) RESTful API endpoints over HTTP using parameterized queries.

---

## Technologies Used

- **Runtime:** Node.js (v20+)
- **Framework:** Express.js (v5)
- **Database:** SQLite3
- **Database Drivers:** `sqlite` (promise-based abstraction wrapper) & `sqlite3` (driver)
- **Development Tool:** Nodemon (automatic server restarts on file changes)
- **API Testing:** Postman & Native Node.js Test Suite
- **Version Control:** Git & GitHub

---

## Project Structure

```text
Backend_Development_Fundamentals-L1/
│
├── lab-01/
│   ├── screenshots/
│   ├── server-http.js
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
│
├── lab-02/
│   ├── database/
│   │   ├── schema.sql           # Table definition SQL script
│   │   ├── seed.sql             # 10 initial sample records SQL script
│   │   └── setup.sql            # Combined schema and seed script for SQLite CLI
│   ├── screenshots/
│   │   ├── .gitkeep             # Directory placeholder
│   │   ├── 01-get-all-books.png # (To be captured via Postman)
│   │   ├── 02-get-book-by-id.png
│   │   ├── 03-post-add-book.png
│   │   ├── 04-put-update-book.png
│   │   ├── 05-delete-book.png
│   │   ├── 06-404-not-found.png
│   │   └── 07-database-view.png
│   ├── books.db                 # SQLite database file containing book table
│   ├── package.json             # Dependencies and scripts (start, dev, test)
│   ├── package-lock.json        # Dependency lock file
│   ├── postman_collection.json  # Importable Postman Collection v2.1
│   ├── server.js                # Main Express server and CRUD route handlers
│   ├── test_api.js              # Automated test suite for all 5 CRUD routes
│   └── README.md                # Lab 2 documentation
│
└── .gitignore                   # Excludes node_modules/ and .env
```

---

## Database Schema

### Table: `book`

The database file is `books.db` located inside `lab-02/`. The schema is defined as:

```sql
CREATE TABLE IF NOT EXISTS book (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  price INTEGER NOT NULL,
  pages INTEGER NOT NULL
);
```

### Table Structure

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique identifier for each book |
| `title` | `TEXT` | `NOT NULL` | Title of the book |
| `author` | `TEXT` | `NOT NULL` | Author of the book |
| `price` | `INTEGER` | `NOT NULL` | Price in INR |
| `pages` | `INTEGER` | `NOT NULL` | Total number of pages |

### Initial Sample Records (10 Books)

```sql
INSERT INTO book (title, author, price, pages) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', 399, 180),
('To Kill a Mockingbird', 'Harper Lee', 499, 324),
('1984', 'George Orwell', 299, 328),
('Pride and Prejudice', 'Jane Austen', 249, 279),
('The Hobbit', 'J.R.R. Tolkien', 599, 310),
('The Catcher in the Rye', 'J.D. Salinger', 350, 234),
('Crime and Punishment', 'Fyodor Dostoevsky', 450, 671),
('Clean Code', 'Robert C. Martin', 899, 464),
('The Pragmatic Programmer', 'David Thomas, Andrew Hunt', 950, 352),
('Introduction to Algorithms', 'Thomas H. Cormen', 1499, 1312);
```

### Executing via SQLite CLI

To interact with the database using the SQLite command-line interface:

```bash
# Navigate to lab-02 directory
cd lab-02

# Open or create the database with SQLite CLI
sqlite3 books.db

# In the SQLite prompt, load the setup script:
sqlite> .read database/setup.sql

# View tables
sqlite> .tables

# View table schema
sqlite> .schema book

# Query all rows in tabular mode
sqlite> .mode table
sqlite> SELECT * FROM book;

# Exit SQLite prompt
sqlite> .exit
```

---

## Installation and Execution

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (Node Package Manager)
- Postman (for API testing and capturing submission screenshots)

### 1. Installation

Navigate to the `lab-02` directory and install dependencies:

```bash
cd lab-02
npm install
```

### 2. Available Scripts

| Command | Action |
|---|---|
| `npm start` | Starts the server in production mode (`node server.js`) |
| `npm run dev` | Starts the server with Nodemon for hot reloading on file changes |
| `npm test` | Runs the automated 15-point API test suite (`node test_api.js`) |

### 3. Running the Server

#### Normal Execution:
```bash
npm start
```

#### Development Execution (with Nodemon):
```bash
npm run dev
```

The terminal will display:
```text
Connected to SQLite database at: ./books.db
Server is running at http://localhost:3000/
```

---

## API Endpoints Overview

| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `GET` | `/` | API overview and endpoint guide | 200 OK |
| `GET` | `/books/` | Retrieve all books ordered by ID | 200 OK |
| `GET` | `/books/:bookId/` | Retrieve a specific book by ID | 200 OK / 400 / 404 |
| `POST` | `/books/` | Add a new book to the database | 201 Created / 400 |
| `PUT` | `/books/:bookId/` | Update an existing book's details | 200 OK / 400 / 404 |
| `DELETE` | `/books/:bookId/` | Remove a book from the database by ID | 200 OK / 400 / 404 |

---

## Detailed Endpoint Documentation

### 1. GET `/books/`
- **Method:** `GET`
- **Description:** Returns an array of all books stored in the `book` table.
- **Request Parameters:** None
- **Response:** `200 OK`

```json
[
  {
    "id": 1,
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "price": 399,
    "pages": 180
  },
  {
    "id": 2,
    "title": "To Kill a Mockingbird",
    "author": "Harper Lee",
    "price": 499,
    "pages": 324
  }
]
```

---

### 2. GET `/books/:bookId/`
- **Method:** `GET`
- **Description:** Returns the details of a single book matching the given `bookId`.
- **URL Parameter:** `bookId` (positive integer)
- **Response (Success):** `200 OK`

```json
{
  "id": 1,
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "price": 399,
  "pages": 180
}
```

- **Response (Not Found - e.g., `/books/999/`):** `404 Not Found`

```json
{
  "error": "Book with ID 999 not found."
}
```

- **Response (Invalid ID - e.g., `/books/abc/`):** `400 Bad Request`

```json
{
  "error": "Invalid book ID. Book ID must be a positive integer."
}
```

---

### 3. POST `/books/`
- **Method:** `POST`
- **Description:** Inserts a new book into the database. Uses parameterized SQL queries with `?` placeholders.
- **Headers:** `Content-Type: application/json`
- **Request Body:**

```json
{
  "title": "Atomic Habits",
  "author": "James Clear",
  "price": 550,
  "pages": 320
}
```

- **Response (Success):** `201 Created`

```json
{
  "message": "Book Added Successfully",
  "bookId": 11
}
```

- **Response (Validation Error):** `400 Bad Request`

```json
{
  "error": "Validation failed",
  "details": "Request body must include: title (string), author (string), price (non-negative number), pages (positive number)."
}
```

---

### 4. PUT `/books/:bookId/`
- **Method:** `PUT`
- **Description:** Updates all fields of an existing book by its `bookId`.
- **Headers:** `Content-Type: application/json`
- **URL Parameter:** `bookId` (integer)
- **Request Body:**

```json
{
  "title": "Atomic Habits - Special Edition",
  "author": "James Clear",
  "price": 599,
  "pages": 336
}
```

- **Response (Success):** `200 OK`

```json
{
  "message": "Book Updated Successfully"
}
```

- **Response (Not Found - e.g., ID 999):** `404 Not Found`

```json
{
  "error": "Book with ID 999 not found. Cannot update nonexistent book."
}
```

---

### 5. DELETE `/books/:bookId/`
- **Method:** `DELETE`
- **Description:** Removes a book from the database by its `bookId`.
- **URL Parameter:** `bookId` (integer)
- **Response (Success):** `200 OK`

```json
{
  "message": "Book Deleted Successfully"
}
```

- **Response (Not Found - e.g., ID 999):** `404 Not Found`

```json
{
  "error": "Book with ID 999 not found. Cannot delete nonexistent book."
}
```

---

## HTTP Status Codes Reference

| Status Code | Meaning | Usage in Lab 2 |
|---|---|---|
| `200 OK` | Standard response for successful requests | Returned on `GET /books/`, `GET /books/:id/`, `PUT`, and `DELETE` |
| `201 Created` | New resource created | Returned on successful `POST /books/` with `bookId` |
| `400 Bad Request` | Client sent invalid parameters or body | Returned when `bookId` is not a positive integer or payload fails validation |
| `404 Not Found` | Resource could not be found | Returned when requesting, updating, or deleting a book that does not exist in the database |
| `500 Internal Server Error` | Unexpected server or database exception | Returned when an unhandled database query error occurs |

---

## Testing and Verification

### 1. Automated Local Test Suite

An automated test script `test_api.js` is included in `lab-02/`.

Run the automated test suite with:

```bash
# Terminal 1: Start the server
npm start

# Terminal 2: Run the tests
npm test
```

#### Test Results:

```text
=== STARTING API TEST SUITE FOR LAB 2 ===
PASS: GET / -> returns 200 and API overview
   Found 10 books in database.
PASS: GET /books/ -> returns 200 and array of books
   Book 1: "The Great Gatsby" by F. Scott Fitzgerald
PASS: GET /books/1/ -> returns 200 and specific book
PASS: GET /books/999/ -> returns 404 for nonexistent book
PASS: GET /books/abc/ -> returns 400 for invalid book ID
   Created new book with ID: 11
PASS: POST /books/ -> returns 201 and creates book
PASS: GET /books/:id/ -> retrieves the newly created book
PASS: POST /books/ -> returns 400 when body is invalid
PASS: PUT /books/:id/ -> returns 200 and updates book
PASS: GET /books/:id/ -> verifies update persisted in SQLite
PASS: PUT /books/999/ -> returns 404 when updating nonexistent book
PASS: DELETE /books/:id/ -> returns 200 and deletes book
PASS: GET /books/:id/ after DELETE -> returns 404
PASS: DELETE /books/999/ -> returns 404 when deleting nonexistent book
PASS: DELETE /books/abc/ -> returns 400 for invalid ID

=========================================
TOTAL TESTS: 15
PASSED: 15
FAILED: 0
=========================================
```

### 2. Postman Collection Testing

A pre-configured Postman collection is provided at `lab-02/postman_collection.json`.

1. Open Postman.
2. Click **Import** (top left).
3. Select `lab-02/postman_collection.json`.
4. The collection **Lab 2 - SQLite Database and CRUD Routes** will appear with all 8 requests ready to execute against `http://localhost:3000`.

---

## Screenshots

The placeholders below reference the screenshots you must capture using Postman and save into the `lab-02/screenshots/` folder.

### 1. GET All Books (`/books/`)
Displays all books retrieved from the SQLite database.

![GET All Books](screenshots/01-get-all-books.png)

### 2. GET Book by ID (`/books/1/`)
Displays a single book record with ID 1.

![GET Book by ID](screenshots/02-get-book-by-id.png)

### 3. POST Add New Book (`/books/`)
Displays the 201 Created response containing `message` and `bookId`.

![POST Add Book](screenshots/03-post-add-book.png)

### 4. PUT Update Book (`/books/11/`)
Displays the 200 OK response confirming the book was updated.

![PUT Update Book](screenshots/04-put-update-book.png)

### 5. DELETE Book (`/books/11/`)
Displays the 200 OK response confirming the book was deleted.

![DELETE Book](screenshots/05-delete-book.png)

### 6. 404 Not Found Error Handling (`/books/999/`)
Displays proper 404 error handling for a nonexistent book.

![404 Not Found](screenshots/06-404-not-found.png)

### 7. SQLite Database View / CLI Verification
Displays the database records in the SQLite CLI or DB Browser.

![Database View](screenshots/07-database-view.png)

---

## Viva Questions & Answers

### Q1: Why do we `await` the database call?
> **Answer:** Database operations (such as opening a connection, executing SQL queries, or committing transactions) are asynchronous I/O operations that communicate with the file system or database engine. In JavaScript, these operations return Promises. Using `await` pauses the execution of the asynchronous function until the Promise resolves, ensuring that data is fully retrieved or written before executing subsequent code (such as sending the HTTP response). Failing to `await` would result in returning pending Promises or sending responses before the query has completed.

### Q2: What is SQL injection and how do placeholders prevent it?
> **Answer:** SQL Injection is a major security vulnerability where malicious SQL commands are entered into user input fields (e.g., `' OR '1'='1`) and concatenated directly into the SQL statement, altering query logic and potentially allowing attackers to read, modify, or drop entire databases.
> Parameterized queries with `?` placeholders (e.g., `SELECT * FROM book WHERE id = ?`) prevent this by separating the SQL statement structure from the input data. The database driver sends the query code and data parameters separately to the database engine. The input is treated strictly as literal data values and never executed as SQL code, completely eliminating SQL injection risks.

### Q3: When is PUT used instead of POST?
> **Answer:**
> - **POST** is used to create a new resource. The server generates the resource's identifier (such as an autoincrementing `id`). Repeated POST requests with the same payload create multiple distinct resources (non-idempotent).
> - **PUT** is used to replace or update an existing resource at a known URI (e.g., `/books/:bookId/`). PUT is idempotent: making the exact same PUT request multiple times with identical data produces the exact same resulting state on the server without creating extra resources.

---

## Problems Faced and Solutions

1. **Database Initialization Timing:**
   - *Problem:* Starting the Express server before SQLite finishes opening could cause early incoming HTTP requests to fail with `Cannot read properties of null (reading 'all')`.
   - *Solution:* Implemented the `initializeDBAndServer()` async function where `app.listen()` is only called inside the `try` block after `open()` and table creation succeed.

2. **SQL Injection Risks with String Concatenation:**
   - *Problem:* Concatenating query parameters (`"WHERE id = " + req.params.bookId`) is vulnerable to SQL injection.
   - *Solution:* Used parameterized queries (`?`) for all user input across GET, POST, PUT, and DELETE operations.

3. **Distinguishing 404 vs 500 for Nonexistent Records:**
   - *Problem:* Calling `UPDATE` or `DELETE` on a nonexistent ID in SQLite simply updates or deletes 0 rows without throwing an error, returning a false 200 OK.
   - *Solution:* Explicitly checked for record existence using `await db.get("SELECT * FROM book WHERE id = ?;", [parsedId])` prior to updating or deleting, returning an accurate `404 Not Found` when no record matches.

4. **Security Warnings (`minimatch` inside `nodemon`):**
   - *Problem:* `npm audit` flagged a moderate advisory for `minimatch` in `nodemon`. Running `npm audit fix --force` would downgrade `nodemon` to 1.0.2, breaking modern configuration.
   - *Solution:* Recognized that `nodemon` is strictly a development tool (`devDependency`) and is never executed in production. Avoided `--force` fixes to maintain modern, secure, and working project dependencies.

---

## Deployment Preparation & Hosting Options

### SQLite Persistence Considerations
SQLite stores all relational data in a single local file (`books.db`). When deploying to containerized cloud platforms (such as Render Free Tier or Heroku):
- Free tiers use **ephemeral disks**. Any writes made to the SQLite database during runtime will be wiped whenever the instance sleeps, restarts, or redeploys.
- In our implementation, `server.js` automatically creates the table and seeds the 10 books if the table is empty, guaranteeing that the application always boots into a working state on any cloud host.
- For full write persistence on cloud services, either:
  1. Attach a persistent disk (Render Paid Disk or Railway Volume).
  2. Or migrate the driver to a hosted PostgreSQL/MySQL database for production.

### Deploying a Separate Service on Render (Preserving Lab 1)

**IMPORTANT:** Do NOT modify the existing Lab 1 Render web service (`https://backend-development-fundamentals-l1.onrender.com`).

To deploy Lab 2 as its own separate service:
1. Log into your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Select your GitHub repository: `Backend_Development_Fundamentals-L1`.
4. Configure the service settings:
   - **Name:** `backend-fundamentals-lab-02`
   - **Root Directory:** `lab-02`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Click **Create Web Service**.
6. Once deployed, test the live URL and paste it under [Live Link](#live-link).

---

## Result

Lab 2 has been completely implemented and verified. The Express server successfully establishes an asynchronous connection with the SQLite database, validates all incoming requests, protects against SQL injection using parameterized queries, and performs full CRUD operations with accurate HTTP status codes (200, 201, 400, 404). All 15 automated test cases passed without error.
