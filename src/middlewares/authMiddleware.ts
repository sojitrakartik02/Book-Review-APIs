import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '../utils/helpers/utilities.services';
import User from '../Modules/Auth/models/auth.model';
import { HttpException } from '../utils/exceptions/httpException';
import { Types } from 'mongoose';
import { status } from '../utils/helpers/api.responses';
import { logger } from '../utils/logger';
import { StatusEnum } from '../Modules/Auth/interfaces/auth.interface';

export const getAuthenticatedUser = async (req: Request) => {
    const token = req.headers.authorization?.split(' ')[1];
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if (!token) {
        throw new HttpException(
            status.Unauthorized,
            req.t('General.empty', { field: req.t('User.token') })
        );
    }

    const decoded = verifyJWT(token, req.t);
    if (!decoded) {
        throw new HttpException(
            status.Unauthorized,
            req.t('General.invalid', { field: req.t('User.token') })
        );
    }

    const user = await User.findOne({ _id: decoded._id });
    if (!user || !user.sessionId || user.sessionId !== decoded.sessionId) {
        throw new HttpException(status.Unauthorized, req.t('General.sessionExpired'));
    }

    if (user.status !== StatusEnum.ACTIVE) {
        throw new HttpException(
            status.Unauthorized,
            req.t('General.invalid', { field: req.t('User.user') })
        );
    }

    const currentTime = Date.now();
    if (user.tokenExpiry && currentTime > user.tokenExpiry.getTime()) {
        throw new HttpException(
            status.Unauthorized,
            req.t('General.expired', { field: req.t('User.token') })
        );
    }

    logger.info(`Authenticated user: ${user._id}, IP: ${ip}, URL: ${req.originalUrl}`);
    return user;
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await getAuthenticatedUser(req);
        req.user = user;
        next();
    } catch (error) {
        if (error instanceof HttpException) {
            return res.status(error.status).json({
                status: error.status,
                message: error.message,
            });
        }
        return res.status(status.InternalServerError).json({
            status: status.InternalServerError,
            message: req.t('General.error'),
        });
    }
};

