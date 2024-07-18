"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventConnection = void 0;
const dynamoose_1 = require("dynamoose");
exports.EventConnection = new dynamoose_1.Schema({
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
}, { saveUnknown: true });
