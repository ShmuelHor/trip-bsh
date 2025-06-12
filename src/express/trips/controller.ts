import { Response } from 'express';
import { TypedRequest } from '../../utils/zod';
import { TripsManager } from './manager';
import {
    addUserToPendingApprovalRequestSchema,
    createOneRequestSchema,
    getAllTripsByUserIdRequestSchema,
    getSummaryOfTripRequestSchema,
    updateTripParticipantsRequestSchema,
} from './validations';

export class TripsController {
    static createOne = async (req: TypedRequest<typeof createOneRequestSchema>, res: Response) => {
        res.json(await TripsManager.createOne(req.body, req.user._id.toString()));
    };

    static getAllTripsByUserId = async (req: TypedRequest<typeof getAllTripsByUserIdRequestSchema>, res: Response) => {
        res.json(await TripsManager.getAllTripsByUserId(req.user._id.toString()));
    };

    static getSummaryOfTrip = async (req: TypedRequest<typeof getSummaryOfTripRequestSchema>, res: Response) => {
        const { id } = req.params;
        res.json(await TripsManager.getSummaryOfTrip(id));
    };

    static addUserToPendingApproval = async (req: TypedRequest<typeof addUserToPendingApprovalRequestSchema>, res: Response) => {
        const { tripId } = req.params;
        res.json(await TripsManager.addUserToPendingApproval(tripId, req.user._id.toString()));
    };
    static updateTripParticipants = async (req: TypedRequest<typeof updateTripParticipantsRequestSchema>, res: Response) => {
        const { tripId, userId } = req.params;
        res.json(await TripsManager.updateTripParticipants(tripId, userId));
    };
}
