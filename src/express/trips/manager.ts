import { UserDocument } from '../users/interface';
import { UsersManager } from '../users/manager';
import { UsersModel } from '../users/model';
import { createTrip, Trip, TripDocument } from './interface';
import { TripsModel } from './model';

export class TripsManager {
    static createOne = async (trip: createTrip, userId: string): Promise<TripDocument> => {
        const participants = [
            {
                userId,
                balance: 0,
            },
        ];
        const newTrip: Trip = {
            name: trip.name,
            participants,
            ownerIds: [userId],
            pendingApprovalUserIds: [],
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
                ownerIds: 1,
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

        const userIdStr = userId.toString();

        const currentParticipant = trip.participants.find((p) => p.userId.toString() === userIdStr);

        if (!currentParticipant) {
            if (Array.isArray(trip.pendingApprovalUserIds) && trip.pendingApprovalUserIds.includes(userIdStr)) {
                throw new Error(`User is pending approval for the trip`);
            } else {
                throw new Error(`User not in the trip`);
            }
        }

        const currentUser: UserDocument = await UsersManager.getById(userIdStr);
        if (!currentUser) {
            throw new Error(`User with ID ${userIdStr} not found in the system`);
        }

        const username = currentUser.username;
        const userBalance = currentParticipant.balance;

        const otherParticipantsRaw = trip.participants.filter((p) => p.userId.toString() !== userIdStr);

        const otherParticipants = await Promise.all(
            otherParticipantsRaw.map(async (participant) => {
                const user: UserDocument = await UsersManager.getById(participant.userId);
                if (!user) {
                    throw new Error(`User with ID ${participant.userId} not found`);
                }
                return {
                    userId: participant.userId,
                    username: user.username,
                    balance: participant.balance,
                };
            }),
        );
        const pendingApprovalUserIds = await Promise.all(
            trip.pendingApprovalUserIds.map(async (pendingUserId) => {
                const user: UserDocument = await UsersManager.getById(pendingUserId);
                if (!user) {
                    throw new Error(`Pending user with ID ${pendingUserId} not found`);
                }
                return {
                    userId: pendingUserId,
                    username: user.username,
                    fullname: user.fullname,
                };
            }),
        );
        return {
            _id: trip._id,
            name: trip.name,
            startDate: trip.startDate,
            endDate: trip.endDate,
            participants: otherParticipants,
            ownerIds: trip.ownerIds,
            pendingApprovalUserIds,
            userId: userIdStr,
            username,
            userBalance,
        };
    };

    static getSummaryOfTrip = async (tripId: string) => {
  const trip: TripDocument = await TripsModel.findById(tripId).orFail().lean().exec();
  const participants = trip.participants;

  const creditors = participants
    .filter((p) => p.balance > 0)
    .map((p) => ({ userId: p.userId, balance: p.balance }));

  const debtors = participants
    .filter((p) => p.balance < 0)
    .map((p) => ({ userId: p.userId, balance: -p.balance }));

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

  const userIds = Array.from(new Set(transactions.flatMap((t) => [t.from, t.to])));

  const users = await UsersModel.find({ _id: { $in: userIds } }).lean().exec();
  const userMap = new Map(users.map((u) => [u._id.toString(), u.fullname]));

  const transactionsWithNames = transactions.map((t) => ({
    ...t,
    fromName: userMap.get(t.from) || 'לא ידוע',
    toName: userMap.get(t.to) || 'לא ידוע',
  }));

  return {
    tripId,
    tripName: trip.name,
    transactions: transactionsWithNames,
  };
};


    static addUserToPendingApproval = async (tripId: string, userId: string) => {
        const trip = await TripsModel.findById(tripId).orFail().lean().exec();
        if (trip.pendingApprovalUserIds.includes(userId)) {
            throw new Error(`User with ID ${userId} is already pending approval for this trip`);
        }

        trip.pendingApprovalUserIds.push(userId);

        return await TripsModel.findByIdAndUpdate(tripId, trip, { new: true, runValidators: true }).lean().exec();
    };

    static updateTripParticipants = async (tripId: string, userId: string) => {
        return await TripsModel.findByIdAndUpdate(tripId, { $addToSet: { participants: { userId, balance: 0 } } }, { new: true, runValidators: true })
            .lean()
            .exec();
    };
}
