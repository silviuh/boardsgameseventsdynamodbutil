import { Schema } from "dynamoose";

export const EventRound = new Schema({
    eventPK: {
        type: String,
        hashKey: true,
    },
    eventSK: {
        type: String,
        rangeKey: true
    },
    round: {
        type: String,        
    },
    table: {
        type: String,
    },
}, { saveUnknown: true })