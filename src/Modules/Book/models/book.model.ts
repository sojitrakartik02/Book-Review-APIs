import mongoose, { Schema, Model } from 'mongoose';
import { IBook } from '../interfaces/book.interface';

const bookSchema = new Schema<IBook>(
    {
        title: { type: String, required: true, trim: true },
        author: { type: String, required: true, trim: true },
        genre: { type: String, required: true, trim: true },
        publicationDate: { type: Date, required: false },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date, required: false },
    },
    { timestamps: true, versionKey: false }
);

bookSchema.index({ title: 'text', author: 'text' }); 
const Book: Model<IBook> = mongoose.model<IBook>('Book', bookSchema);
export default Book;