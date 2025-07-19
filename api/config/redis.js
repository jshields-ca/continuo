const Redis = require('redis');

const client = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Redis Client Error', err);
  }
});

module.exports = client; 