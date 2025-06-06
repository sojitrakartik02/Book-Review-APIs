import { Service } from 'typedi';
import Review from '../models/review.model';

import { IReview } from '../interfaces/review.interface';
import { TFunction } from 'i18next';
import Book from 'Modules/Book/models/book.model';
import { HttpException } from 'utils/exceptions/httpException';
import { status } from 'utils/helpers/api.responses';

@Service()
export class ReviewService {
    async addReview(bookId: string, userId: string, reviewData: Partial<IReview>, t: TFunction): Promise<IReview> {
        const book = await Book.findOne({ _id: bookId, isDeleted: false });
        if (!book) {
            throw new HttpException(status.NotFound, t('General.not_found', { field: 'book' }));
        }
        const existingReview = await Review.findOne({ bookId, userId, isDeleted: false });
        if (existingReview) {
            throw new HttpException(status.BadRequest, t('Review.already_exists'));
        }
        const review = new Review({ ...reviewData, bookId, userId });
        await review.save();
        return review;
    }

    async updateReview(reviewId: string, userId: string, reviewData: Partial<IReview>, t: TFunction): Promise<IReview> {
        const review = await Review.findOne({ _id: reviewId, userId, isDeleted: false });
        if (!review) {
            throw new HttpException(status.NotFound, t('General.not_found', { field: 'review' }));
        }
        Object.assign(review, reviewData);
        await review.save();
        return review;
    }

    async deleteReview(reviewId: string, userId: string, t: TFunction): Promise<void> {
        const review = await Review.findOne({ _id: reviewId, userId, isDeleted: false });
        if (!review) {
            throw new HttpException(status.NotFound, t('General.not_found', { field: 'review' }));
        }
        review.isDeleted = true;
        review.deletedAt = new Date();
        await review.save();
    }
}