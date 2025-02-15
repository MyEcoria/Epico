import mysql from 'mysql2/promise';
import config from '../config/db.json' with { type: 'json' };
import Decimal from 'decimal.js';
import { logger } from './logger.mjs';

const dbConfig = {
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,
  //port: config.port,
};

const pool = mysql.createPool(dbConfig);

export async function createMusic(song_id, title, auteur, album, genre, dure, date, song, cover) {
    const connection = await pool.getConnection();
    try {
      const sql = 'INSERT INTO musics (song_id, title, auteur, album, genre, dure, date, song, cover) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
      await connection.execute(sql, [song_id, title, auteur, album, genre, dure, date, song, cover]);
      logger.log({ level: 'info', message: `L'adresse ${title} vient d'être enregistrée` });
      return true;
    } catch (error) {
      logger.log({ level: 'error', message: `Erreur lors de la création de la musique : ${error.message}` });
      return false;
    } finally {
      connection.release();
    }
  }

export async function getMusic(song_id) {
    const connection = await pool.getConnection();
    try {
      const sql = 'SELECT * FROM musics';
      const [result] = await connection.execute(sql, [song_id]);
      return result[0];
    } catch (error) {
      logger.log({ level: 'error', message: `Récupération de la musique : ${error.message}` });
      return false;
    } finally {
      connection.release();
    }
}

export async function existMusic(song_id) {
  const connection = await pool.getConnection();
  try {
    const sql = 'SELECT COUNT(*) AS count FROM musics WHERE song_id = ?';
    const [result] = await connection.execute(sql, [song_id]);
    return result[0].count > 0;
  } catch (error) {
    logger.log({ level: 'error', message: `Vérification de la musique : ${error.message}` });
    return false;
  } finally {
    connection.release();
  }
}