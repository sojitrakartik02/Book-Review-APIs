import { Types } from "mongoose";
export interface IBook {
    _id?: string;
    title: string;
    author: string;
    genre: string;
    publicationDate?: Date;
    createdBy: Types.ObjectId;
    isDeleted?: boolean;
    deletedAt?: Date;
}
