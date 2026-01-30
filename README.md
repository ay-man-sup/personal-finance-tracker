# Personal Finance Tracker - MERN Stack Application

A complete, full-stack personal finance tracker application built with MongoDB, Express.js, React.js, and Node.js.

## Features

- 🔐 **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- 💰 **Transaction Management**: Track income and expenses with categories
- 📊 **Visual Analytics**: Charts and graphs for financial insights
- 💵 **Budget Management**: Set budgets per category with alerts
- 📱 **Responsive Design**: Mobile-friendly UI with Tailwind CSS
- 🌙 **Dark Mode**: Toggle between light and dark themes
- 📥 **Data Export**: Download transactions as CSV
- 🔔 **Real-time Alerts**: Budget exceeded notifications
- 🛡️ **High Security**: Rate limiting, input validation, helmet headers

## Project Structure

```
personal-finance-tracker/
├── server/                    # Backend (Node.js/Express)
│   ├── config/               # Configuration files
│   │   └── db.js            # MongoDB connection
│   ├── controllers/          # Route controllers
│   │   ├── authController.js
│   │   ├── transactionController.js
│   │   └── budgetController.js
│   ├── middleware/           # Custom middleware
│   │   ├── auth.js          # JWT verification
│   │   ├── errorHandler.js  # Global error handler
│   │   ├── rateLimiter.js   # Rate limiting
│   │   └── validate.js      # Input validation
│   ├── models/              # Mongoose models
│   │   ├── User.js
│   │   ├── Transaction.js
│   │   └── Budget.js
│   ├── routes/              # API routes
│   │   ├── auth.js
│   │   ├── transactions.js
│   │   └── budgets.js
│   ├── utils/               # Utility functions
│   │   └── helpers.js
│   ├── validators/          # Joi validation schemas
│   │   └── schemas.js
│   ├── tests/               # Backend tests
│   │   └── auth.test.js
│   ├── server.js            # Entry point
│   ├── package.json
│   └── .env.example
│
├── client/                   # Frontend (React.js)
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Loader.jsx
│   │   │   │   └── PrivateRoute.jsx
│   │   │   ├── charts/
│   │   │   │   ├── ExpensePieChart.jsx
│   │   │   │   └── BalanceLineChart.jsx
│   │   │   ├── transactions/
│   │   │   │   ├── TransactionList.jsx
│   │   │   │   ├── TransactionForm.jsx
│   │   │   │   └── TransactionItem.jsx
│   │   │   └── budgets/
│   │   │       ├── BudgetList.jsx
│   │   │       ├── BudgetForm.jsx
│   │   │       └── BudgetAlert.jsx
│   │   ├── pages/           # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Transactions.jsx
│   │   ├── context/         # React Context
│   │   │   ├── AuthContext.jsx
│   │   │   ├── TransactionContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── services/        # API services
│   │   │   └── api.js
│   │   ├── utils/           # Utility functions
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── index.css
│   ├── tests/               # Frontend tests
│   │   └── Login.test.js
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── README.md
```

## Prerequisites

- Node.js (v18+)
- MongoDB Atlas account (free tier)
- npm or yarn

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd personal-finance-tracker
```

### 2. Backend Setup
```bash
cd server
npm install

# Create .env file from template
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```

## Environment Variables

Create a `.env` file in the `server` directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/finance-tracker
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRE=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

## Running the Application

### Development Mode

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
cd client
npm start
```

### Production Mode
```bash
cd server
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:id` - Get single transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/export/csv` - Export as CSV

### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create/Update budget
- `GET /api/budgets/:category` - Get budget by category
- `DELETE /api/budgets/:category` - Delete budget
- `GET /api/budgets/status/all` - Get budget status with alerts

## Security Features

- JWT authentication with httpOnly cookies
- Password hashing with bcrypt (10 rounds)
- Rate limiting on auth routes
- Helmet.js for secure HTTP headers
- Input validation with Joi
- XSS prevention
- CORS configuration
- MongoDB injection prevention

## Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## Technologies Used

### Backend
- Node.js & Express.js
- MongoDB & Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- Joi (validation)
- Helmet (security headers)
- express-rate-limit
- cors
- cookie-parser

### Frontend
- React.js 18
- React Router v6
- Tailwind CSS
- Recharts
- Axios
- React Toastify
- React Icons

## License

MIT License
