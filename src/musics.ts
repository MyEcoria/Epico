import express from 'express';
import { getMusic, get_cookie, add_listen_history, getLastFiveListenedSongs, getHistoryByToken, getTopRecentSongs, getFlowTrain, getSongsByBPMRange } from '../modules/db';
import { search_and_download } from '../modules/deezer';
import { Router } from 'express';
import * as api from 'd-fi-core';
import config from '../config/general.json';
import sqlstring from 'sqlstring';
import { v4 as uuidv4 } from 'uuid';

import musicIdMiddleware from './middleware/music_id';
import { sha256 } from 'js-sha256';

const router = Router();
router.use(express.json());

(async () => {
    await api.initDeezerApi(config.deezer_key);
})();

router.post('/search', async (req, res) => {
    const { name } = req.body;
    res.json(await search_and_download(api, sqlstring.escape(name)));
});

router.get('/:id.mp3', musicIdMiddleware, async (req, res) => {
    const token = Array.isArray(req.query.token) ? req.query.token[0] : req.query.token as string;
    const { id } = req.params;
    const cookie_info = token ? await getHistoryByToken(token as string) : null;
    if (cookie_info && cookie_info.music_id === id) {
        const music = await getMusic(id);
        if (music) {
            res.setHeader('Content-Type', 'audio/mp3');
            console.log(sha256(music.song).toString());
            res.send(music.song);
        } else {
            res.status(404).send('Music not found');
        }
    } else {
        res.status(401).json({status: "error", message: "Unauthorized"});
    }
});

router.post('/auth', async (req, res) => {
    const cookie = Array.isArray(req.headers.token) ? req.headers.token[0] : req.headers.token;
    const uuid = uuidv4();
    const { song_id } = req.body;
    console.log(song_id);
    console.log(cookie);
    console.log(uuid);
    if (cookie && song_id) {
        const cookie_info = await get_cookie(cookie);
        if (cookie_info) {
            add_listen_history(cookie_info, song_id, uuid);
            res.json({status: "ok", email: cookie_info, token: uuid});
        } else {
            res.status(401).json({status: "error", message: "Unauthorized"});
        }
    } else {
        res.status(401).json({status: "error", message: "Unauthorized"});
    }
});

router.post('/latest', async (req, res) => {
    const cookie = Array.isArray(req.headers.token) ? req.headers.token[0] : req.headers.token;
    const cookie_info = cookie ? await get_cookie(cookie) : null;
    if (cookie_info) {
        const musicList = await getLastFiveListenedSongs(cookie_info);
        if (musicList && musicList.length > 0) {
            musicList.forEach((music: { song: string; song_id: any; }) => {
                music.song = `http://192.168.1.53:3000/music/${music.song_id}.mp3`;
            });
            res.json(musicList);
        } else {
            res.json({status: "error", message: "No music found"});
        }
    } else {
        res.status(401).json({status: "error", message: "Unauthorized"});
    }
});

router.post('/flow/:id', async (req, res) => {
    const { id } = req.params;
    let musicList;
    const cookie = Array.isArray(req.headers.token) ? req.headers.token[0] : req.headers.token;
    const cookie_info = cookie ? await get_cookie(cookie) : null;
    if (cookie_info) {
        if (id === 'train')
            musicList = await getFlowTrain();
        if (id === 'new')
            musicList = await getTopRecentSongs();
        if (id === 'party')
            musicList = await getSongsByBPMRange(100, 140);
        if (id === 'chill')
            musicList = await getSongsByBPMRange(60, 100);
        if (id === 'sad')
            musicList = await getSongsByBPMRange(0, 100);
        if (musicList && musicList.length > 0) {
            musicList.forEach((music: { song: string; song_id: any; }) => {
                music.song = `http://192.168.1.53:3000/music/${music.song_id}.mp3`;
            });
            res.json(musicList);
        } else {
            res.json({status: "error", message: "No music found"});
        }
    } else {
        res.status(401).json({status: "error", message: "Unauthorized"});
    }
});

export default router;
