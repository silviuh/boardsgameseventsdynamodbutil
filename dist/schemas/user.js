"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const dynamoose_1 = require("dynamoose");
exports.User = new dynamoose_1.Schema({
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
}, { saveUnknown: true });
