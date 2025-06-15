import { DocumentNotFoundError } from '../../utils/errors';
import { TripsManager } from '../trips/manager';
import bcrypt from 'bcrypt';
import { User, UserDocument } from './interface';
import { UsersModel } from './model';

export class UsersManager {
    static createOne = async (user: User): Promise<UserDocument> => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const newUser = { ...user, password: hashedPassword };
        return UsersModel.create(newUser);
    };

    static getByEmail = async (email: string): Promise<UserDocument> => {
        return await UsersModel.findOne({ email }).orFail(new DocumentNotFoundError(email)).lean().exec();
    };

    static getById = async (id: string): Promise<UserDocument> => {
        return await UsersModel.findById(id).orFail(new DocumentNotFoundError(id)).lean().exec();
    };

    static getPendingApprovalUsers = async (tripId: string) => {
        const trip = await TripsManager.getById(tripId);
        return await UsersModel.find({ _id: { $in: trip.pendingApprovalUserIds } })
            .select('_id username fullname')
            .lean()
            .exec();
    };

    static removeUserFromPendingApproval = async (tripId: string, userId: string) => {
        const trip = await TripsManager.getById(tripId);
        if (!trip.pendingApprovalUserIds.includes(userId)) {
            throw new Error(`User with ID ${userId} is not in the pending approval list for trip ${tripId}`);
        }
        trip.pendingApprovalUserIds = trip.pendingApprovalUserIds.filter((id) => id !== userId);
        const updatedTrip = await TripsManager.updateOne(trip);
        return updatedTrip;
    };

    static updateUser = async (userId: string, userFields: Partial<User>): Promise<UserDocument> => {
        if (userFields.password) {
            userFields.password = await bcrypt.hash(userFields.password, 10);
        }

        const updatedUser = await UsersModel.findByIdAndUpdate(
            userId,
            { $set: userFields },
            {
                new: true,
                runValidators: true,
            },
        )
            .orFail(new DocumentNotFoundError(userId))
            .lean()
            .exec();

        return updatedUser;
    };
}
