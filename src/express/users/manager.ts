import { DocumentNotFoundError } from '../../utils/errors';
import { TripsManager } from '../trips/manager';
import { TripsModel } from '../trips/model';
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
}
