import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import { logger } from './logger';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASSWORD || ''
    }
});

export default async function sendMail(to: string, subject: string, text: string) {
    const logoPath = path.join(__dirname, '../assets/logo.png');
    const logoCid = 'logo@myecoria';

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: to,
        subject: subject,
        html: `
            <div style="text-align: center;">
                <div style="text-align: center;">
                    <img src="cid:${logoCid}" alt="Logo" width="100%" />
                </div>
                <br/>
                <hr>
                <br>
                <div>
                    ${text}
                </div>
                <br/>
                <hr>
                <div style="text-align: center;">
                    Your ${process.env.APP_NAME || 'Epico'} Team
                </div>
            </div>
        `,
        attachments: [
            {
                filename: 'logo.png',
                path: logoPath,
                cid: logoCid
            }
        ]
    };

    transporter.sendMail(mailOptions, function(error: any, info: any) {
        if (error) {
            logger.log({ level: 'error', message: `Failed to send email to ${to}: ${error.message}` });
        } else {
            logger.log({ level: 'debug', message: `E-mail envoyé à ${to}: ${info.response}` });
        }
    });
}
