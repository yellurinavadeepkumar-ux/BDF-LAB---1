/**
 * Automated Verification Script for Lab 2 API Endpoints
 */

const http = require("http");

const BASE_URL = "http://localhost:3000";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log("=== STARTING API TEST SUITE FOR LAB 2 ===");
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`FAIL: ${name}`);
      console.error(`   Error: ${err.message}`);
      failed++;
    }
  }

  // 1. GET Root
  await test("GET / -> returns 200 and API overview", async () => {
    const res = await fetch(`${BASE_URL}/`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.message || !data.endpoints) throw new Error("Invalid response format");
  });

  // 2. GET /books/
  await test("GET /books/ -> returns 200 and array of books", async () => {
    const res = await fetch(`${BASE_URL}/books/`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length < 8) {
      throw new Error(`Expected array with at least 8 books, got ${data.length}`);
    }
    console.log(`   Found ${data.length} books in database.`);
  });

  // 3. GET /books/1/
  await test("GET /books/1/ -> returns 200 and specific book", async () => {
    const res = await fetch(`${BASE_URL}/books/1/`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.id !== 1 || !data.title || !data.author) {
      throw new Error("Returned book object missing required fields");
    }
    console.log(`   Book 1: "${data.title}" by ${data.author}`);
  });

  // 4. GET /books/999/ (Nonexistent book)
  await test("GET /books/999/ -> returns 404 for nonexistent book", async () => {
    const res = await fetch(`${BASE_URL}/books/999/`);
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
    const data = await res.json();
    if (!data.error) throw new Error("Expected error message in response");
  });

  // 5. GET /books/abc/ (Invalid bookId)
  await test("GET /books/abc/ -> returns 400 for invalid book ID", async () => {
    const res = await fetch(`${BASE_URL}/books/abc/`);
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  // 6. POST /books/ (Add new book)
  let createdBookId = null;
  await test("POST /books/ -> returns 201 and creates book", async () => {
    const newBook = {
      title: "Atomic Habits",
      author: "James Clear",
      price: 550,
      pages: 320,
    };
    const res = await fetch(`${BASE_URL}/books/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBook),
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    const data = await res.json();
    if (!data.bookId) throw new Error("Expected bookId in response");
    createdBookId = data.bookId;
    console.log(`   Created new book with ID: ${createdBookId}`);
  });

  // 7. GET newly created book
  await test("GET /books/:id/ -> retrieves the newly created book", async () => {
    const res = await fetch(`${BASE_URL}/books/${createdBookId}/`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.title !== "Atomic Habits" || data.author !== "James Clear") {
      throw new Error("Data mismatch in created book");
    }
  });

  // 8. POST /books/ with invalid body -> 400
  await test("POST /books/ -> returns 400 when body is invalid", async () => {
    const res = await fetch(`${BASE_URL}/books/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "" }),
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  // 9. PUT /books/:id/ (Update the book)
  await test("PUT /books/:id/ -> returns 200 and updates book", async () => {
    const updateData = {
      title: "Atomic Habits - Expanded Edition",
      author: "James Clear",
      price: 599,
      pages: 336,
    };
    const res = await fetch(`${BASE_URL}/books/${createdBookId}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.message !== "Book Updated Successfully") {
      throw new Error(`Unexpected message: ${data.message}`);
    }
  });

  // 10. GET to verify the update took effect
  await test("GET /books/:id/ -> verifies update persisted in SQLite", async () => {
    const res = await fetch(`${BASE_URL}/books/${createdBookId}/`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.title !== "Atomic Habits - Expanded Edition" || data.price !== 599) {
      throw new Error("Update was not reflected in the database");
    }
  });

  // 11. PUT /books/999/ -> 404 for nonexistent book
  await test("PUT /books/999/ -> returns 404 when updating nonexistent book", async () => {
    const res = await fetch(`${BASE_URL}/books/999/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Test",
        author: "Author",
        price: 100,
        pages: 100,
      }),
    });
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
  });

  // 12. DELETE /books/:id/ (Delete the book)
  await test("DELETE /books/:id/ -> returns 200 and deletes book", async () => {
    const res = await fetch(`${BASE_URL}/books/${createdBookId}/`, {
      method: "DELETE",
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.message !== "Book Deleted Successfully") {
      throw new Error(`Unexpected message: ${data.message}`);
    }
  });

  // 13. GET after DELETE -> should return 404
  await test("GET /books/:id/ after DELETE -> returns 404", async () => {
    const res = await fetch(`${BASE_URL}/books/${createdBookId}/`);
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
  });

  // 14. DELETE /books/999/ -> 404
  await test("DELETE /books/999/ -> returns 404 when deleting nonexistent book", async () => {
    const res = await fetch(`${BASE_URL}/books/999/`, {
      method: "DELETE",
    });
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
  });

  // 15. DELETE /books/abc/ -> 400
  await test("DELETE /books/abc/ -> returns 400 for invalid ID", async () => {
    const res = await fetch(`${BASE_URL}/books/abc/`, {
      method: "DELETE",
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  console.log("\n=========================================");
  console.log(`TOTAL TESTS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log("=========================================\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
