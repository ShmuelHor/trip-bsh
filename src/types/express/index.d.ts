import { UserDocument } from '../../express/users/interface';

declare module 'express-serve-static-core' {
    interface Request {
        user: UserDocument;
    }
}
