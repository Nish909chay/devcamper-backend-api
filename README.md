# DevCamper API

A robust RESTful API for bootcamp listings, courses, user authentication, reviews, and advanced querying. Built with Node.js, Express, MongoDB, and Mongoose.

NOTE - This is only Backend build for learning purposes

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Folder Structure](#folder-structure)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Node Packages Used](#node-packages-used)
- [Middleware & Their Purpose](#middleware--their-purpose)
- [Schema Models (Brief)](#schema-models-brief)
- [Controller & Routes Logic](#controller--routes-logic)
- [Security Features](#security-features)
- [Error Handling & Common Issues](#error-handling--common-issues)
- [Development Challenges & Solutions](#development-challenges--solutions)
- [API Endpoints (Summary Table)](#api-endpoints-summary-table)
- [License](#license)
- [Author](#author)

---

## Project Overview

DevCamper API is a backend service for managing bootcamps, courses, users, and reviews. It supports advanced filtering, authentication, role-based access, file uploads, and robust security. The API is designed for learning, testing, and as a foundation for full-stack applications.

**Tech Stack:**

- Node.js
- Express.js
- MongoDB & Mongoose

---

## Features

- CRUD operations for Bootcamps, Courses, Reviews, and Users
- User authentication (JWT, cookies)
- Role-based authorization (admin, publisher, user)
- File upload for bootcamp photos
- Advanced query filtering, sorting, pagination
- Geospatial queries (bootcamps within radius)
- Data seeding and database reset scripts
- Security best practices (see below)

---

## Folder Structure

- `controllers/` – Route logic for each resource
- `models/` – Mongoose schemas for Bootcamp, Course, User, Review
- `routes/` – Express routers for API endpoints
- `middleware/` – Custom and third-party middleware (auth, error, async, logger)
- `config/` – Database connection and environment config
- `utils/` – Utility functions (error response, geocoder, email)
- `_data/` – Seed data for bootcamps, courses, users, reviews
- `public/` – Static assets (uploaded files)

---

## Installation & Setup

```sh
# Clone the repo
https://github.com/Nish909chay/devcamper-backend-api.git


# Install dependencies
npm install

# Set up environment variables
cp config/config.env.example config/config.env
# Edit config.env with your MongoDB URI, JWT secret, email settings, etc.

# Seed the database
node seeder -i

# Start the server (dev)
npm run dev
# or (prod)
npm start
```

**Example `.env` file:**

```
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
FILE_UPLOAD_PATH=./public/uploads
MAX_FILE_UPLOAD=1000000
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_EMAIL=your_email
SMTP_PASSWORD=your_password
FROM_EMAIL=admin@devcamping.com
FROM_NAME=DevCamper Admin
```

---

## Environment Variables

- `NODE_ENV` – App environment (development/production)
- `PORT` – Server port
- `MONGO_URI` – MongoDB connection string
- `JWT_SECRET` – JWT signing secret
- `JWT_EXPIRE` – JWT token expiry
- `JWT_COOKIE_EXPIRE` – Cookie expiry (days)
- `FILE_UPLOAD_PATH` – Directory for uploads
- `MAX_FILE_UPLOAD` – Max file size (bytes)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_EMAIL`, `SMTP_PASSWORD` – Email service config
- `FROM_EMAIL`, `FROM_NAME` – Email sender info

---

## Node Packages Used

- **express** – Web framework
- **mongoose** – MongoDB ODM
- **dotenv** – Environment variable loader
- **morgan** – HTTP request logger
- **colors** – Console colors
- **express-fileupload** – File upload middleware
- **cookie-parser** – Cookie parsing
- **express-mongo-sanitize** – Prevent NoSQL injection
- **helmet** – Set security headers
- **xss-clean** – Prevent XSS attacks
- **express-rate-limit** – Rate limiting
- **hpp** – Prevent HTTP param pollution
- **cors** – Enable CORS
- **bcryptjs** – Password hashing
- **jsonwebtoken** – JWT authentication
- **nodemailer** – Email sending

---

## Middleware & Their Purpose

- **Custom:**
  - `auth.js` – Protect routes, role-based access
  - `async.js` – Handle async/await errors
  - `error.js` – Centralized error handler
  - `logger.js` – Custom request logger
- **Third-party:**
  - `express-fileupload` – Handle file uploads
  - `cookie-parser` – Parse cookies
  - `express-mongo-sanitize` – Sanitize data
  - `helmet` – Secure HTTP headers
  - `xss-clean` – Prevent XSS
  - `express-rate-limit` – Limit requests
  - `hpp` – Prevent HTTP param pollution
  - `cors` – Cross-origin resource sharing
  - `morgan` – Dev logging

---

## Schema Models (Brief)

- **User:** name, email, role, password, reset tokens
- **Bootcamp:** name, description, location, careers, photo, user (owner)
- **Course:** title, description, weeks, tuition, bootcamp (ref), user (ref)
- **Review:** title, text, rating, bootcamp (ref), user (ref)

---

## Controller & Routes Logic

- **Bootcamps:** CRUD, photo upload, geospatial search, advanced query
- **Courses:** CRUD, nested under bootcamps, advanced query
- **Users:** Admin CRUD, authentication, get current user
- **Reviews:** CRUD, nested under bootcamps, user/bootcamp relationship
- **Auth:** Register, login, logout, forgot/reset password, JWT/cookie
- **Routes:** Organized by resource, nested routes for courses/reviews under bootcamps

---

## Security Features

- Data sanitization (NoSQL injection): `express-mongo-sanitize`
- HTTP headers: `helmet`
- XSS protection: `xss-clean`
- Rate limiting: `express-rate-limit`
- HTTP param pollution: `hpp`
- CORS enabled
- Password hashing: `bcryptjs`
- JWT authentication
- Cookie security (httpOnly, secure in production)

---

## Error Handling & Common Issues

- Centralized error handler (`error.js`)
- Async error wrapper (`async.js`)
- Custom error response utility
- **Common issues faced:**
  - Mongoose ObjectId validation errors
  - Seeding data with invalid references
  - Express 5 breaking changes (middleware compatibility)
  - File upload and static path issues
  - Authentication/authorization bugs
- **Solutions:**
  - Used valid ObjectIds in all seed data
  - Downgraded to Express 4 for middleware compatibility
  - Added debug logging and improved error messages

---

## Development Challenges & Solutions

- **Express 5 compatibility:** Some middleware (e.g., express-mongo-sanitize) broke due to read-only req.query. Solution: Downgraded to Express 4.
- **Seeder errors:** Fixed by ensuring all references use valid ObjectIds and all required fields are present.
- **Authentication bugs:** Ensured password field is selected and hashed, JWT/cookie logic is correct.
- **File upload:** Handled directory creation and file type/size validation.
- **Advanced query:** Refactored for correct MongoDB operator parsing and chaining.

---

## API Endpoints (Summary Table)

| Method | Endpoint                               | Description                   |
| ------ | -------------------------------------- | ----------------------------- |
| GET    | /api/v1/bootcamps                      | List all bootcamps            |
| POST   | /api/v1/bootcamps                      | Create new bootcamp (auth)    |
| GET    | /api/v1/bootcamps/:id                  | Get single bootcamp           |
| PUT    | /api/v1/bootcamps/:id                  | Update bootcamp (auth)        |
| DELETE | /api/v1/bootcamps/:id                  | Delete bootcamp (auth)        |
| GET    | /api/v1/bootcamps/:id/courses          | List courses for bootcamp     |
| POST   | /api/v1/bootcamps/:id/courses          | Add course to bootcamp (auth) |
| GET    | /api/v1/courses                        | List all courses              |
| GET    | /api/v1/courses/:id                    | Get single course             |
| PUT    | /api/v1/courses/:id                    | Update course (auth)          |
| DELETE | /api/v1/courses/:id                    | Delete course (auth)          |
| GET    | /api/v1/bootcamps/:id/reviews          | List reviews for bootcamp     |
| POST   | /api/v1/bootcamps/:id/reviews          | Add review to bootcamp (auth) |
| GET    | /api/v1/reviews                        | List all reviews              |
| GET    | /api/v1/reviews/:id                    | Get single review             |
| PUT    | /api/v1/reviews/:id                    | Update review (auth)          |
| DELETE | /api/v1/reviews/:id                    | Delete review (auth)          |
| POST   | /api/v1/auth/register                  | Register user                 |
| POST   | /api/v1/auth/login                     | Login user                    |
| GET    | /api/v1/auth/me                        | Get current user (auth)       |
| POST   | /api/v1/auth/forgotpassword            | Forgot password               |
| PUT    | /api/v1/auth/resetpassword/:resettoken | Reset password                |
| GET    | /api/v1/users                          | List all users (admin)        |
| POST   | /api/v1/users                          | Create user (admin)           |
| GET    | /api/v1/users/:id                      | Get single user (admin)       |
| PUT    | /api/v1/users/:id                      | Update user (admin)           |
| DELETE | /api/v1/users/:id                      | Delete user (admin)           |
-----------------------------------------------------------------------------------


