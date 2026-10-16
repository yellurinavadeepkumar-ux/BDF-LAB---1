# Lab 1: Node.js and Express Server

## Student Details

- **Name:** NAVADEEP
- **Section:** CSE FSD 2B
- **Course:** Backend Development Fundamentals
- **Lab Number:** 01

## Objective

To create and test basic HTTP and Express.js servers using Node.js, implement multiple routes, and handle HTTP status codes.

## live link
https://backend-development-fundamentals-l1.onrender.com

## Technologies Used

- Node.js
- Express.js
- JavaScript
- npm
- Google Chrome
- Antigravity IDE

## Project Structure

```text
lab-01/
├── screenshots/
│   ├── 01-home.png
│   ├── 02-about.png
│   ├── 03-time.png
│   └── 04-not-found.png
├── server-http.js
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## Installation and Execution

### Prerequisites

- Node.js and npm installed
- A code editor such as Antigravity IDE

### Steps to Run

1. Open the `lab-01` project folder in the terminal.
2. Install the dependencies:

   ```bash
   npm install
   ```

3. Start the Express server:

   ```bash
   node server.js
   ```

4. Open the following URL in your browser:

   `http://localhost:3000`

### Run the Basic HTTP Server

To run the server created using Node.js's built-in HTTP module:

```bash
node server-http.js
```

Stop the running server using `Ctrl + C` before starting another server on the same port.

## Endpoints

| Method | Endpoint | Description | Expected Status |
|---|---|---|---|
| GET | `/` | Returns a welcome message | 200 OK |
| GET | `/about` | Returns the student's name and section as JSON | 200 OK |
| GET | `/time` | Returns the current date and time as JSON | 200 OK |
| GET | `/contact` | Demonstrates unknown-route handling | 404 Not Found |

## Screenshots

### 1. Home Route

Displays the welcome message from the Express server.

![Home Route](screenshots/01-home.png)

### 2. About Route

Displays the student's name and section in JSON format.

![About Route](screenshots/02-about.png)

### 3. Time Route

Displays the current date and time in JSON format.

![Time Route](screenshots/03-time.png)

### 4. 404 Not Found Route

Displays the 404 response for an undefined route.

![404 Not Found Route](screenshots/04-not-found.png)

## HTTP Status Codes

- **200 OK:** The request was processed successfully.
- **404 Not Found:** The requested route does not exist.


## Problems Faced and Solutions

- **Connection refused:** Ensured that the Express server was running before opening the browser.
- **Unknown route:** Verified that undefined routes returned a 404 response.
- **Screenshot display:** Stored screenshots in the `screenshots/` folder and referenced them using relative paths in the README.

## Result

The Express server was tested successfully. The home, about, and time routes returned HTTP 200 responses, while the undefined `/contact` route returned HTTP 404.

## Git and Repository Notes

- The `screenshots/` folder contains the screenshots of the tested routes.
- The `.gitignore` file should exclude `node_modules/` and `.env`.
- The `node_modules/` directory should not be committed to the repository.
- The README documents the project setup, endpoints, screenshots, and test results.


