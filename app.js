require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const database = require('./config/database');
const { runMigrations } = require('./scripts/migrate');
const authRoutes = require('./routes/auth');
const indexRoutes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/', indexRoutes);
app.use('/auth', authRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    title: 'Error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

app.use((req, res) => {
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