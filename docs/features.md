# EMS Backend - Employee Management System

A robust, scalable backend for Employee Management System built with Node.js, Express, MongoDB, and Redis.

## Features

-  **Authentication & Authorization** - JWT-based auth with refresh tokens
- 👥 **Employee Management** - Complete CRUD operations for employees
-  **Dashboard Analytics** - Real-time statistics and metrics
-  **File Upload** - Document management with Multer
-  **Email Notifications** - Nodemailer integration
-  **Caching** - Redis for performance optimization
-  **Logging** - Winston for comprehensive logging
-  **Security** - Helmet, CORS, rate limiting, sanitization
-  **API Documentation** - Clean and consistent response structure

## Tech Stack

- **Runtime**: Node.js (ES6 Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis
- **Authentication**: JWT
- **Validation**: Joi
- **Logging**: Winston
- **Email**: Nodemailer
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 5.0
- Redis >= 6.0
- npm >= 9.0.0

## Installation

1. Clone https/github.com/lelisa21/prodigy-fs-02.git
2. Navigate to the project directory: 
cd server
3. Install dependencies:
npm install
4. Create a .env file in the root of the server directory and add the following environment variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRES_IN=7d
REDIS_HOST=localhost
REDIS_PORT=6379
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password


```bash
git clone https://github.com/lelisa21/prodigy-fs-02.git
cd server
```
## API ENDPOINTS

### Authentication
```
POST /api/v1/auth/signup - Register new user

POST /api/v1/auth/login - Login user

POST /api/v1/auth/logout - Logout user

POST /api/v1/auth/refresh-token - Refresh access token

POST /api/v1/auth/forgot-password - Request password reset

POST /api/v1/auth/reset-password/:token - Reset password

GET /api/v1/auth/profile - Get user profile

PATCH /api/v1/auth/profile - Update user profile
```

### Employees
```
GET /api/v1/employees - Get all employees (paginated)

GET /api/v1/employees/:id - Get employee by ID

POST /api/v1/employees - Create new employee (admin)

PATCH /api/v1/employees/:id - Update employee (admin/manager)

DELETE /api/v1/employees/:id - Delete employee (admin)

GET /api/v1/employees/stats/department - Department statistics

GET /api/v1/employees/hierarchy - Organization hierarchy

POST /api/v1/employees/bulk/import - Bulk import employees
```

### Dashboard

```
GET /api/v1/dashboard/stats - Dashboard statistics

GET /api/v1/dashboard/performance - Performance metrics

GET /api/v1/dashboard/salary-distribution - Salary distribution

GET /api/v1/dashboard/recent-activity - Recent activity log

```

testing 
```bash
npm test
npm run test:watch
npm run test:coverage
```
