import nodemailer from 'nodemailer';
import config from '../config/smtp.json';
import general from '../config/general.json';
import path from 'path';
import fs from 'fs';

const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: false,
    auth: {
        user: config.user,
        pass: config.password
    }
});

export default async function sendMail(to: string, subject: string, text: string) {
    const logoPath = path.join(__dirname, '../assets/logo.png');
    const logoCid = 'logo@myecoria';

    const mailOptions = {
        from: config.from,
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
                    Your ${general.name} Team
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
            console.error('Erreur lors de l\'envoi de l\'e-mail:', error);
        } else {
            console.log('E-mail envoyé avec succès:', info.response);
        }
    });
}
