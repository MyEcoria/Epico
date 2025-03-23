import express from 'express';
import * as api from 'd-fi-core';
import config from './config/general.json';

import userRouter from './src/users';
import musicRouter from './src/musics';

(async () => {
    await api.initDeezerApi(config.deezer_key);

    try {
        const user = await api.getUser();
        console.log('Logged in as ' + user.BLOG_NAME);
    } catch (err: any) {
        console.error(err.message);
    }

    try {
        const app = express();

        app.use(express.json());

        app.get('/', (req, res) => {
            res.send('Hello World!');
        });

        app.use('/user', userRouter);
        app.use('/music', musicRouter);

        app.listen(config.port, () => {
            console.log(`Server is running at http://localhost:${config.port}`);
        });
    } catch (err: any) {
        console.error('Error starting the server:', err.message);
    }
})();
