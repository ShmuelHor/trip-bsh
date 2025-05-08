import { Router } from 'express';
import { validateRequest, wrapController } from '../../utils/express/wrappers';
import { PaymentsController } from './controller';
import { createOneRequestSchema, getAllPaymentsByTripIdRequestSchema, getAllRequestSchema } from './validations';
export const paymentsRouter = Router();

paymentsRouter.get('/', validateRequest(getAllRequestSchema), wrapController(PaymentsController.getALL));

paymentsRouter.post('/', validateRequest(createOneRequestSchema), wrapController(PaymentsController.createOne));

paymentsRouter.get('/oftrip/:id', validateRequest(getAllPaymentsByTripIdRequestSchema), wrapController(PaymentsController.getAllPaymentsByTripId));
