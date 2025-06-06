
import { Express } from 'express'
export const ALLOWED_AUDIO_TYPE = ["audio/mpeg", "audio/wav", "audio/mp4"];

export interface UploadedFile extends Express.Multer.File {
    key: string;
    originalname: string;
    mimetype: string;
    size: number;
    location: string;
}


// export enum UPLOAD_TYPES {
//     IMAGE,
//     VIDEO,
//     FILE,
//     // AUDIO,
//     IMAGE_AUDIO_VIDEO,
//     DOCUMENT
// }
export enum UPLOAD_TYPES {
    IMAGE = 'image',
    VIDEO = 'video',
    FILE = 'file',
    IMAGE_AUDIO_VIDEO = 'image_audio_video',
    DOCUMENT = 'document'
}


export const ALLOWED_IMAGE_TYPE = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/gif"
];

export const ALLOWED_VIDEO_TYPE = ["video/mp4"];

// export const ALLOWED_FILE_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
export const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/vnd.adobe.photoshop',
    'application/postscript',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];
