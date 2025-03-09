import mysql from 'mysql2/promise';
import config from '../config/db.json';
import Decimal from 'decimal.js';
import { logger } from './logger';

const dbConfig = {
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,
  //port: config.port,
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

export async function getMusic(song_id: string) {
  try {
    const sql = 'SELECT * FROM musics WHERE song_id = ?';
    const [result]: any = await pool.execute(sql, [song_id]);
    return result[0];
  } catch (error) {
    logger.log({ level: 'error', message: `Récupération de la musique : ${(error as any).message}` });
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

export async function createUser(email: string, password: string, uuid: string) {
  try {
    const date = new Date().toISOString();
    const sql = 'INSERT INTO users (email, password, date, code) VALUES (?, ?, ?, ?)';
    await pool.execute(sql, [email, password, date, uuid]);
    logger.log({ level: 'info', message: `L'adresse ${email} vient d'être enregistrée` });
    return true;
  } catch (error) {
    logger.log({ level: 'error', message: `Erreur lors de la création de la musique : ${(error as any).message}` });
    return false;
  }
}

export async function changeToVerif(email: string) {
  try {
    const updateSQL = `UPDATE users SET verif = ? WHERE email = ?`;
    const [result]: any = await pool.execute(updateSQL, ["Y", email]);

    if (result && result.affectedRows > 0) {
      logger.log({ level: 'info', message: `Mot de passe modifié avec succès pour l'utilisateur avec l'adresse email : ${email}` });
    } else {
      logger.log({ level: 'info', message: `Aucun utilisateur trouvé avec l'adresse email : ${email}` });
    }
    return true;
  } catch (error) {
    logger.log({ level: 'error', message: `Erreur lors du changement de mot de passe : ${(error as any).message}` });
    return false;
  }
}

export async function getUserByCode(code: string) {
  try {
    const sql = 'SELECT * FROM users WHERE code = ?';
    const [result]: any = await pool.execute(sql, [code]);
    return result[0].email;
  } catch (error) {
    logger.log({ level: 'error', message: `Récupération de l'utilisateur : ${(error as any).message}` });
    return false;
  }
}

export async function add_listen_history(email: string, song_id: string, token: string) {
  try {
    const date = new Date().toISOString();
    const sql = 'INSERT INTO listen_history (email, music_id, token, date) VALUES (?, ?, ?, ?)';
    await pool.execute(sql, [email, song_id, token, date]);
    logger.log({ level: 'info', message: `L'adresse ${email} vient d'être enregistrée` });
    return true;
  } catch (error) {
    logger.log({ level: 'error', message: `Erreur lors de la création de la musique : ${(error as any).message}` });
    return false;
  }
}

export async function add_cookie(email: string, uuid: string) {
  try {
    const date = new Date().toISOString();
    const sql = 'INSERT INTO users_token (email, cookie, date) VALUES (?, ?, ?)';
    await pool.execute(sql, [email, uuid, date]);
    logger.log({ level: 'info', message: `L'adresse ${email} vient d'être enregistrée` });
    return true;
  } catch (error) {
    logger.log({ level: 'error', message: `Erreur lors de la création de la musique : ${(error as any).message}` });
    return false;
  }
}

export async function get_cookie(uuid: string) {
  try {
    const sql = 'SELECT * FROM users_token WHERE cookie = ?';
    const [result]: any = await pool.execute(sql, [uuid]);
    return result[0].email;
  } catch (error) {
    logger.log({ level: 'error', message: `Récupération de l'utilisateur : ${(error as any).message}` });
    return false;
  }
}

export async function checkPassword(email: string, password: string) {
  try {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const [rows]: any = await pool.execute(sql, [email]);
    if (rows && rows.length) {
      console.log(rows[0].password);
      console.log(password);
      if (rows[0].password == password && rows[0].verif == "Y") {
        return true;
      } else {
        return false;
      }
    }
  } catch (error) {
    logger.log({ level: 'error', message: `Erreur lors de la vérification du mot de passe : ${(error as any).message}` });
    return false;
  }
}

export async function getUserInfoByCookie(cookie: string) {
  try {
    const sql = 'SELECT * FROM users_token WHERE cookie = ?';
    const [result]: any = await pool.execute(sql, [cookie]);
    return result[0].email;
  } catch (error) {
    return false;
  }
}

export async function getLastFiveListenedSongs(email: string) {
  console.log(`email: ${email}`);
  try {
    const sql = `
      SELECT DISTINCT m.song_id, m.title, m.auteur, m.album, m.genre, m.dure, m.date, m.BPM, m.cover
      FROM listen_history lh
      JOIN musics m ON lh.music_id = m.song_id
      WHERE email = ?
      ORDER BY lh.id DESC
      LIMIT 5
    `;
    const [result]: any = await pool.execute(sql, [email]);

    const songIds = result.map((song: any) => song.song_id);
    if (result.length < 5) {
      const remainingCount = 5 - result.length;
      let randomSongsSql;
      let randomSongsParams;

      if (songIds.length > 0) {
        randomSongsSql = `
          SELECT song_id, title, auteur, album, genre, dure, date, BPM, cover
          FROM musics
          WHERE song_id NOT IN (${songIds.map(() => '?').join(',')})
          ORDER BY RAND()
          LIMIT ?
        `;
        randomSongsParams = [...songIds, remainingCount];
      } else {
        randomSongsSql = `
          SELECT song_id, title, auteur, album, genre, dure, date, BPM, cover
          FROM musics
          ORDER BY RAND()
          LIMIT ?
        `;
        randomSongsParams = [remainingCount];
      }

      const [randomSongs]: any = await pool.execute(randomSongsSql, randomSongsParams);
      result.push(...randomSongs);
    }

    return result;
  } catch (error) {
    logger.log({ level: 'error', message: `Erreur lors de la récupération des dernières musiques écoutées : ${(error as any).message}` });
    return false;
  }
}

export async function getHistoryByToken(token: string) {
  try {
    const sql = 'SELECT * FROM listen_history WHERE token = ? LIMIT 1';
    const [result]: any = await pool.execute(sql, [token]);
    return result[0];
  } catch (error) {
    logger.log({ level: 'error', message: `Récupération de l'historique : ${(error as any).message}` });
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

export async function getTopRecentSongs(limit: number = 30) {
  try {
    const sql = `
      SELECT song_id, title, auteur, album, genre, dure, date, BPM, cover, rank
      FROM musics
      ORDER BY date DESC, rank DESC
      LIMIT ?
    `;
    const [result]: any = await pool.execute(sql, [limit]);

    const filteredResult = [];
    const artistCount: { [key: string]: number } = {};
    let lastArtist = '';

    for (const song of result) {
      if (artistCount[song.auteur] >= 3) continue;
      if (song.auteur === lastArtist) continue;

      filteredResult.push(song);
      artistCount[song.auteur] = (artistCount[song.auteur] || 0) + 1;
      lastArtist = song.auteur;

      if (filteredResult.length >= limit) break;
    }

    if (filteredResult.length < limit) {
      const remainingCount = limit - filteredResult.length;
      const songIds = filteredResult.map((song: any) => song.song_id);

      let randomSongsSql;
      let randomSongsParams;

      if (songIds.length > 0) {
        randomSongsSql = `
          SELECT song_id, title, auteur, album, genre, dure, date, BPM, cover, rank
          FROM musics
          WHERE song_id NOT IN (${songIds.map(() => '?').join(',')})
          ORDER BY RAND()
          LIMIT ?
        `;
        randomSongsParams = [...songIds, remainingCount];
      } else {
        randomSongsSql = `
          SELECT song_id, title, auteur, album, genre, dure, date, BPM, cover, rank
          FROM musics
          ORDER BY RAND()
          LIMIT ?
        `;
        randomSongsParams = [remainingCount];
      }

      const [randomSongs]: any = await pool.execute(randomSongsSql, randomSongsParams);
      filteredResult.push(...randomSongs);
    }

    return filteredResult;
  } catch (error) {
    logger.log({ level: 'error', message: `Erreur lors de la récupération des musiques récentes et les mieux classées : ${(error as any).message}` });
    return false;
  }
}

export async function getFlowTrain(limit: number = 30) {
  try {
    const sql = `
      SELECT song_id, title, auteur, album, genre, dure, date, BPM, cover, rank
      FROM musics
      WHERE BPM >= ?
      ORDER BY BPM DESC
      LIMIT ?
    `;
    const [result]: any = await pool.execute(sql, [160, limit]);
    return result;
  } catch (error) {
    logger.log({ level: 'error', message: `Erreur lors de la récupération des musiques par BPM : ${(error as any).message}` });
    return false;
  }
}

export async function getSongsByBPMRange(minBPM: number = 100, maxBPM: number = 130, limit: number = 30) {
  try {
    const sql = `
      SELECT song_id, title, auteur, album, genre, dure, date, BPM, cover, rank
      FROM musics
      WHERE BPM BETWEEN ? AND ?
      ORDER BY BPM DESC
      LIMIT ?
    `;
    const [result]: any = await pool.execute(sql, [minBPM, maxBPM, limit]);
    return result;
  } catch (error) {
    logger.log({ level: 'error', message: `Erreur lors de la récupération des musiques par BPM : ${(error as any).message}` });
    return false;
  }
}
