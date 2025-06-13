
# 📚 Bookstore Fullstack Web Application

A full-featured eCommerce web app for an online bookstore, built with **React**, **Tailwind CSS**, **Node.js**, **Express**, and **MongoDB**. Users can browse and search books, add them to a cart, place orders, and leave reviews. Admin users can manage books and view all customer orders.

---

## 🚀 Features

### 🖥️ Frontend (React)
- Modern, responsive UI with Tailwind CSS
- Book search, category browsing, and details view
- User registration, login, and profile management
- Shopping cart and secure checkout flow
- Order history and detailed view
- Leave and view book reviews
- Admin dashboard for managing books and orders

### 🔧 Backend (Node.js + Express)
- RESTful API architecture
- MongoDB with Mongoose for data modeling
- JWT-based user authentication and role-based access
- CRUD for books, users, orders, carts, and reviews
- Integration with Google Books API to import books
- Middleware: Helmet (security), CORS, Input validation

---

## 🛠️ Tech Stack

| Layer     | Technologies |
|-----------|--------------|
| Frontend  | React, Tailwind CSS, Axios, React Router |
| Backend   | Node.js, Express.js, MongoDB, Mongoose |
| Security  | JWT, Helmet, CORS |
| Other     | dotenv, express-validator, Google Books API |

---

## 📁 Project Structure

```
├── bookstore-frontend/      # React frontend app
│   ├── src/
│   ├── public/
│   └── ...
├── bookstore-backend/       # Node.js backend API
│   ├── src/
│   ├── server.js
│   └── ...
├── Screenshots.pdf          # App screenshots (UI walkthrough)
├── Doc_Banitha Madushan.pdf # Project documentation
└── README.md                # This file
```

---

## ⚙️ Getting Started

### ✅ Prerequisites
- Node.js (v16+ recommended)
- npm
- MongoDB Atlas account (or local MongoDB)
- Google Books API key

### 🔌 Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd bookstore-backend
   ```
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of `bookstore-backend`:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   GOOGLE_BOOKS_API_KEY=your_google_books_api_key
   PORT=5000
   NODE_ENV=development
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```
   The backend API will run at `http://localhost:5000`.

### 💻 Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd bookstore-frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the frontend app:
   ```bash
   npm start
   ```
   The frontend will be available at `http://localhost:3000`.

---

## 🔐 API Overview

| Endpoint       | Description                      |
|----------------|----------------------------------|
| `/api/auth`    | User authentication & profiles   |
| `/api/books`   | Browse/search/import books       |
| `/api/cart`    | Manage user shopping cart        |
| `/api/orders`  | Place and view user orders       |
| `/api/reviews` | Submit and view book reviews     |

📎 Full backend API details are available in [`bookstore-backend/README.md`](bookstore-backend/README.md).

---

## 🧪 Scripts & Utilities

### Backend
- `npm run dev` – Start backend with nodemon
- `npm start` – Start backend in production mode
- Utility scripts: `import-books.js`, `add-user.js`, `add-cart.js`, etc.

### Frontend
- `npm start` – Start development server
- `npm run build` – Create production build
- `npm test` – Run frontend unit tests

---

## 🌍 Environment Variables

### Backend `.env` (required)
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
GOOGLE_BOOKS_API_KEY=your_google_books_api_key
PORT=5000
NODE_ENV=development
```

### Frontend
No environment variables required unless connecting to a remote API or customizing API URLs.

---

## 📷 Screenshots & Docs

- View `Screenshots.pdf` for a visual walkthrough of the app.
- View `Doc_Banitha Madushan.pdf` for full technical documentation.

---

## 👨‍💻 Developer

**Banitha Madushan Priyankara**  
Student ID: `M20001004005`

---

## 📄 License

This project is created for **educational purposes** only and is not licensed for commercial use.

---

## 🙌 Credits

- [Create React App](https://github.com/facebook/create-react-app)
- [Express.js](https://expressjs.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Google Books API](https://developers.google.com/books)
