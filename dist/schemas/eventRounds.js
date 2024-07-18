"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventRound = void 0;
const dynamoose_1 = require("dynamoose");
exports.EventRound = new dynamoose_1.Schema({
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
}, { saveUnknown: true });
