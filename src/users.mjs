import express from 'express';
import { createUser, getUserByCode, changeToVerif, checkPassword, add_cookie } from '../modules/db.mjs';
import sendMail from '../modules/mail.mjs';
import { sha256 } from 'js-sha256';
import { v4 as uuidv4 } from 'uuid';
import { Router } from 'express';
import config from '../config/general.json' with { type: "json" };

import registerMiddleware from './middleware/register.mjs';
import loginMiddleware from './middleware/login.mjs';
import comfirmMiddleware from './middleware/confirm.mjs';

const router = Router();

router.use(express.json());

router.post('/register', registerMiddleware, async (req, res) => {
    const { email, password } = req.body;
    const hash = sha256(password);
    const uuid = uuidv4();
    const user = await createUser(email, hash, uuid);
    if (user) {
        sendMail(email, 'Welcome', `${config.url}/confirm/${uuid}`);
        res.json({status: "ok", email: email});
    } else {
        res.json({status: "error", email: email});
    }
});

router.post('/login', loginMiddleware, async (req, res) => {
    const { email, password } = req.body;
    const hash = sha256(password);
    const uuid = uuidv4();

    if (checkPassword(email, hash)) {
        add_cookie(email, uuid);
        res.json({status: "ok", email: email, cookie: uuid});
    } else {
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
        res.json({status: "error", email: email});
    }
});

export default router;