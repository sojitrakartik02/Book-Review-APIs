
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


export const APP_ROOT_DIR = process.env.NODE_ENV === "production" ? "dist" : "src";
