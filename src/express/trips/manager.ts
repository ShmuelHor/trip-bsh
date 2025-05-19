import { UserDocument } from '../users/interface';
import { UsersManager } from '../users/manager';
import { Trip, TripDocument } from './interface';
import { TripsModel } from './model';

export class TripsManager {
    static createOne = async (trip: Trip): Promise<TripDocument> => {
        return TripsModel.create(trip);
    };

    static getAllTripsByUserId = async (userId: string) => {
        return await TripsModel.aggregate([
            {
                $match: {
                    'participants.userId': userId,
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    startDate: 1,
                    endDate: 1,
                    participantsCount: { $size: '$participants' },
                    balance: {
                        $let: {
                            vars: {
                                userParticipant: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: '$participants',
                                                as: 'participant',
                                                cond: { $eq: ['$$participant.userId', userId] },
                                            },
                                        },
                                        0,
                                    ],
                                },
                            },
                            in: '$$userParticipant.balance',
                        },
                    },
                },
            },
        ]);
    };
    static updateOne = async (trip: TripDocument) => {
        return await TripsModel.findByIdAndUpdate(trip._id, trip, { new: true, runValidators: true }).lean().exec();
    };

    static getById = async (tripId: string) => {
        return await TripsModel.findById(tripId).orFail().lean().exec();
    }

    static getTripDetailsForUser = async (tripId: string, userId: string) => {
        const trip = await TripsModel.findById(tripId).orFail().lean().exec();

        const currentParticipant = trip.participants.find((p) => p.userId === userId.toString());
        if (!currentParticipant) {
            throw new Error('User not found in trip participants');
        }

        const currentUser: UserDocument = await UsersManager.getById(userId);
        if (!currentUser) {
            throw new Error('User not found');
        }

        const username = currentUser.username;
        const userBalance = currentParticipant.balance;

        const otherParticipantsRaw = trip.participants.filter((p) => p.userId !== userId.toString());

        const otherParticipants = await Promise.all(
            otherParticipantsRaw.map(async (participant) => {
                const user: UserDocument = await UsersManager.getById(participant.userId);
                if (!user) {
                    throw new Error('User not found');
                }
                return {
                    userId: participant.userId,
                    username: user.username,
                    balance: participant.balance,
                };
            }),
        );

        return {
            _id: trip._id,
            name: trip.name,
            startDate: trip.startDate,
            endDate: trip.endDate,
            participants: otherParticipants,
            userId,
            username,
            userBalance,
        };
    };
}
