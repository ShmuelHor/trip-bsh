import { UserDocument } from '../users/interface';
import { UsersManager } from '../users/manager';
import { createTrip, Trip, TripDocument } from './interface';
import { TripsModel } from './model';

export class TripsManager {
    static createOne = async (trip: createTrip): Promise<TripDocument> => {
        const phonenumbers = await UsersManager.getUserIdsByPhoneNumbers(trip.phonenumbers);
        const participants = phonenumbers.map((userId) => ({
            userId,
            balance: 0,
        }));
        const newTrip: Trip = {
            name: trip.name,
            participants,
            startDate: trip.startDate,
            endDate: trip.endDate,
        };

        const createdTrip = await TripsModel.create(newTrip);
        return createdTrip;
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
    };

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

    static getSummaryOfTrip = async (tripId: string, userId: string) => {
        const trip: TripDocument = await TripsModel.findById(tripId).orFail().lean().exec();
        const participants = trip.participants;

        const creditors = participants.filter((p) => p.balance > 0).map((p) => ({ userId: p.userId, balance: p.balance }));

        const debtors = participants.filter((p) => p.balance < 0).map((p) => ({ userId: p.userId, balance: -p.balance })); // חיובי לצורך החישוב

        const transactions: { from: string; to: string; amount: number }[] = [];

        let i = 0,
            j = 0;

        while (i < debtors.length && j < creditors.length) {
            const debtor = debtors[i];
            const creditor = creditors[j];
            const amount = Math.min(debtor.balance, creditor.balance);

            transactions.push({
                from: debtor.userId,
                to: creditor.userId,
                amount: Math.round(amount * 100) / 100,
            });

            debtor.balance -= amount;
            creditor.balance -= amount;

            if (debtor.balance === 0) i++;
            if (creditor.balance === 0) j++;
        }

        const mySummary = {
            toPay: transactions.filter((t) => t.from === userId),
            toReceive: transactions.filter((t) => t.to === userId),
        };

        return {
            tripId,
            tripName: trip.name,
            transactions,
            mySummary,
        };
    };
}
