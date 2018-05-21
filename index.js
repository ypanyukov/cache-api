const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');

// initializers
require('./initializers/db');
const Logger = require('./initializers/logger');
const ErrorHandlers = require('./initializers/error');
// initializers

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

ErrorHandlers(app);

http.createServer(app).listen(PORT, () => {
  Logger.info(`Server is running on port ${PORT}`);
});
