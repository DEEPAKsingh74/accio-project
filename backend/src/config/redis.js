const redis = require('redis');

let client = null;

const connectRedis = async () => {
  try {
    client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://default:p3Z9Cgc6N1NHoauGY0JxyijgERfLuYFx@redis-13180.c261.us-east-1-4.ec2.redns.redis-cloud.com:13180',
    });

    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    client.on('connect', () => {
      console.log('🔴 Redis Connected');
    });

    client.on('ready', () => {
      console.log('✅ Redis Ready');
    });

    client.on('end', () => {
      console.log('🔴 Redis Disconnected');
    });

    await client.connect();

    // Graceful shutdown
    process.on('SIGINT', async () => {
      if (client) {
        await client.quit();
        console.log('Redis connection closed through app termination');
      }
    });

  } catch (error) {
    console.error('Error connecting to Redis:', error);
    // Don't exit process, Redis is optional for caching
  }
};

const getRedisClient = () => {
  return client;
};

module.exports = { connectRedis, getRedisClient }; 