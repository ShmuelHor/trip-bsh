import mongoose from 'mongoose';
import { config } from '../../config';
import { TripDocument } from './interface';

const TripParticipantSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    balance: {
        type: Number,
        required: true,
    },
});

const TripsSchema = new mongoose.Schema<TripDocument>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        participants: {
            type: [TripParticipantSchema],
            required: true,
        },
        ownerIds: {
            type: [String],
            required: true,
        },
        pendingApprovalUserIds: {
            type: [String],
            default: [],
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

export const TripsModel = mongoose.model<TripDocument>(config.trips.mongo.tripsCollectionName, TripsSchema);
