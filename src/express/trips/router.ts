import { Router } from 'express';
import { validateRequest, wrapController } from '../../utils/express/wrappers';
import { TripsController } from './controller';
import { createOneRequestSchema, getAllRequestSchema, getAllTripsByUserIdRequestSchema } from './validations';
export const tripsRouter = Router();

tripsRouter.get('/', validateRequest(getAllRequestSchema), wrapController(TripsController.getALL));

tripsRouter.post('/', validateRequest(createOneRequestSchema), wrapController(TripsController.createOne));

tripsRouter.get('/ofUser/:id', validateRequest(getAllTripsByUserIdRequestSchema), wrapController(TripsController.getAllTripsByUserId));
