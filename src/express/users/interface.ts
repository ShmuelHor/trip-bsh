export interface User {
    username: string;
    email: string;
    password: string;
    phonenumber: string;
}

export interface UserDocument extends User {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}
