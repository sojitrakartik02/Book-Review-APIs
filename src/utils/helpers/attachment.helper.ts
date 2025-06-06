// import { AttachmentType } from "Modules/Attachment/interfaces/attcahment.interface";

// // src/utils/helpers/attachment.helper.ts
// export const VALID_MIME_TYPES = {
//     [AttachmentType.PROFILE_IMAGE]: ['image/jpeg', 'image/png'],
//     [AttachmentType.CERTIFICATE]: ['application/pdf', 'image/jpeg', 'image/png'],
//     [AttachmentType.DOCUMENT]: [
//         'application/pdf',
//         'application/vnd.ms-excel', // .xls
//         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
//         'text/csv', // .csv
//     ],
// };

// export const MAX_FILE_SIZES = {
//     [AttachmentType.PROFILE_IMAGE]: 5 * 1024 * 1024, // 5MB
//     [AttachmentType.CERTIFICATE]: 10 * 1024 * 1024, // 10MB
//     [AttachmentType.DOCUMENT]: 50 * 1024 * 1024, // 50MB
// };

// export const getAttachmentTypeFromMimeType = (mimetype: string): AttachmentType | null => {
//     if (VALID_MIME_TYPES[AttachmentType.PROFILE_IMAGE].includes(mimetype)) {
//         return AttachmentType.PROFILE_IMAGE;
//     }
//     if (VALID_MIME_TYPES[AttachmentType.CERTIFICATE].includes(mimetype)) {
//         return AttachmentType.CERTIFICATE;
//     }
//     if (VALID_MIME_TYPES[AttachmentType.DOCUMENT].includes(mimetype)) {
//         return AttachmentType.DOCUMENT;
//     }
//     return null;
// };

import { APP_ROOT_DIR } from '../../config/index';
import { ALLOWED_AUDIO_TYPE, ALLOWED_FILE_TYPES, ALLOWED_IMAGE_TYPE, ALLOWED_VIDEO_TYPE, UPLOAD_TYPES } from '../types/atttachment/attachment.type';

export const STORAGE_PATH = APP_ROOT_DIR + '/public/storage/uploads';

export const validFileTypes = (type: UPLOAD_TYPES): string[] => {

    if (type === UPLOAD_TYPES.IMAGE) {
        return ALLOWED_IMAGE_TYPE;
    } else if (type === UPLOAD_TYPES.VIDEO) {
        return ALLOWED_VIDEO_TYPE;
    } else if (type === UPLOAD_TYPES.FILE) {
        return ALLOWED_FILE_TYPES;
        // }
        // else if (type === UPLOAD_TYPES.AUDIO) {
        //     return ALLOWED_AUDIO_TYPE;
        // } else if (type === UPLOAD_TYPES.IMAGE_AUDIO_VIDEO) {
        //     return [...ALLOWED_IMAGE_TYPE, ...ALLOWED_VIDEO_TYPE, ...ALLOWED_AUDIO_TYPE];
    } else if (type === UPLOAD_TYPES.DOCUMENT) {
        return ALLOWED_FILE_TYPES;
    }
    return [];
};


export const getUploadTypeFromMimeType = (
    mimetype: string
): UPLOAD_TYPES | null => {
    if (ALLOWED_IMAGE_TYPE.includes(mimetype)) return UPLOAD_TYPES.IMAGE;
    if (ALLOWED_VIDEO_TYPE.includes(mimetype)) return UPLOAD_TYPES.VIDEO;
    // if (ALLOWED_AUDIO_TYPE.includes(mimetype)) return UPLOAD_TYPES.AUDIO;
    if (ALLOWED_FILE_TYPES.includes(mimetype)) return UPLOAD_TYPES.DOCUMENT;
    return null;
};