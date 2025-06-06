import mongoose, { Schema, Model } from 'mongoose';
import { IReview } from '../interfaces/review.interface';

const reviewSchema = new Schema<IReview>(
    {
        bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: false, trim: true },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date, required: false },
    },
    { timestamps: true, versionKey: false }
);

reviewSchema.index({ bookId: 1, userId: 1 }, { unique: true });
const Review: Model<IReview> = mongoose.model<IReview>('Review', reviewSchema);
export default Review;