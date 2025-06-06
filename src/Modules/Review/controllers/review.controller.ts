import { Request, Response, NextFunction } from 'express';

import Container from 'typedi';
import { ReviewService } from 'Modules/Review/services/review.service';
import { jsonStatus, status } from 'utils/helpers/api.responses';
import { HttpException } from 'utils/exceptions/httpException';
import { pick, removenull } from 'utils/helpers/utilities.services';




/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "60d21b4667d0d8992e610c86"
 *         bookId:
 *           type: string
 *           example: "60d21b4667d0d8992e610c85"
 *         userId:
 *           type: string
 *           example: "60d21b4667d0d8992e610c84"
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           example: 4
 *         comment:
 *           type: string
 *           example: "Great read!"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
export class ReviewController {
    private reviewService = Container.get(ReviewService);

    public addReview = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) throw new HttpException(status.Unauthorized, req.t('General.invalid', { field: 'user' }));
            const { id: bookId } = req.params;
            req.body = pick(req.body, ['rating', 'comment']);
            removenull(req.body);
            const review = await this.reviewService.addReview(bookId, req.user._id, req.body, req.t);
            return res.status(status.Create).json({
                status: jsonStatus.Create,
                message: req.t('Review.succ_added'),
                data: review,
            });
        } catch (error) {
            next(error);
        }
    };
    public updateReview = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) throw new HttpException(status.Unauthorized, req.t('General.invalid', { field: 'user' }));
            const { id: reviewId } = req.params;
            req.body = pick(req.body, ['rating', 'comment']);
            removenull(req.body);
            const review = await this.reviewService.updateReview(reviewId, req.user._id, req.body, req.t);
            return res.status(status.OK).json({
                status: jsonStatus.OK,
                message: req.t('Review.succ_updated'),
                data: review,
            });
        } catch (error) {
            next(error);
        }
    };

    public deleteReview = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) throw new HttpException(status.Unauthorized, req.t('General.invalid', { field: 'user' }));
            const { id: reviewId } = req.params;
            await this.reviewService.deleteReview(reviewId, req.user._id, req.t);
            return res.status(status.OK).json({
                status: jsonStatus.OK,
                message: req.t('Review.succ_deleted'),
            });
        } catch (error) {
            next(error);
        }
    };

}