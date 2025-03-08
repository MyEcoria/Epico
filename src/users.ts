import express from 'express';
import { createUser, getUserByCode, changeToVerif, checkPassword, add_cookie, getUserInfoByCookie } from '../modules/db';
import sendMail from '../modules/mail';
import { sha256 } from 'js-sha256';
import { v4 as uuidv4 } from 'uuid';
import { Router } from 'express';
import config from '../config/general.json';

import registerMiddleware from './middleware/register';
import loginMiddleware from './middleware/login';
import comfirmMiddleware from './middleware/confirm';

const router = Router();

router.use(express.json());

router.post('/register', registerMiddleware, async (req, res) => {
    const { email, password } = req.body;
    const hash = sha256(password);
    const uuid = uuidv4();
    const user = await createUser(email, hash, uuid);
    console.log(hash);
    console.log(password);
    if (user) {
        sendMail(email, 'Welcome', `${config.url}/user/confirm/${uuid}`);
        res.json({status: "ok", email: email});
    } else {
        res.json({status: "error", email: email, message: "User already exists"});
    }
});

router.post('/login', loginMiddleware, async (req, res) => {
    const { email, password } = req.body;
    const hash = sha256(password);
    const uuid = uuidv4();

    if (await checkPassword(email, hash)) {
        console.log("ok");
        await add_cookie(email, uuid);
        res.json({status: "ok", email: email, cookie: uuid});
    } else {
        console.log("error");
        res.json({status: "error", email: email});
    }
});

router.get('/confirm/:id', comfirmMiddleware, async (req, res) => {
    const { id } = req.params;
    
    if (id) {
        const email = await getUserByCode(id);
        if (email) {
            changeToVerif(email);
            res.json({status: "ok", email: email});
        } else {
            res.json({status: "error", email: email});
        }
    } else {
        res.json({status: "error"});
    }
});

router.get('/info', async (req, res) => {
    const cookie = Array.isArray(req.headers.token) ? req.headers.token[0] : req.headers.token;
    console.log(req.headers);
    if (cookie) {
        const email = await getUserInfoByCookie(cookie);
        if (email) {
            console.log(email);
            res.json({status: "ok", email: email});
        } else {
            res.json({status: "error"});
        }
    } else {
        res.json({status: "error"});
    }
});

export default router;