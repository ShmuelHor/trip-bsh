import { Router } from 'express';
import { validateRequest, wrapController } from '../../utils/express/wrappers';
import { PaymentsController } from './controller';
import { createOneRequestSchema, deleteOneRequestSchema, getAllPaymentsByTripIdRequestSchema, updateOneRequestSchema } from './validations';
export const paymentsRouter = Router();

paymentsRouter.post('/', validateRequest(createOneRequestSchema), wrapController(PaymentsController.createOne));

paymentsRouter.get('/oftrip/:id', validateRequest(getAllPaymentsByTripIdRequestSchema), wrapController(PaymentsController.getAllPaymentsByTripId));

paymentsRouter.delete('/:id', validateRequest(deleteOneRequestSchema), wrapController(PaymentsController.deleteOne));

paymentsRouter.put('/:id', validateRequest(updateOneRequestSchema), wrapController(PaymentsController.updateOne));