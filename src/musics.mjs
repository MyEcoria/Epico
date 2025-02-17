import express from 'express';
import { getMusic, get_cookie, add_listen_history } from '../modules/db.mjs';
import { search_and_download } from '../modules/deezer.mjs';
import { Router } from 'express';

const router = Router();

router.use(express.json());

router.post('/search', async (req, res) => {
    const { name } = req.body;
    res.json(await search_and_download(api, name));
});

router.get('/:id', async (req, res) => {
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

export default router;
