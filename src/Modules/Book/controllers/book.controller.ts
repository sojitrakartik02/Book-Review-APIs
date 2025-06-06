import { Request, Response, NextFunction } from 'express';

import Container from 'typedi';
import { BookService } from '../services/book.service';
import { ReviewService } from 'Modules/Review/services/review.service';
import { jsonStatus, status } from 'utils/helpers/api.responses';
import { HttpException } from 'utils/exceptions/httpException';
import { pick, removenull } from 'utils/helpers/utilities.services';




/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "60d21b4667d0d8992e610c85"
 *         title:
 *           type: string
 *           example: "The Great Gatsby"
 *         author:
 *           type: string
 *           example: "F. Scott Fitzgerald"
 *         genre:
 *           type: string
 *           example: "Fiction"
 *         publicationDate:
 *           type: string
 *           format: date
 *           example: "1925-04-10"
 *         createdBy:
 *           type: string
 *           example: "60d21b4667d0d8992e610c84"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
export class BookController {
    private bookService = Container.get(BookService);

    public addBook = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) throw new HttpException(status.Unauthorized, req.t('General.invalid', { field: 'user' }));
            req.body = pick(req.body, ['title', 'author', 'genre', 'publicationDate']);
            removenull(req.body);
            const book = await this.bookService.addBook(req.body, req.user._id, req.t);
            return res.status(status.Create).json({
                status: jsonStatus.Create,
                message: req.t('Book.succ_added'),
                data: book,
            });
        } catch (error) {
            next(error);
        }
    };

    public getBooks = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { page = 1, limit = 10, author, genre } = req.query;
            const { books, total } = await this.bookService.getBooks(Number(page), Number(limit), author as string, genre as string, req.t);
            return res.status(status.OK).json({
                status: jsonStatus.OK,
                message: req.t('Book.succ_fetched'),
                data: { books, total, page: Number(page), limit: Number(limit) },
            });
        } catch (error) {
            next(error);
        }
    };

    public getBookById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { reviewPage = 1, reviewLimit = 5 } = req.query;
            const { book, averageRating, reviews, totalReviews } = await this.bookService.getBookById(id, Number(reviewPage), Number(reviewLimit), req.t);
            return res.status(status.OK).json({
                status: jsonStatus.OK,
                message: req.t('Book.succ_fetched'),
                data: { book, averageRating, reviews, totalReviews, reviewPage: Number(reviewPage), reviewLimit: Number(reviewLimit) },
            });
        } catch (error) {
            next(error);
        }
    };

    public searchBooks = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { query, page = 1, limit = 10 } = req.query;
            if (!query) throw new HttpException(status.BadRequest, req.t('General.invalid', { field: 'query' }));
            const { books, total } = await this.bookService.searchBooks(query as string, Number(page), Number(limit), req.t);
            return res.status(status.OK).json({
                status: jsonStatus.OK,
                message: req.t('Book.succ_search'),
                data: { books, total, page: Number(page), limit: Number(limit) },
            });
        } catch (error) {
            next(error);
        }
    };



}