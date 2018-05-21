const Logger = require('./logger');

module.exports = (app) => {
  // 404
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

  // all others
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
};
