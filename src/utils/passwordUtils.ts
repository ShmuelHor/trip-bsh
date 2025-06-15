import bcrypt from 'bcrypt';

export const isPasswordMatch = async (enteredPassword: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(enteredPassword, hashedPassword);
};
