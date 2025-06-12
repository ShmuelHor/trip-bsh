import { convertCurrencyToILS } from '../../utils/currency-converter';
import { TripsManager } from '../trips/manager';
import { UsersModel } from '../users/model';
import { Payment, PaymentsDocument } from './interface';
import { PaymentsModel } from './model';

export class PaymentsManager {
    static createOne = async (paymentInput: Payment, loggedInUserId: string): Promise<PaymentsDocument> => {
        const trip = await TripsManager.getById(paymentInput.tripId);

        const { amount: originalAmount, currency, beneficiaryUserIds } = paymentInput;
        const amountInILS = await convertCurrencyToILS(originalAmount, currency);
        const sharePerUser = amountInILS / beneficiaryUserIds.length;

        const roundToTwoDecimals = (value: number): number => Math.round(value * 100) / 100;

        trip.participants = trip.participants.map((participant) => {
            const { userId, balance } = participant;

            if (userId === loggedInUserId) {
                const updatedBalance = balance + (amountInILS - sharePerUser);
                return {
                    ...participant,
                    balance: roundToTwoDecimals(updatedBalance),
                };
            }

            if (beneficiaryUserIds.includes(userId)) {
                const updatedBalance = balance - sharePerUser;
                return {
                    ...participant,
                    balance: roundToTwoDecimals(updatedBalance),
                };
            }

            return participant;
        });

        await TripsManager.updateOne(trip);

        const paymentRecord: Payment = {
            ...paymentInput,
            payerId: loggedInUserId,
            amountInILS: roundToTwoDecimals(amountInILS),
        };

        return await PaymentsModel.create(paymentRecord);
    };

static getAllPaymentsOfTrip = async (tripId: string, userId: string) => {
  const trip = await TripsManager.getTripDetailsForUser(tripId, userId);
  const payments = await PaymentsModel.find({ tripId }).lean().exec();

  const payerIds = [...new Set(payments.map(p => p.payerId))];
  const beneficiaryIds = [...new Set(payments.flatMap(p => p.beneficiaryUserIds))];

  const [payers, beneficiaries] = await Promise.all([
    UsersModel.find({ _id: { $in: payerIds } }).lean().exec(),
    UsersModel.find({ _id: { $in: beneficiaryIds } }).lean().exec()
  ]);

  const payerMap = new Map(payers.map(p => [String(p._id), p.fullname]));
  const beneficiaryMap = new Map(beneficiaries.map(b => [String(b._id), b.fullname]));

  const enrichedPayments = payments.map(payment => ({
    ...payment,
    payerName: payerMap.get(String(payment.payerId)) ?? 'לא ידוע',
    beneficiaryNames: payment.beneficiaryUserIds.map(id => beneficiaryMap.get(String(id)) ?? 'לא ידוע'),
  }));

  return {
    trip,
    payments: enrichedPayments,
  };
};


}
