require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const database = require('./config/database');
const { runMigrations } = require('./scripts/migrate');
const authRoutes = require('./routes/auth');
const indexRoutes = require('./routes/index');
const entriesRoutes = require('./routes/entries');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { securityHeaders, generateCsrfToken } = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Security middleware
app.use(securityHeaders);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.JWT_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// CSRF token generation
app.use(generateCsrfToken);

app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/entries', entriesRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

async function startServer() {
  try {
    await database.connect();
    // await runMigrations();
    
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();