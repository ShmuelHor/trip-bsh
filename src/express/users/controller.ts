import { Response } from 'express';
import { TypedRequest } from '../../utils/zod';
import { registerRequestSchema } from '../authentication/validations';
import { UsersManager } from './manager';
import {
    getByIdRequestSchema,
    getPendingApprovalUsersRequestSchema,
    removeUserFromPendingApprovalRequestSchema,
    updateUserRequestSchema,
} from './validations';
import { isPasswordMatch } from '../../utils/passwordUtils';

export class UsersController {
    static createOne = async (req: TypedRequest<typeof registerRequestSchema>, res: Response) => {
        console.log('Creating user:', req.body);
        res.json(await UsersManager.createOne(req.body));
    };

    static getById = async (req: TypedRequest<typeof getByIdRequestSchema>, res: Response) => {
        res.json(await UsersManager.getById(req.user._id));
    };
    static getPendingApprovalUsers = async (req: TypedRequest<typeof getPendingApprovalUsersRequestSchema>, res: Response) => {
        const { tripId } = req.params;
        res.json(await UsersManager.getPendingApprovalUsers(tripId));
    };

    static removeUserFromPendingApproval = async (req: TypedRequest<typeof removeUserFromPendingApprovalRequestSchema>, res: Response) => {
        const { tripId, userId } = req.params;
        res.json(await UsersManager.removeUserFromPendingApproval(tripId, userId));
    };
    static updateUser = async (req: TypedRequest<typeof updateUserRequestSchema>, res: Response) => {
        res.json(await UsersManager.updateUser(req.user._id, req.body));
    };
    static verifyPassword = async (req: TypedRequest<typeof updateUserRequestSchema>, res: Response) => {
        const { password } = req.body;
        const user = await UsersManager.getById(req.user._id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        if (!password) {
            res.status(400).json({ message: 'Password is required' });
            return;
        }
        const isMatch = await isPasswordMatch(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid password' });
            return;
        }
        res.status(200).json({ message: 'Password verified successfully' });
    };
}
