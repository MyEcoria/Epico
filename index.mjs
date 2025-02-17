import express from 'express';
import axios from 'axios';
import fs from 'fs';
import * as api from 'd-fi-core';
import { createMusic, getMusic, createUser, getUserByCode, changeToVerif, get_cookie, add_cookie, add_listen_history, checkPassword } from './modules/db.mjs';
import { get } from 'http';
import { add_music, search_and_download } from './modules/deezer.mjs';
import config from './config/general.json' with { type: "json" };
import { sha256, sha224 } from 'js-sha256';
import sendMail from './modules/mail.mjs';
import { v4 as uuidv4 } from 'uuid';

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
    const cookie = req.headers.cookie;
    const { id } = req.params;
    const cookie_info = await get_cookie(cookie);
    if (cookie_info) {
        const music = await getMusic(id);
        if (music) {
            add_listen_history(cookie_info, id);
            res.setHeader('Content-Type', 'audio/flac');
            res.send(music.song);
        } else {
            res.status(404).send('Music not found');
        }
    } else {
        res.status(401).json({status: "error", message: "Unauthorized"});
    }
});

app.get('/confirm/:id', async (req, res) => {
    const { id } = req.params;
    
    if (id) {
        const email = await getUserByCode(id);
        if (email) {
            changeToVerif(email);
            res.json({status: "ok", email: email});
        } else {
            res.json({status: "error", email: email});
        }
    } else {
        res.json({status: "error", email: email});
    }
});

app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const hash = sha256(password);
    const uuid = uuidv4();
    const user = await createUser(email, hash, uuid);
    if (user) {
        sendMail(email, 'Welcome', `http://localhost:3000/confirm/${uuid}`);
        res.json({status: "ok", email: email});
    } else {
        res.json({status: "error", email: email});
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const hash = sha256(password);
    const uuid = uuidv4();
    if (checkPassword(email, hash)) {
        add_cookie(email, uuid);
        res.json({status: "ok", email: email, cookie: uuid});
    } else {
        res.json({status: "error", email: email});
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});