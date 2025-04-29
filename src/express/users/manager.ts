import { DocumentNotFoundError } from '../../utils/errors';
import { User, UserDocument } from './interface';
import { UsersModel } from './model';

export class UsersManager {
    static getAll = async (): Promise<UserDocument[]> => {
        return await UsersModel.find().lean().exec();
    };

    static createOne = async (user: User): Promise<UserDocument> => {
        return UsersModel.create(user);
    };

    static getByEmail = async (email: string): Promise<UserDocument> => {
        return await UsersModel.findOne({ email }).orFail(new DocumentNotFoundError(email)).lean().exec();
    };

    static getById = async (id: string): Promise<UserDocument> => {
        return await UsersModel.findById(id).orFail(new DocumentNotFoundError(id)).lean().exec();
    };
}
