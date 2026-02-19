# ⚙️ BaatCheet - Backend Server

The robust Node.js and Express backend for the **BaatCheet** real-time chat application. It handles RESTful API requests, persistent WebSocket connections, secure authentication, and database management.

## 🌟 Key Features

- **⚡ Real-Time Engine:** Powered by **Socket.io** for instant message delivery, live online/offline status, and typing indicators.
- **🔐 Secure Authentication:** \* Stateless sessions using **JSON Web Tokens (JWT)** stored in HTTP-only cookies.
  - Password hashing via `bcryptjs`.
  - **Email Verification (OTP):** Integrated with Nodemailer and **Redis** for temporary OTP storage and TTL expiration.
- **🛡️ Hardened File Uploads:** Custom **Binary Signature Validation (Magic Numbers)** to rigorously verify uploaded media types, preventing file extension spoofing and malicious uploads.
- **🔗 Rich Media Processing:** Server-side Open Graph (OG) scraping to generate rich link previews for URLs shared in the chat.
- **🤝 Connect Code System:** Generates unique, friendly 6-digit connection codes for users to easily add friends without exposing email addresses.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose ODM)
- **Caching & OTPs:** Redis
- **WebSockets:** Socket.io
- **Authentication:** JWT, bcryptjs
- **Email Service:** Nodemailer

---

## 📂 Project Structure

```text
backend/
├── controllers/    # Request handling logic (authController, messageController)
├── middleware/     # Route protection (protectRoute) and upload handlers (Multer)
├── models/         # Mongoose database schemas (User, Conversation, Message)
├── routes/         # Express API endpoint definitions
├── services/       # External service integrations (RedisService, EmailService)
├── utils/          # Helpers (OTP generator, Magic Number validator, ConnectCode)
└── server.js       # Application entry point & Socket.io initialization
```

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have the following installed and running:

- Node.js (v18+ recommended)
- MongoDB (Local instance or MongoDB Atlas URI)
- Redis (Local instance or Cloud Redis URL)

### 2. Installation

Clone the repository, navigate to the backend directory, and install dependencies:

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root of your backend directory and configure the following variables:

```env
# Server Config
PORT=5000
NODE_ENV=development

# Database & Caching
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/baatcheet
REDIS_URL=redis://localhost:6379  # Or your Upstash/Redis Cloud URL

# Security
JWT_SECRET=your_super_secret_jwt_signature_key

# Email Service (Nodemailer via Gmail App Passwords)
EMAIL_USER=your.email@gmail.com
EMAIL_APP_PASSWORD=your_16_digit_app_password
```

### 4. Run the Development Server

Start the server using Nodemon for hot-reloading:

```bash
npm run dev
```

You should see confirmation in your terminal that the Server, MongoDB, and Redis are successfully connected.

## 📡 API Overview

- `POST /api/auth/register` - Create a new account (requires OTP verification).
- `POST /api/auth/send-otp` - Dispatch verification email.
- `POST /api/auth/verify-otp` - Validate code against Redis store.
- `POST /api/auth/login` - Authenticate user and assign JWT cookie.
- `GET /api/messages/:id` - Fetch message history between current user and a friend.
- `POST /api/messages/send/:id` - Send a text or file message.
- `GET /api/users` - Fetch user's friends/conversations list.

Built with ❤️ by Biswajit Shaw.
