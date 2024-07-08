
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./route/auth');
const organisationRoutes = require('./route/organisation');

const app = express();

// Use body-parser middleware to parse JSON request bodies
app.use(bodyParser.json());

// Use routes
app.use('/auth', authRoutes);
app.use('/', organisationRoutes);

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
