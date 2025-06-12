import express from 'express';
import { createUser, getUserByCode, changeToVerif, checkPassword, add_cookie, getUserInfoByCookie } from '../modules/db';
import sendMail from '../modules/mail';
import { sha256 } from 'js-sha256';
import { v4 as uuidv4 } from 'uuid';
import { Router } from 'express';
import { extractFirstNameFromEmail } from '../modules/utils';

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
    if (user) {
        sendMail(email, 'Welcome', `${process.env.APP_URL}/user/confirm/${uuid}`);
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
        await add_cookie(email, uuid);
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
            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Registration Complete</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            text-align: center;
                            background-color: #f4f4f4;
                            padding: 50px;
                        }
                        .container {
                            background: white;
                            padding: 20px;
                            border-radius: 10px;
                            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                            display: inline-block;
                        }
                        h1 {
                            color: #28a745;
                        }
                        p {
                            color: #333;
                        }
                        .close-btn {
                            background-color: #007bff;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 5px;
                            cursor: pointer;
                            margin-top: 10px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Registration Successful!</h1>
                        <p>Thank you for registering, ${extractFirstNameFromEmail(email)}. You can now close this page.</p>
                        <button class="close-btn" onclick="window.close()">Close</button>
                    </div>
                </body>
                </html>
            `);
        } else {
            res.json({status: "error", email: email});
        }
    } else {
        res.json({status: "error"});
    }
});

router.get('/info', async (req, res) => {
    const cookie = Array.isArray(req.headers.token) ? req.headers.token[0] : req.headers.token;

    if (cookie) {
        const email = await getUserInfoByCookie(cookie);
        if (email) {
            res.json({status: "ok", email: email});
        } else {
            res.json({status: "error"});
        }
    } else {
        res.json({status: "error"});
    }
});

export default router;