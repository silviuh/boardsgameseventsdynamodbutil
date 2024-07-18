import { Schema } from "dynamoose";

export const EventConnection = new Schema({
    eventPK: {
        type: String,
        hashKey: true,
    },
    eventSK: {
        type: String,
        rangeKey: true
    },
    connectionId: {
        type: String,
    }
}, { saveUnknown: true })