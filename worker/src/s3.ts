/*
** EPITECH PROJECT, 2025
** s3.ts
** File description:
** Module for managing S3 bucket operations
*/
const { S3Client, PutObjectCommand, CreateBucketCommand, GetObjectCommand, HeadBucketCommand } = require("@aws-sdk/client-s3");
import { logger } from './logger';

const client = new S3Client({
  region: process.env.S3_REGION || "eu-west-3",
  endpoint: process.env.ACCESS_URL || "https://exemple.com",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "your-access-key-id",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "your-secret",
  },
  forcePathStyle: true,
});

const bucketName = process.env.S3_BUCKET_NAME || "your-bucket-name";

const run = async () => {
    try {
        await client.send(new HeadBucketCommand({ Bucket: bucketName }));
        logger.log({ level: 'info', message: `Le bucket ${bucketName} existe déjà.` });
    } catch (err: any) {
        if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
            try {
                const data = await client.send(new CreateBucketCommand({ Bucket: bucketName }));
                logger.log({ level: 'info', message: `Le bucket ${bucketName} vient d'être créé.` });
            } catch (createErr) {
                logger.log({ level: 'error', message: `Erreur lors de la création du bucket : ${createErr}` });
                process.exit(84);
            }
        } else {
            logger.log({ level: 'error', message: `Erreur lors de la vérification du bucket : ${err}` });
            process.exit(84);
        }
    }
};

run();

export function uploadFile(keyName: string, fileBlob: string) {
    const uploadParams = {
        Bucket: bucketName,
        Key: keyName,
        Body: fileBlob,
    };

    return client.send(new PutObjectCommand(uploadParams))
        .then((data: import("@aws-sdk/client-s3").PutObjectCommandOutput) => {
            logger.log({ level: 'debug', message: `Fichier ${keyName} uploadé avec succès.` });
            return data;
        })
        .catch((err: any) => {
            logger.log({ level: 'error', message: `Erreur lors de l'upload du fichier ${keyName} : ${err}` });
            throw err;
        });
}

export async function downloadFile(keyName: string): Promise<Buffer> {
    const downloadParams = {
        Bucket: bucketName,
        Key: keyName,
    };

    return client.send(new GetObjectCommand(downloadParams))
        .then((data: import("@aws-sdk/client-s3").GetObjectCommandOutput) => {
            const streamToBuffer = (stream: any): Promise<Buffer> => {
                return new Promise((resolve, reject) => {
                    const chunks: Buffer[] = [];
                    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
                    stream.on("error", reject);
                    stream.on("end", () => resolve(Buffer.concat(chunks)));
                });
            };

            return streamToBuffer(data.Body).then((fileBlob) => {
                logger.log({ level: 'debug', message: `Fichier ${keyName} téléchargé avec succès.` });
                return fileBlob;
            });
        })
        .catch((err: any) => {
            logger.log({ level: 'error', message: `Erreur lors du téléchargement du fichier ${keyName} : ${err}` });
            throw err;
        });
}