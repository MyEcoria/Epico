import axios from 'axios';
import fs from 'fs';
import * as api from 'd-fi-core';
import { createMusic, getMusic } from './modules/db.mjs';
import { get } from 'http';
import { add_music, download_album, search_and_download } from './modules/deezer.mjs';
import config from './config/general.json' with { type: "json" };
import sendMail from './modules/mail.mjs';

// await api.initDeezerApi(config.deezer_key);

// try {
//   const user = await api.getUser();
//   console.log('Logged in as ' + user.BLOG_NAME);
// } catch (err) {
//   console.error(err.message);
// }

// // const search = await search_and_download(api, "Je suis pas dupe");
// // console.log(search.TRACK);

// // const album = await api.getAlbumTracks(700890591);
// // console.log(album);

// download_album(api, 700890591);

sendMail('pierric.buchez@epitech.eu', 'Test', 'Test');