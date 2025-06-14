/*
** EPITECH PROJECT, 2025
** env.d.ts
** File description:
** Type definitions for environment variables used in the worker
*/
declare namespace NodeJS {
  interface ProcessEnv {
    DB_HOST: string;
    DB_PORT: string;
    DB_NAME: string;
    DB_USER: string;
    DB_PASSWORD: string;

    DEEZER_KEY: string;

    ACCESS_URL: string;
    S3_ACCESS_KEY_ID: string;
    S3_SECRET_ACCESS_KEY: string;
    S3_REGION: string;
    S3_BUCKET_NAME: string;

    REDIS_HOST: string;
    REDIS_PORT: string;

    BULL_NAME: string;

    CONCURRENCY: string;
  }
}