const Cache = require('../models/cache');

const Logger = require('../../initializers/logger');
const random = require('../helpers/random');

module.exports = (app) => {
  app.get('/cache', async (req, res, next) => {
    try {
      const result = await Cache.find();

      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  });

  app.post('/cache', async (req, res, next) => {
    const newCacheObject = new Cache(req.body);

    try {
      await newCacheObject.save();

      res.status(200).json(newCacheObject);
    } catch (e) {
      if (e.name === 'ValidationError') e.statusCode = 400; // bad request

      next(e);
    }
  });

  app.get('/cache/:key', async (req, res, next) => {
    const { key } = req.params;

    try {
      const cacheObject = await Cache.findByKey(key);

      if (cacheObject && !cacheObject.ttlExceeded) {
        Logger.info('Cache hit');

        res.status(200).json(cacheObject);
      } else {
        Logger.info('Cache miss');

        const newCacheObject = await Cache.findOneAndUpdate({ key }, {
          key,
          ttl: cacheObject && cacheObject.ttl,
          rnd: random(),
        }, {
          upsert: true,
          new: true,
        });

        res.status(200).send(newCacheObject.rnd);
      }
    } catch (e) {
      next(e);
    }
  });

  app.put('/cache/:key', async (req, res, next) => {
    const { key } = req.params;
    const updateData = req.body;

    try {
      const cacheObject = await Cache.findByKey(key);
      if (cacheObject) {
        Object.assign(cacheObject, updateData);

        await cacheObject.validate();
        await cacheObject.save();

        res.status(200).json(cacheObject);
      } else {
        res.status(404).send(`Not found Cache item by key '${key}'`);
      }
    } catch (e) {
      if (e.name === 'ValidationError') e.statusCode = 400; // bad request

      next(e);
    }
  });

  app.delete('/cache/:key', async (req, res, next) => {
    const { key } = req.params;

    try {
      const cacheObject = await Cache.findByKey(key);
      if (cacheObject) {
        await cacheObject.remove();

        res.status(200).send('removed');
      } else {
        res.status(404).send(`Not found Cache item by key '${key}'`);
      }
    } catch (e) {
      next(e);
    }
  });
};
