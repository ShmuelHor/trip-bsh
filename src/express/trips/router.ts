import { Router } from 'express';
import { validateRequest, wrapController } from '../../utils/express/wrappers';
import { TripsController } from './controller';
import {
    addUserToPendingApprovalRequestSchema,
    createOneRequestSchema,
    getAllTripsByUserIdRequestSchema,
    getSummaryOfTripRequestSchema,
    removeTripParticipantRequestSchema,
    updateTripParticipantsRequestSchema,
} from './validations';
export const tripsRouter = Router();

tripsRouter.post('/', validateRequest(createOneRequestSchema), wrapController(TripsController.createOne));

tripsRouter.get('/ofUser', validateRequest(getAllTripsByUserIdRequestSchema), wrapController(TripsController.getAllTripsByUserId));

tripsRouter.get('/summary/:id', validateRequest(getSummaryOfTripRequestSchema), wrapController(TripsController.getSummaryOfTrip));

tripsRouter.post(
    '/join-request/:tripId',
    validateRequest(addUserToPendingApprovalRequestSchema),
    wrapController(TripsController.addUserToPendingApproval),
);

tripsRouter.put(
    '/participants/:tripId/:userId',
    validateRequest(updateTripParticipantsRequestSchema),
    wrapController(TripsController.updateTripParticipants),
);
tripsRouter.delete(
    '/participants/:tripId/:userId',
    validateRequest(removeTripParticipantRequestSchema),
    wrapController(TripsController.removeTripParticipant),
);
