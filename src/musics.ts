import express from 'express';
import { getMusic, get_cookie, add_listen_history } from '../modules/db';
import { search_and_download } from '../modules/deezer';
import { Router } from 'express';
import * as api from 'd-fi-core';
import config from '../config/general.json';
import sqlstring from 'sqlstring';

import musicIdMiddleware from './middleware/music_id';

const router = Router();
router.use(express.json());

(async () => {
    await api.initDeezerApi(config.deezer_key);
})();

router.post('/search', async (req, res) => {
    const { name } = req.body;
    res.json(await search_and_download(api, sqlstring.escape(name)));
});

router.get('/:id', musicIdMiddleware, async (req, res) => {
    const cookie = req.headers.cookie;
    const { id } = req.params;
    const cookie_info = cookie ? await get_cookie(cookie) : null;
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

export default router;
