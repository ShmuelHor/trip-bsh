import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { TypedRequest } from '../../utils/zod';
import { UsersManager } from '../users/manager';
import { loginRequestSchema } from './validations';

export class AuthenticationController {
    static login = async (req: TypedRequest<typeof loginRequestSchema>, res: Response) => {
        const { email, password } = req.body;

        const user = await UsersManager.getByEmail(email);
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        if (user.password !== password) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign({ userId: user._id }, config.authentication.secret_key, { expiresIn: '30d' });
        res.status(200).cookie(config.authentication.token_name, token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        }).json({ message: 'Login successful' });


    };
}
