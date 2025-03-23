const { S3Client, PutObjectCommand, CreateBucketCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const fs = require('fs');

// Configuration du client S3
const client = new S3Client({
  region: 'us-west-1', // Remplacez par votre région
  endpoint: 'http://localhost:8000', // Remplacez par l'URL de votre serveur S3
  credentials: {
    accessKeyId: 'accessKey1',
    secretAccessKey: 'verySecretKey1',
  },
  forcePathStyle: true, // Nécessaire pour certains serveurs S3 compatibles
});

// Paramètres de l'upload
const bucketName = 'my-bucket';

const run = async () => {
  try {
    const data = await client.send(new CreateBucketCommand({ Bucket: bucketName }));
    console.log("Bucket créé avec succès :", data);
  } catch (err) {
    console.error("Erreur lors de la création du bucket :", err);
  }
};

run();

// Uploader le fichier
export function uploadFile(keyName: string, fileBlob: string) {
    const uploadParams = {
        Bucket: bucketName,
        Key: keyName,
        Body: fileBlob,
    };

    return client.send(new PutObjectCommand(uploadParams))
        .then((data: import("@aws-sdk/client-s3").PutObjectCommandOutput) => {
            console.log("Fichier uploadé avec succès :", data);
            return data;
        })
        .catch((err: any) => {
            console.error("Erreur lors de l'upload du fichier :", err);
            throw err;
        });
}

export function downloadFile(keyName: string): Promise<Buffer> {
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
                console.log("Fichier téléchargé avec succès");
                return fileBlob;
            });
        })
        .catch((err: any) => {
            console.error("Erreur lors du téléchargement du fichier :", err);
            throw err;
        });
}