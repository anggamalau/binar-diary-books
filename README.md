# Diary Books - Phase 2 Complete

A web-based diary application with user authentication and interactive calendar interface.

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

## Phase 2 Features ✅
- **Interactive Calendar Dashboard**: Full calendar view showing current month with responsive grid layout
- **Month/Year Navigation**: Previous/Next navigation controls with "Today" quick access button
- **Clickable Calendar Days**: Interactive calendar days with hover effects and keyboard navigation support
- **Enhanced Authentication**: 
  - Automatic token refresh when near expiration
  - Return-to URL functionality (redirects to intended page after login)
  - Improved session management with express-session
- **Responsive Design**: Mobile-optimized calendar layout that adapts to different screen sizes
- **Visual Enhancements**: Today highlighting, smooth transitions, and professional styling with Font Awesome icons

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
│   ├── calendar.js        # Calendar utility functions
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
- `JWT_SECRET`: Secret key for JWT tokens and sessions (change in production!)
- `DB_PATH`: Path to SQLite database file
- `NODE_ENV`: Environment mode (development/production)

## Next Steps - Phase 3
- Diary entry creation and management system
- Database schema for diary entries
- Date-based entry organization
- Simple text-based content editing
- Entry viewing and basic CRUD operations

## Security Features
- Password hashing with bcrypt (12 salt rounds)
- JWT tokens with 7-day expiration and automatic refresh
- HTTP-only cookies for token storage
- Session-based return-to URL functionality
- Input validation and sanitization
- SQL injection protection through parameterized queries
- CSRF protection ready

## Calendar Features
- **Full Month View**: Complete calendar grid showing all days of the current month
- **Smart Navigation**: Previous/Next month navigation with URL-based routing
- **Today Highlighting**: Current day is visually highlighted with distinct styling
- **Responsive Grid**: Calendar adapts to mobile screens with optimized spacing
- **Interactive Days**: Clickable calendar days with hover effects and keyboard support
- **Accessibility**: Full keyboard navigation and ARIA labels for screen readers
