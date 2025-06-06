import { Response } from 'express';
import { TypedRequest } from '../../utils/zod';
import { PaymentsManager } from './manager';
import { createOneRequestSchema, getAllPaymentsByTripIdRequestSchema } from './validations';

export class PaymentsController {
    static createOne = async (req: TypedRequest<typeof createOneRequestSchema>, res: Response) => {
        res.json(await PaymentsManager.createOne(req.body, req.user._id.toString()));
    };

    static getAllPaymentsByTripId = async (req: TypedRequest<typeof getAllPaymentsByTripIdRequestSchema>, res: Response) => {
        const { id } = req.params;
        res.json(await PaymentsManager.getAllPaymentsOfTrip(id, req.user._id));
    };
}
