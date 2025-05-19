import mongoose from 'mongoose';
import { config } from '../../config';
import { PaymentsDocument } from './interface';

const PaymentsSchema = new mongoose.Schema<PaymentsDocument>(
    {
        tripId: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            required: true,
        },
        amountInILS: {
            type: Number,
            required: false,
        },
        payerId: {
            type: String,
            required: true,
        },
        beneficiaryUserIds: {
            type: [String],
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        paymentDate: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

export const PaymentsModel = mongoose.model<PaymentsDocument>(config.payments.mongo.paymentsCollectionName, PaymentsSchema);
