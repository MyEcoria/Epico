import axios from 'axios';
import fs from 'fs';
import config from '../config/general.json' with { type: "json" };
import { createMusic, getMusic, existMusic } from './db.mjs';


const coverSize = {
    small: '56x56',
    medium: '250x250',
    large: '500x500',
    xl: '1000x1000'
};

const getCoverUrl = (albumPicture, size = 'medium') => {
    return `https://cdn-images.dzcdn.net/images/cover/${albumPicture}/${coverSize[size]}.jpg`;
}

function isrcToTimestamp(isrcCode) {
    if (isrcCode.length !== 12) {
        throw new Error("Code ISRC invalide");
    }
    const yearPart = isrcCode.substring(5, 7);
    const year = parseInt("20" + yearPart, 10);
    const date = new Date(year, 0, 1);
    return date.getTime();
}

export async function add_music(api, song_id) {
    if (await existMusic(song_id)) {
        console.log("Music already exists");
        return;
    }
    const track = await api.getTrackInfo(song_id);
    const trackData = await api.getTrackDownloadUrl(track, 9);
    if (!trackData) {
        console.error("Failed to get track download URL for song ID: " + song_id);
        return;
    }
    console.log("Downloading " + track.SNG_TITLE);
    const {data} = await axios.get(trackData.trackUrl, {responseType: 'arraybuffer'});
    const outFile = trackData.isEncrypted ? api.decryptDownload(data, track.SNG_ID) : data;
    const trackWithMetadata = await api.addTrackTags(outFile, track, 500);
    createMusic(track.SNG_ID, track.SNG_TITLE, track.ART_NAME, track.ALB_TITLE, "", track.DURATION, isrcToTimestamp(track.ISRC), trackWithMetadata, getCoverUrl(track.ALB_PICTURE, 'medium'));
}

export async function search_and_download(api, query) {
    const search = await api.searchMusic(query);
    for (let i = 0; i < search.TRACK.data.length; i++) {
        const song_id = search.TRACK.data[i].SNG_ID;
        add_music(api, song_id);
    }
    for (let i = 0; i < search.ALBUM.data.length; i++) {
        const album_id = search.ALBUM.data[i].ALB_ID;
        download_album(api, album_id);
    }
    return search;
}

export async function download_album(api, album_id) {
    const album = await api.getAlbumTracks(album_id);
    for (let i = 0; i < album.data.length; i++) {
        const song_id = album.data[i].SNG_ID;
        add_music(api, song_id);
    }
}
