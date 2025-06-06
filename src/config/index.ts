
import { config } from "dotenv";
config({ path: ".env" })

export const {
    NODE_ENV, PORT, DB_URL, SECRET_KEY, LOG_DIR, LOG_FORMAT,
    RATE_LIMIT_GLOBAL,
    FRONTEND_URL,
    OTP_LENGTH,
    OTP_EXPIRY_TIME_MIN,
    TOKEN_EXPIRY,
    RESET_WINDOW_MINUTES,
    LOGIN_ATTEMPT,
    REMEMBER_ME_TOKEN_EXPIRY,
    FORGOT_PASSWORD_TOKEN_EXPIRY,
    REFRESH_TOKEN,
    REFRESH_TOKEN_EXPIRY,
    BACKEND_SERVER_URL,
    REDISH_URL
} = process.env

const {
    EMAIL_HOST,
    GMAIL_USER,
    GMAIL_PASSWORD,
    EMAIL_SERVICE,
    EMAIL_SECURE,
    EMAIL_PORT,
    GMAIL_APIKEY

} = process.env;

export const email = {
    EMAIL_HOST,
    GMAIL_USER,
    GMAIL_PASSWORD,
    EMAIL_SERVICE,
    EMAIL_PORT,
    GMAIL_APIKEY,


    EMAIL_SECURE,
};


export const aws = {
    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    S3_BASE_URL: 'https://projectsphere-media.s3.ap-south-1.amazonaws.com',
};
export const APP_ROOT_DIR = process.env.NODE_ENV === "production" ? "dist" : "src";
