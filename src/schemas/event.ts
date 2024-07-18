import { Schema } from "dynamoose";

export const Event = new Schema({
    eventPK: {
        type: String,
        hashKey: true,
    },
    eventSK: {
        type: String,
        rangeKey: true
    },
    adminApproval: {
        type: Boolean,
        required: true,
    },
    eventAdmin: {
        type: String,
        required: true,
    },
    eventCode: {
        type: String,
        required: true,
    },
    eventDate: {
        type: String,
        required: true,
    },
    eventName: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    numberOfRounds: {
        type: Number,
        required: true,
    },
    onlyOrganizerAccess: {
        type: Boolean,
        required: true,
    },
    pairWinners: {
        type: Boolean,
        required: true,
    },
    eventSystem: {
        type: String,
    }
}, { saveUnknown: true })