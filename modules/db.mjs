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

export async function createUser(email, password, uuid) {
  const connection = await pool.getConnection();
  try {
    const date = new Date().toISOString();
    const sql = 'INSERT INTO users (email, password, date, code) VALUES (?, ?, ?, ?)';
    await connection.execute(sql, [email, password, date, uuid]);
    logger.log({ level: 'info', message: `L'adresse ${email} vient d'être enregistrée` });
    return true;
  } catch (error) {
    logger.log({ level: 'error', message: `Erreur lors de la création de la musique : ${error.message}` });
    return false;
  } finally {
    connection.release();
  }
}

export async function changeToVerif(email) {
  const connection = await pool.getConnection();
  try {
    const updateSQL = `UPDATE users SET verif = ? WHERE email = ?`;
    const [result] = await connection.execute(updateSQL, ["Y", email]);

    if (result.affectedRows > 0) {
      logger.log({ level: 'info', message: `Mot de passe modifié avec succès pour l'utilisateur avec l'adresse email : ${email}` });
    } else {
      logger.log({ level: 'info', message: `Aucun utilisateur trouvé avec l'adresse email : ${email}` });
    }
    return true;
  } catch (error) {
    logger.log({ level: 'error', message: `Erreur lors du changement de mot de passe : ${error.message}` });
    return false;
  } finally {
    connection.release();
  }
}

export async function getUserByCode(code) {
  const connection = await pool.getConnection();
  try {
    const sql = 'SELECT * FROM users WHERE code = ?';
    const [result] = await connection.execute(sql, [code]);
    return result[0].email;
  } catch (error) {
    logger.log({ level: 'error', message: `Récupération de l'utilisateur : ${error.message}` });
    return false;
  } finally {
    connection.release();
  }
}

export async function add_listen_history(email, song_id) {
  const connection = await pool.getConnection();
  try {
    const date = new Date().toISOString();
    const sql = 'INSERT INTO listen_history (email, music_id, date) VALUES (?, ?, ?)';
    await connection.execute(sql, [email, song_id, date]);
    logger.log({ level: 'info', message: `L'adresse ${email} vient d'être enregistrée` });
    return true;
  } catch (error) {
    logger.log({ level: 'error', message: `Erreur lors de la création de la musique : ${error.message}` });
    return false;
  } finally {
    connection.release();
  }
}

export async function add_cookie(email, uuid) {
  const connection = await pool.getConnection();
  try {
    const date = new Date().toISOString();
    const sql = 'INSERT INTO users_token (email, cookie, date) VALUES (?, ?, ?)';
    await connection.execute(sql, [email, uuid, date]);
    logger.log({ level: 'info', message: `L'adresse ${email} vient d'être enregistrée` });
    return true;
  } catch (error) {
    logger.log({ level: 'error', message: `Erreur lors de la création de la musique : ${error.message}` });
    return false;
  } finally {
    connection.release();
  }
}

export async function get_cookie(uuid) {
  const connection = await pool.getConnection();
  try {
    const sql = 'SELECT * FROM users_token WHERE cookie = ?';
    const [result] = await connection.execute(sql, [uuid]);
    return result[0].email;
  } catch (error) {
    logger.log({ level: 'error', message: `Récupération de l'utilisateur : ${error.message}` });
    return false;
  }
}

export async function checkPassword(email, password) {
  const connection = await pool.getConnection();
  try {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await connection.execute(sql, [email]);
    if (rows.length) {
      if (rows[0].password == password) {
        return true;
      } else {
        return false;
      }
    }
  } catch (error) {
    logger.log({ level: 'error', message: `Erreur lors de la vérification du mot de passe : ${error.message}` });
    return false;
  } finally {
    connection.release();
  }
}
