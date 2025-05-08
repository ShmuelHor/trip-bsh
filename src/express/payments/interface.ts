export interface Payments {
    tripId: string;
    amount: number;
    currency: string;
    payerId: string;
    forUserIds: string[];
    description: string;
    paymentDate: Date;
}

export interface PaymentsDocument extends Payments {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}
