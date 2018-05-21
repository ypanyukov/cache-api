const config = require('config');
const mongoose = require('mongoose');
const mongooseUniqueValidator = require('mongoose-unique-validator');

const random = require('../helpers/random');

const { Schema } = mongoose;

const Cache = new Schema({
  key: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },

  rnd: {
    type: String,
    default: random(),
  },

  // milliseconds
  ttl: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

Cache.set('toJSON', {
  virtuals: true,
});

Cache.post('save', function checkCountBeforeSave() {
  this.model('Cache').checkCount();
});

Cache.statics.checkCount = async function checkCount() {
  const countOfItems = await this.count();
  const maxCacheEntries = config.get('maxCacheEntries');

  if (countOfItems > maxCacheEntries) {
    const removeItems = await this.find().sort('-createdAt').limit(countOfItems - maxCacheEntries);
    await this.remove({ _id: removeItems.map(i => i._id) });
  }
};

Cache.statics.findByKey = async function findByKey(key) {
  const result = await this.findOne({ key });

  this.checkCount();

  return result;
};

Cache.virtual('ttlExceeded').get(function ttlExceeded() {
  return Date.now() - this.ttl > new Date(this.createdAt).getTime();
});

Cache.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Cache', Cache);
