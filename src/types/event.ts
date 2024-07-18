export type Event = {
    eventPK: string
    eventSK: string;
    adminApproval: boolean
    eventAdmin: string;
    eventCode: string;
    eventDate: string;
    eventName: string;
    location: string;
    numberOfRounds: number;
    onlyOrganizerAccess: boolean;
    pairWinners: boolean;
    eventSystem: string;
}

export type EventDetails =  {
    code: string;
    eventDate: string;
    eventAdmin?: string | undefined;
    eventName?: string | undefined;
    game?: string | undefined;
    location?: string | undefined;
}

export type SimplifiedEvent = {
    code: string;
    eventDate: string;
}
