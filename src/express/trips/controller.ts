import { Response } from 'express';
import { TypedRequest } from '../../utils/zod';
import { TripsManager } from './manager';
import { createOneRequestSchema, getAllRequestSchema, getAllTripsByUserIdRequestSchema } from './validations';

export class TripsController {
    static getALL = async (_req: TypedRequest<typeof getAllRequestSchema>, res: Response) => {
        res.json(await TripsManager.getAll());
    };

    static createOne = async (req: TypedRequest<typeof createOneRequestSchema>, res: Response) => {
        res.json(await TripsManager.createOne(req.body));
    };

    static getAllTripsByUserId = async (req: TypedRequest<typeof getAllTripsByUserIdRequestSchema>, res: Response) => {
        const { id } = req.params;
        res.json(await TripsManager.getAllTripsByUserId(id));
    };
}
