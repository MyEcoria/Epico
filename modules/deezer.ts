/*
** EPITECH PROJECT, 2025
** deezer.ts
** File description:
** Deezer module for searching and downloading music
*/
import { logger } from './logger';
import { downloadQueue } from './bull';

const coverSize = {
    small: '56x56',
    medium: '250x250',
    large: '500x500',
    xl: '1000x1000'
};

export function getCoverUrl(albumPicture: any, size = 'medium') {
    return `https://cdn-images.dzcdn.net/images/cover/${albumPicture}/${(coverSize as any)[size]}.jpg`;
}

export async function search_and_download(api: any, query: any) {
    try {
        const search = await api.searchMusic(query);

        for (let i = 0; i < search.TRACK.data.length; i++) {
            const song_id = search.TRACK.data[i].SNG_ID;
            try {
                downloadQueue.add({ song_id });
            } catch (error) {
                logger.log({ level: 'error', message: `Failed to add music for song ID ${song_id}: ${(error as any).message}` });
            }
        }

        (async () => {
            for (let i = 0; i < search.ALBUM.data.length; i++) {
                const album_id = search.ALBUM.data[i].ALB_ID;
                try {
                    await download_album(api, album_id);
                } catch (error) {
                    console.error(`Failed to download album for album ID ${album_id}: ${(error as any).message}`);
                }
            }
        })();

        return search;
    } catch (error) {
        logger.log({ level: 'error', message: `Search failed for query ${query}: ${(error as any).message}` });
        throw error;
    }
}

export async function download_album(api: any, album_id: any) {
    try {
        const album = await api.getAlbumTracks(album_id);
        for (let i = 0; i < album.data.length; i++) {
            const song_id = album.data[i].SNG_ID;
            try {
                downloadQueue.add({ song_id });
            } catch (error) {
                logger.log({ level: 'error', message: `Failed to add music for song ID ${song_id}: ${(error as any).message}` });
            }
        }
    } catch (error) {
        logger.log({ level: 'error', message: `Failed to download album with album ID ${album_id}: ${(error as any).message}` });
    }
}
