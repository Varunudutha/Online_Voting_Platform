# Secure Online Voting Platform

A premium, enterprise-grade online voting application built with the MERN stack (MongoDB, Express, React, Node.js).

## 🚀 Features

- **Role-Based Access**: Distinct dashboards for Admins and Voters.
- **Secure Authentication**: JWT-based auth with bcrypt password hashing.
- **One-Vote Integrity**: Strict enforcement of one vote per user per election.
- **Real-Time Results**: Live analytics and charts.
- **Premium UI**: Modern, responsive design using Bootstrap 5 and Sass.
- **Admin Management**: Create elections, manage candidates, and oversee the process.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Bootstrap 5, Sass, Axios, React Router v6.
- **Backend**: Node.js, Express.js, Mongoose.
- **Database**: MongoDB Atlas.
- **Security**: Helmet, CORS, JWT, Bcrypt.

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas Account (Connection String)

### 1. Clone & Install Dependencies

```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### 2. Configure Environment

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_key
NODE_ENV=development
```

### 3. Seed Database (Optional)

Populate the database with initial Admin and Voter accounts:

```bash
cd server
node seed.js
```

User Credentials created by seed:
- **Admin**: `admin@example.com` / `password123`
- **Voter**: `voter@example.com` / `password123`

### 4. Run Application

You need to run both Server and Client terminals.

**Terminal 1 (Server):**
```bash
cd server
npm start
```

**Terminal 2 (Client):**
```bash
cd client
npm run dev
```

The application will be available at `http://localhost:5173`.

## 🔒 Security Measures
- **Input Validation**: Mongoose schema validation.
- **Authentication**: Bearer Token (JWT) required for protected routes.
- **Authorization**: Middleware to check User Roles.
- **Data Integrity**: Compound Unique Indexes preventing double voting.
