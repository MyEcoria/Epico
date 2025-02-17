import express from 'express';
import * as api from 'd-fi-core';
import config from './config/general.json' with { type: "json" };

import userRouter from './src/users.mjs';
import musicRouter from './src/musics.mjs';

await api.initDeezerApi(config.deezer_key);

try {
    const user = await global.hello.getUser();
    console.log('Logged in as ' + user.BLOG_NAME);
} catch (err) {
    console.error(err.message);
}

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
