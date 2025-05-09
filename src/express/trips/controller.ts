import { Response } from 'express';
import { TypedRequest } from '../../utils/zod';
import { TripsManager } from './manager';
import { createOneRequestSchema, getAllTripsByUserIdRequestSchema } from './validations';

export class TripsController {
    static createOne = async (req: TypedRequest<typeof createOneRequestSchema>, res: Response) => {
        res.json(await TripsManager.createOne(req.body));
    };

    static getAllTripsByUserId = async (req: TypedRequest<typeof getAllTripsByUserIdRequestSchema>, res: Response) => {
        res.json(await TripsManager.getAllTripsByUserId(req.user._id.toString()));
    };
}
