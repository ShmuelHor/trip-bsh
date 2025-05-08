import { Response } from 'express';
import { TypedRequest } from '../../utils/zod';
import { PaymentsManager } from './manager';
import { createOneRequestSchema, getAllPaymentsByTripIdRequestSchema } from './validations';

export class PaymentsController {
    static createOne = async (req: TypedRequest<typeof createOneRequestSchema>, res: Response) => {
        res.json(await PaymentsManager.createOne(req.body));
    };

    static getAllPaymentsByTripId = async (req: TypedRequest<typeof getAllPaymentsByTripIdRequestSchema>, res: Response) => {
        const { id } = req.params;
        res.json(await PaymentsManager.getAllPaymentsByTripId(id, req.user._id));
    };
}
