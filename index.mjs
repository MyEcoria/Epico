import express from 'express';
import axios from 'axios';
import fs from 'fs';
import * as api from 'd-fi-core';
import { createMusic, getMusic } from './modules/db.mjs';
import { get } from 'http';
import { add_music, search_and_download } from './modules/deezer.mjs';
import config from './config/general.json' with { type: "json" };

await api.initDeezerApi(config.deezer_key);

try {
  const user = await api.getUser();
  console.log('Logged in as ' + user.BLOG_NAME);
} catch (err) {
  console.error(err.message);
}

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/search', async (req, res) => {
    const { name } = req.body;
    res.json(await search_and_download(api, name));
});

app.get('/music/:id', async (req, res) => {
    const { id } = req.params;
    const music = await getMusic(id);
    if (music) {
        res.setHeader('Content-Type', 'audio/flac');
        res.send(music.song);
    } else {
        res.status(404).send('Music not found');
    }
});



app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});