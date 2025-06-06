# ⚒️ Book Review API

## 📖 Description

---

## 🚀 Features

- 🔐 **Authentication & Authorization**

  - JWT-based secure login
  - OTP-based password reset (via email)
  - Enforced password policy (complexity + expiration)
  - Account lockout after 3 failed attempts

- 🔑 **Role-Based Access Control (RBAC)**

  - Roles: Admin, Staff, Labour
  - Permissions controlled by middleware and route guards

<!-- - 👥 **User Management**

  - Unified `users` collection with role field
  - Profile fields: contact info, emergency contacts, gender, DOB, location, medical conditions

- 🧠 **Skill & Certification Tracking**

  - Assign multiple skills per labour
  - Certification tracking with issue/expiry dates
  - Upload scanned documents -->

- 📅 **Availability Management**

  - Track availability across date ranges
  - Shift types: day, night, FIFO/custom
  - Multi-site support

<!-- - 📍 **Job Assignments**

  - Assign workers to jobs with timeframes and shift info
  - Track assignment history

- ⏱️ **Time Logging & Payroll**

  - Time log tracking (check-in/check-out)
  - Payroll management (base pay, overtime, deductions)
  - Status: pending, processed, paid

- 🛡️ **Safety & Training**

  - Log safety incidents by severity
  - Track safety training sessions
  - Document trainers, expiry dates

- 📊 **Performance Reviews**

  - Attendance, safety, skill evaluations
  - Reviewer notes and scoring

- 📁 **Document Management**

  - Upload user documents (certs, IDs, medicals)
  - Track upload/expiry

- 🧾 **Audit Logging**
  - System-wide logs of critical changes (who, what, when) -->

---

## 🧰 Tech Stack

| Layer    | Tech                    |
| -------- | ----------------------- |
| Backend  | Node.js + Express       |
| Database | MongoDB (Mongoose)      |
| Auth     | JWT + OTP               |
| Docs     | Swagger (OpenAPI)       |
| Storage  | AWS S3 (for uploads)    |
| Email    | Gmail SMTP / nodemailer |

---

## ⚙️ Prerequisites

- [Node.js v18+](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Git](https://github.com/NinjatechDevOps/labour-management-node/)
<!-- - [Postman](https://www.postman.com/) (for API testing) -->

---

## 🛠️ Project Setup

### 1. Clone the Repository

````bash
git clone https://github.com/NinjatechDevOps/gard-labour-hire-node
cd gard-labour-hire-node

### 2. Install Dependencies

```bash
npm install
# OR if you prefer yarn:
    # yarn install

```

### 3. Start the project

```bash
npm run dev
```

### 4. Folder structure

```bash
gard-labour-hire-node/
├── dist/
├── node_modules/
├── jest.config.ts
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
│   ├── server.ts
│   ├───Modules
│   │   ├───Auth
│   │   │   ├───controllers
│   │   │   ├───dto
│   │   │   ├───interface
│   │   │   ├───models
│   │   │   ├───routes
│   │   │   └───Services
│   │   ├───Permission
│   │   │   ├───interfaces
│   │   │   └───models
│   │   ├───Role
│   │   │   ├───controllers
│   │   │   ├───interfaces
│   │   │   ├───models
│   │   │   ├───routes
│   │   │   └───services
│   ├───tests
│   ├───types
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
- `BASE_URL="http://localhost:3000"` - Base URL for the application.
- `FRONTEND_URL=your-frontend-url` - Frontend application URL.
- `BACKEND_SERVER_URL=your-server-url` - Backend server URL.
- `OTP_LENGTH=6` - Length of the OTP (One-Time Password).
- `OTP_EXPIRY_TIME_MIN=5` - OTP expiry time in minutes.
- `TOKEN_EXPIRY=24` - Token expiry time in hours.
- `AWS_REGION=your-region` - AWS region for S3 services.
- `AWS_ACCESS_KEY_ID=your-access-key` - AWS access key ID.
- `AWS_SECRET_ACCESS_KEY=your-secret-key` - AWS secret access key.
- `S3_BUCKET_NAME=your-bucket-name` - S3 bucket name for storage.

## Setup Instructions

1. Create a `.env` file in the root directory of the project.
2. Copy the environment variables listed above into the `.env` file.
3. Replace placeholder values (e.g., `your-access-key`, `your-secret-key`) with actual credentials.
4. Ensure all sensitive information (e.g., passwords, keys) is securely managed and not hardcoded.

## Notes

- The `FRONTEND_URL` and `BACKEND_SERVER_URL` can be adjusted based on your deployment environment.
- For production, consider using secure methods to manage secrets (e.g., AWS Secrets Manager, environment variable injection).

## License

This project is licensed under the MIT License. See the [MIT](https://choosealicense.com/licenses/mit/) file for details.
````
