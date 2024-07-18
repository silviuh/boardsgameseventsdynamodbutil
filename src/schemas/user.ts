import { Schema } from "dynamoose";

export const User = new Schema({
    userPK: {
        type: String,
        hashKey: true,
    },
    userSK: {
        type: String,
        rangeKey: true
    },
    connectionId: {
        type: String,
    },
    birthdate: {
        type: String,
    },
    description: {
        type: String,
    },
    email: {    
        type: String,
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
}, { saveUnknown: true })