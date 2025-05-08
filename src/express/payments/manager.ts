import { TripsManager } from '../trips/manager';
import { Payments, PaymentsDocument } from './interface';
import { PaymentsModel } from './model';

export class PaymentsManager {
    static getAll = async (): Promise<PaymentsDocument[]> => {
        return await PaymentsModel.find().lean().exec();
    };

    static createOne = async (payment: Payments): Promise<PaymentsDocument> => {
        return PaymentsModel.create(payment);
    };

    static getAllPaymentsByTripId = async (tripId: string, userId: string) => {
        const trip = await TripsManager.getById(tripId, userId);
        const payments = await PaymentsModel.find({ tripId }).lean().exec();
        return { trip, payments };
    };
}
