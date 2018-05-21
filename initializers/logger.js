const winston = require('winston');
const errorHandler = require('errorhandler');

winston.emitErrs = true;

const logger = new (winston.Logger)({
  exitOnError: false,
});

const logLevel = 'info';

logger.addConsole = (silent) => {
  logger.add(winston.transports.Console, {
    level: logLevel,
    prettyPrint: true,
    handleExceptions: true,
    colorize: true,
    silent: silent || false,
    timestamp: () => new Date().toLocaleString(),
  });
  logger.info(`Adding logger for console, level = ${logLevel}`);
};

logger.init = (app) => {
  if (app.get('env') === 'development') {
    logger.addConsole();
    logger.info('Development');
    app.use(errorHandler({
      dumpExceptions: true,
      showStack: true,
    }));
  }

  if (app.get('env') === 'production') {
    logger.addConsole(true);
    logger.info('Production');
    app.use(errorHandler());
  }
};

logger.stream = {
  write: logger.info,
};

module.exports = logger;
