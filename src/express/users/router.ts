import { Router } from 'express';
import { validateRequest, wrapController } from '../../utils/express/wrappers';
import { UsersController } from './controller';
import { getByIdRequestSchema, getPendingApprovalUsersRequestSchema, removeUserFromPendingApprovalRequestSchema } from './validations';
export const usersRouter = Router();

usersRouter.get(`/is-logged-in`, validateRequest(getByIdRequestSchema), wrapController(UsersController.getById));

usersRouter.get(
    `/pending-approvals/:tripId`,
    validateRequest(getPendingApprovalUsersRequestSchema),
    wrapController(UsersController.getPendingApprovalUsers),
);

usersRouter.delete(
    `/pending-approvals/:tripId/:userId`,
    validateRequest(removeUserFromPendingApprovalRequestSchema),
    wrapController(UsersController.removeUserFromPendingApproval),
);
