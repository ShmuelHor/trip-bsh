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

    static deleteOne = async (id: string, userId: string) => {
        const payment = await PaymentsModel.findById(id).lean().exec();
        if (!payment) {
            throw new Error('Payment not found');
        }
        if (payment.payerId !== String(userId)) {
            throw new Error('Unauthorized');
        }

        const trip = await TripsManager.getById(payment.tripId);
        const { amountInILS, beneficiaryUserIds, payerId } = payment;

        if (beneficiaryUserIds?.length < 1) {
            throw new Error('No beneficiaries to revert payment to');
        }
        if (typeof amountInILS !== "number" || !Number.isFinite(amountInILS)) {
        throw new Error("Invalid amountInILS value");
}

        const sharePerUser = amountInILS / beneficiaryUserIds.length;
        const round = (v: number) => Math.round(v * 100) / 100;
        const beneficiaryIdSet = new Set(beneficiaryUserIds.map(String));
        const payerIdStr = String(payerId);

        trip.participants = trip.participants.map((p) => {
            const pid = String(p.userId);
            if (pid === payerIdStr) {
                return {
                    ...p,
                    balance: round(p.balance - (amountInILS - sharePerUser)),
                };
            }
            if (beneficiaryIdSet.has(pid)) {
                return {
                    ...p,
                    balance: round(p.balance + sharePerUser),
                };
            }
            return p;
        });

        await TripsManager.updateOne(trip);
        await PaymentsModel.deleteOne({ _id: id });

        return { message: 'Payment deleted and balances reverted' };
    };

    static getAllPaymentsOfTrip = async (tripId: string, userId: string) => {
        const trip = await TripsManager.getTripDetailsForUser(tripId, userId);
        const payments = await PaymentsModel.find({ tripId }).lean().exec();

        const payerIds = [...new Set(payments.map((p) => p.payerId))];
        const beneficiaryIds = [...new Set(payments.flatMap((p) => p.beneficiaryUserIds))];

        const [payers, beneficiaries] = await Promise.all([
            UsersModel.find({ _id: { $in: payerIds } })
                .lean()
                .exec(),
            UsersModel.find({ _id: { $in: beneficiaryIds } })
                .lean()
                .exec(),
        ]);

        const payerMap = new Map(payers.map((p) => [String(p._id), p.fullname]));
        const beneficiaryMap = new Map(beneficiaries.map((b) => [String(b._id), b.fullname]));

        const enrichedPayments = payments.map((payment) => ({
            ...payment,
            payerName: payerMap.get(String(payment.payerId)) ?? 'לא ידוע',
            beneficiaryNames: payment.beneficiaryUserIds.map((id) => beneficiaryMap.get(String(id)) ?? 'לא ידוע'),
        }));

        return {
            trip,
            payments: enrichedPayments,
        };
    };
    
   static updateOne = async (
        id: string,
        paymentUpdate: Partial<Payment>,
        userId: string
    ): Promise<PaymentsDocument> => {
        const session = await PaymentsModel.startSession();
        let saved!: PaymentsDocument;

        const round = (v: number) => Math.round(v * 100) / 100;
        const arraysEqualSet = (a: any[], b: any[]) =>
            a.length === b.length &&
            [...new Set(a.map(String))].every(x => new Set(b.map(String)).has(x));

        await session.withTransaction(async () => {
            const payment = await PaymentsModel.findById(id).session(session);
            if (!payment) throw new Error('Payment not found');
            if (String(payment.payerId) !== String(userId)) throw new Error('Unauthorized');

            if (paymentUpdate.tripId && String(paymentUpdate.tripId) !== String(payment.tripId)) {
                throw new Error('Trip ID cannot be changed');
            }
            if (paymentUpdate.payerId && String(paymentUpdate.payerId) !== String(payment.payerId)) {
                throw new Error('Payer ID cannot be changed');
            }
            if (paymentUpdate.amountInILS !== payment.amountInILS) {
                throw new Error('amountInILS cannot be set directly');
            }

            if (paymentUpdate.amount !== undefined && (typeof paymentUpdate.amount !== 'number' || paymentUpdate.amount <= 0)) {
                throw new Error('Amount must be a positive number');
            }
            if (paymentUpdate.currency !== undefined && !paymentUpdate.currency.trim()) {
                throw new Error('Currency must be non-empty');
            }
            if (paymentUpdate.description !== undefined && !paymentUpdate.description.trim()) {
                throw new Error('Description must be non-empty');
            }
            if (paymentUpdate.beneficiaryUserIds !== undefined &&
                (!Array.isArray(paymentUpdate.beneficiaryUserIds) || paymentUpdate.beneficiaryUserIds.length === 0)) {
                throw new Error('At least one beneficiary must be specified');
            }

            if (paymentUpdate.paymentDate !== undefined) {
                const d = new Date(paymentUpdate.paymentDate as any);
                if (isNaN(d.getTime())) throw new Error('Invalid paymentDate');
                (payment as any).paymentDate = d;
            }
            if ((paymentUpdate as any).paymentDate !== undefined) {
                const d2 = new Date((paymentUpdate as any).paymentDate);
                if (isNaN(d2.getTime())) throw new Error('Invalid paymentDate');
                (payment as any).paymentDate = d2;
            }

            const nextAmount = paymentUpdate.amount ?? payment.amount;
            const nextCurrency = paymentUpdate.currency ?? payment.currency;
            const nextBeneficiaries = paymentUpdate.beneficiaryUserIds ?? payment.beneficiaryUserIds;

            const amountChanged = paymentUpdate.amount !== undefined && paymentUpdate.amount !== payment.amount;
            const currencyChanged = paymentUpdate.currency !== undefined && paymentUpdate.currency !== payment.currency;
            const beneficiariesChanged =
                paymentUpdate.beneficiaryUserIds !== undefined &&
                !arraysEqualSet(payment.beneficiaryUserIds, paymentUpdate.beneficiaryUserIds);

            const requiresRecalc = amountChanged || currencyChanged || beneficiariesChanged;

            if (!requiresRecalc) {
                if (paymentUpdate.description !== undefined) payment.description = paymentUpdate.description;
                saved = await payment.save({ session });
                return;
            }

            const prevAmountInILS = typeof payment.amountInILS === 'number'
                ? payment.amountInILS
                : await convertCurrencyToILS(payment.amount, payment.currency);

            if (!Array.isArray(payment.beneficiaryUserIds) || payment.beneficiaryUserIds.length === 0) {
                throw new Error('Corrupted existing payment beneficiaries');
            }

            const trip = await TripsManager.getById(String(payment.tripId));
            const payerIdStr = String(payment.payerId);

            const oldShare = prevAmountInILS / payment.beneficiaryUserIds.length;
            const oldSet = new Set(payment.beneficiaryUserIds.map(String));

            trip.participants = trip.participants.map(p => {
                const pid = String(p.userId);
                if (pid === payerIdStr) {
                    return { ...p, balance: round(p.balance - (prevAmountInILS - oldShare)) };
                }
                if (oldSet.has(pid)) {
                    return { ...p, balance: round(p.balance + oldShare) };
                }
                return p;
            });

            const nextAmountInILS = (amountChanged || currencyChanged)
                ? await convertCurrencyToILS(nextAmount, nextCurrency)
                : prevAmountInILS;

            const newShare = nextAmountInILS / nextBeneficiaries.length;
            const newSet = new Set(nextBeneficiaries.map(String));

            trip.participants = trip.participants.map(p => {
                const pid = String(p.userId);
                if (pid === payerIdStr) {
                    return { ...p, balance: round(p.balance + (nextAmountInILS - newShare)) };
                }
                if (newSet.has(pid)) {
                    return { ...p, balance: round(p.balance - newShare) };
                }
                return p;
            });

            await TripsManager.updateOne(trip);

            payment.amount = nextAmount;
            payment.currency = nextCurrency;
            if (beneficiariesChanged) payment.beneficiaryUserIds = Array.from(newSet) as any;
            if (paymentUpdate.description !== undefined) payment.description = paymentUpdate.description;
            payment.amountInILS = round(nextAmountInILS);

            saved = await payment.save({ session });
        });

        session.endSession();
        return saved;
    };
}