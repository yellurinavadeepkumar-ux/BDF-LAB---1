/**
 * Lab 2: SQLite Database and CRUD Routes
 *
 * Technologies: Node.js, Express.js, SQLite (sqlite & sqlite3), Nodemon
 */

const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();

// Middleware to parse incoming JSON and urlencoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Server port configuration (configurable via environment variable)
const PORT = process.env.PORT || 3000;

// Path to the SQLite database file
const dbPath = process.env.DB_PATH || path.join(__dirname, "books.db");
let db = null;

/**
 * Initializes the SQLite database connection and starts the Express server.
 * Ensures the 'book' table exists and populates initial sample data if empty.
 */
const initializeDBAndServer = async () => {
  try {
    // 1. Open the SQLite database connection
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    console.log(`Connected to SQLite database at: ${dbPath}`);

    // 2. Create the 'book' table if it doesn't already exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price INTEGER NOT NULL,
        pages INTEGER NOT NULL
      );
    `);

    // 3. Seed initial 10 books if the table is currently empty
    const countResult = await db.get("SELECT COUNT(*) AS total FROM book;");
    if (countResult.total === 0) {
      console.log("Database table 'book' is empty. Inserting initial sample records...");
      await db.exec(`
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
      `);
      console.log("10 sample books inserted successfully.");
    }

    // 4. Start the Express HTTP server only after database is initialized
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error(`Database connection or initialization error: ${error.message}`);
    process.exit(1);
  }
};

// Start the database and server initialization
initializeDBAndServer();

// ============================================================================
// API ROUTES
// ============================================================================

/**
 * Root Route: Welcome & API documentation overview
 * Method: GET
 * Route: /
 */
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to Bookstore CRUD API - Lab 2",
    endpoints: [
      { method: "GET", path: "/books/", description: "Retrieve all books" },
      { method: "GET", path: "/books/:bookId/", description: "Retrieve a specific book by ID" },
      { method: "POST", path: "/books/", description: "Add a new book" },
      { method: "PUT", path: "/books/:bookId/", description: "Update an existing book by ID" },
      { method: "DELETE", path: "/books/:bookId/", description: "Delete a book by ID" },
    ],
  });
});

/**
 * Route 1: Retrieve all books
 * Method: GET
 * Route: /books/ or /books
 */
app.get(["/books", "/books/"], async (req, res) => {
  try {
    const getBooksQuery = `
      SELECT *
      FROM book
      ORDER BY id ASC;
    `;
    const books = await db.all(getBooksQuery);
    res.status(200).json(books);
  } catch (error) {
    console.error("Error retrieving books:", error.message);
    res.status(500).json({ error: "Failed to retrieve books from database" });
  }
});

/**
 * Route 2: Retrieve a single book by ID
 * Method: GET
 * Route: /books/:bookId/ or /books/:bookId
 */
app.get(["/books/:bookId", "/books/:bookId/"], async (req, res) => {
  const { bookId } = req.params;
  const parsedId = parseInt(bookId, 10);

  // Validate that bookId is a positive integer
  if (isNaN(parsedId) || parsedId <= 0) {
    return res.status(400).json({
      error: "Invalid book ID. Book ID must be a positive integer.",
    });
  }

  try {
    // Parameterized query using ? placeholder prevents SQL Injection
    const getBookQuery = `
      SELECT *
      FROM book
      WHERE id = ?;
    `;
    const book = await db.get(getBookQuery, [parsedId]);

    if (!book) {
      return res.status(404).json({
        error: `Book with ID ${parsedId} not found.`,
      });
    }

    res.status(200).json(book);
  } catch (error) {
    console.error(`Error retrieving book ID ${bookId}:`, error.message);
    res.status(500).json({ error: "Failed to retrieve book from database" });
  }
});

/**
 * Route 3: Add a new book
 * Method: POST
 * Route: /books/ or /books
 */
app.post(["/books", "/books/"], async (req, res) => {
  // Validate that request body exists
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({
      error: "Validation failed",
      details:
        "Request body is missing. Ensure you are sending JSON data with 'Content-Type: application/json' header.",
    });
  }

  const { title, author, price, pages } = req.body;

  // Flexible numeric parsing to support both number and numeric string types
  const numericPrice =
    typeof price === "number"
      ? price
      : price !== undefined && price !== null && price !== ""
      ? Number(price)
      : NaN;
  const numericPages =
    typeof pages === "number"
      ? pages
      : pages !== undefined && pages !== null && pages !== ""
      ? Number(pages)
      : NaN;

  // Validate request body fields
  if (
    !title ||
    typeof title !== "string" ||
    title.trim() === "" ||
    !author ||
    typeof author !== "string" ||
    author.trim() === "" ||
    isNaN(numericPrice) ||
    numericPrice < 0 ||
    isNaN(numericPages) ||
    numericPages <= 0
  ) {
    return res.status(400).json({
      error: "Validation failed",
      details:
        "Request body must include: title (string), author (string), price (non-negative number), pages (positive number).",
    });
  }

  try {
    // Parameterized query using ? placeholders prevents SQL Injection
    const addBookQuery = `
      INSERT INTO book (title, author, price, pages)
      VALUES (?, ?, ?, ?);
    `;
    const result = await db.run(addBookQuery, [
      title.trim(),
      author.trim(),
      numericPrice,
      numericPages,
    ]);

    res.status(201).json({
      message: "Book Added Successfully",
      bookId: result.lastID,
    });
  } catch (error) {
    console.error("Error adding new book:", error.message);
    res.status(500).json({ error: "Failed to add book to database" });
  }
});

/**
 * Route 4: Update an existing book by ID
 * Method: PUT
 * Route: /books/:bookId/ or /books/:bookId
 */
app.put(["/books/:bookId", "/books/:bookId/"], async (req, res) => {
  const { bookId } = req.params;
  const parsedId = parseInt(bookId, 10);

  // Validate bookId
  if (isNaN(parsedId) || parsedId <= 0) {
    return res.status(400).json({
      error: "Invalid book ID. Book ID must be a positive integer.",
    });
  }

  // Validate that request body exists
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({
      error: "Validation failed",
      details:
        "Request body is missing. Ensure you are sending JSON data with 'Content-Type: application/json' header.",
    });
  }

  const { title, author, price, pages } = req.body;

  // Flexible numeric parsing to support both number and numeric string types
  const numericPrice =
    typeof price === "number"
      ? price
      : price !== undefined && price !== null && price !== ""
      ? Number(price)
      : NaN;
  const numericPages =
    typeof pages === "number"
      ? pages
      : pages !== undefined && pages !== null && pages !== ""
      ? Number(pages)
      : NaN;

  // Validate request body fields
  if (
    !title ||
    typeof title !== "string" ||
    title.trim() === "" ||
    !author ||
    typeof author !== "string" ||
    author.trim() === "" ||
    isNaN(numericPrice) ||
    numericPrice < 0 ||
    isNaN(numericPages) ||
    numericPages <= 0
  ) {
    return res.status(400).json({
      error: "Validation failed",
      details:
        "Request body must include: title (string), author (string), price (non-negative number), pages (positive number).",
    });
  }

  try {
    // Check if the book exists
    const checkBookQuery = `SELECT * FROM book WHERE id = ?;`;
    const existingBook = await db.get(checkBookQuery, [parsedId]);

    if (!existingBook) {
      return res.status(404).json({
        error: `Book with ID ${parsedId} not found. Cannot update nonexistent book.`,
      });
    }

    // Parameterized query using ? placeholders prevents SQL Injection
    const updateBookQuery = `
      UPDATE book
      SET title = ?, author = ?, price = ?, pages = ?
      WHERE id = ?;
    `;
    await db.run(updateBookQuery, [
      title.trim(),
      author.trim(),
      numericPrice,
      numericPages,
      parsedId,
    ]);

    res.status(200).json({
      message: "Book Updated Successfully",
    });
  } catch (error) {
    console.error(`Error updating book ID ${bookId}:`, error.message);
    res.status(500).json({ error: "Failed to update book in database" });
  }
});

/**
 * Route 5: Delete a book by ID
 * Method: DELETE
 * Route: /books/:bookId/ or /books/:bookId
 */
app.delete(["/books/:bookId", "/books/:bookId/"], async (req, res) => {
  const { bookId } = req.params;
  const parsedId = parseInt(bookId, 10);

  // Validate bookId
  if (isNaN(parsedId) || parsedId <= 0) {
    return res.status(400).json({
      error: "Invalid book ID. Book ID must be a positive integer.",
    });
  }

  try {
    // Check if the book exists
    const checkBookQuery = `SELECT * FROM book WHERE id = ?;`;
    const existingBook = await db.get(checkBookQuery, [parsedId]);

    if (!existingBook) {
      return res.status(404).json({
        error: `Book with ID ${parsedId} not found. Cannot delete nonexistent book.`,
      });
    }

    // Parameterized query using ? placeholder
    const deleteBookQuery = `
      DELETE FROM book
      WHERE id = ?;
    `;
    await db.run(deleteBookQuery, [parsedId]);

    res.status(200).json({
      message: "Book Deleted Successfully",
    });
  } catch (error) {
    console.error(`Error deleting book ID ${bookId}:`, error.message);
    res.status(500).json({ error: "Failed to delete book from database" });
  }
});

/**
 * Fallback Route: Handle unknown / undefined routes
 */
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

module.exports = app;
