# 📚 Book Review API

## 📖 Description

A RESTful API built with Node.js and Express for managing books and user reviews. The API supports user authentication via JWT, book creation and retrieval, review submission, and book search functionality. It is designed with clean code practices, modular structure, and comprehensive documentation using Swagger.

This project fulfills the requirements of the **Mini Assignment: Book Review API**, demonstrating backend fundamentals, secure authentication, and efficient API design.

## 🚀 Features

- 🔐 **Authentication & Authorization**

  - JWT-based user authentication
  - Secure user registration and login
  - Password hashing with bcrypt
  - Protected endpoints for authenticated users only

- 📚 **Book Management**

  - Create new books (authenticated users)
  - Retrieve all books with pagination and optional filters (author, genre)
  - Get detailed book information, including average rating and paginated reviews
  - Search books by title or author (partial, case-insensitive)

- ⭐ **Review Management**

  - Submit reviews for books (authenticated users, one review per user per book)
  - Update or delete your own reviews
  - Reviews include rating (1-5) and optional comments

- 📜 **API Documentation**
  - Interactive Swagger UI for testing endpoints
  - Clear documentation of request/response schemas

## 🧰 Tech Stack

| Layer        | Technology                                  |
| ------------ | ------------------------------------------- |
| Backend      | Node.js + Express                           |
| Database     | MongoDB (Mongoose)                          |
| Auth         | JWT (jsonwebtoken)                          |
| Docs         | Swagger (swagger-jsdoc, swagger-ui-express) |
| Validation   | Joi                                         |
| Localization | i18next                                     |

## ⚙️ Prerequisites

- [Node.js v18+](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/) (local or cloud instance, e.g., MongoDB Atlas)
- [Git](https://git-scm.com/)

## 🛠️ Project Setup

### 1. Clone the Repository

````bash
git clone https://github.com/sojitrakartik02/Book-Review-APIs
cd Book-Review-APIs

### 2. Install Dependencies

```bash
npm install
# OR if you prefer yarn:
    # yarn install

````

### 3. Start the project

```bash
npm run dev
```

### 4. Folder structure

```bash
Book-Review-APIs/
├── dist/
├── node_modules/
├── nodemon.json
├── package.json
├── package-lock.json
├── README.md
├── src/
│   ├── app.ts
│   ├── config/
│   ├── database/
│   ├── interfaces/
│   ├── middlewares/
│   ├── locaes/
│   ├───Modules
│   │   ├───Auth
│   │   │   ├───controllers
│   │   │   ├───validation
│   │   │   ├───interface
│   │   │   ├───models
│   │   │   ├───routes
│   │   │   └───Services
│   │   ├───Book
│   │   │   ├───interfaces
│   │   │   ├───routes
│   │   │   ├───controllers
│   │   │   ├───services
│   │   │   └───models
│   │   ├───Review
│   │   │   ├───controllers
│   │   │   ├───interfaces
│   │   │   ├───models
│   │   │   ├───routes
│   │   │   └───services
│   └───utils
│       ├───exceptions/
│       ├───helpers/
│       ├───mail/
│       │   └───templates/
│       └───types/
├── swagger.yaml
├── tsconfig.json
```

### 5.Environment Variables

- `PORT=3000` - The port on which the application will run.
- `NODE_ENV="development"` - The environment mode (e.g., development, production).
- `DB_URL=your-mongo-key` - MongoDB connection string.
- `LOG_FORMAT` -dev
- `LOG_DIR` - your logs direc.
- `RESET_WINDOW_MINUTE`- 5m
- `SECRET_KEY=your-secret-key` - Secret key for secure operations.
- `GMAIL_USER=your-gmail` - Gmail username for email services.
- `OTP_EXPIRY_TIME_MIN` -5m
- `FORGOT_PASSWORD_TOKEN_EXPIRY` -15m
- `GMAIL_PASSWORD=your-gmail-app-password` - Gmail password or app-specific password for email services.
- `EMAIL_SERVICE=your-email-service` - Email service provider.
- `OTP_LENGTH=6` - Length of the OTP (One-Time Password).
- `OTP_EXPIRY_TIME_MIN=5` - OTP expiry time in minutes.
- `TOKEN_EXPIRY=24` - Token expiry time in hours.

## Setup Instructions

1. Create a `.env` file in the root directory of the project.
2. Copy the environment variables listed above into the `.env` file.
3. Replace placeholder values (e.g., `your-access-key`, `your-secret-key`) with actual credentials.
4. Ensure all sensitive information (e.g., passwords, keys) is securely managed and not hardcoded.

## License

This project is licensed under the MIT License. See the [MIT](https://choosealicense.com/licenses/mit/) file for details.

```

```
