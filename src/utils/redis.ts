import { createClient } from 'redis';
import { logger } from './logger';
import { REDISH_URL } from '../config/index';

const redisClient = createClient({
    url: REDISH_URL,
});

redisClient.on('error', (err) => logger.error('Redis Client Error', err));
redisClient.on('connect', () => logger.info('Redis connected'));
redisClient.on('ready', () => logger.info('Redis ready'));

export const connectRedis = async () => {
    await redisClient.connect();
};

export default redisClient;
