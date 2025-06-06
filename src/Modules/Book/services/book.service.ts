import { Service } from 'typedi';
import Book from '../models/book.model';
import { IBook } from '../interfaces/book.interface';
import { TFunction } from 'i18next';
import { HttpException } from 'utils/exceptions/httpException';
import { status } from 'utils/helpers/api.responses';
import Review from 'Modules/Review/models/review.model';
import mongoose from 'mongoose';
import { IReview } from 'Modules/Review/interfaces/review.interface';

@Service()
export class BookService {
    public async addBook(bookData: Partial<IBook>, userId: string, t: TFunction): Promise<IBook> {
        const book = new Book({ ...bookData, createdBy: userId });
        await book.save();
        return book;
    }

    public async getBooks(page: number, limit: number, author?: string, genre?: string, t?: TFunction): Promise<{ books: IBook[]; total: number }> {
        const query: any = { isDeleted: false };
        if (author) query.author = { $regex: author, $options: 'i' };
        if (genre) query.genre = { $regex: genre, $options: 'i' };

        const [books, total] = await Promise.all([
            Book.find(query)
                .skip((page - 1) * limit)
                .limit(limit)
                .select('-isDeleted -deletedAt'),
            Book.countDocuments(query),
        ]);
        return { books, total };
    }

    public async getBookById(id: string, reviewPage: number, reviewLimit: number, t: TFunction): Promise<{ book: IBook; averageRating: number; reviews: IReview[]; totalReviews: number }> {
        const book = await Book.findOne({ _id: id, isDeleted: false }).select('-isDeleted -deletedAt');
        if (!book) {
            throw new HttpException(status.NotFound, t('General.not_found', { field: 'book' }));
        }
        const [reviews, totalReviews, averageRating] = await Promise.all([
            Review.find({ bookId: id, isDeleted: false })
                .skip((reviewPage - 1) * reviewLimit)
                .limit(reviewLimit)
                .populate('userId', 'accountSetting.userName email')
                .select('-isDeleted -deletedAt')
            ,
            Review.countDocuments({ bookId: id, isDeleted: false }),
            Review.aggregate([{ $match: { bookId: new mongoose.Types.ObjectId(id), isDeleted: false } }, { $group: { _id: null, avgRating: { $avg: '$rating' } } }]),
        ]);
        return { book, averageRating: averageRating[0]?.avgRating || 0, reviews, totalReviews };
    }

    public async searchBooks(query: string, page: number, limit: number, t: TFunction): Promise<{ books: IBook[]; total: number }> {
        const searchQuery = { $text: { $search: query }, isDeleted: false };
        const [books, total] = await Promise.all([
            Book.find(searchQuery)
                .skip((page - 1) * limit)
                .limit(limit)
                .select('-isDeleted -deletedAt'),
            Book.countDocuments(searchQuery),
        ]);
        return { books, total };
    }
}