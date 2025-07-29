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

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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

app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/entries', entriesRoutes);

app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    title: 'Error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

app.use((_req, res) => {
  res.status(404).render('error', {
    title: '404 Not Found',
    message: 'Page not found',
    error: {}
  });
});

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