export interface Payment {
  tripId: string;
  amount: number;
  currency: string;
  amountInILS?: number;
  payerId?: string;
  beneficiaryUserIds: string[];
  description: string;
  paymentDate: Date;
}


export interface PaymentsDocument extends Payment {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}
