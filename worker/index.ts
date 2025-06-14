/*
** EPITECH PROJECT, 2025
** index.ts
** File description:
** Worker entry point for processing music downloads
*/
import Queue from 'bull';
import * as dotenv from 'dotenv';
dotenv.config();

import { add_music } from './src/deezer';
import * as api from 'd-fi-core';
import { logger } from './src/logger';

const downloadQueue = new Queue(
    process.env.BULL_NAME || 'downloadQueue',
    `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}` || 'redis://localhost:6379'
);

(async () => {
    await api.initDeezerApi(process.env.DEEZER_KEY || '');

    try {
        const user = await api.getUser();
        logger.log({ level: 'verbose', message: `User connected: ${user.BLOG_NAME} (${user.LANG})` });
    } catch (err: any) {
        logger.log({ level: 'error', message: `Failed to connect user: ${err.message}` });
        process.exit(84);
    }
})();

downloadQueue.process(process.env.CONCURRENCY ? parseInt(process.env.CONCURRENCY) : 5, async (job) => {
    logger.log({ level: 'info', message: `Processing job ${job.id} with data: ${JSON.stringify(job.data)}` });

    await add_music(api, job.data.song_id)
        .then(() => {
            logger.log({ level: 'info', message: `Job ${job.id} completed successfully.` });
        })
        .catch((error) => {
            logger.log({ level: 'error', message: `Job ${job.id} failed: ${error.message}` });
        });
});
