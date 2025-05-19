import { TripsManager } from '../trips/manager';
import { Payments, PaymentsDocument } from './interface';
import { PaymentsModel } from './model';

export class PaymentsManager {
    static createOne = async (paymentInput: Payments, loggedInUserId: string): Promise<PaymentsDocument> => {
        const tripData = await TripsManager.getById(paymentInput.tripId);
        const { amount: totalAmount, forUserIds: beneficiaries } = paymentInput;

        const individualShare = totalAmount / beneficiaries.length;

        tripData.participants = tripData.participants.map((participant) => {
            const { userId, balance: currentBalance } = participant;

            if (userId === loggedInUserId) {
                return {
                    ...participant,
                    balance: currentBalance + (totalAmount - individualShare),
                };
            }

            if (beneficiaries.includes(userId)) {
                return {
                    ...participant,
                    balance: currentBalance - individualShare,
                };
            }

            return participant;
        });

        await TripsManager.updateOne(tripData);

        const paymentToSave: Payments = {
            ...paymentInput,
            payerId: loggedInUserId,
        };

        return PaymentsModel.create(paymentToSave);
    };



    static getAllPaymentsByTripId = async (tripId: string, userId: string) => {
        const trip = await TripsManager.getTripDetailsForUser(tripId, userId);
        const payments = await PaymentsModel.find({ tripId }).lean().exec();
        return { trip, payments };
    };
}
