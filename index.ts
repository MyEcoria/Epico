import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';

import userRouter from './src/users';
import musicRouter from './src/musics';

import { logger } from './modules/logger';

(async () => {
    try {
        const app = express();

        app.use(express.json());

        app.get('/', (req, res) => {
            res.send('Hello World!');
        });

        app.use('/user', userRouter);
        app.use('/music', musicRouter);

        app.listen(process.env.APP_PORT || '8000', () => {
            logger.log({ level: 'http', message: `Server is running on port ${process.env.APP_PORT || '8000'}` });
        });
    } catch (err: any) {
        logger.log({ level: 'error', message: `Error starting server: ${err.message}` });
        process.exit(84);
    }
})();
