import Queue from 'bull';

export const downloadQueue = new Queue(
    process.env.BULL_NAME || 'downloadQueue',
    `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}` || 'redis://localhost:6379'
);