"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamoDbRepository = exports.DynamoDbRepository = void 0;
const dynamoose = __importStar(require("dynamoose"));
const eventsTableAttributes_1 = require("./enums/eventsTableAttributes");
const schemaType_1 = require("./enums/schemaType");
const schemas_1 = require("./schemas");
const config_1 = require("./config");
class DynamoDbRepository {
    constructor() {
        this.getUsersByEvent = async (eventCode) => {
            try {
                const eventModel = this.getModel(schemaType_1.SchemaType.Event);
                if (!eventModel) {
                    throw new Error("eventModel is undefined");
                }
                const results = await eventModel.query("eventPK").eq(`event#${eventCode}`).exec();
                const userEmails = results.map(event => event.userEmail); // Assuming the structure matches the provided table structure
                return userEmails;
            }
            catch (error) {
                console.error('Error fetching users by event:', error);
                throw error;
            }
        };
        this.migrateUserEvents = async () => {
            const UserModel = this.getModel(schemaType_1.SchemaType.User);
            if (!UserModel) {
                throw new Error("UserModel is undefined");
            }
            const scanResults = await UserModel.scan().exec();
            for (const item of scanResults) {
                const organizedEvents = [];
                const pastEvents = [];
                for (const key in item) {
                    if (key.startsWith("event#")) {
                        const event = item[key];
                        if (event.eventAdmin === item.userSK.split('#')[1]) {
                            organizedEvents.push(event);
                        }
                        else {
                            pastEvents.push(event);
                        }
                        delete item[key];
                    }
                }
                await UserModel.update({ userPK: item.userPK, userSK: item.userSK }, {
                    organizedEvents,
                    pastEvents
                });
            }
        };
        this.cleanupEventColumns = async () => {
            console.log("Starting cleanup to retain only code and eventDate...");
            const UserModel = this.getModel(schemaType_1.SchemaType.User);
            if (!UserModel) {
                throw new Error("UserModel is undefined");
            }
            const scanResults = await UserModel.scan().exec();
            for (const user of scanResults) {
                let hasChanges = false;
                const cleanEvents = (events) => events === null || events === void 0 ? void 0 : events.map((event) => ({
                    code: event.code,
                    eventDate: event.eventDate,
                    eventAdmin: undefined,
                    eventName: undefined,
                    game: undefined,
                    location: undefined
                }));
                if (user.organizedEvents) {
                    user.organizedEvents = cleanEvents(user.organizedEvents);
                    hasChanges = true;
                }
                if (user.pastEvents) {
                    user.pastEvents = cleanEvents(user.pastEvents);
                    hasChanges = true;
                }
                if (hasChanges) {
                    console.log(`Updating events for user ${user.userSK}...`);
                    try {
                        await user.save();
                        console.log(`Attributes successfully updated for user ${user.userSK}.`);
                    }
                    catch (error) {
                        console.error(`Failed to save user ${user.userSK}. Error: ${error}`);
                    }
                }
                else {
                    console.log(`No changes required for user ${user.userSK}.`);
                }
            }
            console.log("Cleanup completed to retain only code and eventDate.");
        };
        this.cleanupRedundantEventColumns = async () => {
            console.log("Starting cleanup of redundant event columns...");
            const UserModel = this.getModel(schemaType_1.SchemaType.User);
            if (!UserModel) {
                throw new Error("UserModel is undefined");
            }
            const scanResults = await UserModel.scan().exec();
            for (const item of scanResults) {
                let hasChanges = false;
                for (const key in item) {
                    if (key.startsWith("event#") || key === 'ExpressionAttributeNames' || key === 'UpdateExpression') {
                        item[key] = undefined;
                        hasChanges = true;
                    }
                }
                if (hasChanges) {
                    console.log(`Saving changes for user ${item.userSK}...`);
                    try {
                        await item.save();
                        console.log(`Attributes successfully cleared for user ${item.userSK}.`);
                    }
                    catch (error) {
                        console.error(`Failed to update attributes for user ${item.userSK}. Error: ${error}`);
                    }
                }
                else {
                    console.log(`No event attributes to clear for user ${item.userSK}.`);
                }
            }
            console.log("Completed cleanup of redundant event columns.");
        };
        this.getModel = (schemaType) => {
            switch (schemaType) {
                case schemaType_1.SchemaType.EventPlayer:
                    return dynamoose.model("Events", schemas_1.EventPlayer, { create: false });
                case schemaType_1.SchemaType.EventRound:
                    return dynamoose.model("Events", schemas_1.EventRound, { create: false });
                case schemaType_1.SchemaType.EventConnection:
                    return dynamoose.model("Events", schemas_1.EventConnection, { create: false });
                case schemaType_1.SchemaType.Event:
                    return dynamoose.model("Events", schemas_1.Event, { create: false });
                case schemaType_1.SchemaType.User:
                    return dynamoose.model("Users", schemas_1.User, { create: false });
            }
        };
        this.getPastEventsForUser = async (userName) => {
            const sortKey = `user#${userName}`;
            const profile = await exports.dynamoDbRepository.getUserItem({
                primaryKey: "user",
                sortKey: sortKey,
                schemaType: schemaType_1.SchemaType.User,
            });
            if (!profile) {
                throw new Error('Profile not found');
            }
            return profile.pastEvents.length;
        };
        this.getOrganizedEventsForUser = async (userName) => {
            const sortKey = `user#${userName}`;
            const profile = await exports.dynamoDbRepository.getUserItem({
                primaryKey: "user",
                sortKey: sortKey,
                schemaType: schemaType_1.SchemaType.User,
            });
            if (!profile) {
                throw new Error('Profile not found');
            }
            return profile.organizedEvents.length;
        };
        this.getItem = async (item) => {
            const AssetModel = this.getModel(item.schemaType);
            let asset;
            try {
                asset = await (AssetModel === null || AssetModel === void 0 ? void 0 : AssetModel.get({ "eventPK": item.primaryKey, "eventSK": item.sortKey }));
                console.log(`asset: ${JSON.stringify(asset)}`);
            }
            catch (err) {
                console.log(err);
            }
            return asset;
        };
        this.getItems = async (item) => {
            const AssetModel = this.getModel(item.schemaType);
            let assets;
            try {
                assets = await (AssetModel === null || AssetModel === void 0 ? void 0 : AssetModel.query(eventsTableAttributes_1.EventsTableAttributes.primaryKey).eq(item.primaryKey).and().where(eventsTableAttributes_1.EventsTableAttributes.sortKey).beginsWith(item.sortKey).exec());
            }
            catch (err) {
                console.log(err);
            }
            return assets;
        };
        this.updateItem = async (request, item) => {
            const AssetModel = this.getModel(request.schemaType);
            try {
                await (AssetModel === null || AssetModel === void 0 ? void 0 : AssetModel.update({ "eventPK": request.primaryKey, "eventSK": request.sortKey }, item));
            }
            catch (err) {
                console.log(`Error in updateItem: ${JSON.stringify(err)}`);
            }
        };
        this.deleteItem = async (request) => {
            const AssetModel = this.getModel(request.schemaType);
            console.log(`request: ${JSON.stringify(request)}`);
            try {
                await (AssetModel === null || AssetModel === void 0 ? void 0 : AssetModel.delete({ "eventPK": request.primaryKey, "eventSK": request.sortKey }));
            }
            catch (err) {
                console.log(`Error in updateItem: ${JSON.stringify(err)}`);
            }
        };
        this.getUserItem = async (item) => {
            const AssetModel = this.getModel(item.schemaType);
            let asset;
            try {
                asset = await (AssetModel === null || AssetModel === void 0 ? void 0 : AssetModel.get({ "userPK": item.primaryKey, "userSK": item.sortKey }));
                console.log(`asset: ${JSON.stringify(asset)}`);
            }
            catch (err) {
                console.log(err);
            }
            return asset;
        };
        this.updateUserItem = async (request, item) => {
            const AssetModel = this.getModel(request.schemaType);
            try {
                await (AssetModel === null || AssetModel === void 0 ? void 0 : AssetModel.update({ "userPK": request.primaryKey, "userSK": request.sortKey }, item));
            }
            catch (err) {
                console.log(`Error in updateItem: ${JSON.stringify(err)}`);
            }
        };
        let region = config_1.config.awsRegion;
        this.ddb = new dynamoose.aws.ddb.DynamoDB({
            region: region,
        });
        console.log(`!!!!!!!!!!!!!!!!!!!!!!!!! REGION: ${region} !!!!!!!!!!!!!!!!!!!!!!!!!`);
        dynamoose.aws.ddb.set(this.ddb);
    }
}
exports.DynamoDbRepository = DynamoDbRepository;
exports.dynamoDbRepository = new DynamoDbRepository();
