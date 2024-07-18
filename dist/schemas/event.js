"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const dynamoose_1 = require("dynamoose");
exports.Event = new dynamoose_1.Schema({
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
}, { saveUnknown: true });
