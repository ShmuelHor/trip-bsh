import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { UsersManager } from '../../express/users/manager';

interface JwtPayload {
    userId: string;
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies[config.authentication.token_name];

    if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }

    try {
        const decoded = jwt.verify(token, config.authentication.secret_key) as JwtPayload;
        const user = await UsersManager.getById(decoded.userId);
        req.user = user;
        next();
    } catch (err) {
        res.status(403).json({ message: 'Invalid token' });
    }
};
