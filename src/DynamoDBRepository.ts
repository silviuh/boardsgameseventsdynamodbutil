import * as dynamoose from "dynamoose";
import {EventsTableAttributes} from "./enums/eventsTableAttributes";
import {SchemaType} from "./enums/schemaType";
import {Event, EventConnection, EventPlayer, EventRound, User} from "./schemas";
import {config} from "./config";
import {GetItemsRequest, DeleteItemsRequest, ExtendedProfile} from "./types";
import {EventDetails, SimplifiedEvent} from "./types/event";

export class DynamoDbRepository {
    public ddb: any;

    constructor() { 
        let region = config.awsRegion;
        this.ddb = new dynamoose.aws.ddb.DynamoDB({
            region: region,
        })

        console.log(`!!!!!!!!!!!!!!!!!!!!!!!!! REGION: ${region} !!!!!!!!!!!!!!!!!!!!!!!!!`);

        dynamoose.aws.ddb.set(this.ddb);
    }

    public getUsersByEvent = async(eventCode: string): Promise<string[]> => {
        try {
            const eventModel = this.getModel(SchemaType.Event);
            if (!eventModel) {
                throw new Error("eventModel is undefined");
            }

            const results = await eventModel.query("eventPK").eq(`event#${eventCode}`).exec();
            const userEmails = results.map(event => event.userEmail); // Assuming the structure matches the provided table structure
            
            return userEmails;
        } catch (error) {
            console.error('Error fetching users by event:', error);
            throw error;
        }
    }

    public migrateUserEvents = async (): Promise<void> => {
        const UserModel = this.getModel(SchemaType.User);
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
                    } else {
                        pastEvents.push(event);
                    }
                    delete item[key];
                }
            }

            await UserModel.update({userPK: item.userPK, userSK: item.userSK}, {
                organizedEvents,
                pastEvents
            });
        }
    };

    public cleanupEventColumns = async (): Promise<void> => {
        console.log("Starting cleanup to retain only code and eventDate...");
        const UserModel = this.getModel(SchemaType.User);
        if (!UserModel) {
            throw new Error("UserModel is undefined");
        }

        const scanResults = await UserModel.scan().exec();

        for (const user of scanResults) {
            let hasChanges = false;

            const cleanEvents = (events: any[]): SimplifiedEvent[] =>
                events?.map((event: any) => ({
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
                } catch (error) {
                    console.error(`Failed to save user ${user.userSK}. Error: ${error}`);
                }
            } else {
                console.log(`No changes required for user ${user.userSK}.`);
            }
        }
        console.log("Cleanup completed to retain only code and eventDate.");
    };

    public cleanupRedundantEventColumns = async (): Promise<void> => {
        console.log("Starting cleanup of redundant event columns...");
        const UserModel = this.getModel(SchemaType.User);
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
                } catch (error) {
                    console.error(`Failed to update attributes for user ${item.userSK}. Error: ${error}`);
                }
            } else {
                console.log(`No event attributes to clear for user ${item.userSK}.`);
            }
        }
        console.log("Completed cleanup of redundant event columns.");
    };


    public getModel = (schemaType: string) => {
        switch (schemaType) {
            case SchemaType.EventPlayer:
                return dynamoose.model("Events", EventPlayer, {create: false});
            case SchemaType.EventRound:
                return dynamoose.model("Events", EventRound, {create: false});
            case SchemaType.EventConnection:
                return dynamoose.model("Events", EventConnection, {create: false});
            case SchemaType.Event:
                return dynamoose.model("Events", Event, {create: false});
            case SchemaType.User:
                return dynamoose.model("Users", User, {create: false});
        }
    }

    public getPastEventsForUser = async (userName: string): Promise<number> => {
        const sortKey = `user#${userName}`;
        const profile: ExtendedProfile = await dynamoDbRepository.getUserItem({
            primaryKey: "user",
            sortKey: sortKey,
            schemaType: SchemaType.User,
        });

        if (!profile) {
            throw new Error('Profile not found');
        }

        return profile.pastEvents.length;
    };

    public getOrganizedEventsForUser = async (userName: string): Promise<number> => {
        const sortKey = `user#${userName}`;
        const profile: ExtendedProfile = await dynamoDbRepository.getUserItem({
            primaryKey: "user",
            sortKey: sortKey,
            schemaType: SchemaType.User,
        });

        if (!profile) {
            throw new Error('Profile not found');
        }

        return profile.organizedEvents.length;
    };

    public getItem = async (item: GetItemsRequest): Promise<any> => {
        const AssetModel = this.getModel(item.schemaType);
        let asset;
        try {
            asset = await AssetModel?.get({"eventPK": item.primaryKey, "eventSK": item.sortKey});
            console.log(`asset: ${JSON.stringify(asset)}`);
        } catch (err) {
            console.log(err);
        }

        return asset;
    }

    public getItems = async (item: GetItemsRequest): Promise<any> => {
        const AssetModel = this.getModel(item.schemaType);
        let assets;
        try {
            assets = await AssetModel?.query(EventsTableAttributes.primaryKey).eq(item.primaryKey).and().where(EventsTableAttributes.sortKey).beginsWith(item.sortKey).exec();
        } catch (err) {
            console.log(err);
        }

        return assets;
    }

    public updateItem = async (request: GetItemsRequest, item: any): Promise<any> => {
        const AssetModel = this.getModel(request.schemaType);

        try {
            await AssetModel?.update({"eventPK": request.primaryKey, "eventSK": request.sortKey}, item);
        } catch (err) {
            console.log(`Error in updateItem: ${JSON.stringify(err)}`);
        }
    }

    public deleteItem = async (request: DeleteItemsRequest): Promise<any> => {
        const AssetModel = this.getModel(request.schemaType);
        console.log(`request: ${JSON.stringify(request)}`);
        try {
            await AssetModel?.delete({"eventPK": request.primaryKey, "eventSK": request.sortKey});
        } catch (err) {
            console.log(`Error in updateItem: ${JSON.stringify(err)}`);
        }
    };

    public getUserItem = async (item: GetItemsRequest): Promise<any> => {
        const AssetModel = this.getModel(item.schemaType);
        let asset;
        try {
            asset = await AssetModel?.get({"userPK": item.primaryKey, "userSK": item.sortKey});
            console.log(`asset: ${JSON.stringify(asset)}`);
        } catch (err) {
            console.log(err);
        }

        return asset;
    }

    public updateUserItem = async (request: GetItemsRequest, item: any): Promise<any> => {
        const AssetModel = this.getModel(request.schemaType);

        try {
            await AssetModel?.update({"userPK": request.primaryKey, "userSK": request.sortKey}, item);
        } catch (err) {
            console.log(`Error in updateItem: ${JSON.stringify(err)}`);
        }
    }
}

export const dynamoDbRepository = new DynamoDbRepository();