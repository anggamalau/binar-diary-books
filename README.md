# Diary Books - Phase 1 Complete

A web-based diary application with user authentication and calendar interface.

## Phase 1 Features ✅
- **Express.js Application Structure**: Clean SSR setup with proper separation of concerns
- **EJS Templating Engine**: Configured for server-side rendering
- **SQLite Database**: Initialized with migration support
- **User Authentication**: 
  - User registration with form validation
  - Login/logout functionality  
  - JWT token-based authentication
  - Password hashing with bcrypt
  - Route protection middleware
- **Basic Routing**: Clean route structure for auth and main pages
- **Error Handling**: Basic error handling and validation throughout the app

## Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Database Migrations**:
   ```bash
   npm run migrate
   ```

3. **Start the Application**:
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

4. **Access the Application**:
   - Open your browser to `http://localhost:3000`
   - Register a new account or login with existing credentials

## Project Structure
```
diary-books/
├── app.js                 # Main application entry point
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables
├── config/
│   └── database.js        # Database connection and helpers
├── routes/
│   ├── index.js           # Main routes (home, dashboard)
│   └── auth.js            # Authentication routes
├── middleware/
│   └── auth.js            # Authentication middleware
├── models/
│   └── User.js            # User model with database operations
├── utils/
│   ├── auth.js            # Authentication utilities (hashing, JWT)
│   └── render.js          # Template rendering helpers
├── views/
│   ├── index.ejs          # Welcome/home page
│   ├── dashboard.ejs      # User dashboard
│   ├── error.ejs          # Error page template
│   └── auth/
│       ├── login.ejs      # Login page
│       └── register.ejs   # Registration page
├── public/
│   ├── css/style.css      # Application styles
│   └── js/main.js         # Client-side JavaScript
├── scripts/
│   └── migrate.js         # Database migration script
└── database/
    └── diary.db           # SQLite database (created automatically)
```

## Environment Variables
The following environment variables can be configured in `.env`:
- `PORT`: Server port (default: 3000)
- `JWT_SECRET`: Secret key for JWT tokens (change in production!)
- `DB_PATH`: Path to SQLite database file
- `NODE_ENV`: Environment mode (development/production)

## Next Steps - Phase 2
- Calendar interface implementation
- Month/year navigation
- Protected dashboard with calendar view
- Enhanced user session management

## Security Features
- Password hashing with bcrypt (12 salt rounds)
- JWT tokens with 7-day expiration
- HTTP-only cookies for token storage
- Input validation and sanitization
- SQL injection protection through parameterized queries
- CSRF protection ready
