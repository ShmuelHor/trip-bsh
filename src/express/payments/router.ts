import { Router } from 'express';
import { validateRequest, wrapController } from '../../utils/express/wrappers';
import { PaymentsController } from './controller';
import { createOneRequestSchema, getAllPaymentsByTripIdRequestSchema } from './validations';
export const paymentsRouter = Router();

paymentsRouter.post('/', validateRequest(createOneRequestSchema), wrapController(PaymentsController.createOne));

paymentsRouter.get('/oftrip/:id', validateRequest(getAllPaymentsByTripIdRequestSchema), wrapController(PaymentsController.getAllPaymentsByTripId));

