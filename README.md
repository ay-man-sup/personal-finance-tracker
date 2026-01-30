# JALIL TECH - Personal Finance Tracker

![JALIL TECH](client/public/images/JALIL-tech-logo.jpg)

A finance tracking app I built to help manage my money better. Full stack MERN (MongoDB, Express, React, Node.js).

**Visit the deployed website link:https://personal-finance-tracker-azure-two.vercel.app/login**

if you dont want to create an account, use my test account.
Email:test2@1234.com
Password:Pass1234!


## What it does

- Track your income and expenses by category
- Set monthly budgets and get alerts when you're overspending
- Nice charts to visualize where your money goes
- Export your data to CSV
- Dark mode (because obviously)
- Works on mobile too


## Tech stuff

**Backend:** Node.js, Express, MongoDB  
**Frontend:** React, Tailwind CSS, Recharts  
**Auth:** JWT tokens, bcrypt for passwords  

Security is solid-rate limiting, helmet headers, input validation, the works.


## Getting started

You'll need Node.js (v18+) and a MongoDB database. I use MongoDB Atlas free tier.

### Backend setup
```bash
cd server
npm install
cp .env.example .env
# edit .env with your MongoDB URI and a JWT secret
```

### Frontend setup
```bash
cd client
npm install
```

### Run it
```bash
# Terminal 1 - backend
cd server && npm run dev

# Terminal 2 - frontend  
cd client && npm start
```

Backend runs on `localhost:5000`, frontend on `localhost:3000`. Make sure ports are unused and kill any processes if necessary. When using macOS make sure that airplay if off because this uses port 5000 by default.


## Environment variables

Create `server/.env`:

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=make-this-something-long-and-random
JWT_EXPIRE=7d
```

## API routes

Auth:
- POST `/api/auth/register` - sign up
- POST `/api/auth/login` - log in
- GET `/api/auth/me` - current user
- POST `/api/auth/logout` - log out

Transactions:
- GET/POST `/api/transactions` - list or create
- GET/PUT/DELETE `/api/transactions/:id` - single transaction
- GET `/api/transactions/export/csv` - download as CSV

Budgets:
- GET/POST `/api/budgets` - list or create
- GET/DELETE `/api/budgets/:category` - by category
- GET `/api/budgets/status/all` - check budget status


## Tests

```bash
cd server && npm test
cd client && npm test
```


## Docker

There's a docker-compose.yml if you prefer that:
```bash
docker-compose up
```


---

Built by Ayman Jalil. If you save even a dollar using this, keep me in your thoughts and prayers.
