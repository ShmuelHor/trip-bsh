export interface TripParticipant {
    userId: string;
    balance: number;
}

export interface Trip {
    name: string;
    participants: TripParticipant[];
    startDate: Date;
    endDate: Date;
}

export interface TripDocument extends Trip {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}
