import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { HttpException } from '../utils/exceptions/httpException';
import { status } from '../utils/helpers/api.responses';



export const validationMiddleware = (schema: Schema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const t = req.t || ((key: string, options?: any) => key);

            await schema.validateAsync(req.body, {
                abortEarly: true,
                context: { t },
            });

            next();
        } catch (error: any) {
            const t = req.t || ((key: string, options?: any) => key);

            if (error.isJoi && error.details) {
                const messages = error.details.map(detail => {
                    const key = detail.type;
                    const fieldLabel = detail.context?.label || 'field';
                    return t(`Validation.${key}`, { field: t(`User.${fieldLabel}`), ...detail.context });
                }).join(', ');

                return res.status(status.BadRequest).json({
                    status: status.BadRequest,
                    message: messages || t('General.error'),
                });
            }

            if (error instanceof HttpException) {
                return res.status(error.status).json({
                    status: error.status,
                    message: error.message,
                });
            }

            return res.status(status.InternalServerError).json({
                status: status.InternalServerError,
                message: t('General.error'),
            });
        }
    };
};
