import { Schema } from "dynamoose";

export const EventPlayer = new Schema({
    eventPK: {
        type: String,
        hashKey: true,
    },
    eventSK: {
        type: String,
        rangeKey: true
    },
    familyName: {
        type: String,
    },
    givenName: {
        type: String,
    },
    gender: {
        type: String,
    },
    isConfirmed: {
        type: Boolean,
        required: true,
    },
    percentage: {
        type: Number,
    },
    phone: {
        type: String,
    },
    place: {
        type: Number,
    },
    points: {
        type: Number,
    },
    specialPoints: {
        type: Number,
    },
    userEmail: {
        type: String,
    },
    username: {
        type: String,
    }
}, { saveUnknown: true })