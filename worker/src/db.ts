import mysql from 'mysql2/promise';
import { logger } from './logger';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fucking_deezer',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
};

const pool = mysql.createPool(dbConfig);

export async function createMusic(
  song_id: string,
  title: string,
  auteur: string,
  album: string,
  genre: string,
  dure: string,
  date: string,
  song: any,
  cover: string,
  rank: number
) {
  try {
    const sql = 'INSERT INTO musics (song_id, title, auteur, album, genre, dure, date, song, cover, rank) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    await pool.execute(sql, [song_id, title, auteur, album, genre, dure, date, song, cover, rank]);
    logger.log({ level: 'info', message: `L'adresse ${title} vient d'être enregistrée` });
    return true;
  } catch (error) {
    logger.log({ level: 'error', message: `Erreur lors de la création de la musique : ${(error as any).message}` });
    return false;
  }
}

export async function existMusic(song_id: string) {
  try {
    const sql = 'SELECT COUNT(*) AS count FROM musics WHERE song_id = ?';
    const [result]: any = await pool.execute(sql, [song_id]);
    return result[0].count > 0;
  } catch (error) {
    logger.log({ level: 'error', message: `Vérification de la musique : ${(error as any).message}` });
    return false;
  }
}

export async function updateBmTofMusic(song_id: string, bmp: number) {
  try {
    const sql = 'UPDATE musics SET BPM = ? WHERE song_id = ?';
    await pool.execute(sql, [bmp, song_id]);
    return true;
  } catch (error) {
    logger.log({ level: 'error', message: `Erreur lors de la mise à jour du BMP de la musique : ${(error as any).message}` });
    return false;
  }
}
