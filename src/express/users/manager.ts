import { DocumentNotFoundError } from '../../utils/errors';
import { User, UserDocument } from './interface';
import { UsersModel } from './model';

export class UsersManager {
    static createOne = async (user: User): Promise<UserDocument> => {
        return UsersModel.create(user);
    };

    static getByEmail = async (email: string): Promise<UserDocument> => {
        return await UsersModel.findOne({ email }).orFail(new DocumentNotFoundError(email)).lean().exec();
    };

    static getById = async (id: string): Promise<UserDocument> => {
        return await UsersModel.findById(id).orFail(new DocumentNotFoundError(id)).lean().exec();
    };
    static getUserIdsByPhoneNumbers = async (phoneNumbers: string[]): Promise<string[]> => {
        const users = await UsersModel.find({ phonenumber: { $in: phoneNumbers } }).lean().exec();
        return users.map(user => user._id.toString());
    };

}
