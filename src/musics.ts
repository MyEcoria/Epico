/*
** EPITECH PROJECT, 2025
** musics.ts
** File description:
** Music routes for handling music-related operations
*/
import express from 'express';
import { getMusic, get_cookie, add_listen_history, getLastFiveListenedSongs, getHistoryByToken, getTopRecentSongs, getFlowTrain, getSongsByBPMRange, createModifyOrCreateLikedSong, isLikeSong, fromArtistYouFollow, yourArtist, countLikedSongs, countFollowArtists, getMusicsByAuthor, getLikedSongsByUser } from '../modules/db';
import { search_and_download, getCoverUrl } from '../modules/deezer';
import { Router } from 'express';
import * as api from 'd-fi-core';
import sqlstring from 'sqlstring';
import { v4 as uuidv4 } from 'uuid';
import { downloadFile } from '../modules/s3';

import musicIdMiddleware from './middleware/music_id';

const router = Router();
router.use(express.json());

(async () => {
    await api.initDeezerApi(process.env.DEEZER_KEY || '');
})();

router.post('/search', async (req, res) => {
    const { name } = req.body;
    const result = await search_and_download(api, sqlstring.escape(name));
    const songIds = result.TRACK.data.map((song: any) => song.SNG_ID);
    const dbMusics = await Promise.all(songIds.map(async (id: string) => await getMusic(id)));
    const downloadedSet = new Set(dbMusics.filter(Boolean).map((music: any) => music.song_id));

    const songsArray = result.TRACK.data.map((song: any) => ({
        song_id: song.SNG_ID,
        title: song.SNG_TITLE,
        auteur: song.ART_NAME,
        cover: getCoverUrl(song.ALB_PICTURE, 'medium'),
        duration: song.DURATION,
        song: `${process.env.APP_URL}/music/${song.SNG_ID}.mp3`,
        downloaded: downloadedSet.has(song.SNG_ID)
    }));

    const artistsArray = result.ARTIST.data.map((artist: any) => ({
        artist_id: artist.ART_ID,
        name: artist.ART_NAME,
        cover: getCoverUrl(artist.ART_PICTURE, 'medium')
    }));

    const albumsArray = result.ALBUM.data.map((album: any) => ({
        album_id: album.ALB_ID,
        name: album.ALB_TITLE,
        cover: getCoverUrl(album.ALB_PICTURE, 'medium')
    }));

    res.json({ songsArray, artistsArray, albumsArray });
});

router.get('/:id.mp3', musicIdMiddleware, async (req, res) => {
    const token = Array.isArray(req.query.token) ? req.query.token[0] : req.query.token as string;
    const { id } = req.params;
    const cookie_info = token ? await getHistoryByToken(token as string) : null;
    if (cookie_info && cookie_info.music_id === id) {
        const music = await getMusic(id);
        if (music) {
            res.setHeader('Content-Type', 'audio/mp3');
            res.send(await downloadFile(music.song));
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
                music.song = `${process.env.APP_URL}/music/${music.song_id}.mp3`;
            });
            res.json(musicList);
        } else {
            res.json({status: "error", message: "No music found"});
        }
    } else {
        res.status(401).json({status: "error", message: "Unauthorized"});
    }
});

router.post('/from-follow', async (req, res) => {
    const cookie = Array.isArray(req.headers.token) ? req.headers.token[0] : req.headers.token;
    const cookie_info = cookie ? await get_cookie(cookie) : null;
    if (cookie_info) {
        const musicList = await fromArtistYouFollow(cookie_info, 5);
        if (musicList && musicList.length > 0) {
            musicList.forEach((music: { song: string; song_id: any; }) => {
                music.song = `${process.env.APP_URL}/music/${music.song_id}.mp3`;
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
    let musicList: any[] = [];
    const cookie = Array.isArray(req.headers.token) ? req.headers.token[0] : req.headers.token;
    const cookie_info = cookie ? await get_cookie(cookie) : null;
    if (cookie_info) {
        if (id === 'train')
            musicList = await getFlowTrain();
        if (id === 'new')
            musicList = (await getTopRecentSongs()) || [];
        if (id === 'party')
            musicList = await getSongsByBPMRange(140, 160);
        if (id === 'chill')
            musicList = await getSongsByBPMRange(60, 100);
        if (id === 'sad')
            musicList = await getSongsByBPMRange(0, 100);
        if (musicList && musicList.length > 0) {
            musicList.forEach((music: { song: string; song_id: any; }) => {
                music.song = `${process.env.APP_URL}/music/${music.song_id}.mp3`;
            });
            res.json(musicList);
        } else {
            res.json({status: "error", message: "No music found"});
        }
    } else {
        res.status(401).json({status: "error", message: "Unauthorized"});
    }
});

router.post('/new', async (req, res) => {
    let musicList;
    const cookie = Array.isArray(req.headers.token) ? req.headers.token[0] : req.headers.token;
    const cookie_info = cookie ? await get_cookie(cookie) : null;
    if (cookie_info) {
        const result = await getTopRecentSongs(5);
        if (Array.isArray(result)) {
            musicList = result;
        }
        if (musicList && musicList.length > 0) {
            musicList.forEach((music: { song: string; song_id: any; }) => {
                music.song = `${process.env.APP_URL}/music/${music.song_id}.mp3`;
            });
            res.json(musicList);
        } else {
            res.json({status: "error", message: "No music found"});
        }
    } else {
        res.status(401).json({status: "error", message: "Unauthorized"});
    }
});

router.post('/for-you', async (req, res) => {
    let musicList;
    const cookie = Array.isArray(req.headers.token) ? req.headers.token[0] : req.headers.token;
    const cookie_info = cookie ? await get_cookie(cookie) : null;
    if (cookie_info) {
        const result = await getSongsByBPMRange(180, 600);
        if (Array.isArray(result)) {
            musicList = await Promise.all(
            result.slice(0, 5).map(async (track, index) => {
                const playlist = await getSongsByBPMRange(Math.floor(Math.random() * 0), Math.floor(Math.random() * 200));
                playlist.forEach((music: { song: string; song_id: any; }) => {
                    music.song = `${process.env.APP_URL}/music/${music.song_id}.mp3`;
                });
                return {
                    title: `Mix ${index + 1}`,
                    auteur: track.auteur,
                    cover: track.cover,
                    playlist: playlist
                };
            })
            );
        }
        if (musicList && musicList.length > 0) {
            res.json(musicList);
        } else {
            res.json({status: "error", message: "No music found"});
        }
    } else {
        res.status(401).json({status: "error", message: "Unauthorized"});
    }
});

router.post('/liked', async (req, res) => {
    const { song_id } = req.body;
    const cookie = Array.isArray(req.headers.token) ? req.headers.token[0] : req.headers.token;
    const cookie_info = cookie ? await get_cookie(cookie) : null;
    if (cookie_info && song_id) {
        const create = await createModifyOrCreateLikedSong(cookie_info, song_id);
        if (create) {
            res.json({status: "ok"});
        } else {
            res.json({status: "error", message: "Error while liking the song"});
        }
    } else {
        res.status(401).json({status: "error", message: "Unauthorized"});
    }
});

router.post('/is-liked', async (req, res) => {
    const { song_id } = req.body;
    const cookie = Array.isArray(req.headers.token) ? req.headers.token[0] : req.headers.token;
    const cookie_info = cookie ? await get_cookie(cookie) : null;
    if (cookie_info && song_id) {
        const likedSong = await isLikeSong(cookie_info, song_id);
        res.json({status: "ok", liked: (likedSong !== false && likedSong !== 0) ? "true" : "false"});
    } else {
        res.status(401).json({status: "error", message: "Unauthorized"});
    }
});

router.post('/your-artist', async (req, res) => {
    const cookie = Array.isArray(req.headers.token) ? req.headers.token[0] : req.headers.token;
    const cookie_info = cookie ? await get_cookie(cookie) : null;
    console.log(await yourArtist(cookie_info, 7));
    if (cookie_info) {
        res.json({status: "ok", artist: await yourArtist(cookie_info, 7)});
    } else {
        res.status(401).json({status: "error", message: "Unauthorized"});
    }
});

router.post('/count-liked', async (req, res) => {
    const cookie = Array.isArray(req.headers.token) ? req.headers.token[0] : req.headers.token;
    const cookie_info = cookie ? await get_cookie(cookie) : null;
    if (cookie_info) {
        res.json({status: "ok", count: await countLikedSongs(cookie_info)});
    }
    else {
        res.status(401).json({status: "error", message: "Unauthorized"});
    }
});

router.post('/count-follow', async (req, res) => {
    const cookie = Array.isArray(req.headers.token) ? req.headers.token[0] : req.headers.token;
    const cookie_info = cookie ? await get_cookie(cookie) : null;
    if (cookie_info) {
        res.json({status: "ok", count: await countFollowArtists(cookie_info)});
    }
    else {
        res.status(401).json({status: "error", message: "Unauthorized"});
    }
});

router.get('/album/:id', musicIdMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const albumData = await api.getAlbumInfo(id);
        if (!albumData) {
            res.status(404).json({ status: 'error', message: 'Album not found' });
            return;
        }
        res.json(albumData);
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Unable to fetch album' });
    }
});

router.get('/artist/:id', musicIdMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const artistData = await api.getArtistInfo(id);
        if (!artistData) {
            res.status(404).json({ status: 'error', message: 'Artist not found' });
            return;
        }
        res.json(artistData);
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Unable to fetch artist' });
    }
});

router.get('/album_track/:id', musicIdMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const tracks = await api.getAlbumTracks(id);
        if (!tracks) {
            res.status(404).json({ status: 'error', message: 'Tracks not found' });
            return;
        }
        if (tracks && Array.isArray(tracks.data)) {
            tracks.data.forEach((track: any) => {
                track.song = `${process.env.APP_URL}/music/${track.SNG_ID}.mp3`;
            });
        }
        res.json(tracks);
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Unable to fetch tracks' });
    }
});

router.get('/artist_tracks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const artistTracks = await getMusicsByAuthor(id);
        if (!artistTracks) {
            res.status(404).json({ status: 'error', message: 'Artist tracks not found' });
            return;
        }
        
        artistTracks.forEach((track: { song: string; song_id: any; }) => {
            track.song = `${process.env.APP_URL}/music/${track.song_id}.mp3`;
        });
        
        res.json(artistTracks);
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Unable to fetch artist tracks' });
    }
});

router.get('/liked', async (req, res) => {
    const cookie = Array.isArray(req.headers.token) ? req.headers.token[0] : req.headers.token;
    const cookie_info = cookie ? await get_cookie(cookie) : null;
    if (cookie_info) {
        const likedSongs = await getLikedSongsByUser(cookie_info);
        if (likedSongs && likedSongs.length > 0) {
            likedSongs.forEach((music: { song: string; song_id: any; }) => {
                music.song = `${process.env.APP_URL}/music/${music.song_id}.mp3`;
            });
            res.json(likedSongs);
        } else {
            res.json({status: "error", message: "No liked songs found"});
        }
    } else {
        res.status(401).json({status: "error", message: "Unauthorized"});
    }
});

export default router;
