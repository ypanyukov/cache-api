const mongoose = require('mongoose');

const Logger = require('./logger');

const mongoUrl = 'mongodb://localhost:27017/fashion-cloud';

mongoose.Promise = global.Promise;

mongoose.connection.on('open', () => Logger.info('Connected to mongo server!'));

mongoose.connection.on('error', (err) => {
  Logger.warn(`Could not connect to mongo server, err ${err}`);
  Logger.info(err.message.red);
});

mongoose.connect(mongoUrl);

module.exports = mongoose.connection;
