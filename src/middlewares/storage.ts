import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { S3Client } from '@aws-sdk/client-s3';
import { aws } from '../config/index';
import { getUploadTypeFromMimeType, validFileTypes } from '../utils/helpers/attachment.helper';
import path from 'path';
import { jsonStatus, status } from '../utils/helpers/api.responses';
import { HttpException } from '../utils/exceptions/httpException';
import { ALLOWED_AUDIO_TYPE, ALLOWED_VIDEO_TYPE, UPLOAD_TYPES } from '../utils/types/atttachment/attachment.type';
import { AttachmentType } from '../Modules/Attachment/interfaces/attcahment.interface';

const MB = 1024 * 1024;
const MAX_IMAGE_SIZE = 5 * MB;
const MAX_VIDEO_SIZE = 50 * MB;
const MAX_DOCUMENT_SIZE = 50 * MB;
const MAX_REQUEST_SIZE = 80 * MB;

const MAX_SCREENSHOTS = 6;
const MAX_VIDEOS = 4;
const MAX_CERTIFICATES = 20;
const MAX_DOCUMENTS = 20;

export const isS3Enabled = aws.AWS_ACCESS_KEY_ID && aws.AWS_SECRET_ACCESS_KEY;

export const s3 = isS3Enabled
    ? new S3Client({
        credentials: {
            accessKeyId: aws.AWS_ACCESS_KEY_ID,
            secretAccessKey: aws.AWS_SECRET_ACCESS_KEY,
        },
        region: aws.AWS_REGION,
    })
    : null;

export const s3KeyFunction = (req: any, file: Express.Multer.File, cb: (error: any, key?: string) => void) => {
    const { moduleName } = req.query;
    const allowedFolders = [AttachmentType.PROFILE_IMAGE, AttachmentType.CERTIFICATE, AttachmentType.DOCUMENT];
    const imageType = allowedFolders.includes(moduleName) ? moduleName : AttachmentType.DOCUMENT;

    let typeFolder = 'unknown';
    if (file.fieldname === 'screenshots') {
        typeFolder = 'screenshot';
    } else if (file.fieldname === 'videos') {
        typeFolder = 'video';
    } else if (file.fieldname === 'profileImage') {
        typeFolder = 'profile';
    } else if (file.fieldname === 'certificate') {
        typeFolder = 'certificate';
    } else if (file.fieldname === 'document') {
        typeFolder = 'document';
    }

    const folder = req.originalUrl.includes('LabourManagement') ? 'LabourManagement' : req.query.folder || 'LabourManagement';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);

    const filePath = `${folder}/${imageType}/${typeFolder}/${uniqueSuffix}${fileExtension}`;
    cb(null, filePath);
};

const checkFileSize = (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    const t = req.t || ((key: string, options?: any) => key);
    if (contentLength > MAX_REQUEST_SIZE) {
        throw new HttpException(
            status.BadRequest,
            t('General.request_too_large', { size: MAX_REQUEST_SIZE / MB })
        );
    }
    next();
};

const configuredMulter = () => {
    return multer({
        storage: multer.memoryStorage(),
        limits: {
            fileSize: MAX_DOCUMENT_SIZE,
            fieldSize: MAX_DOCUMENT_SIZE,
        },
        fileFilter: function (req, file, cb) {
            const t = req.t || ((key: string, options?: any) => key);
            const type = getUploadTypeFromMimeType(file.mimetype);
            const availableTypes = validFileTypes(type);
            if (!type || availableTypes.length === 0) {
                return cb(
                    new HttpException(
                        status.BadRequest,
                        t('General.invalid_file_type', { field: t('General.file') })
                    )
                );
            }
            const isScreenshot = file.fieldname === 'screenshots';
            const isVideo = file.fieldname === 'videos';
            const isProfileImage = file.fieldname === 'profileImage';
            const isCertificate = file.fieldname === 'certificate';
            const isDocument = file.fieldname === 'document';

            if (isScreenshot && type !== UPLOAD_TYPES.IMAGE) {
                return cb(
                    new HttpException(
                        status.BadRequest,
                        t('General.invalid_screenshot_type', { field: t('General.screenshot') })
                    )
                );
            }
            if (isVideo && !(ALLOWED_VIDEO_TYPE.includes(file.mimetype) || ALLOWED_AUDIO_TYPE.includes(file.mimetype))) {
                return cb(
                    new HttpException(
                        status.BadRequest,
                        t('General.invalid_video_type', { field: t('General.video') })
                    )
                );
            }
            if (isProfileImage && type !== UPLOAD_TYPES.IMAGE) {
                return cb(
                    new HttpException(
                        status.BadRequest,
                        t('General.invalid_specific_file_type', { type: t('General.profileImage') })
                    )
                );
            }
            if (isCertificate && type !== UPLOAD_TYPES.DOCUMENT && type !== UPLOAD_TYPES.IMAGE) {
                return cb(
                    new HttpException(
                        status.BadRequest,
                        t('General.invalid_specific_file_type', { type: t('General.certificate') })
                    )
                );
            }
            if (isDocument && type !== UPLOAD_TYPES.DOCUMENT && type !== UPLOAD_TYPES.IMAGE) {
                return cb(
                    new HttpException(
                        status.BadRequest,
                        t('General.invalid_specific_file_type', { type: t('General.document') })
                    )
                );
            }

            if (type === UPLOAD_TYPES.IMAGE && file.size > MAX_IMAGE_SIZE) {
                return cb(
                    new HttpException(
                        status.BadRequest,
                        t('General.file_too_large', {
                            field: t('General.image'),
                            size: MAX_IMAGE_SIZE / MB,
                        })
                    )
                );
            }
            if (type === UPLOAD_TYPES.VIDEO && file.size > MAX_VIDEO_SIZE) {
                return cb(
                    new HttpException(
                        status.BadRequest,
                        t('General.file_too_large', {
                            field: t('General.video'),
                            size: MAX_VIDEO_SIZE / MB,
                        })
                    )
                );
            }
            if (type === UPLOAD_TYPES.DOCUMENT && file.size > MAX_DOCUMENT_SIZE) {
                return cb(
                    new HttpException(
                        status.BadRequest,
                        t('General.file_too_large', {
                            field: t('General.document'),
                            size: MAX_DOCUMENT_SIZE / MB,
                        })
                    )
                );
            }

            cb(null, true);
        },
    });
};

export const UploadMultipleFiles = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const t = req.t || ((key: string, options?: any) => key);
        checkFileSize(req, res, async (err) => {
            if (err) return next(err);
            configuredMulter().fields([
                { name: 'profileImage', maxCount: 1 },
                { name: 'screenshots', maxCount: Number(MAX_SCREENSHOTS) },
                { name: 'videos', maxCount: Number(MAX_VIDEOS) },
                { name: 'certificate', maxCount: Number(MAX_CERTIFICATES) },
                { name: 'document', maxCount: Number(MAX_DOCUMENTS) },
            ])(req, res, (error: any) => {
                if (error instanceof multer.MulterError) {
                    let message = t('General.upload_error');
                    let code = error.code || 'UNKNOWN_ERROR';
                    let details = t('General.no_details');
                    switch (error.code) {
                        case 'LIMIT_UNEXPECTED_FILE':
                            message = t('General.unexpected_field', { field: error.field });
                            details = t('General.unexpected_field_details', { field: error.field });
                            break;
                        case 'LIMIT_FILE_COUNT':
                            message = t('General.file_count_exceeded', { field: error.field });
                            details = t('General.file_count_exceeded_details', {
                                field: error.field,
                                max:
                                    error.field === 'screenshots'
                                        ? MAX_SCREENSHOTS
                                        : error.field === 'videos'
                                            ? MAX_VIDEOS
                                            : error.field === 'certificate'
                                                ? MAX_CERTIFICATES
                                                : MAX_DOCUMENTS,
                            });
                            break;
                        case 'LIMIT_FILE_SIZE':
                            message = t('General.file_too_large', { field: t('General.file') });
                            details = t('General.file_too_large_details', { size: MAX_DOCUMENT_SIZE / MB });
                            break;
                        default:
                            message = t('General.multer_error', { error: error.message });
                            break;
                    }
                    return res.status(status.BadRequest).json({
                        status: jsonStatus.BadRequest,
                        code,
                        message,
                        details,
                    });
                } else if (error) {
                    return res.status(status.BadRequest).json({
                        status: jsonStatus.BadRequest,
                        message: error.message ?? t('General.upload_error'),
                    });
                }
                if (!req.files || Object.keys(req.files).length === 0) {
                    return res.status(status.BadRequest).json({
                        status: jsonStatus.BadRequest,
                        message: t('Upload.no_file_uploaded'),
                    });
                }
                next();
            });
        });
    };
};