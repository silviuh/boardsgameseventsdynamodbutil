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
exports.config = exports.Config = void 0;
// npm
const dotenv = __importStar(require("dotenv"));
dotenv.config();
// enums
const enums_1 = require("../enums");
class Config {
    constructor(envStore = process.env) {
        this.envStore = envStore;
        this.stage = this.envVar("STAGE", false, enums_1.Stage.Local);
        this.awsRegion = this.envVar("REGION", false, enums_1.AwsRegion.dev);
        this.authorizationArn = this.envVar("AUTHORIZATION_ARN", false);
        this.userPoolId = this.envVar("USER_POOL_ID", false);
        this.wsAuthorizer = this.envVar("WS_AUTHORIZER", false);
        this.wsEndpoint = this.envVar("WS_ENDPOINT", false);
        this.restApiId = this.envVar("REST_API_ID", false);
        this.restApiRootResourceId = this.envVar("REST_API_ROOT_RESOURCE_ID", false);
    }
    envVar(name, mandatory, defaultValue) {
        const value = this.envStore[name];
        if (typeof value === "undefined") {
            if (mandatory) {
                throw new Error(`Environment variable ${name} is required.`);
            }
            else {
                return defaultValue;
            }
        }
        return value;
    }
}
exports.Config = Config;
exports.config = new Config();
