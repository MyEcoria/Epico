/*
** EPITECH PROJECT, 2025
** env.d.ts
** File description:
** Type definitions for environment variables
*/
declare namespace NodeJS {
  interface ProcessEnv {
    DB_HOST: string;
    DB_PORT: string;
    DB_NAME: string;
    DB_USER: string;
    DB_PASSWORD: string;

    APP_PORT: string;
    APP_NAME: string;
    LOGO_URL: string;
    APP_URL: string;

    DEEZER_KEY: string;

    ACCESS_URL: string;
    S3_ACCESS_KEY_ID: string;
    S3_SECRET_ACCESS_KEY: string;
    S3_REGION: string;
    S3_BUCKET_NAME: string;

    EMAIL_HOST: string;
    EMAIL_PORT: string;
    EMAIL_FROM: string;
    EMAIL_USER: string;
    EMAIL_PASSWORD: string;

    REDIS_HOST: string;
    REDIS_PORT: string;

    BULL_NAME: string;
  }
}