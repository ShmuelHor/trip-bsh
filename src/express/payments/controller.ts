import { Response } from 'express';
import { TypedRequest } from '../../utils/zod';
import { PaymentsManager } from './manager';
import { createOneRequestSchema, deleteOneRequestSchema, getAllPaymentsByTripIdRequestSchema, updateOneRequestSchema } from './validations';

export class PaymentsController {
    static createOne = async (req: TypedRequest<typeof createOneRequestSchema>, res: Response) => {
        res.json(await PaymentsManager.createOne(req.body, req.user._id.toString()));
    };

    static getAllPaymentsByTripId = async (req: TypedRequest<typeof getAllPaymentsByTripIdRequestSchema>, res: Response) => {
        const { id } = req.params;
        res.json(await PaymentsManager.getAllPaymentsOfTrip(id, req.user._id));
    };

    static deleteOne = async (req: TypedRequest<typeof deleteOneRequestSchema>, res: Response) => {
        const { id } = req.params;
        res.json(await PaymentsManager.deleteOne(id, req.user._id));
    };

    static updateOne = async (req: TypedRequest<typeof updateOneRequestSchema>, res: Response) => {
        const { id } = req.params;
        res.json(await PaymentsManager.updateOne(id, req.body, req.user._id));
    };
}
