# Student Fee Management System

A full-stack web application for managing student fee records, fee structures, payments, receipts, and student portals. It supports two user roles:

- Admin: manage students, fee structures, student fees, payments, and receipts
- Student: view their fee summary, payment history, and receipts

## Tech Stack

- Frontend: React + Vite + Bootstrap
- Backend: Node.js + Express
- Database: MongoDB with Mongoose
- Authentication: JWT + bcrypt
- PDF generation: PDFKit

## Features

- Student registration and login
- Admin dashboard with overview metrics
- Manage student records
- Manage fee structures
- Assign fee records to students
- Track paid, due, and pending amounts
- Record payments and prevent overpayment
- Automatic receipt generation
- Download receipts as PDF
- Student-specific portal with fee and payment information
- Role-based access control

## Project Structure

```text
student-fee-management/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env.example (create locally if needed)
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── README.md
└── .gitignore
```

## Prerequisites

Before running the app, make sure you have:

- Node.js (v18+ recommended)
- npm
- MongoDB running locally or a MongoDB Atlas connection string

## Backend Setup

1. Open a terminal in the backend folder:

```bash
cd backend
npm install
```

2. Create a `.env` file in the `backend` folder with the following:

```env
PORT=7000
MONGO_URI=mongodb://localhost:27017/student-fee-management
JWT_SECRET=your_super_secret_key_here
```

3. Start the backend server:

```bash
npm run dev
```

The backend API will run on:

- http://localhost:7000

## Frontend Setup

1. Open a terminal in the frontend folder:

```bash
cd frontend
npm install
```

2. Create a `.env` file in the `frontend` folder with:

```env
VITE_API_URL=http://localhost:7000/api
```

3. Start the frontend development server:

```bash
npm run dev
```

The frontend app will usually run on:

- http://localhost:5173

## Run Both Together

Open two terminals:

- Terminal 1: backend

  ```bash
  cd backend
  npm run dev
  ```

- Terminal 2: frontend
  ```bash
  cd frontend
  npm run dev
  ```

## Create an Admin User

The app includes a registration endpoint for creating accounts. To create an admin account, send a `POST` request to:

```http
POST /api/auth/register
```

Example body:

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}
```

Then log in at:

```http
POST /api/auth/login
```

Example body:

```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

## Application Flow

### Admin Role

Admins can:

- view the dashboard overview
- add and edit students
- add and manage fee structures
- assign fee records to students
- track fee collections and payment status
- create payments and download receipts

### Student Role

Students can:

- log in with their own account
- view their due fees
- review payment history
- access receipts generated for their payments

## API Overview

The backend exposes these main routes:

- `/api/auth` - login, register, user management
- `/api/students` - student management
- `/api/fees` - fee structure operations
- `/api/student-fees` - student fee records
- `/api/payments` - payment handling
- `/api/receipts` - receipt retrieval and PDF generation
- `/api/student-portal` - student-only fee/payment views
- `/api/dashboard` - dashboard metrics and summaries

## Notes

- The backend uses JWT tokens for authentication.
- Protected routes require a valid `Authorization: Bearer <token>` header.
- The frontend stores the token in localStorage and includes it in API requests through an Axios interceptor.
- Payment creation automatically updates the related student fee balance and creates a receipt record.

## Useful Commands

### Backend

```bash
npm install
npm run dev
npm start
```

### Frontend

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Troubleshooting

### MongoDB connection issues

- Verify MongoDB is running
- Check that the `MONGO_URI` is correct
- Confirm the database name and connection credentials are valid

### Login not working

- Ensure the backend is running
- Confirm `JWT_SECRET` exists in the backend `.env`
- Make sure the frontend `VITE_API_URL` points to the backend API

### Frontend not loading data

- Check browser devtools for API errors
- Verify the backend is listening on the expected port
- Ensure the token is being sent with requests after login

## License

This project is for educational and project use. Add your preferred license if needed.

## Author

Ayush Chaudhari
