const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');

require('./initializers/db');
const Logger = require('./initializers/logger');

// import controllers
const CacheController = require('./server/controllers/cache');
// import controllers

const PORT = 5000;

const app = express();

Logger.init(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '2mb',
}));

app.set('port', PORT);

// load controllers
CacheController(app);
// load controllers

app.use((req, res, next) => {
  res.status(404);

  if (req.accepts('json')) {
    res.send({
      error: 'Not found',
    });
    return;
  }

  res.type('txt').send('Page not found');
  next();
});

app.use((err, req, res, next) => {
  const message = err.clientText || err.message || 'Internal server error';
  const statusCode = err.statusCode || 500;
  const clientErr = {
    message,
    state: 'error',
  };

  if (statusCode === 500) Logger.error(`${message}: ${err.stack}`);
  else Logger.warn(message);

  res.status(statusCode).json(clientErr);
  next();
});

http.createServer(app).listen(PORT, () => {
  Logger.info(`Server is running on port ${PORT}`);
});
