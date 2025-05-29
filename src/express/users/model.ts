import mongoose from 'mongoose';
import { config } from '../../config';
import { UserDocument } from './interface';

const UsersSchema = new mongoose.Schema<UserDocument>(
    {
        fullname: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        phonenumber: {
            type: String,
            required: true,
            unique: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

export const UsersModel = mongoose.model<UserDocument>(config.users.mongo.usersCollectionName, UsersSchema);
