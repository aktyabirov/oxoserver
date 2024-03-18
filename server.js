const express = require('express');
const jsonServer = require('json-server');
const auth = require('json-server-auth');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const JWT_SECRET_KEY = require('./node_modules/json-server-auth/dist/constants').JWT_SECRET_KEY;

const server = express();
const router = jsonServer.router('db.json');

// Apply CORS middleware to allow cross-origin requests
server.use(cors());
server.use(auth);
server.use(jsonServer.defaults());

server.get('/profile', auth, (req, res) => {
  const token = req.header('Authorization') ? req.header('Authorization').replace('Bearer ', '') : null;
  if (token) {
    try {
      const data = jwt.verify(token, JWT_SECRET_KEY);

      // Access the lowdb instance
      const user = router.db.get('users').find({ email: data.email }).value();
      
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  } else {
    res.status(401).json({ error: 'Authorization token required' });
  }
});

// Bind the router db to the server
server.db = router.db;

// Use JSON Server routes
server.use(router);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
