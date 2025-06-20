import { z } from 'zod';

export const zodMongoObjectId = z.string().regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid ObjectId' });

export const userFields = z.object({
    fullname: z.string().min(1, { message: 'Full name is required' }),
    username: z.string().min(3, { message: 'Username must be at least 3 characters' }).max(20),
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters' }).max(20),
    phonenumber: z.string().min(10, { message: 'Phone number too short' }).max(15, { message: 'Phone number too long' }),
});

export const verifyPasswordRequestSchema = z.object({
    body: z.object({
        password: z.string().min(8, { message: 'Password must be at least 8 characters' }).max(20),
    }),
    query: z.object({}),
    params: z.object({}),
});

// סכימת עדכון - כל שדה אופציונלי
export const updateUserRequestSchema = z.object({
    body: userFields.partial(),
    query: z.object({}),
    params: z.object({}),
});

// שאר הסכימות ללא שינוי
export const getByIdRequestSchema = z.object({
    body: z.object({}),
    query: z.object({}),
    params: z.object({}),
});

export const getPendingApprovalUsersRequestSchema = z.object({
    body: z.object({}),
    query: z.object({}),
    params: z.object({
        tripId: zodMongoObjectId,
    }),
});

export const removeUserFromPendingApprovalRequestSchema = z.object({
    body: z.object({}),
    query: z.object({}),
    params: z.object({
        tripId: zodMongoObjectId,
        userId: zodMongoObjectId,
    }),
});
